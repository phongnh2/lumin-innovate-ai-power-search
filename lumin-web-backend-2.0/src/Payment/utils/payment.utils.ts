import { Injectable } from '@nestjs/common';
import { uniqBy } from 'lodash';
import Stripe from 'stripe';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { ORG_URL_SEGEMENT } from 'Common/constants/OrganizationConstants';
import {
  PAYMENT_METHOD_REGEX_MATCHING, PAYMENT_SOURCE_REGEX_MATCHING, PLAN_TEXT, SIGN_PLAN_TEXT,
} from 'Common/constants/PaymentConstant';

import { EnvironmentService } from 'Environment/environment.service';
import {
  PaymentMethodType, PaymentMethodResponse, CardWallet, UnifySubscriptionProduct,
  SubscriptionItem,
  Payment,
  UnifySubscriptionPlan,
} from 'graphql.schema';
import { PaymentSchemaInterface } from 'Payment/interfaces/payment.interface';
import { PRODUCT_QUERY_PARAM_MAPPING, PRODUCT_TIER_MAPPING } from 'Payment/payment.constant';
import {
  PaymentPeriodEnums, PaymentPlanEnums, PaymentProductEnums, PaymentStatusEnums, ProductPlans,
  ProductTiers,
  StripeAccountNameEnums,
} from 'Payment/payment.enum';

@Injectable()
export class PaymentUtilsService {
  public readonly stripeUSAccountId: string;

  public readonly stripeNZAccountId: string;

  constructor(private readonly environmentService: EnvironmentService) {
    this.stripeUSAccountId = this.environmentService.getByKey(EnvConstants.STRIPE_US_CONNECTED_ACCOUNT);
    this.stripeNZAccountId = this.environmentService.getByKey(EnvConstants.STRIPE_NZ_CONNECTED_ACCOUNT);
  }

  isSourceCard(id: string): boolean {
    return PAYMENT_SOURCE_REGEX_MATCHING.test(id);
  }

  isPaymentMethod(id: string): boolean {
    return PAYMENT_METHOD_REGEX_MATCHING.test(id);
  }

  formatStripePaymentMethodToApiResponse(
    paymentMethod: Stripe.PaymentMethod | Stripe.Source,
    userEmail: string,
  ): PaymentMethodResponse {
    const { type, card } = paymentMethod;
    const { link } = paymentMethod as Stripe.PaymentMethod;
    const { last4, exp_month: expMonth, exp_year: expYear } = card || {};
    const wallet = card && 'wallet' in card ? card.wallet?.type?.toUpperCase() : undefined;
    const paymentMethodType = type.toUpperCase() as PaymentMethodType;

    switch (paymentMethodType) {
      case PaymentMethodType.CARD:
        return {
          type: paymentMethodType,
          card: {
            last4,
            expMonth,
            expYear,
            wallet: wallet as CardWallet,
          },
        };
      case PaymentMethodType.LINK: {
        const { email } = link || {};
        return {
          type: paymentMethodType,
          link: {
            email,
          },
        };
      }
      case PaymentMethodType.CASHAPP:
        return {
          type: paymentMethodType,
          cashapp: {
            email: userEmail,
          },
        };
      default: return null;
    }
  }

  isIncludePdfSubscription({ subscriptionItems }: {
    subscriptionItems: { productName: string }[]
  }): boolean {
    return subscriptionItems.some((item) => item.productName === UnifySubscriptionProduct.PDF);
  }

  isIncludeSignSubscription({ subscriptionItems }: {
    subscriptionItems: { productName: string }[]
  }): boolean {
    return subscriptionItems.some((item) => item.productName === UnifySubscriptionProduct.SIGN);
  }

  getStripePdfSubscriptionItem({ subscriptionItems }: {
    subscriptionItems: Stripe.SubscriptionItem[]
  }): Stripe.SubscriptionItem | undefined {
    return subscriptionItems.find((item) => item.metadata.productName === UnifySubscriptionProduct.PDF);
  }

