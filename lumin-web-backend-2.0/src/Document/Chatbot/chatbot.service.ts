import { HttpStatus, Injectable } from '@nestjs/common';
import { cloneDeep, get, max } from 'lodash';

import { RedisConstants } from 'Common/callbacks/RedisConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { GrpcErrorException } from 'Common/errors/GrpcErrorException';

import { AwsService } from 'Aws/aws.service';

import { DocumentService } from 'Document/document.service';
import { DocumentSharedService } from 'Document/document.shared.service';
import { IDocument } from 'Document/interfaces';
import { EnvironmentService } from 'Environment/environment.service';
import { BasicResponseData, Payment } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { OrganizationService } from 'Organization/organization.service';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import {
  CHATBOT_FREE_REQUESTS_LIMIT,
  CHATBOT_PREFIX,
  EXPIRE_TIME_REDIS_ATTACHED_FILES_METADATA,
} from './constants/chatbot.constant';

@Injectable()
export class ChatbotService {
  constructor(
    private readonly awsService: AwsService,
    private readonly documentSharedService: DocumentSharedService,
    private readonly environmentService: EnvironmentService,
    private readonly userService: UserService,
    private readonly documentService: DocumentService,
    private readonly redisService: RedisService,
    private readonly organizationService: OrganizationService,
    private readonly loggerService: LoggerService,
  ) {}

  private async generatePutObjectUrl({
    keyFile,
    bucketName,
  }: {
    keyFile: string;
    bucketName: string;
  }) {
    return {
      needToUpload: true,
      putObjectUrl: await this.awsService.createSignedUrl({
        keyFile,
        bucketName,
      }),
    };
  }

  private async getDocumentMetadata({
    keyFile,
    bucketName,
  }: {
    keyFile: string;
    bucketName: string;
  }) {
    try {
      const metadata = await this.awsService.headObject({
        Bucket: bucketName,
        Key: keyFile,
      }, this.awsService.s3InstanceForDocument());
      return metadata;
    } catch (err) {
      this.loggerService.info({
        context: this.getDocumentMetadata.name,
        message: 'Failed to get document metadata',
        extraInfo: {
          error: err,
        },
      });
      return null;
    }
  }

  async processDocumentForChatbot({
    documentId,
    requestNewPutObjectUrl,
  }: {
    documentId: string;
    requestNewPutObjectUrl?: boolean;
  }) {
    const document = await this.documentSharedService.getDocumentByDocumentId(documentId);
    if (!document) {
      throw GrpcErrorException.NotFound('Document not found', ErrorCode.Document.DOCUMENT_NOT_FOUND);
    }

    const bucketName = this.environmentService.getByKey(
      EnvConstants.S3_TEMPORARY_FILES,
    );
    const keyFile = `${CHATBOT_PREFIX}/${documentId}`;

    if (requestNewPutObjectUrl) {
      return this.generatePutObjectUrl({ keyFile, bucketName });
    }

    const metadata = await this.getDocumentMetadata({ keyFile, bucketName });

    if (!metadata) {
      return this.generatePutObjectUrl({ keyFile, bucketName });
    }
    const lastModifyDate = document.lastModify || document.createdAt;
    if (metadata.LastModified.getTime() < new Date(lastModifyDate).getTime()) {
      return this.generatePutObjectUrl({ keyFile, bucketName });
    }

    return {
      needToUpload: false,
      putObjectUrl: null,
    };
  }

  async getPresignedUrlForAttachedFiles({
    documentId,
    attachedFileId,
  }: {
    documentId: string;
    attachedFileId: string;
  }) {
    const bucketName = this.environmentService.getByKey(
      EnvConstants.S3_TEMPORARY_FILES,
    );

    const presignedUrl = await this.awsService.createSignedUrl({
      keyFile: `${CHATBOT_PREFIX}/${documentId}/${attachedFileId}`,
      bucketName,
    });

    return { presignedUrl };
  }

  validateFreeRequestsLimit(freeRequestsUsed: number) {
    if (freeRequestsUsed < CHATBOT_FREE_REQUESTS_LIMIT) {
      return;
    }

    throw GrpcErrorException.TooManyRequests(
      `AI Chatbot limit exceeded: ${freeRequestsUsed}/${CHATBOT_FREE_REQUESTS_LIMIT} free requests used. Please upgrade to continue.`,
      ErrorCode.User.CHATBOT_FREE_REQUESTS_LIMIT_REACHED,
    );
  }

