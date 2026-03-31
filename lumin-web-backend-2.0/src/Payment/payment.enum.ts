import { PriceVersion, UnifySubscriptionPlan } from 'graphql.schema';

export enum PaymentTypeEnums {
  INDIVIDUAL = 'INDIVIDUAL',
  TEAM = 'TEAM',
  ORGANIZATION = 'ORGANIZATION',
}

export enum PaymentPlanConvertTeamToOrganizationEnums {
  TEAM_TO_ORGANIZATION_MONTHLY = 'TEAM',
  TEAM_TO_ORGANIZATION_ANNUAL = 'TEAM_TO_ORGANIZATION',
}

export const OldTeamPlanName = [
  'STRIPE_TEAM_MONTHLY_USD',
  'STRIPE_TEAM_MONTHLY_NZD',
  'STRIPE_TEAM_MONTHLY_CAD',
  'STRIPE_TEAM_MONTHLY_EUR',
  'STRIPE_TEAM_ANNUAL_USD',
  'STRIPE_TEAM_ANNUAL_NZD',
  'STRIPE_TEAM_ANNUAL_CAD',
  'STRIPE_TEAM_ANNUAL_EUR',
  'STRIPE_TEAM_TO_ORGANIZATION_ANNUAL_USD',
  'STRIPE_TEAM_TO_ORGANIZATION_ANNUAL_NZD',
  'STRIPE_TEAM_TO_ORGANIZATION_ANNUAL_CAD',
  'STRIPE_TEAM_TO_ORGANIZATION_ANNUAL_EUR',
];

export const NewPlans = [
  'STRIPE_BUSINESS_MONTHLY_EUR',
  'STRIPE_BUSINESS_MONTHLY_USD',
  'STRIPE_BUSINESS_MONTHLY_CAD',
  'STRIPE_BUSINESS_MONTHLY_NZD',
  'STRIPE_BUSINESS_ANNUAL_USD',
  'STRIPE_BUSINESS_ANNUAL_NZD',
  'STRIPE_BUSINESS_ANNUAL_CAD',
  'STRIPE_BUSINESS_ANNUAL_EUR',
  'STRIPE_PROFESSIONAL_ANNUAL_CAD',
  'STRIPE_PROFESSIONAL_ANNUAL_EUR',
  'STRIPE_PROFESSIONAL_ANNUAL_NZD',
  'STRIPE_PROFESSIONAL_ANNUAL_USD',
  'STRIPE_PROFESSIONAL_MONTHLY_CAD',
  'STRIPE_PROFESSIONAL_MONTHLY_EUR',
  'STRIPE_PROFESSIONAL_MONTHLY_NZD',
  'STRIPE_PROFESSIONAL_MONTHLY_USD',
];

// Those below plans are of pricing refactor
export const NewPricingPlansV3 = [
  'STRIPE_ORG_STARTER_MONTHLY_USD',
  'STRIPE_ORG_STARTER_MONTHLY_EUR',
  'STRIPE_ORG_STARTER_MONTHLY_CAD',
  'STRIPE_ORG_STARTER_MONTHLY_NZD',

  'STRIPE_ORG_STARTER_ANNUAL_USD',
  'STRIPE_ORG_STARTER_ANNUAL_EUR',
  'STRIPE_ORG_STARTER_ANNUAL_CAD',
  'STRIPE_ORG_STARTER_ANNUAL_NZD',

  'STRIPE_ORG_PRO_MONTHLY_USD',
  'STRIPE_ORG_PRO_MONTHLY_EUR',
  'STRIPE_ORG_PRO_MONTHLY_CAD',
  'STRIPE_ORG_PRO_MONTHLY_NZD',

  'STRIPE_ORG_PRO_ANNUAL_USD',
  'STRIPE_ORG_PRO_ANNUAL_EUR',
  'STRIPE_ORG_PRO_ANNUAL_CAD',
  'STRIPE_ORG_PRO_ANNUAL_NZD',

  'STRIPE_ORG_BUSINESS_MONTHLY_USD',
  'STRIPE_ORG_BUSINESS_MONTHLY_EUR',
  'STRIPE_ORG_BUSINESS_MONTHLY_CAD',
  'STRIPE_ORG_BUSINESS_MONTHLY_NZD',

  'STRIPE_ORG_BUSINESS_ANNUAL_USD',
  'STRIPE_ORG_BUSINESS_ANNUAL_EUR',
  'STRIPE_ORG_BUSINESS_ANNUAL_CAD',
  'STRIPE_ORG_BUSINESS_ANNUAL_NZD',

  'STRIPE_US_ACCOUNT_ORG_STARTER_MONTHLY_USD',
  'STRIPE_US_ACCOUNT_ORG_STARTER_ANNUAL_USD',
  'STRIPE_US_ACCOUNT_ORG_PRO_MONTHLY_USD',
  'STRIPE_US_ACCOUNT_ORG_PRO_ANNUAL_USD',
  'STRIPE_US_ACCOUNT_ORG_BUSINESS_MONTHLY_USD',
  'STRIPE_US_ACCOUNT_ORG_BUSINESS_ANNUAL_USD',
];

