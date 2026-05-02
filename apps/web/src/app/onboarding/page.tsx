'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCivicStore } from '@/store/civicStore';
import { useAuthStore } from '@/store/authStore';
import { STATES_BY_COUNTRY } from '@/data/jurisdictions';
import type { CountryCode, PersonaCode } from '@electra/types';

// ─── User Profile ─────────────────────────────────────────────────────────────
type UserProfile = {
  fullName: string;
  dob: string; // YYYY-MM-DD
};

// ─── Country Data ─────────────────────────────────────────────────────────────
const COUNTRIES: Array<{
  code: CountryCode;
  name: string;
  flag: string;
  tagline: string;
  voters: string;
  authority: string;
  system: string;
  compulsory: boolean;
}> = [
  {
    code: 'IND', name: 'India', flag: '🇮🇳',
    tagline: "World's largest democracy",
    voters: '991M voters',
    authority: 'Election Commission of India (ECI)',
    system: 'First Past the Post · EVM + VVPAT',
    compulsory: false,
  },
  {
    code: 'USA', name: 'United States', flag: '🇺🇸',
    tagline: '50 states, one vote',
    voters: '240M voters',
    authority: 'State Secretaries of State',
    system: 'FPTP · Electoral College',
    compulsory: false,
  },
  {
    code: 'GBR', name: 'United Kingdom', flag: '🇬🇧',
    tagline: 'Westminster parliamentary system',
    voters: '50M voters',
    authority: 'Electoral Commission',
    system: 'First Past the Post · Photo ID required',
    compulsory: false,
  },
  {
    code: 'CAN', name: 'Canada', flag: '🇨🇦',
    tagline: 'Federal parliamentary democracy',
    voters: '28M voters',
    authority: 'Elections Canada',
    system: 'First Past the Post · Same-day registration',
    compulsory: false,
  },
  {
    code: 'AUS', name: 'Australia', flag: '🇦🇺',
    tagline: 'Voting is compulsory by law',
    voters: '17M voters',
    authority: 'Australian Electoral Commission (AEC)',
    system: 'Instant-Runoff · Compulsory ($20 fine)',
    compulsory: true,
  },
];

// ─── Country-specific persona definitions ─────────────────────────────────────
type PersonaDef = {
  code: PersonaCode;
  icon: string;
  label: string;
  description: string;
  badge?: string;
};

