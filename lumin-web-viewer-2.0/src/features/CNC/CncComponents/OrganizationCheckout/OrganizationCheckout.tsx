import { Text } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useMemo, useState } from 'react';

import PaymentLayout from 'lumin-components/PaymentLayout';
import GoogleReCaptchaV3Provider from 'luminComponents/GoogleReCaptchaV3Provider';
import FreeTrialContext from 'luminComponents/OrganizationFreeTrial/FreeTrialContext';

import withGetPaymentInfo from 'HOC/withGetPaymentInfo';

import {
  useFetchPaymentCard,
  useMatchPaymentRoute,
  useSetInitialOrgPaymentPage,
  useGetCurrencyBaseOnLocation,
  useTranslation,
} from 'hooks';
import useSetCurrentOrganizationPayment from 'hooks/useSetCurrentOrganizationPayment';

import { CURRENCY } from 'constants/paymentConstant';
import { PaymentCurrency } from 'constants/plan.enum';

import { ICustomerInfo, IPaymentMethod } from 'interfaces/payment/payment.interface';

import OrganizationCheckoutContext, { BillingInfo } from './OrganizationCheckoutContext';
import CheckoutBoard from '../CheckoutBoard';

import styles from './OrganizationCheckout.module.scss';

interface PaymentCardInfo {
  isLoading: boolean;
  customerInfo: ICustomerInfo;
  currentPaymentMethod: IPaymentMethod;
}

function OrganizationCheckout() {
  const { promotion } = useMatchPaymentRoute();
  const { t } = useTranslation();
  const { locationCurrency, loading: isFetchingCurrency } = useGetCurrencyBaseOnLocation();
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    currency: CURRENCY.USD.value as PaymentCurrency,
    couponValue: {},
    couponCode: '',
    organizationId: '',
    isCardFilled: false,
    stripeAccountId: '',
    isValidatingCoupon: Boolean(promotion),
    quantity: 0,
  });
  const [isChangeCard, setIsChangeCard] = useState(false);
  const [isFetchedCard, setIsFetchedCard] = useState(false);

  useSetInitialOrgPaymentPage({ setBillingInfo });

  useSetCurrentOrganizationPayment();

  const { isLoading, customerInfo, currentPaymentMethod } = useFetchPaymentCard({
    clientId: billingInfo.organizationId,
    setIsChangeCard: () => setIsChangeCard(true),
    setIsFetchedCard: () => setIsFetchedCard(true),
  }) as PaymentCardInfo;

  const context = useMemo(
    () => ({
      billingInfo,
      setBillingInfo,
    }),
    [billingInfo]
  );

  const changeCurrency = (currency: PaymentCurrency) =>
    setBillingInfo((prev) => ({
      ...prev,
      currency,
    }));

  useEffect(() => {
    changeCurrency(customerInfo?.currency || locationCurrency || (CURRENCY.USD.value as PaymentCurrency));
  }, [locationCurrency, customerInfo?.currency]);

  return (
    <PaymentLayout>
      <GoogleReCaptchaV3Provider>
        <OrganizationCheckoutContext.Provider value={context}>
          <FreeTrialContext.Provider value={context}>
            <div className={styles.header}>
              <Text component="h1" type="display" size="sm" className={styles.title}>
                {t('payment.checkout')}
              </Text>
              <Text type="body" size="lg" color="var(--kiwi-colors-surface-on-surface-variant)">
                {t('payment.description')}
              </Text>
            </div>
            <CheckoutBoard
              isChangeCard={isChangeCard}
              currentPaymentMethod={currentPaymentMethod}
              isLoading={isLoading || isFetchingCurrency}
              customerInfo={customerInfo}
              isFetchedCard={isFetchedCard}
              billingInfo={billingInfo}
              setBillingInfo={setBillingInfo}
            />
          </FreeTrialContext.Provider>
        </OrganizationCheckoutContext.Provider>
      </GoogleReCaptchaV3Provider>
    </PaymentLayout>
  );
}
export default withGetPaymentInfo(OrganizationCheckout);
