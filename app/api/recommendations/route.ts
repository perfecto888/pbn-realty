import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../src/lib/db';
import { recommendations, properties } from '../../../src/lib/schema';
import { RecommendationData } from '../../../src/lib/types';
import { eq, gte, lt, asc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get tomorrow for the upper bound
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await db
      .select({
        id: recommendations.id,
        date: recommendations.date,
        rank: recommendations.rank,
        compositeScore: recommendations.compositeScore,
        irrEstimate: recommendations.irrEstimate,
        property: {
          id: properties.id,
          address: properties.address,
          city: properties.city,
          state: properties.state,
          zip: properties.zip,
          price: properties.price,
          squareFeet: properties.squareFeet,
          propertyType: properties.propertyType,
          currentNoi: properties.currentNoi,
          currentCapRate: properties.currentCapRate,
          compositeScore: properties.compositeScore,
          estimatedIrr: properties.estimatedIrr,
          acquisitionStrategy: properties.acquisitionStrategy,
          createdAt: properties.createdAt,
        },
      })
      .from(recommendations)
      .leftJoin(properties, eq(recommendations.propertyId, properties.id))
      .where(and(
        gte(recommendations.date, today),
        lt(recommendations.date, tomorrow)
      ))
      .orderBy(asc(recommendations.rank))
      .limit(5);

    return NextResponse.json(
      { recommendations: result },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
