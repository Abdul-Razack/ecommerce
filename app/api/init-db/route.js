import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { initializeDatabase } from '@/lib/db';

// Initialize database tables
export async function POST() {
  try {
    await initializeDatabase();
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
    });
  } catch (error) {
    console.error('DB init error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  try {
    const result = await sql`SELECT NOW() as time`;
    return NextResponse.json({
      success: true,
      message: 'Database connected',
      time: result[0].time,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 500 }
    );
  }
}
