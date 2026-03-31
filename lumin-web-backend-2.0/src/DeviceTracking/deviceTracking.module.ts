/* eslint-disable import/extensions */
import { Module } from '@nestjs/common';

import { LoggerModule } from 'Logger/Logger.module';

import { DeviceTrackingResolver } from './deviceTracking.resolver';

@Module({
  imports: [LoggerModule],
  controllers: [],
  providers: [DeviceTrackingResolver],
  exports: [],
})
export class DeviceTrackingModule {}
