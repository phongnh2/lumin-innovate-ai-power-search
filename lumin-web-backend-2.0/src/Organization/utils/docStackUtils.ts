import { INITIAL_DOC_STACK_QUANTITY } from 'Document/documentConstant';
import { Payment } from 'graphql.schema';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { PaymentPeriodEnums, PaymentPlanEnums, PaymentStatusEnums } from 'Payment/payment.enum';
import planPoliciesHandler from 'Payment/Policy/planPoliciesHandler';

export class DocStackUtils {
  private static isOldPermiumOrganization(plan: PaymentPlanEnums): boolean {
    return [PaymentPlanEnums.BUSINESS, PaymentPlanEnums.FREE].includes(
      plan,
    );
  }

  private static isTrialing(paymentStatus: PaymentStatusEnums): boolean {
    return paymentStatus === PaymentStatusEnums.TRIALING;
  }

  public static calculateIncomingDocStackQuantity(params: {
    currentPayment: Payment, incomingPayment: Partial<Payment>, totalDocStackUsed: number,
  }): number {
    const { currentPayment, incomingPayment, totalDocStackUsed } = params;
    const {
      type: currentPlan,
      period: currentPeriod,
      quantity: currentQuantity,
      status: currentStatus,
    } = currentPayment;
    const { type: incomingPlan, period: incomingPeriod } = incomingPayment;
    if (DocStackUtils.isOldPermiumOrganization(currentPlan as PaymentPlanEnums)) {
      return INITIAL_DOC_STACK_QUANTITY;
    }
    const initialIncomingDocStack = planPoliciesHandler.from({ plan: incomingPlan, period: incomingPeriod }).getDocStack();
    if (this.isTrialing(currentStatus as PaymentStatusEnums)) {
      if (initialIncomingDocStack >= totalDocStackUsed) {
        return INITIAL_DOC_STACK_QUANTITY;
      }
      return Math.ceil(totalDocStackUsed / initialIncomingDocStack);
    }

    const isUpgradeDocStack = incomingPlan === currentPlan && incomingPeriod === currentPeriod;
    if (isUpgradeDocStack) {
      return Number(currentQuantity) + 1;
    }
    const currentDocStack = planPoliciesHandler.from({ plan: currentPlan, period: currentPeriod }).getDocStack(currentQuantity);
    if (initialIncomingDocStack >= currentDocStack) {
      return INITIAL_DOC_STACK_QUANTITY;
    }
    return Math.ceil(currentDocStack / initialIncomingDocStack);
  }

  public static shouldAutoUpgradePlan(organization: IOrganization): boolean {
    const { settings, payment } = organization;
    const { type: plan } = payment;
    const { autoUpgrade } = settings;
    return plan !== PaymentPlanEnums.FREE && autoUpgrade;
  }

  public static getEventDocStack({ plan, period, quantity }: { plan: string, period: PaymentPeriodEnums, quantity: number }): number {
    if (![PaymentPlanEnums.ORG_STARTER, PaymentPlanEnums.ORG_PRO, PaymentPlanEnums.ORG_BUSINESS].includes(plan as PaymentPlanEnums)) {
      return 0;
    }
    const newDocstack = planPoliciesHandler
      .from({ plan, period })
      .getDocStack(quantity);
    return newDocstack;
  }
}
