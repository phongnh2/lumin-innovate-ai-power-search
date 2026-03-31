import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { HubspotModule } from 'Hubspot/hubspot.module';
import { LoggerModule } from 'Logger/Logger.module';
import { RedisModule } from 'Microservices/redis/redis.module';
import { PinpointModule } from 'Pinpoint/pinpoint.module';
import { UserTrackingResolver } from 'UserTracking/tracking.resolver';
import { UserTrackingService } from 'UserTracking/tracking.service';

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
    HubspotModule,
    RedisModule,
    LoggerModule,
    PinpointModule,
  ],
  controllers: [],
  providers: [UserTrackingService, UserTrackingResolver],
  exports: [UserTrackingService],
})
export class UserTrackingModule { }
