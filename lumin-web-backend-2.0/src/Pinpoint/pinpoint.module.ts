import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'Environment/environment.module';
import { RedisModule } from 'Microservices/redis/redis.module';
import { PinpointService } from 'Pinpoint/pinpoint.service';

@Module({
  imports: [
    RedisModule,
    EnvironmentModule,
  ],
  exports: [PinpointService],
  providers: [PinpointService],
})
export class PinpointModule {}
