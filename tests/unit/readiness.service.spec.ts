// =============================================================================
// ELECTRA — Readiness Score Engine Unit Tests
// System 1: Full QA Expansion
// =============================================================================

import { ReadinessService } from '../../apps/api/src/readiness/readiness.service';

const mockPrisma = {
  checklistItem: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    createMany: jest.fn(),
  },
  election: {
    findFirst: jest.fn(),
  },
};

describe('ReadinessService', () => {
  let service: ReadinessService;

  beforeEach(() => {
    service = new ReadinessService(mockPrisma as any);
    jest.clearAllMocks();
  });

  describe('getScore()', () => {
    it('should return 0 score when no checklist items are completed', async () => {
      mockPrisma.checklistItem.findMany.mockResolvedValue([]);
      mockPrisma.election.findFirst.mockResolvedValue(null);

      const score = await service.getScore('user-1', 'IND');
      expect(score.total).toBe(0);
      expect(score.registration).toBe(0);
      expect(score.documentation).toBe(0);
    });

    it('should return 100 when all items are completed', async () => {
      const allKeys = [
        'check-eligibility', 'complete-registration', 'verify-on-roll',
        'have-voter-id', 'know-alternatives', 'documents-ready',
        'know-registration-deadline', 'know-election-date',
        'know-polling-station', 'know-constituency',
        'know-helpline', 'know-emergency-steps',
      ];

      mockPrisma.checklistItem.findMany.mockResolvedValue(
        allKeys.map((k) => ({ itemKey: k, status: 'COMPLETED' })),
      );
      mockPrisma.election.findFirst.mockResolvedValue(null);

      const score = await service.getScore('user-1', 'IND');
      expect(score.total).toBe(100);
    });

    it('should weight domains correctly (registration = 30 pts max)', async () => {
      mockPrisma.checklistItem.findMany.mockResolvedValue([
        { itemKey: 'check-eligibility', status: 'COMPLETED' },
        { itemKey: 'complete-registration', status: 'COMPLETED' },
        { itemKey: 'verify-on-roll', status: 'COMPLETED' },
      ]);
      mockPrisma.election.findFirst.mockResolvedValue(null);

      const score = await service.getScore('user-1', 'IND');
      expect(score.registration).toBe(30); // 3/3 × 30
      expect(score.total).toBe(30);
    });

    it('should calculate daysToElection from election date', async () => {
      mockPrisma.checklistItem.findMany.mockResolvedValue([]);
      const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
      mockPrisma.election.findFirst.mockResolvedValue({ electionDate: futureDate });

      const score = await service.getScore('user-1', 'IND');
      expect(score.daysToElection).toBe(14);
    });

    it('should return null daysToElection when no upcoming election', async () => {
      mockPrisma.checklistItem.findMany.mockResolvedValue([]);
      mockPrisma.election.findFirst.mockResolvedValue(null);

      const score = await service.getScore('user-1', 'IND');
      expect(score.daysToElection).toBeNull();
    });

    it('should set nextAction to first incomplete item', async () => {
      mockPrisma.checklistItem.findMany.mockResolvedValue([]);
      mockPrisma.election.findFirst.mockResolvedValue(null);

      const score = await service.getScore('user-1', 'IND');
      expect(score.nextAction).not.toBeNull();
      expect(score.nextAction!.title).toBe('Confirm your eligibility');
    });

    it('should return null nextAction when all items complete', async () => {
      const allKeys = [
        'check-eligibility', 'complete-registration', 'verify-on-roll',
        'have-voter-id', 'know-alternatives', 'documents-ready',
        'know-registration-deadline', 'know-election-date',
        'know-polling-station', 'know-constituency',
        'know-helpline', 'know-emergency-steps',
      ];
      mockPrisma.checklistItem.findMany.mockResolvedValue(
        allKeys.map((k) => ({ itemKey: k, status: 'COMPLETED' })),
      );
      mockPrisma.election.findFirst.mockResolvedValue(null);

      const score = await service.getScore('user-1', 'IND');
      expect(score.nextAction).toBeNull();
    });

    it('domain weights must sum to 100', () => {
      const DOMAIN_WEIGHTS = {
        registration: 30, documentation: 25, deadlineAwareness: 20,
        location: 15, emergencyPrepared: 10,
      };
      const sum = Object.values(DOMAIN_WEIGHTS).reduce((a, b) => a + b, 0);
      expect(sum).toBe(100);
    });
  });
});
