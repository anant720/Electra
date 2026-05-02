'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useCivicStore } from '@/store/civicStore';
import { useAuthStore } from '@/store/authStore';
import { ReadinessMeter } from '@/components/civic/ReadinessMeter';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Lazy-load heavy components for performance
const ElectionTimeline = dynamic(
  () => import('@/components/ElectionTimeline').then(m => ({ default: m.ElectionTimeline })),
  { ssr: false, loading: () => <TimelineSkeleton /> }
);

// ─── Country meta ─────────────────────────────────────────────────────────────
const COUNTRY_META: Record<string, { name: string; flag: string; authority: string; helpline: string; portal: string }> = {
  IND: { name: 'India',          flag: '🇮🇳', authority: 'Election Commission of India',      helpline: '1950',          portal: 'voters.eci.gov.in' },
  USA: { name: 'United States',  flag: '🇺🇸', authority: 'State Secretary of State',          helpline: '1-866-687-8683', portal: 'vote.gov' },
  GBR: { name: 'United Kingdom', flag: '🇬🇧', authority: 'Electoral Commission',              helpline: '0800 328 0280', portal: 'electoralcommission.org.uk' },
  CAN: { name: 'Canada',         flag: '🇨🇦', authority: 'Elections Canada',                  helpline: '1-800-463-6868', portal: 'elections.ca' },
  AUS: { name: 'Australia',      flag: '🇦🇺', authority: 'Australian Electoral Commission',   helpline: '13 23 26',      portal: 'aec.gov.au' },
};

const PERSONA_META: Record<string, { label: string; icon: string }> = {
  P01: { label: 'First-Time Voter',        icon: '🗳️' },
  P02: { label: 'Student / Relocated',     icon: '🎓' },
  P03: { label: 'NRI / Overseas',          icon: '✈️' },
  P04: { label: 'Senior Voter',            icon: '👴' },
  P05: { label: 'Person with Disability',  icon: '♿' },
  P06: { label: 'Emergency Voter',         icon: '🚨' },
};

import { getChecklist, ChecklistDomain } from '@/data/checklists';

