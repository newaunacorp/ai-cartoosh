import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Cartoosh - Avatar-Driven Identity Media',
  description: 'Create AI avatars that perform, broadcast, and monetize your identity as continuous content.',
  keywords: 'AI avatar, content creation, social media, AI Cartoosh, PostScript, avatar video',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cartoosh-900">
        {children}
      </body>
    </html>
  );
}
