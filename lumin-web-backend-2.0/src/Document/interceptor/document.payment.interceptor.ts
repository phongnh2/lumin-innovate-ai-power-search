/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus, Inject, forwardRef,
} from '@nestjs/common';
import { isNil } from 'lodash';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CommonConstants } from 'Common/constants/CommonConstants';
import { EnvConstants } from 'Common/constants/EnvConstants';
import { FeatureFlagKeys } from 'Common/constants/FeatureFlags';
import { DOC_STACK_PLAN, UNLIMITED_DOCUMENT_STACK } from 'Common/constants/PaymentConstant';
import { Utils } from 'Common/utils/Utils';

import { DocStackIntervalEnum, DocumentKindEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import DocumentPaymentHandler from 'Document/handlers/documentPaymentHandler/document.payment.handler';
import DocumentPaymentRequest from 'Document/handlers/documentPaymentHandler/interface/document.payment.request';
import { EnvironmentService } from 'Environment/environment.service';
import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationDocStackService } from 'Organization/organization.docStack.service';
import { OrganizationPromotionEnum } from 'Organization/organization.enum';
import { OrganizationService } from 'Organization/organization.service';
import { PaymentPlanEnums, PaymentStatusEnums } from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';
import { TeamService } from 'Team/team.service';
import { UserService } from 'User/user.service';

interface ExtendedDocumentPaymentInfo {
  strategy: string;
  incrementTarget?: IOrganization;
  documentIds: string[];
  isMultipleTarget?: boolean;
  fromSyncDocument?: boolean;
}

export interface ExtendedDocumentIntercept {
  interceptRequest?: ExtendedDocumentPaymentInfo;
}

@Injectable()
export class DocumentPaymentInterceptor implements NestInterceptor {
  static STRATEGY = {
    AUTO_INCREMENT: 'auto_increment',
    SPECIFIC_TARGET: 'specific_target',
    MULTIPLE_TARGET: 'multiple_target',
  };

  private handler: DocumentPaymentHandler;

  private interval: DocStackIntervalEnum = DocStackIntervalEnum.MONTH;