  getChatbotDailyRequestsLimitKey(userId: string): string {
    return `${RedisConstants.CHATBOT_DAILY_REQUESTS_LIMIT}${userId}`;
  }

  async validateDailyRequestLimit({
    dailyRequestsLimit,
    userId,
  }: {
    dailyRequestsLimit: number;
    userId: string;
  }) {
    const key = this.getChatbotDailyRequestsLimitKey(userId);
    const usage = await this.redisService.getFeatureUsage(key);
    if (usage < dailyRequestsLimit) {
      return;
    }
    const blockTime = await this.redisService.getFeatureBlockTime(key);

    throw GrpcErrorException.TooManyRequests(
      "You've reached your quota limit for today. Please try again tomorrow.",
      ErrorCode.User.CHATBOT_FREE_REQUESTS_LIMIT_REACHED,
      {
        blockTime,
      },
    );
  }

  async validateRequestsLimit({
    documentId,
    user,
  }: {
    documentId: string;
    user: User;
  }): Promise<{
    dailyRequestsLimit: number;
  }> {
    const document = await this.documentSharedService.getDocumentByDocumentId(documentId);
    if (!document) {
      throw GrpcErrorException.NotFound('Document not found', ErrorCode.Document.DOCUMENT_NOT_FOUND);
    }

    const dailyRequestsLimit = await this.getUserDailyLimit(user, document);

    if (dailyRequestsLimit === 0) {
      this.validateFreeRequestsLimit(user.metadata.chatbotFreeRequests);
    } else {
      await this.validateDailyRequestLimit({
        dailyRequestsLimit,
        userId: user._id,
      });
    }
    return {
      dailyRequestsLimit,
    };
  }

  private async getUserDailyLimit(user: User, document: IDocument) {
    const isSharedDocument = await this.documentService.isSharedDocument({
      userId: user._id,
      document,
    });

    if (isSharedDocument) {
      const userPayment: Payment = get(user, 'payment', {});
      const orgList = await this.organizationService.getOrgListByUser(user._id);
      const listOrgPayment: Payment[] = orgList.map((org) => get(org, 'payment', {}));
      const listChatbotDailyLimit = [userPayment, ...listOrgPayment].map(
        (payment) => cloneDeep(planPoliciesHandler
          .from({ plan: payment.type, period: payment.period })
          .getAIChatbotDailyLimit()),
      );
      return max(listChatbotDailyLimit);
    }
    const payment = await this.documentService.getPaymentInfoOfDocument(document);
    if (!payment) {
      throw GrpcErrorException.NotFound('Payment not found', ErrorCode.Payment.PAYMENT_NOT_FOUND);
    }

    const dailyRequestsLimit = planPoliciesHandler
      .from({ plan: payment.type, period: payment.period })
      .getAIChatbotDailyLimit();
    return dailyRequestsLimit;
  }

  async countFreeRequestsUsage(user: User) {
    await this.userService.findOneAndUpdate(
      { _id: user._id },
      { $inc: { 'metadata.chatbotFreeRequests': 1 } },
    );
  }

  async checkAttachedFilesMetadata({
    chatSessionId,
    etag,
  }: {
    chatSessionId: string;
    etag: string;
  }) {
    try {
      const storedEtag = await this.redisService.getValueFromHset(chatSessionId, etag);
      return {
        etag,
        isExist: storedEtag === etag,
      };
    } catch (error) {
      this.loggerService.error({
        context: this.checkAttachedFilesMetadata.name,
        message: 'Failed to check attached files metadata',
        extraInfo: {
          error,
          chatSessionId,
          etag,
        },
      });
      return {
        etag,
        isExist: false,
      };
    }
  }

  saveAttachedFilesMetadata({
    chatSessionId,
    s3RemoteId,
    etag,
    totalPages,
  }: {
    chatSessionId: string;
    s3RemoteId: string;
    etag: string;
    totalPages: number;
  }): BasicResponseData {
    try {
      this.redisService.setMultipleHsetData(chatSessionId, {
        s3RemoteId,
        [etag]: etag,
        totalPages: totalPages.toString(),
      });
      this.redisService.setExpireKey(`${chatSessionId}:${etag}`, EXPIRE_TIME_REDIS_ATTACHED_FILES_METADATA);

      return {
        message: 'Successfully save attached files metadata',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      this.loggerService.error({
        context: this.saveAttachedFilesMetadata.name,
        message: 'Failed to save attached files metadata',
        extraInfo: {
          error,
          chatSessionId,
        },
      });

      return {
        message: 'Failed to save attached files metadata',
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
  }
}
