import { HttpStatus, Injectable } from '@nestjs/common';
import { cloneDeep, get, max } from 'lodash';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { SOCKET_MESSAGE } from 'Common/constants/SocketConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import { AwsService } from 'Aws/aws.service';

import { DocumentMimeType } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { DocumentSharedService } from 'Document/document.shared.service';
import { IDocument } from 'Document/interfaces';
import { EnvironmentService } from 'Environment/environment.service';
import { EventsGateway } from 'Gateway/SocketIoConfig';
import { SocketRoomGetter } from 'Gateway/SocketRoom';
import {
  BasicResponse,
  CreatePresignedFormFieldDetectionUrlInput,
  CreatePresignedFormFieldDetectionUrlPayload,
  FormFieldDetection,
  FormFieldDetectionTrigger,
  Payment,
  ProcessAppliedFormFieldsInput,
} from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { OrganizationService } from 'Organization/organization.service';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';
import { EXCHANGE_KEYS, ROUTING_KEY } from 'RabbitMQ/RabbitMQ.constant';
import { RabbitMQService } from 'RabbitMQ/RabbitMQ.service';
import { User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import {
  AUTO_DETECTION_DAILY_QUOTA,
  FORM_FIELD_DETECTION_DAILY_QUOTA,
  FORM_FIELD_DETECTION_MESSAGE_PRIORITY,
} from './documentFormFieldDetection.constants';
import { DetectionErrorCodes } from './documentFormFieldDetection.enum';
import {
  IFormFieldDetectionMessage,
  IStatusMessage,
} from './documentFormFieldDetection.interface';
import { FormFieldDetectionUtils } from './utils/formFieldDetectionUtils';

@Injectable()
export class DocumentFormFieldDetectionService {
  constructor(
    private readonly awsService: AwsService,
    private readonly documentSharedService: DocumentSharedService,
    private readonly environmentService: EnvironmentService,
    private readonly userService: UserService,
    private readonly messageGateway: EventsGateway,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly loggerService: LoggerService,
    private readonly documentService: DocumentService,
    private readonly organizationService: OrganizationService,
  ) {}

  async createPresignedFormFieldDetectionUrl(
    user: User,
    input: CreatePresignedFormFieldDetectionUrlInput,
  ): Promise<CreatePresignedFormFieldDetectionUrlPayload> {
    const { documentId, fieldType = FormFieldDetection.signature, pages = [] } = input;
    const document = await this.documentSharedService.getDocumentByDocumentId(
      documentId,
    );
    if (!document) {
      throw GraphErrorException.NotFound('Document not found');
    }

    const prefixEnv = this.environmentService.getByKey(EnvConstants.ENV);
    const { key, sessionId } = FormFieldDetectionUtils.generateObjectKeyAndSessionId({
      documentId,
      mimeType: DocumentMimeType.PDF,
      prefixEnv,
      fieldType,
    });
    const autoDetectionPriority = await this.getUserAutoDetectionPriority(user, document);
    let metadata: Record<string, any> = null;
    if (pages.length > 0) {
      metadata = {
        pages: pages.join(','),
        priority: autoDetectionPriority.toString(),
      };
    } else {
      metadata = {
        priority: FORM_FIELD_DETECTION_MESSAGE_PRIORITY.toString(),
      };
    }

    let detectionUsagePromise = this.redisService.getFormFieldDetectionUsage(user._id);
    if (input.triggerAction === FormFieldDetectionTrigger.automatic) {
      detectionUsagePromise = this.redisService.getAutoDetectionUsage(user._id);
    }

    const [presignedUrlData, detectionUsage] = await Promise.all([
      this.awsService.createPresignedFormFieldDetectionUrl(key, metadata),
      detectionUsagePromise,
    ]);
    // Keep document in the payload to guarantee compatibility with stale frontend version
    // TODO: Removed in the next release after deploying this version
    const { url: presignedUrl } = presignedUrlData;
    return {
      document: presignedUrlData,
      presignedUrl,
      sessionId,
      priority: autoDetectionPriority,
      ...detectionUsage,
    };
  }

  onFormFieldDetectionCompleted(message: IFormFieldDetectionMessage, messageSize: number): void {
    if (message.status.error_code && !Object.values(DetectionErrorCodes).includes(message.status.error_code)) {
      this.onFormFieldDetectionFailed({
        documentId: message.document_id,
        error: message.status,
        errorCode: DetectionErrorCodes.THIRD_PARTY_ERROR,
        sessionId: message.session_id,
      });
      return;
    }

    const {
      documentId,
      predictions,
      status,
      sessionId,
    } = FormFieldDetectionUtils.transformFormFieldDetectionMessage(message);
    if (!sessionId) {
      this.loggerService.error({
        context: this.onFormFieldDetectionCompleted.name,
        message: `Ignoring detection result for document: ${documentId} because sessionId is missing`,
      });
      return;
    }

    const detectionSocketMessage = `${SOCKET_MESSAGE.FORM_FIELD_DETECTION_COMPLETED}-${sessionId}`;

    this.messageGateway.server
      .to(SocketRoomGetter.document(documentId))
      .emit(detectionSocketMessage, {
        documentId,
        predictions,
        status,
        sessionId,
      });

    this.loggerService.info({
      context: this.onFormFieldDetectionCompleted.name,
      message: `Sent Form Field Detection message ${detectionSocketMessage} to document id: ${documentId} in session ${sessionId}`,
      extraInfo: {
        documentId,
        numberOfPredictions: predictions.length,
        status,
        sessionId,
        messageSize,
      },
    });
  }

  onFormFieldDetectionFailed({
    documentId,
    error,
    errorCode = DetectionErrorCodes.INTERNAL_SERVER_ERROR,
    sessionId,
  }: {
    documentId: string;
    error: Error | IStatusMessage;
    errorCode?: DetectionErrorCodes;
    sessionId: string;
  }): void {
    this.messageGateway.server
      .to(SocketRoomGetter.document(documentId))
      .emit(`${SOCKET_MESSAGE.FORM_FIELD_DETECTION_COMPLETED}-${sessionId}`, {
        documentId,
        predictions: [],
        status: {
          code: (error as IStatusMessage).code || null,
          errorCode,
          message: error.message,
        },
      });
  }

  async grantFormFieldDetectionConsent(userId: string): Promise<void> {
    await this.userService.findOneAndUpdate(
      { _id: userId },
      { 'metadata.formFieldDetectionConsentGranted': true },
    );
  }

  async checkFormFieldDetectionUsage(userId: string): Promise<number> {
    const key = this.redisService.getFormFieldDetectionUsageKey(userId);
    const expireTime = CommonConstants.FORM_FIELD_DETECTION_QUOTA_EXPIRE_IN;
    const usage = await this.redisService.trackFeatureUsage({
      key,
      expireTime,
    });
    if (usage > FORM_FIELD_DETECTION_DAILY_QUOTA) {
      throw GraphErrorException.TooManyRequests(
        'You have reached your quota limit.',
      );
    }
    return usage;
  }

  async checkAutoDetectionUsage(userId: string): Promise<number> {
    const key = this.redisService.getAutoDetectionUsageKey(userId);
    const expireTime = CommonConstants.FORM_FIELD_DETECTION_QUOTA_EXPIRE_IN;
    const usage = await this.redisService.trackFeatureUsage({
      key,
      expireTime,
    });
    if (usage > AUTO_DETECTION_DAILY_QUOTA) {
      const detectionUsage = await this.redisService.getAutoDetectionUsage(userId);
      throw GraphErrorException.TooManyRequests(
        'You have reached your quota limit for auto detection.',
        undefined,
        detectionUsage,
      );
    }
    return usage;
  }

  async getFormFieldDetectionUsage(userId: string): Promise<{ usage: number; blockTime: number }> {
    return this.redisService.getFormFieldDetectionUsage(userId);
  }

  async getAutoDetectionUsage(userId: string): Promise<{ usage: number; blockTime: number }> {
    return this.redisService.getAutoDetectionUsage(userId);
  }

  processAppliedFormFields(
    input: ProcessAppliedFormFieldsInput,
  ): BasicResponse {
    const { documentId, predictionFieldDataList } = input;

    try {
      predictionFieldDataList.forEach((data) => {
        this.rabbitMQService.publish(
          EXCHANGE_KEYS.FORM_FIELD_DETECTION,
          ROUTING_KEY.LUMIN_FFD_APPLY_AI_FIELDS,
          { ...data, documentId },
        );
      });
    } catch (error) {
      this.loggerService.error({
        context: this.processAppliedFormFields.name,
        message: `Failed to send applied form fields of document: ${documentId} to AI service`,
        error,
      });
    }

    return {
      message: 'Send applied form fields to pinpoint successfully',
      statusCode: HttpStatus.OK,
    };
  }

  private async getUserAutoDetectionPriority(user: User, document: IDocument) {
    const isSharedDocument = await this.documentService.isSharedDocument({
      userId: user._id,
      document,
    });

    if (isSharedDocument) {
      const userPayment: Payment = get(user, 'payment', {});
      const orgList = await this.organizationService.getOrgListByUser(user._id);
      const listOrgPayment: Payment[] = orgList.map((org) => get(org, 'payment', {}));
      const autoDetectionPriorities = [userPayment, ...listOrgPayment].map(
        (payment) => cloneDeep(planPoliciesHandler
          .from({ plan: payment.type, period: payment.period })
          .getAutoDetectionPriority()),
      );
      return max(autoDetectionPriorities);
    }
    const payment = await this.documentService.getPaymentInfoOfDocument(document);
    if (!payment) {
      throw GraphErrorException.NotFound('Payment not found');
    }

    return planPoliciesHandler
      .from({ plan: payment.type, period: payment.period })
      .getAutoDetectionPriority();
  }
}
