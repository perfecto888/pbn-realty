import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { db } from '../../../../src/lib/db';
import { properties } from '../../../../src/lib/schema';

interface DealRow {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  price?: number;
  propertyType?: string;
  squareFeet?: number;
  yearBuilt?: number;
  currentNoi?: number;
  currentCapRate?: number;
  source?: string;
  sourceUrl?: string;
}

const REQUIRED_FIELDS = ['address', 'city', 'state', 'price'];

function validateDealRow(row: DealRow): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  REQUIRED_FIELDS.forEach((field) => {
    if (!row[field as keyof DealRow]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate numeric fields
  if (row.price && isNaN(Number(row.price))) {
    errors.push('Price must be a valid number');
  }
  if (row.currentCapRate && isNaN(Number(row.currentCapRate))) {
    errors.push('Cap Rate must be a valid number');
  }
  if (row.squareFeet && isNaN(Number(row.squareFeet))) {
    errors.push('Square Feet must be a valid number');
  }

  // Validate city is Las Vegas
  if (row.city && row.city.toLowerCase() !== 'las vegas') {
    errors.push('Only Las Vegas properties are supported');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be Excel (.xlsx, .xls) or CSV format' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    if (!worksheet) {
      return NextResponse.json(
        { error: 'No data found in Excel file' },
        { status: 400 }
      );
    }

    const rows = XLSX.utils.sheet_to_json<DealRow>(worksheet);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No rows found in Excel file' },
        { status: 400 }
      );
    }

    const validDeals: DealRow[] = [];
    const errors: { row: number; errors: string[] }[] = [];

    // Validate all rows
    rows.forEach((row, index) => {
      const validation = validateDealRow(row);
      if (validation.valid) {
        validDeals.push(row);
      } else {
        errors.push({
          row: index + 2, // +2 because Excel is 1-indexed and has header
          errors: validation.errors,
        });
      }
    });

    if (validDeals.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid deals found in file',
          validationErrors: errors,
        },
        { status: 400 }
      );
    }

    // Insert valid deals into database
    const insertedDeals = [];
    for (const deal of validDeals) {
      try {
        const result = await db.insert(properties).values({
          address: deal.address || '',
          city: deal.city || 'Las Vegas',
          state: deal.state || 'NV',
          zip: deal.zip || '',
          price: deal.price ? parseFloat(String(deal.price)) : 0,
          propertyType: deal.propertyType,
          squareFeet: deal.squareFeet ? parseInt(String(deal.squareFeet), 10) : undefined,
          yearBuilt: deal.yearBuilt ? parseInt(String(deal.yearBuilt), 10) : undefined,
          currentNoi: deal.currentNoi ? parseFloat(String(deal.currentNoi)) : undefined,
          currentCapRate: deal.currentCapRate ? parseFloat(String(deal.currentCapRate)) : undefined,
          source: deal.source || 'Manual Upload',
          sourceUrl: deal.sourceUrl,
        }).returning();

        insertedDeals.push(result);
      } catch (err) {
        console.error('Error inserting deal:', err);
        errors.push({
          row: validDeals.indexOf(deal) + 2,
          errors: ['Failed to insert deal into database'],
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully uploaded ${insertedDeals.length} deals`,
        dealsInserted: insertedDeals.length,
        validationWarnings: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload: ' + String(error) },
      { status: 500 }
    );
  }
}
