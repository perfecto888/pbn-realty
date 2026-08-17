import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../src/lib/db';
import { recommendations, properties } from '../../../../src/lib/schema';
import { RecommendationData } from '../../../../src/lib/types';
import { eq, gte, lt, and, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Validate CRON_SECRET header for security
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || cronSecret !== expectedSecret) {
      console.error('Unauthorized cron request: Invalid or missing CRON_SECRET');
      return NextResponse.json(
        { error: 'Unauthorized - invalid cron secret' },
        { status: 401 }
      );
    }

    const timestamp = new Date().toISOString();
    console.log(`[CRON] Starting daily-scrape at ${timestamp}`);

    // Get today's date at midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Get tomorrow's date at midnight UTC for the upper bound
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    // Clear any existing recommendations for today
    console.log(`[CRON] Clearing old recommendations for ${today.toISOString()}`);
    await db
      .delete(recommendations)
      .where(
        and(
          gte(recommendations.date, today),
          lt(recommendations.date, tomorrow)
        )
      );

    // Fetch top 5 properties ordered by compositeScore descending
    console.log('[CRON] Fetching top 5 properties by compositeScore');
    const topProperties = await db
      .select()
      .from(properties)
      .orderBy(desc(properties.compositeScore))
      .limit(5);

    if (topProperties.length === 0) {
      console.warn('[CRON] No properties found in database');
      return NextResponse.json(
        {
          message: 'No properties available for recommendations',
          timestamp,
          recommendations: []
        },
        { status: 200 }
      );
    }

    // Create recommendations for today's top 5 properties
    console.log(`[CRON] Creating recommendations for ${topProperties.length} properties`);
    const recommendationEntries = topProperties.map((prop, index) => ({
      date: today,
      propertyId: prop.id,
      rank: index + 1,
      compositeScore: prop.compositeScore,
      irrEstimate: prop.estimatedIrr
    }));

    const createdRecommendations = await db
      .insert(recommendations)
      .values(recommendationEntries)
      .returning();

    console.log(`[CRON] Successfully created ${createdRecommendations.length} recommendations`);

    // Fetch the created recommendations with property data for response
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
      .where(
        and(
          gte(recommendations.date, today),
          lt(recommendations.date, tomorrow)
        )
      )
      .orderBy(asc(recommendations.rank));

    const endTimestamp = new Date().toISOString();
    console.log(`[CRON] Completed daily-scrape at ${endTimestamp}`);

    return NextResponse.json(
      {
        message: `Successfully generated ${result.length} recommendations for ${today.toISOString().split('T')[0]}`,
        timestamp: endTimestamp,
        recommendations: result
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in daily-scrape cron:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate daily recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
