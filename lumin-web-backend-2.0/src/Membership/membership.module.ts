import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { AwsModule } from 'Aws/aws.module';

import { AuthModule } from 'Auth/auth.module';
import { CallbackModule } from 'Calback/callback.module';
import { DocumentModule } from 'Document/document.module';
import { EmailModule } from 'Email/email.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { EventModule } from 'Event/event.module';
import { LoggerModule } from 'Logger/Logger.module';
import { MembershipResolver } from 'Membership/membership.resolver';
import { MembershipService } from 'Membership/membership.service';
import MembershipSchema from 'Membership/schemas/membership.schema';
import { NotificationModule } from 'Notication/notification.module';
import { OrganizationModule } from 'Organization/organization.module';
import { PaymentModule } from 'Payment/payment.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { TeamModule } from 'Team/team.module';
import { UserModule } from 'User/user.module';
import { UserTrackingModule } from 'UserTracking/tracking.module';

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
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => TeamModule),
    forwardRef(() => DocumentModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => EmailModule),
    // EmailModule,
    CallbackModule.forRoot(),
    AwsModule,
    UserTrackingModule,
    forwardRef(() => EventModule),
    // EventModule,
    RateLimiterModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [MembershipService, MembershipResolver],
  exports: [MembershipService],
})
export class MembershipModule { }
