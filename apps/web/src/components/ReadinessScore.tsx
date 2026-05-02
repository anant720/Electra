'use client';

import { useMemo } from 'react';
import { useCivicStore } from '@/store/civicStore';

// ─── Checklist domain config ────────────────────────────────────────────────
const DOMAINS = [
  { key: 'REGISTRATION',      label: 'Registration',       icon: '✍️' },
  { key: 'DOCUMENTATION',     label: 'Documents',          icon: '🪪' },
  { key: 'DEADLINE_AWARENESS',label: 'Deadlines',          icon: '📅' },
  { key: 'LOCATION',          label: 'Polling Location',   icon: '📍' },
  { key: 'EMERGENCY_PREPARED',label: 'Emergency Ready',    icon: '🚨' },
];

// ─── Country + Persona specific checklist items ─────────────────────────────
const CHECKLIST: Record<string, CheckItem[]> = {
  IND: [
    { key: 'IND-01', domain: 'REGISTRATION',       label: 'Confirm name on electoral roll', desc: 'Check at voters.eci.gov.in using your EPIC number or Aadhaar.' },
    { key: 'IND-02', domain: 'REGISTRATION',       label: 'Verify Form 6 submission (if first-time)', desc: 'First-time voters must file Form 6 at voters.eci.gov.in.' },
    { key: 'IND-03', domain: 'DOCUMENTATION',      label: 'Locate EPIC card (Voter ID)', desc: 'Or download e-EPIC from voters.eci.gov.in — accepted at booths.' },
    { key: 'IND-04', domain: 'DOCUMENTATION',      label: 'Know 2 alternative IDs (backup)', desc: 'Aadhaar, PAN, Passport, Driving Licence are all accepted.' },
    { key: 'IND-05', domain: 'DEADLINE_AWARENESS', label: 'Note your election date', desc: 'Check eci.gov.in — India has phased polling across multiple dates.' },
    { key: 'IND-06', domain: 'DEADLINE_AWARENESS', label: 'Note MCC activation date', desc: 'No new government schemes can start after MCC is activated.' },
    { key: 'IND-07', domain: 'LOCATION',           label: 'Find polling booth address', desc: 'Back of EPIC card OR voters.eci.gov.in OR call 1950.' },
    { key: 'IND-08', domain: 'LOCATION',           label: 'Know booth opening hours', desc: 'Usually 7am–6pm. Check ECI notification for your area.' },
    { key: 'IND-09', domain: 'EMERGENCY_PREPARED', label: 'Save helpline: 1950', desc: 'National Voter Helpline — toll-free, available 24/7 during elections.' },
    { key: 'IND-10', domain: 'EMERGENCY_PREPARED', label: 'Know Tender Ballot right', desc: 'If name missing: you can demand a Tender Ballot — it is your legal right.' },
  ],
  USA: [
    { key: 'USA-01', domain: 'REGISTRATION',       label: 'Register to vote (or verify)', desc: 'Go to vote.gov and select your state — each state has its own portal.' },
    { key: 'USA-02', domain: 'REGISTRATION',       label: 'Check registration deadline', desc: 'Deadlines vary from 30 days to same-day. Check vote.gov.' },
    { key: 'USA-03', domain: 'DOCUMENTATION',      label: 'Know your state\'s ID requirement', desc: '~35 states require some ID. Check vote.gov for your state\'s rule.' },
    { key: 'USA-04', domain: 'DOCUMENTATION',      label: 'Request absentee ballot (if needed)', desc: 'Apply at your state election portal — allow 3 weeks for transit.' },
    { key: 'USA-05', domain: 'DEADLINE_AWARENESS', label: 'Note registration deadline', desc: 'The single most common reason people miss an election.' },
    { key: 'USA-06', domain: 'DEADLINE_AWARENESS', label: 'Note mail ballot request deadline', desc: 'Usually 7–10 days before election day.' },
    { key: 'USA-07', domain: 'LOCATION',           label: 'Find your polling place', desc: 'vote.gov → your state → polling place lookup.' },
    { key: 'USA-08', domain: 'LOCATION',           label: 'Check early voting locations', desc: 'Most states offer 1–2 weeks of early voting. No lines, no rush.' },
    { key: 'USA-09', domain: 'EMERGENCY_PREPARED', label: 'Save: 1-866-OUR-VOTE', desc: 'Election Protection Hotline — free, nonpartisan, multilingual.' },
    { key: 'USA-10', domain: 'EMERGENCY_PREPARED', label: 'Know provisional ballot right', desc: 'Under HAVA, you ALWAYS have the right to a provisional ballot.' },
  ],
  GBR: [
    { key: 'GBR-01', domain: 'REGISTRATION',       label: 'Register at gov.uk/register-to-vote', desc: 'You need your National Insurance number and date of birth.' },
    { key: 'GBR-02', domain: 'REGISTRATION',       label: 'Check registration deadline (12 working days)', desc: 'Missing this = you cannot vote. No same-day registration in England.' },
    { key: 'GBR-03', domain: 'DOCUMENTATION',      label: 'Confirm you have accepted photo ID (England)', desc: 'Passport, driving licence, Blue Badge, 60+ Oyster, VAC, Veteran Card.' },
    { key: 'GBR-04', domain: 'DOCUMENTATION',      label: 'Apply for Voter Authority Certificate if needed', desc: 'Free from your council. Apply by 6 working days before poll.' },
    { key: 'GBR-05', domain: 'DEADLINE_AWARENESS', label: 'Note registration deadline', desc: '12 working days before polling day.' },
    { key: 'GBR-06', domain: 'DEADLINE_AWARENESS', label: 'Note postal vote deadline (if applying)', desc: '5pm, 11 working days before polling day.' },
    { key: 'GBR-07', domain: 'LOCATION',           label: 'Find polling station from poll card', desc: 'Your poll card arrives by post. Polls open 7am–10pm.' },
    { key: 'GBR-08', domain: 'LOCATION',           label: 'Note polling station address', desc: 'You can vote without your poll card but you need your photo ID.' },
    { key: 'GBR-09', domain: 'EMERGENCY_PREPARED', label: 'Save Electoral Commission: 0800 328 0280', desc: 'Freephone helpline — open during election period.' },
    { key: 'GBR-10', domain: 'EMERGENCY_PREPARED', label: 'Know your tendered vote right', desc: 'If you are on the register but details are wrong, you may be offered a tendered ballot.' },
  ],
  CAN: [
    { key: 'CAN-01', domain: 'REGISTRATION',       label: 'Confirm enrollment at elections.ca', desc: 'Most Canadians are auto-enrolled but check if you have moved.' },
    { key: 'CAN-02', domain: 'REGISTRATION',       label: 'Note roll close date (~7 days after writ)', desc: 'After this, register at the polling station on election day.' },
    { key: 'CAN-03', domain: 'DOCUMENTATION',      label: 'Prepare 2 IDs showing name + address', desc: 'Options: driver\'s licence, utility bill, bank statement, government mail.' },
    { key: 'CAN-04', domain: 'DOCUMENTATION',      label: 'Apply for special ballot (if voting by mail)', desc: 'Apply at elections.ca after election is called.' },
    { key: 'CAN-05', domain: 'DEADLINE_AWARENESS', label: 'Note advance poll dates', desc: 'Advance polls open 10, 9, 8, 7 days before election day.' },
    { key: 'CAN-06', domain: 'DEADLINE_AWARENESS', label: 'Note special ballot deadline (6 days before)', desc: 'Mail-in ballot must be received by 6pm ET on election day.' },
    { key: 'CAN-07', domain: 'LOCATION',           label: 'Find polling station on Voter Information Card', desc: 'Also at elections.ca/voterlookup.' },
    { key: 'CAN-08', domain: 'LOCATION',           label: 'Check advance poll location', desc: 'You can vote at any advance poll in your riding.' },
    { key: 'CAN-09', domain: 'EMERGENCY_PREPARED', label: 'Save Elections Canada: 1-800-463-6868', desc: 'Available 24/7 during election period. TTY: 1-800-361-8935.' },
    { key: 'CAN-10', domain: 'EMERGENCY_PREPARED', label: 'Know vouching right (if no ID)', desc: 'Another registered voter in your division can vouch for you.' },
  ],
  AUS: [
    { key: 'AUS-01', domain: 'REGISTRATION',       label: 'Enrol or update at aec.gov.au', desc: 'Enrolment closes ~7 days after election writ. Fines apply if not enrolled.' },
    { key: 'AUS-02', domain: 'REGISTRATION',       label: 'Check enrolment details are current', desc: 'If you have moved, update your address before the roll closes.' },
    { key: 'AUS-03', domain: 'DOCUMENTATION',      label: 'Note: NO photo ID required to vote', desc: 'Just give your name and address at the polling place.' },
    { key: 'AUS-04', domain: 'DOCUMENTATION',      label: 'Apply for postal vote (if voting away)', desc: 'Any voter can apply — no reason needed. Apply at aec.gov.au.' },
    { key: 'AUS-05', domain: 'DEADLINE_AWARENESS', label: 'Note polling day (Saturday)', desc: 'Polls open 8am–6pm Saturday. Voting is compulsory.' },
    { key: 'AUS-06', domain: 'DEADLINE_AWARENESS', label: 'Understand: voting is compulsory', desc: '$20 fine for not voting without a valid reason.' },
    { key: 'AUS-07', domain: 'LOCATION',           label: 'Find polling place at aec.gov.au', desc: 'You can vote at ANY polling place in Australia — not restricted to one location.' },
    { key: 'AUS-08', domain: 'LOCATION',           label: 'Know pre-poll voting locations', desc: 'Pre-poll voting centres open ~12 days before election day.' },
    { key: 'AUS-09', domain: 'EMERGENCY_PREPARED', label: 'Save AEC helpline: 13 23 26', desc: 'Available during election period. Live chat also at aec.gov.au.' },
    { key: 'AUS-10', domain: 'EMERGENCY_PREPARED', label: 'Know Declaration Vote right', desc: 'If not on the roll on election day, request a Declaration Vote at any polling place.' },
  ],
};

