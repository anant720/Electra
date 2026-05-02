// =============================================================================
// ELECTRA — Troubleshooting Decision Service
// Blueprint: /ai_engine/troubleshooting_decision_engine.md
// Implements: Cure window logic, severity escalation, 5-country resolution paths
// =============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CountryCode, TroubleshootingScenario, EmergencyResolutionDto } from '@electra/types';

// ─── Escalation Ladder (from blueprint) ──────────────────────────────────────
const ESCALATION_LADDER: Record<CountryCode, Array<{ level: number; contact: string; phone?: string; url?: string; available: string }>> = {
  IND: [
    { level: 1, contact: 'Voter Helpline',                    phone: '1950',              url: 'eci.gov.in',          available: '24/7 during elections' },
    { level: 2, contact: 'Booth Level Officer (BLO)',          phone: '1950',              url: 'nvsp.in',             available: 'At polling station' },
    { level: 3, contact: 'Electoral Registration Officer (ERO)',                           url: 'eci.gov.in/contact',  available: 'Working hours' },
    { level: 4, contact: 'Chief Electoral Officer (CEO)',                                  url: 'eci.gov.in/ceo',      available: 'Working hours' },
    { level: 5, contact: 'Election Commission of India',                                   url: 'eci.gov.in',          available: 'Emergency only' },
  ],
  USA: [
    { level: 1, contact: 'Voter Protection Hotline',          phone: '1-866-687-8683',    url: 'vote.gov',            available: 'Election Day' },
    { level: 2, contact: 'County Election Office',                                         url: 'usa.gov/election-office', available: 'Working hours' },
    { level: 3, contact: 'State Secretary of State',                                       url: 'vote.gov/state',      available: 'Working hours' },
    { level: 4, contact: 'DOJ Voting Section',                phone: '1-800-253-3931',    url: 'justice.gov/voting',  available: 'Business hours' },
  ],
  GBR: [
    { level: 1, contact: 'Electoral Commission',              phone: '0800 328 0280',     url: 'electoralcommission.org.uk', available: 'Election hours' },
    { level: 2, contact: 'Local Council Electoral Office',                                 url: 'gov.uk/contact-electoral-registration-office', available: 'Working hours' },
    { level: 3, contact: 'Presiding Officer (at polling station)',                                                     available: 'Election Day only' },
  ],
  CAN: [
    { level: 1, contact: 'Elections Canada',                  phone: '1-800-463-6868',    url: 'elections.ca',        available: 'Election Day' },
    { level: 2, contact: 'Returning Officer',                                              url: 'elections.ca/contact', available: 'Working hours' },
  ],
  AUS: [
    { level: 1, contact: 'Australian Electoral Commission',   phone: '13 23 26',          url: 'aec.gov.au',          available: 'Election Day' },
    { level: 2, contact: 'Divisional Returning Officer',                                   url: 'aec.gov.au/contact',  available: 'Working hours' },
  ],
};

// ─── Severity Matrix ──────────────────────────────────────────────────────────
const BASE_SEVERITY: Record<TroubleshootingScenario, 'CRITICAL' | 'HIGH' | 'MEDIUM'> = {
  T01: 'CRITICAL', T02: 'HIGH', T03: 'HIGH',
  T04: 'HIGH',     T05: 'MEDIUM', T06: 'HIGH',
};

