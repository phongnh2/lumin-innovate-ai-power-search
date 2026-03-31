import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AuthModule } from 'Auth/auth.module';
import { IntercomController } from 'Intercom/intercom.controller';
import { IntercomService } from 'Intercom/intercom.service';
import { RedisModule } from 'Microservices/redis/redis.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { UserModule } from 'User/user.module';

import { SessionIntercomService } from './authentication/session-intercom.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    RateLimiterModule,
    RedisModule,
    AuthModule,
  ],
  controllers: [IntercomController],
  providers: [IntercomService, SessionIntercomService],
})
export class IntercomModule {}
