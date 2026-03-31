import classNames from 'classnames';
import merge from 'lodash/merge';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';

import { THEME_MODE } from 'constants/lumin-common';

import { Colors } from '../styles/Colors';

const getButtonBorder = (color) => (color ? `1px solid ${color}` : null);

const LIGHT_BUTTON_COLORS = {
  [ButtonColor.PRIMARY_RED]: {
    root: {
      color: Colors.NEUTRAL_0,
      background: Colors.SECONDARY_50,
    },
    hover: {
      color: Colors.NEUTRAL_0,
      background: Colors.SECONDARY_60,
    },
    pressed: {
      color: Colors.NEUTRAL_0,
      background: Colors.SECONDARY_70,
    },
    disabled: {
      color: Colors.NEUTRAL_0,
      background: Colors.SECONDARY_30,
    },
  },
  [ButtonColor.SECONDARY_RED]: {
    root: {
      color: Colors.SECONDARY_50,
      background: 'transparent',
      border: getButtonBorder(Colors.SECONDARY_50),
    },
    hover: {
      color: Colors.SECONDARY_50,
      background: Colors.SECONDARY_10,
      border: getButtonBorder(Colors.SECONDARY_50),
    },
    pressed: {
      color: Colors.SECONDARY_60,
      background: Colors.SECONDARY_20,
      border: getButtonBorder(Colors.SECONDARY_50),
    },
    disabled: {
      color: Colors.SECONDARY_40,
      background: 'transparent',
      border: getButtonBorder(Colors.SECONDARY_30),
    },
  },
  [ButtonColor.SECONDARY_BLACK]: {
    root: {
      color: Colors.NEUTRAL_100,
      background: Colors.WHITE,
      border: getButtonBorder(Colors.NEUTRAL_100),
    },
    hover: {
      color: Colors.NEUTRAL_100,
      background: Colors.NEUTRAL_10,
      border: getButtonBorder(Colors.NEUTRAL_100),
    },
    pressed: {
      color: Colors.NEUTRAL_100,
      background: Colors.NEUTRAL_20,
      border: getButtonBorder(Colors.NEUTRAL_100),
    },
    disabled: {
      color: Colors.NEUTRAL_40,
      background: Colors.WHITE,
      border: getButtonBorder(Colors.NEUTRAL_40),
    },
  },
  [ButtonColor.TERTIARY]: {
    root: {
      color: Colors.NEUTRAL_100,
      background: Colors.NEUTRAL_10,
    },
    hover: {
      color: Colors.NEUTRAL_100,
      background: Colors.NEUTRAL_20,
    },
    pressed: {
      color: Colors.NEUTRAL_100,
      background: Colors.NEUTRAL_30,
    },
    disabled: {
      color: Colors.NEUTRAL_40,
      background: Colors.NEUTRAL_10,
    },
  },
  [ButtonColor.HYPERLINK]: {
    root: {
      color: Colors.SECONDARY_50,
      background: 'transparent',
    },
    hover: {
      color: Colors.SECONDARY_60,
      background: 'transparent',
    },
    pressed: {
      color: Colors.SECONDARY_70,
      background: 'transparent',
    },
    disabled: {
      color: Colors.SECONDARY_30,
      background: 'transparent',
    },
  },
  [ButtonColor.PRIMARY_BLACK]: {
    root: {
      color: Colors.NEUTRAL_0,
      background: Colors.NEUTRAL_100,
    },
    hover: {
      color: Colors.NEUTRAL_0,
      background: Colors.NEUTRAL_80,
    },
    pressed: {
      color: Colors.NEUTRAL_0,
      background: Colors.NEUTRAL_70,
    },
    disabled: {
      color: Colors.NEUTRAL_10,
      background: Colors.NEUTRAL_30,
    },
  },
  [ButtonColor.GHOST]: {
    root: {
      color: Colors.NEUTRAL_80,
      background: 'transparent',
    },
    hover: {
      color: Colors.NEUTRAL_80,
      background: Colors.NEUTRAL_10,
    },
    pressed: {
      color: Colors.NEUTRAL_80,
      background: Colors.NEUTRAL_20,
    },
    disabled: {
      color: Colors.NEUTRAL_40,
      background: 'transparent',
    },
  },
  [ButtonColor.PRIMARY_GREEN]: {
    root: {
      color: Colors.WHITE,
      background: Colors.PRIMARY_90,
    },
    hover: {
      color: Colors.WHITE,
      background: Colors.PRIMARY_110,
    },
    pressed: {
      color: Colors.WHITE,
      background: Colors.PRIMARY_110,
    },
    disabled: {
      color: Colors.WHITE,
      background: Colors.PRIMARY_110,
    },
  },
};

