import { Injectable } from '@nestjs/common';

import { EnvConstants } from 'Common/constants/EnvConstants';

import { GetStripePlanParam } from 'Environment/interfaces/environment.interface';
import {
  PaymentPlanEnums, PaymentPeriodEnums, PaymentCurrencyEnums, StripeAccountNameEnums,
} from 'Payment/payment.enum';

const paymentCurrency = Object.values(PaymentCurrencyEnums);

@Injectable()
export class EnvironmentService {
  private readonly settings;

  private readonly envPrefix = 'LUMIN';

  constructor() {
    this.settings = process.env;
  }

  get isDevelopment(): boolean {
    return this.getByKey(EnvConstants.ENV) === 'development';
  }

  get luminOrigins(): string[] {
    return [
      this.getByKey(EnvConstants.BASE_URL),
      this.getByKey(EnvConstants.AUTH_URL),
      this.getByKey(EnvConstants.SALE_DASHBOARD_URL),
      this.getByKey(EnvConstants.STATIC_URL),
      ...(this.settings.LUMIN_CORS_ORIGIN as string || '').split(','),
    ];
  }

  get isProduction(): boolean {
    return this.getByKey(EnvConstants.ENV) === 'production';
  }

  public getByKey(key: string): string {
    return this.settings[`${this.envPrefix}_${key}`];
  }

  public getStripePlan({
    plan, period, currency, stripeAccountName, discount = false,
  } : GetStripePlanParam): string {
    if (!stripeAccountName || stripeAccountName === StripeAccountNameEnums.NZ_ACCOUNT) {
      const envKey = `${this.envPrefix}_STRIPE_${plan}_${period}_${currency}${discount ? '_DISCOUNT' : ''}`;
      return this.settings[envKey];
    }
    const envKey = `${this.envPrefix}_STRIPE_${stripeAccountName}_${plan}_${period}_${currency}${discount ? '_DISCOUNT' : ''}`;
    return this.settings[envKey];
  }

  // Only use to create old plan subscription
  public getStripePlanWithVersion({
    plan, period, currency, priceVersion,
  } : GetStripePlanParam): string {
    const version = priceVersion && `_${priceVersion.toLowerCase()}`;
    const envKey = `${this.envPrefix}_STRIPE_${plan}_${period}_${currency}${version}`;
    return this.settings[envKey];
  }

  public getAnnualPlan(planType: PaymentPlanEnums): string[] {
    const IS_DISCOUNT = true;
    const IS_NOT_DISCOUNT = false;
    const getPlan = (discount: boolean): string[] => paymentCurrency.map((currency) => this.getStripePlan({
      plan: planType,
      period: PaymentPeriodEnums.ANNUAL,
      currency,
      discount,
    }));
    return [...getPlan(IS_NOT_DISCOUNT), ...getPlan(IS_DISCOUNT)];
  }

  public getMonthlyPlan(planType: PaymentPlanEnums): string[] {
    return paymentCurrency.map((currency) => this.getStripePlan({
      plan: planType,
      period: PaymentPeriodEnums.MONTHLY,
      currency,
    }));
  }

  public getAllPersonalAnnualPlan(): string[] {
    return this.getAnnualPlan(PaymentPlanEnums.PERSONAL);
  }

  public getAllPersonalMonthlyPlan(): string[] {
    return this.getMonthlyPlan(PaymentPlanEnums.PERSONAL);
  }

  public getAllProfessionalAnnual(): string[] {
    return this.getAnnualPlan(PaymentPlanEnums.PROFESSIONAL);
  }

  public getAllProfessionalMonthlyPlan(): string[] {
    return this.getMonthlyPlan(PaymentPlanEnums.PROFESSIONAL);
  }

  public getStripeProduct({ plan, stripeAccountName }: { plan: PaymentPlanEnums; stripeAccountName?: StripeAccountNameEnums }) {
    if (!stripeAccountName || stripeAccountName === StripeAccountNameEnums.NZ_ACCOUNT) {
      return this.getByKey(`STRIPE_${plan}_PRODUCT`);
    }

    const envKey = `STRIPE_${stripeAccountName}_${plan}_PRODUCT`;
    return this.getByKey(envKey);
  }

  public getWhiteIPsByDomain(domain: string): string[] {
    const whitelistIp = this.settings[`${this.envPrefix}_${domain.toUpperCase().replace(/[.-]/g, '_')}_WHITE_LIST_IP`];
    return whitelistIp ? whitelistIp.split(',') : [];
  }

  get appVersion(): string {
    return this.getByKey('VERSION');
  }
}
