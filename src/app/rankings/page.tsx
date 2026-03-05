'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';

export default function RankingsPage() {
  const { user, loading } = useAuth(true);
  const [top, setTop] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch('/api/feed?sort=top&limit=10')
      .then(r => r.json())
      .then(d => setTop(d.postScripts || []))
      .finally(() => setFetching(false));
  }, []);

  if (loading || !user) return null;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white">Rankings</h1>
          <p className="text-cartoosh-300 mt-1">Top performing avatars and PostScripts on the platform</p>
        </div>

        <div className="mb-8">
          <h2 className="font-display font-semibold text-xl text-white mb-4">🏆 Top PostScripts</h2>
          {fetching ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse h-16" />
              ))}
            </div>
          ) : top.length === 0 ? (
            <div className="card p-8 text-center text-cartoosh-300">
              No published PostScripts yet. Be the first!
            </div>
          ) : (
            <div className="space-y-3">
              {top.map((post: any, i: number) => (
                <div key={post.id} className={`card p-4 flex items-center gap-4 ${i < 3 ? 'border-cartoosh-400/30' : ''}`}>
                  <div className="text-2xl w-8 text-center shrink-0">
                    {medals[i] || <span className="text-cartoosh-400 font-bold text-sm">#{i + 1}</span>}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cartoosh-500 to-accent-violet flex items-center justify-center text-lg shrink-0">
                    🎭
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm font-semibold truncate">{post.avatar?.name}</div>
                    <div className="text-cartoosh-300 text-xs">by {post.user?.displayName} · {post.contentPlan?.planName}</div>
                  </div>
                  <div className="flex gap-4 text-sm shrink-0">
                    <div className="text-center">
                      <div className="text-white font-bold">{post.likes}</div>
                      <div className="text-cartoosh-300 text-xs">likes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold">{post.views}</div>
                      <div className="text-cartoosh-300 text-xs">views</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-display font-semibold text-white mb-4">📊 Platform Stats</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Total PostScripts', value: top.length },
              { label: 'Active Avatars', value: '—' },
              { label: 'Your Rank', value: '—' },
            ].map(stat => (
              <div key={stat.label} className="bg-cartoosh-800 rounded-xl p-4">
                <div className="font-display font-bold text-2xl text-cartoosh-400">{stat.value}</div>
                <div className="text-cartoosh-300 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
