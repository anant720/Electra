// =============================================================================
// ELECTRA — Shared TypeScript Types
// Navigate Every Election.
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// CIVIC CONTEXT — The core state of a user's civic journey
// ─────────────────────────────────────────────────────────────────────────────

export type CountryCode = 'IND' | 'USA' | 'GBR' | 'CAN' | 'AUS';

export type PersonaCode = 'P01' | 'P02' | 'P03' | 'P04' | 'P05' | 'P06';

export type VolatilityClass = 'STABLE' | 'MEDIUM' | 'HIGH';

export type UserRole = 'CITIZEN' | 'CIVIC_EDITOR' | 'LEGAL_VALIDATOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface CivicQueryContext {
  countryCode: CountryCode | null;
  stateOrProvince: string | null;
  personaCode: PersonaCode | null;
  personaConfidence: number;
  rawQuery: string;
  sessionId: string;
  userId?: string;
  language: string;
  isElectionDay: boolean;
  daysToElection: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY CLASSIFICATION — 8-dimensional classifier output
// ─────────────────────────────────────────────────────────────────────────────

export type QueryIntent =
  | 'ELIGIBILITY'
  | 'REGISTRATION'
  | 'PROCESS'
  | 'TROUBLESHOOTING'
  | 'EMERGENCY'
  | 'JARGON'
  | 'MYTH_BUSTING'
  | 'DEADLINE'
  | 'VERIFICATION'
  | 'INFORMATIONAL'
  | 'GENERAL';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface QueryClassification {
  intent: QueryIntent;
  urgencyLevel: UrgencyLevel;
  isEmergency: boolean;
  scenario: TroubleshootingScenario | null;
  detectedCountry: CountryCode | null;
  detectedPersona: PersonaCode | null;
  jargonTerms: string[];
  isMythQuery: boolean;
  isPoliticalQuery: boolean;
}

export type TroubleshootingScenario = 'T01' | 'T02' | 'T03' | 'T04' | 'T05' | 'T06';

// ─────────────────────────────────────────────────────────────────────────────
// ROUTING DECISION
// ─────────────────────────────────────────────────────────────────────────────

export type ResponseMode = 'QUICK_ANSWER' | 'GUIDED_PATH' | 'DEEP_EXPLAIN' | 'EMERGENCY_MODE';

export interface RoutingDecision {
  mode: ResponseMode;
  countryCode: CountryCode;
  personaCode: PersonaCode;
  axiomKeys: string[];
  useEmergencyPath: boolean;
  skipAI: boolean; // true = deterministic lookup only
}

// ─────────────────────────────────────────────────────────────────────────────
// CIVIC AXIOM
// ─────────────────────────────────────────────────────────────────────────────

