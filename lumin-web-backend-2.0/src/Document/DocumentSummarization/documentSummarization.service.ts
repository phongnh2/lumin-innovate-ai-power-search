import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model, UpdateQuery } from 'mongoose';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { GrpcStatus } from 'Common/constants/GrpcConstants';
import { SOCKET_MESSAGE } from 'Common/constants/SocketConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import { AwsService } from 'Aws/aws.service';

import { DocumentService } from 'Document/document.service';
import { IDocument } from 'Document/interfaces/document.interface';
import { EnvironmentService } from 'Environment/environment.service';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import { SocketRoomGetter } from 'Gateway/SocketRoom';
import {
  DocumentSummarizationStatus,
  DocumentSummarizationVote,
  ExploredFeatureKeys,
  GetDocSummarizationOptions,
  UpdateDocSummarizationInput,
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import { DOCUMENT_SUMMARIZATION_ENABLED_DOMAINS, DOCUMENT_SUMMARIZATION_USAGE_PER_DAY } from './documentSummarization.constants';
import {
  CompleteSummarizationRequest,
  DocumentSummarization,
  InitDocSummarizationRequest,
  Status,
} from './documentSummarization.interface';
import {
  DocumentSummarizationClientService,
} from './documentSummarizationClient.service';
import { DocumentSummarizationError, GenerateRequiredError, SummarizationUsageExceedError } from './documentSummarizationError.interface';

@Injectable()
export class DocumentSummarizationService {
  private rateLimit: string;

  constructor(
    @InjectModel('DocumentSummarization')
    private readonly documentSummarizationModel: Model<DocumentSummarization>,
    private readonly documentSummarizationClientService: DocumentSummarizationClientService,
    private readonly userService: UserService,
    private readonly awsService: AwsService,
    private readonly environmentService: EnvironmentService,
    private readonly messageGateway: EventsGateway,
    private readonly redisService: RedisService,
    private readonly documentService: DocumentService,
    private readonly loggerService: LoggerService,
  ) {
    this.rateLimit = this.environmentService.getByKey(EnvConstants.DOC_SUM_RATE_LIMIT);
  }

  async validatePlanPolicies({ documentId, userId, domains }: { documentId: string, userId: string, domains: string[] }): Promise<boolean> {
    const document = await this.documentService.findOneById(documentId);

    if (!document) {
      throw GraphErrorException.NotFound(
        'Document not found',
        ErrorCode.Document.DOCUMENT_NOT_FOUND,
      );
    }

    const isEnabledSummarizationByDomain = DOCUMENT_SUMMARIZATION_ENABLED_DOMAINS.some(
      (enabledDomain) => domains.some((domain) => domain === enabledDomain),
    );

    const { documentSummarization } = await this.documentService.getPremiumToolInfo({ userId, document });

    return documentSummarization.enabled || isEnabledSummarizationByDomain;
  }

  async updateSummarizationExploration({ userId, documentId, domains }: {userId: string, documentId: string, domains: string[]}): Promise<void> {
    try {
      const canExploreSummarization = await this.userService.canExploredFeature({ userId, featureKey: ExploredFeatureKeys.SUMMARIZATION });
      const enabledByPlan = await this.validatePlanPolicies({ documentId, userId, domains });

      if (!canExploreSummarization || enabledByPlan) {
        return;
      }

      await this.userService.updateExploredFeature({
        userId,
        exploredFeatureKey: ExploredFeatureKeys.SUMMARIZATION,
      });
    } catch (error) {
      this.loggerService.error({
        context: 'IncreaseSummarizationUsage',
        message: 'Failed to update explored feature',
        error,
      });
    }
  }

  async validateAvailability({ documentId, userId, domains }: {documentId: string, userId: string, domains: string[] }): Promise<boolean> {
    const [validatedByPlanPolicies, canExploreFeature] = await Promise.all([
      this.validatePlanPolicies({ documentId, userId, domains }),
      this.userService.canExploredFeature({ userId, featureKey: ExploredFeatureKeys.SUMMARIZATION }),
    ]);

    if (!validatedByPlanPolicies && !canExploreFeature) {
      throw GraphErrorException.Forbidden(
        'You don\'t have permission to use Document Summarization',
        ErrorCode.Document.INVALID_PAYMENT_PLAN,
      );
    }

    return true;
  }

  async generateDocumentSummarization(
    user: User,
    document: IDocument,
    text: string,
  ): Promise<DocumentSummarization> {
    await this.checkSummarizationUsage(user._id);
    const request: InitDocSummarizationRequest = {
      doc_id: document._id,
      doc_version: '',
      doc_name: document.name,
      text,
      force_new: true,
    };
    const { status } = await this.documentSummarizationClientService.initSummarization(request);

    if (status.error_code || status.code === GrpcStatus.ABORTED) {
      const { code, error_code: errorCode, message } = status;
      throw new DocumentSummarizationError(code, errorCode, message);
    }

    const updateQuery: UpdateQuery<DocumentSummarization> = {
      userId: user._id,
      documentId: document._id,
      documentVersion: document.version,
      status: DocumentSummarizationStatus.PROCESSING,
    };

    const result = await this.documentSummarizationModel.findOneAndUpdate(
      { documentId: document._id, userId: user._id },
      updateQuery,
      { upsert: true, returnDocument: 'after' },
    ).lean();

    return result;
  }

  async getDocumentSummarization(
    user: User,
    documentId: string,
    options?: GetDocSummarizationOptions,
  ): Promise<DocumentSummarization> {
    const document = await this.documentService.findOneById(documentId);

    if (options?.regenerate) {
      return this.generateDocumentSummarization(user, document, options?.regenerate.text);
    }

    const completedSummarizations = await this.findCompletedSummarization(documentId, user._id);

    if (!completedSummarizations && !options?.regenerate.text) {
      throw new GenerateRequiredError();
    }

    if (!completedSummarizations) {
      return this.generateDocumentSummarization(user, document, options.regenerate.text);
    }

    if (completedSummarizations.documentVersion !== document.version) {
      throw new GenerateRequiredError();
    }

    return completedSummarizations;
  }

  async updateDocSummarizationVoting(
    userId: string,
    documentId: string,
    vote: DocumentSummarizationVote,
  ): Promise<DocumentSummarization> {
    const docSummarization = await this.documentSummarizationModel.findOneAndUpdate(
      { documentId, userId, vote: null },
      { vote },
      { returnDocument: 'after' },
    );

    if (!docSummarization) {
      throw GraphErrorException.BadRequest('Document summarization not found or already voted.');
    }

    await this.documentSummarizationClientService.updateSummaryVoting({
      summary_id: docSummarization.externalSummaryId,
      vote,
    });

    return docSummarization;
  }

  async updateDocumentSummarization(
    userId: string,
    documentId: string,
    input: UpdateDocSummarizationInput,
  ): Promise<DocumentSummarization> {
    if (input.vote) {
      return this.updateDocSummarizationVoting(userId, documentId, input.vote);
    }

    return null;
  }

  async grantDocSummarizationConsent(userId: string): Promise<void> {
    await this.userService.findOneAndUpdate(
      { _id: userId },
      { 'metadata.docSummarizationConsentGranted': true },
    );
  }

  async createGetPresignedUrlForSummarization(keyFile: string): Promise<string> {
    const temporaryBucket = this.environmentService.getByKey(EnvConstants.S3_TEMPORARY_FILES);
    return this.awsService.getSignedUrl({
      keyFile,
      bucketName: temporaryBucket,
    });
  }

  async onDocumentSummarizationCompleted(req: CompleteSummarizationRequest) {
    const documentId = req.doc_id;

    const haveError = req.status.error_code || req.status.code === GrpcStatus.ABORTED;

    const updateQuery: UpdateQuery<DocumentSummarization> = {
      content: req.summary_content,
      externalSummaryId: req.summary_id,
      status: haveError
        ? DocumentSummarizationStatus.FAILED
        : DocumentSummarizationStatus.COMPLETED,
      vote: null,
    };

    await this.documentSummarizationModel.updateMany(
      { documentId },
      updateQuery,
    );

    this.publishSummarizationCompletedEvent(documentId, req.summary_content, req.status);
  }

  async findCompletedSummarization(documentId: string, userId: string): Promise<DocumentSummarization> {
    const completedSummarizations = await this.documentSummarizationModel
      .find({ documentId, status: DocumentSummarizationStatus.COMPLETED })
      .lean();

    if (!completedSummarizations.length) {
      return null;
    }

    const summarizationByUser = completedSummarizations.find((summarization) => summarization.userId.toHexString() === userId);

    if (!summarizationByUser) {
      // Sync from other completed summarization
      const { externalSummaryId, status, content } = completedSummarizations[0];
      return this.documentSummarizationModel.create({
        documentId,
        userId,
        externalSummaryId,
        status,
        content,
      });
    }

    return summarizationByUser;
  }

  publishSummarizationCompletedEvent(documentId: string, content: string, status: Status) {
    this.messageGateway.server.to(SocketRoomGetter.document(documentId)).emit(SOCKET_MESSAGE.SUMMARIZATION_COMPLETED, { content, status });
  }

  async checkSummarizationUsage(userId): Promise<void> {
    const total = await this.redisService.increase(`${DOCUMENT_SUMMARIZATION_USAGE_PER_DAY}:${userId}`);
    if (total === 1) {
      const [amount, unit] = (this.rateLimit || '30 minutes').split(' ');
      const limit = moment.duration(amount, unit as moment.unitOfTime.DurationConstructor).asSeconds();
      this.redisService.setExpireKey(`${DOCUMENT_SUMMARIZATION_USAGE_PER_DAY}:${userId}`, limit);
    }
    if (total > 10) {
      throw new SummarizationUsageExceedError();
    }
  }
}
