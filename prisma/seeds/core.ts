// prisma/seeds/core.ts — Regions, Countries, Personas, Scenarios

export const REGIONS = [
  { code: 'SOUTH_ASIA',    name: 'South Asia',        description: 'Indian subcontinent democracies' },
  { code: 'NORTH_AMERICA', name: 'North America',      description: 'USA and Canada' },
  { code: 'EUROPE',        name: 'Europe',             description: 'UK and European democracies' },
  { code: 'ASIA_PACIFIC',  name: 'Asia-Pacific',       description: 'Australia and Pacific' },
];

export const COUNTRIES = [
  {
    code: 'IND', regionCode: 'SOUTH_ASIA', name: 'India', nameLocal: 'भारत',
    flagEmoji: '🇮🇳', governanceType: 'Federal Parliamentary Republic',
    headOfStateRole: 'President', headOfGovernmentRole: 'Prime Minister',
    authorityName: 'Election Commission of India', authorityAbbr: 'ECI',
    authorityPortal: 'https://eci.gov.in', voterHelpline: '1950',
    votingAge: 18, compulsoryVoting: false, registrationModel: 'opt-in',
    electoralSystemLower: 'First Past the Post (FPTP)',
    electoralSystemUpper: 'Single Transferable Vote (STV) — indirect',
    complexityScore: 8, legalVolatilityScore: 6, isMvp: true,
  },
  {
    code: 'USA', regionCode: 'NORTH_AMERICA', name: 'United States', nameLocal: 'United States',
    flagEmoji: '🇺🇸', governanceType: 'Federal Presidential Republic',
    headOfStateRole: 'President', headOfGovernmentRole: 'President',
    authorityName: 'State Secretaries of State / Election Assistance Commission', authorityAbbr: 'EAC',
    authorityPortal: 'https://vote.gov', voterHelpline: '1-866-687-8683',
    votingAge: 18, compulsoryVoting: false, registrationModel: 'opt-in',
    electoralSystemLower: 'First Past the Post / Electoral College (President)',
    electoralSystemUpper: 'First Past the Post',
    complexityScore: 9, legalVolatilityScore: 9, isMvp: true,
  },
  {
    code: 'GBR', regionCode: 'EUROPE', name: 'United Kingdom', nameLocal: 'United Kingdom',
    flagEmoji: '🇬🇧', governanceType: 'Unitary Parliamentary Constitutional Monarchy',
    headOfStateRole: 'Monarch', headOfGovernmentRole: 'Prime Minister',
    authorityName: 'Electoral Commission', authorityAbbr: 'ECUK',
    authorityPortal: 'https://www.electoralcommission.org.uk', voterHelpline: '0800 328 0280',
    votingAge: 18, compulsoryVoting: false, registrationModel: 'opt-in',
    electoralSystemLower: 'First Past the Post (FPTP)',
    electoralSystemUpper: 'N/A — House of Lords unelected',
    complexityScore: 5, legalVolatilityScore: 5, isMvp: true,
  },
  {
    code: 'CAN', regionCode: 'NORTH_AMERICA', name: 'Canada', nameLocal: 'Canada',
    flagEmoji: '🇨🇦', governanceType: 'Federal Parliamentary Constitutional Monarchy',
    headOfStateRole: 'Monarch (Governor General)', headOfGovernmentRole: 'Prime Minister',
    authorityName: 'Elections Canada', authorityAbbr: 'EC',
    authorityPortal: 'https://www.elections.ca', voterHelpline: '1-800-463-6868',
    votingAge: 18, compulsoryVoting: false, registrationModel: 'automatic',
    electoralSystemLower: 'First Past the Post (338 ridings)',
    electoralSystemUpper: 'Appointed — Senate',
    complexityScore: 5, legalVolatilityScore: 4, isMvp: true,
  },
  {
    code: 'AUS', regionCode: 'ASIA_PACIFIC', name: 'Australia', nameLocal: 'Australia',
    flagEmoji: '🇦🇺', governanceType: 'Federal Parliamentary Constitutional Monarchy',
    headOfStateRole: 'Monarch (Governor-General)', headOfGovernmentRole: 'Prime Minister',
    authorityName: 'Australian Electoral Commission', authorityAbbr: 'AEC',
    authorityPortal: 'https://www.aec.gov.au', voterHelpline: '13 23 26',
    votingAge: 18, compulsoryVoting: true, compulsoryFineAmount: 20, compulsoryFineCurrency: 'AUD',
    registrationModel: 'opt-in',
    electoralSystemLower: 'Instant-Runoff / Preferential Voting',
    electoralSystemUpper: 'Single Transferable Vote (STV)',
    complexityScore: 6, legalVolatilityScore: 3, isMvp: true,
  },
];

