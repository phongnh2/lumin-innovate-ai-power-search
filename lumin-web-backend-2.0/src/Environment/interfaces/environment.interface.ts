import {
  PaymentPeriod,
  Currency,
  PaymentPlanSubscription,
  CreateOrganizationSubscriptionPlans,
  UpgradeOrganizationSubscriptionPlans,
  DocStackPlan,
  OldPlans,
  PriceVersion,
  UnifySubscriptionPlan,
} from 'graphql.schema';
import {
  PaymentCurrencyEnums, PaymentPeriodEnums, PaymentPlanConvertTeamToOrganizationEnums, PaymentPlanEnums, StripeAccountNameEnums,
} from 'Payment/payment.enum';

export interface GetStripePlanParam {
  plan:
    PaymentPlanEnums |
    PaymentPlanSubscription |
    PaymentPlanConvertTeamToOrganizationEnums |
    CreateOrganizationSubscriptionPlans |
    UpgradeOrganizationSubscriptionPlans |
    DocStackPlan |
    UnifySubscriptionPlan |
    OldPlans;
  period: PaymentPeriodEnums | PaymentPeriod;
  currency: PaymentCurrencyEnums | Currency;
  stripeAccountName?: StripeAccountNameEnums;
  discount?: boolean;
  priceVersion?: PriceVersion;
}
