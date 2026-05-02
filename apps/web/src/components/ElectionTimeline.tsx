'use client';

import { useState } from 'react';
import { useCivicStore } from '@/store/civicStore';

// ─── Static stage data (RAG pattern — no hallucination) ────────────────────
const TIMELINE_STAGES: Record<string, Stage[]> = {
  IND: [
    { n: 1, name: 'Election Announcement', icon: '📣', status: 'past', keyDate: 'MCC activated', plain: 'The Election Commission announces the election schedule. The Model Code of Conduct (MCC) activates immediately.', action: 'Follow news from eci.gov.in. No new government schemes can be announced after this point.' },
    { n: 2, name: 'Voter Roll Revision', icon: '📋', status: 'past', keyDate: 'Summary revision', plain: 'The Electoral Roll is finalised. Last chance to add, delete, or correct your voter registration.', action: 'Check your name at voters.eci.gov.in using your EPIC number.' },
    { n: 3, name: 'Nomination Filing', icon: '📝', status: 'past', keyDate: 'Last date notified', plain: 'Candidates submit their nomination papers to the Returning Officer (RO).', action: 'Nothing needed from voters. Watch for your candidates\' names.' },
    { n: 4, name: 'Scrutiny of Nominations', icon: '🔍', status: 'past', keyDate: '1 day after nomination', plain: 'The RO reviews all nomination papers for validity. Invalid nominations are rejected.', action: 'Check the final candidate list on your local ECI/state election site.' },
    { n: 5, name: 'Withdrawal of Candidatures', icon: '↩️', status: 'past', keyDate: '2 days after scrutiny', plain: 'Candidates may withdraw from the election. The final candidate list is confirmed.', action: 'Final candidate list is now official. Download your ballot sample from eci.gov.in.' },
    { n: 6, name: 'Election Campaign', icon: '📢', status: 'active', keyDate: 'Closes 48h before poll', plain: 'Political parties and candidates campaign publicly. Governed strictly by the MCC.', action: 'Attend public rallies or read manifestos. Verify claims using official sources, not social media.' },
    { n: 7, name: 'Campaign Silence Period', icon: '🤫', status: 'upcoming', keyDate: '48 hours before polling', plain: 'All campaigning must stop 48 hours before polling begins. No political content allowed.', action: 'Finalize your polling station location now. Download e-EPIC from voters.eci.gov.in.' },
    { n: 8, name: 'Polling Day', icon: '🗳️', status: 'upcoming', keyDate: 'As notified by ECI', plain: 'You cast your vote using the Electronic Voting Machine (EVM). A VVPAT slip confirms your choice for 7 seconds.', action: 'Bring your EPIC or any of the 12 alternative IDs. Go to your assigned booth. Queue, vote, collect the ink mark.' },
    { n: 9, name: 'Counting of Votes', icon: '🔢', status: 'upcoming', keyDate: 'Announced separately', plain: 'All EVMs are transported under security to counting centres. Votes are counted constituency by constituency.', action: 'Watch official ECI results at results.eci.gov.in — not unofficial channels.' },
    { n: 10, name: 'Declaration of Results', icon: '📊', status: 'upcoming', keyDate: 'Counting day', plain: 'The RO declares the winner. The winning candidate receives a certificate of election.', action: 'Results are official only when declared by the RO. Social media results may be premature.' },
    { n: 11, name: 'New Government Sworn In', icon: '🏛️', status: 'upcoming', keyDate: 'Post-election', plain: 'The winning party or coalition forms the government and takes the oath of office.', action: 'Your civic duty is complete. Track your elected representative\'s work via Lok Sabha / Rajya Sabha portals.' },
  ],
  USA: [
    { n: 1, name: 'Election Dates Set', icon: '📅', status: 'past', keyDate: 'Fixed by law (1st Tue Nov)', plain: 'Federal election dates are fixed by law. States set primary dates independently.', action: 'Check your state\'s primary date at vote.gov.' },
    { n: 2, name: 'Voter Registration Opens', icon: '✍️', status: 'past', keyDate: 'Varies by state', plain: 'Each state administers its own registration. Deadlines range from 30 days to same-day.', action: 'Register immediately at vote.gov — select your state for the exact portal and deadline.' },
    { n: 3, name: 'Primary Elections', icon: '🔵', status: 'past', keyDate: 'State-determined', plain: 'Each party selects its candidate through primaries or caucuses.', action: 'Check if your state has open, closed, or semi-closed primaries. Some allow same-day registration.' },
    { n: 4, name: 'Party Conventions', icon: '🎪', status: 'past', keyDate: 'Summer before Nov', plain: 'Parties formally nominate their presidential candidates.', action: 'No voter action required. Watch for VP announcements.' },
    { n: 5, name: 'Registration Deadline', icon: '⏰', status: 'active', keyDate: 'Varies — often 30 days before', plain: 'Most states require registration 15–30 days before the election. 21 states + DC offer same-day registration.', action: 'CRITICAL: Check YOUR state\'s deadline at vote.gov. Missing it = missing the election.' },
    { n: 6, name: 'Early Voting Period', icon: '📬', status: 'upcoming', keyDate: 'Varies by state', plain: 'Most states allow in-person early voting 1–2 weeks before Election Day.', action: 'Find early voting locations at vote.gov. No lines, no waiting — vote on your schedule.' },
    { n: 7, name: 'Absentee Ballot Deadline', icon: '✉️', status: 'upcoming', keyDate: 'State-specific', plain: 'Mail-in ballots must be requested (and often returned) by this date.', action: 'Request your absentee ballot ASAP — allow 3 weeks for transit. Track it at your state portal.' },
    { n: 8, name: 'Election Day', icon: '🗳️', status: 'upcoming', keyDate: '1st Tuesday after 1st Monday Nov', plain: 'Polls open from 6am–8pm (local time). Bring required ID if your state mandates it.', action: 'Go to your assigned polling place. If your name is missing — DEMAND a provisional ballot. It is your federal right.' },
    { n: 9, name: 'Vote Counting', icon: '🔢', status: 'upcoming', keyDate: 'Election night + days after', plain: 'States count ballots — mail-in and provisional ballots may take days. Official results take time.', action: 'Wait for official state certification. AP and major networks project — but only state officials certify.' },
    { n: 10, name: 'Electoral College Vote', icon: '🏛️', status: 'upcoming', keyDate: 'Mid-December', plain: 'Electors in each state cast their official presidential votes. 270 needed to win.', action: 'No action needed. This is the official constitutional step.' },
    { n: 11, name: 'Inauguration', icon: '🎉', status: 'upcoming', keyDate: 'January 20', plain: 'The President-elect takes the oath of office at the US Capitol.', action: 'Your vote shaped this moment. Follow up with your elected representatives via congress.gov.' },
  ],
  GBR: [
    { n: 1, name: 'Dissolution of Parliament', icon: '📣', status: 'past', keyDate: 'PM requests dissolution', plain: 'Parliament is dissolved and all MPs lose their seats. A 25-working-day election campaign begins.', action: 'Check if you are registered at gov.uk/register-to-vote — deadline is 12 working days away.' },
    { n: 2, name: 'Writ of Election Issued', icon: '📜', status: 'past', keyDate: 'Day 1', plain: 'Official notice of the election is issued to each constituency Returning Officer.', action: 'Registration deadline approaching. Register NOW at gov.uk/register-to-vote.' },
    { n: 3, name: 'Nomination Period', icon: '📝', status: 'past', keyDate: 'Days 1–11', plain: 'Candidates submit nomination papers with a £500 deposit to the RO.', action: 'Check which candidates are standing in your constituency at electoralcalculus.co.uk or parliament.uk.' },
    { n: 4, name: 'Registration Deadline', icon: '⏰', status: 'past', keyDate: '12 working days before poll', plain: 'Last day to register to vote. Also last day to apply for a Voter Authority Certificate (VAC) is 6 working days before poll.', action: 'URGENT: Register at gov.uk/register-to-vote. No photo ID? Apply for a free VAC immediately.' },
    { n: 5, name: 'Postal Vote Deadline', icon: '📮', status: 'past', keyDate: '5pm, 11 working days before', plain: 'Last day to apply for a postal vote. Postal votes must be returned by 10pm on polling day.', action: 'Apply for postal vote at gov.uk/apply-postal-vote if you cannot vote in person.' },
    { n: 6, name: 'Campaign Period', icon: '📢', status: 'active', keyDate: 'Days 1–25', plain: 'Parties and candidates campaign publicly. Spending limits apply strictly.', action: 'Read manifestos. Attend hustings. Your polling card will arrive — it shows your polling station.' },
    { n: 7, name: 'Pre-Poll Silence', icon: '🤫', status: 'upcoming', keyDate: 'N/A (UK has no silence period)', plain: 'Unlike many countries, the UK has no mandatory campaign silence period before polling day.', action: 'Confirm your polling station from your polling card. Polls open 7am–10pm.' },
    { n: 8, name: 'Polling Day', icon: '🗳️', status: 'upcoming', keyDate: 'Announced date', plain: 'Polls open 7am to 10pm. You MUST bring accepted photo ID in England. Scotland and Wales have different rules.', action: 'Bring: passport, driving licence, Blue Badge, 60+ Oyster card, or VAC. No ID = you cannot vote in England.' },
    { n: 9, name: 'Counting', icon: '🔢', status: 'upcoming', keyDate: 'Polling night / next day', plain: 'Votes are counted in each constituency. Results declared constituency by constituency.', action: 'Watch BBC/ITV for live results. Official results only from the RO declaration.' },
    { n: 10, name: 'Result Declarations', icon: '📊', status: 'upcoming', keyDate: 'Polling night', plain: 'Each constituency RO declares a winner when counting is complete. Winning party forms government.', action: 'Results are official only at the RO declaration. Exit polls are predictions only.' },
    { n: 11, name: 'New Parliament Opens', icon: '🏛️', status: 'upcoming', keyDate: 'Within weeks', plain: 'The new Prime Minister is appointed by the Monarch. Parliament opens with the King\'s Speech.', action: 'Contact your new MP at parliament.uk. Hold them accountable.' },
  ],
  CAN: [
    { n: 1, name: 'Election Writ Issued', icon: '📣', status: 'past', keyDate: 'PM advises GG', plain: 'The Governor General issues election writs on the Prime Minister\'s advice. A minimum 36-day campaign begins.', action: 'Check your registration at elections.ca — the roll closes 7 days after the writ.' },
    { n: 2, name: 'Electoral Roll Closes', icon: '📋', status: 'past', keyDate: '7 days after writ', plain: 'The National Register of Electors is frozen. After this, you can only register at the poll.', action: 'Confirm your enrollment at elections.ca. Moving? Update your address before the deadline.' },
    { n: 3, name: 'Candidate Nominations', icon: '📝', status: 'past', keyDate: 'Day 21 before election', plain: 'Candidates must file nomination papers with a $1,000 deposit (returned if 10% of votes received).', action: 'Find your candidates at elections.ca/candidates.' },
    { n: 4, name: 'Advance Polling', icon: '🗳️', status: 'active', keyDate: '10, 9, 8, 7 days before E-Day', plain: 'Advance polls are open for 4 days. Any registered voter can vote at advance polls — no reason needed.', action: 'Find advance poll locations at elections.ca. Beat the election day lines — vote early.' },
    { n: 5, name: 'Special Ballot Deadline', icon: '✉️', status: 'active', keyDate: '6 days before election', plain: 'Deadline to apply for a special ballot (vote by mail). Your completed ballot must be received by 6pm ET on election day.', action: 'Apply at elections.ca/specialballot if you cannot vote in person.' },
    { n: 6, name: 'Campaign Final Days', icon: '📢', status: 'upcoming', keyDate: 'E-Day minus 1', plain: 'Final campaign push. Blackout period on election day: no advertising allowed on polling day.', action: 'Know your polling station (from your voter information card). Confirm your ID documents.' },
    { n: 7, name: 'Election Day', icon: '🗳️', status: 'upcoming', keyDate: 'Fixed or called date', plain: 'Polls open from 9:30am local time (staggered to avoid result leaks before western polls close).', action: 'Bring 2 pieces of ID with name + address, OR 1 ID + signed declaration. No ID? Ask someone in your division to vouch for you.' },
    { n: 8, name: 'Vote Counting', icon: '🔢', status: 'upcoming', keyDate: 'Election night', plain: 'Votes are counted manually in each of 338 ridings. Results usually known on election night.', action: 'Follow results at elections.ca or CBC. Wait for official calls — not social media.' },
    { n: 9, name: 'Official Results', icon: '📊', status: 'upcoming', keyDate: 'Within 7 days', plain: 'Elections Canada officially certifies results after reviewing all ballots including special ballots.', action: 'Official riding results at elections.ca/results.' },
    { n: 10, name: 'New PM Appointed', icon: '🏛️', status: 'upcoming', keyDate: 'Post-election', plain: 'The party leader able to command a majority of the House is invited to form government.', action: 'Contact your new MP at ourcommons.ca.' },
    { n: 11, name: 'Parliament Opens', icon: '🎉', status: 'upcoming', keyDate: 'Weeks after election', plain: 'The new Parliament convenes with the Speech from the Throne outlining the government\'s agenda.', action: 'Track Parliament at ourcommons.ca.' },
  ],
  AUS: [
    { n: 1, name: 'Writs Issued', icon: '📣', status: 'past', keyDate: 'GG issues on PM\'s advice', plain: 'The Governor-General issues election writs. A minimum 33-day campaign period begins.', action: 'Check your enrolment immediately at aec.gov.au — roll closes in about 7 days.' },
    { n: 2, name: 'Enrolment Closes', icon: '📋', status: 'past', keyDate: '7 days after writ', plain: 'The electoral roll is frozen. Last chance to enrol or update your details.', action: 'URGENT: Update or enrol at aec.gov.au/enrol before the deadline. Fines apply for not enrolling.' },
    { n: 3, name: 'Nominations Open', icon: '📝', status: 'past', keyDate: 'Writ + 10 days', plain: 'Candidates lodge nomination papers with a $2,000 deposit (returned if 4% of first-preferences received).', action: 'Find candidates in your electorate at aec.gov.au/election.' },
    { n: 4, name: 'Pre-Poll Voting Opens', icon: '🏢', status: 'active', keyDate: '12 days before polling day', plain: 'Any enrolled voter can vote early at an AEC pre-poll voting centre — no reason required.', action: 'Find your nearest pre-poll centre at aec.gov.au/voting. Lines are shorter than polling day.' },
    { n: 5, name: 'Postal Vote Deadline', icon: '✉️', status: 'active', keyDate: 'Apply by: 5 days before poll', plain: 'Apply for a postal vote at aec.gov.au. Your completed ballot must be received by AEC 13 days after polling day.', action: 'Apply for a postal vote if you will be away, ill, or live more than 8km from a polling place.' },
    { n: 6, name: 'Campaign Period', icon: '📢', status: 'upcoming', keyDate: 'Until midnight before poll', plain: 'Parties and candidates campaign. How-to-vote cards are distributed outside polling places on election day.', action: 'You are not required to follow any how-to-vote card — your preferences are entirely your choice.' },
    { n: 7, name: 'Election Day (Polling Day)', icon: '🗳️', status: 'upcoming', keyDate: 'Saturday (8am–6pm)', plain: 'Polls open 8am to 6pm Saturday. Voting is compulsory. Sausage sizzle often available outside.', action: 'No ID required — just give your name and address. Number EVERY box on the green ballot. Number at least 6 (above line) or 12 (below line) on the white Senate ballot.' },
    { n: 8, name: 'Counting Begins', icon: '🔢', status: 'upcoming', keyDate: 'Polling night', plain: 'First preferences are counted on election night. Distribution of preferences (the "count") continues over days.', action: 'Follow live results at aec.gov.au/results. Lower house (green ballot) results usually faster.' },
    { n: 9, name: 'Distribution of Preferences', icon: '📊', status: 'upcoming', keyDate: 'Days to weeks post-poll', plain: 'Under preferential voting, preferences are distributed from eliminated candidates until one candidate has 50%+1.', action: 'Wait for AEC\'s formal count for your electorate. Early calls can be wrong due to preferences.' },
    { n: 10, name: 'Return of Writs', icon: '📜', status: 'upcoming', keyDate: '~100 days after writs issued', plain: 'Election writs are returned with the official results. This formally ends the election.', action: 'Official results at aec.gov.au/results after writ return.' },
    { n: 11, name: 'New Parliament Opens', icon: '🏛️', status: 'upcoming', keyDate: 'Post-election', plain: 'The party or coalition able to command the House forms government. PM is sworn in by the GG.', action: 'Contact your MP and Senators at aph.gov.au.' },
  ],
};

