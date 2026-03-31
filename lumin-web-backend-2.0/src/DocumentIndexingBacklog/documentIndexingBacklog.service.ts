import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { MIME_TYPE } from 'Common/constants/DocumentConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { FeatureFlagKeys } from 'Common/constants/FeatureFlags';

import { CustomRuleLoader } from 'CustomRules/custom-rule.loader';
import { CustomRulesService } from 'CustomRules/custom-rule.service';

import {
  DocumentIndexingOriginEnum, DocumentIndexingStatusEnum, DocumentRoleEnum, DocumentStorageEnum,
  DocumentWorkspace,
} from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { MAX_DOCUMENT_SIZE_FOR_INDEXING } from 'Document/documentConstant';
import { IDocument, IDocumentPermission, IIndexDocumentMessage } from 'Document/interfaces/document.interface';
import { EnvironmentService } from 'Environment/environment.service';
import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import { LoggerService } from 'Logger/Logger.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationService } from 'Organization/organization.service';
import { PaymentPlanEnums } from 'Payment/payment.enum';
import { EXCHANGE_KEYS, ROUTING_KEY } from 'RabbitMQ/RabbitMQ.constant';
import { RabbitMQService } from 'RabbitMQ/RabbitMQ.service';
import { IUser } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import { DOCUMENT_INDEXING_PREPARATION_CONTEXT, DocumentIndexingMessagePriority } from './constants/documentIndexingBacklog.constants';
import { DocumentIndexingTypeEnum } from './enums/documentIndexingBacklog.enum';
import { IndexingBacklogScoreService } from './indexingBacklogScore.service';
import { IDocumentIndexingBacklog } from './interfaces/documentIndexingBacklog.interface';

