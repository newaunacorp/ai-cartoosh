import Stripe from 'stripe';
import prisma from './prisma';
import { addCredits, TIER_CREDITS } from './credits';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any,
});

export { stripe };

// Map Stripe price IDs to credit amounts
const CREDIT_PACK_MAP: Record<string, number> = {
  [process.env.STRIPE_PRICE_CREDITS_50 || '']: 50,
  [process.env.STRIPE_PRICE_CREDITS_150 || '']: 150,
  [process.env.STRIPE_PRICE_CREDITS_400 || '']: 400,
  [process.env.STRIPE_PRICE_CREDITS_1000 || '']: 1000,
  [process.env.STRIPE_PRICE_CREDITS_3000 || '']: 3000,
};

// Map Stripe price IDs to subscription tiers
const TIER_MAP: Record<string, 'CREATOR' | 'PRO' | 'STUDIO' | 'ENTERPRISE'> = {
  [process.env.STRIPE_PRICE_CREATOR || '']: 'CREATOR',
  [process.env.STRIPE_PRICE_PRO || '']: 'PRO',
  [process.env.STRIPE_PRICE_STUDIO || '']: 'STUDIO',
  [process.env.STRIPE_PRICE_ENTERPRISE || '']: 'ENTERPRISE',
};

export async function createCheckoutSession(params: {
  userId: string;
  email: string;
  priceId: string;
  mode: 'subscription' | 'payment';
}) {
  const { userId, email, priceId, mode } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Get or create Stripe customer
  let user = await prisma.user.findUnique({ where: { id: userId } });
  let customerId = user?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({ email, metadata: { userId } });
    customerId = customer.id;
    await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?payment=success`,
    cancel_url: `${appUrl}/pricing?payment=cancelled`,
    metadata: { userId },
  });

  return session;
}

export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
  if (!user) return;

  const priceId = subscription.items.data[0]?.price.id || '';
  const tier = TIER_MAP[priceId] || 'CREATOR';
  const credits = TIER_CREDITS[tier];

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: tier,
        creditBalance: credits,
        monthlyCreditsUsed: 0,
        monthlyCreditsResetAt: new Date(subscription.current_period_end * 1000),
      },
    }),
    prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        planTier: tier,
        status: 'ACTIVE',
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        monthlyCreditsAllowance: credits,
      },
      update: {
        planTier: tier,
        status: 'ACTIVE',
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        monthlyCreditsAllowance: credits,
      },
    }),
  ]);

  await addCredits(user.id, credits, 'SUBSCRIPTION_GRANT', `${tier} plan monthly credits`);
}

export async function handlePaymentSucceeded(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  // Check if this is a credit pack purchase
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  const priceId = lineItems.data[0]?.price?.id || '';
  const creditsAmount = CREDIT_PACK_MAP[priceId];

  if (creditsAmount) {
    await addCredits(
      userId,
      creditsAmount,
      'PURCHASE',
      `Purchased ${creditsAmount} credits`,
      (session.amount_total || 0) / 100,
      session.payment_intent as string
    );
  }
}
