import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ElectionsService } from './elections.service';

@ApiTags('elections')
@Controller('elections')
export class ElectionsController {
  constructor(private readonly elections: ElectionsService) {}

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming elections' })
  @ApiQuery({ name: 'country', required: false })
  findUpcoming(@Query('country') country?: string) {
    return this.elections.findUpcoming(country);
  }
}
