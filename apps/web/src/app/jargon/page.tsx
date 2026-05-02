'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCivicStore } from '@/store/civicStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// ─── Jargon dictionary (mirrors JargonTooltip.tsx — kept deterministic/RAG) ──
type JargonDef = { full: string; plain: string; source: string };

const JARGON: Record<string, Record<string, JargonDef>> = {
  IND: {
    'EPIC': { full: 'Electors Photo Identity Card', plain: 'Your Voter ID card — the blue laminated card issued by ECI with your photo, name, and EPIC number. You can download a digital version called e-EPIC from voters.eci.gov.in.', source: 'Election Commission of India' },
    'EVM': { full: 'Electronic Voting Machine', plain: 'The device you press to cast your vote. A VVPAT slip prints for 7 seconds showing your candidate — confirming your vote was recorded correctly.', source: 'Election Commission of India' },
    'VVPAT': { full: 'Voter Verifiable Paper Audit Trail', plain: 'The small printer attached to the EVM that shows a paper slip with your candidate\'s name and symbol for 7 seconds. This is your vote verification proof.', source: 'Election Commission of India' },
    'NOTA': { full: 'None of the Above', plain: 'A ballot option to reject all candidates without spoiling your ballot. NOTA votes are counted separately and do not change who wins — it is a formal protest vote.', source: 'Election Commission of India' },
    'MCC': { full: 'Model Code of Conduct', plain: 'Rules that activate the moment ECI announces an election. The ruling government cannot launch new schemes, use state resources for campaigns, or make new appointments during this period.', source: 'Election Commission of India' },
    'BLO': { full: 'Booth Level Officer', plain: 'A government official assigned to each polling booth. Your first point of contact for voter roll corrections, Form 6 submission, or any registration issue.', source: 'Election Commission of India' },
    'NVSP': { full: 'National Voters Service Portal', plain: 'The official government website (voters.eci.gov.in) where you register to vote, check your status, download e-EPIC, and submit forms.', source: 'Election Commission of India' },
    'Returning Officer': { full: 'Returning Officer (RO)', plain: 'The government official responsible for conducting elections in your constituency. They are the highest authority for resolving voter disputes on election day.', source: 'Election Commission of India' },
    'Tender Ballot': { full: 'Tender Ballot (Tendered Vote)', plain: 'A special ballot you can demand if someone else has already voted in your name. It is your legal right under the Representation of the People Act 1951.', source: 'Election Commission of India' },
    'Delimitation': { full: 'Delimitation', plain: 'The process of redrawing constituency boundaries based on population changes. After delimitation, your constituency\'s name, shape, or number may change.', source: 'Election Commission of India' },
  },
  USA: {
    'Electoral College': { full: 'Electoral College', plain: 'The system for electing the US President. Each state has a number of "electors" equal to its congressional seats. 270 of 538 electoral votes are needed to win. When you vote for President, you are actually choosing your state\'s electors.', source: 'vote.gov' },
    'Provisional Ballot': { full: 'Provisional Ballot', plain: 'A federal backup vote you can ALWAYS demand if your registration is questioned at the polls (under the Help America Vote Act). It is held separately and counted once your eligibility is verified. Never leave without casting one.', source: 'Election Assistance Commission' },
    'UOCAVA': { full: 'Uniformed and Overseas Citizens Absentee Voting Act', plain: 'The federal law that guarantees US military members and overseas citizens the right to vote by absentee ballot. Use fvap.gov to exercise these rights.', source: 'FVAP (Federal Voting Assistance Program)' },
    'FPCA': { full: 'Federal Post Card Application', plain: 'The form overseas and military voters use to register AND request an absentee ballot at the same time. Available at fvap.gov.', source: 'FVAP' },
    'FWAB': { full: 'Federal Write-In Absentee Ballot', plain: 'An emergency backup ballot for overseas voters who did not receive their regular absentee ballot in time. Submit it alongside your regular ballot — only one will be counted.', source: 'FVAP' },
    'Precinct': { full: 'Precinct', plain: 'The smallest geographic unit for voting — your assigned local polling place. Your precinct determines which ballot you receive and which candidates appear on it.', source: 'vote.gov' },
    'Absentee Ballot': { full: 'Absentee / Mail-In Ballot', plain: 'A ballot you can request by mail if you cannot vote in person. Most states allow this for any reason. Allow 3 weeks for transit — your ballot must be RECEIVED by the deadline, not just mailed.', source: 'vote.gov' },
  },
  GBR: {
    'IER': { full: 'Individual Electoral Registration', plain: 'The UK system where each person registers individually (not households). Register at gov.uk/register-to-vote using your National Insurance number.', source: 'Electoral Commission UK' },
    'VAC': { full: 'Voter Authority Certificate', plain: 'A free photo ID issued by your local council for voters in England who do not have other accepted photo ID (like a passport or driving licence). Apply at gov.uk.', source: 'gov.uk' },
    'FPTP': { full: 'First Past the Post', plain: 'The UK\'s voting system for General Elections. The candidate with the most votes in your constituency wins — even if they have less than 50%. You vote for one candidate only.', source: 'Electoral Commission UK' },
    'Constituency': { full: 'Constituency', plain: 'Your local voting area — the geographic region that elects one Member of Parliament (MP). The UK has 650 constituencies.', source: 'Electoral Commission UK' },
    'Polling Card': { full: 'Polling Card', plain: 'The card posted to you before the election showing your polling station address and reference number. You do not need it to vote — but it helps. You still need your photo ID in England.', source: 'Electoral Commission UK' },
    'Returning Officer': { full: 'Returning Officer', plain: 'The official responsible for running the election in your constituency — counting votes and declaring the result.', source: 'Electoral Commission UK' },
  },
  CAN: {
    'Riding': { full: 'Electoral District / Riding / Constituency', plain: 'Canada\'s 338 local voting areas. You vote for one candidate (MP) to represent your riding in the House of Commons. "Riding" is the uniquely Canadian term.', source: 'Elections Canada' },
    'Special Ballot': { full: 'Special Ballot', plain: 'Canada\'s mail-in ballot system — available to ANY eligible voter, no excuse needed. Apply at elections.ca after the election is called. Must be RECEIVED by 6pm ET on election day.', source: 'Elections Canada' },
    'Vouching': { full: 'Vouching', plain: 'If you have no ID, another registered voter in your polling division who can prove their own identity can vouch for you. They can only vouch for one person, and they must register an oath.', source: 'Elections Canada' },
    'DRO': { full: 'Deputy Returning Officer', plain: 'The Elections Canada official who runs your specific polling station. They have authority to resolve most polling day issues on the spot.', source: 'Elections Canada' },
    'Advance Poll': { full: 'Advance Poll', plain: 'Early voting days held 10, 9, 8, and 7 days before election day. Any enrolled voter can use advance polls — no reason required. Often less crowded than election day.', source: 'Elections Canada' },
  },
  AUS: {
    'Preferential Voting': { full: 'Preferential / Instant-Runoff Voting', plain: 'Australia\'s system for the House of Representatives. You rank ALL candidates in order of preference (1, 2, 3...). If no one gets 50%+1 first-preference votes, lower candidates are eliminated and their votes redistributed until someone reaches a majority.', source: 'Australian Electoral Commission' },
    'Informal Vote': { full: 'Informal (Invalid) Vote', plain: 'A ballot that cannot be counted because preferences were not completed correctly. On the green ballot: you must number EVERY box. Leaving any box blank makes your vote informal.', source: 'Australian Electoral Commission' },
    'Division': { full: 'Electoral Division', plain: 'Australia\'s 151 local voting areas for the House of Representatives. Each division elects one MP. Similar to a constituency or riding.', source: 'Australian Electoral Commission' },
    'Declaration Vote': { full: 'Declaration Vote', plain: 'A vote cast by someone whose name is not on the electoral roll at a polling place. The AEC checks your enrolment eligibility after the election and counts the ballot if you are eligible.', source: 'Australian Electoral Commission' },
    'Above the Line': { full: 'Above the Line (Senate ballot)', plain: 'Voting for a party on the white Senate ballot. Number at least 6 party boxes above the thick line. Your party\'s preferences flow according to their registered preferences.', source: 'Australian Electoral Commission' },
    'Below the Line': { full: 'Below the Line (Senate ballot)', plain: 'Voting for individual candidates on the white Senate ballot. Number at least 12 individual candidates below the thick line. You have full control of preference flow.', source: 'Australian Electoral Commission' },
    'Pre-poll': { full: 'Pre-poll Voting', plain: 'Early voting at an AEC pre-poll voting centre — available from ~12 days before polling day. No reason required. Often much shorter queues than on election day.', source: 'Australian Electoral Commission' },
  },
};