export const PlanVersioning = {
  [PriceVersion.V1]: NewPlans.map((plan) => `${plan}_v1`),
  [PriceVersion.V2]: NewPlans,
  [PriceVersion.V3]: NewPricingPlansV3,
};

export enum PaymentPlanEnums {
  FREE = 'FREE',
  PERSONAL = 'PERSONAL',
  PROFESSIONAL = 'PROFESSIONAL',
  TEAM = 'TEAM',
  ENTERPRISE = 'ENTERPRISE',
  BUSINESS = 'BUSINESS',
  ORG_STARTER = 'ORG_STARTER',
  ORG_PRO = 'ORG_PRO',
  ORG_BUSINESS = 'ORG_BUSINESS',
  ORG_SIGN_PRO = 'ORG_SIGN_PRO'
}

export type OrganizationPlans = PaymentPlanEnums.FREE
  | PaymentPlanEnums.BUSINESS
  | PaymentPlanEnums.ENTERPRISE
  | PaymentPlanEnums.ORG_STARTER
  | PaymentPlanEnums.ORG_PRO
  | PaymentPlanEnums.ORG_BUSINESS;

export enum PaymentProductEnums {
  SIGN = 'SIGN',
  PDF = 'PDF',
}

export enum PaymentStatusEnums {
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  UPGRADING = 'UPGRADING',
  UNPAID = 'UNPAID',
}

