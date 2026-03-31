import { has } from 'lodash';

import { ORG_PLAN_INDEX, PAYMENT_PERIOD_INDEX } from 'Common/constants/PaymentConstant';

import { Currency, PaymentPeriod } from 'graphql.schema';
import { DocStackUtils } from 'Organization/utils/docStackUtils';
import { PaymentSchemaInterface } from 'Payment/interfaces/payment.interface';
import { PaymentPlanEnums, PaymentStatusEnums } from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';

export class UpdateSubscriptionParamsBuilder {
  private currentPayment: Partial<PaymentSchemaInterface>;

  private upcomingPayment: Partial<PaymentSchemaInterface>;

  private subscriptionRemoteId: string;

  private stripeCustomerRemoteId: string;

  private params: Record<string, any>;

  private coupon: string;

  private totalDocStackUsed: number = 0;

  private orgId: string;

  constructor(
    private readonly paymentService: PaymentService,
  ) {
  }

  public from(payment: Partial<PaymentSchemaInterface>): UpdateSubscriptionParamsBuilder {
    if (payment.customerRemoteId) {
      this.stripeCustomerRemoteId = payment.customerRemoteId;
    }
    if (payment.type !== PaymentPlanEnums.FREE) {
      this.subscriptionRemoteId = payment.subscriptionRemoteId;
    }
    this.currentPayment = payment;
    return this;
  }

  public to(payment: Partial<PaymentSchemaInterface>): UpdateSubscriptionParamsBuilder {
    this.upcomingPayment = payment;
    return this;
  }

  public addCusId(cusId: string): UpdateSubscriptionParamsBuilder {
    this.stripeCustomerRemoteId = cusId;
    return this;
  }

  public addOrgId(orgId: string): UpdateSubscriptionParamsBuilder {
    this.orgId = orgId;
    return this;
  }

  public isUpgradeNewPlan(): boolean {
    return this.currentPayment.type === PaymentPlanEnums.BUSINESS
      || (ORG_PLAN_INDEX[this.upcomingPayment.type] > ORG_PLAN_INDEX[this.currentPayment.type]
      && PAYMENT_PERIOD_INDEX[this.upcomingPayment.period] >= PAYMENT_PERIOD_INDEX[this.currentPayment.period]);
  }

  public isUpgradePeriod(): boolean {
    return !this.isUpgradeNewPlan() && PAYMENT_PERIOD_INDEX[this.upcomingPayment.period] > PAYMENT_PERIOD_INDEX[this.currentPayment.period];
  }

  public isUpgradeDocStack(): boolean {
    return this.currentPayment.status !== PaymentStatusEnums.TRIALING
      && ORG_PLAN_INDEX[this.upcomingPayment.type] === ORG_PLAN_INDEX[this.currentPayment.type]
      && PAYMENT_PERIOD_INDEX[this.upcomingPayment.period] === PAYMENT_PERIOD_INDEX[this.currentPayment.period];
  }

  public isKeepBillingCycle(): boolean {
    return this.currentPayment.type !== PaymentPlanEnums.FREE
      && this.isUpgradeDocStack();
  }

  public isChargeAtEndPeriod(): boolean {
    return this.isKeepBillingCycle()
      && this.upcomingPayment.period === PaymentPeriod.MONTHLY;
  }

  public isUpgradeFromTrial(): boolean {
    return this.currentPayment.status === PaymentStatusEnums.TRIALING;
  }

  public isUpgradeFromUnpaid(): boolean {
    const { subscriptionItems = [] } = this.currentPayment;
    return subscriptionItems.some((item) => item.paymentStatus === PaymentStatusEnums.UNPAID);
  }

  public isAllowUpgrade(): boolean {
    const { type: prevType, period: prevPeriod } = this.currentPayment;
    const { type: upcomingType, period: upcomingPeriod } = this.upcomingPayment;

    const isUpgradeFromOldPlans = prevType === PaymentPlanEnums.BUSINESS && has(ORG_PLAN_INDEX, upcomingType);
    const isValidPlan = ORG_PLAN_INDEX[upcomingType] >= ORG_PLAN_INDEX[prevType];
    const isValidPeriod = PAYMENT_PERIOD_INDEX[upcomingPeriod] >= PAYMENT_PERIOD_INDEX[prevPeriod];

    return (isUpgradeFromOldPlans || isValidPlan) && isValidPeriod;
  }

  public isChargeImmediately(): boolean {
    return this.isUpgradePeriod() || this.isUpgradeNewPlan();
  }

  public isUpgradeDocStackAnnual(): boolean {
    return this.isUpgradeDocStack() && this.currentPayment.period === PaymentPeriod.ANNUAL;
  }

  public isStartTrial(): boolean {
    return this.upcomingPayment.status === PaymentStatusEnums.TRIALING;
  }

  public addCoupon(coupon: string): UpdateSubscriptionParamsBuilder {
    this.coupon = coupon;
    return this;
  }

