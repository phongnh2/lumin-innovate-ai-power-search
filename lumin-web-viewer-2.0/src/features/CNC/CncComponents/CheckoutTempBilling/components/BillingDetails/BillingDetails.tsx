import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { numberUtils } from 'utils';

import styles from '../../CheckoutTempBilling.module.scss';

interface BillingDetailsProps {
  isFreeTrial: boolean;
  textPeriod: string;
  discountDescription?: string;
  tempBillingText: {
    currencySymbol: string;
  };
  canUpgrade: boolean;
  total: number;
  remaining?: number;
  discount?: number;
  totalPrice: number;
}

const BillingDetails: React.FC<BillingDetailsProps> = ({
  isFreeTrial,
  textPeriod,
  discountDescription,
  tempBillingText,
  canUpgrade,
  total,
  remaining,
  discount,
  totalPrice,
}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.amount}>
      {!isFreeTrial && (
        <div className={styles.row}>
          <Text type="title" size="sm">
            {textPeriod}
            {Boolean(discountDescription) && t('payment.discountPeriodPlan', { discount: discountDescription })}
          </Text>
          <Text type="headline" size="lg">
            {tempBillingText.currencySymbol}
            {canUpgrade ? numberUtils.formatDecimal(total) : 0}
          </Text>
        </div>
      )}
      {Boolean(remaining) && canUpgrade && (
        <div className={styles.row}>
          <Text type="title" size="sm">
            {t('payment.unusedTimeOnPreviousPlan')}
          </Text>
          <Text type="headline" size="xs">
            -{tempBillingText.currencySymbol}
            {numberUtils.formatTwoDigitsDecimal(remaining)}
          </Text>
        </div>
      )}
      {Boolean(discount) && (
        <div className={styles.row}>
          <Text type="title" size="sm">
            {t('payment.promotionCode1')}
          </Text>
          <Text type="headline" size="xs">
            -{tempBillingText.currencySymbol}
            {numberUtils.formatTwoDigitsDecimal(discount)}
          </Text>
        </div>
      )}
      <div className={styles.row}>
        <Text type="headline" size="sm">
          {t('payment.amountDueToday')}
        </Text>
        <Text type="headline" size="lg" className={styles.boldText}>
          {tempBillingText.currencySymbol}
          {numberUtils.formatTwoDigitsDecimal(totalPrice)}
        </Text>
      </div>
    </div>
  );
};

export default BillingDetails;
