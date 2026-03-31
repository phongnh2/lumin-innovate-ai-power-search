import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { AuthModule } from 'Auth/auth.module';
import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { DocumentModule } from 'Document/document.module';
import { EmailModule } from 'Email/email.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { EventModule } from 'Event/event.module';
import { FeatureFlagModule } from 'FeatureFlag/FeatureFlag.module';
import { GatewayService } from 'Gateway/Gateway.service';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import { MembershipModule } from 'Membership/membership.module';
import { RedisModule } from 'Microservices/redis/redis.module';
import { NotificationModule } from 'Notication/notification.module';
import { OrganizationModule } from 'Organization/organization.module';
import { PaymentModule } from 'Payment/payment.module';
import { PinpointModule } from 'Pinpoint/pinpoint.module';
import { TeamModule } from 'Team/team.module';
import { UserModule } from 'User/user.module';
import { UserMetricModule } from 'UserMetric/usermetric.module';

@Module({
  imports: [
    forwardRef(() => DocumentModule),
    forwardRef(() => EmailModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => UserModule),
    forwardRef(() => NotificationModule),
    /* For A/B testing */
    forwardRef(() => UserMetricModule),
    /* End */
    forwardRef(() => MembershipModule),
    forwardRef(() => TeamModule),
    forwardRef(() => EventModule),
    RedisModule,
    JwtModule.registerAsync({
      imports: [EnvironmentModule],
      useFactory: (environmentService: EnvironmentService) => ({
        secret: environmentService.getByKey(
          EnvConstants.JWT_SECRET_KEY,
        ),
        signOptions: {
          algorithm: CommonConstants.JWT_ALGORITHM,
          expiresIn: environmentService.getByKey(
            EnvConstants.JWT_EXPIRE_REFRESH_TOKEN_IN,
          ),
        },
      }),
      inject: [EnvironmentService],
    }),
    EnvironmentModule,
    forwardRef(() => AuthModule),
    FeatureFlagModule,
    forwardRef(() => PaymentModule),
    PinpointModule,
  ],
  providers: [
    WhitelistIPService,
    GatewayService,
    EventsGateway,
  ],
  exports: [EventsGateway],
})
export class SocketIOModule { }