export enum PaymentPeriodEnums {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

export enum PaymentIntervalEnums {
  MONTH = 'month',
  YEAR = 'year',
}

export enum PaymentCurrencyEnums {
  CAD = 'CAD',
  EUR = 'EUR',
  NZD = 'NZD',
  USD = 'USD',
}

export enum FreeTrialType {
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
}

/**
 * https://stripe.com/docs/billing/subscriptions/overview#subscription-lifecycle
 */

export enum SubscriptionStatus {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
}

export enum BillingReason {
  SUBSCRIPTION_CREATE = 'subscription_create',
  SUBSCRIPTION_UPDATE = 'subscription_update',
  SUBSCRIPTION_CYCLE = 'subscription_cycle',
}

export enum PlanCancelReason {
  PAYMENT_FAILED = 'payment_failed',
  USER_CANCELED = 'user_canceled',
  ADMIN_CANCELED = 'admin_canceled',
}
export enum CollectionMethod {
  SEND_INVOICE = 'send_invoice',
  CHARGE_AUTOMATICALLY = 'charge_automatically',
}
export enum StripeDeclineCodeEnums {
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  EXPIRED_CARD = 'expired_card',
  GENERIC_DECLINE = 'generic_decline',
  STOLEN_CARD = 'stolen_card',
  RESTRICTED_CARD = 'restricted_card',
  PAYMENT_METHOD_NOT_FOUND = 'payment_method_not_found',
}
export enum StripePaymentHook {
  CHARGE_SUCCEEDED = 'charge.succeeded',
  CHARGE_FAILED = 'charge.failed',
  CUSTOMER_SUBSCRIPTION_CREATED = 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED = 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED = 'customer.subscription.deleted',
  INVOICE_CREATED = 'invoice.created',
  INVOICE_FINALIZED = 'invoice.finalized',
  INVOICE_PAYMENT_SUCCEEDED = 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED = 'invoice.payment_failed',
  RADAR_EARLY_FRAUD_WARNING_CREATED = 'radar.early_fraud_warning.created'
}
export type StripePaymentHookString = StripePaymentHook[keyof StripePaymentHook]
export enum InvoiceStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PAID = 'paid'
}
export enum CancelFreeTrialReason {
  USER_CANCEL = 'user_cancel',
  ORGANIZATION_CANCEL = 'organization_cancel',
  JOIN_ORGANIZATION = 'join_organization',
}
export enum IntentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum PlanRules {
  DOC_STACK = 'docStack',
  MAX_DOC_STACK = 'maxDocStack',
  SIGNATURES = 'signatures',
  SIGNED_DOC = 'signedDoc',
  FORM_BUIDLER = 'formBuilder',
  AUTO_SYNC = 'autoSync',
  EDIT_PDF_CONTENT = 'editPDFContent',
  SPLIT_PAGE = 'splitPage',
  MERGE_PAGE = 'mergePage',
  ROTATE_PAGE = 'rotatePage',
  MOVE_PAGE = 'movePage',
  DELETE_PAGE = 'deletePage',
  INSERT_PAGE = 'insertPage',
  CROP_PAGE = 'cropPage',
  HIGHLIGH_PDF = 'highlight',
  FREE_HAND = 'freeHand',
  FREE_TEXT = 'freeText',
  REDACTION = 'redaction',
  SHAPE = 'shape',
  STAMP = 'stamp',
  TEXT_TOOL = 'textTool',
  COMMENT = 'comment',
  ERASER = 'eraser',
  DOC_SIZE = 'docSize',
  WATERMARK = 'watermark',
}

export enum PaymentIntentStatusEnums {
  REQUIRE_PAYMENT_METHOD = 'requires_payment_method',
}

export enum DocStackPlanEnums {
  ORG_STARTER = 'ORG_STARTER',
  ORG_PRO = 'ORG_PRO',
  ORG_BUSINESS = 'ORG_BUSINESS',
}

export enum UpgradeInvoicePlanEnums {
  ORG_STARTER = 'ORG_STARTER',
  ORG_PRO = 'ORG_PRO',
  ORG_BUSINESS = 'ORG_BUSINESS',
  ENTERPRISE = 'ENTERPRISE'
}

export enum StripeAccountNameEnums {
  NZ_ACCOUNT = 'NZ_ACCOUNT',
  US_ACCOUNT = 'US_ACCOUNT',
}

export enum StripePaymentMethodTypeEnums {
  CARD = 'card',
  LINK = 'link',
  CASHAPP = 'cashapp'
}

export const SUPPORTED_PAYMENT_METHOD_TYPES = [
  StripePaymentMethodTypeEnums.CARD, StripePaymentMethodTypeEnums.LINK, StripePaymentMethodTypeEnums.CASHAPP,
];

export const ProductPlans = {
  [PaymentProductEnums.PDF]: [UnifySubscriptionPlan.ORG_STARTER, UnifySubscriptionPlan.ORG_PRO, UnifySubscriptionPlan.ORG_BUSINESS],
  [PaymentProductEnums.SIGN]: [UnifySubscriptionPlan.ORG_SIGN_PRO],
};

export enum UpdateSignWsPaymentActions {
  ASSIGN_SEAT = 'ASSIGN_SEAT',
  UNASSIGN_SEAT = 'UNASSIGN_SEAT',
  REACTIVATE_SUBSCRIPTION = 'REACTIVATE_SUBSCRIPTION',
  RENEW_SUCCESS_SUBSCRIPTION = 'RENEW_SUCCESS_SUBSCRIPTION',
  CANCELED_SUBSCRIPTION = 'CANCELED_SUBSCRIPTION',
  REJECT_SIGN_SEAT_REQUEST = 'REJECT_SIGN_SEAT_REQUEST',
}

export enum ProductTiers {
  Starter = 'starter',
  Pro = 'pro',
  Business = 'business',
}
