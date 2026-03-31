import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { isEqual } from 'lodash';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { EnvironmentService } from 'Environment/environment.service';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { PaymentPlanEnums, PaymentStatusEnums } from 'Payment/payment.enum';
import { IHighestOrgPlan, User } from 'User/interfaces/user.interface';
import { UserService } from 'User/user.service';

import { BrazeClient } from './braze.client';
import {
  IAudience,
  IBrazeCampaignTriggerPayload,
  IPurchaseEvent,
  IRenewalEmailCampaignTriggerPayload,
  IRenewalEmailCampaignTriggerProperties,
  IRequestJoinOrganizationEvent,
  LuminPlanStatus,
  OrganizationPlan,
  OrganizationRole,
} from './braze.interface';

@Injectable()
export class BrazeService {
  private promptToJoinTrialingOrgBrazeCampaignId: string;

  private renewalEmailBrazeCampaignId: string;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly brazeClient: BrazeClient,
    private readonly loggerService: LoggerService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {
    this.promptToJoinTrialingOrgBrazeCampaignId = this.environmentService.getByKey(
      EnvConstants.PROMPT_TO_JOIN_TRIALING_ORG_BRAZE_CAMPAIGN_ID,
    );
    this.renewalEmailBrazeCampaignId = this.environmentService.getByKey(
      EnvConstants.RENEWAL_EMAIL_BRAZE_CAMPAIGN_ID,
    );
  }

  upsertAudience = async (audiences: IAudience[], shouldThrowError: boolean = false): Promise<void> => {
    const payload = {
      attributes: audiences,
    };
    try {
      await this.brazeClient.trackUsers(payload);
    } catch (error) {
      if (shouldThrowError) {
        throw error;
      }
    }
  };

  syncUserEmail = async (user: User): Promise<{ hasSynced: boolean }> => {
    if (user.metadata.hasSyncedEmailToBraze) {
      return { hasSynced: true };
    }
    const payload = {
      attributes: [
        {
          external_id: user._id,
          lumin_email_address: user.email,
          lumin_email_domain: user.emailDomain,
        },
      ],
    };

    await this.brazeClient.trackUsers(payload);
    return { hasSynced: true };
  };

  trackPurchaseEvent = async (purchaseEvents: IPurchaseEvent[]): Promise<void> => {
    const payload = {
      purchases: purchaseEvents,
    };

    await this.brazeClient.trackUsers(payload);
  };

  trackRequestJoinOrganization = async (requestJoinOrganizationEvents: IRequestJoinOrganizationEvent): Promise<void> => {
    const payload = {
      events: [
        requestJoinOrganizationEvents,
      ],
    };

    await this.brazeClient.trackUsers(payload);
  };

  deleteAudiences = async (externalIds: string[]): Promise<void> => {
    await this.brazeClient.deleteUsers(externalIds);
  };

  getPurchasesAttributes = async (highestPlan: IHighestOrgPlan, targetId: string) => {
    const {
      highestLuminPlan,
      highestLuminPlanStatus,
      highestLuminOrgRole,
    } = highestPlan;
    const purchaseAttributes: {
      status: string;
      luminPlan: string;
      orgRole: string;
    } = {
      status: '',
      luminPlan: '',
      orgRole: '',
    };
    const attempt = await this.redisService.getRenewAttempt(targetId);
    if (attempt) {
      purchaseAttributes.status = LuminPlanStatus.PAYMENT_FAILING;
      return {
        ...purchaseAttributes,
        luminPlan: OrganizationPlan[highestLuminPlan],
        orgRole: OrganizationRole[highestLuminOrgRole.toUpperCase()],
      };
    }
    switch (highestLuminPlanStatus as PaymentStatusEnums) {
      case PaymentStatusEnums.ACTIVE:
        purchaseAttributes.status = LuminPlanStatus.ACTIVE;
        break;
      case PaymentStatusEnums.TRIALING:
        purchaseAttributes.status = LuminPlanStatus.FREE_TRIAL;
        break;
      case PaymentStatusEnums.CANCELED:
        purchaseAttributes.status = LuminPlanStatus.SET_TO_CANCEL;
        break;
      case PaymentStatusEnums.UNPAID:
        purchaseAttributes.status = LuminPlanStatus.UNPAID;
        break;
      default:
        // fallback to active when account has not exist status on free plan
        purchaseAttributes.status = LuminPlanStatus.ACTIVE;
        break;
    }
    return {
      ...purchaseAttributes,
      luminPlan: OrganizationPlan[highestLuminPlan],
      orgRole: OrganizationRole[highestLuminOrgRole.toUpperCase()],
    };
  };

