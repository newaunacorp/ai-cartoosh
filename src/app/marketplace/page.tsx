'use client';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';

export default function MarketplacePage() {
  const { user, loading } = useAuth(true);
  if (loading || !user) return null;

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white">AAF Marketplace</h1>
          <p className="text-cartoosh-300 mt-1">Buy and sell Avatar Attribute Files — personalities, habits, scripts, and more</p>
        </div>

        {/* Coming Soon Banner */}
        <div className="card p-12 text-center gradient-border mb-8">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="font-display font-bold text-2xl text-white mb-3">Marketplace Launching Soon</h2>
          <p className="text-cartoosh-300 max-w-lg mx-auto mb-6">
            The AAF Marketplace lets creators buy and sell personality packs, scripts, interaction styles, and idea bundles.
            Be the first to list when it opens.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-6">
            {['🧠 Personalities', '📝 Scripts', '💬 Interactions', '💡 Ideas'].map(cat => (
              <div key={cat} className="bg-cartoosh-800 rounded-xl p-4 text-sm text-cartoosh-300">{cat}</div>
            ))}
          </div>
          <span className="badge badge-pro">Coming in Phase 2</span>
        </div>

        {/* Preview Cards */}
        <h3 className="font-display font-semibold text-white mb-4">What You&apos;ll Find Here</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: '🧠', name: 'The Hype Man Pack', desc: 'Ultra-energetic personality settings. Great for sports, drops, and hype content.', price: '5 credits', category: 'PERSONALITY', rating: 4.9 },
            { icon: '📝', name: 'News Anchor Script Kit', desc: '10 professional news delivery scripts. Serious, authoritative, with natural transitions.', price: '8 credits', category: 'SCRIPTS', rating: 4.7 },
            { icon: '💡', name: 'Daily Drop Ideas Bundle', desc: '30 content ideas for lifestyle and fashion creators. Drop-tested and proven.', price: '3 credits', category: 'IDEAS', rating: 4.8 },
          ].map(item => (
            <div key={item.name} className="card p-5 opacity-60">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{item.icon}</div>
                <span className="badge badge-pro text-xs">Preview</span>
              </div>
              <h4 className="text-white font-semibold mb-1">{item.name}</h4>
              <p className="text-cartoosh-300 text-xs mb-3">{item.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-accent-gold font-semibold text-sm">{item.price}</span>
                <span className="text-cartoosh-300 text-xs">⭐ {item.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
