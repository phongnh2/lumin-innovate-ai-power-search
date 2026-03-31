import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { AwsModule } from 'Aws/aws.module';

import { AuthModule } from 'Auth/auth.module';
import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { DocumentModule } from 'Document/document.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { EventModule } from 'Event/event.module';
import { LoggerModule } from 'Logger/Logger.module';
import { MembershipModule } from 'Membership/membership.module';
import MembershipSchema from 'Membership/schemas/membership.schema';
import { RedisModule } from 'Microservices/redis/redis.module';
import { NotificationModule } from 'Notication/notification.module';
import { pubSub } from 'Notication/notification.pubsub';
import { OrganizationModule } from 'Organization/organization.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import TeamSchemaProvider from 'Team/providers/team.schema.provider';
import { TeamController } from 'Team/team.controller';
import { TeamResolver } from 'Team/team.resolver';
import { TeamService } from 'Team/team.service';
import { UserModule } from 'User/user.module';
import { UserTrackingModule } from 'UserTracking/tracking.module';

const pubSubProvider = {
  provide: 'PUB_SUB',
  useValue: pubSub,
};

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Membership', schema: MembershipSchema },
    ]),
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
    forwardRef(() => OrganizationModule),
    forwardRef(() => DocumentModule),
    forwardRef(() => UserTrackingModule),
    forwardRef(() => EventModule),
    forwardRef(() => AuthModule),
    AwsModule,
    forwardRef(() => MembershipModule),
    forwardRef(() => NotificationModule),
    RedisModule,
    forwardRef(() => RateLimiterModule),
    LoggerModule,
  ],
  controllers: [TeamController],
  providers: [TeamService, TeamResolver, TeamSchemaProvider, pubSubProvider, WhitelistIPService],
  exports: [TeamService, TeamSchemaProvider],
})
export class TeamModule { }
