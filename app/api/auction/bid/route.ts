import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';
import { recalculateTeamPoints } from '@/lib/server/auction-admin';

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
 * POST /api/auction/bid
 * Submit bid and move to next player (Controller only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request, 'controller');
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { final_bid_price, winning_team_id } = await request.json();

    if (!final_bid_price || !winning_team_id) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current auction state
    const { data: auctionState, error: stateError } = await supabaseAdmin
      .from('auction_state')
      .select('*')
      .single();

    if (stateError || !auctionState) throw stateError;

    // Get current unsold player in active batch
    const { data: unsoldPlayers, error: playersError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('batch_number', auctionState.current_batch)
      .neq('batch_number', 7)
      .is('team_id', null)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });

    if (playersError) throw playersError;

    const currentPlayer = unsoldPlayers?.[0];
    if (!currentPlayer) {
      return NextResponse.json(
        { message: 'No unsold player available in current batch' },
        { status: 400 }
      );
    }

    // Update player with sold info
    const { error: updateError } = await supabaseAdmin
      .from('players')
      .update({
        team_id: winning_team_id,
        sold_price: final_bid_price,
      })
      .eq('id', currentPlayer.id);

    if (updateError) throw updateError;

    await recalculateTeamPoints();

    // Determine next state from unsold players only
    let nextBatch = auctionState.current_batch;
    let nextIndex = 0;
    let auctionStarted = auctionState.auction_started;

    const { data: remainingInCurrentBatch, error: remainingCurrentBatchError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('batch_number', auctionState.current_batch)
      .neq('batch_number', 7)
      .is('team_id', null)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .limit(1);

    if (remainingCurrentBatchError) throw remainingCurrentBatchError;

    if (!remainingInCurrentBatch || remainingInCurrentBatch.length === 0) {
      const { data: firstUnsoldInNextBatch, error: nextBatchError } = await supabaseAdmin
        .from('players')
        .select('batch_number')
        .neq('batch_number', 7)
        .is('team_id', null)
        .gt('batch_number', auctionState.current_batch)
        .order('batch_number', { ascending: true })
        .order('created_at', { ascending: true })
        .order('id', { ascending: true })
        .limit(1);

      if (nextBatchError) throw nextBatchError;

      if (firstUnsoldInNextBatch && firstUnsoldInNextBatch.length > 0) {
        nextBatch = firstUnsoldInNextBatch[0].batch_number;
        nextIndex = 0;
      } else {
        auctionStarted = false;
      }
    }

    // Update auction state
    const { data: updatedState, error: updateStateError } = await supabaseAdmin
      .from('auction_state')
      .update({
        current_batch: nextBatch,
        current_player_index: nextIndex,
        auction_started: auctionStarted,
      })
      .eq('id', auctionState.id)
      .select()
      .single();

    if (updateStateError) throw updateStateError;

    return NextResponse.json(updatedState, { status: 200 });
  } catch (error) {
    console.error('Error submitting bid:', error);
    return NextResponse.json(
      { message: 'Error submitting bid' },
      { status: 500 }
    );
  }
}
