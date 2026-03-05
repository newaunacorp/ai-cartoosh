'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';

export default function TerminalPage() {
  const { user, loading } = useAuth(true);
  const [avatars, setAvatars] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [scriptType, setScriptType] = useState<'VERBATIM' | 'INTERPRETIVE'>('INTERPRETIVE');
  const [sourceText, setSourceText] = useState('');
  const [result, setResult] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishedId, setPublishedId] = useState('');

  useEffect(() => {
    if (!user) return;
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setAvatars(d.user?.avatars || []);
    });
  }, [user]);

  useEffect(() => {
    if (!selectedAvatar) return;
    fetch(`/api/plans?avatarId=${selectedAvatar}`).then(r => r.json()).then(d => {
      setPlans(d.plans || []);
    });
  }, [selectedAvatar]);

  async function generate() {
    if (!selectedAvatar || !selectedPlan || !sourceText.trim()) {
      setError('Select an avatar, show, and provide source material');
      return;
    }
    setGenerating(true);
    setError('');
    setResult('');
    setPublishedId('');
    try {
      const res = await fetch('/api/postscripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatarId: selectedAvatar,
          planId: selectedPlan,
          sourceText,
          scriptType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'INSUFFICIENT_CREDITS') {
          setError(`Not enough credits. You have ${data.balance}, need ${data.needed}. Upgrade to get more.`);
        } else {
          setError(data.error || 'Generation failed');
        }
      } else {
        setResult(data.postScript.generatedOutput || '');
        setPublishedId('');
      }
    } catch {
      setError('Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function publish() {
    if (!result) return;
    setPublishing(true);
    try {
      const res = await fetch('/api/postscripts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId: selectedAvatar, planId: selectedPlan, generatedOutput: result, scriptType }),
      });
      const data = await res.json();
      if (res.ok) setPublishedId(data.postScript?.id || 'published');
    } finally {
      setPublishing(false);
    }
  }

  if (loading || !user) return null;

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white">PS Terminal</h1>
          <p className="text-cartoosh-300 mt-1">Generate PostScript content with your AI avatar</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Avatar Select */}
          <div>
            <label className="block text-cartoosh-300 text-sm font-medium mb-2">Avatar</label>
            {avatars.length === 0 ? (
              <div className="card p-4 text-center text-cartoosh-300 text-sm">
                No avatars yet. <a href="/studio" className="text-cartoosh-400">Create one first.</a>
              </div>
            ) : (
              <select value={selectedAvatar} onChange={e => setSelectedAvatar(e.target.value)} className="w-full">
                <option value="">Select avatar...</option>
                {avatars.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Plan Select */}
          <div>
            <label className="block text-cartoosh-300 text-sm font-medium mb-2">Post Show</label>
            <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} className="w-full" disabled={!selectedAvatar}>
              <option value="">Select show...</option>
              {plans.map((p: any) => (
                <option key={p.id} value={p.id}>{p.planName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Script Type */}
        <div className="mb-6">
          <label className="block text-cartoosh-300 text-sm font-medium mb-3">Script Mode</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                type: 'VERBATIM' as const,
                icon: '📝',
                title: 'Verbatim',
                desc: 'Avatar reads your source material word-for-word with performance notes. 1 credit.',
                badge: 'badge-verbatim',
              },
              {
                type: 'INTERPRETIVE' as const,
                icon: '🎨',
                title: 'Interpretive',
                desc: 'Avatar riffs on your source material in their own voice and personality. 2 credits.',
                badge: 'badge-interpretive',
              },
            ].map(mode => (
              <button
                key={mode.type}
                type="button"
                onClick={() => setScriptType(mode.type)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  scriptType === mode.type
                    ? 'border-cartoosh-400 bg-cartoosh-400/10'
                    : 'border-cartoosh-700 bg-cartoosh-800 hover:border-cartoosh-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span>{mode.icon}</span>
                  <span className={`badge ${mode.badge} text-xs`}>{mode.title}</span>
                </div>
                <div className="text-cartoosh-300 text-xs">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Source Text */}
        <div className="mb-6">
          <label className="block text-cartoosh-300 text-sm font-medium mb-2">
            Source Material
            <span className="text-cartoosh-400 font-normal ml-2 text-xs">
              {scriptType === 'VERBATIM' ? 'Will be read exactly as written' : 'Will be used as inspiration'}
            </span>
          </label>
          <textarea
            value={sourceText}
            onChange={e => setSourceText(e.target.value)}
            className="w-full h-40 resize-none"
            placeholder={
              scriptType === 'VERBATIM'
                ? 'Paste the text you want your avatar to read verbatim...'
                : 'Paste an article, news story, idea, or anything you want your avatar to riff on...'
            }
          />
          <div className="flex justify-between mt-1">
            <span className="text-cartoosh-400 text-xs">{sourceText.length} characters</span>
            <span className="text-cartoosh-400 text-xs">⚡ {user.creditBalance} credits</span>
          </div>
        </div>

        {error && (
          <div className="bg-accent-coral/10 border border-accent-coral/30 rounded-xl p-3 text-accent-coral text-sm mb-4">
            {error}
            {error.includes('credits') && (
              <a href="/pricing" className="ml-2 underline text-accent-gold">Upgrade →</a>
            )}
          </div>
        )}

        <button
          onClick={generate}
          disabled={generating || !selectedAvatar || !selectedPlan || !sourceText.trim()}
          className="btn-primary w-full mb-6 disabled:opacity-50"
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⚡</span> Generating PostScript...
            </span>
          ) : (
            '🎬 Generate PostScript'
          )}
        </button>

        {/* Result */}
        {result && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-white">Generated Script</h3>
              <span className={`badge ${scriptType === 'VERBATIM' ? 'badge-verbatim' : 'badge-interpretive'}`}>
                {scriptType}
              </span>
            </div>
            <div className="bg-cartoosh-900 rounded-xl p-4 mb-4 max-h-80 overflow-y-auto">
              <pre className="text-cartoosh-200 text-sm leading-relaxed whitespace-pre-wrap font-mono">{result}</pre>
            </div>
            <div className="flex gap-3">
              <button onClick={generate} disabled={generating} className="btn-secondary flex-1">
                🔄 Regenerate
              </button>
              {publishedId ? (
                <div className="flex-1 flex items-center justify-center text-accent-cyan text-sm font-semibold">
                  ✓ Published to Feed!
                </div>
              ) : (
                <button onClick={publish} disabled={publishing} className="btn-primary flex-1">
                  {publishing ? 'Publishing...' : '📺 Publish to Feed'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
