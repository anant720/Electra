// =============================================================================
// ELECTRA — Safety Middleware Unit Tests
// System 1: Full QA Expansion — AI Safety
// =============================================================================

import { SafetyMiddlewareService } from '../../apps/api/src/ai/safety-middleware.service';

describe('SafetyMiddlewareService', () => {
  let safety: SafetyMiddlewareService;

  beforeEach(() => {
    safety = new SafetyMiddlewareService();
  });

  // ── Pre-Check: Block Political Queries ─────────────────────────────────────
  describe('preCheck() — Political Block', () => {
    const BLOCKED_QUERIES = [
      'Which party should I vote for?',
      'Who is the best candidate in the election?',
      'Should I vote BJP or Congress?',
      'Tell me about the Republican policies',
      'Labour vs Tory, who wins?',
      'Is Modi corrupt?',
      'Which candidate is corrupt?',
    ];

    test.each(BLOCKED_QUERIES)('should block: %s', (query) => {
      const result = safety.preCheck(query);
      expect(result.blocked).toBe(true);
    });
  });

  // ── Pre-Check: Allow Civic Queries ─────────────────────────────────────────
  describe('preCheck() — Allow Civic Queries', () => {
    const ALLOWED_QUERIES = [
      'How do I register to vote in India?',
      'What documents do I need to vote?',
      'Am I eligible to vote at 18?',
      'My name is not on the voter list',
      'How do I find my polling station?',
      'What is the voter registration deadline?',
    ];

    test.each(ALLOWED_QUERIES)('should allow: %s', (query) => {
      const result = safety.preCheck(query);
      expect(result.blocked).toBe(false);
    });
  });

  // ── Pre-Check: Block Too-Short Queries ─────────────────────────────────────
  describe('preCheck() — Minimum Query Length', () => {
    it('should block queries shorter than 5 chars', () => {
      expect(safety.preCheck('hi').blocked).toBe(true);
      expect(safety.preCheck('ok').blocked).toBe(true);
      expect(safety.preCheck('   ').blocked).toBe(true);
    });
  });

  // ── Post-Check: Hallucination Detection ────────────────────────────────────
  describe('postCheck() — Hallucination Detection', () => {
    it('should flag response with 2+ hallucination signals', () => {
      const response = 'I think the deadline might be in March, though I am not sure but it may be different in your state.';
      const result = safety.postCheck(response);
      expect(result.hallucination).toBe(true);
      expect(result.signals.length).toBeGreaterThanOrEqual(2);
    });

    it('should NOT flag clean deterministic response', () => {
      const response = 'The voter registration deadline in India is 30 days before the election date as per ECI guidelines. Verify at eci.gov.in.';
      const result = safety.postCheck(response);
      expect(result.hallucination).toBe(false);
    });

    it('should NOT flag response with only 1 uncertain signal', () => {
      const response = 'The registration process involves submitting Form 6. I think you should visit voters.eci.gov.in for the exact deadline.';
      const result = safety.postCheck(response);
      // Only 1 signal — below threshold
      expect(result.hallucination).toBe(false);
    });
  });
});
