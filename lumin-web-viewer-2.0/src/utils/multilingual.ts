import { TFunction } from 'i18next';

import { PLAN_TYPE_LABEL, Plans } from 'constants/plan';
import { PaymentPlans } from 'constants/plan.enum';

export const getPlanDescription = ({ t, type }: { t: TFunction; type: PaymentPlans }): string => {
  if (type === Plans.FREE) {
    return t('common.freePlan');
  }

  return t('common.planDescription', { planType: PLAN_TYPE_LABEL[type as keyof typeof PLAN_TYPE_LABEL] });
};

export const getPdfPlanLabel = ({
  t,
  type,
  isTrial = false,
}: {
  t: TFunction;
  type: PaymentPlans;
  isTrial?: boolean;
}): string => {
  const planLabel = PLAN_TYPE_LABEL[type as keyof typeof PLAN_TYPE_LABEL];
  if (type === Plans.FREE) {
    return t('common.free');
  }
  if (!isTrial) {
    return planLabel;
  }
  return t('common.planTrial', { plan: planLabel });
};

export const getSignPlanLabel = ({ type }: { type: PaymentPlans }): string =>
  PLAN_TYPE_LABEL[type as keyof typeof PLAN_TYPE_LABEL];

export const getOldTermsContext = (isOldTerms?: boolean) => (isOldTerms ? 'old' : undefined);

export const getSignSeatLabel = ({ t, isSignProSeat }: { t: TFunction; isSignProSeat: boolean }): string =>
  isSignProSeat ? t('common.pro') : t('common.free');
