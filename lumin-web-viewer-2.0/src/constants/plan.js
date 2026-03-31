import capitalize from 'utils/capitalize';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { ORGANIZATION_TEXT } from 'constants/organizationConstants';

import { UnifySubscriptionPlan } from './organization.enum';

const Plans = {
  FREE: 'FREE',
  /**
   * @deprecated
   */
  FREE_TRIAL: 'FREE_TRIAL',
  PERSONAL: 'PERSONAL',
  PROFESSIONAL: 'PROFESSIONAL',
  /**
   * @deprecated
   */
  TEAM: 'TEAM',
  ENTERPRISE: 'ENTERPRISE',
  /**
   * @deprecated
   */
  PROMOTION: 'PROMOTION',
  BUSINESS: 'BUSINESS',
  ORG_STARTER: 'ORG_STARTER',
  ORG_PRO: 'ORG_PRO',
  ORG_BUSINESS: 'ORG_BUSINESS',
};

const PaymentTypes = {
  /**
   * @deprecated
   */
  INDIVIDUAL: 'INDIVIDUAL',
  /**
   * @deprecated
   */
  ORGANIZATION: 'ORGANIZATION',
  /**
   * @deprecated
   */
  FREE_TRIAL: 'FREE-TRIAL',
};

/**
 * @deprecated
 */
const PlanOptions = {
  /**
   * @deprecated
   */
  INDIVIDUAL: 'individual',
  /**
   * @deprecated
   */
  ORGANIZATION: `${ORGANIZATION_TEXT}`,
};

const PERIOD = {
  ANNUAL: 'ANNUAL',
  MONTHLY: 'MONTHLY',
};

const PeriodIndex = {
  [PERIOD.MONTHLY]: 10,
  [PERIOD.ANNUAL]: 20,
};

/**
 * @deprecated
 */
const PlanIndex = {
  [Plans.PERSONAL]: 10,
  [Plans.PROFESSIONAL]: 20,
};

const PERIOD_TEXT = {
  ANNUAL: 'year',
  MONTHLY: 'month',
};

const STATUS = {
  TRIALING: 'TRIALING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  CANCELED: 'CANCELED',
  UPGRADING: 'UPGRADING',
};

const PRICE = {
  FREE: 0,
  V1: {
    MONTHLY: {
      PROFESSIONAL: 10,
      BUSINESS: 10,
    },
    ANNUAL: {
      PROFESSIONAL: 79,
      BUSINESS: 79,
    },
  },
  V2: {
    MONTHLY: {
      PROFESSIONAL: 19,
      BUSINESS: 19,
    },
    ANNUAL: {
      PROFESSIONAL: 120,
      BUSINESS: 120,
    },
  },
  V3: {
    MONTHLY: {
      ORG_STARTER: 15,
      ORG_PRO: 30,
      ORG_BUSINESS: 150,
    },
    ANNUAL: {
      ORG_STARTER: 108,
      ORG_PRO: 228,
      ORG_BUSINESS: 1188,
    },
  },
};

const TEAM_CONVERT_TO_ORGANIZATION_PRICE = {
  MONTHLY: 5,
  ANNUAL: 30,
};

/**
 * @deprecated
 * Use `Plans` instead
 */
const PLAN_TYPE = {
  FREE: 'FREE',
  /**
   * @deprecated
   */
  FREE_TRIAL: 'FREE_TRIAL',
  /**
   * @deprecated
   */
  PREMIUM: 'PREMIUM',
  BUSINESS: 'BUSINESS',
  PROFESSIONAL: 'PROFESSIONAL',
  PERSONAL: 'PERSONAL',
  ENTERPRISE: 'ENTERPRISE',
  /**
   * @deprecated
   */
  NO_PLAN: 'ANONYMOUS',
  ORG_STARTER: 'ORG_STARTER',
  ORG_PRO: 'ORG_PRO',
  ORG_BUSINESS: 'ORG_BUSINESS',
  ORG_SIGN_PRO: 'ORG_SIGN_PRO',
};

