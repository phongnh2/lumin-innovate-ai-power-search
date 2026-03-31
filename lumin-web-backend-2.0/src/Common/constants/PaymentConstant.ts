import { UnifySubscriptionPlan } from 'graphql.schema';
import { PaymentPeriodEnums, PaymentPlanEnums } from 'Payment/payment.enum';

export const DEFAULT_TEAM_STORAGE = 10737418240; // 10GB
export const STORAGE_PER_MEMBER = 10737418240; // 10GB
export const PERSONAL_STORAGE = 10737418240; // 10GB

export const FREE = 'FREE';
export const MONTHLY = 'MONTHLY';
export const ANNUAL = 'ANNUAL';
export const INVOICE_UPCOMING_NONE = 'invoice_upcoming_none';
export const FREE_TRIAL_DAYS = 7;

export enum COUPON_DURATION_TYPE {
  FOREVER = 'forever',
  ONCE = 'once',
  REPEATING = 'repeating'
}

export const UNLIMITED_DOCUMENT_STACK = 9999;

export const FREE_30_DAYS_BUSINESS_COUPON_ID = 'FREE30';

export const ORG_PLAN_INDEX = {
  [PaymentPlanEnums.FREE]: 0,
  [PaymentPlanEnums.ORG_STARTER]: 1,
  [PaymentPlanEnums.ORG_PRO]: 2,
  [PaymentPlanEnums.ORG_BUSINESS]: 3,
};

export const ORG_SIGN_PLAN_INDEX = {
  [UnifySubscriptionPlan.ORG_SIGN_PRO]: 1,
};

export const PAYMENT_PERIOD_INDEX = {
  [PaymentPeriodEnums.MONTHLY]: 0,
  [PaymentPeriodEnums.ANNUAL]: 1,
};

export const PLAN_TEXT = {
  [PaymentPlanEnums.ORG_STARTER]: 'Starter',
  [PaymentPlanEnums.ORG_PRO]: 'Pro',
  [PaymentPlanEnums.ORG_BUSINESS]: 'Business',
  [PaymentPlanEnums.BUSINESS]: 'Business',
};

export const SIGN_PLAN_TEXT = {
  [UnifySubscriptionPlan.ORG_SIGN_PRO]: 'Pro',
};

export const DOC_STACK_PLAN = [PaymentPlanEnums.ORG_PRO, PaymentPlanEnums.ORG_BUSINESS, PaymentPlanEnums.ORG_STARTER, PaymentPlanEnums.FREE];

export const PLAN_URL = {
  FREE: 'free',
  ORG_STARTER: 'starter',
  ORG_PRO: 'pro',
  ORG_BUSINESS: 'business',
};

export const PAYMENT_SOURCE_REGEX_MATCHING = /^src_.*/;

export const PAYMENT_METHOD_REGEX_MATCHING = /^pm_.*/;

export const SOURCE_TOKEN_REGEX_MATCHING = /^tok_.*/;

export const PLAN_TEXT_EVENT = {
  ...PLAN_TEXT,
  [PaymentPlanEnums.FREE]: 'Free',
  [PaymentPlanEnums.BUSINESS]: 'Old Business',
  [PaymentPlanEnums.ENTERPRISE]: 'Old Enterprise',
  [PaymentPlanEnums.PERSONAL]: 'Personal',
  [PaymentPlanEnums.PROFESSIONAL]: 'Professional',
  [PaymentPlanEnums.TEAM]: 'Team',
};
