import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken(user.id);

    const response = NextResponse.json({
      user: {
        id: user.id, email: user.email, displayName: user.displayName,
        creditBalance: user.creditBalance, subscriptionTier: user.subscriptionTier,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
