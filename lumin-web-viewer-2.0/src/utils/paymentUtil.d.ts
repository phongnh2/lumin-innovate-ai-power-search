import { PaymentCurrency, PaymentPeriod, PaymentPlans, PaymentStatus } from 'constants/plan.enum';

type GetNextDocStackPayload = {
  nextDocStack: number;
  totalBlock: number;
};

type GetNextDocStackParams = {
  quantity?: number;
  currentPlan: PaymentPlans;
  currentPeriod: PaymentPeriod;
  currentStatus: PaymentStatus;
  nextPlan: PaymentPlans;
  nextPeriod: PaymentPeriod;
  totalDocStackUsed: number;
};

declare namespace paymentUtil {
  export function getNextDocStack(params: GetNextDocStackParams): GetNextDocStackPayload;
  export function convertCurrencySymbol(currency: PaymentCurrency): '$' | '€';
  export function getOrganizationPrice(params: {
    plan: PaymentPlans;
    period: PaymentPeriod;
    quantity: number;
    isConvertedFromTeam: boolean;
  }): number;

  export function getNextBillingDateFreeTrial(): string;
}

export default paymentUtil;
