import { UnifySubscriptionPlan, UnifySubscriptionProduct } from 'constants/organization.enum';
import { NEW_PRICING_PLAN_LIST, PERIOD, Plans, PRICING_VERSION, STATUS } from 'constants/plan';
import { PaymentPlans, PaymentStatus } from 'constants/plan.enum';

import { IOrganizationPayment, IPayment, PaymentSubScriptionItem } from 'interfaces/payment/payment.interface';

// NOTE: Enterprise plan is not supported in the new payment system => payment.subscriptionItems = undefined

export class PaymentUtilities {
  payment: IPayment;

  constructor(payment: IPayment) {
    this.payment = payment || {
      subscriptionItems: [],
      customerRemoteId: '',
      subscriptionRemoteId: '',
      planRemoteId: '',
      type: null,
      period: '',
      status: '',
      quantity: 0,
      currency: '',
      priceVersion: '',
      stripeAccountId: '',
    };
  }

  getType(): string {
    return this.payment.type;
  }

  getPdfPaymentType(): PaymentPlans {
    return (this.payment.subscriptionItems?.find((item) => item.productName === UnifySubscriptionProduct.PDF)
      ?.paymentType || this.getType()) as PaymentPlans;
  }

  getStatus(): string {
    return this.payment.status;
  }

  getPeriod(): string {
    return this.payment.period;
  }

  isFree(): boolean {
    return this.getType() === Plans.FREE;
  }

  isPdfFree(): boolean {
    return this.getPdfPaymentType() === PaymentPlans.FREE;
  }

  isPremium(): boolean {
    return this.getType() !== Plans.FREE;
  }

  isFreeTrial(): boolean {
    return this.getStatus() === STATUS.TRIALING;
  }

  isBusiness(): boolean {
    return this.getType() === Plans.BUSINESS;
  }

  isOrgPro(): boolean {
    return this.getType() === Plans.ORG_PRO;
  }

  isOrgStarter(): boolean {
    return this.getType() === Plans.ORG_STARTER;
  }

  isNewBusiness(): boolean {
    return this.getType() === Plans.ORG_BUSINESS;
  }

  isEnterprise(): boolean {
    return this.getType() === Plans.ENTERPRISE;
  }

  isMonthlyPeriod(): boolean {
    return this.getPeriod() === PERIOD.MONTHLY;
  }

  isAnnualPeriod(): boolean {
    return this.getPeriod() === PERIOD.ANNUAL;
  }

  isBusinessMonthly(): boolean {
    return this.isBusiness() && this.isMonthlyPeriod();
  }

  isBusinessAnnual(): boolean {
    return this.isBusiness() && this.isAnnualPeriod();
  }

  isEnterpriseMonthly(): boolean {
    return this.isEnterprise() && this.isAnnualPeriod();
  }

  getQuantity(): number {
    return this.payment.quantity;
  }

  getPriceVersion(): string {
    return this.payment.priceVersion || PRICING_VERSION.V3;
  }

  isNewPlan(): boolean {
    return NEW_PRICING_PLAN_LIST.includes(this.getType());
  }

  isNewAnnualPlan(): boolean {
    return this.isNewPlan() && this.isAnnualPeriod();
  }

  canStartTrial(): boolean {
    const { canStartTrial } = (this.payment as IOrganizationPayment).trialInfo || {};
    return Boolean(canStartTrial);
  }

  getPdfStatus(): string {
    return (
      this.payment.subscriptionItems?.find((item) => item.productName === UnifySubscriptionProduct.PDF)
        ?.paymentStatus || this.getStatus()
    );
  }

  isPdfTrial(): boolean {
    return this.getPdfStatus() === PaymentStatus.TRIALING;
  }

  getPdfSubscriptionItem(): PaymentSubScriptionItem {
    return this.payment.subscriptionItems?.find((item) => item.productName === UnifySubscriptionProduct.PDF);
  }

  getSignSubscriptionItem(): PaymentSubScriptionItem {
    return this.payment.subscriptionItems?.find((item) => item.productName === UnifySubscriptionProduct.SIGN);
  }

  getSignStatus(): PaymentStatus {
    return this.getSignSubscriptionItem()?.paymentStatus;
  }

  getSignPlan(): UnifySubscriptionPlan {
    return this.getSignSubscriptionItem()?.paymentType || UnifySubscriptionPlan.FREE;
  }

  isSignFree(): boolean {
    return !this.getSignPlan() || this.getSignPlan() === UnifySubscriptionPlan.FREE;
  }

  isUnifyFree(): boolean {
    return this.isPdfFree() && this.isSignFree();
  }
}
