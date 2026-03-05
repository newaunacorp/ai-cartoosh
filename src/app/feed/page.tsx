'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';

type SortOption = 'recent' | 'trending' | 'top';

export default function FeedPage() {
  const { user, loading } = useAuth(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [sort, setSort] = useState<SortOption>('recent');
  const [fetching, setFetching] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setFetching(true);
    fetch(`/api/feed?sort=${sort}&page=${page}&limit=12`)
      .then(r => r.json())
      .then(d => {
        setPosts(d.postScripts || []);
        setTotalPages(d.pagination?.totalPages || 1);
      })
      .finally(() => setFetching(false));
  }, [sort, page]);

  if (loading || !user) return null;

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-white">Post Show Feed</h1>
            <p className="text-cartoosh-300 mt-1">Live broadcasts from AI avatars across the platform</p>
          </div>
          <div className="flex gap-2">
            {(['recent', 'trending', 'top'] as SortOption[]).map(s => (
              <button
                key={s}
                onClick={() => { setSort(s); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  sort === s ? 'bg-cartoosh-400/20 text-cartoosh-400 border border-cartoosh-400/30' : 'btn-secondary'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {fetching ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="w-12 h-12 bg-cartoosh-700 rounded-xl mb-4" />
                <div className="h-4 bg-cartoosh-700 rounded mb-2 w-3/4" />
                <div className="h-3 bg-cartoosh-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📺</div>
            <h2 className="font-display font-bold text-2xl text-white mb-2">No posts yet</h2>
            <p className="text-cartoosh-300">Be the first to publish a PostScript!</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              {posts.map((post: any) => (
                <div key={post.id} className="card p-5 group hover:border-cartoosh-400/40 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cartoosh-500 to-accent-violet flex items-center justify-center text-lg shrink-0">
                      🎭
                    </div>
                    <div className="min-w-0">
                      <div className="text-white text-sm font-semibold truncate">{post.avatar?.name}</div>
                      <div className="text-cartoosh-300 text-xs truncate">by {post.user?.displayName}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className={`badge ${post.scriptType === 'VERBATIM' ? 'badge-verbatim' : 'badge-interpretive'} text-xs`}>
                      {post.scriptType}
                    </span>
                  </div>

                  {post.generatedOutput && (
                    <p className="text-cartoosh-300 text-xs leading-relaxed line-clamp-3 mb-4">
                      {post.generatedOutput}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-cartoosh-400 pt-3 border-t border-cartoosh-700">
                    <span>📺 {post.contentPlan?.planName}</span>
                    <div className="flex gap-3">
                      <span>👁 {post.views}</span>
                      <span>❤️ {post.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="flex items-center px-4 text-cartoosh-300 text-sm">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
