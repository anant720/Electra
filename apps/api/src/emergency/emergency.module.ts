// =============================================================================
// ELECTRA — Emergency API Controller + Service
// GET /emergency/steps?scenario=T01&country=IND
// =============================================================================

import { Module, Injectable, Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmergencyResolutionDto, CountryCode, TroubleshootingScenario } from '@electra/types';
import { COUNTRY_METADATA } from '@electra/types';

@Injectable()
export class EmergencyService {
  constructor(private readonly prisma: PrismaService) {}

  async getResolution(scenario: TroubleshootingScenario, countryCode: CountryCode): Promise<EmergencyResolutionDto> {
    // ResolutionPath is per-step; fetch all steps for this scenario+country, ordered by stepNumber
    const paths = await this.prisma.resolutionPath.findMany({
      where: {
        scenario: { code: scenario },
        country: { code: countryCode },
      },
      orderBy: { stepNumber: 'asc' },
    });

    const helpline = COUNTRY_METADATA[countryCode]?.helpline ?? null;

    if (!paths.length) {
      return {
        countryCode,
        scenario,
        severity: 'HIGH',
        cureWindow: 'Contact helpline immediately',
        steps: [
          {
            step: 1,
            title: 'Contact official helpline',
            action: `Call the official electoral authority helpline for ${countryCode} immediately.`,
          },
        ],
        helpline,
      };
    }

    const steps = paths.map((p) => ({
      step: p.stepNumber,
      title: p.stepType,
      action: p.stepText,
      phone: p.officialContact ?? undefined,
    }));

    return {
      countryCode,
      scenario,
      severity: 'HIGH',
      cureWindow: '',
      steps,
      helpline,
    };
  }
}

@ApiTags('emergency')
@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergency: EmergencyService) {}

  @Get('steps')
  @Throttle({ default: { ttl: 60000, limit: 60 } }) // Emergency = high limit
  @ApiOperation({ summary: 'Get emergency resolution steps for a scenario' })
  @ApiQuery({ name: 'scenario', enum: ['T01', 'T02', 'T03', 'T04', 'T05', 'T06'] })
  @ApiQuery({ name: 'country', enum: ['IND', 'USA', 'GBR', 'CAN', 'AUS'] })
  getSteps(
    @Query('scenario') scenario: TroubleshootingScenario,
    @Query('country') country: CountryCode,
  ) {
    return this.emergency.getResolution(scenario, country);
  }
}

@Module({
  controllers: [EmergencyController],
  providers: [EmergencyService],
  exports: [EmergencyService],
})
export class EmergencyModule {}
