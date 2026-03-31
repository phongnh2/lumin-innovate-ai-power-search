import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'Environment/environment.module';

import { GA4Service } from './GA4.service';

@Module({
  imports: [
    HttpModule,
    EnvironmentModule,
  ],
  exports: [GA4Service],
  providers: [GA4Service],
})
export class GA4Module {}
