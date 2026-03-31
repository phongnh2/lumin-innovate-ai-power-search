import { Module, forwardRef } from '@nestjs/common';

import { AwsModule } from 'Aws/aws.module';

import { CustomRulesModule } from 'CustomRules/custom-rule.module';

import { DocumentModule } from 'Document/document.module';
import { LoggerModule } from 'Logger/Logger.module';
import { OrganizationModule } from 'Organization/organization.module';
import { RabbitMqModule } from 'RabbitMQ/RabbitMQ.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { TeamModule } from 'Team/team.module';
import { UserModule } from 'User/user.module';

import { IntegrationController } from './Integration.controller';
import { IntegrationDocumentService } from './Integration.document.service';
import { IntegrationOrganizationService } from './Integration.organization.service';
import { IntegrationService } from './Integration.service';

@Module({
  imports: [
    RabbitMqModule,
    LoggerModule,
    AwsModule,
    forwardRef(() => DocumentModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => UserModule),
    RateLimiterModule,
    forwardRef(() => CustomRulesModule),
    forwardRef(() => TeamModule),
  ],
  controllers: [
    IntegrationController,
  ],
  providers: [
    IntegrationDocumentService,
    IntegrationService,
    IntegrationOrganizationService,
  ],
  exports: [IntegrationService],
})

export class IntegrationModule {}