  getStripeSignSubscriptionItem({ subscriptionItems }: {
    subscriptionItems: Stripe.SubscriptionItem[]
  }): Stripe.SubscriptionItem | undefined {
    return subscriptionItems.find((item) => item.metadata.productName === UnifySubscriptionProduct.SIGN);
  }

  filterStripePdfInvoiceLineItem({
    lines = [], stripeAccountId,
  }: { lines: Stripe.InvoiceLineItem[]; stripeAccountId: string }): Stripe.InvoiceLineItem[] {
    const allPdfProducts = this.getAllPdfProducts({ stripeAccountId });
    return lines.filter(({
      plan: { product },
    }) => allPdfProducts.includes(typeof product === 'string' ? product : product.id));
  }

  filterSubItemByProduct<T extends { productName: string }>(
    subscriptionItems: T[],
    productName: PaymentProductEnums,
  ): T[] {
    return subscriptionItems.filter((sub) => sub.productName === productName);
  }

  isValidSubscriptionItemsInput({ subscriptionItems }: {
    subscriptionItems: { productName: string; planName: string }[]
  }): boolean {
    const isValidPairs = subscriptionItems.every((sub) => ProductPlans?.[sub.productName].includes(sub.planName));
    const isUniqueProduct = uniqBy(subscriptionItems, 'productName').length === subscriptionItems.length;

    return isValidPairs && isUniqueProduct;
  }

  buildUnifyPaymentPath({
    subscriptionItems,
    orgId,
    period,
  }: {
    subscriptionItems: SubscriptionItem[];
    orgId: string;
    period?: PaymentPeriodEnums;
  }): string {
    const periodParam = period ? period.toLowerCase() : PaymentPeriodEnums.ANNUAL.toLowerCase();
    const baseParams: Record<string, string> = {
      [`${ORG_URL_SEGEMENT}_id`]: orgId,
      period: periodParam,
      promoted_period: periodParam,
    };
    if (!subscriptionItems.length) {
      baseParams.pdf = ProductTiers.Pro;
      return `payment?${new URLSearchParams(baseParams).toString()}`;
    }
    const productParams = subscriptionItems.reduce((acc, cur) => {
      acc[PRODUCT_QUERY_PARAM_MAPPING[cur.productName]] = PRODUCT_TIER_MAPPING[cur.paymentType];
      return acc;
    }, {} as Record<string, string>);
    const searchParams = new URLSearchParams({ ...baseParams, ...productParams });
    return `payment?${searchParams.toString()}`;
  }

  static getPremiumProducts(payment: PaymentSchemaInterface): PaymentProductEnums[] {
    if (!payment) {
      return [];
    }
    const premiumProducts = [];
    const { subscriptionItems = [] } = payment;
    if (payment.type !== PaymentPlanEnums.FREE || subscriptionItems.some((item) => item.productName === PaymentProductEnums.PDF)) {
      premiumProducts.push(PaymentProductEnums.PDF);
    }
    if (subscriptionItems.some((item) => item.productName === PaymentProductEnums.SIGN)) {
      premiumProducts.push(PaymentProductEnums.SIGN);
    }

    return premiumProducts;
  }

  isStripeTestMode(): boolean {
    const stripeKey = this.environmentService.getByKey(EnvConstants.STRIPE_PLATFORM_SECRET_KEY);
    return stripeKey && stripeKey.startsWith('sk_test_');
  }

  isUnifyPaymentStatusMatch = ({
    payment,
    statusToCheck,
    productToCheck,
    requireAllMatch = false,
  }: {
    payment: Payment;
    statusToCheck: PaymentStatusEnums;
    productToCheck?: PaymentProductEnums;
    requireAllMatch?: boolean;
  }) => {
    const hasNoSubscriptionItems = !payment.subscriptionItems?.length;
    if (hasNoSubscriptionItems) {
      return payment.status === statusToCheck;
    }
    if (productToCheck) {
      return payment.subscriptionItems.some((subItem) => subItem.productName === productToCheck && subItem.paymentStatus === statusToCheck);
    }
    const matches = payment.subscriptionItems.map(
      (item) => item.paymentStatus === statusToCheck,
    );
    return requireAllMatch ? matches.every(Boolean) : matches.some(Boolean);
  };

