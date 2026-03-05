'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  bio?: string;
  profileImage?: string;
  subscriptionTier: string;
  creditBalance: number;
  referralCode: string;
  totalReferrals: number;
  hasCompletedOnboarding: boolean;
  avatars: any[];
}

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          setUser(data.user);
          if (!data.user.hasCompletedOnboarding && requireAuth) {
            router.replace('/onboarding');
          }
        } else if (requireAuth) {
          router.replace('/login');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    document.cookie = 'auth-token=; Max-Age=0; path=/';
    router.push('/');
  }

  return { user, loading, setUser, logout };
}
