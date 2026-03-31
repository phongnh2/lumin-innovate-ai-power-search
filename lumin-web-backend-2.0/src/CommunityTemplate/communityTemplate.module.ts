import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AwsModule } from 'Aws/aws.module';

import { AdminModule } from 'Admin/admin.module';
import { CommunityTemplateResolver } from 'CommunityTemplate/communityTemplate.resolver';
import { CommunityTemplateService } from 'CommunityTemplate/communityTemplate.service';
import CommunityTemplateSchema from 'CommunityTemplate/schemas/communityTemplate.schema';
import TemplateCategorySchema from 'CommunityTemplate/schemas/templateCategory.schema';
import { EventModule } from 'Event/event.module';
import { RateLimiterModule } from 'RateLimiter/rateLimiter.module';
import { UserModule } from 'User/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CommunityTemplate', schema: CommunityTemplateSchema },
      { name: 'TemplateCategory', schema: TemplateCategorySchema },
    ]),
    forwardRef(() => AdminModule),
    forwardRef(() => UserModule),
    forwardRef(() => AwsModule),
    forwardRef(() => RateLimiterModule),
    EventModule,
  ],
  providers: [
    CommunityTemplateResolver, CommunityTemplateService,
  ],
  exports: [
    CommunityTemplateService,
  ],
})
export class CommunityTemplateModule { }
