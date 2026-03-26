import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/teams
 * Get all teams
 */
export async function GET() {
  try {
    const { data: teams, error } = await supabaseAdmin
      .from('teams')
      .select('*')
      .order('name');

    if (error) throw error;

    return NextResponse.json(teams, { status: 200 });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { message: 'Error fetching teams' },
      { status: 500 }
    );
  }
}
