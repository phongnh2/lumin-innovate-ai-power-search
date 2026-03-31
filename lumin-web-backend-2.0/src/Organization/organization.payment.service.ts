import { Injectable } from '@nestjs/common';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { FeatureFlagKeys } from 'Common/constants/FeatureFlags';

import { CountryCodeEnums } from 'Auth/countryCode.enum';
import { EnvironmentService } from 'Environment/environment.service';
import { FeatureFlagService } from 'FeatureFlag/FeatureFlag.service';
import { RetrieveOrganizationSetupIntentResponse, RetrieveOrganizationSetupIntentType } from 'graphql.schema';
import { LoggerService } from 'Logger/Logger.service';
import { RedisService } from 'Microservices/redis/redis.service';
import { PaymentService } from 'Payment/payment.service';
import { PinpointService } from 'Pinpoint/pinpoint.service';
import { User } from 'User/interfaces/user.interface';

import { CashAppVariationView } from './eventTracking/cashAppVariationView';
import { IOrganization } from './interfaces/organization.interface';

@Injectable()
export class OrganizationPaymentService {
  private readonly cashAppExperimentPayPmcId: string;

  private readonly stripeUSAccountId: string;

  constructor(
    private readonly redisService: RedisService,
    private readonly paymentService: PaymentService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly environmentService: EnvironmentService,
    private readonly pinpointService: PinpointService,
    private readonly loggerService: LoggerService,
  ) {
    this.cashAppExperimentPayPmcId = this.environmentService.getByKey(EnvConstants.CASH_APP_EXPERIMENT_PMC_ID);
    this.stripeUSAccountId = this.environmentService.getByKey(EnvConstants.STRIPE_US_CONNECTED_ACCOUNT);
  }

  async retrieveSetupIntentForOrganization(
    params: {
      user: Partial<User> & { countryCode: CountryCodeEnums },
      organization: IOrganization,
      stripeAccountId: string,
      score: number,
      openGoogleReferrer?: string[]
      type: RetrieveOrganizationSetupIntentType
      userAgent?: string;
      anonymousUserId?: string;
    },
  ): Promise<RetrieveOrganizationSetupIntentResponse> {
    const {
      user,
      organization,
      stripeAccountId,
      score,
      openGoogleReferrer,
      type,
      userAgent,
      anonymousUserId,
    } = params;
    const { _id: orgId } = organization;
    const { _id: userId } = user;
    if (type === RetrieveOrganizationSetupIntentType.SUTTON_BANK_REROUTING) {
      const setupIntent = await this.paymentService.createSetupIntent({
        metadata: {
          lumin_user_id: userId,
          circleId: orgId,
          recaptchaScore: score,
          ipCountryCode: user.countryCode,
          type,
          ...(openGoogleReferrer.length && { openGoogleReferrer: openGoogleReferrer.join() }),
        },
        payment_method_types: ['cashapp'],

      }, { stripeAccount: stripeAccountId });
      return {
        clientSecret: setupIntent.client_secret,
        accountId: stripeAccountId,
      };
    }
    const setupIntentId = await this.redisService.getOrganizationSetupIntent(orgId, stripeAccountId);
    let setupIntent;
    if (setupIntentId) {
      setupIntent = await this.paymentService.retrieveSetupIntent(setupIntentId, stripeAccountId);
    } else {
      if (stripeAccountId === this.stripeUSAccountId) {
        const cashAppExperimentSetupIntent = await this.createSetupIntentForCashAppExperiment({
          user,
          organization,
          stripeAccountId,
          score,
          openGoogleReferrer,
          userAgent,
          anonymousUserId,
        });
        return {
          clientSecret: cashAppExperimentSetupIntent.client_secret,
          accountId: stripeAccountId,
        };
      }
      setupIntent = await this.paymentService.createSetupIntent({
        metadata: {
          lumin_user_id: userId,
          circleId: orgId,
          recaptchaScore: score,
          ipCountryCode: user.countryCode,
          ...(openGoogleReferrer.length && { openGoogleReferrer: openGoogleReferrer.join() }),
        },

      }, { stripeAccount: stripeAccountId });
      this.redisService.setOrganizationSetupIntent(orgId, stripeAccountId, setupIntent.id);
    }
    return {
      clientSecret: setupIntent.client_secret,
      accountId: stripeAccountId,
    };
  }

  async createSetupIntentForCashAppExperiment(params: {
    user: Partial<User> & { countryCode: CountryCodeEnums },
    organization: IOrganization,
    stripeAccountId: string,
    score: number,
    openGoogleReferrer?: string[]
    userAgent?: string;
    anonymousUserId?: string;
  }) {
    const {
      user,
      organization,
      stripeAccountId,
      score,
      openGoogleReferrer,
      userAgent,
      anonymousUserId,
    } = params;

    const enableCashAppPay = await this.featureFlagService.getFeatureIsOn({
      user,
      featureFlagKey: FeatureFlagKeys.ENABLE_CASH_APP_PAY,
      organization,
    });

    const setupIntent = await this.paymentService.createSetupIntent({
      ...(enableCashAppPay ? { payment_method_configuration: this.cashAppExperimentPayPmcId } : {}),
      metadata: {
        lumin_user_id: user._id,
        circleId: organization._id,
        recaptchaScore: score,
        ipCountryCode: user.countryCode,
        ...(openGoogleReferrer.length && { openGoogleReferrer: openGoogleReferrer.join() }),
      },
    }, { stripeAccount: stripeAccountId });

    this.trackCashAppVariationView({
      isEnableCashAppPay: enableCashAppPay,
      organizationId: organization._id,
      LuminUserId: user._id,
      ipCountryCode: user.countryCode,
      userAgent,
      anonymousUserId,
    });

    this.redisService.setOrganizationSetupIntent(organization._id, stripeAccountId, setupIntent.id);
    return setupIntent;
  }

  trackCashAppVariationView(params: {
    isEnableCashAppPay: boolean,
    organizationId: string,
    LuminUserId: string,
    ipCountryCode: CountryCodeEnums
    userAgent?: string;
    anonymousUserId?: string;
  }) {
    try {
      const {
        isEnableCashAppPay,
        organizationId,
        LuminUserId,
        ipCountryCode,
        userAgent,
        anonymousUserId,
      } = params;
      const event = new CashAppVariationView({
        isEnableCashAppPay,
        organizationId,
        LuminUserId,
        ipCountryCode,
        userAgent,
        anonymousUserId,
      });
      this.pinpointService.add(event);
      this.loggerService.info({
        message: 'Cash app variation view tracked',
        context: this.trackCashAppVariationView.name,
        extraInfo: params,
      });
    } catch (error) {
      this.loggerService.error({
        message: 'Error tracking cash app variation view',
        context: this.trackCashAppVariationView.name,
        error,
        extraInfo: params,
      });
    }
  }

  deactivateOrganizationSetupIntent(params: {orgId: string, userId: string, stripeAccountId: string}) {
    this.paymentService.deactivateSetupIntent(params.userId, params.stripeAccountId);
    return this.redisService.removeOrganizationSetupIntent(params.orgId, params.stripeAccountId);
  }
}
