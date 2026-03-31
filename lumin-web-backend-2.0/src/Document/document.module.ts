import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { AwsModule } from 'Aws/aws.module';

import { CustomRulesModule } from 'CustomRules/custom-rule.module';

import { AsymmetricJwtModule } from 'Asymmetric/asymmetric-jwt.module';
import { AuthModule } from 'Auth/auth.module';
import { CommunityTemplateModule } from 'CommunityTemplate/communityTemplate.module';
import { DocumentsController } from 'Document/document.controller';
import { DocumentsControllerMobile } from 'Document/document.controller.mobile';
import { DocumentResolvers } from 'Document/document.resolver';
import { DocumentService } from 'Document/document.service';
import DocumentAnnotationSchemaProvider from 'Document/providers/document.annotation.schema.provider';
import DocumentBackupInfoSchemaProvider from 'Document/providers/document.backup.info.schema.provider';
import DocumentFormSchema from 'Document/schemas/document.form.schema';
import DocumentImage from 'Document/schemas/document.image.schema';
import DocumentManipulation from 'Document/schemas/document.manipulation.schema';
import DocumentPermissionSchema from 'Document/schemas/document.permission.schema';
import DocumentRequestAccessSchema from 'Document/schemas/document.request.access.schema';
import DocumentSharedNonUserSchema from 'Document/schemas/document.shared.non.user.schema';
import DocumentDriveMetadataSchema from 'Document/schemas/documentDrive.metadata.schema';
import { DocumentIndexingBacklogModule } from 'DocumentIndexingBacklog/documentIndexingBacklog.module';
import { DocumentVersioningModule } from 'DocumentVersioning/documentVersioning.module';
import { EmailModule } from 'Email/email.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { EventModule } from 'Event/event.module';
import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import { FolderModule } from 'Folder/folder.module';
import { FormTemplatesModule } from 'FormTemplates/formTemplates.module';
import { GrpcClientModule } from 'GrpcClient/grpcClient.module';
import { IntegrationModule } from 'Integration/Integration.module';
import { IntegrationService } from 'Integration/Integration.service';
import { LoggerModule } from 'Logger/Logger.module';
import { MembershipModule } from 'Membership/membership.module';
import { RedisModule } from 'Microservices/redis/redis.module';
import { NotificationModule } from 'Notication/notification.module';
import { pubSub } from 'Notication/notification.pubsub';
import { OrganizationModule } from 'Organization/organization.module';
import { PaymentModule } from 'Payment/payment.module';
import { PinpointModule } from 'Pinpoint/pinpoint.module';
import { RabbitMqModule } from 'RabbitMQ/RabbitMQ.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { SlackModule } from 'Slack/slack.module';
import { SocketIOModule } from 'SocketIO/socket.io.module';
import { TeamModule } from 'Team/team.module';
import { TemplateModule } from 'Template/template.module';
import { UploadModule } from 'Upload/upload.module';
import { UserModule } from 'User/user.module';
import { UserMetricModule } from 'UserMetric/usermetric.module';
import { UserTrackingModule } from 'UserTracking/tracking.module';

import { DocumentActionPermissionResolvers } from './ActionPermission/document.action.permission.resolver';
import { DocumentActionPermissionService } from './ActionPermission/document.action.permission.service';
import DocumentActionPermissionSchema from './ActionPermission/schemas/document.action.permission.schema';
import { ChatbotGrpcController } from './Chatbot/chatbot-grpc.controller';
import { ChatbotResolver } from './Chatbot/chatbot.resolver';
import { ChatbotService } from './Chatbot/chatbot.service';
import { CompressDocumentController } from './CompressDocument/compressDocument.controller';
import { CompressDocumentResolver } from './CompressDocument/compressDocument.resolver';
import { CompressDocumentService } from './CompressDocument/compressDocument.service';
import { DocumentGrpcController } from './document-grpc.controller';
import { DocumentChangeStreamService } from './document.changeStream.service';
import { DocumentKindEnum } from './document.enum';
import { DocumentEventService } from './document.event.service';
import { DocumentIndexingController } from './document.indexing.controller';
import { DocumentServiceMobile } from './document.service.mobile';
import { DocumentSharedService } from './document.shared.service';
import { DocumentCheckerController } from './DocumentChecker/documentChecker.controller';
import { DocumentCheckerService } from './DocumentChecker/documentChecker.service';
import { DocumentFormFieldDetectionController } from './DocumentFormFieldDetection/documentFormFieldDetection.controller';
import { DocumentFormFieldDetectionResolver } from './DocumentFormFieldDetection/documentFormFieldDetection.resolver';
import { DocumentFormFieldDetectionService } from './DocumentFormFieldDetection/documentFormFieldDetection.service';
import { DocumentOutlineService } from './documentOutline.service';
import { DocumentPageToolsService } from './DocumentPageTools/documentPageTools.service';
import DocumentSummarizationSchema from './DocumentSummarization/document.summarization.schema';
import { DocumentSummarizationController } from './DocumentSummarization/documentSummarization.controller';
import { DocumentSummarizationResolver } from './DocumentSummarization/documentSummarization.resolver';
import { DocumentSummarizationService } from './DocumentSummarization/documentSummarization.service';
import { DocumentSummarizationClientService } from './DocumentSummarization/documentSummarizationClient.service';
import { DocumentSyncService } from './documentSync.service';
import { DocumentTemplateResolver } from './DocumentTemplate/documentTemplate.resolver';
import { DocumentTemplateService } from './DocumentTemplate/documentTemplate.service';
import { SignedUrlFactory } from './factory/SignedUrlFactory';
import DocumentFormField from './schemas/document.form.field.schema';
import { DocumentOutlineSchema } from './schemas/document.outline.schema';
import DocumentSchema from './schemas/document.schema';
import DocumentTemplateSchema from './schemas/documentTemplate.schema';
import RecentDocumentListSchema from './schemas/recent.document.list.schema';

