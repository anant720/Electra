'use client';

import { useCivicStore } from '@/store/civicStore';

// ─── All form routes per country + scenario ──────────────────────────────────
const FORM_ROUTES: Record<string, FormRoute[]> = {
  IND: [
    {
      code: 'FORM_6', name: 'Form 6 — New Voter Registration',
      emoji: '📝', volatility: 'STABLE',
      forPersonas: ['P01', 'P02'],
      purpose: 'Register to vote for the first time, or register in a new constituency after moving.',
      portalUrl: 'https://voters.eci.gov.in',
      portalLabel: 'National Voters Service Portal (NVSP)',
      processingDays: '15–30 days',
      requiredDocs: ['Proof of Age (Aadhaar / Passport / PAN / Marksheet)', 'Proof of Address (Aadhaar / Utility Bill)', 'Passport-size photograph'],
      tip: 'You can also submit Form 6 in person at your local Booth Level Officer (BLO).',
    },
    {
      code: 'FORM_6A', name: 'Form 6A — NRI Voter Registration',
      emoji: '🌍', volatility: 'STABLE',
      forPersonas: ['P03'],
      purpose: 'Register as an overseas (NRI) elector. Note: physical presence in India on polling day is mandatory.',
      portalUrl: 'https://voters.eci.gov.in',
      portalLabel: 'NVSP Overseas Registration',
      processingDays: '30–60 days',
      requiredDocs: ['Valid Indian Passport', 'Proof of overseas residence'],
      tip: '⚠️ You MUST physically travel to India and vote at your constituency — there is no postal or online voting for NRIs.',
    },
    {
      code: 'FORM_8', name: 'Form 8 — Corrections & EPIC Replacement',
      emoji: '✏️', volatility: 'STABLE',
      forPersonas: ['P01', 'P02', 'P04', 'P05'],
      purpose: 'Fix errors in your voter roll entry, replace a lost EPIC card, or add a PwD marking.',
      portalUrl: 'https://voters.eci.gov.in',
      portalLabel: 'NVSP Form 8',
      processingDays: '7–21 days',
      requiredDocs: ['Existing EPIC number or Aadhaar', 'Supporting document for the correction'],
      tip: 'Use Form 8 if your name is misspelled, your photo is wrong, or you need a duplicate EPIC card.',
    },
    {
      code: 'FORM_8A', name: 'Form 8A — Constituency Transfer',
      emoji: '🚚', volatility: 'STABLE',
      forPersonas: ['P02'],
      purpose: 'Transfer your voter registration when you permanently move to a new constituency.',
      portalUrl: 'https://voters.eci.gov.in',
      portalLabel: 'NVSP Form 8A',
      processingDays: '15–30 days',
      requiredDocs: ['Proof of new address', 'Your existing EPIC number'],
      tip: 'Moving within the SAME constituency? Use Form 8 instead. Only use 8A for a new constituency.',
    },
  ],
  USA: [
    {
      code: 'NVRA', name: 'National Voter Registration Form',
      emoji: '🇺🇸', volatility: 'MEDIUM',
      forPersonas: ['P01', 'P02'],
      purpose: 'Federal registration form accepted by most states. Check your state — some have their own form.',
      portalUrl: 'https://vote.gov',
      portalLabel: 'vote.gov — Select Your State',
      processingDays: '7–30 days (varies by state)',
      requiredDocs: ['State ID number or last 4 digits of SSN', 'Proof of citizenship (some states)'],
      tip: '21 states + DC offer same-day registration. Go to vote.gov and select your state for exact requirements.',
    },
    {
      code: 'FPCA', name: 'Federal Post Card Application (FPCA)',
      emoji: '✉️', volatility: 'STABLE',
      forPersonas: ['P03'],
      purpose: 'Register AND request an absentee ballot simultaneously for military and overseas US citizens (UOCAVA).',
      portalUrl: 'https://www.fvap.gov',
      portalLabel: 'Federal Voting Assistance Program (fvap.gov)',
      processingDays: '3–14 days',
      requiredDocs: ['Valid ID number', 'Overseas mailing address'],
      tip: 'Submit a new FPCA at the start of every election year — it resets your absentee ballot request.',
    },
    {
      code: 'FWAB', name: 'Federal Write-In Absentee Ballot (FWAB)',
      emoji: '🆘', volatility: 'STABLE',
      forPersonas: ['P03', 'P06'],
      purpose: 'Emergency backup ballot for overseas voters who did not receive their regular absentee ballot in time.',
      portalUrl: 'https://www.fvap.gov/fwab-privacy',
      portalLabel: 'FWAB at fvap.gov',
      processingDays: 'Immediate (emergency use)',
      requiredDocs: ['FPCA submission confirmation'],
      tip: 'Use the FWAB as a backup even if you have already sent your regular ballot. Only one will be counted.',
    },
  ],
  GBR: [
    {
      code: 'IER', name: 'Individual Electoral Registration',
      emoji: '🗳️', volatility: 'STABLE',
      forPersonas: ['P01', 'P02', 'P04'],
      purpose: 'Register to vote in the UK. You need your National Insurance number and date of birth.',
      portalUrl: 'https://www.gov.uk/register-to-vote',
      portalLabel: 'gov.uk/register-to-vote',
      processingDays: '1–5 working days',
      requiredDocs: ['National Insurance number', 'Date of birth', 'UK address'],
      tip: 'Deadline: 12 working days before polling day. Set a calendar reminder now.',
    },
    {
      code: 'VAC', name: 'Voter Authority Certificate (Free Photo ID)',
      emoji: '🪪', volatility: 'MEDIUM',
      forPersonas: ['P01', 'P04', 'P05', 'P06'],
      purpose: 'Free photo ID issued by your local council for voters who lack accepted photo ID to vote in England.',
      portalUrl: 'https://www.gov.uk/apply-for-photo-id-voter-authority-certificate',
      portalLabel: 'Apply for free VAC at gov.uk',
      processingDays: '5–10 working days',
      requiredDocs: ['Passport-style photograph', 'National Insurance number'],
      tip: 'Apply at least 6 working days before election day. The VAC is free — there is no charge.',
    },
    {
      code: 'POSTAL', name: 'Postal Vote Application',
      emoji: '📮', volatility: 'MEDIUM',
      forPersonas: ['P02', 'P03', 'P04', 'P05'],
      purpose: 'Apply to vote by post — available to any UK voter, no reason required.',
      portalUrl: 'https://www.gov.uk/apply-postal-vote',
      portalLabel: 'gov.uk/apply-postal-vote',
      processingDays: '5–11 working days',
      requiredDocs: ['Date of birth', 'National Insurance number'],
      tip: 'Postal vote deadline: 5pm, 11 working days before polling day. Return your ballot by 10pm on polling day.',
    },
    {
      code: 'PROXY', name: 'Proxy Vote Application',
      emoji: '👤', volatility: 'MEDIUM',
      forPersonas: ['P03', 'P04', 'P05'],
      purpose: 'Appoint someone you trust to vote on your behalf at the polling station.',
      portalUrl: 'https://www.gov.uk/apply-proxy-vote',
      portalLabel: 'gov.uk/apply-proxy-vote',
      processingDays: '5–11 working days',
      requiredDocs: ['Proxy\'s full name and address', 'Reason for needing a proxy (some categories)'],
      tip: 'Your proxy must be eligible to vote and not already acting as proxy for more than 2 others.',
    },
  ],
  CAN: [
    {
      code: 'ELECTIONS_CA', name: 'Elections Canada Enrolment Check',
      emoji: '🍁', volatility: 'STABLE',
      forPersonas: ['P01', 'P02'],
      purpose: 'Confirm you are enrolled on the National Register of Electors, or register/update your information.',
      portalUrl: 'https://www.elections.ca',
      portalLabel: 'elections.ca',
      processingDays: 'Immediate (online)',
      requiredDocs: ['Proof of Canadian citizenship', 'Proof of address'],
      tip: 'Most Canadians are auto-enrolled from CRA data. Check your registration at elections.ca — especially if you have moved.',
    },
    {
      code: 'SPECIAL_BALLOT', name: 'Special Ballot (Vote by Mail)',
      emoji: '✉️', volatility: 'MEDIUM',
      forPersonas: ['P02', 'P03', 'P04', 'P05'],
      purpose: 'Vote by mail — available to any eligible Canadian voter, no reason required.',
      portalUrl: 'https://www.elections.ca',
      portalLabel: 'elections.ca/specialballot',
      processingDays: '3–14 days',
      requiredDocs: ['Canadian citizenship proof', 'Proof of address'],
      tip: 'Your completed ballot must be RECEIVED by Elections Canada by 6pm ET on election day — not just posted.',
    },
  ],
  AUS: [
    {
      code: 'AEC_ENROL', name: 'AEC Enrolment Form',
      emoji: '🦘', volatility: 'STABLE',
      forPersonas: ['P01', 'P02'],
      purpose: 'Enrol to vote or update your enrolment details (name, address, division).',
      portalUrl: 'https://www.aec.gov.au/enrol',
      portalLabel: 'aec.gov.au/enrol',
      processingDays: '1–7 days',
      requiredDocs: ['Australian citizenship', 'Proof of identity', 'Current address'],
      tip: 'You can enrol from age 16 — your vote activates when you turn 18. Enrolment closes ~7 days after the election writ.',
    },
    {
      code: 'AUS_POSTAL', name: 'AEC Postal Vote Application',
      emoji: '📮', volatility: 'MEDIUM',
      forPersonas: ['P02', 'P03', 'P04', 'P05'],
      purpose: 'Apply to vote by post — available to any enrolled Australian voter, no reason required.',
      portalUrl: 'https://www.aec.gov.au/election/pva.htm',
      portalLabel: 'AEC Postal Vote at aec.gov.au',
      processingDays: '3–10 days',
      requiredDocs: ['Current enrolment details'],
      tip: 'Your completed ballot must be RECEIVED by AEC by 13 days after polling day to count.',
    },
  ],
};

