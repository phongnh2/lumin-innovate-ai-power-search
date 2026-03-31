import { PaymentElement, useElements } from '@stripe/react-stripe-js';
import { CircularProgress } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import PaymentEncryptedCert from 'lumin-components/PaymentEncryptedCert';
import CircularLoading from 'luminComponents/CircularLoading';
import PaymentMethodInfo from 'luminComponents/PaymentMethodInfo';
import PromotionCodeField from 'luminComponents/PromotionCodeField';

import { PaymentInfoContext } from 'HOC/withGetPaymentInfo';

import { useGetCurrentUser, usePaymentPermissions, useEnableWebReskin } from 'hooks';
import useGetApplePayRecurringPaymentRequest from 'hooks/useGetApplePayRecurringPaymentRequest';

import { eventTracking } from 'utils';
import paymentEvent, {
  EVENT_FIELD_ACTION,
  EVENT_FIELD_NAME,
} from 'utils/Factory/EventCollection/PaymentEventCollection';

import { AWS_EVENTS } from 'constants/awsEvents';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

import CurrencyPicker from './components/CurrencyPicker';

import * as Styled from './StripePaymentForm.styled';

import styles from './StripePaymentForm.module.scss';

function StripePaymentForm(props) {
  const {
    billingInfo,
    changeBillingInfo,
    currentPaymentMethod,
    isLoadingCardInfo,
    isPurchasing,
    canUpgrade,
    currentOrganization,
    hidePromote,
  } = props;
  const { triggerEvent } = useContext(PaymentInfoContext);
  const currentUser = useGetCurrentUser();
  const applePayRecurringPaymentRequest = useGetApplePayRecurringPaymentRequest({
    billingInfo,
    currentOrganization,
  });
  const [previousPaymentMethod, setPreviousPaymentMethod] = useState();
  const { isEnableReskin } = useEnableWebReskin();

  const elements = useElements();
  const { isInputDisabled, isCurrencyDisabled } = usePaymentPermissions({
    currentOrganization,
    billingInfo,
  });

  const { currency, organizationId } = billingInfo;
  const selectedOrganization = useSelector(
    (state) => selectors.getOrganizationById(state, organizationId),
    shallowEqual
  );

  const getPaymentElement = () => elements.getElement('payment');

  const onElementsReady = () => {
    const paymentElement = getPaymentElement();
    if (organizationId) {
      paymentElement.focus();
    }
  };

  const trackEventStripeForm = (action) => {
    triggerEvent({
      callback: paymentEvent.userFillPaymentForm.bind(paymentEvent),
      params: {
        organizationId,
        fieldName: EVENT_FIELD_NAME.STRIPE_FORM,
        action,
      },
    });
  };

  const onElementsChange = (event) => {
    if (!event.empty) {
      trackEventStripeForm(event.complete ? EVENT_FIELD_ACTION.COMPLETED : EVENT_FIELD_ACTION.CHANGED);
    }
    const paymentMethod = event?.value?.type;
    if (previousPaymentMethod !== paymentMethod) {
      eventTracking(AWS_EVENTS.PAYMENT.PAYMENT_METHOD_CHANGED, {
        selectedPaymentMethod: paymentMethod,
      }).catch(() => {});
      setPreviousPaymentMethod(paymentMethod);
    }
    changeBillingInfo('isCardFilled', event.complete);
    changeBillingInfo('paymentMethod', event.value.type);
  };

  if (isLoadingCardInfo) {
    return isEnableReskin ? (
      <div className={styles.loadingContainer}>
        <CircularProgress />
      </div>
    ) : (
      <CircularLoading style={{ padding: '20px 0' }} />
    );
  }

  return (
    <>
      {currentPaymentMethod && selectedOrganization?.role?.toUpperCase() !== ORGANIZATION_ROLES.MEMBER ? (
        <PaymentMethodInfo paymentMethod={currentPaymentMethod} orgUrl={selectedOrganization?.organization?.url} />
      ) : (
        <PaymentElement
          id="payment-element"
          onReady={onElementsReady}
          onChange={onElementsChange}
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
          onFocus={() => trackEventStripeForm(EVENT_FIELD_ACTION.TOUCHED)}
        />
      )}
      {isEnableReskin ? (
        <CurrencyPicker disabled={isCurrencyDisabled} onChange={changeBillingInfo} value={currency} />
      ) : (
        <Styled.CurrencyContainer>
          <CurrencyPicker disabled={isCurrencyDisabled} onChange={changeBillingInfo} value={currency} />
        </Styled.CurrencyContainer>
      )}

      {!hidePromote && (
        <PromotionCodeField
          billingInfo={billingInfo}
          isPurchasing={isPurchasing}
          changeBillingInfo={changeBillingInfo}
          disabled={isInputDisabled || !canUpgrade}
          currentOrganization={currentOrganization}
        />
      )}
      {!isEnableReskin && <PaymentEncryptedCert />}
    </>
  );
}

StripePaymentForm.propTypes = {
  billingInfo: PropTypes.object,
  changeBillingInfo: PropTypes.func,
  currentPaymentMethod: PropTypes.object,
  isLoadingCardInfo: PropTypes.bool,
  isPurchasing: PropTypes.bool.isRequired,
  currentOrganization: PropTypes.object,
  canUpgrade: PropTypes.bool.isRequired,
  hidePromote: PropTypes.bool,
};

StripePaymentForm.defaultProps = {
  billingInfo: {},
  changeBillingInfo: () => {},
  currentPaymentMethod: null,
  isLoadingCardInfo: false,
  currentOrganization: null,
  hidePromote: false,
};

export default StripePaymentForm;
