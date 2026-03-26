import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/auction/state
 * Get current auction state
 */
export async function GET() {
  try {
    const { data: auctionState, error } = await supabaseAdmin
      .from('auction_state')
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(auctionState, { status: 200 });
  } catch (error) {
    console.error('Error fetching auction state:', error);
    return NextResponse.json(
      { message: 'Error fetching auction state' },
      { status: 500 }
    );
  }
}
