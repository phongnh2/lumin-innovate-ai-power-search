import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

export const getBorder = (color) => `1px solid ${color}`;

const LIGHT_CHECKBOX_COLOR = {
  uncheck: {
    border: getBorder(Colors.NEUTRAL_30),
    background: Colors.WHITE,
    color: Colors.WHITE,
  },
  checked: {
    border: 'none',
    background: Colors.NEUTRAL_100,
    color: Colors.WHITE,
  },
  uncheckDisabled: {
    border: getBorder(Colors.NEUTRAL_10),
    background: Colors.WHITE,
    color: Colors.WHITE,
  },
  checkedDisabled: {
    border: 'none',
    background: Colors.NEUTRAL_30,
    color: Colors.WHITE,
  },
};
const DARK_CHECKBOX_COLOR = {
  uncheck: {
    border: getBorder(Colors.NEUTRAL_60),
    background: Colors.NEUTRAL_100,
    color: Colors.WHITE,
  },
  checked: {
    border: 'none',
    background: Colors.NEUTRAL_5,
    color: Colors.NEUTRAL_100,
  },
  uncheckDisabled: {
    border: getBorder(Colors.NEUTRAL_80),
    background: 'transparent',
    color: Colors.WHITE,
  },
  checkedDisabled: {
    border: 'none',
    background: Colors.NEUTRAL_60,
    color: Colors.NEUTRAL_100,
  },
};

export const CHECKBOX_THEME = {
  [THEME_MODE.LIGHT]: LIGHT_CHECKBOX_COLOR,
  [THEME_MODE.DARK]: DARK_CHECKBOX_COLOR,
};

export const checkboxColorGetter = ({ theme }) => theme.SharedComponents.Checkbox || {
  uncheck: {}, disabled: {}, checked: {},
};
