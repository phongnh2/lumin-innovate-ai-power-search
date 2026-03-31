import { PaymentPlans } from 'constants/plan.enum';

import { IPayment } from 'interfaces/payment/payment.interface';

export interface SelectedOrgBilling {
  _id: string;
  type: string;
  plan: PaymentPlans;
  name: string;
  stripeAccountId: string;
  payment: IPayment;
}
