import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

export const lightTheme = {
  background: Colors.WHITE,
  border: Colors.NEUTRAL_20,
  textPrimary: Colors.NEUTRAL_100,
  textSecondary: Colors.NEUTRAL_40,
  textActive: Colors.NEUTRAL_80,
  hover: Colors.NEUTRAL_10,
  hoverIcon: '',
  checkboxText: Colors.NEUTRAL_60,
};

export const darkTheme = {
  background: Colors.NEUTRAL_100,
  border: Colors.NEUTRAL_80,
  textPrimary: Colors.NEUTRAL_20,
  textSecondary: Colors.NEUTRAL_60,
  textActive: Colors.NEUTRAL_20,
  hover: Colors.NEUTRAL_80,
  hoverIcon: Colors.NEUTRAL_40,
  checkboxText: Colors.NEUTRAL_40,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};