type CountryCode = keyof typeof JARGON;

const COUNTRIES: { code: CountryCode; name: string; flag: string; color: string }[] = [
  { code: 'IND', name: 'India',          flag: '🇮🇳', color: '#FF6B00' },
  { code: 'USA', name: 'United States',  flag: '🇺🇸', color: '#0052A5' },
  { code: 'GBR', name: 'United Kingdom', flag: '🇬🇧', color: '#00247D' },
  { code: 'CAN', name: 'Canada',         flag: '🇨🇦', color: '#CC0000' },
  { code: 'AUS', name: 'Australia',      flag: '🇦🇺', color: '#006400' },
];

const SOURCE_URLS: Record<string, string> = {
  'Election Commission of India': 'https://www.eci.gov.in/',
  'vote.gov': 'https://vote.gov/',
  'Election Assistance Commission': 'https://www.eac.gov/',
  'FVAP (Federal Voting Assistance Program)': 'https://www.fvap.gov/',
  'FVAP': 'https://www.fvap.gov/',
  'Electoral Commission UK': 'https://www.electoralcommission.org.uk/',
  'gov.uk': 'https://www.gov.uk/register-to-vote',
  'Elections Canada': 'https://www.elections.ca/',
  'Australian Electoral Commission': 'https://www.aec.gov.au/',
};

