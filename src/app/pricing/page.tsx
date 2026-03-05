'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';

const PLANS = [
  {
    name: 'Free',
    tier: 'FREE',
    price: '$0',
    period: 'forever',
    credits: 15,
    priceId: null,
    mode: 'subscription',
    features: ['15 starter credits', '1 avatar', 'Text PostScripts only', 'Community feed access'],
    badge: 'badge-free',
    cta: 'Current Plan',
  },
  {
    name: 'Creator',
    tier: 'CREATOR',
    price: '$9.99',
    period: '/mo',
    credits: 100,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR,
    mode: 'subscription',
    features: ['100 credits/month', '3 avatars', 'Text + Audio PostScripts', 'Loop mode (3 iterations)', 'No watermark'],
    badge: 'badge-creator',
    cta: 'Upgrade to Creator',
    popular: false,
  },
  {
    name: 'Pro',
    tier: 'PRO',
    price: '$29.99',
    period: '/mo',
    credits: 350,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    mode: 'subscription',
    features: ['350 credits/month', '10 avatars', 'Text + Audio + Video (D-ID)', 'Loop mode (10 iterations)', 'AAF Marketplace access', 'Analytics'],
    badge: 'badge-pro',
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Studio',
    tier: 'STUDIO',
    price: '$79.99',
    period: '/mo',
    credits: 1000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO,
    mode: 'subscription',
    features: ['1,000 credits/month', 'Unlimited avatars', 'HeyGen ultra-realistic video', 'Unlimited loops', 'Creator monetization', 'Priority support'],
    badge: 'badge-studio',
    cta: 'Upgrade to Studio',
    popular: false,
  },
];

const CREDIT_PACKS = [
  { label: '50 Credits', credits: 50, price: '$4.99', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_50 },
  { label: '150 Credits', credits: 150, price: '$12.99', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_150 },
  { label: '400 Credits', credits: 400, price: '$29.99', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_400 },
  { label: '1,000 Credits', credits: 1000, price: '$59.99', priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_1000 },
];

export default function PricingPage() {
  const { user, loading } = useAuth(true);
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  async function checkout(priceId: string | undefined, mode: string) {
    if (!priceId) {
      alert('This plan is not yet configured. Please contact support.');
      return;
    }
    setCheckoutLoading(priceId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, mode }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setCheckoutLoading(null);
    }
  }

  if (loading || !user) return null;

  return (
    <AppLayout>
      <div className="p-8">
        <div className="text-center mb-12">
          <h1 className="font-display font-bold text-3xl text-white mb-3">Plans & Credits</h1>
          <p className="text-cartoosh-300">
            You&apos;re on <span className="text-cartoosh-400 font-semibold">{user.subscriptionTier}</span> with{' '}
            <span className="text-cartoosh-400 font-semibold">{user.creditBalance} credits</span> remaining.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {PLANS.map(plan => {
            const isCurrent = user.subscriptionTier === plan.tier;
            return (
              <div key={plan.name} className={`card p-6 relative flex flex-col ${plan.popular ? 'border-cartoosh-400/50 glow-purple' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge badge-pro text-xs px-3">Most Popular</span>
                  </div>
                )}
                <div className="mb-4">
                  <span className={`badge ${plan.badge} text-xs mb-3`}>{plan.name}</span>
                  <div className="font-display font-bold text-3xl text-white mt-2">
                    {plan.price}
                    <span className="text-cartoosh-300 text-base font-normal">{plan.period}</span>
                  </div>
                  <div className="text-cartoosh-400 text-sm mt-1">⚡ {plan.credits} credits{plan.tier !== 'FREE' ? '/mo' : ''}</div>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-cartoosh-300 text-sm">
                      <span className="text-accent-cyan mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="w-full text-center py-3 rounded-xl border border-cartoosh-600 text-cartoosh-300 text-sm">
                    Current Plan
                  </div>
                ) : plan.priceId === null ? null : (
                  <button
                    onClick={() => checkout(plan.priceId, plan.mode)}
                    disabled={!!checkoutLoading}
                    className="btn-primary w-full text-sm disabled:opacity-60"
                  >
                    {checkoutLoading === plan.priceId ? 'Loading...' : plan.cta}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Credit Packs */}
        <div>
          <h2 className="font-display font-bold text-xl text-white mb-2">Buy Credits</h2>
          <p className="text-cartoosh-300 text-sm mb-6">One-time purchases — credits never expire.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CREDIT_PACKS.map(pack => (
              <div key={pack.label} className="card p-5">
                <div className="text-accent-gold font-bold text-lg mb-1">{pack.label}</div>
                <div className="text-white font-display font-bold text-2xl mb-4">{pack.price}</div>
                <button
                  onClick={() => checkout(pack.priceId, 'payment')}
                  disabled={!!checkoutLoading}
                  className="btn-secondary w-full text-sm disabled:opacity-60"
                >
                  {checkoutLoading === pack.priceId ? 'Loading...' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Costs Reference */}
        <div className="mt-12 card p-6">
          <h3 className="font-display font-semibold text-white mb-4">Credit Costs Reference</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { action: 'Verbatim PostScript', cost: '1 credit' },
              { action: 'Interpretive PostScript', cost: '2 credits' },
              { action: 'AI Avatar Image', cost: '3 credits' },
              { action: 'Voice Audio', cost: '2 credits' },
              { action: 'D-ID Video (SD)', cost: '5 credits' },
              { action: 'D-ID Video (HD)', cost: '10 credits' },
              { action: 'HeyGen Ultra Video', cost: '20 credits' },
              { action: 'Loop iteration', cost: '+1 credit ea' },
            ].map(item => (
              <div key={item.action} className="flex flex-col gap-1">
                <span className="text-cartoosh-300">{item.action}</span>
                <span className="text-cartoosh-400 font-semibold">{item.cost}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
