import { FormControlLabel } from '@mui/material';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import { RadioGroup, Radio as KiwiRadio, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useNavigate } from 'react-router';

import Radio from 'lumin-components/Shared/Radio';

import { useEnableWebReskin, useMatchPaymentRoute, useTranslation } from 'hooks';

import { PaymentUrlSerializer } from 'utils/payment';

import { PERIOD } from 'constants/plan';
import { Colors } from 'constants/styles';

import * as Styled from './PeriodGroup.styled';

import styles from './PeriodGroup.module.scss';

const useStyles = makeStyles({
  root: {
    margin: 0,
  },
  label: {
    marginLeft: 10,
    color: Colors.NEUTRAL_70,
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 600,
  },
  labelActive: {
    color: Colors.NEUTRAL_100,
  },
});

const getPeriods = (t) => [
  {
    label: t('payment.monthlyBilling'),
    value: PERIOD.MONTHLY,
  },
  {
    label: t('payment.annualBilling'),
    value: PERIOD.ANNUAL,
    style: { marginLeft: 28 },
  },
];

function PeriodGroup() {
  const navigate = useNavigate();
  const classes = useStyles();
  const { period, plan } = useMatchPaymentRoute();
  const { labelActive, ...validClasses } = classes;
  const { t } = useTranslation();
  const periods = getPeriods(t);
  const { isEnableReskin } = useEnableWebReskin();

  const getClasses = (active) => ({
    ...validClasses,
    ...(active && {
      label: classNames(classes.label, labelActive),
    }),
  });

  const onChange = (newPeriod) => {
    const urlSerializer = new PaymentUrlSerializer().plan(plan).period(newPeriod);
    navigate(
      {
        pathname: urlSerializer.get(),
        search: window.location.search,
      },
      { replace: true }
    );
  };

  if (isEnableReskin) {
    return (
      <RadioGroup
        value={period}
        name="payment-period"
        onChange={(value) => onChange(value)}
        className={styles.radioGroup}
      >
        <div className={styles.radioGroupContent}>
          {periods.map(({ label, value }) => (
            <KiwiRadio
              key={value}
              label={
                <Text component="span" type="headline" size="xs">
                  {label}
                </Text>
              }
              value={value}
            />
          ))}
        </div>
      </RadioGroup>
    );
  }

  return (
    <Styled.RadioGroup value={period} name="payment-period" onChange={(e) => onChange(e.target.value)}>
      {periods.map(({ label, value, style }) => (
        <FormControlLabel
          key={value}
          classes={getClasses(period === value)}
          value={value}
          control={<Radio size={20} />}
          label={label}
          style={style}
        />
      ))}
    </Styled.RadioGroup>
  );
}

export default PeriodGroup;
