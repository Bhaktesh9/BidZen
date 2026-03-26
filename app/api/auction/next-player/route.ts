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
 * GET /api/auction/next-player
 * Get next player in auction
 */
export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: auctionState, error: stateError } = await supabaseAdmin
      .from('auction_state')
      .select('*')
      .single();

    if (stateError || !auctionState) throw stateError;

    const { data: players, error: playersError } = await supabaseAdmin
      .from('players')
      .select('*')
      .eq('batch_number', auctionState.current_batch)
      .neq('batch_number', 7)
      .is('team_id', null)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });

    if (playersError) throw playersError;

    let currentPlayer = players?.[0];
    let resolvedBatch = auctionState.current_batch;

    if (!currentPlayer) {
      const { data: nextBatchPlayer, error: nextBatchError } = await supabaseAdmin
        .from('players')
        .select('*')
        .neq('batch_number', 7)
        .is('team_id', null)
        .gt('batch_number', auctionState.current_batch)
        .order('batch_number', { ascending: true })
        .order('created_at', { ascending: true })
        .order('id', { ascending: true })
        .limit(1);

      if (nextBatchError) throw nextBatchError;

      currentPlayer = nextBatchPlayer?.[0];
      resolvedBatch = currentPlayer?.batch_number || resolvedBatch;
    }

    if (!currentPlayer) {
      return NextResponse.json(
        { message: 'No players available' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        player: currentPlayer,
        batchNumber: resolvedBatch,
        playerIndex: 0,
        playersInBatch: players?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching next player:', error);
    return NextResponse.json(
      { message: 'Error fetching next player' },
      { status: 500 }
    );
  }
}
