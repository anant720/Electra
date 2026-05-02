'use client';

import { useState, useRef, useEffect } from 'react';
import { useCivicStore } from '@/store/civicStore';

// ─── Jargon dictionary (sourced from civic_axioms JARGON category) ──────────
const JARGON: Record<string, Record<string, JargonDef>> = {
  IND: {
    'EPIC': { full: 'Electors Photo Identity Card', plain: 'Your Voter ID card — the blue laminated card issued by ECI with your photo, name, and EPIC number. You can download a digital version called e-EPIC from voters.eci.gov.in.', source: 'ECI' },
    'EVM': { full: 'Electronic Voting Machine', plain: 'The device you press to cast your vote. A VVPAT slip prints for 7 seconds showing your candidate — confirming your vote was recorded correctly.', source: 'ECI' },
    'VVPAT': { full: 'Voter Verifiable Paper Audit Trail', plain: 'The small printer attached to the EVM that shows a paper slip with your candidate\'s name and symbol for 7 seconds. This is your vote verification proof.', source: 'ECI' },
    'NOTA': { full: 'None of the Above', plain: 'A ballot option to reject all candidates without spoiling your ballot. NOTA votes are counted separately and do not change who wins — it is a formal protest vote.', source: 'ECI' },
    'MCC': { full: 'Model Code of Conduct', plain: 'Rules that activate the moment ECI announces an election. The ruling government cannot launch new schemes, use state resources for campaigns, or make new appointments during this period.', source: 'ECI' },
    'BLO': { full: 'Booth Level Officer', plain: 'A government official assigned to each polling booth. Your first point of contact for voter roll corrections, Form 6 submission, or any registration issue.', source: 'ECI' },
    'NVSP': { full: 'National Voters Service Portal', plain: 'The official government website (voters.eci.gov.in) where you register to vote, check your status, download e-EPIC, and submit forms.', source: 'ECI' },
    'Returning Officer': { full: 'Returning Officer (RO)', plain: 'The government official responsible for conducting elections in your constituency. They are the highest authority for resolving voter disputes on election day.', source: 'ECI' },
    'Tender Ballot': { full: 'Tender Ballot (Tendered Vote)', plain: 'A special ballot you can demand if someone else has already voted in your name or if the Presiding Officer questions your identity. It is your legal right under the Representation of the People Act 1951.', source: 'ECI' },
    'Delimitation': { full: 'Delimitation', plain: 'The process of redrawing constituency boundaries based on population changes. After delimitation, your constituency\'s name, shape, or number may change.', source: 'ECI' },
  },
  USA: {
    'Electoral College': { full: 'Electoral College', plain: 'The system for electing the US President. Each state has a number of "electors" equal to its congressional seats. 270 of 538 electoral votes are needed to win. When you vote for President, you are actually choosing your state\'s electors.', source: 'vote.gov' },
    'Provisional Ballot': { full: 'Provisional Ballot', plain: 'A federal backup vote you can ALWAYS demand if your registration is questioned at the polls (under the Help America Vote Act). It is held separately and counted once your eligibility is verified. Never leave without casting one.', source: 'EAC' },
    'UOCAVA': { full: 'Uniformed and Overseas Citizens Absentee Voting Act', plain: 'The federal law that guarantees US military members and overseas citizens the right to vote by absentee ballot. Use fvap.gov to exercise these rights.', source: 'FVAP' },
    'FPCA': { full: 'Federal Post Card Application', plain: 'The form overseas and military voters use to register AND request an absentee ballot at the same time. Available at fvap.gov.', source: 'FVAP' },
    'FWAB': { full: 'Federal Write-In Absentee Ballot', plain: 'An emergency backup ballot for overseas voters who did not receive their regular absentee ballot in time. Submit it alongside your regular ballot — only one will be counted.', source: 'FVAP' },
    'Precinct': { full: 'Precinct', plain: 'The smallest geographic unit for voting — your assigned local polling place. Your precinct determines which ballot you receive and which candidates appear on it.', source: 'vote.gov' },
    'Absentee Ballot': { full: 'Absentee / Mail-In Ballot', plain: 'A ballot you can request by mail if you cannot vote in person. Most states allow this for any reason. Allow 3 weeks for transit — your ballot must be RECEIVED by the deadline, not just mailed.', source: 'vote.gov' },
  },
  GBR: {
    'IER': { full: 'Individual Electoral Registration', plain: 'The UK system where each person registers individually (not households). Register at gov.uk/register-to-vote using your National Insurance number.', source: 'ECUK' },
    'VAC': { full: 'Voter Authority Certificate', plain: 'A free photo ID issued by your local council for voters in England who do not have other accepted photo ID (like a passport or driving licence). Apply at gov.uk.', source: 'GOV_UK_VAC' },
    'FPTP': { full: 'First Past the Post', plain: 'The UK\'s voting system for General Elections. The candidate with the most votes in your constituency wins — even if they have less than 50%. You vote for one candidate only.', source: 'ECUK' },
    'Constituency': { full: 'Constituency', plain: 'Your local voting area — the geographic region that elects one Member of Parliament (MP). The UK has 650 constituencies.', source: 'ECUK' },
    'Polling Card': { full: 'Polling Card', plain: 'The card posted to you before the election showing your polling station address and reference number. You do not need it to vote — but it helps. You still need your photo ID in England.', source: 'ECUK' },
    'Returning Officer': { full: 'Returning Officer', plain: 'The official responsible for running the election in your constituency — counting votes and declaring the result.', source: 'ECUK' },
  },
  CAN: {
    'Riding': { full: 'Electoral District / Riding / Constituency', plain: 'Canada\'s 338 local voting areas. You vote for one candidate (MP) to represent your riding in the House of Commons. "Riding" is the uniquely Canadian term.', source: 'EC_CA' },
    'Special Ballot': { full: 'Special Ballot', plain: 'Canada\'s mail-in ballot system — available to ANY eligible voter, no excuse needed. Apply at elections.ca after the election is called. Must be RECEIVED by 6pm ET on election day.', source: 'EC_CA' },
    'Vouching': { full: 'Vouching', plain: 'If you have no ID, another registered voter in your polling division who can prove their own identity can vouch for you. They can only vouch for one person, and they must register an oath.', source: 'EC_CA' },
    'DRO': { full: 'Deputy Returning Officer', plain: 'The Elections Canada official who runs your specific polling station. They have authority to resolve most polling day issues on the spot.', source: 'EC_CA' },
    'Advance Poll': { full: 'Advance Poll', plain: 'Early voting days held 10, 9, 8, and 7 days before election day. Any enrolled voter can use advance polls — no reason required. Often less crowded than election day.', source: 'EC_CA' },
  },
  AUS: {
    'Preferential Voting': { full: 'Preferential / Instant-Runoff Voting', plain: 'Australia\'s system for the House of Representatives. You rank ALL candidates in order of preference (1, 2, 3...). If no one gets 50%+1 first-preference votes, lower candidates are eliminated and their votes redistributed until someone reaches a majority.', source: 'AEC' },
    'Informal Vote': { full: 'Informal (Invalid) Vote', plain: 'A ballot that cannot be counted because preferences were not completed correctly. On the green ballot: you must number EVERY box. Leaving any box blank makes your vote informal.', source: 'AEC' },
    'Division': { full: 'Electoral Division', plain: 'Australia\'s 151 local voting areas for the House of Representatives. Each division elects one MP. Similar to a constituency or riding.', source: 'AEC' },
    'Declaration Vote': { full: 'Declaration Vote', plain: 'A vote cast by someone whose name is not on the electoral roll at a polling place. The AEC checks your enrolment eligibility after the election and counts the ballot if you are eligible.', source: 'AEC' },
    'Above the Line': { full: 'Above the Line (Senate ballot)', plain: 'Voting for a party on the white Senate ballot. Number at least 6 party boxes above the thick line. Your party\'s preferences flow according to their registered preferences.', source: 'AEC' },
    'Below the Line': { full: 'Below the Line (Senate ballot)', plain: 'Voting for individual candidates on the white Senate ballot. Number at least 12 individual candidates below the thick line. You have full control of preference flow.', source: 'AEC' },
    'Pre-poll': { full: 'Pre-poll Voting', plain: 'Early voting at an AEC pre-poll voting centre — available from ~12 days before polling day. No reason required. Often much shorter queues than on election day.', source: 'AEC' },
  },
};

