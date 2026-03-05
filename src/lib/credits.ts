import prisma from './prisma';
import { SubscriptionTier } from '@prisma/client';

// Credit costs per action
export const CREDIT_COSTS = {
  TEXT_VERBATIM: 2,
  TEXT_INTERPRETIVE: 5,
  AVATAR_IMAGE: 10,
  VOICE_PER_MINUTE: 8,
  VIDEO_CARTOON_PER_MIN: 15,
  VIDEO_STANDARD_PER_MIN: 30,
  VIDEO_REALISTIC_PER_MIN: 75,
  VIDEO_ULTRA_PER_MIN: 150,
  HD_EXPORT: 12,
  EXPRESS_RENDER: 15,
};

// Monthly credit allowances per tier
export const TIER_CREDITS: Record<SubscriptionTier, number> = {
  FREE: 15,
  CREATOR: 250,
  PRO: 750,
  STUDIO: 2500,
  ENTERPRISE: 5000,
};

// Tier pricing
export const TIER_PRICING: Record<SubscriptionTier, number> = {
  FREE: 0,
  CREATOR: 9.99,
  PRO: 24.99,
  STUDIO: 59.99,
  ENTERPRISE: 149.99,
};

// Credit pack options
export const CREDIT_PACKS = [
  { credits: 50, price: 4.99, label: 'Starter' },
  { credits: 150, price: 9.99, label: 'Popular' },
  { credits: 400, price: 19.99, label: 'Best Value' },
  { credits: 1000, price: 39.99, label: 'Power' },
  { credits: 3000, price: 99.99, label: 'Studio' },
];

// Tier feature gates
export const TIER_FEATURES: Record<SubscriptionTier, {
  maxVideoClips: number;
  avatarTypes: string[];
  interpretiveMode: boolean;
  loopMode: boolean | number;
  voiceCount: number;
  resolution: string;
  watermark: boolean;
  maxPostShows: number;
  storageMb: number;
  creatorPayoutRate: number;
}> = {
  FREE: {
    maxVideoClips: 1,
    avatarTypes: ['PRESET'],
    interpretiveMode: false,
    loopMode: false,
    voiceCount: 1,
    resolution: '480p',
    watermark: true,
    maxPostShows: 1,
    storageMb: 500,
    creatorPayoutRate: 0,
  },
  CREATOR: {
    maxVideoClips: 10,
    avatarTypes: ['PRESET', 'CARTOON', 'UPLOAD'],
    interpretiveMode: true,
    loopMode: 3,
    voiceCount: 5,
    resolution: '720p',
    watermark: false,
    maxPostShows: 3,
    storageMb: 5000,
    creatorPayoutRate: 0.70,
  },
  PRO: {
    maxVideoClips: 30,
    avatarTypes: ['PRESET', 'CARTOON', 'UPLOAD', 'REALISTIC'],
    interpretiveMode: true,
    loopMode: 10,
    voiceCount: 15,
    resolution: '1080p',
    watermark: false,
    maxPostShows: 10,
    storageMb: 25000,
    creatorPayoutRate: 0.75,
  },
  STUDIO: {
    maxVideoClips: -1, // unlimited
    avatarTypes: ['PRESET', 'CARTOON', 'UPLOAD', 'REALISTIC', 'ULTRA_REALISTIC'],
    interpretiveMode: true,
    loopMode: -1, // unlimited
    voiceCount: -1, // all
    resolution: '4K',
    watermark: false,
    maxPostShows: -1,
    storageMb: 100000,
    creatorPayoutRate: 0.80,
  },
  ENTERPRISE: {
    maxVideoClips: -1,
    avatarTypes: ['PRESET', 'CARTOON', 'UPLOAD', 'REALISTIC', 'ULTRA_REALISTIC'],
    interpretiveMode: true,
    loopMode: -1,
    voiceCount: -1,
    resolution: '4K',
    watermark: false,
    maxPostShows: -1,
    storageMb: -1,
    creatorPayoutRate: 0.85,
  },
};

export async function checkCredits(userId: string, needed: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  if (user.creditBalance < needed) {
    return {
      sufficient: false,
      balance: user.creditBalance,
      needed,
      tier: user.subscriptionTier,
    };
  }

  return { sufficient: true, balance: user.creditBalance, needed, tier: user.subscriptionTier };
}

export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  relatedPostScriptId?: string
) {
  const check = await checkCredits(userId, amount);
  if (!check.sufficient) {
    throw new Error('INSUFFICIENT_CREDITS');
  }

  const [user, transaction] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        creditBalance: { decrement: amount },
        monthlyCreditsUsed: { increment: amount },
      },
    }),
    prisma.creditTransaction.create({
      data: {
        userId,
        type: 'SPEND',
        credits: -amount,
        description,
        relatedPostScriptId,
      },
    }),
  ]);

  return { newBalance: user.creditBalance, transaction };
}

export async function addCredits(
  userId: string,
  amount: number,
  type: 'PURCHASE' | 'SUBSCRIPTION_GRANT' | 'REFUND' | 'REFERRAL_BONUS' | 'CREATOR_EARNING',
  description: string,
  dollarAmount?: number,
  stripePaymentId?: string
) {
  const [user, transaction] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { creditBalance: { increment: amount } },
    }),
    prisma.creditTransaction.create({
      data: {
        userId,
        type,
        credits: amount,
        dollarAmount,
        description,
        stripePaymentId,
      },
    }),
  ]);

  return { newBalance: user.creditBalance, transaction };
}

export function estimateVideoCreditCost(
  avatarType: string,
  durationSeconds: number,
  hdExport: boolean = false,
  expressRender: boolean = false
): number {
  const minutes = Math.ceil(durationSeconds / 60);
  let baseCost = 0;

  switch (avatarType) {
    case 'CARTOON': baseCost = CREDIT_COSTS.VIDEO_CARTOON_PER_MIN * minutes; break;
    case 'STANDARD': baseCost = CREDIT_COSTS.VIDEO_STANDARD_PER_MIN * minutes; break;
    case 'REALISTIC': baseCost = CREDIT_COSTS.VIDEO_REALISTIC_PER_MIN * minutes; break;
    case 'ULTRA_REALISTIC': baseCost = CREDIT_COSTS.VIDEO_ULTRA_PER_MIN * minutes; break;
    default: baseCost = CREDIT_COSTS.VIDEO_STANDARD_PER_MIN * minutes;
  }

  if (hdExport) baseCost += CREDIT_COSTS.HD_EXPORT;
  if (expressRender) baseCost += CREDIT_COSTS.EXPRESS_RENDER;

  return baseCost;
}
