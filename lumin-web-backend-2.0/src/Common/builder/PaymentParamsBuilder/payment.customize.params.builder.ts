import { ORG_PLAN_INDEX, PAYMENT_PERIOD_INDEX } from 'Common/constants/PaymentConstant';
import { Utils } from 'Common/utils/Utils';

import { Currency, PaymentPeriod } from 'graphql.schema';
import { PaymentSchemaInterface } from 'Payment/interfaces/payment.interface';
import { CollectionMethod, PaymentPlanEnums, PaymentStatusEnums } from 'Payment/payment.enum';
import { PaymentService } from 'Payment/payment.service';

export class PaymentCustomizeParamsBuilder {
  private currentPayment: Partial<PaymentSchemaInterface>;

  private upcomingPayment: Partial<PaymentSchemaInterface>;

  private customerRemoteId: string;

  private collectionMethod: CollectionMethod;

  private expireDays: number;

  private couponCode: string;

  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  /**
   *
   * @param payment Current payment Object of Circle
   * @returns
   */
  public from(payment: Partial<PaymentSchemaInterface>): PaymentCustomizeParamsBuilder {
    this.currentPayment = payment;
    return this;
  }

  /**
   *
   * @param payment Upcomming payment Object of Circle
   * @returns
   */
  public to(payment: Partial<PaymentSchemaInterface>): PaymentCustomizeParamsBuilder {
    this.upcomingPayment = payment;
    return this;
  }

  public setCustomerRemoteId(cusId: string): PaymentCustomizeParamsBuilder {
    this.customerRemoteId = cusId;
    return this;
  }

  public setCollectionMethod(method: CollectionMethod): PaymentCustomizeParamsBuilder {
    this.collectionMethod = method;
    return this;
  }

  /**
   *
   * @param days Number of days customer has to pay invoices
   */
  public setExpirePaymentLink(days: number): PaymentCustomizeParamsBuilder {
    this.expireDays = days;
    return this;
  }

  public addCoupon(code: string): PaymentCustomizeParamsBuilder {
    this.couponCode = code;
    return this;
  }

  public isUpgradeFromUnpaid(): boolean {
    return this.currentPayment.status === PaymentStatusEnums.UNPAID;
  }

  private isUsingFree(): boolean {
    return this.currentPayment.type === PaymentPlanEnums.FREE;
  }

  private isUsingFreeTrial(): boolean {
    return this.currentPayment.status === PaymentStatusEnums.TRIALING;
  }

  // Upgrade to the same period
  private shouldKeepBillingCycle(): boolean {
    return this.currentPayment.period === this.upcomingPayment.period;
  }

  // Upgrade to the same monthly period.
  public isChargeAtEndPeriod(): boolean {
    return this.currentPayment.period === PaymentPeriod.MONTHLY
    && this.shouldKeepBillingCycle()
    && this.currentPayment.status !== PaymentStatusEnums.TRIALING;
  }

  public getUpcomingPlanRemoteId(): string {
    return this.paymentService.getStripePlanRemoteId({
      plan: this.upcomingPayment.type as PaymentPlanEnums,
      period: this.upcomingPayment.period as PaymentPeriod,
      currency: this.upcomingPayment.currency as Currency || this.currentPayment.currency as Currency || Currency.USD,
      stripeAccountId: this.currentPayment.stripeAccountId,
    });
  }

  private async getMainSubscriptionItem(): Promise<Record<string, any>> {
    const subscirptionInfo = await this.paymentService.getStripeSubscriptionInfo({
      subscriptionId: this.currentPayment.subscriptionRemoteId,
      options: { stripeAccount: this.currentPayment.stripeAccountId },
    });
    return this.paymentService.getMainSubscriptionItem(subscirptionInfo as Record<any, any>, this.currentPayment.planRemoteId);
  }

  private createNewSubscriptionParams(): Record<string, any> {
    return {
      customer: this.currentPayment.customerRemoteId || this.customerRemoteId,
      items: [{
        plan: this.getUpcomingPlanRemoteId(),
        quantity: this.upcomingPayment.quantity,
      }],
    };
  }

  private async updateExistedSubscriptionParams(): Promise<Record<string, any>> {
    const mainSubscriptionItem = await this.getMainSubscriptionItem();
    if (this.isChargeAtEndPeriod()) {
      return {
        subscription: this.currentPayment.subscriptionRemoteId,
        customer: this.currentPayment.customerRemoteId,
        items: [{ id: mainSubscriptionItem.id, price: this.getUpcomingPlanRemoteId(), quantity: this.upcomingPayment.quantity }],
        proration_behavior: 'none',
        billing_cycle_anchor: 'unchanged',
        cancel_at_period_end: false,
      };
    }
    return {
      subscription: this.currentPayment.subscriptionRemoteId,
      customer: this.currentPayment.customerRemoteId,
      billing_cycle_anchor: this.shouldKeepBillingCycle() ? 'unchanged' : 'now',
      proration_behavior: 'always_invoice',
      proration_date: Math.floor(Date.now() / 1000),
      cancel_at_period_end: false,
      items: [{ id: mainSubscriptionItem.id, price: this.getUpcomingPlanRemoteId(), quantity: this.upcomingPayment.quantity }],
    };
  }

  private getNewSubscriptionParams(): { preview: Record<string, any>, upgrade: Record<string, any> } {
    const params = this.createNewSubscriptionParams();
    const createNewSubscriptionParams = { ...params };
    delete createNewSubscriptionParams.customer;
    return {
      preview: {
        ...Utils.convertToPreviewUpcomingInvoiceParams(params),
        ...(this.couponCode && { coupon: this.couponCode }),
        customer: params.customer,
      },
      upgrade: {
        customerRemoteId: params.customer,
        properties: {
          ...createNewSubscriptionParams,
          ...(this.couponCode && { coupon: this.couponCode }),
          collection_method: this.collectionMethod,
          days_until_due: this.expireDays,
        },
      },
    };
  }

  private async getUpdateSubscriptionParams(): Promise<{ preview: Record<string, any>, upgrade: Record<string, any> }> {
    const params = await this.updateExistedSubscriptionParams();
    const updateSubscriptionParams = { ...params };
    delete updateSubscriptionParams.customer;
    delete updateSubscriptionParams.subscription;
    return {
      preview: {
        ...Utils.convertToPreviewUpcomingInvoiceParams(params),
        ...(this.couponCode && { coupon: this.couponCode }),
      },
      upgrade: {
        subscriptionRemoteId: params.subscription,
        properties: {
          ...updateSubscriptionParams,
          ...(this.couponCode && { coupon: this.couponCode }),
          collection_method: this.collectionMethod,
          days_until_due: this.expireDays,
        },
      },
    };
  }

  public async getParams(): Promise<{ preview: Record<string, any>, upgrade: Record<string, any> }> {
    if (this.isUsingFree() || this.isUsingFreeTrial()) {
      return this.getNewSubscriptionParams();
    }
    return this.getUpdateSubscriptionParams();
  }

  private isUpgradeDocStack(): boolean {
    return this.currentPayment.status !== PaymentStatusEnums.TRIALING
      && ORG_PLAN_INDEX[this.upcomingPayment.type] === ORG_PLAN_INDEX[this.currentPayment.type]
      && PAYMENT_PERIOD_INDEX[this.upcomingPayment.period] === PAYMENT_PERIOD_INDEX[this.currentPayment.period];
  }

  public isUpgradeDocStackAnnual(): boolean {
    return this.isUpgradeDocStack() && this.currentPayment.period === PaymentPeriod.ANNUAL;
  }
}
