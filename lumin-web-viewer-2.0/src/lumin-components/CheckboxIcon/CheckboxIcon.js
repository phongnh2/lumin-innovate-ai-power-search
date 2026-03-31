import PropTypes from 'prop-types';
import React from 'react';
import { useTheme } from 'styled-components';

import Icomoon from 'lumin-components/Icomoon';

import { Colors } from 'constants/styles';
import themeConstants from 'constants/theme';

import * as Styled from './CheckboxIcon.styled';

const propTypes = {
  border: PropTypes.string,
  checkedColor: PropTypes.string,
  checked: PropTypes.bool,
  indeterminate: PropTypes.bool,
  disabled: PropTypes.bool,
  size: PropTypes.number,
  className: PropTypes.string,
  background: PropTypes.string,
};
const defaultProps = {
  border: Colors.NEUTRAL_30,
  checkedColor: null,
  indeterminate: false,
  disabled: false,
  size: 20,
  className: null,
  checked: false,
  background: undefined,
};

function CheckboxIcon({ border, checkedColor, checked, indeterminate, size, className, background, disabled }) {
  const theme = useTheme();

  const colorSuit = themeConstants.Checkbox.checkboxColorGetter({ theme });

  return (
    <Styled.ContainerReskin
      $border={border}
      $checkedColor={checkedColor}
      $size={size}
      $background={background}
      $checked={checked}
      $disabled={disabled}
      className={className}
    >
      {checked && (
        <Icomoon
          size={Math.floor(size / 2)}
          color={disabled ? colorSuit.checkedDisabled.color : colorSuit.checked.color}
          className={indeterminate ? 'minus' : 'check'}
        />
      )}
    </Styled.ContainerReskin>
  );
}

CheckboxIcon.propTypes = propTypes;
CheckboxIcon.defaultProps = defaultProps;

export default React.memo(CheckboxIcon);