const NEW_PRICING_PLAN_LIST = [PLAN_TYPE.ORG_STARTER, PLAN_TYPE.ORG_PRO, PLAN_TYPE.ORG_BUSINESS];

const ORG_PLAN_TYPE = {
  FREE: PLAN_TYPE.FREE,
  BUSINESS: PLAN_TYPE.BUSINESS,
  ENTERPRISE: PLAN_TYPE.ENTERPRISE,
  ORG_STARTER: PLAN_TYPE.ORG_STARTER,
  ORG_PRO: PLAN_TYPE.ORG_PRO,
  ORG_BUSINESS: PLAN_TYPE.ORG_BUSINESS,
};

const SORTED_ORG_PLAN_TYPE = {
  FREE: PLAN_TYPE.FREE,
  ORG_STARTER: PLAN_TYPE.ORG_STARTER,
  ORG_PRO: PLAN_TYPE.ORG_PRO,
  BUSINESS: PLAN_TYPE.BUSINESS,
  ENTERPRISE: PLAN_TYPE.ENTERPRISE,
  ORG_BUSINESS: PLAN_TYPE.ORG_BUSINESS,
};

// AS SMALL AS HIGHTER PLAN
// Free < Starter< Professional/Old Business/Old Enterprise <Pro/Business
const ORDINAL_PLAN_TYPE = {
  [Plans.ORG_BUSINESS]: 1,
  [Plans.ORG_PRO]: 1,
  [Plans.ENTERPRISE]: 2,
  [Plans.BUSINESS]: 3,
  [Plans.PROFESSIONAL]: 4,
  [Plans.ORG_STARTER]: 5,
  [Plans.FREE]: 6,
};

const PLAN_TYPE_LABEL = {
  FREE: 'Free',
  /**
   * @deprecated
   */
  FREE_TRIAL: 'Promotion',
  FREE_TRIAL_30: 'Free Trial',
  /**
   * @deprecated
   */
  PREMIUM: 'Premium',
  /**
   * @deprecated
   */
  TEAM: 'Business',
  BUSINESS: 'Business',
  PROFESSIONAL: 'Professional',
  PERSONAL: 'Personal',
  ENTERPRISE: 'Enterprise',
  /**
   * @deprecated
   */
  NO_PLAN: 'Anonymous',
  ORG_STARTER: 'Starter',
  ORG_PRO: 'Pro',
  ORG_BUSINESS: 'Business',
  ORG_SIGN_PRO: 'Pro',
};

const TOUR = 'tour';

const PAYMENT_TABS = [
  {
    id: PlanOptions.INDIVIDUAL,
    label: 'Individual',
    name: ButtonName.INDIVIDUAL_PLAN_SWITCH,
    purpose: ButtonPurpose[ButtonName.INDIVIDUAL_PLAN_SWITCH],
  },
  {
    id: PlanOptions.ORGANIZATION,
    label: capitalize(ORGANIZATION_TEXT),
    name: ButtonName.ORGANIZATION_PLAN_SWITCH,
    purpose: ButtonPurpose[ButtonName.ORGANIZATION_PLAN_SWITCH],
  },
];

const PRICING_VERSION = {
  V1: 'V1',
  V2: 'V2',
  V3: 'V3',
};

const PLAN_URL = {
  FREE: 'free',
  ORG_STARTER: 'starter',
  ORG_PRO: 'pro',
  ORG_BUSINESS: 'business',
  BUSINESS: 'old-business',
  ORG_SIGN_PRO: 'pro',
};

const DOC_STACK_BLOCK = {
  MONTHLY: {
    ORG_STARTER: 10,
    ORG_PRO: 30,
    ORG_BUSINESS: 200,
  },
  ANNUAL: {
    ORG_STARTER: 200,
    ORG_PRO: 200,
    ORG_BUSINESS: 200,
  },
};

