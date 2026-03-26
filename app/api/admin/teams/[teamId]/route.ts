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
 * PUT /api/admin/teams/[teamId]
 * Update team (Super Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const user = verifyAuth(request, 'super_admin');
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data: team, error } = await supabaseAdmin
      .from('teams')
      .update(body)
      .eq('id', params.teamId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(team, { status: 200 });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { message: 'Error updating team' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/teams/[teamId]
 * Delete team (Super Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const user = verifyAuth(request, 'super_admin');
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: deletedRows, error } = await supabaseAdmin
      .from('teams')
      .delete()
      .eq('id', params.teamId)
      .select('id');

    if (error) throw error;

    if (!deletedRows || deletedRows.length === 0) {
      return NextResponse.json(
        { message: 'Team not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Team deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { message: 'Error deleting team' },
      { status: 500 }
    );
  }
}
