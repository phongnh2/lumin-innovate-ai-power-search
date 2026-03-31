import PropTypes from 'prop-types';
import React, { useMemo, useState, useContext, useEffect } from 'react';

import FreeTrialContext from 'lumin-components/OrganizationFreeTrial/FreeTrialContext';

import withStripeElements from 'HOC/withStripeElements';

import { useEnableWebReskin, usePaymentFreeTrialPageReskin } from 'hooks';

import { COMMON_FORM_INFO } from 'utils/Factory/EventCollection/FormEventCollection';

import { LocalStorageKey } from 'constants/localStorageKey';
import { CURRENCY } from 'constants/paymentConstant';

import FreeTrialForm from './components/FreeTrialForm';
import FreeTrialTempBilling from './components/FreeTrialTempBilling';
import { FreeTrialBoardContext } from './context';

import * as Styled from './FreeTrialBoard.styled';

const { formName, formPurpose } = COMMON_FORM_INFO.claimFreeTrial;

FreeTrialBoard.propTypes = {
  stripeAccountId: PropTypes.string,
  getNewSecret: PropTypes.func.isRequired,
  hasClientSecret: PropTypes.bool,
};

FreeTrialBoard.defaultProps = {
  stripeAccountId: '',
  hasClientSecret: false,
};

function FreeTrialBoard(props) {
  const { stripeAccountId, getNewSecret, hasClientSecret } = props;
  const { setBillingInfo } = useContext(FreeTrialContext);
  const { isEnableReskinUI } = usePaymentFreeTrialPageReskin();
  const { isEnableReskin } = useEnableWebReskin();

  useEffect(() => {
    if (stripeAccountId) {
      const isStripeLimitCurrency = stripeAccountId === process.env.STRIPE_US_ACCOUNT_ID;
      if (isStripeLimitCurrency) {
        localStorage.setItem(LocalStorageKey.CURRENCY, CURRENCY.USD.value);
      }
      setBillingInfo((prev) => ({
        ...prev,
        ...(isStripeLimitCurrency && { currency: CURRENCY.USD.value }),
        stripeAccountId,
      }));
    }
  }, [stripeAccountId]);

  const [newOrganization, setNewOrganization] = useState({ name: '', error: '' });
  const context = useMemo(
    () => ({
      newOrganization,
      setNewOrganization,
      getNewSecret,
    }),
    [newOrganization]
  );

  const StyledComponents = isEnableReskinUI
    ? {
        Billing: isEnableReskin ? Styled.BillingReskin : Styled.BillingNewUI,
      }
    : {
        Billing: Styled.Billing,
      };

  return (
    <FreeTrialBoardContext.Provider value={context}>
      <StyledComponents.Billing formName={formName} formPurpose={formPurpose}>
        <FreeTrialForm hasClientSecret={hasClientSecret} getNewSecret={getNewSecret} />
        <FreeTrialTempBilling />
      </StyledComponents.Billing>
    </FreeTrialBoardContext.Provider>
  );
}

export default withStripeElements(FreeTrialBoard, { action: 'paymentFreeTrial' });
