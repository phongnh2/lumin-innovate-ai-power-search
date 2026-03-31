import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { Types } from 'mongoose';

import { CommonModule } from 'Common/common.module';
import { AllExceptionFilter } from 'Common/exceptions/all.exception.filter';
import { GraphExceptionFilter } from 'Common/exceptions/graph.exception.filter';
import { HttpExceptionFilter } from 'Common/exceptions/http.exception.filter';
import { ConcurrentRequestInterceptor } from 'Common/interceptors/concurrent-request.interceptor';

import { AdminModule } from 'Admin/admin.module';
import { AppController } from 'app.controller';
import { AwsSqsModule } from 'AwsSqs/aws-sqs.module';
import { BlogViewModule } from 'Blog/blogView.module';
import { DashBoardModule } from 'Dashboard/dashboard.module';
import { MongoModule } from 'Database/mongo.module';
import { DataLoaderModule } from 'DataLoader/dataLoader.module';
import { DeviceTrackingModule } from 'DeviceTracking/deviceTracking.module';
import { DocumentModule } from 'Document/document.module';
import { DocumentVersioningModule } from 'DocumentVersioning/documentVersioning.module';
import { EventModule } from 'Event/event.module';
import { FeedbackModule } from 'Feedback/feedback.module';
import { FolderModule } from 'Folder/folder.module';
import { FormTemplatesModule } from 'FormTemplates/formTemplates.module';
import { FunctionalLandingPageRatingModule } from 'FunctionalLandingPageRating/functional-landing-page-rating.module';
import { GraphqlModule } from 'Graphql/graphql.module';
import { S3GrpcModule } from 'GrpcClient/S3Grpc/s3-grpc.module';
import { HubspotModule } from 'Hubspot/hubspot.module';
import { IntercomModule } from 'Intercom/intercom.module';
import { KratosModule } from 'Kratos/kratos.module';
import { LoggerModule } from 'Logger/Logger.module';
import { LoggerService } from 'Logger/Logger.service';
import { LuminAgreementGenModule } from 'LuminAgreementGen/luminAgreementGen.module';
import { LuminContractModule } from 'LuminContract/luminContract.module';
import { MembershipModule } from 'Membership/membership.module';
import { NotificationModule } from 'Notication/notification.module';
import { OpenGoogleModule } from 'OpenGoogle/OpenGoogle.module';
import { OpenOneDriveModule } from 'OpenOneDrive/OpenOneDrive.module';
import { OpenSearchModule } from 'Opensearch/openSearch.module';
import { OrganizationModule } from 'Organization/organization.module';
import { PaymentModule } from 'Payment/payment.module';
import { PinpointModule } from 'Pinpoint/pinpoint.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { SlackModule } from 'Slack/slack.module';
import { SocketIOModule } from 'SocketIO/socket.io.module';
import { StripeModule } from 'Stripe/stripe.module';
import { TeamModule } from 'Team/team.module';
import { TemplateModule } from 'Template/template.module';
import { TrustpilotModule } from 'Trustpilot/trustpilot.module';
import { UploadModule } from 'Upload/upload.module';
import { UserModule } from 'User/user.module';
import { UserAnnotationModule } from 'UserAnnotation/userAnnotation.module';
import { UserMetricModule } from 'UserMetric/usermetric.module';
import { WebChatbotModule } from 'WebChatbot/webChatbot.module';
import { WidgetNotificationModule } from 'WidgetNotification/widgetNotification.module';

import { DocumentIndexingBacklogModule } from './DocumentIndexingBacklog/documentIndexingBacklog.module';

const { ObjectId } = Types;

ObjectId.prototype.valueOf = function () {
  return this.toString();
};

@Module({
  imports: [
    CommonModule,
    GraphqlModule,
    MongoModule,
    UserModule,
    DocumentModule,
    TeamModule,
    MembershipModule,
    PaymentModule,
    SocketIOModule,
    NotificationModule,
    /* For A/B testing */
    UserMetricModule,
    /* End */
    BlogViewModule,
    DeviceTrackingModule,
    LoggerModule,
    OrganizationModule,
    EventModule,
    OpenSearchModule,
    DashBoardModule,
    RateLimiterModule,
    HubspotModule,
    AdminModule,
    FolderModule,
    TemplateModule,
    WidgetNotificationModule,
    KratosModule,
    OpenGoogleModule,
    UploadModule,
    DataLoaderModule,
    TrustpilotModule,
    IntercomModule,
    FormTemplatesModule,
    PinpointModule,
    StripeModule,
    UserAnnotationModule,
    DocumentVersioningModule,
    FeedbackModule,
    OpenOneDriveModule,
    S3GrpcModule,
    LuminContractModule,
    LuminAgreementGenModule,
    SlackModule,
    WebChatbotModule,
    FunctionalLandingPageRatingModule,
    DocumentIndexingBacklogModule,
    AwsSqsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ConcurrentRequestInterceptor,
    },
    {
      provide: APP_FILTER,
      useFactory: (loggerService: LoggerService) => new AllExceptionFilter(loggerService),
      inject: [LoggerService],
    },
    {
      provide: APP_FILTER,
      useFactory: (loggerService: LoggerService) => new GraphExceptionFilter(loggerService),
      inject: [LoggerService],
    },
    {
      provide: APP_FILTER,
      useFactory: (loggerService: LoggerService) => new HttpExceptionFilter(loggerService),
      inject: [LoggerService],
    },
  ],
  controllers: [AppController],
})

export class AppModule { }