const DARK_BUTTON_COLORS = {
  [ButtonColor.PRIMARY_RED]: {
    root: {
      color: Colors.NEUTRAL_10,
      background: Colors.SECONDARY_50,
    },
    hover: {
      color: Colors.NEUTRAL_0,
      background: Colors.SECONDARY_40,
    },
    pressed: {
      color: Colors.NEUTRAL_10,
      background: Colors.SECONDARY_60,
    },
    disabled: {
      color: Colors.SECONDARY_40,
      background: Colors.SECONDARY_60,
    },
  },
  [ButtonColor.SECONDARY_RED]: {
    root: {
      color: Colors.SECONDARY_50,
      background: Colors.NEUTRAL_100,
      border: getButtonBorder(Colors.SECONDARY_50),
    },
    hover: {
      color: Colors.SECONDARY_50,
      background: Colors.NEUTRAL_80,
      border: getButtonBorder(Colors.SECONDARY_50),
    },
    pressed: {
      color: Colors.SECONDARY_60,
      background: Colors.NEUTRAL_90,
      border: getButtonBorder(Colors.SECONDARY_50),
    },
    disabled: {
      color: Colors.SECONDARY_80,
      background: Colors.NEUTRAL_100,
      border: getButtonBorder(Colors.SECONDARY_80),
    },
  },
  [ButtonColor.SECONDARY_BLACK]: {
    root: {
      color: Colors.NEUTRAL_10,
      background: 'transparent',
      border: getButtonBorder(Colors.NEUTRAL_10),
    },
    hover: {
      color: Colors.NEUTRAL_0,
      background: Colors.NEUTRAL_90,
      border: getButtonBorder(Colors.NEUTRAL_0),
    },
    pressed: {
      color: Colors.NEUTRAL_10,
      background: Colors.NEUTRAL_100,
      border: getButtonBorder(Colors.NEUTRAL_10),
    },
    disabled: {
      color: Colors.NEUTRAL_40,
      background: 'transparent',
      border: getButtonBorder(Colors.NEUTRAL_40),
    },
  },
  [ButtonColor.TERTIARY]: {
    root: {
      color: Colors.NEUTRAL_20,
      background: Colors.NEUTRAL_80,
    },
    hover: {
      color: Colors.NEUTRAL_0,
      background: Colors.NEUTRAL_70,
    },
    pressed: {
      color: Colors.NEUTRAL_0,
      background: Colors.NEUTRAL_90,
    },
    disabled: {
      color: Colors.NEUTRAL_60,
      background: Colors.NEUTRAL_90,
    },
  },
  [ButtonColor.HYPERLINK]: {
    root: {
      color: Colors.SECONDARY_50,
      background: 'transparent',
    },
    hover: {
      color: Colors.SECONDARY_40,
      background: 'transparent',
    },
    pressed: {
      color: Colors.SECONDARY_60,
      background: 'transparent',
    },
    disabled: {
      color: Colors.SECONDARY_80,
      background: 'transparent',
    },
  },
};

export const buttonColorGetter = ({ theme, color }) => theme.SharedComponents.Button[color] || {
  root: {}, disabled: {}, hover: {}, pressed: {},
};

export const BUTTON_THEME = {
  [THEME_MODE.LIGHT]: LIGHT_BUTTON_COLORS,
  [THEME_MODE.DARK]: DARK_BUTTON_COLORS,
};

export const buttonClassBuilder = (original, ...classesList) => {
  const decorateOriginal = original || {};
  const BUTTON_CLASSES = ['root', 'label', 'contained', 'disabled'];
  const newClasses = { ...decorateOriginal };
  BUTTON_CLASSES.forEach((_classes) => {
    const newClass = classNames(
      decorateOriginal[_classes],
      ...classesList.map((item) => (item || {})[_classes]).filter(Boolean)
    );
    merge(newClasses, { [_classes]: newClass });
  });
  return newClasses;
};