  getSubItemProduct({ paymentType }: { paymentType: UnifySubscriptionPlan }) {
    return this.environmentService.getStripeProduct({ plan: paymentType as unknown as PaymentPlanEnums });
  }

  getStripeAccountName({ stripeAccountId }: { stripeAccountId: string }) {
    const accountIdToNameMapping = {
      [this.stripeNZAccountId]: StripeAccountNameEnums.NZ_ACCOUNT,
      [this.stripeUSAccountId]: StripeAccountNameEnums.US_ACCOUNT,
    };

    return accountIdToNameMapping[stripeAccountId];
  }

  getPlanNameFromProduct(productId: string, stripeAccountId: string): string {
    const stripeAccountName = this.getStripeAccountName({ stripeAccountId });

    const planMappings = [
      { plan: PaymentPlanEnums.ORG_STARTER, text: PLAN_TEXT[PaymentPlanEnums.ORG_STARTER] },
      { plan: PaymentPlanEnums.ORG_PRO, text: PLAN_TEXT[PaymentPlanEnums.ORG_PRO] },
      { plan: PaymentPlanEnums.ORG_BUSINESS, text: PLAN_TEXT[PaymentPlanEnums.ORG_BUSINESS] },
      { plan: PaymentPlanEnums.ORG_SIGN_PRO, text: SIGN_PLAN_TEXT[UnifySubscriptionPlan.ORG_SIGN_PRO] },
    ];

    const matched = planMappings.find(({ plan }) => {
      const stripeProduct = this.environmentService.getStripeProduct({ plan, stripeAccountName });
      return productId === stripeProduct;
    });

    return matched?.text || '';
  }

  public getAllPdfProducts({ stripeAccountId }: { stripeAccountId?: string }): string[] {
    const pdfPlans = [
      PaymentPlanEnums.ORG_PRO,
      PaymentPlanEnums.ORG_STARTER,
      PaymentPlanEnums.ORG_BUSINESS,
      PaymentPlanEnums.ENTERPRISE,
    ];
    const stripeAccountName = this.getStripeAccountName({ stripeAccountId });
    return pdfPlans.map((plan) => this.environmentService.getStripeProduct({ plan, stripeAccountName }));
  }

  public getPdfTierProducts({ stripeAccountId }: { stripeAccountId?: string }): {
    [key: string]: string
  } {
    const stripeAccountName = this.getStripeAccountName({ stripeAccountId });
    return {
      [PaymentPlanEnums.ORG_STARTER]: this.environmentService.getStripeProduct({
        plan: PaymentPlanEnums.ORG_STARTER,
        stripeAccountName,
      }),
      [PaymentPlanEnums.ORG_PRO]: this.environmentService.getStripeProduct({
        plan: PaymentPlanEnums.ORG_PRO,
        stripeAccountName,
      }),
      [PaymentPlanEnums.ORG_BUSINESS]: this.environmentService.getStripeProduct({
        plan: PaymentPlanEnums.ORG_BUSINESS,
        stripeAccountName,
      }),
    };
  }

  public getAllSignProducts({ stripeAccountId }: { stripeAccountId?: string }): string[] {
    const signPlans = [
      PaymentPlanEnums.ORG_SIGN_PRO,
    ];

    const stripeAccountName = this.getStripeAccountName({ stripeAccountId });
    return signPlans.map((plan) => this.environmentService.getStripeProduct({ plan, stripeAccountName }));
  }

  getPdfPaymentType(payment: PaymentSchemaInterface) {
    return (
      payment.subscriptionItems?.find(
        (item) => (item.productName as UnifySubscriptionProduct)
          === UnifySubscriptionProduct.PDF,
      )?.paymentType || payment.type
    );
  }

  getUnusedTimeProrationItems({ items }: { items: Stripe.InvoiceLineItem[] }) {
    return items.filter((item) => (item.proration && item.amount < 0) || item.description?.toLowerCase()?.includes('unused time'));
  }
}
