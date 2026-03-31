import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ChangeStreamDocument,
  ChangeStreamInsertDocument,
  ChangeStreamDeleteDocument,
  ChangeStream,
} from 'mongodb';
import { Model } from 'mongoose';

import { MIME_TYPE } from 'Common/constants/DocumentConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';

import { DocumentIndexingTypeEnum } from 'DocumentIndexingBacklog/enums/documentIndexingBacklog.enum';
import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { EXCHANGE_KEYS, ROUTING_KEY } from 'RabbitMQ/RabbitMQ.constant';
import { RabbitMQService } from 'RabbitMQ/RabbitMQ.service';

import {
  DocumentIndexingOriginEnum,
  DocumentKindEnum,
  DocumentRoleEnum,
  DocumentStorageEnum,
} from './document.enum';
import { DocumentService } from './document.service';
import { MAX_DOCUMENT_SIZE_FOR_INDEXING } from './documentConstant';
import { IDocumentPermission, IIndexDocumentMessage } from './interfaces/document.interface';

@Injectable()
export class DocumentChangeStreamService implements OnModuleInit, OnModuleDestroy {
  private changeStream: ChangeStream;

  constructor(
    @InjectModel('DocumentPermission') private readonly documentPermissionModel: Model<IDocumentPermission>,
    private readonly documentService: DocumentService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly loggerService: LoggerService,
    private readonly environmentService: EnvironmentService,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit() {
    const isDevelopmentEnv = this.environmentService.isDevelopment;
    const isDevelopEnv = this.environmentService.getByKey(EnvConstants.ENV) === 'develop';
    const isStagingEnv = this.environmentService.getByKey(EnvConstants.ENV) === 'staging';
    const isProductionEnv = this.environmentService.getByKey(EnvConstants.ENV) === 'production';
    if (isDevelopmentEnv) {
      this.loggerService.info({
        context: `DocumentChangeStreamService:${this.onModuleInit.name}`,
        message: 'Document change stream disabled',
      });
      return;
    }
    if (isDevelopEnv || isStagingEnv || isProductionEnv) {
      this.initializeChangeStream();
    }
  }

  private initializeChangeStream() {
    try {
      this.changeStream = this.documentPermissionModel.watch<{_id: string}>().on('change', async (
        change: ChangeStreamDocument<IDocumentPermission>,
      ) => {
        await this.handleChangeStreamEvent(change);
      });

      this.loggerService.info({
        context: `DocumentChangeStreamService:${this.initializeChangeStream.name}`,
        message: 'Document change stream initialized successfully',
      });
    } catch (error) {
      this.loggerService.error({
        context: `DocumentChangeStreamService:${this.initializeChangeStream.name}`,
        message: 'Failed to initialize document change stream',
        error,
        extraInfo: { changeStream: this.changeStream },
      });
    }
  }

  async onModuleDestroy() {
    if (this.changeStream) {
      try {
        await this.changeStream.close();
        this.loggerService.info({
          context: `DocumentChangeStreamService:${this.onModuleDestroy.name}`,
          message: 'Document change stream closed successfully',
        });
      } catch (error) {
        this.loggerService.error({
          context: `DocumentChangeStreamService:${this.onModuleDestroy.name}`,
          message: 'Error closing document change stream',
          error,
          extraInfo: { changeStream: this.changeStream },
        });
      }
    }
  }

  private async handleChangeStreamEvent(change: ChangeStreamDocument<IDocumentPermission>) {
    if (change.operationType === 'insert' || change.operationType === 'delete') {
      const lockKey = `document-change-stream-lock-${change.documentKey._id.toString()}`;
      const lockAcquired = await this.redisService.setKeyIfNotExist(lockKey, 'true', '30000');
      if (!lockAcquired) {
        return;
      }

      switch (change.operationType) {
        case 'insert':
          await this.handleInsertOperation(change);
          break;
        case 'delete':
          this.handleDeleteOperation(change);
          break;
        default:
          break;
      }
    } else {
      this.loggerService.info({
        message: `Unhandled operation type: ${change.operationType}`,
        context: `DocumentChangeStreamService:${this.handleChangeStreamEvent.name}`,
        extraInfo: { change },
      });
    }
  }

  private async handleInsertOperation(change: ChangeStreamInsertDocument<IDocumentPermission>) {
    const {
      _id, documentId, refId, role, workspace, documentKind,
    } = change.fullDocument;
    if (documentKind === DocumentKindEnum.TEMPLATE) {
      this.loggerService.info({
        context: `DocumentChangeStreamService:${this.handleInsertOperation.name}`,
        message: 'Skipping indexing for document template',
        extraInfo: { change },
      });
      return;
    }
    if (![DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM, DocumentRoleEnum.OWNER].includes(role as DocumentRoleEnum)) {
      this.loggerService.info({
        context: `DocumentChangeStreamService:${this.handleInsertOperation.name}`,
        message: 'Document permission not allowed',
        extraInfo: { change },
      });
      return;
    }

    const documentInfo = await this.documentService.getDocumentByDocumentId(documentId);

    const isEnabledDocumentIndexing = await this.documentService.isEnabledDocumentIndexing(documentInfo.ownerId.toHexString(), change.fullDocument);
    if (!isEnabledDocumentIndexing) {
      return;
    }

    if (documentInfo.size > MAX_DOCUMENT_SIZE_FOR_INDEXING) {
      this.loggerService.info({
        context: `DocumentChangeStreamService:${this.handleInsertOperation.name}`,
        message: 'Document size is greater than 50MB, skipping indexing',
        extraInfo: { change },
      });
      return;
    }

    const documentService = documentInfo.service as DocumentStorageEnum;
    const documentMimeType = documentInfo.mimeType;

    if (documentMimeType !== MIME_TYPE.PDF) {
      this.loggerService.info({
        context: `DocumentChangeStreamService:${this.handleInsertOperation.name}`,
        message: 'Document mime type only PDF is supported for indexing',
        extraInfo: {
          change,
          documentMimeType,
        },
      });
      return;
    }

    this.loggerService.info({
      context: `DocumentChangeStreamService:${this.handleInsertOperation.name}`,
      message: 'Start indexing document',
      extraInfo: {
        change,
      },
    });

    const workspaceId = role === DocumentRoleEnum.ORGANIZATION ? refId?.toHexString() : workspace?.refId?.toHexString();

    const documentIndexingPayload: IIndexDocumentMessage = {
      remoteId: documentInfo.remoteId,
      source: documentService,
      userId: documentInfo.ownerId.toHexString(),
      documentName: documentInfo.name,
      documentId: documentInfo._id,
      clientId: refId.toHexString(),
      clientType: role,
      documentPermissionId: _id.toHexString(),
      folderId: documentInfo.folderId,
      workspaceId,
      origin: DocumentIndexingOriginEnum.LUMIN_PDF,
    };

    if (documentService === DocumentStorageEnum.GOOGLE) {
      const accessToken = await this.redisService.getThirdPartyAccessTokenForIndexing(documentInfo.ownerId.toHexString());
      documentIndexingPayload.accessToken = accessToken;
    }
    this.documentService.emitIndexDocumentMessage({
      message: documentIndexingPayload,
      indexType: DocumentIndexingTypeEnum.NEW_DOCUMENT,
    });
  }

  private handleDeleteOperation(change: ChangeStreamDeleteDocument<IDocumentPermission>) {
    const { _id } = change.documentKey;

    this.rabbitMQService.publish(
      EXCHANGE_KEYS.LUMIN_RAG_DOCUMENT_INDEXING,
      ROUTING_KEY.LUMIN_RAG_DOCUMENT_INDEXING_DELETE,
      {
        documentPermissionId: _id.toHexString(),
      },
    );
  }
}
