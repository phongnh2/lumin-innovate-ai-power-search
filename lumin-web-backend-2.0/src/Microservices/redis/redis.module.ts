import { Module, Global } from '@nestjs/common';

import { CallbackModule } from 'Calback/callback.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { RedisService } from 'Microservices/redis/redis.service';

@Global()
@Module({
  imports: [
    EnvironmentModule,
    CallbackModule.forRoot(),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
