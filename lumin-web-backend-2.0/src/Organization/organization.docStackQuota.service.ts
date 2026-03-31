import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { DeleteResult } from 'mongodb';
import {
  FilterQuery, Model, ProjectionType, Types, UpdateQuery,
} from 'mongoose';

import { ErrorCode } from 'Common/constants/ErrorCode';
import { FeatureFlagKeys } from 'Common/constants/FeatureFlags';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';
import { Utils } from 'Common/utils/Utils';

import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import { Payment } from 'graphql.schema';
import { PaymentPlanEnums, PlanRules } from 'Payment/payment.enum';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';
import { getDocStackForNewPriceModel } from 'Payment/utils/newPriceModelUtil';
import { UserService } from 'User/user.service';

import {
  IOrganizationDocStackQuota,
  IOrganizationDocStackQuotaModel,
} from './interfaces/organization.docStackQuota.interface';
import { IOrganization } from './interfaces/organization.interface';
import { OrganizationDocStackService } from './organization.docStack.service';
import { OrganizationService } from './organization.service';

@Injectable()
export class OrganizationDocStackQuotaService {
  constructor(
    @InjectModel('OrganizationDocStackQuota')
    private readonly organizationDocStackQuotaModel: Model<IOrganizationDocStackQuotaModel>,
    @Inject(forwardRef(() => OrganizationDocStackService))
    private readonly organizationDocStackService: OrganizationDocStackService,
    private readonly featureFlagService: FeatureFlagService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => OrganizationService))
    private readonly organizationService: OrganizationService,
  ) {}

  private async findOne(
    filter: FilterQuery<IOrganizationDocStackQuota>,
    projection?: ProjectionType<IOrganizationDocStackQuota>,
  ): Promise<IOrganizationDocStackQuota> {
    const docStackQuota = await this.organizationDocStackQuotaModel
      .findOne(filter, projection)
      .exec();
    return docStackQuota
      ? { ...docStackQuota.toObject(), _id: docStackQuota._id.toHexString() }
      : null;
  }

  private async updateOne(
    filter: FilterQuery<IOrganizationDocStackQuota>,
    update: UpdateQuery<IOrganizationDocStackQuota>,
  ): Promise<IOrganizationDocStackQuota> {
    const updatedQuota = await this.organizationDocStackQuotaModel
      .findOneAndUpdate(filter, update, { upsert: true, new: true })
      .exec();
    return updatedQuota
      ? { ...updatedQuota.toObject(), _id: updatedQuota._id.toHexString() }
      : null;
  }

  private deleteOne(filter: FilterQuery<IOrganizationDocStackQuota>): Promise<DeleteResult> {
    return this.organizationDocStackQuotaModel.deleteOne(filter).exec();
  }

  public async getDocStackQuota({ orgId, payment }: {orgId: string, payment: Payment}): Promise<number> {
    const {
      type: plan, period, quantity,
    } = payment;
    const quota = await this.findOne({ orgId });

    const org = await this.organizationService.getOrgById(orgId);
    const owner = await this.userService.findUserById(org.ownerId as Types.ObjectId);
    const isBusinessDomain = Utils.isBusinessDomain(owner.email);
    const newPriceModel = await this.featureFlagService.getFeatureValue<string>({
      user: owner,
      organization: org,
      featureFlagKey: FeatureFlagKeys.NEW_PRICING_MODELS,
    });
    let docStack;

    if (plan !== PaymentPlanEnums.FREE) {
      docStack = planPoliciesHandler.from({ plan, period }).getDocStack(quantity);
    } else {
      docStack = getDocStackForNewPriceModel(newPriceModel, isBusinessDomain);
    }

    return typeof quota?.docStack === 'number' ? quota.docStack : docStack;
  }

  public async updateDocStackQuota(
    conditions: FilterQuery<IOrganizationDocStackQuota>,
    update: UpdateQuery<IOrganizationDocStackQuota>,
  ): Promise<IOrganizationDocStackQuota> {
    return this.updateOne(conditions, update);
  }

  public async resetDocStackQuota({ orgId }: { orgId: string }) {
    return this.deleteOne({ orgId });
  }

  public async validateIncreaseDocStackQuota({ organization }: {organization: IOrganization}) {
    const { payment } = organization;
    if (payment.type !== PaymentPlanEnums.FREE) {
      throw GraphErrorException.BadRequest('Invite member to add docstack only available for free plan');
    }

    const { totalStack, isOverDocStack } = await this.organizationDocStackService.getDocStackInfo({
      orgId: organization._id,
      payment,
      totalNewDocument: 1,
    });

    const defaultDocStack = planPoliciesHandler.from({ plan: payment.type, period: payment.period }).getPlanRule(PlanRules.DOC_STACK) as number;
    const maxDocStack = planPoliciesHandler.from({ plan: payment.type, period: payment.period }).getPlanRule(PlanRules.MAX_DOC_STACK) as number;

    if (totalStack !== defaultDocStack || totalStack >= maxDocStack) {
      throw GraphErrorException.BadRequest('Invite member to add docstack can only be used once', ErrorCode.Org.INVITE_ALREADY_USED);
    }

    if (!isOverDocStack) {
      throw GraphErrorException.BadRequest("Cannot invite member—organization hasn't reached Docstack limit.");
    }
  }

  public async increaseDocStackQuota({
    organization,
    totalIncrease,
  }: {
    organization: IOrganization;
    totalIncrease: number;
  }): Promise<IOrganizationDocStackQuota> {
    const { payment } = organization;
    const { totalStack } = await this.organizationDocStackService.getDocStackInfo({ orgId: organization._id, payment });
    const maxDocStack = planPoliciesHandler.from({ plan: payment.type, period: payment.period }).getPlanRule(PlanRules.MAX_DOC_STACK) as number;

    const increaseBy = Math.min(maxDocStack - totalStack, totalIncrease);
    const totalDocStack = totalStack + increaseBy;

    const { docStackStartDate } = organization;
    const interval = this.organizationDocStackService.getDocStackInterval();
    const currentDate = new Date();
    const numberOfMonths = moment(currentDate).diff(docStackStartDate, interval);
    const nextMonth = moment(docStackStartDate).add(numberOfMonths + 1, interval);

    return this.updateDocStackQuota({ orgId: organization._id }, {
      $set: { docStack: totalDocStack, createdAt: docStackStartDate, expireAt: nextMonth.toDate() },
    });
  }
}
