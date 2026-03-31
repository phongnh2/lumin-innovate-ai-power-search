import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import PaymentLayout from 'lumin-components/PaymentLayout';

import {
  useMatchPaymentRoute,
  useSetInitialOrgPaymentPage,
  useTranslation,
  useFetchPaymentCard,
  useEnableWebReskin,
} from 'hooks';
import useSetCurrentOrganizationPayment from 'hooks/useSetCurrentOrganizationPayment';

import { CURRENCY } from 'constants/paymentConstant';
import { Plans } from 'constants/plan';

import { PeriodGroup, PaymentBoard, NewPeriodGroup } from './components';
import { PaymentContext } from './context';

import * as Styled from './Payment.styled';

import styles from './Payment.module.scss';

function Payment() {
  useSetCurrentOrganizationPayment();
  const { t } = useTranslation();
  const { plan, promotion } = useMatchPaymentRoute();
  const { isEnableReskin } = useEnableWebReskin();

  const isOldPlan = plan === Plans.BUSINESS;
  const [billingInfo, setBillingInfo] = useState({
    currency: CURRENCY.USD.value,
    couponValue: {},
    couponCode: '',
    organizationId: null,
    quantity: 0,
    isCardFilled: false,
    isValidatingCoupon: Boolean(promotion),
  });

  const [isChangeCard, setIsChangeCard] = useState(false);
  const [isFetchedCard, setIsFetchedCard] = useState(false);
  const { organization: selectedOrganization } =
    useSelector((state) => selectors.getOrganizationById(state, billingInfo.organizationId), shallowEqual) || {};

  const availablePaidOrgs = useSelector(selectors.availablePaidOrgs, shallowEqual);

  const { currentPaymentMethod, isLoading, customerInfo } = useFetchPaymentCard({
    clientId: billingInfo.organizationId,
    currentOrganization: selectedOrganization,
    setIsChangeCard,
    setIsFetchedCard,
  });

  useEffect(() => {
    setIsChangeCard(!currentPaymentMethod);
    setBillingInfo((prev) => ({
      ...prev,
      isCardFilled: Boolean(currentPaymentMethod),
    }));
  }, [currentPaymentMethod]);

  const changeBillingInfo = (field, value) => {
    setBillingInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const paymentPage = useMemo(
    () => (
      <>
        {isOldPlan ? (
          <PeriodGroup />
        ) : (
          <NewPeriodGroup billingInfo={billingInfo} changeBillingInfo={changeBillingInfo} />
        )}
        <PaymentBoard
          organizationId={billingInfo.organizationId}
          isChangeCard={isChangeCard}
          setIsChangeCard={setIsChangeCard}
          currentPaymentMethod={currentPaymentMethod}
          isLoading={isLoading}
          customerInfo={customerInfo}
          isFetchedCard={isFetchedCard}
          setIsFetchedCard={setIsFetchedCard}
          billingInfo={billingInfo}
          setBillingInfo={setBillingInfo}
        />
      </>
    ),
    [billingInfo, isOldPlan, isChangeCard, currentPaymentMethod, isLoading, customerInfo, isFetchedCard]
  );

  const context = useMemo(
    () => ({
      billingInfo,
      setBillingInfo,
    }),
    [billingInfo]
  );

  useEffect(() => {
    if (selectedOrganization) {
      changeBillingInfo('quantity', selectedOrganization.payment.quantity || 0);
      return;
    }
    if (!availablePaidOrgs.length) {
      changeBillingInfo('quantity', 1);
    }
  }, [selectedOrganization, availablePaidOrgs]);

  useSetInitialOrgPaymentPage({ setBillingInfo });

  const getHeaderContent = useCallback(() => {
    if (isEnableReskin) {
      return (
        <div className={styles.header}>
          <h1 className={styles.title}>{t('payment.title')}</h1>
          <p className={styles.description}>{t('payment.description')}</p>
        </div>
      );
    }

    return (
      <>
        <Styled.Title>{t('payment.title')}</Styled.Title>
        <Styled.Description>{t('payment.description')}</Styled.Description>
      </>
    );
  }, [isEnableReskin, t]);

  return (
    <PaymentContext.Provider value={context}>
      <PaymentLayout>
        {getHeaderContent()}
        {paymentPage}
      </PaymentLayout>
    </PaymentContext.Provider>
  );
}

export default React.memo(Payment);
