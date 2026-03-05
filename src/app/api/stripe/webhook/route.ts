import { NextRequest, NextResponse } from 'next/server';
import { stripe, handleSubscriptionCreated, handlePaymentSucceeded } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature') || '';

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionCreated(event.data.object as any);
        break;

      case 'checkout.session.completed':
        const session = event.data.object as any;
        if (session.mode === 'payment') {
          await handlePaymentSucceeded(session);
        }
        break;

      case 'customer.subscription.deleted':
        // Handle cancellation - downgrade to free tier
        const sub = event.data.object as any;
        const customerId = sub.customer;
        const { default: prisma } = await import('@/lib/prisma');
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { subscriptionTier: 'FREE', creditBalance: 15 },
          });
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
