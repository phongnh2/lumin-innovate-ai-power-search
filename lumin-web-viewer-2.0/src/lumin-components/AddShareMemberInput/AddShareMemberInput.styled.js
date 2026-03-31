import { THEME_MODE } from 'constants/lumin-common';
import { Colors, Fonts } from 'constants/styles';

const lightTheme = {
  color: Colors.NEUTRAL_100,
  placeholder: Colors.NEUTRAL_40,
  menuItem: Colors.NEUTRAL_80,
  menuItemHover: Colors.NEUTRAL_80,
  menuItemBackground: Colors.NEUTRAL_10,
  background: {
    disabled: Colors.NEUTRAL_10,
  },
};

const darkTheme = {
  color: Colors.NEUTRAL_20,
  placeholder: Colors.NEUTRAL_60,
  menuItem: Colors.NEUTRAL_40,
  menuItemHover: Colors.NEUTRAL_20,
  menuItemBackground: Colors.NEUTRAL_80,
  background: {
    disabled: Colors.NEUTRAL_90,
  },
};

const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const styles = {
  input: {
    '&&': {
      padding: '0 0 0 40px',
      height: 'var(--input-height-small)',
      boxSizing: 'border-box',
      color: ({ themeMode }) => theme[themeMode].color || Colors.NEUTRAL_100,
      fontFamily: Fonts.PRIMARY,
      '&::placeholder': {
        color: ({ themeMode }) => theme[themeMode].placeholder || Colors.NEUTRAL_40,
      },
      '&:disabled': {
        background: ({ themeMode }) => theme[themeMode].background.disabled || Colors.NEUTRAL_10,
        cursor: 'not-allowed',
      },
      fontSize: 14,
      lineHeight: '20px',
    },
  },
  permissionItem: {
    fontFamily: Fonts.PRIMARY,
    height: 40,
    color: ({ themeMode }) => theme[themeMode].menuItem || Colors.NEUTRAL_80,
    fontSize: 14,
    '&:hover': {
      background: ({ themeMode }) => theme[themeMode].menuItemBackground || Colors.NEUTRAL_10,
      color: ({ themeMode }) => theme[themeMode].menuItemHover || Colors.NEUTRAL_80,
    },
  },
  notchedOutline: {
    border: 'none',
  }
};
