import { Injectable } from '@nestjs/common';
import {
  CivicQueryContext,
  QueryClassification,
  QueryIntent,
  TroubleshootingScenario,
  CountryCode,
  PersonaCode,
  UrgencyLevel,
} from '@electra/types';

// ─── Country Signal Maps (from blueprint: query_classification_engine.md) ────
const COUNTRY_SIGNALS: Record<CountryCode, string[]> = {
  IND: [
    'india', 'indian', 'eci', 'lok sabha', 'rajya sabha', 'vidhan sabha',
    'nvsp', 'epic', 'form 6', 'form 8', 'voter id card', 'election commission india',
    'aadhaar', 'blo', 'ero', 'nvra india', 'nota', 'evm', 'vvpat', 'mcc',
    'maharashtra', 'delhi', 'bengaluru', 'mumbai', 'hyderabad', 'kolkata',
    'chennai', 'gujarat', 'rajasthan', 'bihar', 'uttar pradesh', 'punjab',
  ],
  USA: [
    'usa', 'america', 'american', 'united states', 'us election',
    'federal election', 'presidential', 'congress', 'house of representatives',
    'electoral college', 'vote.gov', 'secretary of state', 'absentee',
    'mail-in ballot', 'provisional ballot', 'hava', 'nvra', 'uocava',
    'california', 'texas', 'new york', 'florida', 'ohio', 'pennsylvania',
  ],
  GBR: [
    'uk', 'britain', 'british', 'england', 'scotland', 'wales',
    'northern ireland', 'parliament', 'general election', 'electoral commission',
    'voter authority certificate', 'vac', 'royal mail postal vote', 'polling card',
    'presiding officer', 'returning officer', 'fptp', 'gov.uk/register',
  ],
  CAN: [
    'canada', 'canadian', 'elections canada', 'vote.ca', 'federal riding',
    'member of parliament', 'advance polls', 'voter information card',
    'returning officer canada', 'indigenous voter',
  ],
  AUS: [
    'australia', 'australian', 'aec', 'australian electoral commission',
    'compulsory', 'preferential', 'informal vote', 'absent vote', 'pre-poll',
    'senate', 'house australia', 'how-to-vote card',
  ],
};

// ─── Persona Signal Maps ─────────────────────────────────────────────────────
const PERSONA_SIGNALS: Record<string, string[]> = {
  P01: ['first time', 'just turned 18', 'never voted', 'new voter', 'first election', 'first-time'],
  P02: ['student', 'college', 'university', 'hostel', 'moved for studies', 'different city', 'studying away'],
  P03: ['nri', 'overseas', 'abroad', 'outside india', 'living in', 'foreign country', 'expat', 'uocava', 'fpca'],
  P04: ['elderly', 'senior', 'old', 'grandfather', 'grandmother', 'age', 'senior citizen'],
  P05: ['disabled', 'disability', 'wheelchair', 'blind', 'deaf', 'accessibility', 'assisted', 'mobility'],
  P06: ['lost id', 'emergency', 'election day', 'today', 'right now', 'urgent', 'immediately', 'help me now'],
};

// ─── Emotional State Signals ──────────────────────────────────────────────────
const EMOTIONAL_SIGNALS: Record<string, string[]> = {
  PANICKED:   ['help', 'urgent', 'immediately', 'what do i do', 'election day', 'right now', 'scared', 'panic'],
  FRUSTRATED: ['why', "can't", 'impossible', 'ridiculous', 'again', 'still not', 'rejected', 'not working'],
  CONFUSED:   ['confused', "don't understand", 'complicated', 'unclear', 'what does', 'i thought', "don't know"],
  UNCERTAIN:  ['i think', 'maybe', 'not sure', 'not certain', 'is it', 'should i', 'probably'],
};

@Injectable()
export class QueryClassifierService {
  // ─── Scenario Detection Keywords ─────────────────────────────────────────
  private readonly SCENARIO_KEYWORDS: Record<TroubleshootingScenario, string[]> = {
    T01: ['name not on', 'missing from list', 'not found', 'not in register', 'not on roll', 'enrollment missing', 'name not in voter', 'not found on electoral'],
    T02: ['lost voter id', 'lost epic', 'lost card', "don't have id", 'damaged card', 'no voter card', 'id stolen', 'lost my voter', 'can\'t find epic'],
    T03: ['moved', 'relocated', 'new address', 'different state', 'transferred', 'new city', 'name spelling wrong', 'wrong address on', 'address error'],
    T04: ['wrong booth', 'wrong station', 'wrong polling', "can't find booth", 'wrong precinct', "can't find polling", 'different location assigned'],
    T05: ['missed the deadline', 'registration closed', 'deadline passed', 'too late to register', 'registration expired'],
    T06: ['ballot not arrived', 'overseas ballot', 'postal ballot', 'mail ballot missing', 'ballot hasn\'t arrived', 'absentee not received'],
  };

