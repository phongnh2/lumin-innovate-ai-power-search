import PropTypes from 'prop-types';
import React from 'react';

import * as Styled from './Textarea.styled';

function Textarea(props) {
  const {
    value,
    placeholder,
    label,
    maxLength,
    errorMessage,
    onChange,
    onBlur,
    onFocus,
    disabled,
    name,
    autoFocus,
    ...otherProps
  } = props;
  const handleFocus = (e) => {
    onFocus(e);
  };

  const handleBlur = (e) => {
    onBlur(e);
  };

  const labelType = typeof label === 'string' ? 'label' : 'div';

  return (
    <Styled.Container>
      <Styled.Label as={labelType}>{label}</Styled.Label>
      <Styled.Textarea
        name={name}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        onChange={onChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        $hasError={Boolean(errorMessage)}
        autoFocus={autoFocus}
        {...otherProps}
      />
      {errorMessage && <Styled.ErrorMessage>{errorMessage}</Styled.ErrorMessage>}
    </Styled.Container>
  );
}

Textarea.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  label: PropTypes.node,
  maxLength: PropTypes.number,
  errorMessage: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  name: PropTypes.string,
  autoFocus: PropTypes.bool,
};

Textarea.defaultProps = {
  value: '',
  placeholder: '',
  label: '',
  maxLength: 1000,
  errorMessage: '',
  disabled: false,
  onBlur: () => {},
  onFocus: () => {},
  name: '',
  autoFocus: false,
};

export default Textarea;
