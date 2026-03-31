import { InputAdornment } from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';
import ToolButtonTooltip from 'luminComponents/ViewerCommonV2/ToolButton/ToolButtonTooltip';

import * as Styled from './ButtonSuffixInput.styled';

const ButtonSuffixInput = React.forwardRef((props, ref) => {
  const { onSuffixClick, inputComponent, onChange, value, tooltipProps, ...rest } = props;

  const onClick = () => {
    onSuffixClick();
  };

  const input = (
    <Styled.Input
      value={value}
      ref={ref}
      type="text"
      onChange={onChange}
      endAdornment={
        <InputAdornment position="end" onClick={onClick}>
          <Icomoon className="sm_down_stroke" size={20} />
        </InputAdornment>
      }
      inputComponent={inputComponent}
      {...rest}
    />
  );
  return !isEmpty(tooltipProps) ? <ToolButtonTooltip {...tooltipProps}>{input}</ToolButtonTooltip> : input;
});

ButtonSuffixInput.propTypes = {
  onSuffixClick: PropTypes.func,
  onChange: PropTypes.func,
  inputComponent: PropTypes.any,
  value: PropTypes.any,
  tooltipProps: PropTypes.object,
};

ButtonSuffixInput.defaultProps = {
  onSuffixClick: (f) => f,
  onChange: (f) => f,
  inputComponent: 'input',
  value: '',
  tooltipProps: {},
};

export default ButtonSuffixInput;
