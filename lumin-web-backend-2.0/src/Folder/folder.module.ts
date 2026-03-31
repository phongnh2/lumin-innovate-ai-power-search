import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { CustomRulesModule } from 'CustomRules/custom-rule.module';

import { AuthModule } from 'Auth/auth.module';
import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { DocumentModule } from 'Document/document.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { FeatureFlagModule } from 'FeatureFlag/FeatureFlag.module';
import { FolderResolver } from 'Folder/folder.resolver';
import { FolderService } from 'Folder/folder.service';
import FolderPermissionSchema from 'Folder/schemas/folder.permission.schema';
import FolderSchema from 'Folder/schemas/folder.schema';
import { LoggerModule } from 'Logger/Logger.module';
import { MembershipModule } from 'Membership/membership.module';
import { pubSub } from 'Notication/notification.pubsub';
import { OrganizationModule } from 'Organization/organization.module';
import { PaymentModule } from 'Payment/payment.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { TeamModule } from 'Team/team.module';
import { UserModule } from 'User/user.module';

const pubSubProvider = {
  provide: 'PUB_SUB',
  useValue: pubSub,
};

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Folder', schema: FolderSchema },
      { name: 'FolderPermission', schema: FolderPermissionSchema },
    ]),
    JwtModule.registerAsync({
      imports: [
        EnvironmentModule,
      ],
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
    forwardRef(() => OrganizationModule),
    forwardRef(() => UserModule),
    forwardRef(() => DocumentModule),
    forwardRef(() => MembershipModule),
    forwardRef(() => TeamModule),
    forwardRef(() => AuthModule),
    RateLimiterModule,
    LoggerModule,
    forwardRef(() => CustomRulesModule),
    FeatureFlagModule,
    forwardRef(() => PaymentModule),
  ],

  providers: [FolderService, FolderResolver, pubSubProvider, WhitelistIPService],
  exports: [FolderService],
})
export class FolderModule { }
