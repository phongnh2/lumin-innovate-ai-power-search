import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'Environment/environment.module';
import { FormTemplatesService } from 'FormTemplates/formTemplates.service';
import { LoggerModule } from 'Logger/Logger.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { UserModule } from 'User/user.module';

import { FormTemplatesResolver } from './formTemplates.resolver';

@Module({
  imports: [
    EnvironmentModule,
    LoggerModule,
    RateLimiterModule,
    UserModule,
  ],
  controllers: [],
  providers: [FormTemplatesResolver, FormTemplatesService],
  exports: [FormTemplatesService],
})
export class FormTemplatesModule { }
