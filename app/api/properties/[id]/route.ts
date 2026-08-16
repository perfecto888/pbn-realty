import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../src/lib/db';
import { properties } from '../../../../src/lib/schema';
import { PropertyData } from '../../../../src/lib/types';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id, 10);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      );
    }

    const result = (await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1)) as PropertyData[];

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { property: result[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id, 10);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updateData: any = {};
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.zip !== undefined) updateData.zip = body.zip;
    if (body.lat !== undefined) updateData.lat = body.lat;
    if (body.lon !== undefined) updateData.lon = body.lon;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.squareFeet !== undefined) updateData.squareFeet = body.squareFeet;
    if (body.yearBuilt !== undefined) updateData.yearBuilt = body.yearBuilt;
    if (body.propertyType !== undefined) updateData.propertyType = body.propertyType;
    if (body.currentNoi !== undefined) updateData.currentNoi = body.currentNoi;
    if (body.currentCapRate !== undefined) updateData.currentCapRate = body.currentCapRate;
    if (body.askingCapRate !== undefined) updateData.askingCapRate = body.askingCapRate;
    if (body.tenantInfo !== undefined) updateData.tenantInfo = body.tenantInfo;
    if (body.daysOnMarket !== undefined) updateData.daysOnMarket = body.daysOnMarket;
    if (body.listDate !== undefined) updateData.listDate = body.listDate;
    if (body.source !== undefined) updateData.source = body.source;
    if (body.sourceUrl !== undefined) updateData.sourceUrl = body.sourceUrl;
    if (body.brokerContact !== undefined) updateData.brokerContact = body.brokerContact;
    if (body.scoreDealQuality !== undefined) updateData.scoreDealQuality = body.scoreDealQuality;
    if (body.scoreMarket !== undefined) updateData.scoreMarket = body.scoreMarket;
    if (body.scoreTenanDemand !== undefined) updateData.scoreTenanDemand = body.scoreTenanDemand;
    if (body.scoreEntitlement !== undefined) updateData.scoreEntitlement = body.scoreEntitlement;
    if (body.compositeScore !== undefined) updateData.compositeScore = body.compositeScore;
    if (body.estimatedIrr !== undefined) updateData.estimatedIrr = body.estimatedIrr;
    if (body.acquisitionStrategy !== undefined) updateData.acquisitionStrategy = body.acquisitionStrategy;
    updateData.updatedAt = new Date();

    const [updatedProperty] = await db
      .update(properties)
      .set(updateData)
      .where(eq(properties.id, propertyId))
      .returning();

    if (!updatedProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { property: updatedProperty },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}