  constructor(
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    private readonly environmentService: EnvironmentService,
    private readonly organizationDocStackService: OrganizationDocStackService,
    teamService: TeamService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {
    this.handler = new DocumentPaymentHandler(
      documentService,
      teamService,
      organizationService,
      organizationDocStackService,
    );
    this.interval = this.environmentService.getByKey(EnvConstants.DOC_STACK_INTERVAL) as DocStackIntervalEnum;
  }

  private async filterDocumentTemplates(documentIds: string[]): Promise<string[]> {
    if (!documentIds || documentIds.length === 0) {
      return [];
    }
    const documents = await this.documentService.findDocumentsByIds(documentIds);
    return documents
      .filter((doc) => doc.kind !== DocumentKindEnum.TEMPLATE)
      .map((doc) => doc._id);
  }

  async increaseDocStackByInterceptRequest(
    interceptRequest: ExtendedDocumentPaymentInfo,
    data: {
      incrementTarget: IOrganization;
      userId: string;
      userAgent?: string;
      anonymousUserId?: string;
    },
  ): Promise<void> {
    const {
      strategy, documentIds, isMultipleTarget, fromSyncDocument,
    } = interceptRequest;

    // filter out document templates
    const filteredDocumentIds = await this.filterDocumentTemplates(documentIds);
    if (filteredDocumentIds.length === 0) {
      return;
    }
    const { userId, userAgent, anonymousUserId } = data;

    switch (strategy) {
      case DocumentPaymentInterceptor.STRATEGY.AUTO_INCREMENT:
        if (isMultipleTarget) {
          const documentOrgMapping = await Promise.all(
            filteredDocumentIds.map(async (docId) => {
              const orgId = await this.documentService.getTargetOwnedDocumentId(docId);
              return { docId, orgId };
            }),
          );

          // group documents by organization
          const orgDocumentMap = documentOrgMapping.reduce<
            Record<string, string[]>
          >((acc, { docId, orgId }) => {
            acc[orgId] = acc[orgId] || [];
            acc[orgId].push(docId);
            return acc;
          }, {});

          await Promise.all(
            Object.values(orgDocumentMap).map(async (groupedDocumentIds) => {
              await this.handleAutoIncrementStrategy({
                documentIds: groupedDocumentIds,
                fromSyncDocument,
                userId,
                userAgent,
                anonymousUserId,
              });
            }),
          );
          return;
        }

        await this.handleAutoIncrementStrategy({
          documentIds: filteredDocumentIds,
          fromSyncDocument,
          userId,
          userAgent,
          anonymousUserId,
        });
        break;
      case DocumentPaymentInterceptor.STRATEGY.SPECIFIC_TARGET:
        {
          const documentPaymentRequest = new DocumentPaymentRequest();
          documentPaymentRequest.setDocumentIds(filteredDocumentIds);

          const {
            incrementTarget: {
              _id: orgId,
              payment,
              docStackStartDate,
              createdAt,
            },
          } = data;
          const docStack = planPoliciesHandler
            .from({ plan: payment.type, period: payment.period })
            .getDocStack();
          if (docStack !== UNLIMITED_DOCUMENT_STACK) {
            documentPaymentRequest.setIncrementTargetId(orgId);
          }
          if (filteredDocumentIds.length > 0) {
            await this.handleApproachingDocStackLimit({
              organization: data.incrementTarget,
              documentId: filteredDocumentIds[0],
              userId,
              fromSyncDocument,
              userAgent,
              anonymousUserId,
            });
            const updatedCommand = documentPaymentRequest.build({
              docStackStartDate: docStackStartDate || createdAt,
              interval: this.interval,
            });
            this.handler.execUpdateRequest(updatedCommand);

            // Handle time-sensitive coupon eligibility
            this.handleTimeSensitiveCouponEligibility({
              userId,
              organization: data.incrementTarget,
              anonymousUserId,
              userAgent,
            });
          }
        }
        break;
      default:
        break;
    }
  }

  async increaseDocStackByTotalDocPermission(requestData: {
    userId: string,
    documentId: string,
    operation: string,
    beforePermissionTotal: number,
    userAgent?: string,
    anonymousUserId?: string,
  }): Promise<void> {
    const {
      userId, documentId, beforePermissionTotal, userAgent, anonymousUserId,
    } = requestData;

    // check if document is document template and exclude it
    const filteredDocumentIds = await this.filterDocumentTemplates([documentId]);
    if (filteredDocumentIds.length === 0) {
      return;
    }

    const {
      _id: incrementTargetId, info: orgInfo,
    } = await this.handler.getDefaultDocumentPermissionTarget(requestData.documentId) || {};
    if (!orgInfo || !DOC_STACK_PLAN.includes(orgInfo.payment.type as PaymentPlanEnums)) {
      return;
    }
    const documentPaymentRequest = new DocumentPaymentRequest();
    const afterPermissionTotal = documentId ? await this.documentService.totalPermissionsOfDocument(requestData.documentId) : 0;
    if (afterPermissionTotal > beforePermissionTotal) {
      documentPaymentRequest.setDocumentIds([requestData.documentId]);
      documentPaymentRequest.setIncrementTargetId(incrementTargetId);
      const { createdAt, docStackStartDate } = orgInfo;
      const updatedCommand = documentPaymentRequest.build({ docStackStartDate: docStackStartDate || createdAt, interval: this.interval });
      this.handler.execUpdateRequest(updatedCommand);
      this.handleTimeSensitiveCouponEligibility({
        userId,
        organization: orgInfo,
        userAgent,
        anonymousUserId,
      });
    }
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const requestData = this.handler.destructProperty(context);
    const contextType = context.getType();

    let userId: string;
    let userAgent: string;
    let anonymousUserId: string;
    let isRequestFromMobile = false;
    if (contextType !== 'ws') {
      const contextRequest = Utils.getGqlRequest(context);
      userId = contextRequest.user?._id;
      userAgent = contextRequest.headers?.['user-agent'];
      anonymousUserId = contextRequest.anonymousUserId || contextRequest.cookies?.[CommonConstants.ANONYMOUS_USER_ID_COOKIE];
      isRequestFromMobile = await Utils.isRequestFromMobile(contextRequest);
    } else {
      const wsClient = context.switchToWs().getClient();
      userId = wsClient?.user?._id;
      userAgent = wsClient?.handshake?.headers?.['user-agent'];
      anonymousUserId = wsClient?.anonymousUserId;
      isRequestFromMobile = Utils.isWsRequestFromMobile(context);
    }

    if (!requestData) {
      return of([]);
    }

    if (isRequestFromMobile) {
      return next.handle();
    }
    const beforePermissionTotal = requestData.documentId ? await this.documentService.totalPermissionsOfDocument(requestData.documentId) : 0;

    return next.handle().pipe(map(async (data: any) => {
      if (data && data.statusCode === HttpStatus.OK) {
        const { interceptRequest } = data;

        if (interceptRequest) {
          await this.increaseDocStackByInterceptRequest(interceptRequest, {
            ...data, userId, userAgent, anonymousUserId,
          });
        } else {
          await this.increaseDocStackByTotalDocPermission({
            ...requestData,
            userId,
            beforePermissionTotal,
            userAgent,
            anonymousUserId,
          });
        }
      }
      return data;
    }));
  }

  private async handleAutoIncrementStrategy({
    userId,
    documentIds,
    fromSyncDocument,
    userAgent,
    anonymousUserId,
  }: {
    userId: string;
    documentIds: string[];
    fromSyncDocument?: boolean;
    userAgent?: string;
    anonymousUserId?: string;
  }): Promise<void> {
    const documentPaymentRequest = new DocumentPaymentRequest();
    documentPaymentRequest.setDocumentIds(documentIds);

    const { _id: incrementTargetId, info: orgInfo } = await this.handler.getDefaultDocumentPermissionTarget(documentIds[0]);
    if (
      !orgInfo
      || !DOC_STACK_PLAN.includes(orgInfo.payment.type as PaymentPlanEnums)
    ) {
      return;
    }
    const { payment, createdAt, docStackStartDate } = orgInfo;
    const docStack = planPoliciesHandler
      .from({ plan: payment.type, period: payment.period })
      .getDocStack(payment.quantity);
    if (docStack !== UNLIMITED_DOCUMENT_STACK) {
      documentPaymentRequest.setIncrementTargetId(incrementTargetId);
    }
    await this.handleApproachingDocStackLimit({
      organization: orgInfo,
      documentId: documentIds[0],
      userId,
      fromSyncDocument,
      userAgent,
      anonymousUserId,
    });
    const updatedCommand = documentPaymentRequest.build({
      docStackStartDate: docStackStartDate || createdAt,
      interval: this.interval,
    });
    this.handler.execUpdateRequest(updatedCommand);

    this.handleTimeSensitiveCouponEligibility({
      userId,
      organization: orgInfo,
      anonymousUserId,
      userAgent,
    });
  }

  private async handleApproachingDocStackLimit({
    organization,
    documentId,
    userId,
    fromSyncDocument = false,
    userAgent,
    anonymousUserId,
  }: {
    organization: IOrganization;
    documentId: string;
    userId: string;
    fromSyncDocument?: boolean;
    userAgent?: string;
    anonymousUserId?: string;
  }): Promise<void> {
    const { totalUsed, totalStack } = await this.organizationDocStackService.getDocStackInfo({
      orgId: organization._id,
      payment: organization.payment,
      totalNewDocument: 1,
    });
    if (totalUsed + 1 === totalStack) {
      /**
       * Edge Case: Repeatedly syncing a third-party document (e.g., Google Drive) that was edited in My Documents
       * may keep triggering this block, even though the document was already counted.
       *
       * Scenario:
       * - Upload one document to Org Documents, one third-party doc to My Documents.
       * - Edit third-party doc using the editor.
       * - First sync: the document is counted towards the doc stack.
       * - Second sync: totalUsed + 1 === totalStack (e.g., 2 + 1 === 3) remains true on every sync.
       *
       * This check prevents triggering the tracking event & notify below.
       */
      if (fromSyncDocument && documentId) {
        const isAlreadyCounted = Boolean(await this.organizationDocStackService.getOneDocStack({
          orgId: organization._id,
          documentId,
        }));
        if (isAlreadyCounted) {
          return;
        }
      }
      this.organizationService.notifyHitDocstack(organization);
      this.organizationDocStackService.trackOrgHitDocStackLimitEvent({
        userId,
        organization,
        docStackLimit: totalStack,
        userAgent,
        anonymousUserId,
      });
    }
  }

  private async handleTimeSensitiveCouponEligibility({
    userId,
    organization,
    anonymousUserId,
    userAgent,
  }: {
    userId: string;
    organization: IOrganization;
    anonymousUserId?: string;
    userAgent?: string;
  }): Promise<void> {
    const { payment, metadata, _id: orgId } = organization;
    const { status, stripeAccountId, customerRemoteId } = payment;
    const { promotionsClaimed = [], promotionsOffered = [] } = metadata || {};

    // Check permanent blocker first - if already claimed, never offer again
    const isPromotionClaimed = promotionsClaimed.includes(OrganizationPromotionEnum.UPGRADE_WITH_75_ANNUAL);
    if (isPromotionClaimed) {
      return;
    }

    // Check current trial blocker - if already offered in this trial, don't create duplicate
    const isPromotionOffered = promotionsOffered.includes(OrganizationPromotionEnum.UPGRADE_WITH_75_ANNUAL);
    if (status !== PaymentStatusEnums.TRIALING || !stripeAccountId || isPromotionOffered) {
      return;
    }

    const existingCoupon = await this.redisService.getTimeSensitiveCoupon(orgId);
    if (existingCoupon) {
      return;
    }
    const user = await this.userService.findUserById(userId);
    if (!user) {
      return;
    }
    const { value: isEnabled, variationId } = await this.featureFlagService.getFeatureEvaluation({
      featureFlagKey: FeatureFlagKeys.TIME_SENSITIVE_COUPON,
      organization,
      user,
    });

    if (!isNil(variationId)) {
      this.organizationService.trackTimeSensitiveCouponVariationViewEvent({
        variationId,
        userId,
        orgId,
        anonymousUserId,
        userAgent,
      });
    }

    if (!isEnabled) {
      return;
    }

    const promotionCodeResult = await this.paymentService.createTimeSensitivePromotionCode({
      stripeAccountId,
      customerRemoteId,
    });

    if (promotionCodeResult) {
      const createdAt = Date.now();
      await this.organizationService.updatePromotionOffered({
        org: organization,
        promotion: OrganizationPromotionEnum.UPGRADE_WITH_75_ANNUAL,
      });
      await this.redisService.setTimeSensitiveCoupon({
        orgId,
        promotionCode: promotionCodeResult.code,
        promotionCodeId: promotionCodeResult.id,
        createdAt,
      });
      this.organizationService.notifyTimeSensitiveCouponCreated({
        orgId,
        promotionCode: promotionCodeResult.code,
        createdAt,
      });
    }
  }
}
