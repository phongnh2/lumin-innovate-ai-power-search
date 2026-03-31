import styled from 'styled-components';
import ButtonBase from '@mui/material/ButtonBase';
import { rgba } from 'polished';
import { Colors, Fonts } from 'constants/styles';
import { styledPropConfigs } from 'utils/styled';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Button = styled(ButtonBase).withConfig(styledPropConfigs(['active']))`
  padding: 0 8px;
  height: 48px;
  border-radius: 4px;
  border: solid 2px ${({ active }) => (active ? Colors.DARK_SKY_BLUE : rgba(Colors.DARK_SKY_BLUE, 0.15))};
  background-color: ${({ active }) => (active ? rgba(Colors.DARK_SKY_BLUE, 0.15) : Colors.WHITE)};
  cursor: pointer;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  &>.MaterialAvatar {
    margin-right: 8px;
  }
  ${mediaQuery.md`
    padding: 0 16px;
    height: 56px;
  `}
`;

export const Title = styled.span.withConfig(styledPropConfigs(['active']))`
  font-weight: 400;
  color: ${({ active }) => (active ? Colors.DARK_SKY_BLUE : Colors.SECONDARY)};
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  white-space: nowrap;
`;
