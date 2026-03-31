import { Chip, Radio, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';

import styles from './PeriodSwitch.module.scss';

type RadioListType = {
  value: string;
  label: string;
  name: string;
  showDiscount: boolean;
  purpose: string;
};

type Props = {
  periodList: RadioListType[];
  period: string;
  onChange: (value: string) => void;
};

const PeriodSwitch = ({ periodList, period, onChange }: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      {periodList.map((item, index) => {
        const isChecked = period === item.value;
        return (
          <div
            data-checked={isChecked}
            key={index}
            onClick={() => onChange(item.value)}
            className={styles.itemWrapper}
            role="presentation"
          >
            <label htmlFor={item.value} className={styles.labelGroup}>
              <div className={styles.checkboxContainer}>
                <Radio
                  id={item.value}
                  checked={isChecked}
                  onChange={() => onChange(item.value)}
                  name="trial-period"
                  data-lumin-btn-name={item.name}
                  data-lumin-btn-purpose={item.purpose}
                />
                <Text size="md" type="body">
                  {item.label}
                </Text>
                {item.showDiscount && (
                  <div className={styles.discount}>
                    <Chip colorType="blue" variant="solid" label={t('payment.save5Months')} rounded size="sm" />
                  </div>
                )}
              </div>
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default PeriodSwitch;
