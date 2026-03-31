import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

export const TEXTAREA_THEME = {
  [THEME_MODE.LIGHT]: {
    textColor: Colors.NEUTRAL_100,
    backgroundTextarea: Colors.WHITE,
    borderColor: Colors.NEUTRAL_30,
    focus: {
      border: `1px solid ${Colors.PRIMARY_50}`,
      boxShadow: 'var(--shadow-input)',
    },
    disabled: {
      background: Colors.WHITE,
      color: Colors.NEUTRAL_60,
      border: `1px solid ${Colors.NEUTRAL_20}`,
    },
  },
  [THEME_MODE.DARK]: {
    textColor: Colors.NEUTRAL_10,
    backgroundTextarea: Colors.NEUTRAL_100,
    borderColor: Colors.NEUTRAL_80,
    focus: {
      border: `1px solid ${Colors.PRIMARY_80}`,
      boxShadow: 'var(--shadow-input-dark)',
    },
    disabled: {
      background: Colors.NEUTRAL_100,
      color: Colors.NEUTRAL_60,
      border: `1px solid ${Colors.NEUTRAL_80}`,
    },
  },
};

export const textareaColorGetter = ({ theme }) => theme.SharedComponents.Textarea || {
  focus: {},
  disabled: {},
};