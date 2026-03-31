export const CURRENCY = {
  USD: { name: 'USD', value: 'USD', note: 'US Dollar' },
  NZD: { name: 'NZD', value: 'NZD', note: 'New Zealand Dollar' },
  CAD: { name: 'CAD', value: 'CAD', note: 'Canadian Dollar' },
  EUR: { name: 'EUR', value: 'EUR', note: 'Euro' },
};

export const PAYMENT_DECLINED_CODE = {
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  EXPIRED_CARD: 'expired_card',
  GENERIC_DECLINE: 'generic_decline',
  STOLEN_CARD: 'stolen_card',
  RESTRICTED_CARD: 'restricted_card',
  INCORRECT_CVC: 'incorrect_cvc',
  PAYMENT_METHOD_NOT_FOUND: 'payment_method_not_found',
};

export const BillingWarningType = {
  RENEW_ATTEMPT: 'RENEW_ATTEMPT',
  SUBSCRIPTION_REMAINING_DATE: 'SUBSCRIPTION_REMAINING_DATE',
  UNPAID_SUBSCRIPTION: 'UNPAID_SUBSCRIPTION',
};

export const FREE_TRIAL_DAYS = 7;

export const PAYMENT_CREDENTIAL_ISSUER = {
  PAYMENT_METHOD: 'PAYMENT_METHOD',
  SOURCE_TOKEN: 'SOURCE_TOKEN',
};
export const DEFAULT_FREE_TRIAL_CURRENCY = CURRENCY.USD.value;

export const FREE_USER_SIGN_PAYMENT = {
  customerId: null,
  subscriptionId: null,
  planId: null,
  type: 'FREE',
  period: null,
  status: null,
  quantity: null,
  currency: null,
};
