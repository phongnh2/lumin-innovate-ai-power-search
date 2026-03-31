import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CustomRulesModule } from 'CustomRules/custom-rule.module';

import { DocumentModule } from 'Document/document.module';
import { FeatureFlagModule } from 'FeatureFlag/FeatureFlag.module';
import { LoggerModule } from 'Logger/Logger.module';
import { OrganizationModule } from 'Organization/organization.module';
import { RabbitMqModule } from 'RabbitMQ/RabbitMQ.module';
import { UserModule } from 'User/user.module';

import { DocumentIndexingBacklogController } from './documentIndexingBacklog.controller';
import { DocumentIndexingBacklogService } from './documentIndexingBacklog.service';
import { IndexingBacklogScoreService } from './indexingBacklogScore.service';
import DocumentIndexingBacklogSchema from './schemas/documentIndexingBacklog.schema';

@Module({
  controllers: [DocumentIndexingBacklogController],
  providers: [DocumentIndexingBacklogService, IndexingBacklogScoreService],
  imports: [
    MongooseModule.forFeature([
      { name: 'DocumentIndexingBacklog', schema: DocumentIndexingBacklogSchema },
    ]),
    LoggerModule,
    RabbitMqModule,
    forwardRef(() => FeatureFlagModule),
    forwardRef(() => DocumentModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => UserModule),
    forwardRef(() => CustomRulesModule),
  ],
  exports: [DocumentIndexingBacklogService, IndexingBacklogScoreService],
})
export class DocumentIndexingBacklogModule {}
