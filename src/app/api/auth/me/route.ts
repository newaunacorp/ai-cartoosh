import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  return NextResponse.json({
    user: {
      id: user.id, email: user.email, displayName: user.displayName,
      bio: user.bio, profileImage: user.profileImage,
      subscriptionTier: user.subscriptionTier, creditBalance: user.creditBalance,
      referralCode: user.referralCode, totalReferrals: user.totalReferrals,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      avatars: user.avatars,
    },
  });
}
