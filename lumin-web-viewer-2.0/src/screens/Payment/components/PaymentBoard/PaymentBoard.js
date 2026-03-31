import { CircularProgress } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { compose } from 'redux';

import selectors from 'selectors';

import CircularLoading from 'lumin-components/CircularLoading';
import TrackedForm from 'lumin-components/Shared/TrackedForm';
import PaymentForm from 'luminComponents/PaymentForm';
import PaymentTempBilling from 'luminComponents/PaymentTempBilling';

import withGetPaymentInfo, { PaymentInfoContext } from 'HOC/withGetPaymentInfo';
import withRouter from 'HOC/withRouter';
import withStripeElements from 'HOC/withStripeElements';

import {
  useEnableWebReskin,
  useGetCurrencyBaseOnLocation,
  useMatchPaymentRoute,
  useOrganizationPayment,
  usePaymentPermissions,
  useTranslation,
} from 'hooks';
import useGetNextPaymentInfo from 'hooks/useGetNextPaymentInfo';

import { COMMON_FORM_INFO } from 'utils/Factory/EventCollection/FormEventCollection';
import paymentEvent, {
  EVENT_FIELD_ACTION,
  EVENT_FIELD_NAME,
} from 'utils/Factory/EventCollection/PaymentEventCollection';

import { LocalStorageKey } from 'constants/localStorageKey';
import { CURRENCY } from 'constants/paymentConstant';

import { useUpdatePayment } from '../../hooks/useUpdatePayment';

import * as Styled from './PaymentBoard.styled';

import styles from './PaymentBoard.module.scss';

PaymentBoard.propTypes = {
  navigate: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  stripeAccountId: PropTypes.string,
  isChangeCard: PropTypes.bool,
  setIsChangeCard: PropTypes.func,
  currentPaymentMethod: PropTypes.object,
  isLoading: PropTypes.bool,
  customerInfo: PropTypes.object,
  isFetchedCard: PropTypes.bool,
  setIsFetchedCard: PropTypes.func,
  billingInfo: PropTypes.object,
  setBillingInfo: PropTypes.func,
  hasClientSecret: PropTypes.bool,
  getNewSecret: PropTypes.func,
};

PaymentBoard.defaultProps = {
  stripeAccountId: '',
  isChangeCard: false,
  setIsChangeCard: () => {},
  currentPaymentMethod: null,
  isLoading: false,
  customerInfo: null,
  isFetchedCard: false,
  setIsFetchedCard: () => {},
  billingInfo: {},
  setBillingInfo: () => {},
  hasClientSecret: false,
  getNewSecret: () => {},
};

