'use client';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';

export default function VaultPage() {
  const { user, loading } = useAuth(true);
  if (loading || !user) return null;

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white">Media Vault</h1>
          <p className="text-cartoosh-300 mt-1">Your generated audio and video files, stored and ready to share</p>
        </div>

        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🗄️</div>
          <h2 className="font-display font-bold text-2xl text-white mb-3">Your Vault is Empty</h2>
          <p className="text-cartoosh-300 max-w-md mx-auto mb-6">
            When you generate audio or video PostScripts, your media files will appear here for download and sharing.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
            {['🎤 Audio Files', '🎬 Video Files', '📄 Scripts'].map(type => (
              <div key={type} className="bg-cartoosh-800 rounded-xl p-3 text-xs text-cartoosh-300">{type}</div>
            ))}
          </div>
          <a href="/terminal" className="btn-primary inline-block">Generate Your First PostScript</a>
        </div>
      </div>
    </AppLayout>
  );
}
