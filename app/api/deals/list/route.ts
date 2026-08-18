import { NextResponse } from 'next/server';
import { db } from '../../../../src/lib/db';
import { properties } from '../../../../src/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Fetch all properties where city is Las Vegas
    const deals = await db
      .select()
      .from(properties)
      .where(eq(properties.city, 'Las Vegas'))
      .limit(100);

    return NextResponse.json({
      success: true,
      deals: deals.map((deal) => ({
        id: String(deal.id),
        address: deal.address,
        city: deal.city,
        state: deal.state,
        price: Number(deal.price || 0),
        propertyType: deal.propertyType,
        capRate: Number(deal.currentCapRate || 0),
        noi: Number(deal.currentNoi || 0),
        squareFeet: deal.squareFeet,
        status: 'maybe' as const,
        sourceUrl: deal.sourceUrl,
      })),
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals: ' + String(error) },
      { status: 500 }
    );
  }
}
