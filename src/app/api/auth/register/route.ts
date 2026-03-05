import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken, generateReferralCode } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName, referralCode } = await req.json();

    if (!email || !password || !displayName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newReferralCode = generateReferralCode();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        referralCode: newReferralCode,
        referredBy: referralCode || null,
        creditBalance: 15, // Free tier starting credits
      },
    });

    // Handle referral bonus
    if (referralCode) {
      const referrer = await prisma.user.findFirst({ where: { referralCode } });
      if (referrer) {
        await prisma.$transaction([
          prisma.user.update({ where: { id: referrer.id }, data: { creditBalance: { increment: 25 }, totalReferrals: { increment: 1 } } }),
          prisma.user.update({ where: { id: user.id }, data: { creditBalance: { increment: 10 } } }),
          prisma.creditTransaction.create({ data: { userId: referrer.id, type: 'REFERRAL_BONUS', credits: 25, description: `Referral bonus: ${displayName} signed up` } }),
          prisma.creditTransaction.create({ data: { userId: user.id, type: 'REFERRAL_BONUS', credits: 10, description: 'Welcome bonus from referral' } }),
          prisma.referral.create({ data: { referrerId: referrer.id, referredId: user.id } }),
        ]);
      }
    }

    const token = generateToken(user.id);

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, displayName: user.displayName, creditBalance: user.creditBalance },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
