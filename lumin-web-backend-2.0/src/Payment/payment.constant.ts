import {
  UnifySubscriptionPlan,
  UnifySubscriptionProduct,
} from 'graphql.schema';

import { ProductTiers } from './payment.enum';

export const PRODUCT_QUERY_PARAM_MAPPING = {
  [UnifySubscriptionProduct.PDF]: 'pdf',
  [UnifySubscriptionProduct.SIGN]: 'sign',
};

export const PRODUCT_TIER_MAPPING = {
  [UnifySubscriptionPlan.ORG_STARTER]: ProductTiers.Starter,
  [UnifySubscriptionPlan.ORG_PRO]: ProductTiers.Pro,
  [UnifySubscriptionPlan.ORG_BUSINESS]: ProductTiers.Business,
  [UnifySubscriptionPlan.ORG_SIGN_PRO]: ProductTiers.Pro,
};