function PaymentBoard({
  location,
  navigate,
  stripeAccountId,
  isChangeCard,
  setIsChangeCard,
  currentPaymentMethod,
  isLoading,
  customerInfo,
  isFetchedCard,
  setIsFetchedCard,
  billingInfo,
  setBillingInfo,
  hasClientSecret,
  getNewSecret,
}) {
  const { loading: orgsLoading } = useSelector(selectors.getOrganizationList, shallowEqual);
  const { triggerEvent } = useContext(PaymentInfoContext);
  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const { plan, period } = useMatchPaymentRoute();
  const [isCardExisted, setIsCardExisted] = useState(false);
  const { t } = useTranslation();
  const [newOrganization, setNewOrganization] = useState({ name: '', error: t('errorMessage.fieldRequired') });
  const { currentOrganization } = useOrganizationPayment({ billingInfo });
  const { canUpgrade, clientId, isCurrencyDisabled } = usePaymentPermissions({
    currentOrganization,
    billingInfo,
  });
  const { locationCurrency, loading: isFetchingCurrency } = useGetCurrencyBaseOnLocation();
  const { isEnableReskin } = useEnableWebReskin();

  const { formName, formPurpose } = COMMON_FORM_INFO.upgradePlan;

  const changeBillingInfo = useCallback(
    (field, value, isUserChange = true) => {
      setBillingInfo((_billingInfo) => ({
        ..._billingInfo,
        [field]: value,
      }));
      if (!isUserChange) {
        return;
      }
      let fieldName = '';
      let { organizationId } = billingInfo;
      switch (field) {
        case 'organizationId':
          organizationId = value;
          fieldName = EVENT_FIELD_NAME.CIRCLE_DROPDOWN;
          break;
        case 'currency':
          fieldName = isCurrencyDisabled ? '' : EVENT_FIELD_NAME.CURRENCY_DROPDOWN;
          break;
        default:
          break;
      }

      if (fieldName) {
        triggerEvent({
          callback: paymentEvent.userFillPaymentForm.bind(paymentEvent),
          params: {
            fieldName,
            action: EVENT_FIELD_ACTION.COMPLETED,
            organizationId,
          },
        });
      }
    },
    [isCurrencyDisabled, billingInfo.organizationId]
  );

  useUpdatePayment({
    currentOrganization,
    updateCallback: setBillingInfo,
  });

  useGetNextPaymentInfo({
    plan,
    period,
    currency: billingInfo.currency,
    stripeAccountId,
    organizationId: billingInfo.organizationId,
    isFetchedCard,
    currentPaymentMethod,
  });

  useEffect(() => {
    function handleLandingPageTokenURL() {
      if (!urlParams.get('ltk')) {
        return;
      }
      navigate(location.pathname, { replace: true });
    }
    handleLandingPageTokenURL();
  }, [location.search, navigate, location.pathname, urlParams]);

  useEffect(() => {
    changeBillingInfo('stripeAccountId', stripeAccountId);
    const isStripeLimitCurrency = stripeAccountId === process.env.STRIPE_US_ACCOUNT_ID;
    if (isStripeLimitCurrency) {
      localStorage.setItem(LocalStorageKey.CURRENCY, CURRENCY.USD.value);
      changeBillingInfo('currency', CURRENCY.USD.value);
    }
    setIsCardExisted(Boolean(currentPaymentMethod));
  }, [currentPaymentMethod, changeBillingInfo, clientId, stripeAccountId]);

  useEffect(() => {
    const isStripeLimitCurrency = stripeAccountId === process.env.STRIPE_US_ACCOUNT_ID;
    if (!isStripeLimitCurrency) {
      changeBillingInfo('currency', customerInfo?.currency || locationCurrency || CURRENCY.USD.value, false);
    }
  }, [customerInfo?.currency, locationCurrency]);

  const getMainContent = () => (
    <>
      <div>
        <PaymentForm
          newOrganization={newOrganization}
          setNewOrganization={setNewOrganization}
          changeBillingInfo={changeBillingInfo}
          billingInfo={billingInfo}
          isChangeCard={isChangeCard}
          setIsChangeCard={setIsChangeCard}
          canUpgrade={canUpgrade}
          currentOrganization={currentOrganization}
          setIsCardExisted={setIsCardExisted}
          currentPaymentMethod={currentPaymentMethod}
          isLoading={isLoading || isFetchingCurrency}
          setIsFetchedCard={setIsFetchedCard}
          hasClientSecret={hasClientSecret}
          getNewSecret={getNewSecret}
        />
      </div>
      <PaymentTempBilling
        changeBillingInfo={changeBillingInfo}
        billingInfo={billingInfo}
        isChangeCard={isChangeCard}
        clientId={clientId}
        canUpgrade={canUpgrade}
        currentOrganization={currentOrganization}
        isCardExisted={isCardExisted}
        isLoading={isLoading || isFetchingCurrency}
        newOrganization={newOrganization}
        isFetchedCard={isFetchedCard}
      />
    </>
  );

  if (isEnableReskin) {
    return (
      <TrackedForm formName={formName} formPurpose={formPurpose}>
        {orgsLoading ? (
          <div className={styles.loadingContainer}>
            <CircularProgress />
          </div>
        ) : (
          <div className={styles.container}>{getMainContent()}</div>
        )}
      </TrackedForm>
    );
  }

  return (
    <TrackedForm formName={formName} formPurpose={formPurpose}>
      {orgsLoading ? (
        <Styled.LoadingContainer>
          <CircularLoading />
        </Styled.LoadingContainer>
      ) : (
        <Styled.Container>{getMainContent()}</Styled.Container>
      )}
    </TrackedForm>
  );
}

export default compose(
  withGetPaymentInfo,
  withRouter,
  React.memo
)(withStripeElements(PaymentBoard, { action: 'payment' }));
