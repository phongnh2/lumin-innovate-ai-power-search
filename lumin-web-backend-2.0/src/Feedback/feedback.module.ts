import { Module } from '@nestjs/common';

import { AuthModule } from 'Auth/auth.module';
import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService } from 'Logger/Logger.service';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { UserModule } from 'User/user.module';

import { CannyService } from './services/canny.service';
import { UserFeedbackService } from './services/userFeedback.service';
import { UserFeedbackResolver } from './userFeedback.resolver';

@Module({
  controllers: [],
  providers: [UserFeedbackResolver, UserFeedbackService, CannyService, LoggerService, EnvironmentService],
  imports: [
    RateLimiterModule,
    UserModule,
    AuthModule,
  ],
  exports: [],
})
export class FeedbackModule {}
