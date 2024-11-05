import { json } from '@sveltejs/kit';
import { db } from '$lib/db';

export async function GET() {
  try {
    const chatTypes = await db.chatType.findMany({
      orderBy: {
        type: 'asc'
      }
    });

    return json(chatTypes);
  } catch (error) {
    console.error('Error fetching chat types:', error);
    return json({
      error: 'Failed to fetch chat types',
      details: error.message
    }, { status: 500 });
  }
}