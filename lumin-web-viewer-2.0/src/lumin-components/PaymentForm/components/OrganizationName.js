import { TextInput } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import Input from 'lumin-components/Shared/Input';

import { useTranslation, useClaimFreeTrial } from 'hooks';

import { getErrorMessageTranslated } from 'utils';
import { EVENT_FIELD_ACTION, EVENT_FIELD_NAME } from 'utils/Factory/EventCollection/PaymentEventCollection';
import Yup, { yupValidator } from 'utils/yup';

function OrganizationName({ newOrganization, setNewOrganization, isEnableReskin }) {
  const { t } = useTranslation();
  const { trackUserFillPaymentForm } = useClaimFreeTrial({ newOrganization });
  const isPurchasing = useSelector(selectors.getPurchaseState);
  const setFieldValue = (field, value) => {
    setNewOrganization((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const schema = useMemo(
    () =>
      Yup.object().shape({
        name: yupValidator().organizationName,
      }),
    []
  );

  const validateOrgName = (name) =>
    schema
      .validate({ name })
      .then(() => {
        setFieldValue('error', null);
      })
      .catch((e) => {
        setFieldValue('error', e.message);
      });

  const onInputChange = (e) => {
    const { value } = e.target;
    setFieldValue('name', value);
    validateOrgName(value);
  };

  const onBlur = () => {
    validateOrgName(newOrganization.name);
    if (!newOrganization.error) {
      trackUserFillPaymentForm({ fieldName: EVENT_FIELD_NAME.CIRCLE_DROPDOWN, action: EVENT_FIELD_ACTION.COMPLETED });
    }
  };

  if (isEnableReskin) {
    return (
      <TextInput
        onChange={onInputChange}
        onBlur={onBlur}
        value={newOrganization.name}
        error={getErrorMessageTranslated(newOrganization.error)}
        placeholder={t('common.eg', { egText: 'Lisa B' })}
        disabled={isPurchasing}
        autoFocus
        size="lg"
      />
    );
  }

  return (
    <Input
      onChange={onInputChange}
      onBlur={onBlur}
      value={newOrganization.name}
      errorMessage={getErrorMessageTranslated(newOrganization.error)}
      placeholder={t('common.eg', { egText: 'Lisa B' })}
      disabled={isPurchasing}
      autoFocus
    />
  );
}

OrganizationName.defaultProps = {
  isEnableReskin: false,
};

OrganizationName.propTypes = {
  newOrganization: PropTypes.object.isRequired,
  setNewOrganization: PropTypes.func.isRequired,
  isEnableReskin: PropTypes.bool,
};

export default OrganizationName;
