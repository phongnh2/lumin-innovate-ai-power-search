import { Module } from '@nestjs/common';

import { AwsModule } from 'Aws/aws.module';

import { AuthModule } from 'Auth/auth.module';
import { DocumentModule } from 'Document/document.module';
import { MembershipModule } from 'Membership/membership.module';
import { OrganizationModule } from 'Organization/organization.module';
import { UserModule } from 'User/user.module';

import { S3GrpcController } from './s3-grpc.controller';
import { S3GrpcService } from './s3-grpc.service';

@Module({
  imports: [
    AwsModule,
    AuthModule,
    UserModule,
    DocumentModule,
    MembershipModule,
    OrganizationModule,
  ],
  controllers: [
    S3GrpcController,
  ],
  providers: [
    S3GrpcService,
  ],
})
export class S3GrpcModule {}
