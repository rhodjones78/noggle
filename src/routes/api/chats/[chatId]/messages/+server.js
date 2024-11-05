// src/routes/api/chats/[chatId]/messages/+server.js
import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { OPENAI_API_KEY, OPENAI_ORG_ID, OPENAI_PROJECT_ID } from '$env/static/private';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORG_ID,
  project: OPENAI_PROJECT_ID
});

export async function POST({ request, params }) {
  const chatId = parseInt(params.chatId);
  if (isNaN(chatId)) {
    return json({ error: 'Invalid chat ID' }, { status: 400 });
  }

  try {
    const data = await request.json();
    if (!data.content) {
      return json({ error: 'Message content is required' }, { status: 400 });
    }

    // Get chat, its type, and business information
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        chatType: true,
        business: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!chat) {
      return json({ error: 'Chat not found' }, { status: 404 });
    }

    // Create user message
    const userMessage = await prisma.message.create({
      data: {
        chatId,
        content: data.content,
        role: 'user'
      }
    });

    // Handle image generation if chat type is image (case-insensitive check)
    if (chat.chatType.responseType.toLowerCase() === 'image') {
      try {
        // Construct a richer prompt that includes business context
        const businessContext = `For ${chat.business.name}, a ${chat.business.type.toLowerCase()} business located at ${chat.business.address}. Business description: ${chat.business.description}. Request: `;
        const enhancedPrompt = `${businessContext}${data.content}`;

        const image = await openai.images.generate({ 
          model: chat.chatType.modelName,
          prompt: enhancedPrompt,
          size: "1024x1024",
          quality: "standard",
          n: 1
        });

        // Save the assistant's response with the image URL
        const assistantMessage = await prisma.message.create({
          data: {
            chatId,
            content: image.data[0].url,
            role: 'assistant'
          }
        });

        return json({ 
          message: assistantMessage,
          type: 'IMAGE'
        });

      } catch (error) {
        console.error('Image generation error:', error);
        
        // Create error message
        await prisma.message.create({
          data: {
            chatId,
            content: `Failed to generate image: ${error.message}`,
            role: 'assistant'
          }
        });

        return json({ 
          error: 'Failed to generate image',
          details: error.message 
        }, { status: 500 });
      }
    }

    // Handle regular text chat
    const messages = [
      { role: 'system', content: chat.chatType.systemPrompt },
      { 
        role: 'user', 
        content: `Business Information (Context):
Name: ${chat.business.name}
Type: ${chat.business.type}
Address: ${chat.business.address}
Description: ${chat.business.description}`
      },
      ...chat.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: data.content
      }
    ];

    // Create stream transform for text responses
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: chat.chatType.modelName,
            messages,
            stream: true,
          });

          let fullResponse = '';

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;
            
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(content));
          }

          // Save the complete message
          await prisma.message.create({
            data: {
              chatId,
              content: fullResponse,
              role: 'assistant'
            }
          });

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    // Return streaming response for text chats
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Error processing message:', error);
    return json({
      error: 'Failed to process message',
      details: error.message
    }, { status: 500 });
  }
}