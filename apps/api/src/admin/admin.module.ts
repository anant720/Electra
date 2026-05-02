// =============================================================================
// ELECTRA — Admin Axiom Controller (LEGAL_VALIDATOR role)
// Blueprint: /backend/admin/ — axiom governance + audit
// =============================================================================

import {
  Module, Injectable, Controller, Get, Post, Patch, Param, Body,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// ─── DTOs ─────────────────────────────────────────────────────────────────────
class CreateAxiomDto {
  @IsString() countryId: string;       // UUID of the country
  @IsString() category: string;
  @IsOptional() @IsString() subcategory?: string;
  @IsString() code: string;            // unique axiom code e.g. IND_VOTING_AGE
  @IsString() fact: string;            // canonical fact text
  @IsOptional() @IsString() plainFact?: string;
  @IsEnum(['STABLE', 'MEDIUM', 'HIGH']) volatilityClass: 'STABLE' | 'MEDIUM' | 'HIGH';
  @IsOptional() @IsString() sourceId?: string;
}

class UpdateAxiomDto {
  @IsOptional() @IsString() fact?: string;
  @IsOptional() @IsString() plainFact?: string;
  @IsOptional() @IsEnum(['STABLE', 'MEDIUM', 'HIGH']) volatilityClass?: 'STABLE' | 'MEDIUM' | 'HIGH';
  @IsOptional() @IsBoolean() isActive?: boolean;
}

// ─── Service ──────────────────────────────────────────────────────────────────
@Injectable()
export class AdminAxiomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(countryCode?: string) {
    return this.prisma.civicAxiom.findMany({
      where: countryCode ? { country: { code: countryCode } } : undefined,
      include: { source: true, country: { select: { code: true } } },
      orderBy: [{ category: 'asc' }, { code: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.civicAxiom.findUnique({
      where: { id },
      include: { source: true },
    });
  }

  async create(dto: CreateAxiomDto, actorId: string, actorRole: string) {
    const axiom = await this.prisma.civicAxiom.create({
      data: {
        countryId: dto.countryId,
        category: dto.category,
        subcategory: dto.subcategory,
        code: dto.code,
        fact: dto.fact,
        plainFact: dto.plainFact,
        volatilityClass: dto.volatilityClass,
        ...(dto.sourceId ? { sourceId: dto.sourceId } : {}),
      },
    });
    await this.audit.log(actorId, actorRole, 'AXIOM_CREATED', 'CivicAxiom', axiom.id, undefined, dto);
    return axiom;
  }

  async update(id: string, dto: UpdateAxiomDto, actorId: string, actorRole: string, ipAddress?: string) {
    const before = await this.prisma.civicAxiom.findUnique({ where: { id } });
    const updated = await this.prisma.civicAxiom.update({
      where: { id },
      data: {
        ...(dto.fact !== undefined ? { fact: dto.fact } : {}),
        ...(dto.plainFact !== undefined ? { plainFact: dto.plainFact } : {}),
        ...(dto.volatilityClass !== undefined ? { volatilityClass: dto.volatilityClass } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
    await this.audit.log(actorId, actorRole, 'AXIOM_UPDATED', 'CivicAxiom', id, before ?? undefined, dto, ipAddress);
    return updated;
  }

  async deactivate(id: string, actorId: string, actorRole: string) {
    const updated = await this.prisma.civicAxiom.update({ where: { id }, data: { isActive: false } });
    await this.audit.log(actorId, actorRole, 'AXIOM_DEACTIVATED', 'CivicAxiom', id);
    return updated;
  }

  async getAuditLog(entityId?: string) {
    return this.prisma.auditLog.findMany({
      where: {
        entityType: 'CivicAxiom',
        ...(entityId ? { entityId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}

// ─── Controller ───────────────────────────────────────────────────────────────
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/axioms')
export class AdminAxiomController {
  constructor(private readonly service: AdminAxiomService) {}

  @Get()
  @Roles('LEGAL_VALIDATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List all civic axioms (LEGAL_VALIDATOR+)' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('LEGAL_VALIDATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get axiom by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new civic axiom (ADMIN+)' })
  create(@Body() dto: CreateAxiomDto, @Request() req: any) {
    return this.service.create(dto, req.user.id, req.user.role);
  }

  @Patch(':id')
  @Roles('LEGAL_VALIDATOR', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update axiom content or volatility (LEGAL_VALIDATOR+)' })
  update(@Param('id') id: string, @Body() dto: UpdateAxiomDto, @Request() req: any) {
    return this.service.update(id, dto, req.user.id, req.user.role, req.ip);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Deactivate axiom (ADMIN+)' })
  deactivate(@Param('id') id: string, @Request() req: any) {
    return this.service.deactivate(id, req.user.id, req.user.role);
  }

  @Get(':id/audit')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'View audit log for a specific axiom (ADMIN+)' })
  getAudit(@Param('id') id: string) {
    return this.service.getAuditLog(id);
  }
}

// ─── Module ───────────────────────────────────────────────────────────────────
@Module({
  controllers: [AdminAxiomController],
  providers: [AdminAxiomService, AuditService],
  exports: [AdminAxiomService, AuditService],
})
export class AdminModule {}
