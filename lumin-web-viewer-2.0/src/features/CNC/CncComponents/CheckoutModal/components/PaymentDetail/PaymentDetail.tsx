import { Icomoon, Link, Text } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

import PaymentMethodInfo from 'features/BillingModal/components/PaymentMethodInfo';
import { CHECKOUT_ON_VIEWER_VARIANT } from 'features/CNC/hooks/useOpenCheckoutOnViewer';

import { Routers } from 'constants/Routers';
import { STATIC_PAGE_URL } from 'constants/urls';

import { CheckoutModalContext } from '../../context/CheckoutModalContext';
import PaymentElementForm from '../PaymentElementForm';

import styles from './PaymentDetail.module.scss';

const PaymentDetail = () => {
  const { t } = useTranslation();
  const { currentPaymentMethod, billingInfo } = useContext(CheckoutModalContext);
  const { organization } = billingInfo;
  return (
    <div className={styles.container}>
      <Text type="headline" size="sm" color="var(--kiwi-colors-surface-on-surface)" className={styles.title}>
        {t('freeTrialPage.paymentDetails')}
      </Text>
      {!currentPaymentMethod ? (
        <div className={styles.paymentElementFormContainer}>
          <PaymentElementForm />
        </div>
      ) : (
        <PaymentMethodInfo
          paymentMethod={currentPaymentMethod}
          orgUrl={organization?.url}
          from={CHECKOUT_ON_VIEWER_VARIANT.MODAL}
        />
      )}
      <div className={styles.paymentInfoContainer}>
        <div className={styles.paymentInfoItem}>
          <Icomoon type="checks-md" size="md" color="var(--kiwi-colors-surface-on-surface-variant)" />
          <Text type="label" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
            <Trans
              i18nKey="checkoutModal.paymentDetail.message"
              components={{
                Link: (
                  <Link
                    target="_blank"
                    className={styles.link}
                    href={`${STATIC_PAGE_URL}${Routers.TERMS_OF_USE}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                ),
              }}
            />
          </Text>
        </div>
        <div className={styles.paymentInfoItem}>
          <Icomoon type="lock-sm" size="sm" color="var(--kiwi-colors-surface-on-surface)" />
          <Text type="label" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
            {t('freeTrialPage.messagePaymentFreeTrial')}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetail;
