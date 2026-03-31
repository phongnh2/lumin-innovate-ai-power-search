import { ButtonColor } from 'luminComponents/ButtonMaterial';

import { Plans } from 'constants/plan';

import { PricingPlan } from '../types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    buttonVariant: 'filled',
    description: 'pricingModal.pro.planDescription',
    featuresKey: 'pricingModal.pro.features',
    isMostPopular: true,
    name: 'Pro',
    numberOfTrialDays: 7,
    plan: Plans.ORG_STARTER,
    buttonColor: ButtonColor.PRIMARY_RED,
  },
  {
    buttonVariant: 'tonal',
    description: 'pricingModal.business.planDescription',
    featuresKey: 'pricingModal.business.features',
    name: 'Business',
    numberOfTrialDays: 7,
    plan: Plans.ORG_PRO,
    buttonColor: ButtonColor.TERTIARY,
  },
];
