import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Logout user
 */
export async function POST() {
  const response = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  );

  // Clear token on client side (handled by client code)
  return response;
}
