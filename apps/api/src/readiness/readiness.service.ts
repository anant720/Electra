// =============================================================================
// ELECTRA — Readiness Score Engine (System 9)
// Weighted 5-domain preparedness scoring
// =============================================================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ReadinessScore, ReadinessAction, CountryCode } from '@electra/types';

// Domain weights — must sum to 100
const DOMAIN_WEIGHTS = {
  registration: 30,
  documentation: 25,
  deadlineAwareness: 20,
  location: 15,
  emergencyPrepared: 10,
};

// Checklist keys by domain
const DOMAIN_KEYS: Record<keyof typeof DOMAIN_WEIGHTS, string[]> = {
  registration: ['check-eligibility', 'complete-registration', 'verify-on-roll'],
  documentation: ['have-voter-id', 'know-alternatives', 'documents-ready'],
  deadlineAwareness: ['know-registration-deadline', 'know-election-date'],
  location: ['know-polling-station', 'know-constituency'],
  emergencyPrepared: ['know-helpline', 'know-emergency-steps'],
};

@Injectable()
export class ReadinessService {
  constructor(private readonly prisma: PrismaService) {}

  async getScore(userId: string, countryCode: CountryCode): Promise<ReadinessScore> {
    const checklist = await this.prisma.checklistItem.findMany({
      where: { userId, countryCode },
    });

    const completedKeys = new Set(
      checklist.filter((i) => i.status === 'COMPLETED').map((i) => i.itemKey),
    );

    // Calculate per-domain scores
    const scores = Object.entries(DOMAIN_KEYS).reduce(
      (acc, [domain, keys]) => {
        const completed = keys.filter((k) => completedKeys.has(k)).length;
        const pct = keys.length > 0 ? completed / keys.length : 0;
        const weight = DOMAIN_WEIGHTS[domain as keyof typeof DOMAIN_WEIGHTS];
        acc[domain] = Math.round(pct * weight);
        return acc;
      },
      {} as Record<string, number>,
    );

    const total = Object.values(scores).reduce((s, v) => s + v, 0);

    // Find next action
    const nextAction = this.determineNextAction(completedKeys, countryCode);

    // Get next election
    const nextElection = await this.prisma.electionEvent.findFirst({
      where: {
        jurisdiction: { country: { code: countryCode } },
        electionDate: { gte: new Date() },
        isActive: true,
      },
      orderBy: { electionDate: 'asc' },
    });

    const daysToElection = nextElection
      ? Math.ceil(((nextElection.electionDate as Date).getTime() - Date.now()) / 86400000)
      : null;

    return {
      total,
      registration: scores['registration'] ?? 0,
      documentation: scores['documentation'] ?? 0,
      deadlineAwareness: scores['deadlineAwareness'] ?? 0,
      location: scores['location'] ?? 0,
      emergencyPrepared: scores['emergencyPrepared'] ?? 0,
      nextAction,
      daysToElection,
    };
  }

  async updateChecklistItem(
    userId: string, countryCode: CountryCode, itemKey: string, status: 'COMPLETED' | 'NOT_STARTED',
  ) {
    const item = await this.prisma.checklistItem.findUnique({
      where: { userId_itemKey: { userId, itemKey } },
    });

    if (!item) {
      // Auto-create if not exists
      const domain = this.keyToDomain(itemKey);
      return this.prisma.checklistItem.create({
        data: {
          userId, countryCode, itemKey, label: this.keyToLabel(itemKey),
          domain: domain as any, status: status as any,
          completedAt: status === 'COMPLETED' ? new Date() : null,
        },
      });
    }

    return this.prisma.checklistItem.update({
      where: { userId_itemKey: { userId, itemKey } },
      data: { status: status as any, completedAt: status === 'COMPLETED' ? new Date() : null },
    });
  }

  async initializeChecklist(userId: string, countryCode: CountryCode, personaCode: string) {
    const allKeys = Object.entries(DOMAIN_KEYS).flatMap(([domain, keys]) =>
      keys.map((k) => ({ domain, key: k })),
    );

    await this.prisma.checklistItem.createMany({
      data: allKeys.map(({ domain, key }) => ({
        userId, countryCode, itemKey: key,
        label: this.keyToLabel(key),
        domain: domain as any,
        status: 'NOT_STARTED',
      })),
      skipDuplicates: true,
    });
  }

  private determineNextAction(completedKeys: Set<string>, country: CountryCode): ReadinessAction | null {
    const priorities = [
      { key: 'check-eligibility', title: 'Confirm your eligibility', description: 'Verify you meet the voting requirements for this election.', urgency: 'HIGH' as const, estimatedTime: '5 minutes' },
      { key: 'complete-registration', title: 'Complete voter registration', description: 'Submit your voter registration application.', urgency: 'HIGH' as const, estimatedTime: '15 minutes' },
      { key: 'verify-on-roll', title: 'Verify your name on the electoral roll', description: 'Confirm your name appears correctly on the voter list.', urgency: 'MEDIUM' as const, estimatedTime: '5 minutes' },
      { key: 'have-voter-id', title: 'Locate your Voter ID', description: 'Find your Voter ID card or identify alternative documents.', urgency: 'MEDIUM' as const, estimatedTime: '10 minutes' },
      { key: 'know-polling-station', title: 'Find your polling station', description: 'Look up the address of your assigned polling station.', urgency: 'MEDIUM' as const, estimatedTime: '2 minutes' },
      { key: 'know-helpline', title: 'Save the voter helpline', description: 'Save the official helpline number in case of election-day issues.', urgency: 'LOW' as const, estimatedTime: '1 minute' },
    ];

    for (let i = 0; i < priorities.length; i++) {
      const action = priorities[i]!;
      if (!completedKeys.has(action.key)) {
        return { priority: i + 1, ...action };
      }
    }
    return null;
  }

  private keyToDomain(key: string): string {
    for (const [domain, keys] of Object.entries(DOMAIN_KEYS)) {
      if (keys.includes(key)) return domain.toUpperCase();
    }
    return 'REGISTRATION';
  }

  private keyToLabel(key: string): string {
    return key.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
}
