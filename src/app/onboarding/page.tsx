'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = ['Welcome', 'Your Avatar', 'Your Show', 'Launch'];

const VOICE_STYLES = ['PROFESSIONAL', 'CASUAL', 'ENERGETIC', 'CALM', 'COMEDIC', 'DRAMATIC'];
const PLAN_TYPES = ['PERSONAL', 'BUSINESS', 'SPORTS', 'HOBBY', 'NEWS', 'ENTERTAINMENT', 'EDUCATION'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [avatar, setAvatar] = useState({
    name: '',
    description: '',
    personality: '',
    voiceStyle: 'PROFESSIONAL',
  });

  const [plan, setPlan] = useState({
    planName: '',
    planType: 'ENTERTAINMENT',
    description: '',
  });

  function updateAvatar(key: string, value: string) {
    setAvatar(a => ({ ...a, [key]: value }));
  }
  function updatePlan(key: string, value: string) {
    setPlan(p => ({ ...p, [key]: value }));
  }

  async function finish() {
    setLoading(true);
    setError('');
    try {
      // Create avatar
      const avatarRes = await fetch('/api/avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...avatar, avatarGenerationMethod: 'PRESET' }),
      });
      if (!avatarRes.ok) throw new Error('Avatar creation failed');
      const avatarData = await avatarRes.json();

      // Create content plan
      const planRes = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...plan, avatarId: avatarData.avatar.id }),
      });
      if (!planRes.ok) throw new Error('Plan creation failed');

      // Mark onboarding complete
      await fetch('/api/auth/complete-onboarding', { method: 'POST' });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cartoosh-900 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-cartoosh-400 opacity-[0.04] rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-accent-violet opacity-[0.04] rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-accent-cyan text-cartoosh-900' :
                i === step ? 'bg-cartoosh-400 text-white' :
                'bg-cartoosh-700 text-cartoosh-300'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 ${i < step ? 'bg-accent-cyan' : 'bg-cartoosh-700'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-8">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="text-6xl mb-6">🎭</div>
              <h1 className="font-display font-bold text-3xl text-white mb-4">Welcome to AI Cartoosh</h1>
              <p className="text-cartoosh-300 mb-6 leading-relaxed">
                You&apos;re about to create an AI avatar that speaks, performs, and broadcasts your content 24/7.
                This takes less than 2 minutes.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: '🎭', label: 'Create Avatar' },
                  { icon: '📺', label: 'Set Up Show' },
                  { icon: '🚀', label: 'Go Live' },
                ].map(item => (
                  <div key={item.label} className="bg-cartoosh-800 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="text-cartoosh-300 text-xs">{item.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="btn-primary w-full">
                Let&apos;s Build Your Avatar →
              </button>
            </div>
          )}

          {/* Step 1: Avatar */}
          {step === 1 && (
            <div>
              <h2 className="font-display font-bold text-2xl text-white mb-2">Create Your Avatar</h2>
              <p className="text-cartoosh-300 text-sm mb-6">This is the AI persona that will perform your content.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-cartoosh-300 text-sm font-medium mb-2">Avatar Name</label>
                  <input
                    type="text"
                    value={avatar.name}
                    onChange={e => updateAvatar('name', e.target.value)}
                    className="w-full"
                    placeholder="e.g. Nova, Blaze, Echo..."
                  />
                </div>
                <div>
                  <label className="block text-cartoosh-300 text-sm font-medium mb-2">Personality</label>
                  <textarea
                    value={avatar.personality}
                    onChange={e => updateAvatar('personality', e.target.value)}
                    className="w-full h-24 resize-none"
                    placeholder="Describe how your avatar acts, speaks, and feels. e.g. 'Energetic and witty sports commentator who never takes life too seriously...'"
                  />
                </div>
                <div>
                  <label className="block text-cartoosh-300 text-sm font-medium mb-2">Voice Style</label>
                  <select
                    value={avatar.voiceStyle}
                    onChange={e => updateAvatar('voiceStyle', e.target.value)}
                    className="w-full"
                  >
                    {VOICE_STYLES.map(s => (
                      <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1">← Back</button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!avatar.name || !avatar.personality}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Content Plan */}
          {step === 2 && (
            <div>
              <h2 className="font-display font-bold text-2xl text-white mb-2">Set Up Your Post Show</h2>
              <p className="text-cartoosh-300 text-sm mb-6">Your Post Show is the channel your avatar broadcasts on.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-cartoosh-300 text-sm font-medium mb-2">Show Name</label>
                  <input
                    type="text"
                    value={plan.planName}
                    onChange={e => updatePlan('planName', e.target.value)}
                    className="w-full"
                    placeholder="e.g. The Daily Drop, Sports Breakdown..."
                  />
                </div>
                <div>
                  <label className="block text-cartoosh-300 text-sm font-medium mb-2">Show Type</label>
                  <select
                    value={plan.planType}
                    onChange={e => updatePlan('planType', e.target.value)}
                    className="w-full"
                  >
                    {PLAN_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-cartoosh-300 text-sm font-medium mb-2">What&apos;s your show about?</label>
                  <textarea
                    value={plan.description}
                    onChange={e => updatePlan('description', e.target.value)}
                    className="w-full h-20 resize-none"
                    placeholder="Describe your show's theme and topics..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!plan.planName || !plan.description}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Launch */}
          {step === 3 && (
            <div className="text-center">
              <div className="text-6xl mb-6">🚀</div>
              <h2 className="font-display font-bold text-2xl text-white mb-4">Ready to Launch!</h2>
              <div className="bg-cartoosh-800 rounded-xl p-5 mb-6 text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-cartoosh-300">Avatar</span>
                  <span className="text-white font-semibold">{avatar.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cartoosh-300">Voice</span>
                  <span className="text-white font-semibold">{avatar.voiceStyle}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cartoosh-300">Show</span>
                  <span className="text-white font-semibold">{plan.planName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cartoosh-300">Type</span>
                  <span className="text-white font-semibold">{plan.planType}</span>
                </div>
              </div>
              {error && (
                <div className="bg-accent-coral/10 border border-accent-coral/30 rounded-xl p-3 text-accent-coral text-sm mb-4">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                <button onClick={finish} disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Creating...' : 'Launch My Avatar 🚀'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