const PERSONAS_BY_COUNTRY: Record<CountryCode, PersonaDef[]> = {
  IND: [
    {
      code: 'P01', icon: '🗳️', label: 'First-Time Voter',
      description: 'Turning 18 or voting for the first time. Need to register via Form 6 on NVSP.',
      badge: 'Most common',
    },
    {
      code: 'P02', icon: '🎓', label: 'Student / Relocated',
      description: 'Studying or working away from your home constituency. Form 8 for address change.',
    },
    {
      code: 'P03', icon: '✈️', label: 'NRI / Overseas Indian',
      description: 'Living abroad and want to vote. Requires Form 6A and physical presence in constituency.',
    },
    {
      code: 'P04', icon: '👴', label: 'Senior Voter (60+)',
      description: 'Need simpler guidance, home voting options, or assisted voting at the booth.',
    },
    {
      code: 'P05', icon: '♿', label: 'Person with Disability (PwD)',
      description: 'Need accessible booth info, wheelchair access, Braille ballot, or companion assistance.',
    },
    {
      code: 'P06', icon: '🚨', label: 'Election Day Emergency',
      description: 'Polling day crisis — lost Voter ID, name missing from list, wrong booth.',
      badge: 'Urgent',
    },
  ],
  USA: [
    {
      code: 'P01', icon: '🗳️', label: 'First-Time Voter',
      description: 'Never voted before. Need to register at your state portal and find your polling place.',
      badge: 'Most common',
    },
    {
      code: 'P02', icon: '🎓', label: 'College Student',
      description: 'Studying in a different state. Decide whether to vote at home or university address.',
    },
    {
      code: 'P03', icon: '✈️', label: 'Military / Overseas Citizen',
      description: 'Serving abroad or living overseas. Use UOCAVA — FPCA form for absentee ballot.',
    },
    {
      code: 'P04', icon: '👴', label: 'Senior Voter (65+)',
      description: 'Need guidance on absentee / mail-in voting or accessible polling station options.',
    },
    {
      code: 'P05', icon: '♿', label: 'Voter with Disability',
      description: 'ADA rights at polling places — curbside voting, accessible machines, or companion.',
    },
    {
      code: 'P06', icon: '🚨', label: 'Election Day Emergency',
      description: 'Name not on list, no ID, wrong precinct — request a provisional ballot immediately.',
      badge: 'Urgent',
    },
  ],
  GBR: [
    {
      code: 'P01', icon: '🗳️', label: 'First-Time Voter',
      description: 'Voting for the first time. Register at gov.uk/register-to-vote before the deadline.',
      badge: 'Most common',
    },
    {
      code: 'P02', icon: '🎓', label: 'Student / New Address',
      description: 'At university or recently moved. You can register at both addresses — vote at one.',
    },
    {
      code: 'P03', icon: '✈️', label: 'British Citizen Abroad',
      description: 'Living overseas. Register as an overseas voter and request a postal or proxy ballot.',
    },
    {
      code: 'P04', icon: '👴', label: 'Senior Voter',
      description: 'Need postal vote guidance, accessible polling stations, or tactile voting devices.',
    },
    {
      code: 'P05', icon: '♿', label: 'Voter with Disability',
      description: 'All polling stations must be accessible. Request tactile device or postal vote.',
    },
    {
      code: 'P06', icon: '🚨', label: 'Election Day Emergency',
      description: 'No Voter Authority Certificate (VAC), wrong polling station, or accessibility issue.',
      badge: 'Urgent',
    },
  ],
  CAN: [
    {
      code: 'P01', icon: '🗳️', label: 'First-Time Voter',
      description: 'New to voting. You can register on Election Day at the polling station with ID.',
      badge: 'Most common',
    },
    {
      code: 'P02', icon: '🎓', label: 'Student / Recently Moved',
      description: 'Vote where you currently live. You can update your address at the polls on election day.',
    },
    {
      code: 'P03', icon: '✈️', label: 'Canadian Abroad',
      description: 'Living outside Canada. Register as an international voter at elections.ca.',
    },
    {
      code: 'P04', icon: '👴', label: 'Senior Voter',
      description: 'Need help with mail-in voting, special ballot, or accessible polling location.',
    },
    {
      code: 'P05', icon: '♿', label: 'Voter with Disability',
      description: 'Request priority service, transfer certificate, or have a helper assist you.',
    },
    {
      code: 'P06', icon: '🚨', label: 'Election Day Emergency',
      description: 'Name not on list? No ID? A registered voter in your division can vouch for you.',
      badge: 'Urgent',
    },
  ],
  AUS: [
    {
      code: 'P01', icon: '🗳️', label: 'First-Time Voter',
      description: 'Voting is compulsory in Australia. Enrol at aec.gov.au before the rolls close.',
      badge: 'Compulsory',
    },
    {
      code: 'P02', icon: '🎓', label: 'Student / Recently Moved',
      description: 'Update your enrolment online. You can cast an "absent vote" outside your division.',
    },
    {
      code: 'P03', icon: '✈️', label: 'Australian Abroad',
      description: 'Enrol as an overseas voter. Apply for a postal vote or vote at an Australian mission.',
    },
    {
      code: 'P04', icon: '👴', label: 'Senior Voter',
      description: 'Apply for a postal vote or use mobile polling teams that come to aged care homes.',
    },
    {
      code: 'P05', icon: '♿', label: 'Voter with Disability',
      description: 'Mobile polling, curbside voting, large-print ballots, and Braille guides available.',
    },
    {
      code: 'P06', icon: '🚨', label: 'Election Day Emergency',
      description: 'Not on the roll? Request a Declaration Vote at any polling place — no ID required.',
      badge: 'Urgent',
    },
  ],
};

// ─── Badge colours ────────────────────────────────────────────────────────────
const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  'Most common': { bg: 'rgba(0,200,100,0.2)', color: '#00C864' },
  'Compulsory':  { bg: 'rgba(255,170,0,0.2)', color: '#FFAA00' },
  'Urgent':      { bg: 'rgba(220,50,50,0.2)',  color: '#FF4444' },
};

