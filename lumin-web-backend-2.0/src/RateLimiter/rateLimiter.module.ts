import { Module, forwardRef } from '@nestjs/common';

import { EnvironmentModule } from 'Environment/environment.module';
import { LoggerModule } from 'Logger/Logger.module';
import { MembershipModule } from 'Membership/membership.module';
import { RedisModule } from 'Microservices/redis/redis.module';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';
import { RateLimiterService } from 'RateLimiter/rateLimiter.service';
import { TeamModule } from 'Team/team.module';
import { UserModule } from 'User/user.module';

@Module({
  imports: [
    LoggerModule,
    RedisModule,
    EnvironmentModule,
    forwardRef(() => UserModule),
    forwardRef(() => MembershipModule),
    forwardRef(() => TeamModule),
  ],
  providers: [RateLimiterService, RateLimiterGuard],
  exports: [RateLimiterService, RateLimiterGuard],
})
export class RateLimiterModule { }
