import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import { THEME_MODE } from 'constants/lumin-common';

const lightTheme = {
  background: Colors.NEUTRAL_0,
  border: Colors.NEUTRAL_100,
  textPrimary: Colors.NEUTRAL_100,
  textSelected: Colors.PRIMARY_90,
  selected: Colors.PRIMARY_40,
  divider: Colors.NEUTRAL_20,
  icon: Colors.NEUTRAL_40,
};

const darkTheme = {
  background: Colors.NEUTRAL_100,
  border: Colors.NEUTRAL_0,
  textPrimary: Colors.NEUTRAL_10,
  textSelected: Colors.PRIMARY_90,
  selected: Colors.PRIMARY_40,
  divider: Colors.NEUTRAL_80,
  icon: Colors.NEUTRAL_40,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const StyledTabLabelContent = styled.div`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.textPrimary};
`;

export const StyledContent = styled.div`
  padding: 16px;
`;

export const StyledTabContentDivider = styled.div`
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.divider};
  transition: background-color .3s ease;
  margin: 16px 0;
`;
