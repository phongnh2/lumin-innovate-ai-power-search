import { Paper, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';

import PaymentEncryptedCert from 'lumin-components/PaymentEncryptedCert';
import StripePaymentForm from 'luminComponents/StripePaymentForm';

import { useEnableWebReskin, useMatchPaymentRoute, useTranslation } from 'hooks';

import { commonUtils } from 'utils';
import { PaymentUtilities } from 'utils/Factory/Payment';
import { PaymentUrlSerializer } from 'utils/payment';

import { Plans } from 'constants/plan';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import OrganizationInfo from './components/OrganizationInfo';

import * as Styled from './PaymentForm.styled';

import styles from './PaymentForm.module.scss';

const propTypes = {
  billingInfo: PropTypes.object,
  changeBillingInfo: PropTypes.func,
  canUpgrade: PropTypes.bool,
  currentOrganization: PropTypes.object,
  currentPaymentMethod: PropTypes.object,
  isLoading: PropTypes.bool,
  newOrganization: PropTypes.object.isRequired,
  setNewOrganization: PropTypes.func.isRequired,
  setIsFetchedCard: PropTypes.func,
  hasClientSecret: PropTypes.bool,
  getNewSecret: PropTypes.func,
};

const defaultProps = {
  billingInfo: {},
  changeBillingInfo: () => {},
  canUpgrade: false,
  currentOrganization: null,
  currentPaymentMethod: {},
  isLoading: false,
  setIsFetchedCard: () => {},
  hasClientSecret: false,
  getNewSecret: () => {},
};

function PaymentForm({
  billingInfo,
  changeBillingInfo,
  canUpgrade,
  currentOrganization,
  currentPaymentMethod,
  isLoading,
  newOrganization,
  setNewOrganization,
  setIsFetchedCard,
  hasClientSecret,
  getNewSecret,
}) {
  const { period, plan, returnUrl } = useMatchPaymentRoute();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const isOnOldPlan = plan === Plans.BUSINESS;
  const searchParams = new URLSearchParams(location.search);

  const onOrganizationSelect = (item) => {
    const paymentUtilities = new PaymentUtilities(item.payment);
    if (!hasClientSecret && currentPaymentMethod && paymentUtilities.isFree()) {
      getNewSecret();
    }
    setIsFetchedCard(false);
    if ((paymentUtilities.isNewPlan() || paymentUtilities.isFree()) && isOnOldPlan) {
      const destinationPaymentType = paymentUtilities.isFree() ? Plans.ORG_PRO : paymentUtilities.getType();
      const paymentSerializer = new PaymentUrlSerializer().period(period).plan(destinationPaymentType).of(item.value);
      navigate(paymentSerializer.get());
    } else {
      // Remove query param returnUrl when selecting to another org
      if (returnUrl) {
        searchParams.delete(UrlSearchParam.RETURN_URL);
      }
      searchParams.set(UrlSearchParam.PAYMENT_ORG_TARGET, item.value);
      navigate(
        {
          pathname: location.pathname,
          search: searchParams.toString(),
        },
        { replace: true }
      );
      changeBillingInfo('organizationId', item.value);
    }
  };

  const onSizeChange = useCallback(
    (size) => {
      changeBillingInfo('quantity', Number(size));
    },
    [changeBillingInfo]
  );

  if (isEnableReskin) {
    return (
      <Paper shadow="sm" radius="md" className={styles.container}>
        <div className={styles.paymentForm}>
          <OrganizationInfo
            onOrganizationSelect={onOrganizationSelect}
            onSizeChange={onSizeChange}
            currentOrganization={currentOrganization}
            newOrganization={newOrganization}
            setNewOrganization={setNewOrganization}
          />
          <div className={styles.paymentDetail}>
            <Text component="h2" type="headline" size="md" className={styles.title}>
              {commonUtils.formatTitleCaseByLocale(t('payment.paymentDetails'))}
            </Text>
            <StripePaymentForm
              billingInfo={billingInfo}
              changeBillingInfo={changeBillingInfo}
              currentPaymentMethod={currentPaymentMethod}
              isLoadingCardInfo={isLoading}
              canUpgrade={canUpgrade}
              currentOrganization={currentOrganization}
            />
          </div>
        </div>
        <PaymentEncryptedCert />
      </Paper>
    );
  }

  return (
    <Styled.Card>
      <Styled.CardTopContainer>
        <OrganizationInfo
          onOrganizationSelect={onOrganizationSelect}
          onSizeChange={onSizeChange}
          currentOrganization={currentOrganization}
          newOrganization={newOrganization}
          setNewOrganization={setNewOrganization}
        />
        <Styled.CardTop>
          <Styled.CardTitle>{commonUtils.formatTitleCaseByLocale(t('payment.paymentDetails'))}</Styled.CardTitle>
        </Styled.CardTop>
      </Styled.CardTopContainer>
      <Styled.CardBody>
        <StripePaymentForm
          billingInfo={billingInfo}
          changeBillingInfo={changeBillingInfo}
          currentPaymentMethod={currentPaymentMethod}
          isLoadingCardInfo={isLoading}
          canUpgrade={canUpgrade}
          currentOrganization={currentOrganization}
        />
      </Styled.CardBody>
    </Styled.Card>
  );
}

PaymentForm.propTypes = propTypes;
PaymentForm.defaultProps = defaultProps;

export default React.memo(PaymentForm);
