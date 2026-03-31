import { Badge, Radio, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import styles from './PeriodRadioList.module.scss';

type RadioListType = {
  value: string;
  label: string;
  name: string;
  description: {
    price: string;
    documents: string;
  };
  showDiscount?: boolean;
  disabled?: boolean;
};

type Props = {
  radioList: RadioListType[];
  period: string;
  onChange: (period: string) => void;
};

const PeriodRadioList = ({ radioList, period, onChange }: Props) => {
  const { t } = useTranslation();
  const { onKeyDown } = useKeyboardAccessibility();

  return (
    <div className={styles.wrapper}>
      {radioList.map((item, index) => {
        const isChecked = period === item.value;
        return (
          <label
            htmlFor={item.value}
            key={index}
            className={styles.itemWrapper}
            role="presentation"
            data-disabled={item.disabled}
          >
            <div className={styles.checkboxContainer}>
              <Radio
                id={item.value}
                checked={isChecked}
                onChange={() => onChange(item.value)}
                name={item.name}
                data-lumin-btn-name={item.name}
                onKeyDown={onKeyDown}
              />
              <Text size="md" type="body">
                {item.label}
              </Text>
            </div>
            {item.showDiscount && (
              <div>
                <Badge variant="blue" size="sm" className={styles.discount}>
                  {t('paymentFreeTrial.5MonthsSaved').toUpperCase()}
                </Badge>
              </div>
            )}
          </label>
        );
      })}
    </div>
  );
};

export default PeriodRadioList;
