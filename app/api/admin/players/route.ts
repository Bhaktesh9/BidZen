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
 * GET /api/admin/players
 * List all players (Super Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request, 'super_admin');
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: players, error } = await supabaseAdmin
      .from('players')
      .select('*')
      .order('batch_number', { ascending: true })
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });

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

/**
 * POST /api/admin/players
 * Create new player (Super Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request, 'super_admin');
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, role, base_price, batch_number, image_url } = await request.json();

    if (!name || !role || base_price === undefined || batch_number === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: player, error } = await supabaseAdmin
      .from('players')
      .insert({
        name,
        role,
        base_price,
        batch_number,
        image_url: image_url || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { message: 'Error creating player' },
      { status: 500 }
    );
  }
}
