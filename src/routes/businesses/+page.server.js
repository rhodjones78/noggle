import { db } from '$lib/db';

export async function load() {
  try {
    const businesses = await db.business.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return {
      businesses
    };
  } catch (error) {
    console.error('Error loading businesses:', error);
    return {
      businesses: []
    };
  }
}