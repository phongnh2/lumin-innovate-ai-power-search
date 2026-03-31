import { PaymentUrlSerializer } from 'utils/payment';

import { PERIOD, Plans } from 'constants/plan';

import { PremiumModalContentType } from 'interfaces/organization/organization.interface';
import { ITrialInfo } from 'interfaces/payment/payment.interface';

const getPlanFromTrialInfo = (
  { canUseProTrial, canUseBusinessTrial }: Partial<ITrialInfo> = { canUseProTrial: false, canUseBusinessTrial: false }
) => {
  if (canUseProTrial) {
    return Plans.ORG_PRO;
  }

  if (canUseBusinessTrial) {
    return Plans.ORG_BUSINESS;
  }

  return Plans.ORG_PRO;
};

export const getFreeTrialUrl = (orgId: string) => {
  const paymentUrlSerializer = new PaymentUrlSerializer();
  return paymentUrlSerializer.of(orgId).plan(Plans.ORG_PRO).trial(true).period(PERIOD.ANNUAL).returnUrlParam().get();
};

export const getPaymentUrl = ({ orgId, trialInfo }: { orgId: string; trialInfo?: Partial<ITrialInfo> }) => {
  if (!trialInfo) {
    return '';
  }

  const paymentUrlSerializer = new PaymentUrlSerializer();
  const plan = getPlanFromTrialInfo(trialInfo);
  return paymentUrlSerializer.of(orgId).plan(plan).trial(false).period(PERIOD.ANNUAL).returnUrlParam().get();
};

const getOldPlanPaymentUrl = () => {
  const paymentUrlSerializer = new PaymentUrlSerializer();
  return paymentUrlSerializer.plan(Plans.ORG_PRO).trial(false).period(PERIOD.ANNUAL).returnUrlParam().get();
};

export const getPremiumModalContent = ({
  orgId,
  trialInfo = {},
  isOldPlan = false,
}: {
  orgId: string;
  trialInfo?: Partial<ITrialInfo>;
  isOldPlan?: boolean;
}): PremiumModalContentType => ({
  title: 'viewer.upgradeToAccess',
  ...(trialInfo.canUseProTrial
    ? {
        message: 'viewer.freeTrialSevenDays',
        startTrialButton: {
          label: 'common.startFreeTrial',
          link: getFreeTrialUrl(orgId),
        },
      }
    : {
        message: 'viewer.levelUpToUnlock',
      }),
  upgradeButton: isOldPlan
    ? {
        label: 'common.upgradeNow',
        link: getOldPlanPaymentUrl(),
      }
    : {
        label: 'common.goPro',
        link: getPaymentUrl({ orgId, trialInfo }),
      },
});
