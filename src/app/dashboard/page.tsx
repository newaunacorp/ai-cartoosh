'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, loading } = useAuth(true);
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/feed?limit=3')
      .then(r => r.json())
      .then(d => setFeed(d.postScripts || []));
  }, []);

  if (loading || !user) return null;

  const tierInfo: Record<string, { color: string; label: string }> = {
    FREE: { color: 'text-cartoosh-300', label: 'Free Tier' },
    CREATOR: { color: 'text-accent-cyan', label: 'Creator' },
    PRO: { color: 'text-cartoosh-400', label: 'Pro' },
    STUDIO: { color: 'text-accent-gold', label: 'Studio' },
    ENTERPRISE: { color: 'text-accent-violet', label: 'Enterprise' },
  };
  const tier = tierInfo[user.subscriptionTier] || tierInfo.FREE;

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white">
            Hey, {user.displayName} 👋
          </h1>
          <p className="text-cartoosh-300 mt-1">
            <span className={tier.color}>{tier.label}</span> · {user.creditBalance} credits remaining
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Credits', value: user.creditBalance, icon: '⚡', color: 'text-cartoosh-400' },
            { label: 'Avatars', value: user.avatars?.length || 0, icon: '🎭', color: 'text-accent-violet' },
            { label: 'Referrals', value: user.totalReferrals, icon: '👥', color: 'text-accent-cyan' },
            { label: 'Plan', value: user.subscriptionTier, icon: '💎', color: 'text-accent-gold' },
          ].map(stat => (
            <div key={stat.label} className="card p-5">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className={`font-display font-bold text-2xl ${stat.color}`}>{stat.value}</div>
              <div className="text-cartoosh-300 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="font-display font-bold text-xl text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/studio', icon: '🎭', label: 'New Avatar', desc: 'Create a persona' },
              { href: '/terminal', icon: '🎬', label: 'New PostScript', desc: 'Generate content' },
              { href: '/feed', icon: '📺', label: 'Browse Feed', desc: 'See all shows' },
              { href: '/pricing', icon: '💎', label: 'Upgrade', desc: 'More credits & features' },
            ].map(action => (
              <Link key={action.href} href={action.href} className="card p-4 hover:border-cartoosh-400/50 transition-all group">
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="text-white text-sm font-semibold group-hover:text-cartoosh-400 transition-colors">{action.label}</div>
                <div className="text-cartoosh-300 text-xs mt-0.5">{action.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Avatars */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-white">Your Avatars</h2>
            <Link href="/studio" className="text-cartoosh-400 text-sm hover:text-white transition-colors">
              + Create New
            </Link>
          </div>
          {user.avatars?.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {user.avatars.map((a: any) => (
                <div key={a.id} className="card p-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cartoosh-500 to-accent-violet flex items-center justify-center text-xl mb-3">
                    🎭
                  </div>
                  <div className="text-white font-semibold">{a.name}</div>
                  <div className="text-cartoosh-300 text-xs mt-1 line-clamp-2">{a.personality}</div>
                  <div className="mt-3">
                    <span className="badge badge-verbatim text-xs">{a.voiceStyle}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <div className="text-4xl mb-3">🎭</div>
              <div className="text-white font-semibold mb-2">No avatars yet</div>
              <p className="text-cartoosh-300 text-sm mb-4">Create your first AI avatar to start broadcasting.</p>
              <Link href="/studio" className="btn-primary inline-block">Create Avatar</Link>
            </div>
          )}
        </div>

        {/* Recent Feed */}
        {feed.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl text-white">Recent Posts</h2>
              <Link href="/feed" className="text-cartoosh-400 text-sm hover:text-white transition-colors">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {feed.map((post: any) => (
                <div key={post.id} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cartoosh-600 flex items-center justify-center text-lg shrink-0">
                    {post.scriptType === 'VERBATIM' ? '📝' : '🎨'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm font-semibold truncate">{post.avatar?.name}</div>
                    <div className="text-cartoosh-300 text-xs truncate">{post.contentPlan?.planName}</div>
                  </div>
                  <div className="flex gap-3 text-xs text-cartoosh-300 shrink-0">
                    <span>👁 {post.views}</span>
                    <span>❤️ {post.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referral Card */}
        <div className="mt-8 card p-6 gradient-border">
          <h3 className="font-display font-bold text-lg text-white mb-2">Invite Friends, Earn Credits</h3>
          <p className="text-cartoosh-300 text-sm mb-4">
            Share your referral code and earn 25 credits for every friend who joins.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-cartoosh-800 rounded-xl px-4 py-3 font-mono text-cartoosh-400 text-sm">
              {user.referralCode}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(`https://aicartoosh.com/register?ref=${user.referralCode}`)}
              className="btn-secondary text-sm whitespace-nowrap"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
