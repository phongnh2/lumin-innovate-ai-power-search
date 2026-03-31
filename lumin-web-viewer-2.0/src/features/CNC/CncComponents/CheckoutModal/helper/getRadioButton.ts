import { TFunction } from 'i18next';

import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';

import { NUMBER_OF_MONTHS_IN_YEAR } from 'constants/commonConstant';
import { DOC_STACK_BLOCK, PERIOD, PRICE } from 'constants/plan';

import { OrgPlan } from '../interface';

export const getRadioButtons = ({
  t,
  currencySymbol,
  plan,
}: {
  t: TFunction;
  currencySymbol: string;
  plan: OrgPlan;
}) => [
  {
    value: PERIOD.MONTHLY,
    label: t('freeTrialPage.monthly'),
    name: CNCButtonName.NEW_CHECKOUT_PAGE_PERIOD_SWITCH_MONTHLY,
    purpose: CNCButtonPurpose[CNCButtonName.NEW_CHECKOUT_PAGE_PERIOD_SWITCH_MONTHLY],
    showDiscount: false,
    description: {
      price: t('payment.pricePerUnit', { currencySymbol, priceUnit: PRICE.V3.MONTHLY[plan] }),
      documents: t('payment.nextDocStack', { nextDocStack: DOC_STACK_BLOCK.MONTHLY[plan] }),
    },
    unitPrice: PRICE.V3.MONTHLY[plan],
  },
  {
    value: PERIOD.ANNUAL,
    label: t('freeTrialPage.annual'),
    name: CNCButtonName.NEW_CHECKOUT_PAGE_PERIOD_SWITCH_YEARLY,
    purpose: CNCButtonPurpose[CNCButtonName.NEW_CHECKOUT_PAGE_PERIOD_SWITCH_YEARLY],
    showDiscount: true,
    description: {
      price: t('payment.pricePerUnit', {
        currencySymbol,
        priceUnit: PRICE.V3.ANNUAL[plan] / NUMBER_OF_MONTHS_IN_YEAR,
      }),
      documents: t('payment.nextDocStack', { nextDocStack: DOC_STACK_BLOCK.ANNUAL[plan] }),
    },
    unitPrice: PRICE.V3.ANNUAL[plan] / NUMBER_OF_MONTHS_IN_YEAR,
  },
];
