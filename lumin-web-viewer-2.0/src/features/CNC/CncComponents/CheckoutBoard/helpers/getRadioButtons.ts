import { TFunction } from 'i18next';

import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';

import { PERIOD, Plans } from 'constants/plan';

export const getRadioButtons = ({ t }: { t: TFunction }) => [
  {
    value: PERIOD.ANNUAL,
    label: t('freeTrialPage.payYearly'),
    name: CNCButtonName.NEW_CHECKOUT_PAGE_PERIOD_SWITCH_YEARLY,
    purpose: CNCButtonPurpose[CNCButtonName.NEW_CHECKOUT_PAGE_PERIOD_SWITCH_YEARLY],
    showDiscount: true,
  },
  {
    value: PERIOD.MONTHLY,
    label: t('freeTrialPage.payMonthly'),
    name: CNCButtonName.NEW_CHECKOUT_PAGE_PERIOD_SWITCH_MONTHLY,
    purpose: CNCButtonPurpose[CNCButtonName.NEW_CHECKOUT_PAGE_PERIOD_SWITCH_MONTHLY],
    showDiscount: false,
  },
];

export const getPlanRadioButtons = ({ t, _plan, _trial }: { t: TFunction; _plan: string; _trial: string }) => {
  const isTrial = _trial === 'true';
  if (_plan === Plans.ORG_STARTER || (_plan === Plans.ORG_PRO && isTrial)) {
    return [
      {
        value: Plans.ORG_STARTER,
        label: 'Starter',
        isTrial: false,
        name: CNCButtonName.NEW_CHECKOUT_PAGE_PLAN_SWITCH_STARTER,
        purpose: CNCButtonPurpose[CNCButtonName.NEW_CHECKOUT_PAGE_PLAN_SWITCH_STARTER],
      },
      {
        value: Plans.ORG_PRO,
        label: t('common.proFreeTrial'),
        isTrial: true,
        name: CNCButtonName.NEW_CHECKOUT_PAGE_PLAN_SWITCH_PRO_TRIAL,
        purpose: CNCButtonPurpose[CNCButtonName.NEW_CHECKOUT_PAGE_PLAN_SWITCH_PRO_TRIAL],
      },
    ];
  }
  return [
    {
      value: Plans.ORG_PRO,
      label: 'Pro',
      isTrial: false,
      name: CNCButtonName.NEW_CHECKOUT_PAGE_PLAN_SWITCH_PRO,
      purpose: CNCButtonPurpose[CNCButtonName.NEW_CHECKOUT_PAGE_PLAN_SWITCH_PRO],
    },
    {
      value: Plans.ORG_BUSINESS,
      label: t('common.businessFreeTrial'),
      isTrial: true,
      name: CNCButtonName.NEW_CHECKOUT_PAGE_PLAN_SWITCH_BUSINESS_TRIAL,
      purpose: CNCButtonPurpose[CNCButtonName.NEW_CHECKOUT_PAGE_PLAN_SWITCH_BUSINESS_TRIAL],
    },
  ];
};
