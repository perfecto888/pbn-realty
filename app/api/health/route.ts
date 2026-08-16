import { NextResponse } from 'next/server';
import { db } from '../../../src/lib/db';

export async function GET() {
  try {
    // Attempt to query the database
    // We'll get a connection error if DB is unavailable
    const result = await db.execute('SELECT 1 as status');

    return NextResponse.json(
      {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
