import { db } from '$lib/db';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  try {
    const businessId = parseInt(params.businessId);
    const chatId = parseInt(params.chatId);
    
    if (isNaN(businessId)) {
      throw error(400, 'Invalid business ID');
    }

    if (isNaN(chatId)) {
      throw error(400, 'Invalid chat ID');
    }

    const business = await db.business.findUnique({
      where: { id: businessId },
      include: {
        chats: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!business) {
      throw error(404, `Business with ID ${businessId} not found`);
    }

    // Get the specific chat with its type
    const chat = await db.chat.findUnique({
      where: { id: chatId },
      include: {
        chatType: true
      }
    });

    if (!chat) {
      throw error(404, `Chat with ID ${chatId} not found`);
    }

    // Verify chat belongs to business
    if (chat.businessId !== businessId) {
      throw error(403, 'Chat does not belong to this business');
    }

    // Get messages for this specific chat
    const messages = await db.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: {
        chat: {
          select: {
            title: true,
            type: true
          }
        }
      }
    });

    return {
      business,
      chat,
      messages,
      chats: business.chats
    };
  } catch (err) {
    console.error('Error loading chat:', err);
    // If it's already an HTTP error, rethrow it
    if (err.status) throw err;
    // Otherwise wrap it in a 500 error
    throw error(500, 'Error loading chat');
  }
}