export interface CivicAxiomDto {
  id: string;
  key: string;
  countryCode: CountryCode;
  category: string;
  content: string;
  plainContent?: string;
  volatility: VolatilityClass;
  sourceName: string;
  sourceUrl: string;
  sourceCategory: string;
  verifiedAt: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI RESPONSE
// ─────────────────────────────────────────────────────────────────────────────

export interface ElectraAIResponse {
  content: string;
  mode: ResponseMode;
  confidenceScore: number;
  volatility: VolatilityClass;
  sources: CivicSourceRef[];
  hasLegalCaution: boolean;
  verifyUrl?: string;
  disclaimer: string;
  promptHash: string;
  latencyMs: number;
}

export interface CivicSourceRef {
  name: string;
  shortName: string;
  url: string;
  category: string;
  verifiedAt: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// EMERGENCY RESOLUTION
// ─────────────────────────────────────────────────────────────────────────────

export interface EmergencyStep {
  step: number;
  title: string;
  action: string;
}

export interface EmergencyResolutionDto {
  countryCode: CountryCode;
  scenario: TroubleshootingScenario;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  cureWindow: string;
  steps: EmergencyStep[];
  helpline: string | null;
  escalationSteps?: EmergencyStep[];
}

// ─────────────────────────────────────────────────────────────────────────────
// READINESS SCORE
// ─────────────────────────────────────────────────────────────────────────────

export interface ReadinessScore {
  total: number;          // 0–100
  registration: number;  // 0–30
  documentation: number; // 0–25
  deadlineAwareness: number; // 0–20
  location: number;      // 0–15
  emergencyPrepared: number; // 0–10
  nextAction: ReadinessAction | null;
  daysToElection: number | null;
}

export interface ReadinessAction {
  priority: number;
  title: string;
  description: string;
  url?: string;
  estimatedTime: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;        // userId
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSES — Standard envelope
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTRY & PERSONA DATA
// ─────────────────────────────────────────────────────────────────────────────

export interface CountryDto {
  code: CountryCode;
  name: string;
  nativeName: string | null;
  flagEmoji: string;
  hasStates: boolean;
  timezone: string;
  nextElection?: ElectionDto | null;
  sources?: CivicSourceRef[];
}

export interface ElectionDto {
  id: string;
  countryCode: CountryCode;
  electionType: string;
  name: string;
  electionDate: string;
  registrationDeadline: string | null;
  postalDeadline: string | null;
  status: string;
  volatility: VolatilityClass;
  daysUntil: number;
}

export interface PersonaProfile {
  code: PersonaCode;
  label: string;
  description: string;
  icon: string;
  readingLevel: 'grade-4' | 'grade-5' | 'grade-6' | 'grade-8' | 'grade-10';
  jargonMode: 'aggressive' | 'moderate' | 'none';
  responseMaxWords: number;
  tone: string;
  elderlyMode: boolean;
  accessibilityMode: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export const PERSONA_PROFILES: Record<PersonaCode, PersonaProfile> = {
  P01: {
    code: 'P01',
    label: 'First-time voter',
    description: "I've never voted before",
    icon: '🗳️',
    readingLevel: 'grade-6',
    jargonMode: 'aggressive',
    responseMaxWords: 200,
    tone: 'encouraging',
    elderlyMode: false,
    accessibilityMode: false,
  },
  P02: {
    code: 'P02',
    label: 'Student / Recently moved',
    description: 'I study or live in a different city',
    icon: '🎓',
    readingLevel: 'grade-8',
    jargonMode: 'moderate',
    responseMaxWords: 250,
    tone: 'practical',
    elderlyMode: false,
    accessibilityMode: false,
  },
  P03: {
    code: 'P03',
    label: 'Living overseas',
    description: "I'm outside my home country",
    icon: '🌍',
    readingLevel: 'grade-8',
    jargonMode: 'moderate',
    responseMaxWords: 300,
    tone: 'detailed-procedural',
    elderlyMode: false,
    accessibilityMode: false,
  },
  P04: {
    code: 'P04',
    label: 'Senior voter',
    description: "I'd like simpler guidance",
    icon: '👴',
    readingLevel: 'grade-5',
    jargonMode: 'aggressive',
    responseMaxWords: 150,
    tone: 'patient-respectful',
    elderlyMode: true,
    accessibilityMode: false,
  },
  P05: {
    code: 'P05',
    label: 'Accessibility needs',
    description: 'I need assistance voting',
    icon: '♿',
    readingLevel: 'grade-6',
    jargonMode: 'aggressive',
    responseMaxWords: 200,
    tone: 'clear-rights-first',
    elderlyMode: false,
    accessibilityMode: true,
  },
  P06: {
    code: 'P06',
    label: 'Emergency',
    description: 'I need help right now',
    icon: '🔴',
    readingLevel: 'grade-4',
    jargonMode: 'none',
    responseMaxWords: 120,
    tone: 'calm-immediate',
    elderlyMode: false,
    accessibilityMode: false,
  },
};

export const MVP_COUNTRIES: CountryCode[] = ['IND', 'USA', 'GBR', 'CAN', 'AUS'];

export const COUNTRY_METADATA: Record<CountryCode, { helpline: string; registrationUrl: string }> = {
  IND: { helpline: '1950', registrationUrl: 'https://voters.eci.gov.in' },
  USA: { helpline: '1-866-687-8683', registrationUrl: 'https://vote.gov' },
  GBR: { helpline: '0800 328 0280', registrationUrl: 'https://www.gov.uk/register-to-vote' },
  CAN: { helpline: '1-800-463-6868', registrationUrl: 'https://ereg.elections.ca' },
  AUS: { helpline: '13 23 26', registrationUrl: 'https://www.aec.gov.au/enrol' },
};


