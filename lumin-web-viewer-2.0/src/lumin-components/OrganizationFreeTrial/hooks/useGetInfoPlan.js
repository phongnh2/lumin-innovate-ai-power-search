import { useMatchPaymentRoute, useTranslation } from 'hooks';

import { paymentUtil } from 'utils';

import { NUMBER_OF_MONTHS_IN_YEAR } from 'constants/commonConstant';
import { DOC_STACK_BLOCK, PERIOD, Plans, PRICE } from 'constants/plan';

const useGetInfoPlan = ({ currency, plan: planProps = null }) => {
  const { plan: planFromRoute } = useMatchPaymentRoute();
  const plan = planProps || planFromRoute;
  const currencySymbol = paymentUtil.convertCurrencySymbol(currency);
  const { t } = useTranslation();

  const getDescription = ({ period }) => {
    const priceUnit = PRICE.V3[period][plan] / (period === PERIOD.ANNUAL ? NUMBER_OF_MONTHS_IN_YEAR : 1);

    return {
      price: t('payment.pricePerUnit', { currencySymbol, priceUnit }),
      documents: t('payment.nextDocStack', { nextDocStack: DOC_STACK_BLOCK[period][plan] }),
    };
  };

  switch (plan) {
    case Plans.ORG_STARTER:
      return {
        text: t('freeTrialPage.descriptionBasic'),
        icon: 'lock',
        description: [getDescription({ period: PERIOD.MONTHLY }), getDescription({ period: PERIOD.ANNUAL })],
        unitPrice: PRICE.V3.ANNUAL.ORG_STARTER / NUMBER_OF_MONTHS_IN_YEAR,
      };
    case Plans.ORG_PRO:
      return {
        text: t('freeTrialPage.descriptionPremium'),
        icon: 'medal',
        description: [getDescription({ period: PERIOD.MONTHLY }), getDescription({ period: PERIOD.ANNUAL })],
        unitPrice: PRICE.V3.ANNUAL.ORG_PRO / NUMBER_OF_MONTHS_IN_YEAR,
      };
    default:
      return {
        text: t('freeTrialPage.descriptionAll'),
        icon: 'un-favorite',
        description: [getDescription({ period: PERIOD.MONTHLY }), getDescription({ period: PERIOD.ANNUAL })],
        unitPrice: PRICE.V3.ANNUAL.ORG_BUSINESS / NUMBER_OF_MONTHS_IN_YEAR,
      };
  }
};

export default useGetInfoPlan;