import { Suspense } from 'react';

// ─── Component ────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-[#0B1E2D]">
        <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-[#0070F3] animate-spin" />
      </main>
    }>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCountry, setPersona, setState, countryCode } = useCivicStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<PersonaCode | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({ fullName: '', dob: '' });
  const [profileErrors, setProfileErrors] = useState<Partial<UserProfile>>({});
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  useEffect(() => {
    if (searchParams.get('step') === '2' || countryCode) {
      setStep(2);
      if (countryCode) setSelectedCountry(countryCode);
    }
  }, [searchParams, countryCode]);

  function handleCountrySelect(code: CountryCode) {
    setSelectedCountry(code);
    setCountry(code);
    setTimeout(() => setStep(2), 250);
  }

  function handlePersonaSelect(code: PersonaCode) {
    setSelectedPersona(code);
    setPersona(code);
    if (code === 'P06') {
      completeOnboarding();
      router.push('/emergency');
    } else {
      setStep(3);
    }
  }

  function validateProfile(): boolean {
    const errors: Partial<UserProfile> = {};
    if (!profile.fullName.trim() || profile.fullName.trim().length < 2)
      errors.fullName = 'Please enter your full name (min 2 characters)';
    if (!profile.dob)
      errors.dob = 'Please enter your date of birth';
    else {
      const age = Math.floor((Date.now() - new Date(profile.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      if (age < 17) errors.dob = 'You must be at least 17 years old to use ELECTRA';
      if (age > 120) errors.dob = 'Please enter a valid date of birth';
    }
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleProfileSubmit() {
    if (!validateProfile()) return;
    // Persist name to localStorage so dashboard can display it
    localStorage.setItem('electra-user-name', profile.fullName.trim());
    localStorage.setItem('electra-user-dob', profile.dob);
    setStep(4);
  }

  function handleStateSelect(state: string) {
    setSelectedState(state);
    setState(state);
    completeOnboarding();
    router.push(isAuthenticated ? '/dashboard' : '/auth/signup');
  }

  function getAge(): number | null {
    if (!profile.dob) return null;
    return Math.floor((Date.now() - new Date(profile.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  }

  const currentCountry = COUNTRIES.find((c) => c.code === selectedCountry);
  const personas = selectedCountry ? PERSONAS_BY_COUNTRY[selectedCountry] : [];

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #0B1F33 0%, #102A43 60%, #0D2137 100%)' }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2 mb-10">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: 'linear-gradient(135deg, #0070F3, #102A43)' }}
        >
          <span className="text-lg font-black text-white">E</span>
        </div>
        <span className="text-xl font-extrabold tracking-tight text-white">ELECTRA</span>
      </div>

      {/* ── Progress bar ── */}
      <div className="flex items-center gap-3 mb-10">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300"
              style={{
                background: step >= s ? '#0070F3' : 'rgba(255,255,255,0.12)',
                color: step >= s ? '#fff' : 'rgba(255,255,255,0.4)',
                boxShadow: step === s ? '0 0 0 3px rgba(0,112,243,0.3)' : 'none',
              }}
            >
              {step > s ? '✓' : s}
            </div>
            {s < 4 && (
              <div
                className="w-12 h-1.5 rounded-full transition-all duration-500"
                style={{ background: step > s ? '#0070F3' : 'rgba(255,255,255,0.15)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          STEP 1 — Country Selection
      ════════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <section className="w-full max-w-2xl" aria-labelledby="country-heading">
          <h1 id="country-heading" className="text-3xl font-extrabold text-white text-center tracking-tight mb-2">
            Which country are you voting in?
          </h1>
          <p className="text-white/50 text-center mb-8 text-sm">
            ELECTRA provides verified, official civic guidance for these 5 democracies.
          </p>

          <div className="flex flex-col gap-3" role="radiogroup" aria-label="Select your country">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                role="radio"
                aria-checked={selectedCountry === c.code}
                onClick={() => handleCountrySelect(c.code)}
                onMouseEnter={() => setHovered(c.code)}
                onMouseLeave={() => setHovered(null)}
                className="flex items-center gap-4 w-full p-4 rounded-2xl border-2 text-left transition-all duration-200"
                style={{
                  background: selectedCountry === c.code
                    ? 'rgba(0,112,243,0.18)'
                    : hovered === c.code
                    ? 'rgba(255,255,255,0.07)'
                    : 'rgba(255,255,255,0.04)',
                  borderColor: selectedCountry === c.code
                    ? '#0070F3'
                    : hovered === c.code
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(255,255,255,0.08)',
                  transform: hovered === c.code ? 'translateX(4px)' : 'none',
                }}
              >
                <span className="text-4xl" aria-hidden="true">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-base">{c.name}</span>
                    {c.compulsory && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(255,170,0,0.15)', color: '#FFAA00' }}>
                        Compulsory voting
                      </span>
                    )}
                  </div>
                  <div className="text-white/50 text-xs mt-0.5">{c.voters} · {c.authority}</div>
                  <div className="text-white/30 text-xs mt-0.5">{c.system}</div>
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200"
                  style={{
                    borderColor: selectedCountry === c.code ? '#0070F3' : 'rgba(255,255,255,0.2)',
                    background: selectedCountry === c.code ? '#0070F3' : 'transparent',
                  }}
                >
                  {selectedCountry === c.code && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════
          STEP 2 — Persona Selection (country-specific)
      ════════════════════════════════════════════════════════════════ */}
      {step === 2 && selectedCountry && (
        <section className="w-full max-w-2xl" aria-labelledby="persona-heading">
          {/* Back + country context */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm transition-colors"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              aria-label="Go back to country selection"
            >
              ← Change country
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(0,112,243,0.15)', border: '1px solid rgba(0,112,243,0.3)' }}>
              <span className="text-lg">{currentCountry?.flag}</span>
              <span className="text-white/80 text-sm font-semibold">{currentCountry?.name}</span>
            </div>
          </div>

          <h1 id="persona-heading" className="text-3xl font-extrabold text-white text-center tracking-tight mb-2">
            Which best describes you?
          </h1>
          <p className="text-white/50 text-center mb-8 text-sm">
            ELECTRA adapts its guidance to your situation. This is never shared or stored externally.
          </p>

          <div className="flex flex-col gap-3" role="radiogroup" aria-label="Select your voter profile">
            {personas.map((p) => (
              <button
                key={p.code}
                role="radio"
                aria-checked={false}
                onClick={() => handlePersonaSelect(p.code)}
                onMouseEnter={() => setHovered(p.code)}
                onMouseLeave={() => setHovered(null)}
                className="flex items-start gap-4 w-full p-4 rounded-2xl border-2 text-left transition-all duration-200"
                style={{
                  background: p.code === 'P06'
                    ? hovered === p.code ? 'rgba(220,50,50,0.15)' : 'rgba(220,50,50,0.08)'
                    : hovered === p.code ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                  borderColor: p.code === 'P06'
                    ? hovered === p.code ? 'rgba(220,50,50,0.6)' : 'rgba(220,50,50,0.3)'
                    : hovered === p.code ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                  transform: hovered === p.code ? 'translateX(4px)' : 'none',
                }}
              >
                <span
                  className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl"
                  style={{
                    background: p.code === 'P06' ? 'rgba(220,50,50,0.2)' : 'rgba(255,255,255,0.08)',
                  }}
                  aria-hidden="true"
                >
                  {p.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-sm">{p.label}</span>
                    {p.badge && BADGE_STYLES[p.badge as keyof typeof BADGE_STYLES] && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          background: BADGE_STYLES[p.badge as keyof typeof BADGE_STYLES]!.bg,
                          color: BADGE_STYLES[p.badge as keyof typeof BADGE_STYLES]!.color,
                        }}
                      >
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-xs mt-1 leading-relaxed">{p.description}</p>
                </div>
                <svg
                  className="w-4 h-4 flex-shrink-0 mt-1 transition-all duration-200"
                  style={{ color: hovered === p.code ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════
          STEP 3 — Personal Details
      ════════════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <section className="w-full max-w-md" aria-labelledby="profile-heading">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 text-sm transition-colors"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
              ← Back
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(0,112,243,0.15)', border: '1px solid rgba(0,112,243,0.3)' }}>
              <span className="text-lg">{COUNTRIES.find(c => c.code === selectedCountry)?.flag}</span>
              <span className="text-white/80 text-sm font-semibold">{selectedPersona}</span>
            </div>
          </div>

          <h1 id="profile-heading" className="text-3xl font-extrabold text-white text-center tracking-tight mb-2">
            Tell us about yourself
          </h1>
          <p className="text-white/50 text-center mb-8 text-sm">
            This helps ELECTRA personalise your civic checklist. Stored only on your device.
          </p>

          <div className="flex flex-col gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="text-white/70 text-sm font-semibold">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="e.g. Anant Sharma"
                value={profile.fullName}
                onChange={(e) => setProfile(p => ({ ...p, fullName: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/30 outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: profileErrors.fullName ? '2px solid #FF4444' : '2px solid rgba(255,255,255,0.12)',
                }}
                onFocus={(e) => !profileErrors.fullName && (e.currentTarget.style.borderColor = '#0070F3')}
                onBlur={(e) => !profileErrors.fullName && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              {profileErrors.fullName && (
                <p className="text-xs" style={{ color: '#FF4444' }}>{profileErrors.fullName}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col gap-2">
              <label htmlFor="dob" className="text-white/70 text-sm font-semibold">
                Date of Birth
              </label>
              <input
                id="dob"
                type="date"
                value={profile.dob}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setProfile(p => ({ ...p, dob: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: profileErrors.dob ? '2px solid #FF4444' : '2px solid rgba(255,255,255,0.12)',
                  colorScheme: 'dark',
                }}
                onFocus={(e) => !profileErrors.dob && (e.currentTarget.style.borderColor = '#0070F3')}
                onBlur={(e) => !profileErrors.dob && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              {profileErrors.dob && (
                <p className="text-xs" style={{ color: '#FF4444' }}>{profileErrors.dob}</p>
              )}
              {/* Live age display */}
              {profile.dob && !profileErrors.dob && getAge() !== null && (
                <p className="text-xs" style={{ color: '#00C864' }}>
                  Age: {getAge()} years old
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleProfileSubmit}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm tracking-wide transition-all duration-200 mt-2"
              style={{
                background: 'linear-gradient(135deg, #0070F3, #0050CC)',
                boxShadow: '0 4px 20px rgba(0,112,243,0.4)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              Go to My Dashboard →
            </button>

            <p className="text-white/25 text-xs text-center">
              Your personal data never leaves your device. We do not store name or DOB on our servers.
            </p>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════
          STEP 4 — State/Province Selection
      ════════════════════════════════════════════════════════════════ */}
      {step === 4 && selectedCountry && (
        <section className="w-full max-w-2xl" aria-labelledby="state-heading">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1 text-sm transition-colors text-white/50 hover:text-white"
            >
              ← Back
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0070F3]/15 border border-[#0070F3]/30">
              <span className="text-lg">{currentCountry?.flag}</span>
              <span className="text-white/80 text-sm font-semibold">{currentCountry?.name}</span>
            </div>
          </div>

          <h1 id="state-heading" className="text-3xl font-extrabold text-white text-center tracking-tight mb-2">
            Where do you vote?
          </h1>
          <p className="text-white/50 text-center mb-8 text-sm">
            Electoral laws vary significantly by state. Select yours for accurate guidance.
          </p>

          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search state or province..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#0070F3] transition-all"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20">
              🔍
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {STATES_BY_COUNTRY[selectedCountry]
              .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((state) => (
                <button
                  key={state}
                  onClick={() => handleStateSelect(state)}
                  className="flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all duration-200"
                  style={{
                    background: selectedState === state ? 'rgba(0,112,243,0.15)' : 'rgba(255,255,255,0.04)',
                    borderColor: selectedState === state ? '#0070F3' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <span className="text-white font-semibold text-sm">{state}</span>
                  {selectedState === state && <span className="text-[#0070F3]">✓</span>}
                </button>
              ))}
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <p className="text-white/25 text-xs text-center mt-10 max-w-md">
        ELECTRA provides civic guidance, not legal advice.
        Always verify deadlines at your official electoral authority.
      </p>
    </main>
  );
}