  public async getUpcomingQuantity(): Promise<number> {
    if (this.currentPayment.status === PaymentStatusEnums.TRIALING && this.orgId) {
      this.totalDocStackUsed = await this.paymentService.getTotalDocStackUsed(this.orgId);
    }
    return DocStackUtils.calculateIncomingDocStackQuantity({
      currentPayment: this.currentPayment,
      incomingPayment: this.upcomingPayment,
      totalDocStackUsed: this.totalDocStackUsed,
    });
  }

  public getUpcomingPlanRemoteId(): string {
    return this.paymentService.getStripePlanRemoteId({
      plan: this.upcomingPayment.type as PaymentPlanEnums,
      period: this.upcomingPayment.period as PaymentPeriod,
      currency: this.upcomingPayment.currency as Currency || this.currentPayment.currency as Currency,
      stripeAccountId: this.currentPayment.stripeAccountId,
    });
  }

  public async getMainSubscriptionItem(): Promise<Record<string, any>> {
    const subscirptionInfo = await this.paymentService.getStripeSubscriptionInfo({
      subscriptionId: this.currentPayment.subscriptionRemoteId,
      options: { stripeAccount: this.currentPayment.stripeAccountId },
    });
    return this.paymentService.getMainSubscriptionItem(subscirptionInfo, this.currentPayment.planRemoteId);
  }

  public async calculateKeepBillingCycleSubscriptionParams(): Promise<void> {
    const mainSubscriptionItem = await this.getMainSubscriptionItem();
    if (this.currentPayment.period === PaymentPeriod.MONTHLY) {
      this.params = {
        billing_cycle_anchor: 'unchanged',
        proration_behavior: 'none',
        cancel_at_period_end: false,
        items: [{ id: mainSubscriptionItem.id, price: this.getUpcomingPlanRemoteId(), quantity: await this.getUpcomingQuantity() }],
      };
    }
    if (this.currentPayment.period === PaymentPeriod.ANNUAL) {
      this.params = {
        proration_date: Math.floor(Date.now() / 1000),
        proration_behavior: 'always_invoice',
        billing_cycle_anchor: 'unchanged',
        cancel_at_period_end: false,
        payment_behavior: 'error_if_incomplete',
        items: [{ id: mainSubscriptionItem.id, price: this.getUpcomingPlanRemoteId(), quantity: await this.getUpcomingQuantity() }],
      };
    }
  }

  public async calculateCreateNewSubscriptionParams(): Promise<void> {
    this.params = {
      payment_behavior: 'error_if_incomplete',
      items: [
        {
          plan: this.getUpcomingPlanRemoteId(),
          quantity: await this.getUpcomingQuantity(),
        },
      ],
    };
  }

  public async calculate(): Promise<UpdateSubscriptionParamsBuilder> {
    const upcomingPlanRemoteId = this.paymentService.getStripePlanRemoteId({
      plan: this.upcomingPayment.type as PaymentPlanEnums,
      period: this.upcomingPayment.period as PaymentPeriod,
      currency: this.upcomingPayment.currency as Currency || this.currentPayment.currency as Currency,
      stripeAccountId: this.currentPayment.stripeAccountId,
    });
    if (this.currentPayment.status === PaymentStatusEnums.TRIALING && this.orgId) {
      this.totalDocStackUsed = await this.paymentService.getTotalDocStackUsed(this.orgId);
    }
    const upcomingQuantity = DocStackUtils.calculateIncomingDocStackQuantity({
      currentPayment: this.currentPayment,
      incomingPayment: this.upcomingPayment,
      totalDocStackUsed: this.totalDocStackUsed,
    });
    if (this.currentPayment.type === PaymentPlanEnums.FREE) {
      await this.calculateCreateNewSubscriptionParams();
      return this;
    }
    if (this.isKeepBillingCycle()) {
      await this.calculateKeepBillingCycleSubscriptionParams();
      return this;
    }

    const mainSubscriptionItem = await this.getMainSubscriptionItem();
    this.params = {
      ...(this.isStartTrial() ? {
        trial_end: this.paymentService.getFreeTrialTime(),
      } : {
        trial_end: 'now',
        billing_cycle_anchor: 'now',
      }),
      proration_date: Math.floor(Date.now() / 1000),
      proration_behavior: 'always_invoice',
      payment_behavior: 'error_if_incomplete',
      cancel_at_period_end: false,
      items: [{ id: mainSubscriptionItem.id, price: upcomingPlanRemoteId, quantity: upcomingQuantity }],
    };
    return this;
  }

  public getCreateNewSubscriptionParams(): Record<string, any> {
    return {
      customer: this.stripeCustomerRemoteId,
      ...this.params,
      ...(this.coupon && { coupon: this.coupon }),
    };
  }

  public getUpgradeSubscriptionParams(): {subscriptionRemoteId: string, properties: Record<string, any>} {
    return {
      subscriptionRemoteId: this.subscriptionRemoteId,
      properties: {
        ...this.params,
        ...(this.coupon && { coupon: this.coupon }),
        expand: ['latest_invoice'],
      },
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
        ...(this.coupon && { coupon: this.coupon }),
      };
    }
    if (this.stripeCustomerRemoteId) {
      previewSubscriptionParams.customer = this.stripeCustomerRemoteId;
    }
    return {
      ...previewSubscriptionParams,
      ...(this.coupon && { coupon: this.coupon }),
    };
  }
}
