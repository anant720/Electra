import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ElectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findUpcoming(countryCode?: string) {
    return this.prisma.electionEvent.findMany({
      where: {
        isActive: true,
        electionDate: { gte: new Date() },
        ...(countryCode && {
          jurisdiction: { country: { code: countryCode.toUpperCase() } },
        }),
      },
      include: {
        electionType: { select: { name: true } },
        jurisdiction: { include: { country: { select: { code: true, name: true, flagEmoji: true } } } },
      },
      orderBy: { electionDate: 'asc' },
      take: 5,
    });
  }
}
