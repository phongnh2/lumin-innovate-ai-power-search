import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { ApplePayRecurringPaymentRequest } from '@stripe/stripe-js/dist/stripe-js/elements/apple-pay';
import { IconButton } from 'lumin-ui/kiwi-ui';
import React, { useContext, useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';
import { RootState } from 'store';

import AppCircularLoading from 'lumin-components/AppCircularLoading';
import CurrencyPicker from 'lumin-components/StripePaymentForm/components/CurrencyPicker';
import { FreeTrialBoardContext } from 'luminComponents/FreeTrialBoard/context';

import { useGetCurrentUser, useTranslation } from 'hooks';
import useGetApplePayRecurringPaymentRequest from 'hooks/useGetApplePayRecurringPaymentRequest';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { EVENT_FIELD_ACTION, EVENT_FIELD_NAME } from 'utils/Factory/EventCollection/PaymentEventCollection';
import { eventTracking } from 'utils/recordUtil';

import PaymentEncryptedCert from 'features/BillingModal/components/PaymentEncryptedCert';
import { BILLING_FORM_STEP } from 'features/BillingModal/constants/billingModal';
import { useClaimFreeTrial } from 'features/BillingModal/hooks/useClaimFreeTrial';
import { useTrialModalContext } from 'features/BillingModal/hooks/useTrialModalContext';
import { VARIATION_NAME } from 'features/CNC/constants/events/variation';

import { AWS_EVENTS } from 'constants/awsEvents';
import { PaymentCurrency } from 'constants/plan.enum';

import styles from './PaymentElementForm.module.scss';

function PaymentElementForm() {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const {
    setBillingInfo,
    billingInfo,
    isFetchingCardInfo,
    currentPaymentMethod,
    isFetchingCurrency,
    customerInfo,
    setBillingFormStep,
  } = useTrialModalContext();
  const { organizationId, stripeAccountId } = billingInfo;
  const selectedOrganization = useSelector(
    (state) => selectors.getOrganizationById(state as RootState, organizationId),
    shallowEqual
  );
  const { newOrganization } = useContext(FreeTrialBoardContext);
  const { trackUserFillPaymentForm } = useClaimFreeTrial({ newOrganization });
  const [paymentElementLoading, setLoading] = useState(true);
  const [previousPaymentMethod, setPreviousPaymentMethod] = useState('');
  const currentUser = useGetCurrentUser();

  const applePayRecurringPaymentRequest = useGetApplePayRecurringPaymentRequest({
    billingInfo,
    currentOrganization: selectedOrganization?.organization,
    isModal: true,
  });

  const loading = paymentElementLoading || isFetchingCardInfo || isFetchingCurrency;

  const getPaymentElement = () => elements.getElement('payment');
  const isStripeLimitCurrency = stripeAccountId === process.env.STRIPE_US_ACCOUNT_ID;

  const isReadOnlyCurrency = () => Boolean(customerInfo) || Boolean(isStripeLimitCurrency) || loading;

  const onElementsReady = () => {
    const paymentElement = getPaymentElement();
    if (organizationId && !currentPaymentMethod) {
      paymentElement.focus();
    }
  };

  const onElementsChange = (event: StripePaymentElementChangeEvent) => {
    if (!event.empty) {
      trackUserFillPaymentForm({
        fieldName: EVENT_FIELD_NAME.STRIPE_FORM,
        action: event.complete ? EVENT_FIELD_ACTION.COMPLETED : EVENT_FIELD_ACTION.CHANGED,
      });
    }
    const paymentMethod = event?.value?.type;
    if (paymentMethod && previousPaymentMethod !== paymentMethod) {
      eventTracking(AWS_EVENTS.PAYMENT.PAYMENT_METHOD_CHANGED, {
        selectedPaymentMethod: paymentMethod,
        variationName: VARIATION_NAME.CHECKOUT_ON_VIEWER_WEB_POP_OVER,
      }).catch(() => {});
      setPreviousPaymentMethod(paymentMethod);
    }
    setBillingInfo((prev) => ({
      ...prev,
      isCardFilled: event.complete,
    }));
  };

  const onChangeCurrency = (_key: string, value: PaymentCurrency) => {
    trackUserFillPaymentForm({ fieldName: EVENT_FIELD_NAME.CURRENCY_DROPDOWN, action: EVENT_FIELD_ACTION.COMPLETED });
    setBillingInfo((prev) => ({
      ...prev,
      currency: value,
    }));
  };

  useEffect(() => {
    setBillingInfo((prevState) => ({
      ...prevState,
      isCardFilled: Boolean(currentPaymentMethod),
    }));

    if (currentPaymentMethod) {
      setLoading(false);
    }
  }, [currentPaymentMethod]);

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <IconButton
          icon="ph-arrow-left"
          size="lg"
          className={styles.backButton}
          onClick={() => setBillingFormStep(BILLING_FORM_STEP.WORKSPACE_INFO)}
          data-lumin-btn-name={ButtonName.BACK}
        />
        <p className={styles.title}>{t('payment.paymentMethod')}</p>
      </div>
      {Boolean(stripe) && (
        <div className={styles.wrapper}>
          {loading && (
            <div className={styles.loadingContainer}>
              <AppCircularLoading noTopGap />
            </div>
          )}
          <div style={{ display: loading ? 'none' : 'block' }}>
            <PaymentElement
              id="payment-element"
              onReady={onElementsReady}
              onChange={onElementsChange}
              onLoaderStart={() => setLoading(false)}
              onFocus={() => {
                trackUserFillPaymentForm({
                  fieldName: EVENT_FIELD_NAME.STRIPE_FORM,
                  action: EVENT_FIELD_ACTION.TOUCHED,
                });
              }}
              options={{
                fields: {
                  billingDetails: {
                    address: {
                      postalCode: 'auto',
                    },
                  },
                },
                defaultValues: {
                  billingDetails: {
                    email: currentUser.email,
                  },
                },
                applePay: {
                  recurringPaymentRequest: applePayRecurringPaymentRequest as ApplePayRecurringPaymentRequest,
                },
              }}
            />
          </div>
          <div className={styles.currencyPickerContainer}>
            <CurrencyPicker value={billingInfo.currency} onChange={onChangeCurrency} readOnly={isReadOnlyCurrency()} />
          </div>
          <PaymentEncryptedCert />
        </div>
      )}
    </div>
  );
}

export default PaymentElementForm;
