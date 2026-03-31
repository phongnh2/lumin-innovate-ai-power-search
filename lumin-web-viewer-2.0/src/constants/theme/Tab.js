import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

const LIGHT_TAB = {
  root: {
    background: 'transparent',
    color: Colors.NEUTRAL_60,
    barColor: 'transparent',
  },
  active: {
    background: 'transparent',
    color: Colors.NEUTRAL_100,
    barColor: Colors.SECONDARY_50,
  },
  hover: {
    background: Colors.NEUTRAL_5,
  },
};
const DARK_TAB = {
  root: {
    background: 'transparent',
    color: Colors.NEUTRAL_40,
    barColor: 'transparent',
  },
  active: {
    background: 'transparent',
    color: Colors.NEUTRAL_10,
    barColor: Colors.SECONDARY_50,
  },
  hover: {
    background: Colors.NEUTRAL_90,
  },
};

export const TAB_THEME = {
  [THEME_MODE.LIGHT]: LIGHT_TAB,
  [THEME_MODE.DARK]: DARK_TAB,
};

export const tabColorGetter = ({ theme }) => theme.SharedComponents.Tab || {
  root: {}, active: {}, hover: {},
};
