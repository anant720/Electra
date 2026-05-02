import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsString, IsOptional, MaxLength, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CivicQueryContext } from '@electra/types';

class CivicQueryDto {
  @ApiProperty({ example: 'How do I register to vote in India for the first time?' })
  @IsString()
  @MaxLength(500)
  query!: string;

  @ApiProperty({ example: 'IND', required: false })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ example: 'P01', required: false })
  @IsOptional()
  @IsString()
  personaCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isElectionDay?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  daysToElection?: number;

  @ApiProperty({ example: 'en', required: false })
  @IsOptional()
  @IsString()
  language?: string;
}

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('query')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 20 } })  // 20 AI queries/min
  @ApiOperation({ summary: 'Submit a civic query to ELECTRA AI engine' })
  async query(@Body() dto: CivicQueryDto, @Req() req: any) {
    const sessionId = req.headers['x-session-id'] ?? `anon_${Date.now()}`;

    const context: CivicQueryContext = {
      countryCode: dto.countryCode as any ?? null,
      stateOrProvince: null,
      personaCode: dto.personaCode as any ?? null,
      personaConfidence: dto.personaCode ? 1.0 : 0,
      rawQuery: dto.query,
      sessionId,
      userId: req.user?.id,
      language: dto.language ?? 'en',
      isElectionDay: dto.isElectionDay ?? false,
      daysToElection: dto.daysToElection ?? null,
    };

    return this.ai.query(context);
  }
}