@Injectable()
export class TroubleshootingDecisionService {
  private readonly logger = new Logger(TroubleshootingDecisionService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Main Resolution Method ────────────────────────────────────────────────
  async resolve(
    scenario: TroubleshootingScenario,
    countryCode: CountryCode,
    daysToElection: number | null,
  ): Promise<EmergencyResolutionDto> {
    // 1. Fetch DB resolution paths (per-step records)
    const paths = await this.prisma.resolutionPath.findMany({
      where: {
        scenario: { code: scenario },
        country: { code: countryCode },
      },
      orderBy: { stepNumber: 'asc' },
    });

    // 2. Compute dynamic severity (escalates near election)
    const severity = this.computeSeverity(scenario, daysToElection);

    // 3. Compute cure window
    const cureWindow = this.computeCureWindow(scenario, countryCode, daysToElection);

    // 4. Build escalation steps
    const escalation = ESCALATION_LADDER[countryCode] ?? [];
    const escalationSteps = escalation.map((e, i) => ({
      step: i + 1,
      title: e.contact,
      action: [
        e.phone ? `Call: ${e.phone}` : '',
        e.url ? `Visit: ${e.url}` : '',
        `Available: ${e.available}`,
      ].filter(Boolean).join(' | '),
    }));

    if (paths.length) {
      return {
        countryCode,
        scenario,
        severity,
        cureWindow,
        steps: paths.map((p) => ({
          step: p.stepNumber,
          title: p.stepType,
          action: p.stepText,
          phone: p.officialContact ?? undefined,
        })),
        helpline: paths[0]?.officialContact ?? escalation[0]?.phone ?? null,
        escalationSteps,
      };
    }

    // 5. Fallback — country-not-seeded response
    this.logger.warn(`No DB resolution for ${countryCode}/${scenario} — using escalation ladder`);
    return {
      countryCode,
      scenario,
      severity,
      cureWindow,
      steps: [{
        step: 1,
        title: 'Contact your electoral authority immediately',
        action: `Call ${escalation[0]?.phone ?? 'your official helpline'} or visit ${escalation[0]?.url ?? 'the official electoral website'} for immediate assistance.`,
      }],
      helpline: escalation[0]?.phone ?? null,
      escalationSteps,
    };
  }

  // ─── Severity: escalates if within 7 days or election day ─────────────────
  private computeSeverity(
    scenario: TroubleshootingScenario,
    daysToElection: number | null,
  ): 'CRITICAL' | 'HIGH' | 'MEDIUM' {
    if (daysToElection !== null && daysToElection <= 1) return 'CRITICAL'; // Election day → everything critical
    if (daysToElection !== null && daysToElection <= 7) {
      // Escalate one level
      const base = BASE_SEVERITY[scenario];
      if (base === 'MEDIUM') return 'HIGH';
      return 'CRITICAL';
    }
    return BASE_SEVERITY[scenario];
  }

  // ─── Cure Window: determines options still available ──────────────────────
  private computeCureWindow(
    scenario: TroubleshootingScenario,
    countryCode: CountryCode,
    daysToElection: number | null,
  ): string {
    if (daysToElection === null) return 'Registration window open — check official source';

    if (daysToElection === 0) {
      if (scenario === 'T05') return 'Registration closed — no cure available for this election';
      return 'Election Day — immediate action only (call helpline now)';
    }

    if (daysToElection <= 7) {
      if (scenario === 'T05') return 'Registration likely closed — verify with electoral authority';
      return `${daysToElection} days to election — urgent action required`;
    }

    if (daysToElection <= 30) {
      return `${daysToElection} days to election — act soon to resolve`;
    }

    return 'Plenty of time to resolve — follow steps below';
  }

  // ─── Missed Deadline Special Response ────────────────────────────────────
  getMissedDeadlineResponse(countryCode: CountryCode): EmergencyResolutionDto {
    const specialCases: Record<CountryCode, string> = {
      IND: 'India: Registration for this election is closed. Register for the NEXT election at voters.eci.gov.in.',
      USA: 'USA: Some states allow same-day registration — verify at vote.gov for your state.',
      GBR: 'UK: Registration closed 12 working days before election. Verify at gov.uk/register-to-vote.',
      CAN: 'Canada: Same-day registration available at your polling station with valid ID.',
      AUS: 'Australia: The roll closes at 8pm on the day the writ is issued. Verify at aec.gov.au.',
    };

    return {
      countryCode,
      scenario: 'T05',
      severity: 'MEDIUM',
      cureWindow: specialCases[countryCode] ?? 'Verify with your electoral authority.',
      steps: [{
        step: 1,
        title: 'Check if registration is still possible',
        action: specialCases[countryCode] ?? 'Contact your electoral authority immediately.',
      }, {
        step: 2,
        title: 'Register now for the NEXT election',
        action: 'Even if you cannot vote in this election, registering now ensures you are ready for the next one.',
      }],
      helpline: ESCALATION_LADDER[countryCode]?.[0]?.phone ?? null,
    };
  }
}
