import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

import { numberUtils, paymentUtil } from 'utils';
import date from 'utils/date';

import { PaymentCurrency } from 'constants/plan.enum';

import { GetUnifySubscriptionData } from 'interfaces/payment/payment.interface';

import styles from './SubscriptionHeaderInfo.module.scss';

type SubscriptionHeaderInfoProps = {
  currency: PaymentCurrency;
  upcomingInvoice: GetUnifySubscriptionData['upcomingInvoice'];
};

const SubscriptionHeaderInfo = ({ currency, upcomingInvoice }: SubscriptionHeaderInfoProps) => {
  const { t } = useTranslation();

  const nextBilling = date.formatMDYTime((upcomingInvoice?.nextInvoice || 0) * 1000);
  const currencySymbol = paymentUtil.convertCurrencySymbol(currency);
  const upcomingAmount = `${currencySymbol}${numberUtils.formatDecimal((upcomingInvoice?.amount || 0) / 100)}`;

  return (
    <div className={styles.container}>
      <h3 className={styles.header}>{t('unifyBillingSettings.subscription')}</h3>
      <p className={styles.description}>
        {t('unifyBillingSettings.manageSubs')}{' '}
        {upcomingInvoice && (
          <Trans
            i18nKey="unifyBillingSettings.nextBillingInfo"
            components={{
              b: <b className="kiwi-message--primary" />,
            }}
            values={{
              amount: upcomingAmount,
              date: nextBilling,
            }}
          />
        )}
      </p>
    </div>
  );
};

export default SubscriptionHeaderInfo;
