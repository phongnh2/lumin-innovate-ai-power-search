import PropTypes from 'prop-types';
import React from 'react';
import { NumericFormat } from 'react-number-format';

const ZoomNumericInput = React.forwardRef((props, ref) => {
  const { onChange, ...other } = props;
  const onValueChange = (values) => {
    onChange(values.floatValue);
  };
  return <NumericFormat {...other} getInputRef={ref} onValueChange={onValueChange} valueIsNumericString suffix="%" />;
});

ZoomNumericInput.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default ZoomNumericInput;
