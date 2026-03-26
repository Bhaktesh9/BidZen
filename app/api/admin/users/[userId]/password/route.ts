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
 * PUT /api/admin/users/[userId]/password
 * Reset user password (Super Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = verifyAuth(request, 'super_admin');
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { message: 'Password is required' },
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

    const hashedPassword = await hashPassword(password);

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', params.userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { message: 'Error updating password' },
      { status: 500 }
    );
  }
}
