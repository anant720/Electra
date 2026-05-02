import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CountriesService } from './countries.service';

@ApiTags('countries')
@Controller('countries')
export class CountriesController {
  constructor(private readonly countries: CountriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all supported countries' })
  findAll() {
    return this.countries.findAll();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get country profile by code (e.g. IND, USA)' })
  findOne(@Param('code') code: string) {
    return this.countries.findByCode(code);
  }
}
