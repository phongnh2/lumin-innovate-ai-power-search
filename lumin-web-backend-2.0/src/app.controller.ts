import {
  Controller, Get,
  Header,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { EnvironmentService } from 'Environment/environment.service';

import { HealthResponse } from './swagger/schemas';

@Controller()
export class AppController {
  constructor(
      private readonly environmentService: EnvironmentService,
  ) { }

  @ApiOperation({ summary: 'Get API version' })
  @ApiResponse({
    status: 200,
    description: 'The API version',
    type: String,
  })
  @Get('/')
  version(): string {
    return this.environmentService.appVersion;
  }

  @ApiOperation({ summary: 'Get health status' })
  @ApiResponse({
    status: 200,
    description: 'The health status',
    type: HealthResponse,
  })
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Content-Type', 'application/json')
  @Get('/healthz')
  healthz(): { version: string, status: 'running' } {
    return {
      version: this.environmentService.getByKey('VERSION'),
      status: 'running',
    };
  }

  @ApiOperation({ summary: 'Get mobile app version' })
  @ApiResponse({
    status: 200,
    description: 'The mobile app version',
    type: String,
  })
  @Get('/mobile-version')
  mobileVersion(): string {
    return this.environmentService.getByKey('MOBILE_VERSION');
  }
}
