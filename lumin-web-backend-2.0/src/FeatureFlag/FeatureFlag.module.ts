import { Module } from '@nestjs/common';

import { LoggerModule } from 'Logger/Logger.module';

import { FeatureFlagService } from './FeatureFlag.service';

@Module({
  imports: [LoggerModule],
  controllers: [],
  providers: [FeatureFlagService],
  exports: [FeatureFlagService],
})
export class FeatureFlagModule {}
