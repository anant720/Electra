// =============================================================================
// ELECTRA — Health Controller
// Blueprint: /backend/observability/ — load balancer health probe
// =============================================================================

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('ops')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'System health probe — used by load balancers' })
  async check() {
    const checks: Record<string, 'ok' | 'error'> = {};

    // PostgreSQL
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.postgres = 'ok';
    } catch {
      checks.postgres = 'error';
    }

    // Gemini API key presence (not a live call — just config check)
    checks.gemini_config = this.config.get<string>('GEMINI_API_KEY', '') ? 'ok' : 'error';

    const allOk = Object.values(checks).every((v) => v === 'ok');

    return {
      status: allOk ? 'healthy' : 'degraded',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  @Get('ping')
  @ApiOperation({ summary: 'Simple ping — returns 200 if API is reachable' })
  ping() {
    return { pong: true, ts: Date.now() };
  }
}
