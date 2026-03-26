import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';
import { recalculateTeamPoints } from '@/lib/server/auction-admin';

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
 * PUT /api/admin/players/[playerId]
 * Update player (Super Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const user = verifyAuth(request, 'super_admin');
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const allowedFields = [
      'name',
      'role',
      'image_url',
      'base_price',
      'batch_number',
      'team_id',
      'sold_price',
    ] as const;

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if ('team_id' in updates && updates.team_id === '') {
      updates.team_id = null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    const { data: player, error } = await supabaseAdmin
      .from('players')
      .update(updates)
      .eq('id', params.playerId)
      .select()
      .single();

    if (error) throw error;

    if ('team_id' in updates || 'sold_price' in updates || 'base_price' in updates) {
      await recalculateTeamPoints();
    }

    return NextResponse.json(player, { status: 200 });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json(
      { message: 'Error updating player' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/players/[playerId]
 * Delete player (Super Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    const user = verifyAuth(request, 'super_admin');
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: existingPlayer, error: existingPlayerError } = await supabaseAdmin
      .from('players')
      .select('id, team_id')
      .eq('id', params.playerId)
      .single();

    if (existingPlayerError) throw existingPlayerError;

    const { error } = await supabaseAdmin
      .from('players')
      .delete()
      .eq('id', params.playerId);

    if (error) throw error;

    if (existingPlayer?.team_id) {
      await recalculateTeamPoints();
    }

    return NextResponse.json({ message: 'Player deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json(
      { message: 'Error deleting player' },
      { status: 500 }
    );
  }
}
