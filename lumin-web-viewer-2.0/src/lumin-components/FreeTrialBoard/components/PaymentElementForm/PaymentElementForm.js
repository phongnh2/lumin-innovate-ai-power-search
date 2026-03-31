import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useContext, useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import AppCircularLoading from 'lumin-components/AppCircularLoading';
import FreeTrialContext from 'lumin-components/OrganizationFreeTrial/FreeTrialContext';
import PaymentEncryptedCert from 'lumin-components/PaymentEncryptedCert';
import PaymentMethodInfo from 'lumin-components/PaymentMethodInfo';
import CurrencyPicker from 'lumin-components/StripePaymentForm/components/CurrencyPicker';
import { FreeTrialBoardContext } from 'luminComponents/FreeTrialBoard/context';

import { useClaimFreeTrial, useGetCurrentUser } from 'hooks';
import useGetApplePayRecurringPaymentRequest from 'hooks/useGetApplePayRecurringPaymentRequest';
import usePaymentFreeTrialPageReskin from 'hooks/usePaymentFreeTrialPageReskin';

import { eventTracking } from 'utils';
import { EVENT_FIELD_ACTION, EVENT_FIELD_NAME } from 'utils/Factory/EventCollection/PaymentEventCollection';

import { AWS_EVENTS } from 'constants/awsEvents';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import * as Styled from './PaymentElementForm.styled';

function PaymentElementForm() {
  const stripe = useStripe();
  const elements = useElements();
  const {
    setBillingInfo,
    billingInfo,
    isFetchingCardInfo,
    currentPaymentMethod,
    isFetchSubscription,
    isFetchingCurrency,
    customerInfo,
  } = useContext(FreeTrialContext);
  const { organizationId, stripeAccountId } = billingInfo;
  const selectedOrganization = useSelector(
    (state) => selectors.getOrganizationById(state, organizationId),
    shallowEqual
  );
  const { newOrganization } = useContext(FreeTrialBoardContext);
  const { trackUserFillPaymentForm } = useClaimFreeTrial({ newOrganization });
  const { isEnableReskinUI } = usePaymentFreeTrialPageReskin();
  const [paymentElementLoading, setLoading] = useState(true);
  const currentUser = useGetCurrentUser();
  const [previousPaymentMethod, setPreviousPaymentMethod] = useState();

  const applePayRecurringPaymentRequest = useGetApplePayRecurringPaymentRequest({
    billingInfo,
    currentOrganization: selectedOrganization?.organization,
  });

  const loading = paymentElementLoading || isFetchingCardInfo || isFetchSubscription || isFetchingCurrency;

  const StyledComponents = isEnableReskinUI
    ? {
        Container: Styled.ContainerReskin,
      }
    : {
        Container: Styled.Container,
      };

  const getPaymentElement = () => elements.getElement('payment');
  const isStripeLimitCurrency = stripeAccountId === process.env.STRIPE_US_ACCOUNT_ID;

  const isReadOnlyCurrency = () => Boolean(customerInfo) || Boolean(isStripeLimitCurrency) || loading;

  const onElementsReady = () => {
    setLoading(false);
    const paymentElement = getPaymentElement();
    if (organizationId && !currentPaymentMethod) {
      paymentElement.focus();
    }
  };

  const onElementsChange = (event) => {
    if (!event.empty) {
      trackUserFillPaymentForm({
        fieldName: EVENT_FIELD_NAME.STRIPE_FORM,
        action: event.complete ? EVENT_FIELD_ACTION.COMPLETED : EVENT_FIELD_ACTION.CHANGED,
      });
    }
    const paymentMethod = event?.value?.type;
    if (previousPaymentMethod !== paymentMethod) {
      eventTracking(AWS_EVENTS.PAYMENT.PAYMENT_METHOD_CHANGED, {
        selectedPaymentMethod: paymentMethod,
      }).catch(() => {});
      setPreviousPaymentMethod(paymentMethod);
    }
    setBillingInfo((prev) => ({
      ...prev,
      isCardFilled: event.complete,
    }));
  };

  const onChangeCurrency = (_, value) => {
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
      <StyledComponents.Container $loading={loading}>
        {loading && (
          <Styled.Loading>
            <AppCircularLoading noTopGap />
          </Styled.Loading>
        )}
        {currentPaymentMethod && selectedOrganization?.role?.toUpperCase() !== ORGANIZATION_ROLES.MEMBER ? (
          <PaymentMethodInfo paymentMethod={currentPaymentMethod} orgUrl={selectedOrganization?.organization?.url} />
        ) : (
          <PaymentElement
            id="payment-element"
            onReady={onElementsReady}
            onChange={onElementsChange}
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
                recurringPaymentRequest: applePayRecurringPaymentRequest,
              },
            }}
          />
        )}
        <div style={{ marginTop: 16 }}>
          <CurrencyPicker value={billingInfo.currency} onChange={onChangeCurrency} readOnly={isReadOnlyCurrency()} />
        </div>
        {isEnableReskinUI ? null : <PaymentEncryptedCert />}
      </StyledComponents.Container>
    )
  );
}

export default PaymentElementForm;
