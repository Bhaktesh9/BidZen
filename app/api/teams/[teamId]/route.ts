import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/teams/[teamId]
 * Get specific team
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { data: team, error } = await supabaseAdmin
      .from('teams')
      .select('*')
      .eq('id', params.teamId)
      .single();

    if (error || !team) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(team, { status: 200 });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { message: 'Error fetching team' },
      { status: 500 }
    );
  }
}
