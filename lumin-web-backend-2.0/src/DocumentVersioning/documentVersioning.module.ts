import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AwsModule } from 'Aws/aws.module';

import { CustomRulesModule } from 'CustomRules/custom-rule.module';

import { AuthModule } from 'Auth/auth.module';
import { DocumentModule } from 'Document/document.module';
import { DocumentVersioningController } from 'Document/document.versioning.controller';
import { DocumentVersioningResolvers } from 'DocumentVersioning/documentVersioning.resolver';
import { DocumentVersioningService } from 'DocumentVersioning/documentVersioning.service';
import { LoggerModule } from 'Logger/Logger.module';
import { MembershipModule } from 'Membership/membership.module';
import { RedisModule } from 'Microservices/redis/redis.module';
import { OrganizationModule } from 'Organization/organization.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { UserModule } from 'User/user.module';

import { DocumentVersioningStorageService } from './documentVersioning.storage.service';
import { DocumentVersioningSchema } from './schemas/documentVersioning.schema';

@Module({
  providers: [
    DocumentVersioningService,
    DocumentVersioningStorageService,
    DocumentVersioningResolvers,
  ],
  imports: [
    MongooseModule.forFeature([
      { name: 'DocumentVersioning', schema: DocumentVersioningSchema },
    ]),
    AwsModule,
    UserModule,
    RedisModule,
    AuthModule,
    RateLimiterModule,
    MembershipModule,
    OrganizationModule,
    forwardRef(() => DocumentModule),
    forwardRef(() => CustomRulesModule),
    LoggerModule,
  ],
  controllers: [DocumentVersioningController],
  exports: [
    DocumentVersioningService,
  ],
})
export class DocumentVersioningModule {}
