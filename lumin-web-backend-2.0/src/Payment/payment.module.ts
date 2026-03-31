import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { PaymentSchema } from 'Common/schemas/payment.schema';

import { AwsModule } from 'Aws/aws.module';

import { AdminModule } from 'Admin/admin.module';
import { AuthModule } from 'Auth/auth.module';
import { BrazeModule } from 'Braze/braze.module';
import { EmailModule } from 'Email/email.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { EventModule } from 'Event/event.module';
import { FeatureFlagModule } from 'FeatureFlag/FeatureFlag.module';
import { HubspotModule } from 'Hubspot/hubspot.module';
import { LoggerModule } from 'Logger/Logger.module';
import { MembershipModule } from 'Membership/membership.module';
import { NotificationModule } from 'Notication/notification.module';
import { OrganizationModule } from 'Organization/organization.module';
import OrganizationSchema from 'Organization/schemas/organization.schema';
import { PaymentController } from 'Payment/payment.controller';
import { PaymentResolver } from 'Payment/payment.resolver';
import { PaymentService } from 'Payment/payment.service';
import { PaymentScriptService } from 'Payment/paymentScript.service';
import { PaymentUtilsService } from 'Payment/utils/payment.utils';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { SlackModule } from 'Slack/slack.module';
import { StripeModule } from 'Stripe/stripe.module';
import { TeamModule } from 'Team/team.module';
import { UserModule } from 'User/user.module';
import { UserMetricModule } from 'UserMetric/usermetric.module';
import { UserTrackingModule } from 'UserTracking/tracking.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Payment', schema: PaymentSchema },
      { name: 'Organization', schema: OrganizationSchema },
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

    forwardRef(() => EmailModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => MembershipModule),
    forwardRef(() => TeamModule),
    forwardRef(() => UserModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => AdminModule),
    forwardRef(() => AuthModule),
    forwardRef(() => EventModule),
    /* For A/B testing */
    UserMetricModule,
    /* End */
    UserTrackingModule,
    RateLimiterModule,
    LoggerModule,
    HttpModule,
    forwardRef(() => BrazeModule),
    StripeModule.forRootAync(),
    forwardRef(() => SlackModule),
    forwardRef(() => AwsModule),
    FeatureFlagModule,
    HubspotModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentScriptService, PaymentResolver, PaymentUtilsService],
  exports: [PaymentService, PaymentScriptService, PaymentUtilsService],
})

export class PaymentModule { }
