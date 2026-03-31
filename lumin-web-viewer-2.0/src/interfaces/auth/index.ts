import { PaymentCurrency } from 'constants/plan.enum';

export interface ILocationCurrency {
  loading: boolean;
  value: typeof PaymentCurrency[keyof typeof PaymentCurrency];
}
