import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { AuthModule } from 'Auth/auth.module';
import { WhitelistIPService } from 'Auth/whitelistIP.sevice';
import { MongoModule } from 'Database/mongo.module';
import { EnvironmentModule } from 'Environment/environment.module';
import { EnvironmentService } from 'Environment/environment.service';
import { LoggerModule } from 'Logger/Logger.module';
import { pubSub } from 'Notication/notification.pubsub';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { UserModule } from 'User/user.module';
import WidgetNotificationSchema from 'WidgetNotification/schemas/widgetNotification.schema';
import { WidgetNotificationResolver } from 'WidgetNotification/widgetNotification.resolver';
import { WidgetNotificationService } from 'WidgetNotification/widgetNotification.service';

const pubSubProvider = {
  provide: 'PUB_SUB',
  useValue: pubSub,
};

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
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
      { name: 'WidgetNotification', schema: WidgetNotificationSchema },
    ]),
    RateLimiterModule,
    LoggerModule,
    MongoModule,
  ],
  providers: [pubSubProvider, WidgetNotificationService, WidgetNotificationResolver, WhitelistIPService],
  exports: [WidgetNotificationService],
})
export class WidgetNotificationModule { }
