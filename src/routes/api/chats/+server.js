import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST({ request }) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.businessId || !data.type || !data.title) {
      return json({
        error: 'Missing required fields',
        received: data
      }, { status: 400 });
    }

    // Create new chat with included chatType
    const chat = await prisma.chat.create({
      data: {
        businessId: data.businessId,
        type: data.type,
        title: data.title,
      },
      include: {
        chatType: true
      }
    });

    // Create messages in a transaction to ensure both are created
    await prisma.$transaction([
      // Create system message
      prisma.message.create({
        data: {
          chatId: chat.id,
          content: chat.chatType.systemPrompt,
          role: 'system'
        }
      }),
      // Create initial assistant greeting
      prisma.message.create({
        data: {
          chatId: chat.id,
          content: chat.chatType.assistantGreeting,
          role: 'assistant'
        }
      })
    ]);

    console.log('Successfully created chat:', chat);
    return json(chat, { status: 201 });

  } catch (error) {
    console.error('Error creating chat:', error);
    return json({
      error: 'Failed to create chat',
      details: error.message
    }, { status: 500 });
  }
}