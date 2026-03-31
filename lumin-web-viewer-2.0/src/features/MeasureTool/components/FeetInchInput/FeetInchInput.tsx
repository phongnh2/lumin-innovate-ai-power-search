import { isNull } from 'lodash';
import { TextInput, TextInputProps } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { parseFtIn } from '../../utils/parseFtIn';
import { parseInch } from '../../utils/parseInch';
import styles from '../ScaleConfigModal/ScaleConfigModal.module.scss';

type FeetInchInputProps = TextInputProps & {
  isFractional?: boolean;
  precision?: number;
  unitType?: 'ft-in' | 'in';
  rightElement?: React.ReactElement;
};

const FeetInchInput = (props: FeetInchInputProps) => {
  const { value, onChange, onBlur, error: errorProp, isFractional, unitType = 'ft-in', rightElement, ...rest } = props;
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const getParseHandler = () => {
    if (unitType === 'in') {
      return parseInch;
    }
    return parseFtIn;
  };

  const getParseError = () => {
    if (unitType === 'in') {
      return t('viewer.measureTool.invalidInchFractionFormat');
    }
    return t('viewer.measureTool.invalidFeetInch', { context: isFractional ? 'fractional' : 'decimal' });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { value: currentValue } = e.target;
    const parsedValue = getParseHandler()(currentValue, isFractional);
    setError(isNull(parsedValue) ? getParseError() : null);
    onBlur?.(e);
  };

  return (
    <div>
      <div className={styles.inputGroup}>
        <TextInput
          {...rest}
          clearable={false}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          error={!!error || errorProp}
        />
        {rightElement}
      </div>
      {!!error && (
        <TextInput.Error
          style={{
            marginTop: 'var(--kiwi-spacing-0-5)',
          }}
        >
          {error}
        </TextInput.Error>
      )}
    </div>
  );
};

export default FeetInchInput;
