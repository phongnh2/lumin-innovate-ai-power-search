import { Module } from '@nestjs/common';

import { AwsService } from 'Aws/aws.service';

import { EnvironmentModule } from 'Environment/environment.module';

import { AwsCompressPdfService } from './aws.compress-pdf.service';
import { AwsDocumentVersioningService } from './aws.document-versioning.service';
import { AwsServiceMobile } from './aws.service.mobile';

@Module({
  imports: [EnvironmentModule],
  providers: [AwsService, AwsServiceMobile, AwsDocumentVersioningService, AwsCompressPdfService],
  exports: [AwsService, AwsServiceMobile, AwsDocumentVersioningService, AwsCompressPdfService],
})

export class AwsModule {}
