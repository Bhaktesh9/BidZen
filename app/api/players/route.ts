import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/players
 * Get all players (with optional batch filter)
 */
export async function GET(request: NextRequest) {
  try {
    const batch = request.nextUrl.searchParams.get('batch');

    let query = supabaseAdmin
      .from('players')
      .select('*')
      .order('batch_number', { ascending: true })
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });

    if (batch) {
      query = query.eq('batch_number', parseInt(batch));
    }

    const { data: players, error } = await query;

    if (error) throw error;

    return NextResponse.json(players, { status: 200 });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { message: 'Error fetching players' },
      { status: 500 }
    );
  }
}
