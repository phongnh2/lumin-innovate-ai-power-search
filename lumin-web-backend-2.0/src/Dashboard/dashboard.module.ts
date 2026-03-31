import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { AuthModule } from 'Auth/auth.module';
import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { DashboardResolver } from 'Dashboard/dashboard.resolver';
import { DocumentModule } from 'Document/document.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { EventModule } from 'Event/event.module';
import { LoggerModule } from 'Logger/Logger.module';
import { MembershipModule } from 'Membership/membership.module';
import { RedisModule } from 'Microservices/redis/redis.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { TeamModule } from 'Team/team.module';
import { UserModule } from 'User/user.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [EnvironmentModule],
      useFactory: (environmentService: EnvironmentService) => ({
        secret: environmentService.getByKey(
          EnvConstants.JWT_SECRET_KEY,
        ),
        signOptions: {
          algorithm: CommonConstants.JWT_ALGORITHM,
          expiresIn: CommonConstants.JWT_EXPIRE_IN,
        },
      }),
      inject: [EnvironmentService],
    }),
    RedisModule,
    DocumentModule,
    EventModule,
    MembershipModule,
    TeamModule,
    RateLimiterModule,
    LoggerModule,
    UserModule,
    forwardRef(() => AuthModule),
  ],
  providers: [
    DashboardResolver,
    WhitelistIPService,
  ],
})
export class DashBoardModule { }
