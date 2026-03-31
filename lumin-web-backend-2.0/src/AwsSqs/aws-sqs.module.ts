import { SQSClient } from '@aws-sdk/client-sqs';
import { Module } from '@nestjs/common';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { AwsModule } from 'Aws/aws.module';

import { AuthModule } from 'Auth/auth.module';
import { DocumentModule } from 'Document/document.module';
import { EnvironmentService } from 'Environment/environment.service';
import { KratosModule } from 'Kratos/kratos.module';
import { LuminContractModule } from 'LuminContract/luminContract.module';
import { OrganizationModule } from 'Organization/organization.module';
import { UserModule } from 'User/user.module';

import { SQS_CLIENT } from './aws-sqs.constants';
import { ScimConsumerService } from './scim.consumer.service';

const SqsClientProvider = {
  provide: SQS_CLIENT,
  useFactory: (environmentService: EnvironmentService) => {
    const region = environmentService.getByKey(EnvConstants.AWS_SQS_REGION);
    const accessKeyId = environmentService.getByKey(EnvConstants.AWS_SQS_ACCESS_KEY);
    const secretAccessKey = environmentService.getByKey(EnvConstants.AWS_SQS_SECRET_KEY);
    const { isDevelopment } = environmentService;

    if (!region || (isDevelopment && (!accessKeyId || !secretAccessKey))) {
      return null;
    }

    return new SQSClient({
      region,
      credentials: isDevelopment ? {
        accessKeyId,
        secretAccessKey,
      } : undefined,
    });
  },
  inject: [EnvironmentService],
};

@Module({
  imports: [
    KratosModule,
    OrganizationModule,
    UserModule,
    AuthModule,
    LuminContractModule,
    DocumentModule,
    AwsModule,
  ],
  providers: [SqsClientProvider, ScimConsumerService],
  exports: [ScimConsumerService],
})
export class AwsSqsModule {}