interface CheckItem {
  key: string;
  domain: string;
  label: string;
  desc: string;
}

interface Props {
  completedKeys: string[];
  onToggle: (key: string) => void;
}

export default function ReadinessScore({ completedKeys, onToggle }: Props) {
  const { countryCode } = useCivicStore();
  const code = (countryCode as string) ?? 'IND';
  const items = (CHECKLIST[code] ?? CHECKLIST['IND']) as CheckItem[];

  const score = useMemo(() => {
    if (!items.length) return 0;
    return Math.round((completedKeys.filter(k => items.some(i => i.key === k)).length / items.length) * 100);
  }, [completedKeys, items]);

  // SVG ring math
  const R = 52, C = 2 * Math.PI * R;
  const dash = C - (score / 100) * C;
  const ringColor = score >= 80 ? '#16A34A' : score >= 40 ? '#D97706' : '#C0392B';

  return (
    <div className="w-full space-y-6">
      {/* Score Ring */}
      <div className="flex flex-col items-center">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r={R} fill="none" stroke="#E2E8F0" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={R} fill="none"
              stroke={ringColor} strokeWidth="10"
              strokeDasharray={C}
              strokeDashoffset={dash}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black tabular" style={{ color: ringColor }}>{score}</span>
            <span className="text-xs text-gray-400 font-medium">/ 100</span>
          </div>
        </div>
        <p className="mt-2 text-sm font-semibold text-navy">Voter Readiness Score</p>
        <p className="text-xs text-gray-400">
          {score >= 80 ? '✅ You\'re ready to vote!' : score >= 40 ? '⚡ Almost there — keep going' : '🔴 Action needed — start below'}
        </p>
      </div>

      {/* Domain Checklist */}
      <div className="space-y-4">
        {DOMAINS.map(domain => {
          const domainItems = items.filter(i => i.domain === domain.key);
          const completed = domainItems.filter(i => completedKeys.includes(i.key)).length;
          return (
            <div key={domain.key} className="card-civic p-4">
              {/* Domain header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">{domain.icon}</span>
                  <span className="text-sm font-semibold text-navy">{domain.label}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  completed === domainItems.length
                    ? 'bg-green-100 text-green-700'
                    : completed > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {completed}/{domainItems.length}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {domainItems.map(item => {
                  const done = completedKeys.includes(item.key);
                  return (
                    <label
                      key={item.key}
                      className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                        done ? 'bg-green-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => onToggle(item.key)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"
                        aria-label={item.label}
                      />
                      <div className="min-w-0">
                        <p className={`text-sm font-medium leading-tight ${done ? 'line-through text-gray-400' : 'text-navy'}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
