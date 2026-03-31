import React from 'react';
import { Trans } from 'react-i18next';

import { paymentUtil, numberUtils, dateUtil } from 'utils';

import { FREE_TRIAL_DAYS } from 'constants/paymentConstant';
import { PRICE } from 'constants/plan';
import { PaymentPeriod, PaymentPlans } from 'constants/plan.enum';

interface GetNextBillingDescProps {
  isFreeTrial: boolean;
  isMonthly: boolean;
  period: PaymentPeriod;
  plan: PaymentPlans;
  showCreditBalanceDesc: boolean;
  canClaimTrial: boolean;
  nextBilling: {
    creditBalance: number;
    price: number;
    time: number;
  };
  tempBillingText: {
    currencySymbol: string;
  };
}

export const getNextBillingDesc = ({
  isFreeTrial,
  isMonthly,
  period,
  plan,
  showCreditBalanceDesc,
  canClaimTrial,
  nextBilling,
  tempBillingText,
}: GetNextBillingDescProps) => {
  if (isFreeTrial) {
    return (
      <>
        <Trans
          i18nKey={isMonthly ? 'freeTrialPage.infoBillingMonth' : 'freeTrialPage.infoBillingYear'}
          components={{ b: <b /> }}
          values={{
            days: FREE_TRIAL_DAYS,
            nextDate: paymentUtil.getNextBillingDateFreeTrial(),
            currencySymbol: tempBillingText.currencySymbol,
            price: numberUtils.formatDecimal((PRICE.V3[period] as Record<PaymentPlans, number>)[plan]),
          }}
        />
        {Boolean(showCreditBalanceDesc) && canClaimTrial && (
          <Trans
            i18nKey="payment.infoUnusedPreviousPlan"
            components={{ b: <b /> }}
            values={{
              currencySymbol: tempBillingText.currencySymbol,
              creditBalance: numberUtils.formatDecimal(nextBilling.creditBalance / 100),
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Trans
        i18nKey="payment.infoNextBillingCycle"
        components={{ b: <b /> }}
        values={{
          currencySymbol: tempBillingText.currencySymbol,
          price: numberUtils.formatDecimal(nextBilling.price),
          time: dateUtil.formatMDYTime(nextBilling.time),
        }}
      />
      {Boolean(showCreditBalanceDesc) && (
        <Trans
          i18nKey="payment.infoUnusedPreviousPlan"
          components={{ b: <b /> }}
          values={{
            currencySymbol: tempBillingText.currencySymbol,
            creditBalance: nextBilling.creditBalance,
          }}
        />
      )}
    </>
  );
};