export const PERSONAS = [
  { code: 'P01', name: 'First-Time Voter', shortLabel: 'First Timer', guidanceMode: 'step_by_step', readingLevel: 'plain', primaryEmotion: 'excited but confused', coreFear: 'Making a mistake that disqualifies my vote', checklistType: 'first_time' },
  { code: 'P02', name: 'Student / Relocated', shortLabel: 'Relocated', guidanceMode: 'address_focused', readingLevel: 'plain', primaryEmotion: 'uncertain about address rules', coreFear: 'Not knowing which address to use', checklistType: 'relocation' },
  { code: 'P03', name: 'Overseas / NRI', shortLabel: 'Overseas', guidanceMode: 'overseas_focused', readingLevel: 'plain', primaryEmotion: 'disconnected from home country rules', coreFear: 'Missing the deadline from abroad', checklistType: 'overseas' },
  { code: 'P04', name: 'Senior Voter', shortLabel: 'Senior', guidanceMode: 'simplified', readingLevel: 'simple', primaryEmotion: 'needs reassurance', coreFear: 'Physical barriers at polling station', checklistType: 'senior' },
  { code: 'P05', name: 'Voter with Disability', shortLabel: 'Accessibility', guidanceMode: 'accessibility', readingLevel: 'plain', primaryEmotion: 'concern about physical access', coreFear: 'Being turned away at the booth', checklistType: 'disability' },
  { code: 'P06', name: 'Election Day Emergency', shortLabel: 'Emergency', guidanceMode: 'emergency', readingLevel: 'plain', primaryEmotion: 'panicked', coreFear: 'Losing my vote due to a crisis', checklistType: 'emergency' },
];

export const SCENARIOS = [
  { code: 'T01', title: 'Name Missing from Voter Roll', severity: 'CRITICAL', timing: 'Election Day', isEmergency: true, triggerPhrases: ['name not on list', 'not on roll', 'cant find me', 'name missing'] },
  { code: 'T02', title: 'Lost or Missing Voter ID', severity: 'HIGH', timing: 'Election Day', isEmergency: true, triggerPhrases: ['lost voter id', 'no id', 'forgot id', 'lost epic'] },
  { code: 'T03', title: 'Moved to New Address', severity: 'MEDIUM', timing: 'Pre-election', isEmergency: false, triggerPhrases: ['moved house', 'new address', 'changed address', 'relocated'] },
  { code: 'T04', title: 'Cannot Find Polling Station', severity: 'HIGH', timing: 'Election Day', isEmergency: true, triggerPhrases: ['where to vote', 'polling station', 'polling booth', 'cant find booth'] },
  { code: 'T05', title: 'Accessibility Issue at Booth', severity: 'HIGH', timing: 'Election Day', isEmergency: true, triggerPhrases: ['wheelchair', 'disabled', 'accessibility', 'cant enter booth'] },
  { code: 'T06', title: 'Technical Problem at Booth', severity: 'HIGH', timing: 'Election Day', isEmergency: true, triggerPhrases: ['evm not working', 'machine broken', 'technical issue', 'system down'] },
];
