import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, UpdateResult, BulkWriteResult } from 'mongodb';
import {
  FilterQuery,
  Model,
  ProjectionType,
  Types,
  UpdateQuery,
} from 'mongoose';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { ErrorCode } from 'Common/constants/ErrorCode';
import { DOC_STACK_HARD_LIMIT_PERCENT } from 'Common/constants/OrganizationConstants';
import { DOC_STACK_PLAN } from 'Common/constants/PaymentConstant';
import { SUBSCRIPTION_CHANGED_DOCUMENT_STACK, SUBSCRIPTION_SETTING_UPDATE, SUBSCRIPTION_UPDATE_ORG } from 'Common/constants/SubscriptionConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import { DocStackIntervalEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { IUpdateDocStackCommand } from 'Document/handlers/documentPaymentHandler/interface/document.payment.request';
import { EnvironmentService } from 'Environment/environment.service';
import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import { Payment } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { IOrganizationDocStack, IOrganizationDocStackModel } from 'Organization/interfaces/organization.docStack.interface';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { OrganizationService } from 'Organization/organization.service';
import { PaymentPlanEnums, PaymentStatusEnums } from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';
import { UpdateSubscriptionParamsBuilder } from 'Payment/Policy/updateSubscriptionParamsBuilder';
import { PinpointService } from 'Pinpoint/pinpoint.service';
import { UserService } from 'User/user.service';

import { HitDocStackLimitEvent, HitDocStackLimitEventAttributes, HitDocStackLimitEventMetrics } from './eventTracking/hitDocStackLimitEvent';
import { OrganizationDocStackQuotaService } from './organization.docStackQuota.service';

