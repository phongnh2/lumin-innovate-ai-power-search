import { useTranslation } from 'hooks';

import { paymentUtil } from 'utils';

import { NUMBER_OF_MONTHS_IN_YEAR } from 'constants/commonConstant';
import { DOC_STACK_BLOCK, PERIOD, PRICE } from 'constants/plan';
import { PaymentCurrency, PaymentPeriod } from 'constants/plan.enum';

type PriceV3PlanType = keyof typeof PRICE.V3[PaymentPeriod];
type DocStackBlockPlanType = keyof typeof DOC_STACK_BLOCK;
type DocstackBlockPeriodType = keyof typeof DOC_STACK_BLOCK[PaymentPeriod];

const useGetInfoPlan = ({
  currency,
  plan,
  period,
}: {
  currency: PaymentCurrency;
  plan: string;
  period: PaymentPeriod;
}) => {
  const currencySymbol = paymentUtil.convertCurrencySymbol(currency);
  const { t } = useTranslation();

  const priceUnit =
    PRICE.V3[period][plan as PriceV3PlanType] / (period === PERIOD.ANNUAL ? NUMBER_OF_MONTHS_IN_YEAR : 1);

  return {
    price: `${currencySymbol}${priceUnit}`,
    documents: t('payment.nextDocStack', {
      nextDocStack: DOC_STACK_BLOCK[period as DocStackBlockPlanType][plan as DocstackBlockPeriodType],
    }),
  };
};

export default useGetInfoPlan;
