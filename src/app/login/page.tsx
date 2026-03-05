'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        router.push(data.user.hasCompletedOnboarding ? '/dashboard' : '/onboarding');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cartoosh-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cartoosh-400 opacity-[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-accent-coral opacity-[0.04] rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cartoosh-400 to-accent-violet flex items-center justify-center">
              <span className="text-white font-bold text-lg">AC</span>
            </div>
            <span className="font-display font-bold text-xl text-white">AI Cartoosh</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white">Welcome back</h1>
          <p className="text-cartoosh-300 mt-2">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-accent-coral/10 border border-accent-coral/30 rounded-xl p-3 text-accent-coral text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-cartoosh-300 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-cartoosh-300 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-cartoosh-300 mt-6 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-cartoosh-400 hover:text-white transition-colors font-medium">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
