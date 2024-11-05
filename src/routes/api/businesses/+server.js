import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST({ request }) {
  try {
    const data = await request.json();
    console.log('Received business data:', data);

    // Validate required fields
    if (!data.name || !data.address || !data.type || !data.description) {
      return json({
        error: 'Missing required fields',
        received: data
      }, { status: 400 });
    }

    // Create business
    const business = await prisma.business.create({
      data: {
        name: data.name.trim(),
        address: data.address.trim(),
        type: data.type.trim(),
        description: data.description.trim()
      }
    });

    console.log('Created business:', business);
    return json(business, { status: 201 });

  } catch (error) {
    console.error('Error creating business:', error);
    return json({
      error: 'Failed to create business',
      details: error.message
    }, { status: 500 });
  }
}