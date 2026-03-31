import cloneDeep from 'lodash/cloneDeep';
import { Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import MaterialSelect from 'lumin-components/MaterialSelect';
import DefaultSelect from 'luminComponents/DefaultSelect';

import { useEnableWebReskin, useTranslation, usePaymentFreeTrialPageReskin } from 'hooks';

import { CURRENCY } from 'constants/paymentConstant';
import { Colors } from 'constants/styles';

import * as InputStripeStyled from '../InputStripe/InputStripe.styled';

import * as Styled from './CurrencyPicker.styled';

import styles from './CurrencyPicker.module.scss';

CurrencyPicker.propTypes = {
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  value: PropTypes.oneOf(Object.values(CURRENCY).map((item) => item.value)).isRequired,
  onChange: PropTypes.func,
};
CurrencyPicker.defaultProps = {
  onChange: () => {},
  disabled: false,
  readOnly: false,
};

const FORMAT_CURRENCY = cloneDeep(CURRENCY);
const AVAILABLE_CURRENCIES = Object.values(FORMAT_CURRENCY).map((item) => {
  item.label = `${item.name}`;
  item.note = `- ${item.note}`;
  item.class = 'CurrencyPicker__value';
  return item;
});

function CurrencyPicker({ disabled, readOnly, value, onChange }) {
  const { t } = useTranslation();
  const { isEnableReskinUI } = usePaymentFreeTrialPageReskin();
  const { isEnableReskin } = useEnableWebReskin();

  const StyledComponents = isEnableReskinUI
    ? {
        Label: InputStripeStyled.LabelReskin,
        Container: Styled.ContainerReskin,
      }
    : {
        Label: InputStripeStyled.Label,
        Container: Styled.Container,
      };

  const materialSelectExtraProps = isEnableReskinUI
    ? {
        containerClasses: 'CurrencyPicker__container',
        inputClasses: 'CurrencyPicker__input',
        arrowIcon: 'arrow-up',
        arrowStyle: {
          color: disabled ? Colors.NEUTRAL_40 : Colors.LUMIN_SIGN_PRIMARY,
          size: 10,
        },
      }
    : {};

  const renderOption = ({ option }) => (
    <Text className={styles.option}>
      {option?.name} {option?.note}
    </Text>
  );

  if (isEnableReskin) {
    return (
      <StyledComponents.Container $readOnly={readOnly}>
        <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)" className={styles.label}>
          {t('freeTrialPage.currency')}
        </Text>
        <DefaultSelect
          data={AVAILABLE_CURRENCIES}
          size="lg"
          readOnly={readOnly || disabled}
          renderOption={renderOption}
          onChange={(_value) => {
            onChange('currency', _value);
          }}
          value={value}
        />
      </StyledComponents.Container>
    );
  }

  return (
    <StyledComponents.Container $readOnly={readOnly}>
      <InputStripeStyled.Header>
        <StyledComponents.Label>{t('freeTrialPage.currency')}</StyledComponents.Label>
      </InputStripeStyled.Header>
      <MaterialSelect
        value={value}
        onSelected={(item) => onChange('currency', item.value)}
        arrowStyle={{
          color: disabled ? Colors.NEUTRAL_40 : Colors.NEUTRAL_80,
          size: 10,
        }}
        readOnly={readOnly}
        disabled={disabled}
        items={AVAILABLE_CURRENCIES}
        {...materialSelectExtraProps}
      />
    </StyledComponents.Container>
  );
}

export default CurrencyPicker;
