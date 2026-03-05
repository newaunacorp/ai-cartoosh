'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { href: '/studio', label: 'Avatar Studio', icon: '🎭' },
  { href: '/terminal', label: 'PS Terminal', icon: '🎬' },
  { href: '/feed', label: 'Post Show Feed', icon: '📺' },
  { href: '/marketplace', label: 'Marketplace', icon: '🛒' },
  { href: '/vault', label: 'Media Vault', icon: '🗄️' },
  { href: '/rankings', label: 'Rankings', icon: '🏆' },
  { href: '/pricing', label: 'Upgrade', icon: '💎' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

const TIER_COLORS: Record<string, string> = {
  FREE: 'badge-free',
  CREATOR: 'badge-creator',
  PRO: 'badge-pro',
  STUDIO: 'badge-studio',
  ENTERPRISE: 'badge-interpretive',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth(true);
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen bg-cartoosh-900 flex items-center justify-center">
        <div className="text-cartoosh-400 font-display text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cartoosh-900 flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-cartoosh-800 border-r border-cartoosh-700 flex flex-col fixed inset-y-0 left-0 z-20">
        {/* Logo */}
        <div className="p-5 border-b border-cartoosh-700">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cartoosh-400 to-accent-violet flex items-center justify-center shrink-0">
              <span className="text-white font-bold">AC</span>
            </div>
            <span className="font-display font-bold text-white">AI Cartoosh</span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-cartoosh-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-cartoosh-600 flex items-center justify-center text-cartoosh-300 font-bold text-sm shrink-0">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-semibold truncate">{user.displayName}</div>
              <span className={`badge ${TIER_COLORS[user.subscriptionTier] || 'badge-free'} text-xs`}>
                {user.subscriptionTier}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-cartoosh-300">Credits</span>
            <span className="text-cartoosh-400 font-bold">{user.creditBalance}</span>
          </div>
          <div className="mt-1 bg-cartoosh-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-cartoosh-400 to-accent-violet h-1.5 rounded-full"
              style={{ width: `${Math.min((user.creditBalance / 100) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {NAV.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all ${
                  active
                    ? 'bg-cartoosh-400/20 text-cartoosh-400 border border-cartoosh-400/30'
                    : 'text-cartoosh-300 hover:bg-cartoosh-700 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-cartoosh-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-cartoosh-300 hover:bg-cartoosh-700 hover:text-white transition-all"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