const MAPPING_PLAN_URL_TO_PLAN_TYPE = {
  [PLAN_URL.ORG_STARTER]: PLAN_TYPE.ORG_STARTER,
  [PLAN_URL.ORG_PRO]: PLAN_TYPE.ORG_PRO,
  [PLAN_URL.ORG_BUSINESS]: PLAN_TYPE.ORG_BUSINESS,
  [PLAN_URL.ORG_SIGN_PRO]: PLAN_TYPE.ORG_SIGN_PRO,
};

const PLAN_CHIP_COLORS = {
  [Plans.FREE]: {
    backgroundColor: 'var(--kiwi-colors-custom-brand-tools-split-container)',
    color: 'var(--kiwi-colors-custom-brand-tools-on-split-container)',
  },
  [Plans.ORG_STARTER]: {
    backgroundColor: 'var(--kiwi-colors-custom-brand-tools-esign-container)',
    color: 'var(--kiwi-colors-custom-brand-tools-on-esign-container)',
  },
  [Plans.ORG_PRO]: {
    backgroundColor: 'var(--kiwi-colors-custom-brand-tools-fillableform-container)',
    color: 'var(--kiwi-colors-custom-brand-tools-on-fillableform-container)',
  },
  [Plans.ORG_BUSINESS]: {
    backgroundColor: 'var(--kiwi-colors-custom-role-web-surface-blue-activated)',
    color: 'var(--kiwi-colors-core/on-primary-container)',
  },
  [Plans.BUSINESS]: {
    backgroundColor: 'var(--kiwi-colors-custom-brand-tools-compress-container)',
    color: 'var(--kiwi-colors-custom-brand-tools-on-compress-container)',
  },
  [Plans.PERSONAL]: {
    backgroundColor: 'var(--kiwi-colors-custom-brand-tools-convert-container)',
    color: 'var(--kiwi-colors-custom-brand-tools-on-convert-container)',
  },
  [Plans.ENTERPRISE]: {
    backgroundColor: 'var(--kiwi-colors-custom-brand-tools-collaboration-container)',
    color: 'var(--kiwi-colors-custom-brand-tools-on-collaboration-container)',
  },
  [Plans.PROFESSIONAL]: {
    backgroundColor: 'var(--kiwi-colors-custom-brand-sign-inverse-on-sign-surface)',
    color: 'var(--kiwi-colors-custom-brand-sign-on-sign-container)',
  },
};

const PREMIUM_PLANS = [
  UnifySubscriptionPlan.ORG_SIGN_PRO,
  UnifySubscriptionPlan.ORG_STARTER,
  UnifySubscriptionPlan.ORG_PRO,
  UnifySubscriptionPlan.ORG_BUSINESS,
];

const OLD_BUSINESS_PLANS = [Plans.BUSINESS, Plans.ENTERPRISE];

const PERSONAL_PLANS = [Plans.PROFESSIONAL, Plans.PERSONAL];

export {
  Plans,
  PlanOptions,
  PRICE,
  PERIOD,
  STATUS,
  PERIOD_TEXT,
  TEAM_CONVERT_TO_ORGANIZATION_PRICE,
  PLAN_TYPE,
  PaymentTypes,
  PeriodIndex,
  PlanIndex,
  PLAN_TYPE_LABEL,
  TOUR,
  PAYMENT_TABS,
  ORG_PLAN_TYPE,
  SORTED_ORG_PLAN_TYPE,
  PRICING_VERSION,
  NEW_PRICING_PLAN_LIST,
  PLAN_URL,
  DOC_STACK_BLOCK,
  MAPPING_PLAN_URL_TO_PLAN_TYPE,
  ORDINAL_PLAN_TYPE,
  PLAN_CHIP_COLORS,
  PREMIUM_PLANS,
  PERSONAL_PLANS,
  OLD_BUSINESS_PLANS,
};
