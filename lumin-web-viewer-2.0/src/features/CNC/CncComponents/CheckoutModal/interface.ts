import { PaymentPlans } from 'constants/plan.enum';

import { ICustomerInfo, IPaymentMethod } from 'interfaces/payment/payment.interface';

export type PeriodType = {
  value: string;
  label: string;
  name: string;
  purpose: string;
  showDiscount: boolean;
  description: {
    price: string;
    documents: string;
  };
  unitPrice: number;
};

export interface IPaymentCardInfo {
  isLoading: boolean;
  customerInfo: ICustomerInfo;
  currentPaymentMethod: IPaymentMethod;
}

// Narrowing the type from the full PaymentPlans enum to a smaller subset (OrgPlan).
export type OrgPlan = PaymentPlans.ORG_PRO | PaymentPlans.ORG_BUSINESS;
