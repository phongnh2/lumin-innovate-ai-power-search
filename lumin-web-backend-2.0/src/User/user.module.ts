import { HttpModule } from '@nestjs/axios';
import {
  forwardRef, Module,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { AwsModule } from 'Aws/aws.module';

import { CustomRulesModule } from 'CustomRules/custom-rule.module';

import { AdminModule } from 'Admin/admin.module';
import { AuthModule } from 'Auth/auth.module';
import { GqlAuthGuard } from 'Auth/guards/graph.auth.guard';
import { BlacklistModule } from 'Blacklist/blacklist.module';
import { BrazeModule } from 'Braze/braze.module';
import { DocumentModule } from 'Document/document.module';
import { EmailModule } from 'Email/email.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { FeatureFlagModule } from 'FeatureFlag/FeatureFlag.module';
import { FolderModule } from 'Folder/folder.module';
import { KratosModule } from 'Kratos/kratos.module';
import { LoggerModule } from 'Logger/Logger.module';
import { LuminContractModule } from 'LuminContract/luminContract.module';
import { MembershipModule } from 'Membership/membership.module';
import { RedisModule } from 'Microservices/redis/redis.module';
import { NotificationModule } from 'Notication/notification.module';
import { pubSub } from 'Notication/notification.pubsub';
import { OpenOneDriveModule } from 'OpenOneDrive/OpenOneDrive.module';
import { OrganizationModule } from 'Organization/organization.module';
import { PaymentModule } from 'Payment/payment.module';
import { RabbitMqModule } from 'RabbitMQ/RabbitMQ.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { SocketIOModule } from 'SocketIO/socket.io.module';
import { TeamModule } from 'Team/team.module';
import { UploadService } from 'Upload/upload.service';
import { UserContactSchema } from 'User/schemas/user.contact.schema';
import { UserPurposeSchema } from 'User/schemas/user.purpose.schema';
import { UserSchema } from 'User/schemas/user.schema';
import { UserController } from 'User/user.controller';
import { UserResolver } from 'User/user.resolver';
import { UserService } from 'User/user.service';
import { UserTrackingModule } from 'UserTracking/tracking.module';

const pubSubProvider = {
  provide: 'PUB_SUB',
  useValue: pubSub,
};

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => TeamModule),
    forwardRef(() => MembershipModule),
    forwardRef(() => DocumentModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => EmailModule),
    forwardRef(() => FolderModule),
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
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'UserPurpose', schema: UserPurposeSchema },
      { name: 'UserContact', schema: UserContactSchema },
    ]),
    AwsModule,
    RedisModule,
    HttpModule,
    /* For A/B testing */
    forwardRef(() => UserTrackingModule),
    /* End */
    forwardRef(() => PaymentModule),
    forwardRef(() => LoggerModule),
    forwardRef(() => RateLimiterModule),
    forwardRef(() => AdminModule),
    forwardRef(() => NotificationModule),
    BlacklistModule,
    forwardRef(() => SocketIOModule),
    forwardRef(() => CustomRulesModule),
    forwardRef(() => BrazeModule),
    FeatureFlagModule,
    forwardRef(() => OpenOneDriveModule),
    KratosModule,
    RabbitMqModule,
    LuminContractModule,
  ],
  controllers: [UserController],
  providers: [GqlAuthGuard, UserService, UserResolver, pubSubProvider, UploadService],
  exports: [UserService],
})
export class UserModule { }
