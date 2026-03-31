import { IconButton, NumberInput } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { Colors } from 'constants/styles';

import { StyledContainer, StyledInput, StyledButton } from './InputNumber.styled';

import styles from './InputNumber.module.scss';

function InputNumber(props) {
  const { onChange, value, min, max, step, disabled, onBlur, onFocus, isEnableReskin, ...otherProps } = props;

  const transformValue = (val) => {
    let newVal = val;
    if (typeof min !== 'undefined') {
      newVal = Math.max(newVal, min);
    }
    if (typeof max !== 'undefined') {
      newVal = Math.min(newVal, max);
    }
    return newVal;
  };

  const onInputBlur = (e) => {
    onBlur(e);
    onChange(transformValue(value));
  };

  const onMinus = () => {
    const newValue = Number(value) - step;
    onChange(transformValue(newValue));
  };
  const onPlus = () => {
    const newValue = Number(value) + step;
    onChange(transformValue(newValue));
  };

  useEffect(() => {
    if (isEnableReskin) {
      onChange(transformValue(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnableReskin, value]);

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <IconButton
          icon="minus-lg"
          size="lg"
          className={styles.buttonMinus}
          onClick={onMinus}
          disabled={(typeof min !== 'undefined' && value <= min) || disabled}
          data-cy="button_minus"
        />
        <NumberInput
          size="lg"
          onChange={(inputValue) => onChange(inputValue || 0)}
          value={value}
          onBlur={onInputBlur}
          disabled={disabled}
          onFocus={onFocus}
          min={min}
          max={max}
          classNames={{
            root: styles.root,
            wrapper: styles.wrapper,
            input: styles.input,
          }}
          allowDecimal={false}
          data-cy="input_number_of_members"
          {...otherProps}
        />
        <IconButton
          icon="plus-lg"
          size="lg"
          className={styles.buttonPlus}
          onClick={onPlus}
          disabled={(typeof max !== 'undefined' && value >= max) || disabled}
          data-cy="button_plus"
        />
      </div>
    );
  }

  return (
    <StyledContainer>
      <StyledButton
        icon="minus"
        className="button--borderred"
        size={40}
        iconSize={16}
        iconColor={Colors.WHITE}
        onClick={onMinus}
        disabled={typeof min !== 'undefined' && value <= min || disabled}
      />
      <StyledInput
        type="number"
        onChange={(e) => onChange(transformValue(e.target.value || 0))}
        value={value}
        onBlur={onInputBlur}
        disabled={disabled}
        onFocus={onFocus}
        min={min}
        max={max}
        {...otherProps}
      />
      <StyledButton
        icon="plus-thin"
        className="button--borderred"
        size={40}
        iconSize={16}
        iconColor={Colors.WHITE}
        onClick={onPlus}
        disabled={typeof max !== 'undefined' && value >= max || disabled}
      />
    </StyledContainer>
  );
}

InputNumber.defaultProps = {
  value: null,
  step: 1,
  min: undefined,
  max: undefined,
  onFocus: () => {},
  onBlur: () => {},
  disabled: false,
  isEnableReskin: false,
};

InputNumber.propTypes = {
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  disabled: PropTypes.bool,
  isEnableReskin: PropTypes.bool,
};

export default InputNumber;
