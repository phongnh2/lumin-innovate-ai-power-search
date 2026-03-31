import { Paper, Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router';

import FreeTrialContext from 'lumin-components/OrganizationFreeTrial/FreeTrialContext';
import PaymentEncryptedCert from 'lumin-components/PaymentEncryptedCert';
import OrganizationInfo from 'lumin-components/PaymentForm/components/OrganizationInfo';
import { FreeTrialBoardContext } from 'luminComponents/FreeTrialBoard/context';

import { useClaimFreeTrial, useMatchPaymentRoute, useOrganizationPayment, useTranslation } from 'hooks';

import { commonUtils } from 'utils';
import { EVENT_FIELD_ACTION, EVENT_FIELD_NAME } from 'utils/Factory/EventCollection/PaymentEventCollection';
import { PaymentUtilities } from 'utils/Factory/Payment';

import { DEFAULT_FREE_TRIAL_CURRENCY } from 'constants/paymentConstant';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import PaymentElementForm from '../PaymentElementForm';

import styles from './FreeTrialForm.module.scss';

const propTypes = {
  hasClientSecret: PropTypes.bool,
  getNewSecret: PropTypes.func,
};

const defaultProps = {
  hasClientSecret: false,
  getNewSecret: () => {},
};

function FreeTrialForm({ hasClientSecret, getNewSecret }) {
  const { newOrganization, setNewOrganization } = useContext(FreeTrialBoardContext);
  const { t } = useTranslation();
  const { setBillingInfo, billingInfo, setIsFetchedCard, currentPaymentMethod } = useContext(FreeTrialContext);
  const { currentOrganization } = useOrganizationPayment({ billingInfo });
  const { trackUserFillPaymentForm } = useClaimFreeTrial({ newOrganization });
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { returnUrl } = useMatchPaymentRoute();
  const searchParams = new URLSearchParams(search);

  const onOrganizationSelect = (item) => {
    // Remove query param returnUrl when selecting to another org
    const paymentUtilities = new PaymentUtilities(item.payment);
    if (!hasClientSecret && currentPaymentMethod && paymentUtilities.isFree()) {
      getNewSecret();
    }
    setIsFetchedCard(false);
    if (returnUrl) {
      searchParams.delete(UrlSearchParam.RETURN_URL);
    }
    searchParams.set(UrlSearchParam.PAYMENT_ORG_TARGET, item.value);
    navigate(
      {
        pathname,
        search: searchParams.toString(),
      },
      { replace: true }
    );
    trackUserFillPaymentForm({ fieldName: EVENT_FIELD_NAME.CIRCLE_DROPDOWN, action: EVENT_FIELD_ACTION.COMPLETED });
    const currency = item.payment.currency || DEFAULT_FREE_TRIAL_CURRENCY;
    setBillingInfo((prev) => ({
      ...prev,
      organizationId: item.value,
      currency,
    }));
  };

  return (
    <Paper radius="md" shadow="sm" className={styles.container}>
      <div className={styles.paymentForm}>
        <OrganizationInfo
          onOrganizationSelect={onOrganizationSelect}
          currentOrganization={currentOrganization}
          newOrganization={newOrganization}
          setNewOrganization={setNewOrganization}
        />
        <div className={styles.paymentDetail}>
          <Text type="headline" size="md" className={styles.cardTitle}>
            {commonUtils.formatTitleCaseByLocale(t('freeTrialPage.paymentDetails'))}
          </Text>
          <PaymentElementForm />
        </div>
      </div>
      <PaymentEncryptedCert />
    </Paper>
  );
}

FreeTrialForm.propTypes = propTypes;
FreeTrialForm.defaultProps = defaultProps;

export default React.memo(FreeTrialForm);
