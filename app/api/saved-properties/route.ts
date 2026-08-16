import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../src/lib/db';
import { savedProperties, properties } from '../../../src/lib/schema';
import { SavedPropertyData } from '../../../src/lib/types';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const result = await db
      .select({
        id: savedProperties.id,
        propertyId: savedProperties.propertyId,
        status: savedProperties.status,
        userEstimatedIrr: savedProperties.userEstimatedIrr,
        notes: savedProperties.notes,
        createdAt: savedProperties.createdAt,
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
      .from(savedProperties)
      .leftJoin(properties, eq(savedProperties.propertyId, properties.id));

    return NextResponse.json(
      { savedProperties: result },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching saved properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.propertyId || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: propertyId, status' },
        { status: 400 }
      );
    }

    const validStatuses = ['prospect', 'reviewing', 'offer', 'contract', 'closed', 'pass'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const [newSavedProperty] = await db
      .insert(savedProperties)
      .values({
        propertyId: body.propertyId,
        status: body.status,
        userEstimatedIrr: body.userEstimatedIrr || null,
        notes: body.notes || null,
      })
      .returning();

    return NextResponse.json(
      { savedProperty: newSavedProperty },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating saved property:', error);
    return NextResponse.json(
      { error: 'Failed to create saved property' },
      { status: 500 }
    );
  }
}
