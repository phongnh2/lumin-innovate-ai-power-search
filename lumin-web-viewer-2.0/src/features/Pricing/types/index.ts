import { ButtonColor } from 'luminComponents/ButtonMaterial';

export type PricingPlan = {
  buttonVariant: 'filled' | 'tonal';
  buttonColor: ButtonColor;
  description: string;
  featuresKey: string;
  isMostPopular?: boolean;
  name: string;
  numberOfTrialDays: number;
  plan: string;
};