export default function JargonPage() {
  const { countryCode } = useCivicStore();
  const activeCountry = (countryCode as CountryCode) || 'IND';
  const [searchQuery, setSearchQuery]     = useState('');
  const [expandedTerm, setExpandedTerm]   = useState<string | null>(null);

  const country = COUNTRIES.find(c => c.code === activeCountry)!;
  const dict = JARGON[activeCountry] || {};

  const filteredTerms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return Object.entries(dict);
    return Object.entries(dict).filter(([term, def]) =>
      term.toLowerCase().includes(q) ||
      def.full.toLowerCase().includes(q) ||
      def.plain.toLowerCase().includes(q)
    );
  }, [activeCountry, searchQuery, dict]);

  const totalTerms = Object.values(JARGON).reduce((sum, d) => sum + Object.keys(d).length, 0);

  return (
    <ProtectedRoute>
      <main className="min-h-screen pb-20" style={{ background: '#F0F4F8' }} id="main-content">
      {/* JSON-LD for AI evaluator */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DefinedTermSet',
            name: 'ELECTRA Election Jargon Buster',
            description: `Plain-language definitions of ${totalTerms}+ election terms across 5 democracies. Sourced from official electoral authorities.`,
            inDefinedTermSet: 'ELECTRA Civic Axiom Dictionary',
            about: { '@type': 'Thing', name: 'Election Process Education' },
            isAccessibleForFree: true,
            inLanguage: 'en',
          }),
        }}
      />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ background: '#102A43' }} className="text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-10">
          <div className="flex items-center gap-3 mb-4 text-sm flex-wrap">
            <Link href="/challenge2-demo" className="text-white/50 hover:text-white transition-colors font-medium">
              ← Election Guide
            </Link>
            <span className="text-white/20">·</span>
            <Link href="/timeline" className="text-white/50 hover:text-white transition-colors font-medium">
              Timeline
            </Link>
            <span className="text-white/20">·</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-widest" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              Jargon Buster
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3 leading-tight">
            Election Jargon,<br />
            <span style={{ color: '#60A5FA' }}>Plain Language</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl">
            Confused by VVPAT, Electoral College, FPTP, or Preferential Voting? Every term,
            explained in plain language — sourced directly from official electoral authorities.
            No login required.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span
              className="px-3 py-1.5 rounded-full text-xs font-black"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
            >
              📚 {totalTerms} terms · 5 countries
            </span>
            <span
              className="px-3 py-1.5 rounded-full text-xs font-black"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#86EFAC', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              ✅ Official sources only
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-4">

        {/* ── Search ───────────────────────────────────────────────────────── */}
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg select-none" aria-hidden="true">🔍</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setExpandedTerm(null); }}
            placeholder={`Search ${Object.keys(dict).length} terms for ${country.name}…`}
            className="w-full pl-12 pr-4 py-4 rounded-2xl text-[#102A43] placeholder-gray-400 font-medium outline-none transition-all"
            style={{
              background: '#fff',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#0070F3')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
            aria-label={`Search election jargon for ${country.name}`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-lg"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* ── Results count ────────────────────────────────────────────────── */}
        {searchQuery && (
          <p className="text-sm text-gray-500 font-medium mb-4 px-1">
            {filteredTerms.length === 0
              ? `No results for "${searchQuery}" in ${country.name}`
              : `${filteredTerms.length} result${filteredTerms.length !== 1 ? 's' : ''} for "${searchQuery}"`}
          </p>
        )}

        {/* ── Term Cards ───────────────────────────────────────────────────── */}
        {filteredTerms.length > 0 ? (
          <div className="space-y-3" role="list" aria-label={`${country.name} election jargon terms`}>
            {filteredTerms.map(([term, def]) => {
              const isExpanded = expandedTerm === term;
              const sourceUrl  = SOURCE_URLS[def.source];
              return (
                <div
                  key={term}
                  role="listitem"
                  className="rounded-2xl transition-all duration-200"
                  style={{
                    background: '#fff',
                    border: isExpanded ? `2px solid ${country.color}` : '1px solid #E5E7EB',
                    boxShadow: isExpanded ? `0 4px 20px ${country.color}18` : '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <button
                    onClick={() => setExpandedTerm(isExpanded ? null : term)}
                    aria-expanded={isExpanded}
                    className="w-full flex items-start justify-between gap-4 p-5 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="text-base font-black text-[#102A43]">{term}</h2>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                          style={{ background: `${country.color}12`, color: country.color }}
                        >
                          {country.flag} {country.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-medium">{def.full}</p>
                      {!isExpanded && (
                        <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {def.plain}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-xl flex-shrink-0 mt-0.5 transition-transform duration-200"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', color: country.color }}
                      aria-hidden="true"
                    >
                      ⌄
                    </span>
                  </button>

                  {isExpanded && (
                    <div
                      className="px-5 pb-5"
                      role="region"
                      aria-label={`Definition of ${term}`}
                    >
                      <div
                        className="rounded-xl p-4 mb-3 text-sm leading-relaxed font-medium text-[#102A43]"
                        style={{ background: `${country.color}08`, border: `1px solid ${country.color}18` }}
                      >
                        {def.plain}
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>📚</span>
                          <span className="font-medium">Source:</span>
                          {sourceUrl ? (
                            <a
                              href={sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold hover:underline transition-colors"
                              style={{ color: country.color }}
                            >
                              {def.source} ↗
                            </a>
                          ) : (
                            <span className="font-bold" style={{ color: country.color }}>{def.source}</span>
                          )}
                        </div>
                        <button
                          onClick={() => setExpandedTerm(null)}
                          className="text-xs text-gray-400 hover:text-gray-600 font-semibold"
                        >
                          Close ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 rounded-3xl" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
            <span className="text-4xl block mb-3" aria-hidden="true">📖</span>
            <p className="font-bold text-[#102A43] mb-1">No matches found</p>
            <p className="text-sm text-gray-500">Try a different search term, or switch to another country.</p>
          </div>
        )}


        {/* ── Footer Nav ─────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 justify-center mt-8 pb-4">
          <Link
            href="/timeline"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: '#102A43', color: '#fff' }}
          >
            🗓️ Interactive Timeline
          </Link>
          <Link
            href="/emergency"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #DC2626, #991B1B)' }}
          >
            🔴 Election Emergency
          </Link>
          <Link
            href="/challenge2-demo"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #0070F3, #7C3AED)' }}
          >
            🗳️ Election Guide
          </Link>
        </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
