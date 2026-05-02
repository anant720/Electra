import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navigation } from '@/components/layout/Navigation';
import { AlertStrip } from '@/components/layout/AlertStrip';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'ELECTRA — Navigate Every Election.',
    template: '%s | ELECTRA',
  },
  description:
    'ELECTRA is a deterministic civic intelligence platform. Know your rights, register to vote, and navigate every election with verified, official guidance.',
  keywords: ['voter registration', 'election guide', 'civic intelligence', 'how to vote', 'voter rights'],
  authors: [{ name: 'ELECTRA Team' }],
  openGraph: {
    title: 'ELECTRA — Navigate Every Election.',
    description: 'Verified civic intelligence for every voter, every election.',
    url: 'https://electra.app',
    siteName: 'ELECTRA',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ELECTRA — Navigate Every Election.',
    description: 'Verified civic intelligence for every voter, every election.',
    images: ['/twitter-card.png'],
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#102A43',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased" style={{ background: '#0B1E2D' }}>
        <Providers>
          <Navigation />
          <AlertStrip />
          <main id="main-content">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
