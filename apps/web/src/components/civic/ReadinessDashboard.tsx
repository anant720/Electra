'use client';

import { useCivicStore } from '@/store/civicStore';
import { useAuthStore } from '@/store/authStore';
import { ReadinessMeter } from '@/components/civic/ReadinessMeter';
import { ExclamationTriangleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useMemo } from 'react';

// ─── Country metadata ─────────────────────────────────────────────────────────
const COUNTRY_META: Record<string, { name: string; flag: string; authority: string }> = {
  IND: { name: 'India',          flag: '🇮🇳', authority: 'Election Commission of India' },
  USA: { name: 'United States',  flag: '🇺🇸', authority: 'State Secretary of State' },
  GBR: { name: 'United Kingdom', flag: '🇬🇧', authority: 'Electoral Commission' },
  CAN: { name: 'Canada',         flag: '🇨🇦', authority: 'Elections Canada' },
  AUS: { name: 'Australia',      flag: '🇦🇺', authority: 'Australian Electoral Commission' },
};

// ─── Persona labels ───────────────────────────────────────────────────────────
const PERSONA_LABELS: Record<string, { label: string; icon: string }> = {
  P01: { label: 'First-Time Voter',        icon: '🗳️' },
  P02: { label: 'Student / Relocated',     icon: '🎓' },
  P03: { label: 'NRI / Overseas',          icon: '✈️' },
  P04: { label: 'Senior Voter (60+)',      icon: '👴' },
  P05: { label: 'Person with Disability',  icon: '♿' },
  P06: { label: 'Election Day Emergency',  icon: '🚨' },
};

// ─── Quick actions ────────────────────────────────────────────────────────────
const QUICK_LINKS = [
  { href: '/register',  label: 'Register to Vote', icon: '📋', color: '#0070F3' },
  { href: '/emergency', label: 'Emergency Help',   icon: '🔴', color: '#DC2626' },
  { href: '/checklist', label: 'My Checklist',     icon: '✅', color: '#059669' },
  { href: '/ask',       label: 'Ask ELECTRA',      icon: '🤖', color: '#7C3AED' },
];

// ─── Decode JWT without a library ────────────────────────────────────────────
function decodeJwt(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/') ?? '';
    return JSON.parse(atob(base64));
  } catch { return null; }
}

export function ReadinessDashboard() {
  const { countryCode, personaCode, completedRegistrationSteps } = useCivicStore();
  const { accessToken } = useAuthStore();

  // Decode user info from JWT
  const jwt = useMemo(() => accessToken ? decodeJwt(accessToken) : null, [accessToken]);
  const userEmail  = jwt?.email  ?? null;
  const userInitial = userEmail ? userEmail[0]?.toUpperCase() : '?';

  // Read profile from localStorage (saved by onboarding step 3)
  const storedName = typeof window !== 'undefined'
    ? localStorage.getItem('electra-user-name') ?? ''
    : '';

  const country = countryCode ? COUNTRY_META[countryCode] : null;
  const persona = personaCode ? PERSONA_LABELS[personaCode] : null;

  // ── Local readiness score based on completed steps ──────────────────────────
  // Full checklist has 10 items; score 0-100 proportionally
  const localScore = Math.min(100, Math.round((completedRegistrationSteps.length / 10) * 100));

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0B1E2D 0%, #102A43 60%, #0D2137 100%)' }}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* ── Header ── */}
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0070F3, #7C3AED)' }}
            >
              {userInitial}
            </div>
            <div>
              <h1 className="text-white font-extrabold text-xl leading-tight">
                {storedName ? `Welcome back, ${storedName.split(' ')[0]}!` : 'Your Dashboard'}
              </h1>
              <p className="text-white/50 text-sm mt-0.5">{userEmail}</p>
            </div>
          </div>
          <Link
            href="/emergency"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200"
            style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)' }}
          >
            🔴 Emergency
          </Link>
        </div>

        {/* ── Profile Card ── */}
        <div
          className="rounded-2xl p-5 mb-6 flex items-center gap-5 flex-wrap"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {country ? (
            <>
              <div className="text-5xl">{country.flag}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-lg">{country.name}</p>
                <p className="text-white/50 text-xs mt-0.5">{country.authority}</p>
              </div>
              {persona && (
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(0,112,243,0.15)', border: '1px solid rgba(0,112,243,0.25)' }}
                >
                  <span className="text-xl">{persona.icon}</span>
                  <span className="text-white/80 text-sm font-semibold">{persona.label}</span>
                </div>
              )}
              <Link
                href="/onboarding"
                className="text-xs text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
              >
                Change
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌍</span>
              <div>
                <p className="text-white font-semibold text-sm">No country selected</p>
                <Link href="/onboarding" className="text-xs" style={{ color: '#0070F3' }}>
                  Complete your setup →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Main grid ── */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Readiness Meter */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center gap-5 lg:col-span-1"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <h2 className="text-white font-bold text-base w-full">Voter Readiness</h2>
            <ReadinessMeter score={localScore} size="lg" />
            <p className="text-white/40 text-xs text-center">
              {localScore === 0
                ? 'Complete your checklist to build your score'
                : localScore === 100
                ? '✅ You are fully prepared to vote!'
                : `${10 - completedRegistrationSteps.length} steps remaining`}
            </p>

            {/* domain bars */}
            <div className="w-full space-y-2.5">
              {[
                { label: 'Registration',  pct: localScore >= 30 ? 100 : Math.min(100, localScore * 3) },
                { label: 'Documents',     pct: localScore >= 55 ? 100 : Math.max(0, (localScore - 30) * 4) },
                { label: 'Deadlines',     pct: localScore >= 75 ? 100 : Math.max(0, (localScore - 55) * 5) },
                { label: 'Location',      pct: localScore >= 90 ? 100 : Math.max(0, (localScore - 75) * 6) },
                { label: 'Emergency',     pct: Math.max(0, (localScore - 90) * 10) },
              ].map(({ label, pct }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <span>{label}</span><span>{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 80 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#3B82F6',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Next Action prompt */}
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(0,112,243,0.1)', border: '1px solid rgba(0,112,243,0.25)' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,112,243,0.2)' }}
                >
                  <ArrowRightIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Your next action</p>
                  <h3 className="text-white font-bold mt-0.5">
                    {localScore === 0
                      ? 'Confirm your voting eligibility'
                      : localScore < 40
                      ? 'Complete your voter registration'
                      : localScore < 70
                      ? 'Verify your name on the electoral roll'
                      : localScore < 90
                      ? 'Find your polling station'
                      : 'Save the voter helpline number'}
                  </h3>
                  <p className="text-white/50 text-sm mt-1">
                    {country
                      ? `Check ${country.authority} for the latest requirements.`
                      : 'Visit your official electoral authority website.'}
                  </p>
                  <p className="text-white/30 text-xs mt-2">⏱️ ~5 minutes</p>
                </div>
              </div>
            </div>

            {/* Warning if 0% */}
            {localScore === 0 && countryCode && (
              <div
                className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
              >
                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
                <p className="text-sm" style={{ color: '#FCD34D' }}>
                  Your readiness score is 0%. Start your checklist to track your voter preparation steps.
                </p>
              </div>
            )}

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-3">
              {QUICK_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl p-4 flex items-center gap-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Signed-in account info */}
            <div
              className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">Signed in as</p>
                <p className="text-white text-sm font-medium mt-0.5">{userEmail ?? 'Guest'}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-white/40 text-xs">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
