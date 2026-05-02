// =============================================================================
// ELECTRA — Query Classifier Unit Tests
// System 1: Full QA Expansion — AI Engine
// =============================================================================

import { QueryClassifierService } from '../../apps/api/src/ai/query-classifier.service';

describe('QueryClassifierService', () => {
  let classifier: QueryClassifierService;

  beforeEach(() => {
    classifier = new QueryClassifierService();
  });

  const makeContext = (query: string, overrides?: any) => ({
    countryCode: 'IND',
    stateOrProvince: null,
    personaCode: 'P01',
    personaConfidence: 1.0,
    rawQuery: query,
    sessionId: 'test-session',
    language: 'en',
    isElectionDay: false,
    daysToElection: 30,
    ...overrides,
  });

  // ── Intent Classification ───────────────────────────────────────────────────
  describe('Intent Classification', () => {
    it('should classify registration queries correctly', async () => {
      const queries = [
        'How do I register to vote?',
        'What is Form 6?',
        'How to enrol on the electoral roll?',
        'I want to sign up as a voter at NVSP',
      ];
      for (const q of queries) {
        const result = await classifier.classify(makeContext(q));
        expect(result.intent).toBe('REGISTRATION');
      }
    });

    it('should classify eligibility queries correctly', async () => {
      const queries = [
        'Am I eligible to vote in India?',
        'What is the minimum age to vote?',
        'Can a 17 year old vote?',
        'Do I need to be a citizen?',
      ];
      for (const q of queries) {
        const result = await classifier.classify(makeContext(q));
        expect(result.intent).toBe('ELIGIBILITY');
      }
    });

    it('should classify process queries correctly', async () => {
      const queries = [
        'How do I vote at a polling booth?',
        'What is the polling process?',
        'How does the ballot work?',
      ];
      for (const q of queries) {
        const result = await classifier.classify(makeContext(q));
        expect(result.intent).toBe('PROCESS');
      }
    });
  });

  // ── Troubleshooting Scenario Detection ─────────────────────────────────────
  describe('Troubleshooting Scenario Detection', () => {
    const SCENARIO_TESTS: [string, string, string][] = [
      ['T01', 'My name is not on the voter list', 'Name missing from list'],
      ['T01', 'I am not found in the electoral roll', 'Not found in roll'],
      ['T02', 'I lost my Voter ID card', 'Lost ID'],
      ['T02', "I don't have my EPIC card", 'Missing EPIC'],
      ['T03', 'I moved to a new city and need to transfer', 'Address change'],
      ['T03', 'I relocated to Delhi from Mumbai', 'Relocation'],
      ['T04', 'I cannot find my polling station', 'Wrong booth'],
      ['T05', 'I need wheelchair accessibility assistance', 'Disability'],
    ];

    test.each(SCENARIO_TESTS)('should detect scenario %s: %s (%s)', async (scenario, query) => {
      const result = await classifier.classify(makeContext(query));
      expect(result.scenario).toBe(scenario);
      expect(result.intent).toBe('TROUBLESHOOTING');
    });
  });

  // ── Emergency Detection ─────────────────────────────────────────────────────
  describe('Emergency Detection', () => {
    it('should activate EMERGENCY on election day with urgent query', async () => {
      const result = await classifier.classify(makeContext(
        'My name is not on the list today', { isElectionDay: true, daysToElection: 0 }
      ));
      expect(result.isEmergency).toBe(true);
      expect(result.intent).toBe('EMERGENCY');
    });

    it('should NOT activate EMERGENCY if not election day', async () => {
      const result = await classifier.classify(makeContext(
        'My name is not on the list', { isElectionDay: false, daysToElection: 30 }
      ));
      expect(result.isEmergency).toBe(false);
    });
  });

  // ── Political Query Blocking ─────────────────────────────────────────────────
  describe('Political Query Blocking', () => {
    const POLITICAL_QUERIES = [
      'Which party should I vote for?',
      'Who is the best candidate?',
      'Should I vote for BJP or Congress?',
      'Are Democrats or Republicans better?',
      'Which party will help me most?',
    ];

    test.each(POLITICAL_QUERIES)('should block political query: %s', async (query) => {
      const result = await classifier.classify(makeContext(query));
      expect(result.isPoliticalQuery).toBe(true);
      expect(result.intent).toBe('GENERAL'); // Redirected, not answered
    });
  });

  // ── Myth Query Detection ────────────────────────────────────────────────────
  describe('Myth Query Detection', () => {
    it('should detect NRI postal vote myth query', async () => {
      const result = await classifier.classify(makeContext('Can NRI vote by post in India?'));
      expect(result.isMythQuery).toBe(true);
      expect(result.intent).toBe('MYTH_BUSTING');
    });
  });

  // ── Jargon Extraction ───────────────────────────────────────────────────────
  describe('Jargon Extraction', () => {
    it('should extract EPIC as jargon', async () => {
      const result = await classifier.classify(makeContext('What is an EPIC card?'));
      expect(result.jargonTerms).toContain('epic');
    });

    it('should extract EVM as jargon', async () => {
      const result = await classifier.classify(makeContext('How does the EVM work?'));
      expect(result.jargonTerms).toContain('evm');
    });
  });
});
