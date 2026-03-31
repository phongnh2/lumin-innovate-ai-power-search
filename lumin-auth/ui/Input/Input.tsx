import { debounce, omit } from 'lodash';
import React, { forwardRef, isValidElement, ReactElement, ReactNode, useEffect, useState } from 'react';

import { INPUT_DEBOUNCE_TIME } from '@/constants/common';
import { useTrackFormEvent } from '@/hooks/useTrackingFormEvent';

import { IconRight } from './components';

import * as Styled from './Input.styled';

export type InputProps = {
  error?: string;
  label?: ReactNode;
  icon?: any;
  iconRight?: ReactElement | string | false;
  onClear?: (() => void) | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputClassName?: string;
  inputData?: Record<string, string>;
  inputValue?: string;
} & React.ComponentPropsWithRef<'input'>;

const Input = forwardRef<HTMLInputElement, InputProps>(({ icon, iconRight, error, label, onClear, onChange, inputData, inputValue, ...otherProps }, ref) => {
  const [showClearButton, setShowClearButton] = useState(onClear && !otherProps.readOnly && Boolean(inputValue));
  const { trackInputChange } = useTrackFormEvent();
  const debouncedOnChange = debounce(e => {
    trackInputChange(e);
  }, INPUT_DEBOUNCE_TIME);
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    debouncedOnChange(e);
    setShowClearButton(onClear && !otherProps.readOnly && Boolean(e.target.value));
  };

  useEffect(() => {
    setShowClearButton(onClear && !otherProps.readOnly && Boolean(inputValue));
  }, [inputValue, onClear, otherProps.readOnly]);
  return (
    <div className={otherProps.className}>
      {label && (isValidElement(label) ? label : <Styled.InputLabel htmlFor={otherProps.id}>{label}</Styled.InputLabel>)}

      <Styled.InputContainer>
        <Styled.Input
          {...omit(otherProps, 'inputClassName')}
          type={otherProps.type || 'text'}
          ref={ref}
          emotion={{
            icon,
            extendRightGap: Boolean(iconRight || showClearButton),
            error
          }}
          onChange={handleOnChange}
          className={otherProps.inputClassName}
          {...inputData}
        />
        {icon && <Styled.InputIcon tabIndex={-1} type={icon} size={16} />}
        {(iconRight || showClearButton) && (
          <Styled.IconRightWrapper tabIndex={-1}>
            <IconRight showClearButton={showClearButton} iconRight={iconRight} onClear={onClear} />
          </Styled.IconRightWrapper>
        )}
      </Styled.InputContainer>
      {error && <Styled.Error style={{ marginTop: 4 }}>{error}</Styled.Error>}
    </div>
  );
});
Input.displayName = 'Input';

Input.defaultProps = {
  error: undefined,
  label: undefined,
  icon: undefined,
  iconRight: undefined,
  onClear: undefined,
  inputData: {},
  inputValue: ''
};

export default Input;