// ─── Decode JWT ───────────────────────────────────────────────────────────────
function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/') ?? '';
    return JSON.parse(atob(base64));
  } catch { return null; }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function TimelineSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading election timeline">
      {[1,2,3].map(i => (
        <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
      ))}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  const label = score >= 80 ? 'Well Prepared' : score >= 40 ? 'In Progress' : 'Just Started';
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: `${color}22`, color }}
    >
      {label}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardClient() {
  const { countryCode, personaCode, completedRegistrationSteps, toggleRegistrationStep } = useCivicStore();
  const { accessToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'checklist' | 'timeline'>('checklist');

  const jwt   = useMemo(() => accessToken ? decodeJwt(accessToken) : null, [accessToken]);
  const email = jwt?.email as string | undefined;
  const initial = email?.[0]?.toUpperCase() ?? '?';

  const storedName = typeof window !== 'undefined' ? localStorage.getItem('electra-user-name') ?? '' : '';
  const firstName  = storedName.split(' ')[0] || 'Voter';

  const country = countryCode ? COUNTRY_META[countryCode] : null;
  const persona = personaCode ? PERSONA_META[personaCode] : null;

  const domains = useMemo(() => getChecklist(countryCode, personaCode), [countryCode, personaCode]);

  // ── Score calculation ──────────────────────────────────────────────────────
  const completedSet = new Set(completedRegistrationSteps);

  const domainScores = domains.map((d) => {
    const done = d.items.filter((item) => completedSet.has(item.id)).length;
    return { ...d, done, total: d.items.length, pct: Math.round((done / d.items.length) * 100) };
  });

  const totalScore = Math.min(100, Math.round(
    domainScores.reduce((acc, d) => acc + (d.total > 0 ? (d.done / d.total) * d.weight : 0), 0)
  ));

  // Domain locked if predecessor not fully complete
  function isDomainLocked(domain: ChecklistDomain): boolean {
    if (!domain.dependsOn) return false;
    const parent = domainScores.find(d => d.key === domain.dependsOn);
    return parent ? parent.done < parent.total : false;
  }

  // Next action text
  const nextDomain = domainScores.find(d => d.done < d.total && !isDomainLocked(d));
  const nextItem   = nextDomain?.items[nextDomain.done]?.label;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-16" style={{ background: 'linear-gradient(160deg, #0B1E2D 0%, #102A43 50%, #0D2137 100%)' }}>

      {/* ── BANNER ── Full-width image at top of dashboard */}
      <div className="relative w-full overflow-hidden" style={{ maxHeight: '220px' }}>
        <Image
          src="/dashboard-banner.png"
          alt="ELECTRA — Navigate Every Election"
          width={1920}
          height={480}
          className="w-full object-cover object-center"
          style={{ maxHeight: '220px' }}
          priority
        />
        {/* Gradient overlay so the banner blends into the dark page below */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(11,30,45,0.1) 0%, rgba(11,30,45,0.0) 40%, rgba(11,30,45,0.85) 100%)',
          }}
          aria-hidden="true"
        />
        {/* User welcome overlay — bottom-left of banner */}
        <div className="absolute bottom-4 left-4 sm:left-6 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0070F3, #7C3AED)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
            aria-hidden="true"
          >
            {initial}
          </div>
          <div>
            <h1 className="text-white font-extrabold text-base sm:text-lg leading-tight drop-shadow-lg">
              Welcome back, {firstName}!
            </h1>
            {email && <p className="text-white/60 text-xs drop-shadow">{email}</p>}
          </div>
          <ScoreBadge score={totalScore} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">


        {/* ── Profile pill ── */}
        {country && (
          <div
            className="flex items-center gap-4 p-4 rounded-2xl mb-6 flex-wrap"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-4xl" aria-hidden="true">{country.flag}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold">{country.name}</p>
              <p className="text-white/40 text-xs mt-0.5">{country.authority}</p>
            </div>
            {persona && (
              <span
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(0,112,243,0.15)', border: '1px solid rgba(0,112,243,0.25)', color: 'rgba(255,255,255,0.8)' }}
              >
                {persona.icon} {persona.label}
              </span>
            )}
            {/* Helpline */}
            <a
              href={`tel:${country.helpline}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150 hover:opacity-80"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#6EE7B7' }}
              aria-label={`Call voter helpline: ${country.helpline}`}
            >
              📞 {country.helpline}
            </a>
            <Link
              href="/onboarding"
              className="text-xs text-white/25 hover:text-white/50 transition-colors underline underline-offset-2"
            >
              Change
            </Link>
          </div>
        )}

        {/* ── Next Action Banner ── */}
        {nextItem && (
          <div
            className="flex items-start gap-4 p-4 rounded-2xl mb-6"
            style={{ background: 'rgba(0,112,243,0.08)', border: '1px solid rgba(0,112,243,0.2)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
              style={{ background: 'rgba(0,112,243,0.15)' }}
              aria-hidden="true"
            >
              →
            </div>
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Your next action</p>
              <p className="text-white font-bold mt-0.5">{nextItem}</p>
              <p className="text-white/40 text-xs mt-1">
                {country ? `Complete at ${country.portal}` : 'Visit your official electoral authority'}
                {' · '}⏱ ~5 minutes
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            DESKTOP 3-PANEL GRID
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-5">

          {/* LEFT — Readiness Score */}
          <div
            className="rounded-2xl p-6 flex flex-col gap-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-white font-bold text-base">Voter Readiness</h2>
            <div className="flex flex-col items-center gap-4">
              <ReadinessMeter score={totalScore} size="lg" />
              <p className="text-white/40 text-xs text-center">
                {totalScore === 0 ? 'Complete your checklist to build your score'
                  : totalScore === 100 ? '🎉 Fully prepared to vote!'
                  : `${13 - completedRegistrationSteps.length} steps remaining`}
              </p>
            </div>

            {/* Domain mini-bars */}
            <div className="space-y-3">
              {domainScores.map(d => (
                <div key={d.key}>
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <span>{d.icon} {d.label}</span>
                    <span>{d.done}/{d.total}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${d.pct}%`,
                        background: d.pct === 100 ? '#10B981' : d.pct > 0 ? '#0070F3' : 'transparent',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { href: '/register',  icon: '📋', label: 'Register' },
                { href: '/emergency', icon: '🔴', label: 'Emergency' },
                { href: '/simulate',  icon: '🗳️', label: 'Simulate' },
                { href: '/ask',       icon: '🤖', label: 'Ask AI' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-150 hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span aria-hidden="true">{item.icon}</span>{item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CENTER — Checklist */}
          <div
            className="rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-white font-bold text-base">My Checklist</h2>
            <p className="text-white/40 text-xs -mt-2">
              Complete each section to increase your readiness score
            </p>
            <div className="space-y-5">
              {domainScores.map(d => {
                const locked = isDomainLocked(domains.find(x => x.key === d.key)!);
                return (
                  <fieldset key={d.key} disabled={locked}>
                    <legend
                      className="flex items-center gap-2 text-sm font-bold mb-2 w-full"
                      style={{ color: locked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)' }}
                    >
                      <span aria-hidden="true">{d.icon}</span>
                      {d.label}
                      {locked && <span className="ml-auto text-xs font-normal opacity-60">🔒 Complete above first</span>}
                      {!locked && d.done === d.total && d.total > 0 && (
                        <span className="ml-auto text-xs" style={{ color: '#10B981' }}>✓ Done</span>
                      )}
                    </legend>
                    <div className="space-y-2">
                      {d.items.map((item) => {
                        const done = completedSet.has(item.id);
                        return (
                          <label
                            key={item.id}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group"
                            style={{
                              background: done ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                              opacity: locked ? 0.35 : 1,
                              cursor: locked ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={done}
                              onChange={() => !locked && toggleRegistrationStep(item.id)}
                              className="w-4 h-4 rounded accent-green-500 flex-shrink-0"
                              aria-label={item.label}
                              disabled={locked}
                            />
                            <span
                              className="text-sm transition-all duration-150"
                              style={{
                                color: done ? '#6EE7B7' : 'rgba(255,255,255,0.7)',
                                textDecoration: done ? 'line-through' : 'none',
                              }}
                            >
                              {item.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
            </div>
          </div>

          {/* RIGHT — Election Timeline (compact) */}
          <div
            className="rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-base">Election Timeline</h2>
              <Link
                href="/elections"
                className="text-xs font-semibold transition-colors hover:opacity-80"
                style={{ color: '#0070F3' }}
              >
                View full →
              </Link>
            </div>
            {countryCode ? (
              <ElectionTimeline countryCode={countryCode} compact />
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 py-8">
                <span className="text-4xl" aria-hidden="true">🗓️</span>
                <p className="text-white/40 text-sm text-center">
                  Select your country to view the election timeline
                </p>
                <Link
                  href="/onboarding"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-150"
                  style={{ background: 'rgba(0,112,243,0.2)', border: '1px solid rgba(0,112,243,0.3)' }}
                >
                  Set up my country
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            MOBILE — Score + Tabs
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="lg:hidden flex flex-col gap-5">

          {/* Score meter (full width) */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center gap-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ReadinessMeter score={totalScore} size="lg" />
            <div className="w-full space-y-2">
              {domainScores.map(d => (
                <div key={d.key} className="flex items-center gap-3">
                  <span className="text-xs w-20 text-right" style={{ color: 'rgba(255,255,255,0.4)' }}>{d.label}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.pct === 100 ? '#10B981' : '#0070F3' }} />
                  </div>
                  <span className="text-xs w-8" style={{ color: 'rgba(255,255,255,0.4)' }}>{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tab switcher */}
          <div
            className="flex rounded-xl p-1 gap-1"
            style={{ background: 'rgba(255,255,255,0.05)' }}
            role="tablist"
          >
            {(['checklist', 'timeline'] as const).map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-150"
                style={{
                  background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
                }}
              >
                {tab === 'checklist' ? '✅ Checklist' : '🗓️ Timeline'}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          <div role="tabpanel">
            {activeTab === 'checklist' ? (
              <div
                className="rounded-2xl p-5 space-y-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {domainScores.map(d => {
                  const locked = isDomainLocked(domains.find(x => x.key === d.key)!);
                  return (
                    <div key={d.key} className={locked ? 'opacity-30 pointer-events-none' : ''}>
                      <p className="text-white/60 text-xs font-bold uppercase tracking-wide mb-2">
                        {d.icon} {d.label} {locked && '🔒'}
                      </p>
                      <div className="space-y-1.5">
                        {d.items.map((item) => {
                          const done = completedSet.has(item.id);
                          return (
                            <label key={item.id} className="flex items-center gap-3 py-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={done}
                                onChange={() => !locked && toggleRegistrationStep(item.id)}
                                className="w-4 h-4 rounded accent-green-500"
                                disabled={locked}
                              />
                              <span className="text-sm" style={{ color: done ? '#6EE7B7' : 'rgba(255,255,255,0.7)', textDecoration: done ? 'line-through' : 'none' }}>
                                {item.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {countryCode
                  ? <ElectionTimeline countryCode={countryCode} compact />
                  : <p className="text-white/40 text-sm text-center py-8">Select your country first</p>
                }
              </div>
            )}
          </div>

          {/* Mobile quick links */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/register',  icon: '📋', label: 'Register to Vote' },
              { href: '/emergency', icon: '🔴', label: 'Emergency Help'   },
              { href: '/simulate',  icon: '🗳️', label: 'Simulate Vote'    },
              { href: '/ask',       icon: '🤖', label: 'Ask ELECTRA'      },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-4 py-4 rounded-2xl text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-xl" aria-hidden="true">{item.icon}</span>{item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
