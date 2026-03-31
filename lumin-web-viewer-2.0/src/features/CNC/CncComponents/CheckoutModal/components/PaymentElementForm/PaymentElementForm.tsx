import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { ApplePayRecurringPaymentRequest } from '@stripe/stripe-js/dist/stripe-js/elements/apple-pay';
import React, { useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';
import { RootState } from 'store';

import AppCircularLoading from 'lumin-components/AppCircularLoading';
import CurrencyPicker from 'lumin-components/StripePaymentForm/components/CurrencyPicker';

import { useGetCurrentUser } from 'hooks';
import useGetApplePayRecurringPaymentRequest from 'hooks/useGetApplePayRecurringPaymentRequest';

import { eventTracking } from 'utils';
import { EVENT_FIELD_ACTION, EVENT_FIELD_NAME } from 'utils/Factory/EventCollection/PaymentEventCollection';

import { VARIATION_NAME } from 'features/CNC/constants/events/variation';

import { AWS_EVENTS } from 'constants/awsEvents';
import { PaymentCurrency } from 'constants/plan.enum';

import { useCheckoutModalContext } from '../../hooks/useCheckoutModalContext';
import useClaimFreeTrial from '../../hooks/useClaimFreeTrial';

function PaymentElementForm() {
  const stripe = useStripe();
  const elements = useElements();
  const {
    setBillingInfo,
    billingInfo,
    isFetchingCardInfo,
    currentPaymentMethod,
    isFetchingCurrency,
    customerInfo,
    setCurrentPaymentMethodType,
  } = useCheckoutModalContext();
  const { organizationId, stripeAccountId } = billingInfo;
  const selectedOrganization = useSelector(
    (state) => selectors.getOrganizationById(state as RootState, organizationId),
    shallowEqual
  );
  const [paymentElementLoading, setLoading] = useState(true);
  const [previousPaymentMethod, setPreviousPaymentMethod] = useState('');
  const { trackUserFillPaymentForm } = useClaimFreeTrial({});

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
      const paymentMethod = event?.value?.type;
      if (previousPaymentMethod !== paymentMethod) {
        eventTracking(AWS_EVENTS.PAYMENT.PAYMENT_METHOD_CHANGED, {
          selectedPaymentMethod: paymentMethod,
          previousPaymentMethod,
          variationName: VARIATION_NAME.CHECKOUT_ON_VIEWER_CNC_MODAL_LEFT_HAND_SIDE,
        }).catch(() => {});
        setPreviousPaymentMethod(paymentMethod);
      }
    }
    setBillingInfo((prev) => ({
      ...prev,
      isCardFilled: event.complete,
    }));
    setCurrentPaymentMethodType(event.value.type);
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
    Boolean(stripe) && (
      <div>
        {loading && (
          <div>
            <AppCircularLoading noTopGap />
          </div>
        )}
        <PaymentElement
          id="payment-element"
          onReady={onElementsReady}
          onChange={onElementsChange}
          onLoaderStart={() => setLoading(false)}
          onFocus={() => {
            trackUserFillPaymentForm({ fieldName: EVENT_FIELD_NAME.STRIPE_FORM, action: EVENT_FIELD_ACTION.TOUCHED });
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
        <div style={{ marginTop: 16 }}>
          <CurrencyPicker value={billingInfo.currency} onChange={onChangeCurrency} readOnly={isReadOnlyCurrency()} />
        </div>
      </div>
    )
  );
}

export default PaymentElementForm;
