import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Create admin user (one-time setup)
export async function POST(request) {
  try {
    const { email, password, name, setupKey } = await request.json();

    // Simple setup key verification to prevent unauthorized admin creation
    if (setupKey !== 'shopverse-setup-2026') {
      return NextResponse.json(
        { success: false, error: 'Invalid setup key' },
        { status: 403 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await sql`
      INSERT INTO admin_users (email, password, name)
      VALUES (${email}, ${hashedPassword}, ${name})
      ON CONFLICT (email) DO UPDATE SET
        password = ${hashedPassword},
        name = ${name}
    `;

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}