interface JargonDef {
  full: string;
  plain: string;
  source: string;
}

interface Props {
  term: string;
  children?: React.ReactNode;
}

export function JargonTooltip({ term, children }: Props) {
  const { countryCode } = useCivicStore();
  const [open, setOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const code = (countryCode as string) ?? 'IND';
  const def = JARGON[code]?.[term] ?? Object.values(JARGON).find(c => c[term])?.[term];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (open && tooltipRef.current && !tooltipRef.current.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  if (!def) return <span>{children ?? term}</span>;

  return (
    <span className="relative inline-flex items-baseline">
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}
        aria-expanded={open}
        aria-describedby={`jargon-${term.replace(/\s/g, '-')}`}
        className="underline decoration-dashed decoration-blue-400 underline-offset-2 cursor-help text-blue-700 hover:text-blue-900 transition-colors font-medium"
      >
        {children ?? term}
      </button>

      {open && (
        <div
          ref={tooltipRef}
          id={`jargon-${term.replace(/\s/g, '-')}`}
          role="tooltip"
          className="absolute z-50 bottom-full left-0 mb-2 w-72 rounded-xl border border-blue-200 bg-white p-4 shadow-lg"
          style={{ minWidth: '260px' }}
        >
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white border-r border-b border-blue-200 rotate-45" />

          <div className="space-y-2">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-blue-500 font-bold mb-0.5">Jargon Buster</p>
              <p className="text-sm font-bold text-navy">{term}</p>
              <p className="text-[11px] text-gray-400 font-medium">{def.full}</p>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-2">{def.plain}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-gray-400">📚 Source: {def.source}</span>
              <button
                onClick={() => setOpen(false)}
                className="text-[11px] text-blue-500 hover:text-blue-700 font-semibold"
              >
                Close ×
              </button>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}

// ─── Jargon scanner: auto-wrap known terms in a text block ───────────────────
export function JargonText({ text, countryCode }: { text: string; countryCode: string }) {
  const dict = JARGON[countryCode] ?? {};
  const terms = Object.keys(dict);
  if (!terms.length) return <span>{text}</span>;

  // Build regex to match any known term
  const pattern = new RegExp(`\\b(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'g');
  const parts = text.split(pattern);

  return (
    <span>
      {parts.map((part, i) =>
        dict[part]
          ? <JargonTooltip key={i} term={part}>{part}</JargonTooltip>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

export default JargonTooltip;