  private readonly EMERGENCY_KEYWORDS = [
    'today', 'election day', 'right now', 'urgent', 'emergency', 'voting today',
    'polls open', 'ballot', 'immediately', 'help me now',
  ];

  private readonly MYTH_KEYWORDS = [
    'can nri vote by post', 'postal vote nri', 'proxy vote', 'vote online', 'is it true',
    'myth', 'heard that', 'someone told me', 'i heard', 'rumor', 'really true', 'fake news',
  ];

  private readonly POLITICAL_KEYWORDS = [
    'which party', 'who should i vote for', 'best candidate', 'corrupt government',
    'bjp', 'congress', 'aap', 'bsp', 'sp', 'tmc',
    'democrat', 'republican', 'labour', 'tory', 'liberal party',
    'modi', 'gandhi party', 'who will win',
  ];

  private readonly DEADLINE_KEYWORDS = [
    'deadline', 'last day', 'last date', 'cutoff', 'by when',
    'how long', 'registration closes', 'when can i register', 'when does',
  ];

  private readonly JARGON_KEYWORDS = [
    'what is epic', 'what is evm', 'what is vvpat', 'what is nota', 'what is nvsp',
    'what is form 6', 'what is ero', 'what is blo', 'what is mcc',
    'what is uocava', 'what is nvra', 'what is hava', 'what is fptp', 'what is stv',
    'what is vac', 'what is ier', 'what is fpca', 'what is fwab',
    'explain epic', 'explain evm', 'explain nota',
  ];

  // ─── Main Classify Method ─────────────────────────────────────────────────
  async classify(context: CivicQueryContext): Promise<QueryClassification> {
    const q = context.rawQuery.toLowerCase().trim();

    // STAGE 1: Political hard-block (always first)
    if (this.POLITICAL_KEYWORDS.some((k) => q.includes(k))) {
      return this.buildClassification({
        intent: 'GENERAL',
        isPoliticalQuery: true,
        urgencyLevel: 'LOW',
        isEmergency: false,
        scenario: null,
        isMythQuery: false,
        detectedCountry: null,
        detectedPersona: null,
        jargonTerms: [],
      });
    }

    // STAGE 2: Emergency detection (before all other classification)
    const isElectionDay = context.isElectionDay || context.daysToElection === 0;
    const hasEmergencyKeyword = this.EMERGENCY_KEYWORDS.some((k) => q.includes(k));
    const scenario = this.detectScenario(q);
    const isEmergency = isElectionDay && (hasEmergencyKeyword || scenario !== null);

    // STAGE 3: Country detection
    const detectedCountry = this.detectCountry(q, context.countryCode);

    // STAGE 4: Persona detection
    const detectedPersona = this.detectPersona(q);

    // STAGE 5: Emotional state + urgency
    const emotionalState = this.detectEmotionalState(q);
    const urgencyLevel = this.computeUrgency(isEmergency, emotionalState, context.daysToElection);

    // STAGE 6: Intent classification
    const isMythQuery = this.MYTH_KEYWORDS.some((k) => q.includes(k));
    const intent = this.classifyIntent(q, isEmergency, !!scenario, isMythQuery);

    // STAGE 7: Jargon extraction
    const jargonTerms = this.extractJargon(q);

    return this.buildClassification({
      intent,
      isEmergency,
      scenario,
      isMythQuery,
      isPoliticalQuery: false,
      detectedCountry,
      detectedPersona,
      urgencyLevel,
      jargonTerms,
    });
  }

  // ─── Stage 3: Country Detection ───────────────────────────────────────────
  private detectCountry(q: string, fallback: CountryCode | null): CountryCode | null {
    if (fallback) return fallback; // Session context takes priority
    const scores: Partial<Record<CountryCode, number>> = {};
    for (const [country, signals] of Object.entries(COUNTRY_SIGNALS) as [CountryCode, string[]][]) {
      const matched = signals.filter((s) => q.includes(s)).length;
      if (matched > 0) scores[country] = matched;
    }
    const sorted = (Object.entries(scores) as [CountryCode, number][]).sort(([, a], [, b]) => b - a);
    return sorted[0]?.[0] ?? null;
  }

  // ─── Stage 4: Persona Detection ───────────────────────────────────────────
  private detectPersona(q: string): PersonaCode | null {
    for (const [code, signals] of Object.entries(PERSONA_SIGNALS)) {
      if (signals.some((s) => q.includes(s))) return code as PersonaCode;
    }
    return null;
  }

