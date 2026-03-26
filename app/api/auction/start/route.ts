import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Helper to verify authorization
 */
function verifyAuth(request: NextRequest, requiredRole?: string) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (requiredRole && decoded.role !== requiredRole) return null;

    return decoded;
  } catch {
    return null;
  }
}

/**
 * POST /api/auction/start
 * Start auction (Presenter only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request, 'presenter');
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: auctionState, error: stateError } = await supabaseAdmin
      .from('auction_state')
      .select('id')
      .single();

    if (stateError || !auctionState) {
      throw stateError || new Error('Auction state not found');
    }

    const { data, error } = await supabaseAdmin
      .from('auction_state')
      .update({ auction_started: true })
      .eq('id', auctionState.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error starting auction:', error);
    return NextResponse.json(
      { message: 'Error starting auction' },
      { status: 500 }
    );
  }
}
