import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword, validatePassword } from '@/lib/auth';

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
 * GET /api/admin/users
 * List all users (Super Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request, 'super_admin');
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, username, role, team_id, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Error fetching users' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Create new user (Super Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request, 'super_admin');
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { username, password, role, team_id } = await request.json();
    const normalizedUsername = typeof username === 'string' ? username.trim() : '';

    if (!normalizedUsername || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate password
    const validation = validatePassword(password);
    if (!validation.valid) {
      return NextResponse.json(
        { message: 'Password does not meet requirements', errors: validation.errors },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .ilike('username', normalizedUsername)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: `Username "${normalizedUsername}" already exists` },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        username: normalizedUsername,
        password: hashedPassword,
        role,
        team_id: team_id || null,
      })
      .select()
      .single();

    if (error) {
      if ('code' in error && error.code === '23505') {
        return NextResponse.json(
          { message: `Username "${normalizedUsername}" already exists` },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        team_id: newUser.team_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Error creating user' },
      { status: 500 }
    );
  }
}