const pubSubProvider = {
  provide: 'PUB_SUB',
  useValue: pubSub,
};

@Module({
  imports: [
    UploadModule,
    forwardRef(() => EmailModule),
    AwsModule,
    forwardRef(() => UserModule),
    /* For A/B testing */
    UserMetricModule,
    /* End */
    forwardRef(() => TeamModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => CommunityTemplateModule),
    JwtModule.registerAsync({
      imports: [EnvironmentModule],
      useFactory: (environmentService: EnvironmentService) => ({
        secret: environmentService.getByKey(EnvConstants.JWT_SECRET_KEY),
        signOptions: {
          algorithm: CommonConstants.JWT_ALGORITHM,
          expiresIn: CommonConstants.JWT_EXPIRE_IN,
        },
      }),
      inject: [EnvironmentService],
    }),
    MembershipModule,
    forwardRef(() => OrganizationModule),
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      { name: 'DocumentManipulation', schema: DocumentManipulation },
      { name: 'DocumentPermission', schema: DocumentPermissionSchema },
      { name: 'DocumentForm', schema: DocumentFormSchema },
      { name: 'DocumentSharedNonUser', schema: DocumentSharedNonUserSchema },
      { name: 'DocumentRequestAccess', schema: DocumentRequestAccessSchema },
      { name: 'DocumentImage', schema: DocumentImage },
      { name: 'DocumentDriveMetadata', schema: DocumentDriveMetadataSchema },
      { name: 'DocumentOutline', schema: DocumentOutlineSchema },
      {
        name: 'Document',
        schema: DocumentSchema,
        discriminators: [{ name: DocumentKindEnum.TEMPLATE, schema: DocumentTemplateSchema }],
      },
      { name: 'DocumentSummarization', schema: DocumentSummarizationSchema },
      { name: 'DocumentFormField', schema: DocumentFormField },
      { name: 'RecentDocumentList', schema: RecentDocumentListSchema },
      { name: 'DocumentActionPermission', schema: DocumentActionPermissionSchema },
    ]),
    UserTrackingModule,
    RedisModule,
    forwardRef(() => EventModule),
    RateLimiterModule,
    LoggerModule,
    FolderModule,
    TemplateModule,
    SocketIOModule,
    forwardRef(() => PaymentModule),
    UploadModule,
    FormTemplatesModule,
    forwardRef(() => CustomRulesModule),
    IntegrationModule,
    RabbitMqModule,
    DocumentVersioningModule,
    GrpcClientModule,
    SlackModule,
    DocumentIndexingBacklogModule,
    AsymmetricJwtModule,
    PinpointModule,
  ],
  controllers: [
    DocumentsController,
    DocumentsControllerMobile,
    DocumentSummarizationController,
    DocumentFormFieldDetectionController,
    DocumentCheckerController,
    DocumentGrpcController,
    DocumentCheckerController,
    CompressDocumentController,
    ChatbotGrpcController,
  ],
  providers: [
    DocumentSharedService,
    pubSubProvider,
    DocumentService,
    DocumentServiceMobile,
    DocumentResolvers,
    EnvironmentService,
    DocumentAnnotationSchemaProvider,
    DocumentBackupInfoSchemaProvider,
    SignedUrlFactory,
    IntegrationService,
    DocumentOutlineService,
    DocumentSummarizationResolver,
    DocumentSummarizationService,
    DocumentSummarizationClientService,
    DocumentFormFieldDetectionResolver,
    DocumentFormFieldDetectionService,
    DocumentCheckerService,
    DocumentPageToolsService,
    DocumentCheckerService,
    ChatbotResolver,
    ChatbotService,
    FeatureFlagService,
    DocumentEventService,
    CompressDocumentResolver,
    CompressDocumentService,
    DocumentSyncService,
    DocumentChangeStreamService,
    DocumentIndexingController,
    DocumentActionPermissionResolvers,
    DocumentActionPermissionService,
    DocumentTemplateService,
    DocumentTemplateResolver,
  ],
  exports: [
    DocumentService,
    DocumentServiceMobile,
    DocumentAnnotationSchemaProvider,
    DocumentBackupInfoSchemaProvider,
    DocumentOutlineService,
    DocumentEventService,
    DocumentSyncService,
    DocumentTemplateService,
  ],
})
export class DocumentModule {}
