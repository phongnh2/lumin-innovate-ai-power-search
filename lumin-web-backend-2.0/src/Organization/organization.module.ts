import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { AwsModule } from 'Aws/aws.module';

import { CustomRulesModule } from 'CustomRules/custom-rule.module';

import { AdminModule } from 'Admin/admin.module';
import EnterpriseUpgradeSchema from 'Admin/schemas/enterprise.invoice.schema';
import { AuthModule } from 'Auth/auth.module';
import { BlacklistModule } from 'Blacklist/blacklist.module';
import { BrazeModule } from 'Braze/braze.module';
import { MongoModule } from 'Database/mongo.module';
import { DocumentModule } from 'Document/document.module';
import { DocumentServiceMobile } from 'Document/document.service.mobile';
import { DocumentIndexingBacklogModule } from 'DocumentIndexingBacklog/documentIndexingBacklog.module';
import { EmailModule } from 'Email/email.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { EventModule } from 'Event/event.module';
import { FeatureFlagModule } from 'FeatureFlag/FeatureFlag.module';
import { FolderModule } from 'Folder/folder.module';
import { GrpcClientModule } from 'GrpcClient/grpcClient.module';
import { HubspotWorkspaceService } from 'Hubspot/hubspot-workspace.service';
import { HubspotModule } from 'Hubspot/hubspot.module';
import { HubspotService } from 'Hubspot/hubspot.service';
import { IntegrationModule } from 'Integration/Integration.module';
import { IntegrationService } from 'Integration/Integration.service';
import { KratosModule } from 'Kratos/kratos.module';
import { LoggerModule } from 'Logger/Logger.module';
import { LuminAgreementGenModule } from 'LuminAgreementGen/luminAgreementGen.module';
import { LuminContractModule } from 'LuminContract/luminContract.module';
import { MembershipModule } from 'Membership/membership.module';
import { NotificationModule } from 'Notication/notification.module';
import { pubSub } from 'Notication/notification.pubsub';
import { OrganizationController } from 'Organization/organization.controller';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import { OrganizationInviteLinkService } from 'Organization/organization.inviteLink.service';
import { OrganizationService } from 'Organization/organization.service';
import { OrganizationTeamService } from 'Organization/organizationTeam.service';
import { OrganizationResolver } from 'Organization/resolvers/organization.resolver';
import { OrganizationPrivateResolver } from 'Organization/resolvers/private/organization.private.resolver';
import { OrganizationTeamPrivateResolver } from 'Organization/resolvers/private/organizationTeam.private.resolver';
import { OrganizationPublicResolver } from 'Organization/resolvers/public/organization.public.resolver';
import { OrganizationPublicResolverMobile } from 'Organization/resolvers/public/organization.public.resolver.mobile';
import { OrganizationTeamPublicResolver } from 'Organization/resolvers/public/organizationTeam.public.resolver';
import { OrganizationTeamPublicResolverMobile } from 'Organization/resolvers/public/organizationTeam.public.resolver.mobile';
import OrganizationDocStackSchema from 'Organization/schemas/organization.docStack.schema';
import OrganizationDocStackQuotaSchema from 'Organization/schemas/organization.docStackQuotas.schema';
import OrganizationGroupPermissionSchema from 'Organization/schemas/organization.group.permission.schema';
import OrganizationInviteLinkSchema from 'Organization/schemas/organization.inviteLink.schema';
import OrganizationMemberSchema from 'Organization/schemas/organization.member.schema';
import OrganizationSchema from 'Organization/schemas/organization.schema';
import RequestAccessSchema from 'Organization/schemas/request.access.schema';
import { PaymentModule } from 'Payment/payment.module';
import { PinpointModule } from 'Pinpoint/pinpoint.module';
import { RabbitMqModule } from 'RabbitMQ/RabbitMQ.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { SocketIOModule } from 'SocketIO/socket.io.module';
import { TeamModule } from 'Team/team.module';
import { TemplateModule } from 'Template/template.module';
import { UploadService } from 'Upload/upload.service';
import { UserModule } from 'User/user.module';

import { OrganizationDocStackQuotaService } from './organization.docStackQuota.service';
import { OrganizationPaymentService } from './organization.payment.service';
import { OrganizationServiceMobile } from './organization.service.mobile';

const pubSubProvider = {
  provide: 'PUB_SUB',
  useValue: pubSub,
};

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => DocumentModule),
    MongooseModule.forFeature([
      { name: 'Organization', schema: OrganizationSchema },
      { name: 'OrganizationMember', schema: OrganizationMemberSchema },
      {
        name: 'OrganizationGroupPermission',
        schema: OrganizationGroupPermissionSchema,
      },
      { name: 'RequestAccess', schema: RequestAccessSchema },
      { name: 'EnterpriseUpgrade', schema: EnterpriseUpgradeSchema },
      { name: 'OrganizationDocStack', schema: OrganizationDocStackSchema },
      { name: 'OrganizationDocStackQuota', schema: OrganizationDocStackQuotaSchema },
      { name: 'OrganizationInviteLink', schema: OrganizationInviteLinkSchema },
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
    forwardRef(() => TeamModule),
    forwardRef(() => DocumentModule),
    forwardRef(() => MembershipModule),
    forwardRef(() => EventModule),
    HubspotModule,
    AwsModule,
    forwardRef(() => PaymentModule),
    forwardRef(() => AdminModule),
    RateLimiterModule,
    LoggerModule,
    BlacklistModule,
    MongoModule,
    forwardRef(() => SocketIOModule),
    forwardRef(() => TemplateModule),
    forwardRef(() => FolderModule),
    forwardRef(() => CustomRulesModule),
    forwardRef(() => BrazeModule),
    IntegrationModule,
    RabbitMqModule,
    FeatureFlagModule,
    PinpointModule,
    GrpcClientModule,
    LuminContractModule,
    DocumentIndexingBacklogModule,
    LuminAgreementGenModule,
    KratosModule,
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationResolver,
    OrganizationService,
    OrganizationServiceMobile,
    OrganizationTeamService,
    OrganizationDocStackService,
    OrganizationDocStackQuotaService,
    OrganizationPublicResolver,
    OrganizationPublicResolverMobile,
    OrganizationPrivateResolver,
    OrganizationTeamPrivateResolver,
    OrganizationTeamPublicResolver,
    OrganizationTeamPublicResolverMobile,
    pubSubProvider,
    HubspotService,
    HubspotWorkspaceService,
    UploadService,
    DocumentServiceMobile,
    OrganizationPaymentService,
    IntegrationService,
    OrganizationInviteLinkService,
  ],
  exports: [
    OrganizationTeamService,
    OrganizationService,
    OrganizationServiceMobile,
    OrganizationDocStackService,
    OrganizationDocStackQuotaService,
    OrganizationPaymentService,
    OrganizationInviteLinkService,
  ],
})
export class OrganizationModule {}
