'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';

const VOICE_STYLES = ['PROFESSIONAL', 'CASUAL', 'ENERGETIC', 'CALM', 'COMEDIC', 'DRAMATIC'];
const GEN_METHODS = [
  { value: 'PRESET', label: '🎨 Use Preset', desc: 'Choose from built-in avatar styles' },
  { value: 'AI_GENERATED', label: '🤖 AI Generate', desc: 'DALL-E 3 creates your avatar image (3 credits)' },
  { value: 'UPLOAD', label: '📸 Upload Photo', desc: 'Use your own image' },
];

export default function StudioPage() {
  const { user, loading } = useAuth(true);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    personality: '',
    voiceStyle: 'PROFESSIONAL',
    avatarGenerationMethod: 'PRESET',
    worldSetting: '',
    formalityLevel: 50,
    energyLevel: 50,
    humorLevel: 50,
    verbosityLevel: 50,
  });

  function update(key: string, value: any) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.personality) {
      setError('Name and personality are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create avatar');
      setSuccess(`Avatar "${form.name}" created!`);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) return null;

  return (
    <AppLayout>
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white">Avatar Studio</h1>
          <p className="text-cartoosh-300 mt-1">Create a new AI persona to perform your content</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-accent-coral/10 border border-accent-coral/30 rounded-xl p-3 text-accent-coral text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl p-3 text-accent-cyan text-sm">{success}</div>
          )}

          {/* Generation Method */}
          <div>
            <label className="block text-cartoosh-300 text-sm font-medium mb-3">Avatar Image</label>
            <div className="grid grid-cols-3 gap-3">
              {GEN_METHODS.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => update('avatarGenerationMethod', m.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    form.avatarGenerationMethod === m.value
                      ? 'border-cartoosh-400 bg-cartoosh-400/10'
                      : 'border-cartoosh-700 bg-cartoosh-800 hover:border-cartoosh-500'
                  }`}
                >
                  <div className="text-sm font-semibold text-white mb-1">{m.label}</div>
                  <div className="text-xs text-cartoosh-300">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <div>
              <label className="block text-cartoosh-300 text-sm font-medium mb-2">Avatar Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                className="w-full"
                placeholder="e.g. Nova, Blaze, Echo, The Anchor..."
                required
              />
            </div>

            <div>
              <label className="block text-cartoosh-300 text-sm font-medium mb-2">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => update('description', e.target.value)}
                className="w-full"
                placeholder="One-line summary of this avatar"
              />
            </div>

            <div>
              <label className="block text-cartoosh-300 text-sm font-medium mb-2">
                Personality & Character *
                <span className="text-cartoosh-400 font-normal ml-2 text-xs">Be detailed — this drives all AI output</span>
              </label>
              <textarea
                value={form.personality}
                onChange={e => update('personality', e.target.value)}
                className="w-full h-32 resize-none"
                placeholder="Describe how your avatar speaks, behaves, and feels. e.g. 'Sharp-witted sports commentator who blends stats with humor. Never takes things too seriously but always gets the point. Speaks in punchy, energetic bursts...'"
                required
              />
            </div>

            <div>
              <label className="block text-cartoosh-300 text-sm font-medium mb-2">World Setting</label>
              <input
                type="text"
                value={form.worldSetting}
                onChange={e => update('worldSetting', e.target.value)}
                className="w-full"
                placeholder="e.g. A futuristic newsroom, A jazz club in 1950s Chicago..."
              />
            </div>

            <div>
              <label className="block text-cartoosh-300 text-sm font-medium mb-2">Voice Style</label>
              <select value={form.voiceStyle} onChange={e => update('voiceStyle', e.target.value)} className="w-full">
                {VOICE_STYLES.map(s => (
                  <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Personality Sliders */}
          <div className="card p-6">
            <h3 className="font-display font-semibold text-white mb-4">Personality Dials</h3>
            <div className="space-y-5">
              {[
                { key: 'formalityLevel', label: 'Formality', left: 'Casual', right: 'Formal' },
                { key: 'energyLevel', label: 'Energy', left: 'Chill', right: 'High Energy' },
                { key: 'humorLevel', label: 'Humor', left: 'Serious', right: 'Very Funny' },
                { key: 'verbosityLevel', label: 'Verbosity', left: 'Concise', right: 'Elaborate' },
              ].map(slider => (
                <div key={slider.key}>
                  <div className="flex justify-between text-xs text-cartoosh-300 mb-2">
                    <span>{slider.left}</span>
                    <span className="text-cartoosh-400 font-semibold">{slider.label}: {(form as any)[slider.key]}</span>
                    <span>{slider.right}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={(form as any)[slider.key]}
                    onChange={e => update(slider.key, parseInt(e.target.value))}
                    className="w-full accent-cartoosh-400"
                  />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
            {saving ? 'Creating Avatar...' : 'Create Avatar 🎭'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