  trackHighestPlanAtributes = async ({ externalId, highestPlan, targetId }:
    {
      externalId: string,
      highestPlan: IHighestOrgPlan,
      targetId: string,
    }): Promise<void> => {
    const user = await this.userService.findUserById(externalId, null, true);
    const isSameHighestPlan = isEqual(user.metadata?.highestOrgPlan?.highestLuminPlan, highestPlan.highestLuminPlan);
    if (!user?.metadata.highestOrgPlan || !isSameHighestPlan) {
      const purchaseAttributes = await this.getPurchasesAttributes(highestPlan, targetId);
      try {
        await this.upsertAudience([{
          external_id: externalId,
          highest_lumin_plan: purchaseAttributes.luminPlan,
          // Pause tracking for these attributes: https://lumin.atlassian.net/browse/LP-11558
          // highest_lumin_plan_status: purchaseAttributes.status,
          // highest_lumin_plan_circle_role: purchaseAttributes.orgRole,
        }], true);
        this.userService.updateUserProperty({ _id: externalId }, { 'metadata.highestOrgPlan': highestPlan });
      } catch (error) {
        this.loggerService.error({
          context: 'BrazeService.trackHighestPlanAtributes',
          error: error.message,
          errorCode: error.code,
          stack: error.stack,
        });
      }
    }
  };

  trackNewUserEvent = async (payload: Record<string, any>): Promise<void> => {
    const eventPayload = {
      events: [
        {
          external_id: payload.userId,
          name: 'user_sign_up_pinpoint',
          time: new Date().toISOString(),
          properties: {
            ...payload,
          },
        },
      ],
    };
    await this.brazeClient.trackUsers(eventPayload);
  };

  trackMarketingEmailAttributes = async (user: User): Promise<void> => {
    const { isSyncedMarketingEmailSetting } = user.metadata;
    const { marketingEmail, featureUpdateEmail } = user.setting;
    const externalId = user._id;
    if (!isSyncedMarketingEmailSetting) {
      try {
        await this.upsertAudience([{
          external_id: externalId,
          receive_marketing_emails: marketingEmail,
          receive_feature_update_emails: featureUpdateEmail,
        }], true);
        this.userService.updateUserProperty({ _id: externalId }, { 'metadata.isSyncedMarketingEmailSetting': true });
      } catch (error) {
        this.loggerService.error({
          context: 'BrazeService.trackMarketingEmailAttributes',
          error: error.message,
          errorCode: error.code,
          stack: error.stack,
        });
      }
    }
  };

  buildOrgTrialStartPayload = async (
    organization: IOrganization,
  ): Promise<IBrazeCampaignTriggerPayload[]> => {
    const { associateDomains } = organization;
    const MAX_INDIVIDUAL_USERS_THRESHOLD = 100;
    const MAX_RECIPIENTS_PER_CAMPAIGN = 50;

    const foundUsers = await this.userService.findUsers(
      {
        emailDomain: { $in: associateDomains },
        'metadata.highestOrgPlan.highestLuminPlan': PaymentPlanEnums.FREE,
      },
      { _id: 1 },
      { limit: MAX_INDIVIDUAL_USERS_THRESHOLD + 1 },
    );
    if (foundUsers.length <= MAX_INDIVIDUAL_USERS_THRESHOLD) {
      const firstFiftyUsers = foundUsers.slice(0, MAX_RECIPIENTS_PER_CAMPAIGN);
      const remainingUsers = foundUsers.slice(MAX_RECIPIENTS_PER_CAMPAIGN);
      const payload = [
        {
          campaign_id: this.promptToJoinTrialingOrgBrazeCampaignId,
          recipients: firstFiftyUsers.map((user) => ({ external_user_id: user._id, trigger_properties: {} })),
        },
      ];
      if (remainingUsers.length) {
        payload.push({
          campaign_id: this.promptToJoinTrialingOrgBrazeCampaignId,
          recipients: remainingUsers.map((user) => ({ external_user_id: user._id, trigger_properties: {} })),
        });
      }
      return payload;
    }
    return [
      {
        campaign_id: this.promptToJoinTrialingOrgBrazeCampaignId,
        broadcast: true,
        audience: {
          AND: [
            {
              custom_attribute: {
                custom_attribute_name: 'lumin_email_domain',
                comparison: 'exists',
              },
            },
            {
              OR: associateDomains.map((domain) => ({
                custom_attribute: {
                  custom_attribute_name: 'lumin_email_domain',
                  comparison: 'equals',
                  value: domain,
                },
              })),
            },
            {
              custom_attribute: {
                custom_attribute_name: 'highest_lumin_plan',
                comparison: 'equals',
                value: OrganizationPlan.FREE,
              },
            },
          ],
        },
      },
    ];
  };

  promptToJoinTrialingOrg = async (organization: IOrganization) => {
    try {
      const payloadArr = await this.buildOrgTrialStartPayload(organization);
      await Promise.all(
        payloadArr.map((payload) => this.brazeClient.triggerCampaign(payload)),
      );
    } catch (error) {
      this.loggerService.error({
        context: 'BrazeService.promptToJoinTrialingOrg',
        error: error.message,
        errorCode: error.code,
        stack: error.stack,
      });
    }
  };

  triggerRenewalEmailCampaign = async (
    emailList: string[],
    triggerProperties: IRenewalEmailCampaignTriggerProperties,
  ): Promise<void> => {
    try {
      const payload: IRenewalEmailCampaignTriggerPayload = {
        campaign_id: this.renewalEmailBrazeCampaignId,
        trigger_properties: triggerProperties,
        recipients: emailList.map((_id) => ({ external_user_id: _id })),
      };
      await this.brazeClient.triggerCampaign(payload);
    } catch (error) {
      this.loggerService.error({
        context: 'BrazeService.triggerRenewalEmailCampaign',
        error: error.message,
        errorCode: error.code,
        stack: error.stack,
      });
    }
  };
}
