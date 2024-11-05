// src/routes/businesses/[id]/+page.server.js
import { db } from '$lib/db';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  try {
    const businessId = parseInt(params.id);
    
    if (isNaN(businessId)) {
      throw error(400, 'Invalid business ID');
    }

    // Get business
    const business = await db.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      throw error(404, 'Business not found');
    }

    // Get chat types (with error handling)
    let chatTypes = [];
    try {
      chatTypes = await db.chatType.findMany();
    } catch (err) {
      console.error('Error fetching chat types:', err);
      // Don't throw error, just continue with empty chat types
    }

    // Get recent chats
    let recentChats = [];
    try {
      recentChats = await db.chat.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          chatType: true
        }
      });
    } catch (err) {
      console.error('Error fetching recent chats:', err);
      // Don't throw error, just continue with empty recent chats
    }

    return {
      business,
      chatTypes,
      recentChats
    };
  } catch (err) {
    console.error('Error loading business:', err);
    throw error(500, 'Error loading business');
  }
}