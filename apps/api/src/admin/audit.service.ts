// =============================================================================
// ELECTRA — Audit Service (used by auth + admin)
// =============================================================================
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { createHash } from 'crypto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(
    userId: string | null,
    _actorRole: string,  // retained for call-site compatibility; not stored (no column)
    action: string,
    entityType?: string,
    entityId?: string,
    before?: object,
    after?: object,
    ipAddress?: string,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entityType,
          entityId,
          oldValue: before ?? undefined,
          newValue: after ?? undefined,
          ipHash: ipAddress
            ? createHash('sha256').update(ipAddress).digest('hex').substring(0, 100)
            : undefined,
        },
      });
    } catch (e) {
      this.logger.error('Audit log write failed', e);
    }
  }
}