  // ─── Stage 5: Emotional State ─────────────────────────────────────────────
  private detectEmotionalState(q: string): string {
    for (const [state, signals] of Object.entries(EMOTIONAL_SIGNALS)) {
      if (signals.some((s) => q.includes(s))) return state;
    }
    return 'CALM';
  }

  private computeUrgency(
    isEmergency: boolean,
    emotionalState: string,
    daysToElection: number | null,
  ): UrgencyLevel {
    if (isEmergency) return 'CRITICAL';
    if (emotionalState === 'PANICKED') return 'HIGH';
    if (daysToElection !== null && daysToElection <= 7) return 'HIGH';
    if (emotionalState === 'FRUSTRATED') return 'MEDIUM';
    return 'LOW';
  }

  // ─── Stage 6: Intent Classification ──────────────────────────────────────
  private classifyIntent(
    q: string,
    isEmergency: boolean,
    hasScenario: boolean,
    isMythQuery: boolean,
  ): QueryIntent {
    if (isEmergency) return 'EMERGENCY';
    if (hasScenario) return 'TROUBLESHOOTING';
    if (isMythQuery) return 'MYTH_BUSTING';
    if (this.DEADLINE_KEYWORDS.some((k) => q.includes(k))) return 'DEADLINE';
    if (this.JARGON_KEYWORDS.some((k) => q.includes(k))) return 'JARGON';
    if (/register|enrol|sign up|form 6|form6|nvsp|new voter|first time|first vote|just turned 18|just turned 19/.test(q)) return 'REGISTRATION';
    if (/eligible|eligib|qualify|citizen|age|18 year|19 year|who can vote/.test(q)) return 'ELIGIBILITY';
    if (/how to vote|polling|booth|ballot|process|election process/.test(q)) return 'PROCESS';
    if (/real website|official site|is this correct|fake|scam|verify url|right link/.test(q)) return 'VERIFICATION';
    if (/how does|how do|what happens|tell me about|overview|explain/.test(q)) return 'INFORMATIONAL';
    return 'GENERAL';
  }

  // ─── Scenario Detection ───────────────────────────────────────────────────
  private detectScenario(q: string): TroubleshootingScenario | null {
    for (const [scenario, keywords] of Object.entries(this.SCENARIO_KEYWORDS)) {
      if (keywords.some((k) => q.includes(k))) return scenario as TroubleshootingScenario;
    }
    return null;
  }

  // ─── Jargon Extraction ───────────────────────────────────────────────────
  private extractJargon(q: string): string[] {
    const jargon: Record<string, string> = {
      epic: 'Voter ID Card (Electors Photo Identity Card)',
      ero: 'Electoral Registration Officer',
      blo: 'Booth Level Officer',
      nvsp: 'National Voters Service Portal',
      evm: 'Electronic Voting Machine',
      vvpat: 'Voter Verified Paper Audit Trail',
      nota: 'None of the Above',
      mcc: 'Model Code of Conduct',
      fptp: 'First Past The Post',
      stv: 'Single Transferable Vote',
      hava: 'Help America Vote Act',
      nvra: 'National Voter Registration Act',
      uocava: 'Uniformed and Overseas Citizens Absentee Voting Act',
      fpca: 'Federal Post Card Application',
      fwab: 'Federal Write-In Absentee Ballot',
      vac: 'Voter Authority Certificate',
      ier: 'Individual Electoral Registration',
    };
    return Object.keys(jargon).filter((term) => q.includes(term));
  }

  // ─── Build Result ─────────────────────────────────────────────────────────
  private buildClassification(partial: {
    intent: QueryIntent;
    isPoliticalQuery: boolean;
    urgencyLevel?: UrgencyLevel;
    isEmergency?: boolean;
    scenario?: TroubleshootingScenario | null;
    isMythQuery?: boolean;
    detectedCountry?: CountryCode | null;
    detectedPersona?: PersonaCode | null;
    jargonTerms?: string[];
  }): QueryClassification {
    return {
      intent: partial.intent,
      urgencyLevel: partial.urgencyLevel ?? 'LOW',
      isEmergency: partial.isEmergency ?? false,
      scenario: partial.scenario ?? null,
      detectedCountry: partial.detectedCountry ?? null,
      detectedPersona: partial.detectedPersona ?? null,
      jargonTerms: partial.jargonTerms ?? [],
      isMythQuery: partial.isMythQuery ?? false,
      isPoliticalQuery: partial.isPoliticalQuery,
    };
  }
}

