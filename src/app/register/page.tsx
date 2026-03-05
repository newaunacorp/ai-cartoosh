'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    email: '',
    password: '',
    displayName: '',
    referralCode: searchParams.get('ref') || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        router.push('/onboarding');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cartoosh-900 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-violet opacity-[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-cartoosh-400 opacity-[0.04] rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cartoosh-400 to-accent-violet flex items-center justify-center">
              <span className="text-white font-bold text-lg">AC</span>
            </div>
            <span className="font-display font-bold text-xl text-white">AI Cartoosh</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white">Create your avatar</h1>
          <p className="text-cartoosh-300 mt-2">Start free — no credit card required</p>
        </div>

        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6 p-3 bg-accent-cyan/10 border border-accent-cyan/20 rounded-xl">
            <span className="text-2xl">🎁</span>
            <div>
              <div className="text-white text-sm font-semibold">15 free credits on signup</div>
              <div className="text-cartoosh-300 text-xs">Enough to create your first PostScript</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-accent-coral/10 border border-accent-coral/30 rounded-xl p-3 text-accent-coral text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-cartoosh-300 text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                value={form.displayName}
                onChange={e => update('displayName', e.target.value)}
                required
                className="w-full"
                placeholder="Your creator name"
              />
            </div>
            <div>
              <label className="block text-cartoosh-300 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                required
                className="w-full"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-cartoosh-300 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                required
                className="w-full"
                placeholder="Min 8 characters"
              />
            </div>
            <div>
              <label className="block text-cartoosh-300 text-sm font-medium mb-2">
                Referral Code <span className="text-cartoosh-400 text-xs">(optional — get +10 bonus credits)</span>
              </label>
              <input
                type="text"
                value={form.referralCode}
                onChange={e => update('referralCode', e.target.value)}
                className="w-full"
                placeholder="Enter referral code"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account Free'}
            </button>
          </form>
        </div>

        <p className="text-center text-cartoosh-300 mt-6 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-cartoosh-400 hover:text-white transition-colors font-medium">
            Sign in
          </Link>
        </p>
        <p className="text-center text-cartoosh-400/50 mt-4 text-xs">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="underline">Terms</Link> and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
