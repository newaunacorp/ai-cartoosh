'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user, loading, setUser } = useAuth(true);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Pre-fill once user loads
  if (user && !displayName && user.displayName) {
    setDisplayName(user.displayName);
    setBio(user.bio || '');
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, bio }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setMessage('Profile saved!');
      } else {
        setMessage('Failed to save. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) return null;

  return (
    <AppLayout>
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-white">Settings</h1>
          <p className="text-cartoosh-300 mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile */}
        <div className="card p-6 mb-6">
          <h2 className="font-display font-semibold text-xl text-white mb-5">Profile</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            {message && (
              <div className={`rounded-xl p-3 text-sm ${message.includes('Failed') ? 'bg-accent-coral/10 text-accent-coral border border-accent-coral/30' : 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30'}`}>
                {message}
              </div>
            )}
            <div>
              <label className="block text-cartoosh-300 text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-cartoosh-300 text-sm font-medium mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full h-24 resize-none"
                placeholder="Tell people about you and your shows..."
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="card p-6 mb-6">
          <h2 className="font-display font-semibold text-xl text-white mb-5">Account</h2>
          <div className="space-y-3">
            {[
              { label: 'Email', value: user.email },
              { label: 'Plan', value: user.subscriptionTier },
              { label: 'Credits', value: `${user.creditBalance} remaining` },
              { label: 'Referral Code', value: user.referralCode },
              { label: 'Total Referrals', value: user.totalReferrals },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-cartoosh-700 last:border-0">
                <span className="text-cartoosh-300 text-sm">{item.label}</span>
                <span className="text-white text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <a href="/pricing" className="btn-secondary text-sm inline-block">
              Manage Subscription →
            </a>
          </div>
        </div>

        {/* Referral */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-xl text-white mb-3">Refer & Earn</h2>
          <p className="text-cartoosh-300 text-sm mb-4">
            Share your link and earn <span className="text-accent-gold font-semibold">25 credits</span> for every friend who joins.
          </p>
          <div className="flex gap-3">
            <div className="flex-1 bg-cartoosh-800 rounded-xl px-4 py-3 font-mono text-cartoosh-400 text-sm truncate">
              aicartoosh.com/register?ref={user.referralCode}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(`https://aicartoosh.com/register?ref=${user.referralCode}`)}
              className="btn-secondary text-sm whitespace-nowrap"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
