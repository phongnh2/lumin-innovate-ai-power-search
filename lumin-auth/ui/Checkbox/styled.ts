import styled from '@emotion/styled';
import { Checkbox as MuiCheckbox } from '@mui/material';
import { pick } from 'lodash';

import { BorderRadius, Colors } from '../theme';

interface ICheckboxIconStyled {
  checked: boolean;
  disabled: boolean;
}

const getBackground = ({ checked, disabled }: ICheckboxIconStyled) => {
  if (disabled) {
    return checked ? Colors.NEUTRAL_30 : 'white';
  }
  return checked ? Colors.NEUTRAL_100 : 'white';
};

const getBorderColor = ({ checked, disabled }: ICheckboxIconStyled) => {
  if (disabled) {
    return checked ? Colors.NEUTRAL_30 : Colors.NEUTRAL_10;
  }
  return checked ? Colors.NEUTRAL_100 : Colors.NEUTRAL_30;
};

export const Checkbox = styled(MuiCheckbox)`
  opacity: 1;
`;

export const CheckboxIcon = styled.span<ICheckboxIconStyled>`
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border-radius: ${BorderRadius.Dense};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid;
  border-color: ${props => getBorderColor(pick(props, ['checked', 'disabled']))};
  background-color: ${props => getBackground(pick(props, ['checked', 'disabled']))};
  color: white;
  opacity: 1;
`;

export const CheckboxLabel = styled.label<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  margin-left: -9px;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  & > span {
    color: ${props => props.disabled && Colors.NEUTRAL_60};
  }
`;
