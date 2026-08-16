import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../src/lib/db';
import { properties } from '../../../src/lib/schema';
import { PropertyData } from '../../../src/lib/types';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const city = searchParams.get('city');
    const state = searchParams.get('state');

    let whereClause = undefined;
    if (city || state) {
      const conditions = [];
      if (city) conditions.push(eq(properties.city, city));
      if (state) conditions.push(eq(properties.state, state));
      whereClause = and(...conditions);
    }

    const queryBuilder = db.select().from(properties);

    const result = await (whereClause
      ? queryBuilder.where(whereClause)
      : queryBuilder
    )
      .orderBy(desc(properties.compositeScore))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(
      { properties: result, total: result.length, limit, offset },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.address || !body.city || !body.state || !body.zip) {
      return NextResponse.json(
        { error: 'Missing required fields: address, city, state, zip' },
        { status: 400 }
      );
    }

    const insertData: any = {
      address: body.address,
      city: body.city,
      state: body.state,
      zip: body.zip,
    };

    if (body.lat !== undefined) insertData.lat = body.lat;
    if (body.lon !== undefined) insertData.lon = body.lon;
    if (body.price !== undefined) insertData.price = body.price;
    if (body.squareFeet !== undefined) insertData.squareFeet = body.squareFeet;
    if (body.yearBuilt !== undefined) insertData.yearBuilt = body.yearBuilt;
    if (body.propertyType) insertData.propertyType = body.propertyType;
    if (body.currentNoi !== undefined) insertData.currentNoi = body.currentNoi;
    if (body.currentCapRate !== undefined) insertData.currentCapRate = body.currentCapRate;
    if (body.askingCapRate !== undefined) insertData.askingCapRate = body.askingCapRate;
    if (body.tenantInfo) insertData.tenantInfo = body.tenantInfo;
    if (body.daysOnMarket !== undefined) insertData.daysOnMarket = body.daysOnMarket;
    if (body.listDate) insertData.listDate = new Date(body.listDate);
    if (body.source) insertData.source = body.source;
    if (body.sourceUrl) insertData.sourceUrl = body.sourceUrl;
    if (body.brokerContact) insertData.brokerContact = body.brokerContact;
    if (body.scoreDealQuality !== undefined) insertData.scoreDealQuality = body.scoreDealQuality;
    if (body.scoreMarket !== undefined) insertData.scoreMarket = body.scoreMarket;
    if (body.scoreTenanDemand !== undefined) insertData.scoreTenanDemand = body.scoreTenanDemand;
    if (body.scoreEntitlement !== undefined) insertData.scoreEntitlement = body.scoreEntitlement;
    if (body.compositeScore !== undefined) insertData.compositeScore = body.compositeScore;
    if (body.estimatedIrr !== undefined) insertData.estimatedIrr = body.estimatedIrr;
    if (body.acquisitionStrategy) insertData.acquisitionStrategy = body.acquisitionStrategy;

    const [newProperty] = await db
      .insert(properties)
      .values(insertData)
      .returning();

    return NextResponse.json(
      { property: newProperty },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
