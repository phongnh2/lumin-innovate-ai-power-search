import { Button, Text } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { Routers } from 'constants/Routers';

import { IPaymentMethod } from 'interfaces/payment/payment.interface';

import PaymentMethodInfoForm from './PaymentMethodInfoForm';

import styles from './PaymentMethodInfo.module.scss';

export interface PaymentMethodInfoProps {
  paymentMethod: IPaymentMethod;
  orgUrl?: string;
}

const PaymentMethodInfo = ({ paymentMethod, orgUrl }: PaymentMethodInfoProps) => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const navigate = useNavigate();

  const billingSettingUrl = useMemo(() => {
    const pathName = [Routers.ORGANIZATION, orgUrl, 'dashboard/billing'].join('/');
    const hashParam = '#billing-info';
    return `${pathName}${hashParam}`;
  }, [orgUrl]);

  if (isEnableReskin) {
    return (
      <div>
        <div className={styles.labelContainerReskin}>
          <Text
            component="label"
            type="title"
            size="sm"
            color="var(--kiwi-colors-surface-on-surface)"
            htmlFor="stripe-card"
          >
            {t('payment.paymentMethod')}
          </Text>
          {orgUrl && (
            <Button variant="text" size="sm" onClick={() => navigate(billingSettingUrl)}>
              {t('payment.changePaymentMethod')}
            </Button>
          )}
        </div>
        <PaymentMethodInfoForm paymentMethod={paymentMethod} isEnableReskin={isEnableReskin} />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.labelContainer}>
        <label className={styles.label} htmlFor="stripe-card">
          {t('payment.paymentMethod')}
        </label>
        {orgUrl && (
          <Link className={styles.changePaymentMethodLink} to={billingSettingUrl}>
            {t('payment.changePaymentMethod')}
          </Link>
        )}
      </div>
      <PaymentMethodInfoForm paymentMethod={paymentMethod} />
    </div>
  );
};

export default PaymentMethodInfo;
