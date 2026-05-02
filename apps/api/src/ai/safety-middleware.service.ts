import { Injectable } from '@nestjs/common';

interface SafetyCheckResult {
  blocked: boolean;
  reason: string;
}

@Injectable()
export class SafetyMiddlewareService {
  private readonly POLITICAL_PATTERNS = [
    /which party/i, /who should i vote/i, /best (party|candidate)/i,
    /\b(bjp|congress|aap|bsp|sp|tmc)\b/i,
    /\b(democrat|republican|labour|tory|liberal)\b/i,
    /corrupt(ion)?\s+(party|government)/i, /protest|riot|violence/i,
  ];

  private readonly HALLUCINATION_SIGNALS = [
    /i (think|believe|assume)/i,
    /it (might|may|could) be/i,
    /i'm not sure but/i,
    /as far as i know/i,
    /i don't have (exact|current|latest)/i,
    /this may (have|be) (changed|different)/i,
  ];

  private readonly CIVIC_DOMAIN_KEYWORDS = [
    'vote', 'voter', 'election', 'register', 'registration', 'ballot', 'polling',
    'eligib', 'citizen', 'form 6', 'epic', 'constituency', 'nvsp', 'eci', 'ero',
    'deadline', 'id', 'identification', 'help', 'emergency', 'roll', 'enrol',
  ];

  preCheck(query: string): SafetyCheckResult {
    // Block political queries
    if (this.POLITICAL_PATTERNS.some((p) => p.test(query))) {
      return { blocked: true, reason: 'POLITICAL_QUERY' };
    }

    // Block very short or empty queries
    if (query.trim().length < 5) {
      return { blocked: true, reason: 'QUERY_TOO_SHORT' };
    }

    // Block queries with no civic domain relevance (very long, non-civic queries)
    const hasCivicContent = this.CIVIC_DOMAIN_KEYWORDS.some((k) =>
      query.toLowerCase().includes(k),
    );
    if (query.length > 50 && !hasCivicContent) {
      return { blocked: true, reason: 'OUT_OF_CIVIC_DOMAIN' };
    }

    return { blocked: false, reason: '' };
  }

  postCheck(response: string): { hallucination: boolean; signals: string[] } {
    const signals = this.HALLUCINATION_SIGNALS
      .filter((p) => p.test(response))
      .map((p) => p.source);

    return { hallucination: signals.length >= 2, signals };
  }
}
