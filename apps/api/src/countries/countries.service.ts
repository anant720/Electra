import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.country.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { civicAxioms: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findByCode(code: string) {
    const country = await this.prisma.country.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        civicAxioms: {
          where: { isActive: true },
          include: { source: true },
        },
        jurisdictions: {
          take: 1,
          include: {
            electionEvents: {
              where: { isActive: true, electionDate: { gte: new Date() } },
              orderBy: { electionDate: 'asc' },
              take: 5,
            },
          },
        },
      },
    });
    if (!country) throw new NotFoundException(`Country ${code} not found`);
    return country;
  }
}
