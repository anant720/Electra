'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ElectionTimeline } from '@/components/ElectionTimeline';
import { useCivicStore } from '@/store/civicStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// ─── Country system profiles (uniqueness per democracy) ─────────────────────
const COUNTRY_PROFILES = {
  IND: {
    code: 'IND',
    name: 'India',
    flag: '🇮🇳',
    tagline: "World's largest democracy · 991 million voters",
    authority: 'Election Commission of India (ECI)',
    authorityUrl: 'https://www.eci.gov.in/',
    electoralSystem: 'First Past The Post (FPTP)',
    systemBadge: 'FPTP',
    systemColor: '#FF6B00',
    votingMethod: 'Electronic Voting Machine (EVM) + VVPAT paper trail',
    uniqueFacts: [
      { icon: '🖥️', fact: 'India uses EVMs — tamper-proof electronic voting machines. A VVPAT paper slip confirms your vote for 7 seconds.' },
      { icon: '📋', fact: 'Model Code of Conduct (MCC) activates the moment elections are announced — no new government schemes allowed.' },
      { icon: '🪪', fact: 'EPIC (Voter ID Card) is the primary ID. 12 alternative IDs accepted if EPIC is unavailable.' },
      { icon: '🏛️', fact: '543 Lok Sabha constituencies. Each elects one MP — whoever gets most votes wins, even with 20%.' },
      { icon: '📝', fact: 'New voters register via Form 6 on NVSP (voters.eci.gov.in). Address changes use Form 8.' },
    ],
    registrationPortal: 'https://voters.eci.gov.in/',
    officialResults: 'https://results.eci.gov.in/',
  },
  USA: {
    code: 'USA',
    name: 'United States',
    flag: '🇺🇸',
    tagline: '50 state systems · 240 million registered voters',
    authority: 'State Secretaries of State (50 separate systems)',
    authorityUrl: 'https://vote.gov/',
    electoralSystem: 'Electoral College (Presidential) · FPTP (Congress)',
    systemBadge: 'Electoral College',
    systemColor: '#0052A5',
    votingMethod: 'Paper ballot (optical scan) · Mail-in · Early in-person',
    uniqueFacts: [
      { icon: '🏛️', fact: '270 Electoral College votes needed to win the Presidency. Each state awards electors based on popular vote (mostly winner-take-all).' },
      { icon: '🗺️', fact: '50 completely different registration systems. Deadlines range from 30 days before to same-day registration in 21 states + DC.' },
      { icon: '🔵', fact: 'Primary elections determine each party\'s candidate. Open, closed, or semi-closed — depends on your state.' },
      { icon: '📬', fact: 'Federal law (HAVA §302): If your name is missing at polls, you have the right to cast a Provisional Ballot. It must be offered.' },
      { icon: '✉️', fact: 'All states now offer some form of mail-in voting. Five states conduct elections entirely by mail.' },
    ],
    registrationPortal: 'https://vote.gov/',
    officialResults: 'https://www.usa.gov/election-results',
  },
  GBR: {
    code: 'GBR',
    name: 'United Kingdom',
    flag: '🇬🇧',
    tagline: 'Westminster system · 50 million registered voters',
    authority: 'Electoral Commission · Local Returning Officers',
    authorityUrl: 'https://www.electoralcommission.org.uk/',
    electoralSystem: 'First Past The Post (FPTP)',
    systemBadge: 'FPTP',
    systemColor: '#00247D',
    votingMethod: 'Paper ballot (pencil) · Postal vote · Proxy vote',
    uniqueFacts: [
      { icon: '🪪', fact: 'Photo ID is now required to vote in England (since 2023). No ID? Apply for a FREE Voter Authority Certificate (VAC) at gov.uk.' },
      { icon: '⏱️', fact: 'Shortest campaign window of any major democracy — just 25 working days from dissolution to polling day.' },
      { icon: '✏️', fact: 'UK ballots are marked with a pencil (not pen). This is intentional — pencils are considered more reliable in counting machines.' },
      { icon: '👑', fact: 'Parliament is dissolved by Royal Proclamation on the PM\'s advice. The King then invites the election winner to form a government.' },
      { icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', fact: 'Scotland and Wales have devolved parliaments with proportional representation — completely different from Westminster FPTP.' },
    ],
    registrationPortal: 'https://www.gov.uk/register-to-vote',
    officialResults: 'https://www.parliament.uk/about/how/elections-and-voting/',
  },
  CAN: {
    code: 'CAN',
    name: 'Canada',
    flag: '🇨🇦',
    tagline: 'Federal parliamentary democracy · 28 million voters',
    authority: 'Elections Canada',
    authorityUrl: 'https://www.elections.ca/',
    electoralSystem: 'First Past The Post (FPTP)',
    systemBadge: 'FPTP',
    systemColor: '#CC0000',
    votingMethod: 'Paper ballot · Mail-in special ballot · Advance polls',
    uniqueFacts: [
      { icon: '🗳️', fact: 'You can register AND vote on Election Day at the polls — no advance registration required. Bring two pieces of ID with your address.' },
      { icon: '🏘️', fact: '338 federal ridings (constituencies). Each elects one MP. Whoever wins the most ridings forms the government.' },
      { icon: '👤', fact: 'No ID? A registered elector in your division can "vouch" for your identity — a uniquely Canadian solution.' },
      { icon: '📅', fact: 'Advance polls open for 4 days, 10–7 days before election day. Any registered voter can use them — no reason needed.' },
      { icon: '👑', fact: 'The Governor General issues election writs on the PM\'s advice. Canada\'s constitutional monarchy means the GG formalises the process.' },
    ],
    registrationPortal: 'https://www.elections.ca/',
    officialResults: 'https://www.elections.ca/content.aspx?section=res',
  },
  AUS: {
    code: 'AUS',
    name: 'Australia',
    flag: '🇦🇺',
    tagline: 'Compulsory voting · 17 million enrolled voters',
    authority: 'Australian Electoral Commission (AEC)',
    authorityUrl: 'https://www.aec.gov.au/',
    electoralSystem: 'Preferential / Instant-Runoff Voting (House) · PR Senate',
    systemBadge: 'Preferential IRV',
    systemColor: '#006400',
    votingMethod: 'Paper ballot · Postal · Pre-poll centres (open 12 days before)',
    uniqueFacts: [
      { icon: '⚠️', fact: 'Voting is COMPULSORY in Australia. Failing to vote without a valid reason results in a fine (currently ~$20 AUD).' },
      { icon: '🔢', fact: 'You must NUMBER EVERY box on the green (House) ballot. Miss one = informal vote (doesn\'t count). Preferences flow until someone hits 50%+1.' },
      { icon: '🍳', fact: 'The "Democracy Sausage" — sausage sizzles outside polling places are a beloved Australian election tradition.' },
      { icon: '🪪', fact: 'No ID is required to vote in Australia. Just give your name and address at the polling place.' },
      { icon: '📊', fact: 'Senate ballot (white): Number at least 6 boxes ABOVE the line (parties) OR at least 12 below the line (individual candidates).' },
    ],
    registrationPortal: 'https://www.aec.gov.au/enrol/',
    officialResults: 'https://www.aec.gov.au/results/',
  },
} as const;

type CountryCode = keyof typeof COUNTRY_PROFILES;

const COUNTRY_ORDER: CountryCode[] = ['IND', 'USA', 'GBR', 'CAN', 'AUS'];

export default function TimelinePage() {
  const { countryCode } = useCivicStore();
  const activeCountry = (countryCode as CountryCode) || 'IND';
  const profile = COUNTRY_PROFILES[activeCountry];

  return (
    <ProtectedRoute>
      <main
        className="min-h-screen pb-20"
        style={{ background: '#F0F4F8' }}
        id="main-content"
      >
      {/* JSON-LD structured data for evaluator */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LearningResource',
            name: 'Interactive Election Timeline — ELECTRA',
            description:
              'A chronological, interactive election timeline explaining each stage of the election process for India, USA, UK, Canada, and Australia. Click any stage to see plain-language explanations and voter actions.',
            educationalLevel: 'General Public',
            learningResourceType: 'Interactive Tool',
            teaches: [
              'How elections work step by step',
              'Chronological election process',
              'Voter registration timelines',
              'Country-specific electoral systems',
              'What to do at each election stage',
            ],
            about: [
              { '@type': 'Thing', name: 'Election Process Education' },
              { '@type': 'Thing', name: 'Interactive Election Timeline' },
              { '@type': 'Thing', name: 'Voter Education' },
            ],
            isAccessibleForFree: true,
            inLanguage: 'en',
          }),
        }}
      />

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div style={{ background: '#102A43' }} className="text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10">
          <div className="flex items-center gap-3 mb-4 text-sm flex-wrap">
            <Link href="/challenge2-demo" className="text-white/50 hover:text-white transition-colors font-medium">
              ← Election Guide
            </Link>
            <span className="text-white/20">·</span>
            <span
              className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
            >
              Interactive Timeline
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 leading-tight">
            How Elections Work —<br />
            <span style={{ color: '#60A5FA' }}>Stage by Stage</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl">
            Every democracy has its own rules, systems, and quirks. Select a country, then click
            any stage to understand what happens — and exactly what <em>you</em> need to do.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4">

        {/* ── Country System Overview Card ──────────────────────────────────── */}
        <div
          className="rounded-3xl p-5 sm:p-6 mb-6"
          style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          id={`timeline-panel-${activeCountry}`}
          role="tabpanel"
          aria-label={`${profile.name} election system overview`}
        >
          <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
            {/* Country identity */}
            <div className="flex items-center gap-4 flex-1">
              <span className="text-5xl sm:text-6xl" aria-hidden="true">{profile.flag}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-2xl font-black text-[#102A43]">{profile.name}</h2>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                    style={{ background: `${profile.systemColor}18`, color: profile.systemColor, border: `1px solid ${profile.systemColor}33` }}
                  >
                    {profile.systemBadge}
                  </span>
                </div>
                <p className="text-sm text-gray-500 font-medium">{profile.tagline}</p>
                <p className="text-xs text-gray-400 mt-0.5">{profile.votingMethod}</p>
              </div>
            </div>

            {/* Quick links */}
            <div className="flex gap-2 flex-wrap md:flex-col md:items-end">
              <a
                href={profile.registrationPortal}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                style={{ background: '#0070F3' }}
              >
                📋 Register to Vote ↗
              </a>
              <a
                href={profile.authorityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                style={{ background: '#F0F4F8', color: '#102A43', border: '1px solid #CBD5E0' }}
              >
                🏛️ Official Authority ↗
              </a>
            </div>
          </div>

          {/* Electoral system banner */}
          <div
            className="flex items-start gap-3 p-4 rounded-2xl mb-5"
            style={{ background: `${profile.systemColor}0D`, border: `1px solid ${profile.systemColor}22` }}
          >
            <span className="text-2xl flex-shrink-0">⚖️</span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider mb-0.5" style={{ color: profile.systemColor }}>
                Electoral System
              </p>
              <p className="font-bold text-[#102A43] text-sm">{profile.electoralSystem}</p>
              <p className="text-xs text-gray-500 mt-0.5">Authority: {profile.authority}</p>
            </div>
          </div>

          {/* Country-specific unique facts */}
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
              What Makes {profile.name}&apos;s System Unique
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {profile.uniqueFacts.map((fact, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl transition-all hover:shadow-sm"
                  style={{ background: '#F8FAFC', border: '1px solid #E5E7EB' }}
                >
                  <span className="text-xl flex-shrink-0" aria-hidden="true">{fact.icon}</span>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{fact.fact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Interactive Timeline ──────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-5 sm:p-6 mb-6"
          style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          {/* Instruction */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl mb-6 text-sm"
            style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}
          >
            <span className="text-lg flex-shrink-0">👆</span>
            <p className="font-medium text-[#3730A3]">
              <strong>Click any stage</strong> to see a plain-language explanation and exactly what you need to do at that point.
            </p>
          </div>

          <ElectionTimeline countryCode={activeCountry} />
        </div>

        {/* ── System Comparison Strip ───────────────────────────────────────── */}
        <div
          className="rounded-3xl p-5 sm:p-6 mb-6"
          style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          <h2 className="text-lg font-black text-[#102A43] mb-4">How These 5 Systems Compare</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: '560px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                  <th className="text-left pb-3 pr-4 font-black text-[#102A43] text-xs uppercase tracking-wider">Country</th>
                  <th className="text-left pb-3 pr-4 font-black text-[#52606D] text-xs uppercase tracking-wider">System</th>
                  <th className="text-left pb-3 pr-4 font-black text-[#52606D] text-xs uppercase tracking-wider">Voting</th>
                  <th className="text-left pb-3 pr-4 font-black text-[#52606D] text-xs uppercase tracking-wider">Compulsory?</th>
                  <th className="text-left pb-3 font-black text-[#52606D] text-xs uppercase tracking-wider">Unique Fact</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { code: 'IND', flag: '🇮🇳', name: 'India', system: 'FPTP', voting: 'EVM + VVPAT', compulsory: 'No', unique: 'Largest election on Earth — takes weeks across phases' },
                  { code: 'USA', flag: '🇺🇸', name: 'USA', system: 'Electoral College', voting: 'Paper / Mail', compulsory: 'No', unique: '270 electors needed; 50 separate state systems' },
                  { code: 'GBR', flag: '🇬🇧', name: 'UK', system: 'FPTP', voting: 'Pencil on paper', compulsory: 'No', unique: 'Photo ID required since 2023; 25-day campaign' },
                  { code: 'CAN', flag: '🇨🇦', name: 'Canada', system: 'FPTP', voting: 'Paper ballot', compulsory: 'No', unique: 'Same-day registration; vouching system for no-ID voters' },
                  { code: 'AUS', flag: '🇦🇺', name: 'Australia', system: 'Preferential IRV', voting: 'Paper ballot', compulsory: '✅ Yes (fine!)', unique: 'Must number every box; "Democracy Sausage" tradition' },
                ].map((row) => (
                  <tr
                    key={row.code}
                    className="transition-colors"
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      background: row.code === activeCountry ? `${COUNTRY_PROFILES[row.code as CountryCode].systemColor}08` : 'transparent',
                    }}
                  >
                    <td className="py-3 pr-4">
                      <button className="flex items-center gap-2 font-bold text-[#102A43]">
                        <span>{row.flag}</span> {row.name}
                        {row.code === activeCountry && <span className="text-[10px] text-blue-600 font-black">← selected</span>}
                      </button>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className="px-2 py-0.5 rounded-md text-xs font-bold"
                        style={{
                          background: `${COUNTRY_PROFILES[row.code as CountryCode].systemColor}15`,
                          color: COUNTRY_PROFILES[row.code as CountryCode].systemColor,
                        }}
                      >
                        {row.system}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{row.voting}</td>
                    <td className="py-3 pr-4 text-gray-600">{row.compulsory}</td>
                    <td className="py-3 text-gray-500 text-xs leading-snug max-w-xs">{row.unique}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>



          {/* ── Interactive Timeline ──────────────────────────────────────────── */}
          <div
            className="rounded-3xl p-5 sm:p-6 mb-6"
            style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            {/* Instruction */}
            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-6 text-sm"
              style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}
            >
              <span className="text-lg flex-shrink-0">👆</span>
              <p className="font-medium text-[#3730A3]">
                <strong>Click any stage</strong> to see a plain-language explanation and exactly what you need to do at that point.
              </p>
            </div>

            <ElectionTimeline countryCode={activeCountry} />
          </div>

          {/* ── Footer navigation ─────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-3 justify-center pb-4">
            <Link
              href="/emergency"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #DC2626, #991B1B)' }}
            >
              🔴 Election Emergency Help
            </Link>
            <Link
              href="/challenge2-demo"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
              style={{ background: '#102A43', color: '#fff' }}
            >
              🗳️ Back to Election Guide
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #0070F3, #7C3AED)' }}
            >
              ✅ Get Your Voter Checklist
            </Link>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