interface Stage {
  n: number;
  name: string;
  icon: string;
  status: 'past' | 'active' | 'upcoming';
  keyDate: string;
  plain: string;
  action: string;
}

const statusStyles = {
  past:     { ring: 'bg-green-500 text-white',     line: 'bg-green-300',  label: 'Completed',  badge: '' },
  active:   { ring: 'bg-blue-600 text-white ring-4 ring-blue-200 scale-110', line: 'bg-blue-200', label: 'In Progress', badge: 'bg-blue-100 text-blue-700' },
  upcoming: { ring: 'bg-gray-200 text-gray-400',   line: 'bg-gray-200',   label: 'Upcoming',   badge: '' },
};

// ─── Named export — accepts props (used in Dashboard, etc.) ────────────────
export function ElectionTimeline({
  countryCode: propCountryCode,
  compact = false,
}: {
  countryCode?: string;
  compact?: boolean;
}) {
  const { countryCode: storeCountryCode } = useCivicStore();
  const [activeStage, setActiveStage] = useState<Stage | null>(null);

  const code = (propCountryCode ?? storeCountryCode ?? 'IND') as string;
  const stages = (TIMELINE_STAGES[code] ?? TIMELINE_STAGES['IND'])!;

  // Compact: show prev + active + next only
  const displayStages = compact
    ? (() => {
        const activeIdx = stages.findIndex(s => s.status === 'active');
        const idx = activeIdx >= 0 ? activeIdx : 0;
        return stages.slice(Math.max(0, idx - 1), idx + 3);
      })()
    : stages;

  return (
    <section className="w-full" aria-label="Election Timeline">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Election Lifecycle</h2>
          <p className="text-sm text-gray-500 mt-0.5">Click any stage for a plain-language explanation</p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {stages.filter(s => s.status === 'past').length}/{stages.length} stages past
        </span>
      </div>

      {/* Compact mode badge */}
      {compact && (
        <p className="text-white/40 text-xs mb-3">Showing {displayStages.length} of {stages.length} stages</p>
      )}

      {/* Timeline scroll container */}
      <div className="relative overflow-x-auto pb-4">
        <div className={`flex items-start gap-0 ${compact ? 'flex-col space-y-2' : 'min-w-max md:min-w-0 md:flex-wrap'}`}>
          {displayStages.map((stage, i) => {
            const st = statusStyles[stage.status];
            const isActive = activeStage?.n === stage.n;
            return (
              <div key={stage.n} className="flex items-center">
                {/* Stage node */}
                <div className="flex flex-col items-center w-20 md:w-24">
                  <button
                    onClick={() => setActiveStage(isActive ? null : stage)}
                    aria-expanded={isActive}
                    aria-label={`Stage ${stage.n}: ${stage.name} — ${st.label}`}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                      transition-all duration-200 cursor-pointer border-2
                      ${st.ring}
                      ${isActive ? 'border-blue-600 shadow-lg' : 'border-transparent'}
                      hover:scale-110 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                    `}
                  >
                    {stage.status === 'past' ? '✓' : stage.icon}
                  </button>
                  <span className={`mt-2 text-center text-[10px] font-semibold leading-tight px-1
                    ${stage.status === 'active' ? 'text-blue-700' : stage.status === 'past' ? 'text-gray-500' : 'text-gray-400'}
                  `}>
                    {stage.name}
                  </span>
                  {stage.status === 'active' && (
                    <span className="mt-1 text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      Now
                    </span>
                  )}
                </div>

                {/* Connector line — hide in compact vertical mode */}
                {!compact && i < displayStages.length - 1 && (
                  <div className={`h-0.5 w-4 md:w-6 mt-[-20px] flex-shrink-0 ${
                    displayStages[i + 1]?.status === 'upcoming' && stage.status !== 'active' ? 'bg-gray-200' : 'bg-green-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Panel */}
      {activeStage && (
        <div
          className={`mt-4 rounded-xl border-2 p-5 transition-all duration-200 ${
            activeStage.status === 'active'
              ? 'border-blue-300 bg-blue-50'
              : activeStage.status === 'past'
              ? 'border-green-200 bg-green-50'
              : 'border-gray-200 bg-gray-50'
          }`}
          role="region"
          aria-label={`Details for stage ${activeStage.n}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{activeStage.icon}</span>
                <div>
                  <h3 className="font-bold text-navy text-base">
                    Stage {activeStage.n}: {activeStage.name}
                  </h3>
                  <span className="text-xs text-gray-500">📅 {activeStage.keyDate}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">{activeStage.plain}</p>
              <div className="flex items-start gap-2 bg-white rounded-lg p-3 border border-gray-200">
                <span className="text-base">👉</span>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Your Action</p>
                  <p className="text-sm font-medium text-navy">{activeStage.action}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveStage(null)}
              aria-label="Close stage detail"
              className="text-gray-400 hover:text-gray-600 text-xl flex-shrink-0 mt-1"
            >×</button>
          </div>
        </div>
      )}

      {/* No country selected fallback */}
      {!TIMELINE_STAGES[code] && (
        <div className="text-center py-8 text-gray-400">
          <span className="text-3xl block mb-2">🌍</span>
          <p className="text-sm">Select your country to see the election timeline.</p>
        </div>
      )}
    </section>
  );
}

// ─── Default export — reads country from civicStore (original behaviour) ──────
export default function ElectionTimelineDefault() {
  return <ElectionTimeline />;
}
