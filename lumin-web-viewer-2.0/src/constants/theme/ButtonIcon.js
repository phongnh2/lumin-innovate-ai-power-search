import { ButtonIconColor } from 'lumin-components/Shared/ButtonIcon/types/ButtonIconColor';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

const getButtonBorder = (color) => (color ? `1px solid ${color}` : null);

const LIGHT_BUTTON_COLORS = {
  [ButtonIconColor.PRIMARY]: {
    root: {
      color: Colors.NEUTRAL_80,
      background: Colors.WHITE,
      border: getButtonBorder(Colors.NEUTRAL_100),
      iconColor: Colors.NEUTRAL_80,
    },
    hover: {
      background: Colors.NEUTRAL_10,
      border: getButtonBorder(Colors.NEUTRAL_100),
    },
  },
  [ButtonIconColor.SECONDARY]: {
    root: {
      color: Colors.NEUTRAL_80,
      background: 'transparent',
      iconColor: Colors.NEUTRAL_80,
    },
    hover: {
      background: Colors.NEUTRAL_10,
    },
  },
  [ButtonIconColor.OTHER]: {
    root: {
      color: Colors.NEUTRAL_0,
      background: Colors.NEUTRAL_100,
      iconColor: Colors.NEUTRAL_0,
    },
    hover: {
      background: Colors.NEUTRAL_80,
    },
  },
  [ButtonIconColor.TERTIARY]: {
    root: {
      color: Colors.NEUTRAL_100,
      background: Colors.NEUTRAL_10,
      iconColor: Colors.NEUTRAL_100,
    },
    hover: {
      background: Colors.NEUTRAL_20,
    },
  },
};

const DARK_BUTTON_COLORS = {
  [ButtonIconColor.PRIMARY]: {
    root: {
      color: Colors.NEUTRAL_20,
      background: Colors.NEUTRAL_100,
      border: getButtonBorder(Colors.NEUTRAL_20),
      iconColor: Colors.NEUTRAL_20,
    },
    hover: {
      background: Colors.NEUTRAL_80,
      border: getButtonBorder(Colors.NEUTRAL_20),
    },
  },
  [ButtonIconColor.SECONDARY]: {
    root: {
      color: Colors.NEUTRAL_20,
      background: 'transparent',
      iconColor: Colors.NEUTRAL_20,
    },
    hover: {
      background: Colors.NEUTRAL_80,
    },
  },
  [ButtonIconColor.OTHER]: {
    root: {
      color: Colors.NEUTRAL_100,
      background: Colors.NEUTRAL_10,
      iconColor: Colors.NEUTRAL_100,
    },
    hover: {
      background: Colors.NEUTRAL_20,
    },
  },
  [ButtonIconColor.TERTIARY]: {
    root: {
      color: Colors.NEUTRAL_20,
      background: Colors.NEUTRAL_10,
      iconColor: Colors.NEUTRAL_20,
    },
    hover: {
      background: Colors.NEUTRAL_70,
    },
  },
};

export const BUTTON_ICON_THEME = {
  [THEME_MODE.LIGHT]: {
    ...LIGHT_BUTTON_COLORS,
    colorActive: Colors.PRIMARY_90,
    backgroundIsActive: Colors.PRIMARY_30,
    backgroundHoverIsActive: Colors.PRIMARY_40,
  },
  [THEME_MODE.DARK]: {
    ...DARK_BUTTON_COLORS,
    colorActive: Colors.WHITE,
    backgroundIsActive: Colors.NEUTRAL_70,
    backgroundHoverIsActive: Colors.PRIMARY_40,
  }
};

export const buttonIconColorGetter = ({ theme, color, isActive }) => {
  if (isActive) {
    return theme.SharedComponents.ButtonIcon;
  }

  return theme.SharedComponents.ButtonIcon[color] || { root: {}, disabled: {}, border: {} };
};
