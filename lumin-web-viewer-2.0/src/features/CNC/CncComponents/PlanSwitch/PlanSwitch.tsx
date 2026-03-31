import { Radio, Text } from 'lumin-ui/kiwi-ui';
import React, { useRef } from 'react';

import { numberUtils, paymentUtil } from 'utils';

import { PRICE } from 'constants/plan';
import { PaymentCurrency, PaymentPeriod } from 'constants/plan.enum';

import { PlanType } from '../OrganizationCheckout/OrganizationCheckoutContext';

import styles from './PlanSwitch.module.scss';

type Props = {
  planList: PlanType[];
  period: string;
  onChange: ({ _plan, _trial }: { _plan: string; _trial: boolean }) => void;
  currency: string;
  plan: string;
};

// Define the PRICE structure type
type PriceStructure = {
  V3: {
    [key in PaymentPeriod]: {
      ORG_STARTER: number;
      ORG_PRO: number;
      ORG_BUSINESS: number;
      [key: string]: number;
    };
  };
};

const PlanSwitch = ({ planList, period, onChange, currency, plan }: Props): JSX.Element => {
  const currencySymbol = paymentUtil.convertCurrencySymbol(currency as PaymentCurrency);
  const radioRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleClick = (item: PlanType, index: number) => {
    radioRefs.current[index]?.click();
  };

  return (
    <div className={styles.wrapper}>
      {planList.map((item, index) => {
        const isChecked = plan === item.value;
        return (
          <div
            data-checked={isChecked}
            key={index}
            onClick={() => handleClick(item, index)}
            className={styles.itemWrapper}
            role="presentation"
          >
            <label htmlFor={item.value} className={styles.labelGroup}>
              <div className={styles.checkboxContainer}>
                <Radio
                  id={item.value}
                  checked={isChecked}
                  onChange={() => onChange({ _plan: item.value, _trial: item.isTrial })}
                  name="trial-plan"
                  data-lumin-btn-name={item.name}
                  data-lumin-btn-purpose={item.purpose}
                  ref={(el) => {
                    radioRefs.current[index] = el;
                  }}
                />
                <Text size="md" type="headline">
                  {item.label}
                </Text>
              </div>
            </label>
            <div className={styles.description} data-checked={isChecked}>
              <Text type="headline" size="xl">
                {`${currencySymbol}${numberUtils.formatDecimal(
                  Math.abs((PRICE as PriceStructure).V3[period as PaymentPeriod][item.value])
                )}`}
                &nbsp;
              </Text>
              <Text type="body" size="lg">
                {period === PaymentPeriod.ANNUAL ? '/year' : '/month'}
              </Text>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlanSwitch;
