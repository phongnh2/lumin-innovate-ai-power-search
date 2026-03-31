import { ICustomerInfo, IPaymentMethod } from 'interfaces/payment/payment.interface';

export enum BILLING_FORM_STEP {
  WORKSPACE_INFO = 1,
  PAYMENT_ELEMENT_FORM = 2,
}

export interface IPaymentCardInfo {
  isLoading: boolean;
  customerInfo: ICustomerInfo;
  currentPaymentMethod: IPaymentMethod;
}
