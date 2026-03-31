import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { AwsModule } from 'Aws/aws.module';

import { AuthModule } from 'Auth/auth.module';
import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { DocumentModule } from 'Document/document.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { EventController } from 'Event/event.controller';
import { EventResolver } from 'Event/event.resolver';
import { AdminEventService } from 'Event/services/admin.event.service';
import { EventServiceFactory } from 'Event/services/event.service.factory';
import { OrganizationEventService } from 'Event/services/organization.event.service';
import { PersonalEventService } from 'Event/services/personal.event.service';
import { TeamEventService } from 'Event/services/team.event.service';
import { LoggerModule } from 'Logger/Logger.module';
import { MembershipModule } from 'Membership/membership.module';
import { OpenSearchModule } from 'Opensearch/openSearch.module';
import { OrganizationModule } from 'Organization/organization.module';
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
    forwardRef(() => UserModule),
    forwardRef(() => DocumentModule),
    forwardRef(() => TeamModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => AuthModule),
    AwsModule,
    OpenSearchModule,
    forwardRef(() => MembershipModule),
    RateLimiterModule,
    LoggerModule,
  ],
  providers: [
    EventServiceFactory,
    PersonalEventService,
    TeamEventService,
    OrganizationEventService,
    AdminEventService,
    EventResolver,
    WhitelistIPService,
  ],
  controllers: [EventController],
  exports: [
    EventServiceFactory,
    PersonalEventService,
    TeamEventService,
    OrganizationEventService,
    AdminEventService,
  ],
})
export class EventModule { }
