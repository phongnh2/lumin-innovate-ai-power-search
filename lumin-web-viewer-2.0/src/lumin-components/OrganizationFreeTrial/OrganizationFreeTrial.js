import { merge } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import styles from 'screens/Payment/Payment.module.scss';

import FreeTrialBoard from 'lumin-components/FreeTrialBoard';
import PaymentLayout from 'lumin-components/PaymentLayout';
import PaymentSwitchComponent from 'lumin-components/PaymentSwitchComponent';
import GoogleReCaptchaV3Provider from 'luminComponents/GoogleReCaptchaV3Provider';

import withGetPaymentInfo from 'HOC/withGetPaymentInfo';

import {
  useFetchPaymentCard,
  useMatchPaymentRoute,
  useTranslation,
  useSetInitialOrgPaymentPage,
  useGetCurrencyBaseOnLocation,
} from 'hooks';
import useGetNextPaymentInfo from 'hooks/useGetNextPaymentInfo';
import useSetCurrentOrganizationPayment from 'hooks/useSetCurrentOrganizationPayment';

import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { PaymentUrlSerializer } from 'utils/payment';

import { CURRENCY } from 'constants/paymentConstant';
import { PERIOD } from 'constants/plan';

import FreeTrialContext from './FreeTrialContext';
import useGetInfoPlan from './hooks/useGetInfoPlan';

export const getRadioButtons = (t) => [
  {
    value: PERIOD.MONTHLY,
    label: t('freeTrialPage.monthly'),
    name: ButtonName.PERIOD_SWITCH_TO_MONTHLY,
    purpose: ButtonPurpose[ButtonName.PERIOD_SWITCH_TO_MONTHLY],
  },
  {
    value: PERIOD.ANNUAL,
    label: t('freeTrialPage.annual'),
    name: ButtonName.PERIOD_SWITCH_TO_YEARLY,
    purpose: ButtonPurpose[ButtonName.PERIOD_SWITCH_TO_YEARLY],
    showDiscount: true,
  },
];

function OrganizationFreeTrial() {
  const { plan, period, search } = useMatchPaymentRoute();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locationCurrency, loading: isFetchingCurrency } = useGetCurrencyBaseOnLocation();
  const [billingInfo, setBillingInfo] = useState({
    currency: CURRENCY.USD.value,
    isCardFilled: false,
    organizationId: null,
    stripeAccountId: '',
  });
  const [isFetchedCard, setIsFetchedCard] = useState(false);

  useSetInitialOrgPaymentPage({ setBillingInfo });

  useSetCurrentOrganizationPayment();

  const {
    isLoading: isFetchingCardInfo,
    customerInfo,
    currentPaymentMethod,
  } = useFetchPaymentCard({ clientId: billingInfo.organizationId, setIsFetchedCard });

  const onPeriodChange = (_period) => {
    const paymentUrlSerializer = new PaymentUrlSerializer().trial(true).period(_period).plan(plan).searchParam(search);
    navigate(paymentUrlSerializer.get(), { replace: true });
  };

  const { text, description, unitPrice } = useGetInfoPlan({ currency: billingInfo.currency });

  const radioButtons = getRadioButtons(t);
  const radioList = radioButtons.map((radio, index) => ({ ...radio, description: description[index] }));

  const context = useMemo(
    () => ({
      billingInfo: merge({}, billingInfo, { period }),
      setBillingInfo,
      isFetchingCardInfo,
      currentPaymentMethod,
      isFetchingCurrency,
      customerInfo,
      isFetchedCard,
      setIsFetchedCard,
    }),
    [billingInfo, period, isFetchingCardInfo, currentPaymentMethod, isFetchingCurrency, customerInfo, isFetchedCard]
  );

  useGetNextPaymentInfo({
    plan,
    period,
    currency: billingInfo.currency,
    stripeAccountId: billingInfo.stripeAccountId,
    organizationId: billingInfo.organizationId,
    isFetchedCard,
    currentPaymentMethod,
  });

  const changeCurrency = (currency) =>
    setBillingInfo((prev) => ({
      ...prev,
      currency,
    }));

  useEffect(() => {
    changeCurrency(customerInfo?.currency || locationCurrency || CURRENCY.USD.value);
  }, [locationCurrency, customerInfo?.currency]);

  return (
    <PaymentLayout>
      <GoogleReCaptchaV3Provider>
        <FreeTrialContext.Provider value={context}>
          <div className={styles.header}>
            <h1 className={styles.title}>{t('freeTrialPage.title')}</h1>
            <p className={styles.description}>{text}</p>
          </div>
          <div>
            <PaymentSwitchComponent
              radioList={radioList}
              period={period}
              onChange={onPeriodChange}
              hidePromote
              unitPrice={unitPrice}
              currency={billingInfo.currency}
            />
          </div>
          <FreeTrialBoard
            organizationId={billingInfo.organizationId}
            isFetchedCard={isFetchedCard}
            currentPaymentMethod={currentPaymentMethod}
          />
        </FreeTrialContext.Provider>
      </GoogleReCaptchaV3Provider>
    </PaymentLayout>
  );
}

export default withGetPaymentInfo(OrganizationFreeTrial);
