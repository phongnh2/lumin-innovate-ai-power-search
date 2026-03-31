import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { AwsModule } from 'Aws/aws.module';

import { CustomRulesModule } from 'CustomRules/custom-rule.module';

import { AdminPaymentService } from 'Admin/admin.payment.service';
import { AdminResolver } from 'Admin/admin.resolver';
import { AdminService } from 'Admin/admin.service';
import AdminSchema from 'Admin/schemas/admin.schema';
import EnterpriseUpgradeSchema from 'Admin/schemas/enterprise.invoice.schema';
import { AuthModule } from 'Auth/auth.module';
import { BlacklistModule } from 'Blacklist/blacklist.module';
import { BrazeModule } from 'Braze/braze.module';
import { CommunityTemplateModule } from 'CommunityTemplate/communityTemplate.module';
import { MongoModule } from 'Database/mongo.module';
import { DocumentModule } from 'Document/document.module';
import { EmailModule } from 'Email/email.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { EventModule } from 'Event/event.module';
import { FolderModule } from 'Folder/folder.module';
import { HubspotModule } from 'Hubspot/hubspot.module';
import { HubspotService } from 'Hubspot/hubspot.service';
import { KratosModule } from 'Kratos/kratos.module';
import { LuminContractModule } from 'LuminContract/luminContract.module';
import { MembershipModule } from 'Membership/membership.module';
import { RedisModule } from 'Microservices/redis/redis.module';
import { NotificationModule } from 'Notication/notification.module';
import { pubSub } from 'Notication/notification.pubsub';
import { OrganizationModule } from 'Organization/organization.module';
import { PaymentModule } from 'Payment/payment.module';
import { SocketIOModule } from 'SocketIO/socket.io.module';
import { SseModule } from 'SSE/sse.module';
import { TeamModule } from 'Team/team.module';
import { UserModule } from 'User/user.module';
import { UserTrackingModule } from 'UserTracking/tracking.module';

import { AdminController } from './admin.controller';

const pubSubProvider = {
  provide: 'PUB_SUB',
  useValue: pubSub,
};

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Admin', schema: AdminSchema },
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
    forwardRef(() => EnvironmentModule),
    MongooseModule.forFeature([
      { name: 'EnterpriseUpgrade', schema: EnterpriseUpgradeSchema },
    ]),
    forwardRef(() => PaymentModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => UserModule),
    forwardRef(() => TeamModule),
    forwardRef(() => DocumentModule),
    forwardRef(() => MembershipModule),
    forwardRef(() => CommunityTemplateModule),
    RedisModule,
    BlacklistModule,
    forwardRef(() => SocketIOModule),
    UserTrackingModule,
    MongoModule,
    AwsModule,
    forwardRef(() => AuthModule),
    EventModule,
    forwardRef(() => CommunityTemplateModule),
    HubspotModule,
    forwardRef(() => CustomRulesModule),
    BrazeModule,
    forwardRef(() => FolderModule),
    KratosModule,
    NotificationModule,
    LuminContractModule,
    SseModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminPaymentService,
    AdminResolver,
    pubSubProvider,
    HubspotService,
  ],
  exports: [AdminService, AdminPaymentService],
})
export class AdminModule {}
