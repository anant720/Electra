import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReadinessService } from './readiness.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CountryCode } from '@electra/types';

@ApiTags('readiness')
@ApiBearerAuth()
@Controller('readiness')
export class ReadinessController {
  constructor(private readonly readiness: ReadinessService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get readiness score for user' })
  getScore(@Request() req: any, @Query('country') country: string) {
    return this.readiness.getScore(req.user.id, country as CountryCode);
  }
}
