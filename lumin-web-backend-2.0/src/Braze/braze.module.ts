import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';

import { EnvironmentModule } from 'Environment/environment.module';
import { LoggerModule } from 'Logger/Logger.module';
import { UserModule } from 'User/user.module';

import { BrazeClient } from './braze.client';
import { BrazeService } from './braze.service';

@Module({
  imports: [EnvironmentModule, HttpModule, LoggerModule, forwardRef(() => UserModule)],
  providers: [BrazeClient, BrazeService],
  exports: [BrazeService],
})
export class BrazeModule {}
