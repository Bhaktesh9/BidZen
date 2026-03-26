import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Helper to verify authorization
 */
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
 * GET /api/admin/teams
 * List all teams (Super Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request, 'super_admin');
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

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

/**
 * POST /api/admin/teams
 * Create new team (Super Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request, 'super_admin');
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: 'Team name is required' },
        { status: 400 }
      );
    }

    const { data: team, error } = await supabaseAdmin
      .from('teams')
      .insert({ name, points: 10000 })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { message: 'Error creating team' },
      { status: 500 }
    );
  }
}
