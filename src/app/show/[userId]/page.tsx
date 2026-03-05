'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ShowPage({ params }: { params: { userId: string } }) {
  const [data, setData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${params.userId}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/feed?userId=${params.userId}&limit=20`).then(r => r.json()),
    ]).then(([user, feed]) => {
      setData(user);
      setPosts(feed.postScripts || []);
    }).finally(() => setLoading(false));
  }, [params.userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cartoosh-900 flex items-center justify-center">
        <div className="text-cartoosh-400 font-display text-xl animate-pulse">Loading Show...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cartoosh-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-cartoosh-700/30 to-transparent" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-cartoosh-700">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cartoosh-400 to-accent-violet flex items-center justify-center">
            <span className="text-white font-bold text-sm">AC</span>
          </div>
          <span className="font-display font-bold text-white">AI Cartoosh</span>
        </Link>
        <Link href="/register" className="btn-primary text-sm">Join Free</Link>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Host Info */}
        {data ? (
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cartoosh-500 to-accent-violet mx-auto flex items-center justify-center text-3xl mb-4">
              🎭
            </div>
            <h1 className="font-display font-bold text-3xl text-white mb-2">{data.user?.displayName || 'Creator'}</h1>
            {data.user?.bio && <p className="text-cartoosh-300 max-w-lg mx-auto">{data.user.bio}</p>}
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-cartoosh-300">
              <span>📺 {posts.length} Episodes</span>
            </div>
          </div>
        ) : (
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">📺</div>
            <h1 className="font-display font-bold text-3xl text-white">Post Show</h1>
          </div>
        )}

        {/* Episodes */}
        {posts.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h2 className="font-display font-bold text-xl text-white mb-2">No Episodes Yet</h2>
            <p className="text-cartoosh-300">This show hasn&apos;t published any content yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-xl text-white mb-4">Episodes</h2>
            {posts.map((post: any) => (
              <div key={post.id} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cartoosh-500 to-accent-violet flex items-center justify-center text-xl shrink-0">
                    🎭
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">{post.avatar?.name}</span>
                      <span className={`badge ${post.scriptType === 'VERBATIM' ? 'badge-verbatim' : 'badge-interpretive'} text-xs`}>
                        {post.scriptType}
                      </span>
                    </div>
                    <p className="text-cartoosh-300 text-sm leading-relaxed line-clamp-3">
                      {post.generatedOutput}
                    </p>
                    <div className="flex gap-4 mt-3 text-xs text-cartoosh-400">
                      <span>👁 {post.views} views</span>
                      <span>❤️ {post.likes} likes</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-cartoosh-300 mb-4">Create your own AI avatar show</p>
          <Link href="/register" className="btn-primary inline-block">Start Free on AI Cartoosh</Link>
        </div>
      </div>
    </div>
  );
}
