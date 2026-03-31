import { makeStyles } from '@mui/styles';
import { THEME_MODE } from 'constants/lumin-common';

import { Colors } from 'constants/styles';

const lightTheme = {
  switchBase: Colors.NEUTRAL_30,
  switchBaseChecked: Colors.WHITE,
  switchBaseCheckedTrackBg: Colors.NEUTRAL_100,
  switchBaseCheckedTrackBorder: Colors.NEUTRAL_100,
  trackBg: Colors.WHITE,
  trackBorder: Colors.NEUTRAL_60,
};

const darkTheme = {
  switchBase: Colors.NEUTRAL_60,
  switchBaseChecked: Colors.NEUTRAL_100,
  switchBaseCheckedTrackBg: Colors.WHITE,
  switchBaseCheckedTrackBorder: Colors.WHITE,
  trackBg: Colors.NEUTRAL_100,
  trackBorder: Colors.NEUTRAL_30,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const useStyles = makeStyles({
  root: {
    width: 30,
    height: 18,
    padding: 0,
  },
  switchBase: {
    color: ({ themeMode }) => theme[themeMode].switchBase,
    padding: 3,
    transition: 'all 0.5s ease',
    boxSizing: 'border-box',

    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: ({ themeMode }) => theme[themeMode].switchBaseChecked,
      fontSize: '12px',
      '& + .MuiSwitch-track': {
        backgroundColor: ({ themeMode }) => theme[themeMode].switchBaseCheckedTrackBg,
        opacity: 1,
        border: '1px solid',
        borderColor: ({ themeMode }) => theme[themeMode].switchBaseCheckedTrackBorder,
      },
    },
    '&&.Mui-disabled': {
      opacity: 1,
      backgroundColor: Colors.NEUTRAL_20,
      color: Colors.NEUTRAL_30,
      border: 'none',
      '& + .MuiSwitch-track': {
        backgroundColor: Colors.NEUTRAL_20,
        opacity: 1,
        border: '1px solid',
        borderColor: Colors.NEUTRAL_20,
        cursor: 'not-allowed',
      },
    },
  },
  thumb: {
    width: 12,
    height: 12,
    boxShadow: 'none',
  },
  track: {
    borderRadius: 9999,
    backgroundColor: ({ themeMode }) => theme[themeMode].trackBg,
    border: '1px solid',
    borderColor: ({ themeMode }) => theme[themeMode].trackBorder,
    opacity: 1,
    boxSizing: 'border-box',
  },
  checked: {
    color: ({ themeMode }) => theme[themeMode].switchBaseChecked,
  },
  disabled: {},
});
