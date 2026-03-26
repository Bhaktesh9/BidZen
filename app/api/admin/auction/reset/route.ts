import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';
import { TEAM_INITIAL_POINTS } from '@/lib/server/auction-admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyAuth(request: NextRequest, requiredRole: string) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== requiredRole) return null;

    return decoded;
  } catch {
    return null;
  }
}

/**
 * POST /api/admin/auction/reset
 * Fully reset auction state (Super Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request, 'super_admin');
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { error: playersResetError } = await supabaseAdmin
      .from('players')
      .update({ team_id: null, sold_price: null })
      .not('id', 'is', null);

    if (playersResetError) throw playersResetError;

    const { error: teamsResetError } = await supabaseAdmin
      .from('teams')
      .update({ points: TEAM_INITIAL_POINTS })
      .not('id', 'is', null);

    if (teamsResetError) throw teamsResetError;

    const { data: auctionState, error: auctionStateError } = await supabaseAdmin
      .from('auction_state')
      .select('id')
      .single();

    if (auctionStateError || !auctionState) {
      throw auctionStateError || new Error('Auction state not found');
    }

    const { error: stateResetError } = await supabaseAdmin
      .from('auction_state')
      .update({
        current_batch: 1,
        current_player_index: 0,
        auction_started: false,
      })
      .eq('id', auctionState.id);

    if (stateResetError) throw stateResetError;

    return NextResponse.json(
      { message: 'Auction reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resetting auction:', error);
    return NextResponse.json(
      { message: 'Error resetting auction' },
      { status: 500 }
    );
  }
}
