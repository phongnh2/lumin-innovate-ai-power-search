import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

const LIGHT_MENU_ITEM = {
  root: {
    background: 'transparent',
    color: Colors.NEUTRAL_80,
  },
  hover: {
    background: Colors.NEUTRAL_10,
    color: Colors.NEUTRAL_80,
  },
};
const DARK_MENU_ITEM = {
  root: {
    background: 'transparent',
    color: Colors.NEUTRAL_40,
  },
  hover: {
    background: Colors.NEUTRAL_80,
    color: Colors.NEUTRAL_20,
  },
};

export const MENU_ITEM_THEME = {
  [THEME_MODE.LIGHT]: LIGHT_MENU_ITEM,
  [THEME_MODE.DARK]: DARK_MENU_ITEM,
};

export const menuItemColorGetter = ({ theme }) => theme.SharedComponents.MenuItem || {
  root: {}, hover: {},
};