interface FormRoute {
  code: string;
  name: string;
  emoji: string;
  volatility: 'STABLE' | 'MEDIUM' | 'HIGH';
  forPersonas: string[];
  purpose: string;
  portalUrl: string;
  portalLabel: string;
  processingDays: string;
  requiredDocs: string[];
  tip: string;
}

const volatilityConfig = {
  STABLE: { label: 'Stable',  color: 'bg-green-100 text-green-700', icon: '✅' },
  MEDIUM: { label: 'Verify',  color: 'bg-amber-100 text-amber-700', icon: '⚠️' },
  HIGH:   { label: 'Verify Now', color: 'bg-red-100 text-red-700',  icon: '🔴' },
};

interface FormRouterProps {
  countryOverride?: string;
}

export default function FormRouter({ countryOverride }: FormRouterProps = {}) {
  const { countryCode, personaCode } = useCivicStore();
  const code = (countryOverride || (countryCode as string)) ?? 'IND';
  const persona = (personaCode as string) ?? 'P01';

  const allForms = (FORM_ROUTES[code] ?? FORM_ROUTES['IND']) as FormRoute[];
  // Prioritise persona-relevant forms but show all
  const sorted = [...allForms].sort((a, b) => {
    const aMatch = a.forPersonas.includes(persona) ? 0 : 1;
    const bMatch = b.forPersonas.includes(persona) ? 0 : 1;
    return aMatch - bMatch;
  });

  return (
    <section className="w-full" aria-label="Civic Form Router">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-navy">Official Forms & Portals</h2>
        <p className="text-sm text-gray-500 mt-0.5">All links go to official government portals only</p>
      </div>

      <div className="space-y-4">
        {sorted.map(form => {
          const vc = volatilityConfig[form.volatility as keyof typeof volatilityConfig];
          const isPersonaMatch = form.forPersonas.includes(persona);
          return (
            <div
              key={form.code}
              className={`card-civic p-5 ${isPersonaMatch ? 'ring-2 ring-blue-200' : ''}`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{form.emoji}</span>
                  <div>
                    <h3 className="text-sm font-bold text-navy leading-tight">{form.name}</h3>
                    {isPersonaMatch && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">
                        Recommended for you
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${vc.color}`}>
                  {vc.icon} {vc.label}
                </span>
              </div>

              {/* Purpose */}
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">{form.purpose}</p>

              {/* Processing time */}
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-xs text-gray-400">⏱ Processing:</span>
                <span className="text-xs font-semibold text-navy">{form.processingDays}</span>
              </div>

              {/* Required docs */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Required Documents</p>
                <ul className="space-y-1">
                  {form.requiredDocs.map((doc: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                      <span className="text-gray-400 flex-shrink-0">•</span>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tip */}
              {form.tip && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-3">
                  <p className="text-xs text-amber-800 leading-relaxed">💡 {form.tip}</p>
                </div>
              )}

              {/* CTA */}
              <a
                href={form.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
                aria-label={`Open official portal for ${form.name}`}
              >
                <span>{form.portalLabel}</span>
                <span className="text-blue-200 text-xs">↗ Official Gov Portal</span>
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
