import { Module, forwardRef } from '@nestjs/common';

import { AwsModule } from 'Aws/aws.module';

import { CallbackModule } from 'Calback/callback.module';
import { EmailLoaderService } from 'Email/email-loader.service';
import { EmailService } from 'Email/email.service';
import { EnvironmentService } from 'Environment/environment.service';
import { EventModule } from 'Event/event.module';
import { LoggerModule } from 'Logger/Logger.module';
import { RedisModule } from 'Microservices/redis/redis.module';
import { OrganizationModule } from 'Organization/organization.module';
import { PaymentModule } from 'Payment/payment.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { UserModule } from 'User/user.module';

@Module({
  imports: [
    AwsModule,
    forwardRef(() => UserModule),
    CallbackModule.forRoot(),
    RedisModule,
    RateLimiterModule,
    LoggerModule,
    forwardRef(() => OrganizationModule),
    forwardRef(() => EventModule),
    PaymentModule,
  ],
  providers: [EmailService, EnvironmentService, EmailLoaderService],
  exports: [EmailService],
})
export class EmailModule { }
