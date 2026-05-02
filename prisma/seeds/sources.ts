// prisma/seeds/sources.ts — Official Source Registry

export const SOURCES = [
  // INDIA
  { code: 'ECI',      countryCode: 'IND', category: 'ELECTION_COMMISSION', name: 'Election Commission of India', url: 'https://eci.gov.in', volatilityClass: 'STABLE' },
  { code: 'NVSP',     countryCode: 'IND', category: 'VOTER_PORTAL',        name: 'National Voters Service Portal', url: 'https://voters.eci.gov.in', volatilityClass: 'STABLE' },
  { code: 'IND_1950', countryCode: 'IND', category: 'EMERGENCY_CONTACT',   name: 'National Voter Helpline', phone: '1950', url: 'https://nvsp.in', volatilityClass: 'STABLE' },
  // USA
  { code: 'VOTE_GOV', countryCode: 'USA', category: 'VOTER_PORTAL',        name: 'Vote.gov — Official US Voting Portal', url: 'https://vote.gov', volatilityClass: 'STABLE' },
  { code: 'EAC',      countryCode: 'USA', category: 'ELECTION_COMMISSION', name: 'US Election Assistance Commission', url: 'https://www.eac.gov', volatilityClass: 'STABLE' },
  { code: 'OUR_VOTE', countryCode: 'USA', category: 'EMERGENCY_CONTACT',   name: 'Election Protection Hotline', phone: '1-866-OUR-VOTE', url: 'https://866ourvote.org', volatilityClass: 'STABLE' },
  { code: 'FVAP',     countryCode: 'USA', category: 'VOTER_PORTAL',        name: 'Federal Voting Assistance Program (UOCAVA)', url: 'https://www.fvap.gov', volatilityClass: 'STABLE' },
  // UK
  { code: 'ECUK',         countryCode: 'GBR', category: 'ELECTION_COMMISSION', name: 'Electoral Commission UK', url: 'https://www.electoralcommission.org.uk', volatilityClass: 'STABLE' },
  { code: 'GOV_UK_VOTE',  countryCode: 'GBR', category: 'VOTER_PORTAL',        name: 'Register to Vote — GOV.UK', url: 'https://www.gov.uk/register-to-vote', volatilityClass: 'MEDIUM' },
  { code: 'GOV_UK_VAC',   countryCode: 'GBR', category: 'OFFICIAL_FORM',       name: 'Apply for Voter Authority Certificate', url: 'https://www.gov.uk/apply-for-photo-id-voter-authority-certificate', volatilityClass: 'MEDIUM' },
  { code: 'ECUK_HELPLINE',countryCode: 'GBR', category: 'EMERGENCY_CONTACT',   name: 'Electoral Commission Helpline', phone: '0800 328 0280', volatilityClass: 'STABLE' },
  // CANADA
  { code: 'EC_CA',    countryCode: 'CAN', category: 'ELECTION_COMMISSION', name: 'Elections Canada', url: 'https://www.elections.ca', volatilityClass: 'STABLE' },
  { code: 'EC_CA_TEL',countryCode: 'CAN', category: 'EMERGENCY_CONTACT',  name: 'Elections Canada Helpline', phone: '1-800-463-6868', volatilityClass: 'STABLE' },
  // AUSTRALIA
  { code: 'AEC',      countryCode: 'AUS', category: 'ELECTION_COMMISSION', name: 'Australian Electoral Commission', url: 'https://www.aec.gov.au', volatilityClass: 'STABLE' },
  { code: 'AEC_ENROL',countryCode: 'AUS', category: 'VOTER_PORTAL',        name: 'AEC Enrolment Portal', url: 'https://www.aec.gov.au/enrol', volatilityClass: 'STABLE' },
  { code: 'AEC_TEL',  countryCode: 'AUS', category: 'EMERGENCY_CONTACT',   name: 'AEC Helpline', phone: '13 23 26', volatilityClass: 'STABLE' },
];
