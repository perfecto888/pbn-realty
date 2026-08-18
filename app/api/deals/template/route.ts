import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // Create a workbook with template data
    const ws_data = [
      [
        'address',
        'city',
        'state',
        'zip',
        'price',
        'propertyType',
        'squareFeet',
        'yearBuilt',
        'currentNoi',
        'currentCapRate',
        'sourceUrl'
      ],
      [
        '123 Main Street',
        'Las Vegas',
        'NV',
        '89101',
        '5000000',
        'Office',
        '50000',
        '2015',
        '350000',
        '7.0',
        'https://example.com/property/123-main'
      ],
      [
        '456 Commerce Drive',
        'Las Vegas',
        'NV',
        '89104',
        '3500000',
        'Retail',
        '35000',
        '2010',
        '245000',
        '7.0',
        'https://example.com/property/456-commerce'
      ],
      [
        '789 Industrial Road',
        'Las Vegas',
        'NV',
        '89108',
        '6200000',
        'Industrial',
        '60000',
        '2005',
        '450000',
        '7.2',
        'https://example.com/property/789-industrial'
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Deals Template');

    // Set column widths
    ws['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 8 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 35 }
    ];

    // Generate binary string
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Create response with proper headers
    return new NextResponse(Buffer.from(wbout), {
      headers: {
        'Content-Disposition': 'attachment; filename="las-vegas-deals-template.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template: ' + String(error) },
      { status: 500 }
    );
  }
}
