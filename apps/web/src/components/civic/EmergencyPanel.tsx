'use client';

import { useState } from 'react';
import { useCivicStore } from '@/store/civicStore';
import { useEmergencyStore } from '@/store/emergencyStore';
import { CountryCode, TroubleshootingScenario } from '@electra/types';
import { COUNTRY_METADATA } from '@electra/types';
import { PhoneIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

// ─── Scenario Labels ──────────────────────────────────────────────────────────
const SCENARIO_LABELS: Record<TroubleshootingScenario, { label: string; icon: string }> = {
  T01: { label: "My name isn't on the voter list", icon: '📋' },
  T02: { label: "I've lost my Voter ID", icon: '🪪' },
  T03: { label: 'I moved to a new address', icon: '🏠' },
  T04: { label: "I can't find my polling station", icon: '📍' },
  T05: { label: 'I need accessibility assistance', icon: '♿' },
  T06: { label: 'Technical problem at the booth', icon: '⚙️' },
};

// ─── Country display ──────────────────────────────────────────────────────────
const COUNTRY_DISPLAY: Record<CountryCode, { name: string; flag: string }> = {
  IND: { name: 'India', flag: '🇮🇳' },
  USA: { name: 'United States', flag: '🇺🇸' },
  GBR: { name: 'United Kingdom', flag: '🇬🇧' },
  CAN: { name: 'Canada', flag: '🇨🇦' },
  AUS: { name: 'Australia', flag: '🇦🇺' },
};

// ─── Hardcoded fallback steps (always available, API is bonus) ────────────────
type StepData = { step: number; title: string; action: string };
type ScenarioMap = Partial<Record<TroubleshootingScenario, StepData[]>>;

const FALLBACK_STEPS: Record<CountryCode, ScenarioMap> = {
  IND: {
    T01: [
      { step: 1, title: 'Stay calm and ask the Presiding Officer', action: 'Approach the Presiding Officer at your polling booth and request a check of the supplementary voter list (Form 7/9).' },
      { step: 2, title: 'Show your Aadhaar or alternate ID', action: 'Present any valid ID: Aadhaar, PAN card, EPIC, Passport, or Driving Licence. 11 alternate IDs are accepted by ECI.' },
      { step: 3, title: 'Request a Tender Ballot', action: 'If your name is missing but you believe you are registered, ask for a "Tender Ballot Vote" which will be counted later during verification.' },
      { step: 4, title: 'Call 1950', action: 'If the officer is unhelpful, call the National Voter Helpline 1950 from outside the booth. They can verify your EPIC number live.' },
    ],
    T02: [
      { step: 1, title: 'Check alternate IDs', action: 'ECI accepts 11 alternate photo IDs: Aadhaar, PAN, Passport, Driving Licence, NREGA Job Card, Health Insurance Smart Card, Pension Document, NPR Smart Card, Bank Passbook, Service ID, or Disability ID.' },
      { step: 2, title: 'Visit the Booth-Level Officer (BLO)', action: 'Your area BLO can issue an emergency confirmation slip from the electoral roll if your name is listed.' },
      { step: 3, title: 'Call 1950 immediately', action: 'Call 1950 and provide your name and address. They can guide you on nearest BLO or alternate steps.' },
    ],
    T03: [
      { step: 1, title: 'You must vote at your old registered address booth', action: 'Under Indian election law, you vote where you are registered — not where you currently live. Go to your old constituency polling booth.' },
      { step: 2, title: 'To update for future elections, file Form 8A', action: 'Visit voters.eci.gov.in after the election and submit Form 8A (Change of Residence) to update your address.' },
      { step: 3, title: 'NRI/Overseas voters call 1950', action: 'If you are an NRI voter registered for postal ballot, call 1950 for guidance.' },
    ],
    T04: [
      { step: 1, title: 'Check your Voter ID or Slip', action: 'Your Voter ID (EPIC) or the voter slip delivered to your home shows your booth number and address.' },
      { step: 2, title: 'Find your booth online', action: 'Visit electoralsearch.eci.gov.in and enter your name or EPIC number to find your exact polling station.' },
      { step: 3, title: 'Call 1950', action: 'The National Voter Helpline 1950 can tell you your polling station by your EPIC number within seconds.' },
    ],
    T05: [
      { step: 1, title: 'You have the right to priority access', action: 'Persons with disabilities (PwD) have the right to access all polling stations. Booths must have ramps, wheelchairs, and Braille voting guides.' },
      { step: 2, title: 'Request a companion vote', action: 'A PwD voter may bring one trusted companion (of their choice) inside the booth to assist with voting.' },
      { step: 3, title: 'Demand the accessibility officer', action: 'Each district has a PwD nodal officer. If your booth is inaccessible, call 1950 to escalate immediately.' },
    ],
    T06: [
      { step: 1, title: 'Report to the Presiding Officer immediately', action: 'All EVM/VVPAT malfunctions must be reported to the Presiding Officer at the booth. They have authority to fix or replace the machine.' },
      { step: 2, title: 'Do NOT tamper with the machine', action: 'Do not touch, press repeatedly, or attempt to fix the machine yourself. This is a legal offence.' },
      { step: 3, title: 'Call 1950 if the officer is unresponsive', action: 'Call 1950 or the District Election Officer if the Presiding Officer refuses to address the technical issue.' },
    ],
  },
  USA: {
    T01: [
      { step: 1, title: 'Request a Provisional Ballot', action: 'By federal law (HAVA), you have the right to cast a provisional ballot at any polling location even if your name is not on the list.' },
      { step: 2, title: 'Show your state ID', action: 'Present a state-issued photo ID, utility bill, bank statement, or government document showing your name and address.' },
      { step: 3, title: 'Call your state helpline', action: 'Call 1-866-OUR-VOTE (1-866-687-8683), the national nonpartisan election protection hotline, for immediate help.' },
    ],
    T02: [
      { step: 1, title: 'Check acceptable alternative IDs', action: 'Requirements vary by state. Many states accept utility bills, bank statements, or employer letters. Check vote.gov for your state rules.' },
      { step: 2, title: 'Request a Provisional Ballot', action: 'If you cannot provide ID, you can still vote provisionally. Your ballot will be counted once your identity is verified.' },
    ],
    T03: [
      { step: 1, title: 'Update your registration online if possible', action: 'Some states offer same-day or Election Day registration. Check vote.gov for your state.' },
      { step: 2, title: 'Vote at your old address precinct', action: 'In many states you can still vote at your former address precinct on election day.' },
    ],
    T04: [
      { step: 1, title: 'Visit your state election website', action: 'Go to vote.gov and select your state to find an official polling place locator tool.' },
      { step: 2, title: 'Call 1-866-687-8683', action: 'The national voter protection hotline 1-866-OUR-VOTE can help locate your polling place immediately.' },
    ],
    T05: [
      { step: 1, title: 'All polling places must be accessible', action: 'Federal law (ADA) requires all polling places to be physically accessible to voters with disabilities.' },
      { step: 2, title: 'Request curbside voting', action: 'If you cannot enter the building, poll workers must bring a ballot to your car (curbside voting).' },
      { step: 3, title: 'Call 1-888-VOTES4US', action: 'Contact the Disability Rights Advocates hotline for immediate assistance.' },
    ],
    T06: [
      { step: 1, title: 'Notify poll workers immediately', action: 'Alert the poll judge or chief judge at your location. They are trained to handle equipment failures.' },
      { step: 2, title: 'Request a paper ballot', action: 'In many states, paper ballots must be available as backup if machines fail.' },
    ],
  },
  GBR: {
    T01: [
      { step: 1, title: 'Speak to the Presiding Officer', action: 'Ask the presiding officer to check the register. If there is an error, they can contact the Electoral Registration Officer (ERO).' },
      { step: 2, title: 'You may be on the absent voters list', action: 'If you applied for a postal or proxy vote, you may be on a separate list. Ask the officer to check.' },
      { step: 3, title: 'Call your local council', action: 'Contact your local Electoral Registration Office — their number is at gov.uk/contact-electoral-registration-office.' },
    ],
    T02: [
      { step: 1, title: 'Accepted photo ID types', action: 'UK law (2023) requires photo ID. Accepted: UK Passport, Driving Licence, Blue Badge, Older Person Bus Pass, or free Voter Authority Certificate (VAC).' },
      { step: 2, title: 'Apply for a Voter Authority Certificate on the day', action: 'You can apply for an emergency VAC on election day at your local council. Call your council immediately.' },
    ],
    T03: [
      { step: 1, title: 'You must vote at the correct polling station', action: 'Your polling card shows your assigned station. You must vote there, not at another location.' },
      { step: 2, title: 'Contact your local Electoral Registration Office', action: 'Call your local council to confirm your registered address and assigned polling station.' },
    ],
    T04: [
      { step: 1, title: 'Check your polling card', action: 'Your polling card (sent by post) shows your exact polling station address.' },
      { step: 2, title: 'Contact your local council', action: 'Visit gov.uk/contact-electoral-registration-office to find your local office number.' },
    ],
    T05: [
      { step: 1, title: 'All polling stations must be accessible', action: 'Polling stations must have level access, a low-level polling booth, and a magnifying sheet for partially sighted voters.' },
      { step: 2, title: 'Request tactile voting device', action: 'Ask the presiding officer for a tactile voting device, which helps visually impaired voters to vote independently.' },
    ],
    T06: [
      { step: 1, title: 'Notify the Presiding Officer immediately', action: 'Report the technical issue to the Presiding Officer at the polling station right away.' },
      { step: 2, title: 'Call the Electoral Commission helpline', action: 'Call 0800 328 0280 for guidance from the Electoral Commission.' },
    ],
  },
  CAN: {
    T01: [
      { step: 1, title: 'Register at the polling station', action: 'In Canada, you can register to vote on election day at your polling station with proper ID.' },
      { step: 2, title: 'Show ID and proof of address', action: 'Bring government-issued photo ID (like a driver\'s licence) showing your name and current address.' },
      { step: 3, title: 'Call Elections Canada', action: 'Call 1-800-463-6868 for immediate assistance from Elections Canada.' },
    ],
    T02: [
      { step: 1, title: 'Use two pieces of ID without a photo', action: 'Show two pieces of ID with your name and address — like a utility bill plus a bank statement.' },
      { step: 2, title: 'Have a registered voucher vouch for you', action: 'A registered voter in the same polling division can vouch for your identity under oath.' },
    ],
    T03: [
      { step: 1, title: 'Vote at your new address polling station', action: 'You must vote in the polling division where you currently live, not your old address.' },
      { step: 2, title: 'Update your address at the polling station', action: 'You can update your address and register to vote at the polling station on election day.' },
    ],
    T04: [
      { step: 1, title: 'Find your polling station online', action: 'Visit elections.ca or call 1-800-463-6868. Your voter information card also shows your assigned location.' },
    ],
    T05: [
      { step: 1, title: 'Request assistance at any polling station', action: 'All polling stations must be accessible. Ask for a transfer certificate to vote at a more accessible location.' },
      { step: 2, title: 'Bring a helper if needed', action: 'You may be assisted by a person of your choice, or by an election officer.' },
    ],
    T06: [
      { step: 1, title: 'Notify the election officer', action: 'Report any technical issue to the deputy returning officer or poll clerk at your polling station.' },
      { step: 2, title: 'Call Elections Canada', action: 'Call 1-800-463-6868 immediately for guidance.' },
    ],
  },
  AUS: {
    T01: [
      { step: 1, title: 'Ask for a Declaration Vote', action: 'Even if your name is not on the roll at that location, you can cast a declaration (provisional) vote. It will be checked against the roll later.' },
      { step: 2, title: 'Call the AEC', action: 'Call 13 23 26 immediately. The AEC can check your enrolment status in real time.' },
    ],
    T02: [
      { step: 1, title: 'No ID required to vote in Australia', action: 'Australia does NOT require photo ID to vote. Simply give your name and address at the polling booth.' },
    ],
    T03: [
      { step: 1, title: 'Vote at any polling place in your division', action: 'You can vote at any polling place in your enrolled electoral division, not just the nearest one.' },
      { step: 2, title: 'Or cast an absent vote', action: 'If you are outside your division, you can cast an absent vote at any polling place anywhere in Australia.' },
    ],
    T04: [
      { step: 1, title: 'Find polling places at aec.gov.au', action: 'Visit aec.gov.au/election/polling-places or call 13 23 26. Any official polling place in your electorate is valid.' },
    ],
    T05: [
      { step: 1, title: 'Vote from your car (mobile polling)', action: 'The AEC provides mobile polling teams that come to your car if you cannot enter the building.' },
      { step: 2, title: 'Request a large-print ballot', action: 'Large-print ballot papers and magnifying sheets are available at all polling places.' },
    ],
    T06: [
      { step: 1, title: 'Notify the officer in charge', action: 'Alert the Officer in Charge at the polling place. They have authority to address all technical issues.' },
      { step: 2, title: 'Call 13 23 26', action: 'Contact the AEC hotline for immediate assistance with any polling place issue.' },
    ],
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function EmergencyPanel() {
  const { countryCode } = useCivicStore();
  const { activateEmergency } = useEmergencyStore();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(countryCode);
  const [selectedScenario, setSelectedScenario] = useState<TroubleshootingScenario | null>(null);

  const helpline = selectedCountry ? COUNTRY_METADATA[selectedCountry]?.helpline : null;
  const steps = selectedScenario && selectedCountry
    ? (FALLBACK_STEPS[selectedCountry]?.[selectedScenario] ?? [
        { step: 1, title: 'Contact official helpline immediately', action: `Call ${helpline ?? 'your national electoral authority helpline'} for immediate assistance.` },
      ])
    : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold uppercase tracking-widest"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}>
          <ExclamationCircleIcon className="h-4 w-4" aria-hidden="true" />
          Election Day Emergency
        </div>
        <h1 className="text-3xl font-extrabold text-white">Get Help Now</h1>
        <p className="mt-2 text-base" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Step-by-step resolution — official guidance only. No AI delay.
        </p>
      </div>

      {/* Helpline — always visible once country known */}
      {helpline && (
        <a
          href={`tel:${helpline.replace(/\s/g, '')}`}
          className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl font-bold text-xl"
          style={{ background: '#FFFFFF', color: 'var(--color-emergency)', minHeight: 64, borderRadius: 12 }}
          aria-label={`Call voter helpline: ${helpline}`}
        >
          <PhoneIcon className="h-6 w-6" aria-hidden="true" />
          {helpline} — Call Now FREE · 24/7
        </a>
      )}

      {/* Step 1: Country selector (only if not already set) */}
      {!selectedCountry && (
        <div className="mb-6">
          <p className="mb-3 text-sm font-semibold text-white">Which country are you voting in?</p>
          <div className="flex flex-col gap-2">
            {(Object.entries(COUNTRY_DISPLAY) as [CountryCode, { name: string; flag: string }][]).map(([code, info]) => (
              <button
                key={code}
                onClick={() => setSelectedCountry(code)}
                className="flex items-center gap-3 rounded-xl p-4 text-left font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.20)' }}
              >
                <span className="text-2xl">{info.flag}</span>
                <span>{info.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Country badge (shown once selected) */}
      {selectedCountry && !selectedScenario && (
        <div className="mb-5 flex items-center justify-between">
          <span className="text-white/60 text-sm">
            {COUNTRY_DISPLAY[selectedCountry].flag} {COUNTRY_DISPLAY[selectedCountry].name}
          </span>
          <button
            onClick={() => { setSelectedCountry(null); setSelectedScenario(null); }}
            className="text-xs text-white/40 hover:text-white/70 underline transition-colors"
          >
            Change country
          </button>
        </div>
      )}

      {/* Step 2: Scenario selector */}
      {selectedCountry && !selectedScenario && (
        <div>
          <p className="mb-3 text-sm font-semibold text-white">What's happening?</p>
          <div className="flex flex-col gap-2">
            {(Object.entries(SCENARIO_LABELS) as [TroubleshootingScenario, { label: string; icon: string }][]).map(([key, { label, icon }]) => (
              <button
                key={key}
                onClick={() => { setSelectedScenario(key); activateEmergency(key, selectedCountry); }}
                className="flex items-center gap-3 rounded-xl p-4 text-left text-base font-medium transition-all hover:bg-white/20"
                style={{ background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.20)' }}
              >
                <span className="text-2xl">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Resolution steps */}
      {selectedScenario && selectedCountry && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">
              {SCENARIO_LABELS[selectedScenario].icon} {SCENARIO_LABELS[selectedScenario].label}
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {steps.map((step) => (
              <div
                key={step.step}
                className="rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)' }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: '#0070F3', color: '#FFFFFF' }}
                    aria-hidden="true"
                  >
                    {step.step}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {step.action}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Helpline reminder at bottom of steps */}
          {helpline && (
            <a
              href={`tel:${helpline.replace(/\s/g, '')}`}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.30)' }}
            >
              <PhoneIcon className="h-5 w-5" aria-hidden="true" />
              Still stuck? Call {helpline}
            </a>
          )}

          <button
            onClick={() => setSelectedScenario(null)}
            className="mt-4 text-sm underline transition-colors"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            ← Different problem
          </button>
        </div>
      )}

      {/* Exit */}
      <div className="mt-8 text-center">
        <Link href="/" className="text-sm underline" style={{ color: 'rgba(255,255,255,0.55)' }}>
          ← Return to ELECTRA home
        </Link>
      </div>
    </div>
  );
}
