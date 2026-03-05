import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { displayName, bio } = await req.json();

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(displayName ? { displayName } : {}),
      ...(bio !== undefined ? { bio } : {}),
    },
  });

  return NextResponse.json({
    user: {
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      bio: updated.bio,
      subscriptionTier: updated.subscriptionTier,
      creditBalance: updated.creditBalance,
      referralCode: updated.referralCode,
      totalReferrals: updated.totalReferrals,
      hasCompletedOnboarding: updated.hasCompletedOnboarding,
    },
  });
}
