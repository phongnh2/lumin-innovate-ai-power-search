import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { AuthModule } from 'Auth/auth.module';
import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { MongoModule } from 'Database/mongo.module';
import { DocumentModule } from 'Document/document.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { FolderModule } from 'Folder/folder.module';
import { IntegrationModule } from 'Integration/Integration.module';
import { IntegrationService } from 'Integration/Integration.service';
import { LoggerModule } from 'Logger/Logger.module';
import { LuminContractModule } from 'LuminContract/luminContract.module';
import { pubSub } from 'Notication/notification.pubsub';
import { NotificationResolver } from 'Notication/notification.resolver';
import { NotificationService } from 'Notication/notification.service';
import NotificationSchema from 'Notication/schemas/notification.schema';
import NotificationUserSchema from 'Notication/schemas/notification.user.schema';
import { OrganizationModule } from 'Organization/organization.module';
import { RabbitMqModule } from 'RabbitMQ/RabbitMQ.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { TeamModule } from 'Team/team.module';
import { UserModule } from 'User/user.module';
import { WidgetNotificationModule } from 'WidgetNotification/widgetNotification.module';

import { NotificationController } from './notification.controller';

const pubSubProvider = {
  provide: 'PUB_SUB',
  useValue: pubSub,
};

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => DocumentModule),
    forwardRef(() => TeamModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => FolderModule),
    forwardRef(() => LoggerModule),
    forwardRef(() => AuthModule),
    forwardRef(() => WidgetNotificationModule),
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
      { name: 'Notification', schema: NotificationSchema },
      { name: 'NotificationUser', schema: NotificationUserSchema },
    ]),
    RateLimiterModule,
    LoggerModule,
    MongoModule,
    IntegrationModule,
    RabbitMqModule,
    LuminContractModule,
  ],
  controllers: [NotificationController],
  providers: [pubSubProvider, NotificationService, NotificationResolver, WhitelistIPService, IntegrationService],
  exports: [NotificationService],
})
export class NotificationModule { }
