'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CountryGrid } from '@/components/civic/CountryGrid';
import { EmergencyFAB } from '@/components/civic/EmergencyFAB';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, onboardingComplete } = useAuthStore();

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && onboardingComplete) {
      router.replace('/dashboard');
    } else if (isAuthenticated && !onboardingComplete) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, onboardingComplete, router]);

  // Show nothing while redirecting
  if (isAuthenticated) return null;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="min-h-screen" style={{ background: '#0B1E2D' }}>

        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 text-center">
          <div className="mx-auto max-w-3xl">

            {/* Logo hero */}
            <div className="flex justify-center mb-8">
              <Image
                src="/logo.png"
                alt="ELECTRA logo"
                width={80}
                height={80}
                className="rounded-2xl"
                priority
              />
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: '#60A5FA' }}>
              Civic Intelligence Platform
            </p>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-white" style={{ lineHeight: 1.1 }}>
              Know Your Vote.<br />
              <span style={{ color: '#0070F3' }}>Exercise Your Right.</span>
            </h1>
            <p className="mb-10 text-xl text-white/60" style={{ lineHeight: 1.7 }}>
              ELECTRA guides you through voter registration, eligibility, and election-day questions
              with verified, official civic intelligence. No guesswork. No confusion.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-bold text-white transition-all duration-150 hover:scale-105 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #0070F3, #7C3AED)' }}
              >
                Get Started — Free
              </Link>
              <Link
                href="#country-select"
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-bold transition-all duration-150 hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}
              >
                Browse Countries
              </Link>
              <Link
                href="/emergency"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all duration-150 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #DC2626, #991B1B)' }}
              >
                🔴 Election Emergency
              </Link>
            </div>
          </div>
        </section>

        {/* Country Selection */}
        <section id="country-select" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white">
              Select Your Country
            </h2>
            <p className="mt-2 text-base text-white/50">
              Get verified civic guidance specific to your electoral system.
            </p>
          </div>
          <CountryGrid />
        </section>

        {/* Trust strip */}
        <section className="border-t py-12" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-white/40">
              Civic data verified from official sources
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-white/40">
              {['🏛️ Election Commission of India', '🇺🇸 Vote.gov', '🇬🇧 Electoral Commission UK', '🇨🇦 Elections Canada', '🇦🇺 AEC'].map((source) => (
                <span key={source}>{source}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm text-white/30">
            © 2026 ELECTRA. Navigate Every Election.
            {' · '}
            <Link href="/legal/disclaimer" className="hover:text-white/60 transition-colors">
              Disclaimer
            </Link>
            {' · '}
            <Link href="/legal/privacy" className="hover:text-white/60 transition-colors">
              Privacy
            </Link>
          </p>
          <p className="mt-2 text-xs text-white/20">
            ELECTRA provides civic guidance, not legal advice. Verify all information at official electoral authority sources before acting.
          </p>
        </footer>
      </div>

      {/* Floating Emergency Button */}
      <EmergencyFAB />
    </>
  );
}
