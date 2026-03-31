import { differenceBy } from 'lodash';
import Stripe from 'stripe';

import { ORG_PLAN_INDEX, ORG_SIGN_PLAN_INDEX, PAYMENT_PERIOD_INDEX } from 'Common/constants/PaymentConstant';

import {
  Currency, Payment, PaymentPeriod, UnifySubscriptionPlan,
} from 'graphql.schema';
import { DocStackUtils } from 'Organization/utils/docStackUtils';
import {
  UnifySubscriptionBuilderUpcomingPayment,
  SubScriptionItemSchemaInterface,
  PaymentSchemaInterface,
} from 'Payment/interfaces/payment.interface';
import { PaymentPlanEnums, PaymentProductEnums, PaymentStatusEnums } from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';
import { PaymentUtilsService } from 'Payment/utils/payment.utils';

export class UpdateUnifySubscriptionParamsBuilder {
  private currentPayment: PaymentSchemaInterface;

  private upcomingPayment: UnifySubscriptionBuilderUpcomingPayment;

  private stripeCustomerRemoteId: string;

  private subscriptionRemoteId: string;

  private orgId: string;

  private coupon: string;

  private promotionCodeId: string;

  private totalDocStackUsed: number = 0;

  private params: Record<string, any>;

  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentUtilsService: PaymentUtilsService,
  ) {}

  public from(payment: PaymentSchemaInterface): this {
    if (payment.customerRemoteId) {
      this.stripeCustomerRemoteId = payment.customerRemoteId;
    }
    if (payment.type !== PaymentPlanEnums.FREE || payment.subscriptionItems?.length) {
      this.subscriptionRemoteId = payment.subscriptionRemoteId;
    }

    this.currentPayment = payment;
    return this;
  }

  public to(payment: UnifySubscriptionBuilderUpcomingPayment): this {
    this.upcomingPayment = payment;
    return this;
  }

  public addCoupon(coupon: string): this {
    this.coupon = coupon;
    return this;
  }

  public addDiscount(codeOrId: string): this {
    if (codeOrId?.startsWith('promo_')) {
      this.promotionCodeId = codeOrId;
      this.coupon = undefined;
    } else {
      this.coupon = codeOrId;
      this.promotionCodeId = undefined;
    }
    return this;
  }

  public addCusId(cusId: string): this {
    this.stripeCustomerRemoteId = cusId;
    return this;
  }

  public addOrgId(orgId: string): this {
    this.orgId = orgId;
    return this;
  }

  isFree() {
    if (this.currentPayment.subscriptionItems?.length) {
      return false;
    }
    return this.currentPayment.type === PaymentPlanEnums.FREE;
  }

  isCouponValidUpcomingPayment(coupon: Stripe.Coupon) {
    if (!coupon.applies_to) {
      return true;
    }
    return this.upcomingPayment.subscriptionItems.some(({ paymentType }) => {
      const productId = this.paymentUtilsService.getSubItemProduct({
        paymentType: paymentType as UnifySubscriptionPlan,
      });
      return coupon.applies_to.products.includes(productId);
    });
  }

  public isStartTrial(): boolean {
    return this.upcomingPayment.status === PaymentStatusEnums.TRIALING;
  }

  public isUpgradeDocStackAnnual(): boolean {
    return this.isKeepBillingCycle()
      && this.currentPayment.period === PaymentPeriod.ANNUAL
      && !this.hasNewPurchaseAfterPaymentStatuses([PaymentStatusEnums.CANCELED]);
  }

  public isUpgradeNewPlan({ productName }: { productName: PaymentProductEnums }): boolean {
    const { subscriptionItems: currentSubscriptionItems, period: currentPeriod } = this.currentPayment;
    const { subscriptionItems: upcomingSubscriptionItems, period: upcomingPeriod } = this.upcomingPayment;
    const currentItem = this.paymentUtilsService.filterSubItemByProduct(currentSubscriptionItems, productName)[0];
    const upcomingItem = this.paymentUtilsService.filterSubItemByProduct(upcomingSubscriptionItems, productName)[0];
    if (!currentItem && upcomingItem) {
      return true;
    }

    if (!currentItem || !upcomingItem) {
      return false;
    }

    switch (productName) {
      case PaymentProductEnums.PDF: {
        const isBusiness = currentItem.paymentType === PaymentPlanEnums.BUSINESS;
        const isValidPlan = ORG_PLAN_INDEX[upcomingItem.paymentType] > ORG_PLAN_INDEX[currentItem.paymentType];
        const isValidPeriod = PAYMENT_PERIOD_INDEX[upcomingPeriod] >= PAYMENT_PERIOD_INDEX[currentPeriod];
        return isBusiness || (isValidPlan && isValidPeriod);
      }
      case PaymentProductEnums.SIGN: {
        const isValidPlan = ORG_SIGN_PLAN_INDEX[upcomingItem.paymentType] > ORG_SIGN_PLAN_INDEX[currentItem.paymentType];
        const isValidPeriod = PAYMENT_PERIOD_INDEX[upcomingPeriod] >= PAYMENT_PERIOD_INDEX[currentPeriod];
        return isValidPlan && isValidPeriod;
      }
      default:
        throw new Error('Invalid product name');
    }
  }

  isUpgradeDocStack(): boolean {
    return (
      this.paymentUtilsService.isIncludePdfSubscription({ subscriptionItems: this.currentPayment.subscriptionItems })
      && this.paymentUtilsService.isIncludePdfSubscription({ subscriptionItems: this.upcomingPayment.subscriptionItems })
      && !this.isUpgradeNewPlan({ productName: PaymentProductEnums.PDF })
      && this.isKeepBillingCycle()
    );
  }

  public isKeepBillingCycle(): boolean {
    const isSubscribed = this.currentPayment.subscriptionItems?.length || this.currentPayment.type !== PaymentPlanEnums.FREE;

    const currentPaymentPeriod = this.currentPayment.period;
    const upcomingPaymentPeriod = this.upcomingPayment.period;
    const isSamePeriod = PAYMENT_PERIOD_INDEX[currentPaymentPeriod] === PAYMENT_PERIOD_INDEX[upcomingPaymentPeriod];

    return !this.isUpgradeFromTrial() && isSubscribed && isSamePeriod;
  }

  public isChargeAtEndPeriod(): boolean {
    return (
      this.isKeepBillingCycle()
      && this.currentPayment.period === PaymentPeriod.MONTHLY
      && !this.hasNewPurchaseAfterPaymentStatuses([PaymentStatusEnums.CANCELED])
    );
  }

  public isAllowUpgrade(): boolean {
    const { period: currentPeriod } = this.currentPayment;
    const { subscriptionItems: currentSubscriptionItems } = this.currentPayment;
    const { period: upcomingPeriod, subscriptionItems: upcomingSubscriptionItems } = this.upcomingPayment;
    const isValidPlan = upcomingSubscriptionItems.every((upcomingSub) => {
      const currentSub = currentSubscriptionItems.find((sub) => sub.productName === upcomingSub.productName);
      if (!currentSub) return true;
      switch (currentSub.productName as PaymentProductEnums) {
        case PaymentProductEnums.PDF: {
          return ORG_PLAN_INDEX[upcomingSub.paymentType] >= ORG_PLAN_INDEX[currentSub.paymentType];
        }
        case PaymentProductEnums.SIGN: {
          return (
            ORG_SIGN_PLAN_INDEX[upcomingSub.paymentType] >= ORG_SIGN_PLAN_INDEX[currentSub.paymentType] && upcomingSub.quantity >= currentSub.quantity
          );
        }
        default:
          return false;
      }
    });

    const isValidPeriod = PAYMENT_PERIOD_INDEX[upcomingPeriod] >= PAYMENT_PERIOD_INDEX[currentPeriod];

    const hasCanceledItem = currentSubscriptionItems.some((item) => item.paymentStatus === PaymentStatusEnums.CANCELED);

    return isValidPlan && isValidPeriod && !(hasCanceledItem && !this.isKeepBillingCycle());
  }

  public isUpgradeFromTrial(): boolean {
    return this.currentPayment.status === PaymentStatusEnums.TRIALING;
  }

  public isUpgradeFromUnpaid(): boolean {
    const { subscriptionItems = [] } = this.currentPayment;
    return subscriptionItems.some((item) => item.paymentStatus === PaymentStatusEnums.UNPAID);
  }

  public async getUpcomingQuantity(item: { paymentType: string; quantity: number }): Promise<number> {
    if (this.isUpgradeFromTrial() && this.orgId) {
      this.totalDocStackUsed = await this.paymentService.getTotalDocStackUsed(this.orgId);
    }
    return DocStackUtils.calculateIncomingDocStackQuantity({
      currentPayment: this.currentPayment as Payment,
      incomingPayment: {
        type: item.paymentType,
        quantity: item.quantity,
        currency: this.upcomingPayment.currency,
        period: this.upcomingPayment.period,
      },
      totalDocStackUsed: this.totalDocStackUsed,
    });
  }

  public async getUpdateSubscriptionItemParams() {
    const updateItems = await this.buildUpcomingItemParams();
    const hasNewPurchaseAfterPaymentStatuses = this.hasNewPurchaseAfterPaymentStatuses([PaymentStatusEnums.CANCELED]);
    const cleanupItems = this.buildCleanupItemParams({ keepCanceledItem: hasNewPurchaseAfterPaymentStatuses });
    return [...updateItems, ...cleanupItems];
  }

  public async getPreviewRecurringItemParams() {
    const updateItems = await this.buildUpcomingItemParams();
    const cleanupItems = this.buildCleanupItemParams({ keepCanceledItem: false });
    return [...updateItems, ...cleanupItems];
  }

  public async getReactivateItemParams() {
    const updateItems = await this.buildUpcomingItemParams({ autoUpgradePdfQuantity: false });
    const cleanupItems = this.buildCleanupItemParams();
    return [...updateItems, ...cleanupItems];
  }

  private async buildUpcomingItemParams(params: { autoUpgradePdfQuantity: boolean } = { autoUpgradePdfQuantity: true }) {
    const { autoUpgradePdfQuantity } = params;
    const { subscriptionItems: currentItems } = this.currentPayment;
    const { subscriptionItems: upcomingItems } = this.upcomingPayment;

    return Promise.all(
      upcomingItems.map(async (upcomingItem) => {
        let { quantity } = upcomingItem;
        if (autoUpgradePdfQuantity && upcomingItem.productName === PaymentProductEnums.PDF) {
          quantity = await this.getUpcomingQuantity(upcomingItem);
        }
        const baseParams = {
          price: this.getUpcomingPlanRemoteId(upcomingItem),
          quantity,
          metadata: {
            productName: upcomingItem.productName,
            paymentType: upcomingItem.paymentType,
          },
        };

        const currentItem = currentItems?.find((item) => item.productName === upcomingItem.productName);
        if (currentItem && !currentItem.deleted) {
          return { ...baseParams, id: currentItem.id };
        }
        return baseParams;
      }),
    );
  }

  private buildCleanupItemParams(params?: { keepCanceledItem: boolean }) {
    const { keepCanceledItem } = params || {};
    const { subscriptionItems: currentItems } = this.currentPayment;
    const { subscriptionItems: upcomingItems } = this.upcomingPayment;
    const removedItems = differenceBy(currentItems, upcomingItems, 'productName');

    return removedItems.map((item) => {
      const isCanceledNotDeleted = item.paymentStatus === PaymentStatusEnums.CANCELED && !item.deleted;
      const isCanceledAndDeleted = item.paymentStatus === PaymentStatusEnums.CANCELED && item.deleted;

      if (isCanceledAndDeleted) {
        return null;
      }

      if (isCanceledNotDeleted) {
        if (keepCanceledItem) {
          return null;
        }
        return { id: item.id, deleted: true };
      }

      return {
        id: item.id,
        metadata: {
          productName: item.productName,
          paymentType: item.paymentType,
        },
      };
    }).filter(Boolean);
  }

  public async getTestClockFrozenTime(): Promise<number | null> {
    if (!this.paymentUtilsService.isStripeTestMode() || !this.stripeCustomerRemoteId || !this.currentPayment.stripeAccountId) {
      return null;
    }
    const customer = await this.paymentService.retrieveCustomer(
      this.stripeCustomerRemoteId,
      null,
      { stripeAccount: this.currentPayment.stripeAccountId },
    ) as Stripe.Customer;
    if (!customer || !customer.test_clock) {
      return null;
    }
    const testClock = await this.paymentService.retrieveTestClock(customer.test_clock as string, this.currentPayment.stripeAccountId);
    return testClock.frozen_time;
  }

  public async getCurrentTime(): Promise<number> {
    const testClockFrozenTime = await this.getTestClockFrozenTime();
    return testClockFrozenTime || Math.floor(Date.now() / 1000);
  }

  public async calculateKeepBillingCycleSubscriptionParams(): Promise<void> {
    if (this.currentPayment.period === PaymentPeriod.MONTHLY) {
      this.params = {
        billing_cycle_anchor: 'unchanged',
        proration_behavior: 'none',
        cancel_at_period_end: false,
        items: await this.getUpdateSubscriptionItemParams(),
      };
    }
    if (this.currentPayment.period === PaymentPeriod.ANNUAL) {
      this.params = {
        proration_date: await this.getCurrentTime(),
        proration_behavior: 'always_invoice',
        billing_cycle_anchor: 'unchanged',
        cancel_at_period_end: false,
        payment_behavior: 'error_if_incomplete',
        items: await this.getUpdateSubscriptionItemParams(),
      };
    }
  }

  public async calculateCancelAtPeriodEndSubscriptionParams(): Promise<void> {
    this.params = {
      proration_date: await this.getCurrentTime(),
      proration_behavior: 'always_invoice',
      billing_cycle_anchor: 'unchanged',
      payment_behavior: 'error_if_incomplete',
      items: await this.getUpdateSubscriptionItemParams(),
    };
  }

  public isSetToCancelAtPeriodEnd(): boolean {
    if (this.currentPayment.subscriptionItems?.length) {
      const { subscriptionItems: currentSubscriptionItems } = this.currentPayment;
      return currentSubscriptionItems.some((item) => (item.paymentStatus as PaymentStatusEnums) === PaymentStatusEnums.CANCELED);
    }
    return (this.currentPayment.status as PaymentStatusEnums) === PaymentStatusEnums.CANCELED;
  }

  public isPendingOrUnpaidStatus(): boolean {
    if (this.currentPayment.subscriptionItems?.length) {
      return this.currentPayment.subscriptionItems.some((item) => [
        PaymentStatusEnums.PENDING, PaymentStatusEnums.UNPAID,
      ].includes(item.paymentStatus as PaymentStatusEnums));
    }
    return [PaymentStatusEnums.PENDING, PaymentStatusEnums.UNPAID].includes(this.currentPayment.status as PaymentStatusEnums);
  }

  public async calculatePendingOrUnpaidSubscriptionParams(): Promise<void> {
    this.params = {
      proration_date: await this.getCurrentTime(),
      proration_behavior: 'always_invoice',
      billing_cycle_anchor: 'unchanged',
      cancel_at_period_end: false,
      payment_behavior: 'error_if_incomplete',
      items: await this.getUpdateSubscriptionItemParams(),
    };
  }

  public async calculate(): Promise<this> {
    if (this.isFree()) {
      this.calculateCreateNewSubscriptionParams();
      return this;
    }

    if (this.hasNewPurchaseAfterPaymentStatuses([PaymentStatusEnums.CANCELED])) {
      await this.calculateCancelAtPeriodEndSubscriptionParams();
      return this;
    }

    if (this.hasNewPurchaseAfterPaymentStatuses([PaymentStatusEnums.PENDING, PaymentStatusEnums.UNPAID])) {
      await this.calculatePendingOrUnpaidSubscriptionParams();
      return this;
    }

    if (this.isKeepBillingCycle()) {
      await this.calculateKeepBillingCycleSubscriptionParams();
      return this;
    }

    this.params = {
      ...(this.isStartTrial()
        ? {
          trial_end: this.paymentService.getFreeTrialTime(),
        }
        : {
          trial_end: 'now',
          billing_cycle_anchor: 'now',
        }),
      proration_date: await this.getCurrentTime(),
      proration_behavior: 'always_invoice',
      payment_behavior: 'error_if_incomplete',
      cancel_at_period_end: false,
      items: await this.getUpdateSubscriptionItemParams(),
    };
    return this;
  }

  public getUpcomingPlanRemoteId(subscriptionItem: Partial<SubScriptionItemSchemaInterface>): string {
    return this.paymentService.getStripePlanRemoteId({
      plan: subscriptionItem.paymentType as PaymentPlanEnums,
      period: this.upcomingPayment.period as PaymentPeriod,
      currency: (this.upcomingPayment.currency as Currency) || (this.currentPayment.currency as Currency),
      stripeAccountId: this.currentPayment.stripeAccountId,
    });
  }

  private getDiscountParams(): { coupon?: string; discounts?: Array<{ promotion_code: string }> } {
    if (this.promotionCodeId) {
      return { discounts: [{ promotion_code: this.promotionCodeId }] };
    }

    return { coupon: this.coupon };
  }

  public calculateCreateNewSubscriptionParams(): void {
    this.params = {
      payment_behavior: 'error_if_incomplete',
      items: this.upcomingPayment.subscriptionItems.map((sub) => ({
        plan: this.getUpcomingPlanRemoteId(sub as Partial<SubScriptionItemSchemaInterface>),
        quantity: sub.quantity,
        metadata: {
          productName: sub.productName,
          paymentType: sub.paymentType,
        },
      })),
    };
  }

  public getCreateNewSubscriptionParams(): Record<string, any> {
    return {
      customer: this.stripeCustomerRemoteId,
      ...this.params,
      ...this.getDiscountParams(),
    };
  }

  public getPreviewSubscriptionParams(): Record<string, any> {
    delete this.params.payment_behavior;
    const previewSubscriptionParams: any = Object.keys(this.params).reduce((previewParams, key) => {
      previewParams[`subscription_${key}`] = this.params[key];
      return previewParams;
    }, {});
    if (this.subscriptionRemoteId) {
      previewSubscriptionParams.subscription = this.subscriptionRemoteId;
      return {
        ...previewSubscriptionParams,
        ...this.getDiscountParams(),
        expand: ['discounts.coupon.applies_to', 'discounts.promotion_code'],
      };
    }
    if (this.stripeCustomerRemoteId) {
      previewSubscriptionParams.customer = this.stripeCustomerRemoteId;
    }
    return {
      ...previewSubscriptionParams,
      ...this.getDiscountParams(),
      expand: ['discounts.coupon.applies_to', 'discounts.promotion_code'],
    };
  }

  public async calculatePreviewRecurring(): Promise<Stripe.InvoiceRetrieveUpcomingParams> {
    const previewSubscriptionParams: Stripe.InvoiceRetrieveUpcomingParams = {
      subscription_items: await this.getPreviewRecurringItemParams(),
      subscription_billing_cycle_anchor: 'unchanged',
      subscription_cancel_at_period_end: false,
      subscription_proration_behavior: 'none',
      ...this.getDiscountParams(),
      expand: ['discounts.coupon.applies_to'],
    };

    if (this.subscriptionRemoteId) {
      return {
        ...previewSubscriptionParams,
        subscription: this.subscriptionRemoteId,
        expand: ['discounts.coupon.applies_to'],
      };
    }
    if (this.stripeCustomerRemoteId) {
      return {
        ...previewSubscriptionParams,
        customer: this.stripeCustomerRemoteId,
        expand: ['discounts.coupon.applies_to'],
      };
    }
    return previewSubscriptionParams;
  }

  public getUpgradeSubscriptionParams(): { subscriptionRemoteId: string; properties: Record<string, any> } {
    return {
      subscriptionRemoteId: this.subscriptionRemoteId,
      properties: {
        ...this.params,
        ...this.getDiscountParams(),
        expand: ['latest_invoice'],
        ...(this.hasNewPurchaseAfterPaymentStatuses([PaymentStatusEnums.CANCELED]) && { cancel_at_period_end: false }),
      },
    };
  }

  public async calculateCreateFreeTrial(): Promise<Stripe.SubscriptionCreateParams> {
    return {
      customer: this.stripeCustomerRemoteId,
      cancel_at_period_end: false,
      trial_end: this.paymentService.getFreeTrialTime(),
      items: (await this.getUpdateSubscriptionItemParams()) as Stripe.SubscriptionCreateParams['items'],
    };
  }

  public async calculateUpdateFreeTrial(): Promise<Stripe.SubscriptionUpdateParams> {
    return {
      cancel_at_period_end: false,
      trial_end: this.paymentService.getFreeTrialTime(),
      items: await this.getUpdateSubscriptionItemParams(),
    };
  }

  public async calculateReactivate(): Promise<Stripe.SubscriptionUpdateParams> {
    return {
      billing_cycle_anchor: 'unchanged',
      proration_behavior: 'none',
      cancel_at_period_end: false,
      items: await this.getReactivateItemParams(),
    };
  }

  public hasNewPurchaseAfterPaymentStatuses(paymentStatuses: PaymentStatusEnums[]): boolean {
    const { subscriptionItems: currentSubscriptionItems = [] } = this.currentPayment;
    const { subscriptionItems: upcomingSubscriptionItems = [] } = this.upcomingPayment;
    return currentSubscriptionItems.length === 1
      && paymentStatuses.includes(currentSubscriptionItems[0].paymentStatus as PaymentStatusEnums)
      && upcomingSubscriptionItems.length === 1
      && currentSubscriptionItems[0].productName !== upcomingSubscriptionItems[0].productName;
  }
}
