export enum PaymentPeriod {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

export enum PaymentPlans {
  FREE = 'FREE',
  FREE_TRIAL = 'FREE_TRIAL',
  PERSONAL = 'PERSONAL',
  PROFESSIONAL = 'PROFESSIONAL',
  TEAM = 'TEAM',
  ENTERPRISE = 'ENTERPRISE',
  PROMOTION = 'PROMOTION',
  BUSINESS = 'BUSINESS',
  ORG_STARTER = 'ORG_STARTER',
  ORG_PRO = 'ORG_PRO',
  ORG_BUSINESS = 'ORG_BUSINESS',
}

export enum PriceVersion {
  V1 = 'V1',
  V2 = 'V2',
  V3 = 'V3',
}

export enum PaymentStatus {
  TRIALING = 'TRIALING',
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',
}

export enum PaymentCurrency {
  CAD = 'CAD',
  NZD = 'NZD',
  USD = 'USD',
  EUR = 'EUR',
}

export enum PaymentTypes {
  INDIVIDUAL = 'INDIVIDUAL',
  ORGANIZATION = 'ORGANIZATION',
}

export enum PaymentSignPlans {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export enum BillingWarningType {
  SUBSCRIPTION_REMAINING_DATE = 'SUBSCRIPTION_REMAINING_DATE',
  RENEW_ATTEMPT = 'RENEW_ATTEMPT',
}

export enum PaymentMethodTypeEnums {
  CARD = 'CARD',
  LINK = 'LINK',
  CASHAPP = 'CASHAPP',
}

export enum PlanTypeLabel {
  FREE = 'Free',
  /**
   * @deprecated
   */
  FREE_TRIAL = 'Promotion',
  FREE_TRIAL_30 = 'Free Trial',
  /**
   * @deprecated
   */
  PREMIUM = 'Premium',
  /**
   * @deprecated
   */
  TEAM = 'Business',
  BUSINESS = 'Business',
  PROFESSIONAL = 'Professional',
  PERSONAL = 'Personal',
  ENTERPRISE = 'Enterprise',
  PROMOTION = 'Promotion',
  /**
   * @deprecated
   */
  NO_PLAN = 'Anonymous',
  ORG_STARTER = 'Starter',
  ORG_PRO = 'Pro',
  ORG_BUSINESS = 'Business',
  ORG_SIGN_PRO = 'Pro',
}

export enum CardWallet {
  APPLE_PAY = 'APPLE_PAY',
  GOOGLE_PAY = 'GOOGLE_PAY',
}