@Injectable()
export class OrganizationDocStackService {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub,
    @InjectModel('OrganizationDocStack')
    private readonly organizationDocStackModel: Model<IOrganizationDocStackModel>,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    private readonly loggerService: LoggerService,
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
    private readonly organizationDocStackQuotaService: OrganizationDocStackQuotaService,
    private readonly pinpointService: PinpointService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly featureFlagService: FeatureFlagService,
  ) {
  }

  private countDocuments(orgId: string): Promise<number> {
    return this.organizationDocStackModel.countDocuments({ orgId }).exec();
  }

  private async updateOne(filter: FilterQuery<IOrganizationDocStack>, update: UpdateQuery<IOrganizationDocStack>): Promise<IOrganizationDocStack> {
    const updatedDocStack = await this.organizationDocStackModel.findOneAndUpdate(filter, update, { upsert: true, new: true }).exec();
    return updatedDocStack ? { ...updatedDocStack.toObject(), _id: updatedDocStack._id.toHexString() } : null;
  }

  private updateMany(filter: FilterQuery<IOrganizationDocStack>, update: UpdateQuery<IOrganizationDocStack>): Promise<UpdateResult> {
    return this.organizationDocStackModel.updateMany(filter, update, { upsert: true, new: true }).exec();
  }

  private async findOne(
    filter: FilterQuery<IOrganizationDocStack>,
    projection?: ProjectionType<IOrganizationDocStack>,
  ): Promise<IOrganizationDocStack> {
    const docstack = await this.organizationDocStackModel.findOne(filter, projection).exec();
    return docstack ? { ...docstack.toObject(), _id: docstack._id.toHexString() } : null;
  }

  private async find(
    filter: FilterQuery<IOrganizationDocStack>,
    projection?: ProjectionType<IOrganizationDocStack>,
  ) {
    const orgDocStacks = await this.organizationDocStackModel.find(filter, projection).exec();
    return orgDocStacks.map((docstack) => ({ ...docstack.toObject(), _id: docstack._id.toHexString() }));
  }

  private deleteMany(filter: FilterQuery<IOrganizationDocStack>): Promise<DeleteResult> {
    return this.organizationDocStackModel.deleteMany(filter).exec();
  }

  public countFinishedDocs(orgId: string): Promise<number> {
    return this.countDocuments(orgId);
  }

  public getDocStackInterval(): DocStackIntervalEnum {
    return this.environmentService.getByKey(EnvConstants.DOC_STACK_INTERVAL) as DocStackIntervalEnum;
  }

  public async isOverDocStack(params: { orgId: string, payment: Payment, totalNewDocument: number }): Promise<boolean> {
    const { orgId, payment, totalNewDocument } = params;
    const [quota, finishDocsTotal] = await Promise.all([
      this.organizationDocStackQuotaService.getDocStackQuota({ orgId, payment }),
      this.countFinishedDocs(orgId),
    ]);

    return finishDocsTotal + totalNewDocument > quota;
  }

  public async getDocStackInfo(
    params: { orgId: string, payment: Payment, totalNewDocument?: number },
  ): Promise<{ isOverDocStack: boolean, totalUsed: number, totalStack: number }> {
    const { orgId, payment, totalNewDocument = 0 } = params;
    const [quota, finishedDocsTotal] = await Promise.all([
      this.organizationDocStackQuotaService.getDocStackQuota({ orgId, payment }),
      this.countFinishedDocs(orgId),
    ]);

    return {
      isOverDocStack: Boolean(finishedDocsTotal + totalNewDocument > quota),
      totalUsed: finishedDocsTotal,
      totalStack: quota,
    };
  }

  public updateDocStack(conditions: FilterQuery<IOrganizationDocStack>, update: UpdateQuery<IOrganizationDocStack>): Promise<IOrganizationDocStack> {
    return this.updateOne(conditions, update);
  }

  public updateManyDocStack(
    updatedCommand: IUpdateDocStackCommand,
  ): Promise<BulkWriteResult> {
    const { documentIds, orgId } = updatedCommand.conditions;
    const writeOperation = documentIds.map((documentId) => ({
      updateOne: {
        filter: { documentId, orgId },
        update: updatedCommand.updatedObj,
        upsert: true,
      },
    }));
    return this.organizationDocStackModel.bulkWrite(writeOperation);
  }

  public getOneDocStack(
    filter: FilterQuery<IOrganizationDocStack>,
    projection?: ProjectionType<IOrganizationDocStack>,
  ): Promise<IOrganizationDocStack> {
    return this.findOne(filter, projection);
  }

  public async resetDocStack(params: { orgId: string, docStackStartDate: Date }): Promise<void> {
    const { orgId, docStackStartDate } = params;
    await Promise.all([
      this.deleteMany({ orgId }),
      this.organizationService.updateOrganizationById(orgId, { docStackStartDate }),
      this.organizationDocStackQuotaService.resetDocStackQuota({ orgId }),
    ]);
  }

  public async hasReachedHardLimit(organization: IOrganization): Promise<boolean> {
    const { _id: orgId, payment } = organization;
    const { type: plan, period, quantity } = payment;
    const currentDocStackTotal = planPoliciesHandler.from({ plan, period }).getDocStack(quantity);
    const docStackUsedTotal = await this.countFinishedDocs(orgId);
    const hardLimit = Math.round(DOC_STACK_HARD_LIMIT_PERCENT / 100 * currentDocStackTotal);
    return docStackUsedTotal > hardLimit;
  }

  public async upgradeDocStack(params: { organization: IOrganization, quantity: number }): Promise<Payment> {
    const { organization, quantity } = params;
    const { _id: orgId, payment } = organization;
    const subscriptionParamsBuider = new UpdateSubscriptionParamsBuilder(this.paymentService)
      .from(payment)
      .to({ type: payment.type, period: payment.period });
    const subscriptionParams = (await subscriptionParamsBuider.calculate()).getUpgradeSubscriptionParams();
    try {
      await this.paymentService.updateStripeSubscription(
        subscriptionParams.subscriptionRemoteId,
        subscriptionParams.properties,
        { stripeAccount: payment.stripeAccountId },
      );
      const updatedOrg = await this.organizationService.updateOrganizationById(orgId, { 'payment.quantity': quantity });
      return updatedOrg.payment;
    } catch (error) {
      this.loggerService.error({
        context: 'upgradeDocStack',
        error,
      });
      const updatedOrg = await this.organizationService.updateOrganizationById(orgId, { 'settings.autoUpgrade': false });
      this.publishAutoUpgradeDocStackFailed(updatedOrg);
      throw GraphErrorException.BadRequest(error.message as string, ErrorCode.Payment.AUTO_UPGRADE_DOC_STACK_FAILED);
    }
  }

  public async validateIncreaseDocStack(organization: IOrganization, params: { totalNewDocument: number }): Promise<boolean> {
    const {
      _id: orgId, payment, settings,
    } = organization;
    const { type, quantity, status } = payment;
    if ([PaymentPlanEnums.ENTERPRISE, PaymentPlanEnums.BUSINESS].includes(type as PaymentPlanEnums)) {
      return true;
    }
    const { autoUpgrade } = settings;
    const isOverDocStack = await this.isOverDocStack({ orgId, payment, totalNewDocument: params.totalNewDocument });
    if (isOverDocStack) {
      if (!autoUpgrade || type === PaymentPlanEnums.FREE || status === PaymentStatusEnums.TRIALING) {
        return false;
      }
      // Update payment without change billing cycle
      await this.upgradeDocStack({ organization, quantity: quantity + 1 });
    }
    return true;
  }

  public async hasFinishedDocument(params: { documentId: string, orgId: string }): Promise<boolean> {
    const { documentId, orgId } = params;
    const hasFinishedDocument = await this.findOne({ orgId, documentId });
    return Boolean(hasFinishedDocument);
  }

  public async notifyStackChanged(orgId: string): Promise<void> {
    const organization = await this.organizationService.getOrgById(orgId, { payment: 1 });
    const docStack = await this.organizationService.getDocStackStorage(organization);
    this.pubSub.publish(`${SUBSCRIPTION_CHANGED_DOCUMENT_STACK}.${orgId}`, {
      [SUBSCRIPTION_CHANGED_DOCUMENT_STACK]: {
        orgId: organization._id,
        docStackStorage: docStack,
        payment: organization.payment,
      },
    });
  }

  public publishAutoUpgradeDocStackFailed(organization: IOrganization): void {
    this.pubSub.publish(`${SUBSCRIPTION_UPDATE_ORG}.${organization._id}`, {
      [SUBSCRIPTION_UPDATE_ORG]: {
        type: SUBSCRIPTION_SETTING_UPDATE,
        orgId: organization._id,
        organization,
      },
    });
  }

  public async validateCanFinishDocument(documentId: string): Promise<boolean> {
    const { info: targetOrg } = await this.documentService.getTargetOwnedDocumentInfo(documentId) || {};
    if (!targetOrg) {
      return true;
    }

    const { payment: { type }, settings: { autoUpgrade } } = targetOrg;
    if (!DOC_STACK_PLAN.includes(type as PaymentPlanEnums) || autoUpgrade) {
      return true;
    }

    const [isDocumentFinished, docStackInfo] = await Promise.all([
      this.getOneDocStack({ documentId, orgId: targetOrg._id }),
      this.getDocStackInfo({
        orgId: targetOrg._id, payment: targetOrg.payment, totalNewDocument: 1,
      }),
    ]);

    return Boolean(isDocumentFinished) || !docStackInfo.isOverDocStack;
  }

  public countStackedDocuments({ documentIds, orgId }: { documentIds: string[]; orgId: string }): Promise<number> {
    return this.organizationDocStackModel.countDocuments({
      orgId,
      documentId: { $in: documentIds.map((docId) => new Types.ObjectId(docId)) },
    }).exec();
  }

  trackOrgHitDocStackLimitEvent({
    organization,
    docStackLimit,
    userId,
    anonymousUserId,
    userAgent,
  }: {
    organization: IOrganization;
    docStackLimit: number;
    userId: string;
    anonymousUserId?: string;
    userAgent?: string;
  }): void {
    try {
      const attributes: HitDocStackLimitEventAttributes = {
        workspaceID: organization._id,
        paymentType: organization.payment.type,
        LuminUserId: userId,
        anonymousUserId,
        userAgent,
      };
      const metrics: HitDocStackLimitEventMetrics = {
        docStackLimit,
      };
      const event = new HitDocStackLimitEvent(attributes, metrics);
      this.pinpointService.add(event);
      this.loggerService.info({
        message: 'Org hit doc stack limit tracked',
        context: this.trackOrgHitDocStackLimitEvent.name,
        extraInfo: {
          ...attributes,
          ...metrics,
        },
      });
    } catch (error) {
      this.loggerService.error({
        message: 'Error tracking Org hit doc stack limit',
        context: this.trackOrgHitDocStackLimitEvent.name,
        error,
      });
    }
  }

  async getDocStackByOrgId(orgId: string): Promise<IOrganizationDocStack[]> {
    return this.find({ orgId });
  }
}