@Injectable()
export class DocumentIndexingBacklogService {
  constructor(
    @InjectModel('DocumentIndexingBacklog') private readonly documentIndexingBacklogModel: Model<IDocumentIndexingBacklog>,
    private readonly loggerService: LoggerService,
    private readonly indexingBacklogScoringService: IndexingBacklogScoreService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => FeatureFlagService))
    private readonly featureFlagService: FeatureFlagService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => CustomRulesService))
    private readonly customRulesService: CustomRulesService,
    @Inject(forwardRef(() => CustomRuleLoader))
    private readonly customRuleLoader: CustomRuleLoader,
  ) {}

  async createDocumentIndexingBacklog(
    documentIndexingBacklog: IDocumentIndexingBacklog,
  ): Promise<IDocumentIndexingBacklog> {
    return this.documentIndexingBacklogModel.create(documentIndexingBacklog);
  }

  async deleteDocumentIndexingBacklog(documentId: string): Promise<void> {
    await this.documentIndexingBacklogModel.deleteOne({ documentId });
  }

  private handleInsertManyError(error: any): IDocumentIndexingBacklog[] {
    const insertedDocuments = error?.insertedDocs || [];
    this.loggerService.error({
      context: DOCUMENT_INDEXING_PREPARATION_CONTEXT,
      message: 'Error inserting document indexing preparations',
      error: error?.writeErrors || error,
    });
    return insertedDocuments;
  }

  async publishDocumentIndexingInBatch(messages: IIndexDocumentMessage[]): Promise<void> {
    const results = await Promise.allSettled(
      messages.map((message) => this.publishSingleIndexingMessage(message)),
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failedCount = results.length - successCount;

    this.loggerService.info({
      context: DOCUMENT_INDEXING_PREPARATION_CONTEXT,
      message: 'Published indexing messages summary',
      extraInfo: {
        total: messages.length,
        success: successCount,
        failed: failedCount,
      },
    });
  }

  private async publishSingleIndexingMessage(message: IIndexDocumentMessage): Promise<void> {
    try {
      const result = await this.rabbitMQService.publishWithPriority({
        exchange: EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING,
        routingKey: ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_PRIORITY,
        data: message,
        priority: DocumentIndexingMessagePriority[DocumentIndexingTypeEnum.UPLOADED_DOCUMENT],
      });

      if (result) {
        await this.handlePublishSuccess(message);
      } else {
        await this.handlePublishError(message);
      }
    } catch (error) {
      await this.handlePublishError(message, (error as Error).message);
    }
  }

  async handlePublishSuccess(message: IIndexDocumentMessage): Promise<void> {
    this.loggerService.info({
      context: DOCUMENT_INDEXING_PREPARATION_CONTEXT,
      message: 'Success publishing messages',
      extraInfo: {
        documentId: message.documentId,
        clientId: message.clientId,
        clientType: message.clientType,
        documentName: message.documentName,
        source: message.source,
        remoteId: message.remoteId,
        userId: message.userId,
        documentPermissionId: message.documentPermissionId,
      },
    });

    await this.documentIndexingBacklogModel.updateOne({
      documentId: message.documentId,
    }, { $set: { status: DocumentIndexingStatusEnum.PROCESSING } });
  }

  async handlePublishError(message: IIndexDocumentMessage, error?: string): Promise<void> {
    this.loggerService.error({
      context: DOCUMENT_INDEXING_PREPARATION_CONTEXT,
      message: 'Error publishing messages',
      extraInfo: {
        documentId: message.documentId,
        clientId: message.clientId,
        clientType: message.clientType,
        documentName: message.documentName,
        source: message.source,
        remoteId: message.remoteId,
        userId: message.userId,
        documentPermissionId: message.documentPermissionId,
      },
      error,
    });

    await this.documentIndexingBacklogModel.updateOne({
      documentId: message.documentId,
    }, { $set: { status: DocumentIndexingStatusEnum.FAILED, errorMessage: error || 'Error publishing messages' } });
  }

  private async calculatePriorityScoresForBacklog(
    documentIndexingBacklogs: IDocumentIndexingBacklog[],
    documents: IDocument[],
  ): Promise<IDocumentIndexingBacklog[]> {
    const documentMap = new Map<string, IDocument>();
    documents.forEach((doc) => {
      documentMap.set(doc._id, doc);
    });

    const estimatedTotalBacklogDocs = await this.documentIndexingBacklogModel.estimatedDocumentCount();

    return documentIndexingBacklogs.map((backlogDoc) => {
      const document = documentMap.get(backlogDoc.documentId);
      if (!document) {
        this.loggerService.warn({
          context: DOCUMENT_INDEXING_PREPARATION_CONTEXT,
          message: `Document not found for backlog item: ${backlogDoc.documentId}`,
        });
        return backlogDoc;
      }

      const priorityScore = this.indexingBacklogScoringService.calculatePriorityScore(
        backlogDoc,
        document,
        estimatedTotalBacklogDocs,
      );

      return {
        ...backlogDoc,
        priorityScore,
      };
    });
  }

  async createDocumentIndexingBacklogBulk(
    documentIndexingBacklogs: IDocumentIndexingBacklog[],
    documents: IDocument[],
  ): Promise<IDocumentIndexingBacklog[]> {
    if (!documentIndexingBacklogs.length) {
      return [];
    }
    try {
      const backlogWithScores = await this.calculatePriorityScoresForBacklog(documentIndexingBacklogs, documents);

      const results = await this.documentIndexingBacklogModel.insertMany(backlogWithScores, {
        ordered: false,
        rawResult: true,
      });
      this.loggerService.info({
        context: DOCUMENT_INDEXING_PREPARATION_CONTEXT,
        message: 'Document indexing backlog bulk inserted',
        extraInfo: {
          documentIndexingBacklogs: documentIndexingBacklogs.length,
          results: results?.insertedIds,
        },
      });
      return results.mongoose.results as IDocumentIndexingBacklog[];
    } catch (error) {
      return this.handleInsertManyError(error);
    }
  }

  async genDocumentIndexingBacklogData(
    document: IDocument,
    documentPermission: IDocumentPermission,
    organization: IOrganization,
  ): Promise<IDocumentIndexingBacklog> {
    if (!documentPermission) {
      return null;
    }
    const documentMessage: IDocumentIndexingBacklog = {
      documentId: document._id,
      documentPermissionId: documentPermission._id,
      folderId: document.folderId,
      origin: DocumentIndexingOriginEnum.LUMIN_PDF,
      source: document.service as DocumentStorageEnum,
      userId: document.ownerId.toString(),
      documentName: document.name,
      remoteId: document.remoteId,
      fileSize: document.size,
      clientId: documentPermission.refId,
      clientType: documentPermission.role as DocumentRoleEnum,
      workspaceId: await this.documentService.getWorkspaceFromDocumentPermission(documentPermission),
      paymentPlan: organization.payment.type as PaymentPlanEnums,
      status: DocumentIndexingStatusEnum.PENDING,
      lastAccess: new Date(document.lastAccess),
      priorityScore: 0, // Will be calculated in the bulk insert
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return documentMessage;
  }

  async getTopKBacklogItems(k?: number): Promise<IDocumentIndexingBacklog[]> {
    const defaultK = Number(this.environmentService.getByKey(EnvConstants.TOP_K_INDEXING_BACKLOG_ITEMS)) || 40;
    return this.documentIndexingBacklogModel
      .find({ status: DocumentIndexingStatusEnum.PENDING })
      .sort({ priorityScore: -1 })
      .limit(k || defaultK).exec();
  }

  toMessages(backlogItems: IDocumentIndexingBacklog[]): IIndexDocumentMessage[] {
    return backlogItems.map((backlogItem) => ({
      workspaceId: backlogItem.workspaceId,
      remoteId: backlogItem.remoteId,
      source: backlogItem.source,
      userId: backlogItem.userId,
      documentName: backlogItem.documentName,
      documentId: backlogItem.documentId,
      clientId: backlogItem.clientId,
      clientType: backlogItem.clientType,
      documentPermissionId: backlogItem.documentPermissionId,
      folderId: backlogItem.folderId,
      origin: DocumentIndexingOriginEnum.LUMIN_PDF,
    }));
  }

  async indexHistoricalDocuments(): Promise<void> {
    const backlogItems = await this.getTopKBacklogItems();
    const messages = this.toMessages(backlogItems);
    await this.publishDocumentIndexingInBatch(messages);
  }

  isDocumentEligibleForIndexing(document: IDocument): boolean {
    return document.size <= MAX_DOCUMENT_SIZE_FOR_INDEXING
      && document.metadata.indexingStatus === DocumentIndexingStatusEnum.PENDING
      && document.mimeType as MIME_TYPE === MIME_TYPE.PDF;
  }

  async emitGoogleDocumentForIndexing(params: {
    document: IDocument,
    user: IUser,
    accessToken: string,
  }): Promise<boolean> {
    const {
      document, user, accessToken,
    } = params;

    if (document.service as DocumentStorageEnum !== DocumentStorageEnum.GOOGLE) {
      return false;
    }

    const isEligible = this.isDocumentEligibleForIndexing(document);
    if (!isEligible) {
      return false;
    }

    const documentPermission = await this.documentService.getOneDocumentPermission(user._id, { documentId: document._id });
    if (!documentPermission
      || documentPermission.role as DocumentRoleEnum !== DocumentRoleEnum.OWNER
      || documentPermission.workspace?.type !== DocumentWorkspace.ORGANIZATION
    ) {
      return false;
    }

    const organization = await this.organizationService.getOrgById(documentPermission.workspace?.refId);
    if (!organization) {
      return false;
    }

    const rules = this.customRuleLoader.getRulesForUser(user);
    if (rules.files.allowIndexing === false) {
      return false;
    }

    const isFeatureFlagEnabled = await this.featureFlagService.getFeatureIsOn({
      user,
      organization,
      featureFlagKey: FeatureFlagKeys.WEB_AI_CHATBOT,
    });
    const isTermsOfUseVersionChanged = this.userService.checkTermsOfUseVersionChanged(user);
    if (!isFeatureFlagEnabled || isTermsOfUseVersionChanged) {
      return false;
    }

    this.loggerService.info({
      context: DOCUMENT_INDEXING_PREPARATION_CONTEXT,
      message: 'Start preparing Google document for indexing',
      extraInfo: {
        documentId: document._id,
      },
    });

    const message: IIndexDocumentMessage = {
      remoteId: document.remoteId,
      source: document.service as DocumentStorageEnum,
      userId: document.ownerId.toString(),
      documentName: document.name,
      documentId: document._id,
      clientId: documentPermission.refId,
      workspaceId: await this.documentService.getWorkspaceFromDocumentPermission(documentPermission),
      clientType: documentPermission.role,
      documentPermissionId: documentPermission._id,
      folderId: document.folderId,
      origin: DocumentIndexingOriginEnum.LUMIN_PDF,
      accessToken,
    };

    await this.documentService.emitIndexDocumentMessage({
      message,
      indexType: DocumentIndexingTypeEnum.UPLOADED_GOOGLE_DOCUMENT,
      operation: 'index',
    });
    return true;
  }
}
