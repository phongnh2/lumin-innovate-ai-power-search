import { get } from 'lodash';
import { Colors, ThemeMode } from '../../theme';
import { ButtonColor } from '../types';

const BUTTON_LIGHT_THEME = {
  [ButtonColor.PRIMARY]: {
    root: {
      color: Colors.NEUTRAL_0,
      background: Colors.SECONDARY_50
    },
    hover: {
      color: Colors.NEUTRAL_0,
      background: Colors.SECONDARY_60
    },
    pressed: {
      color: Colors.NEUTRAL_0,
      background: Colors.SECONDARY_70
    },
    disabled: {
      color: Colors.NEUTRAL_0,
      background: Colors.SECONDARY_30
    }
  },
  [ButtonColor.SECONDARY]: {
    root: {
      color: Colors.SECONDARY_50,
      background: 'transparent',
      border: Colors.SECONDARY_50
    },
    hover: {
      color: Colors.SECONDARY_50,
      background: Colors.SECONDARY_10,
      border: Colors.SECONDARY_50
    },
    pressed: {
      color: Colors.SECONDARY_60,
      background: Colors.SECONDARY_20,
      border: Colors.SECONDARY_50
    },
    disabled: {
      color: Colors.SECONDARY_40,
      background: 'transparent',
      border: Colors.SECONDARY_30
    }
  },
  [ButtonColor.SECONDARY_DARK]: {
    root: {
      color: Colors.NEUTRAL_100,
      background: Colors.WHITE,
      border: Colors.NEUTRAL_100
    },
    hover: {
      color: Colors.NEUTRAL_100,
      background: Colors.NEUTRAL_10,
      border: Colors.NEUTRAL_100
    },
    pressed: {
      color: Colors.NEUTRAL_100,
      background: Colors.NEUTRAL_20,
      border: Colors.NEUTRAL_100
    },
    disabled: {
      color: Colors.NEUTRAL_40,
      background: Colors.WHITE,
      border: Colors.NEUTRAL_40
    }
  },
  [ButtonColor.TERTIARY]: {
    root: {
      color: Colors.NEUTRAL_100,
      background: Colors.NEUTRAL_10
    },
    hover: {
      color: Colors.NEUTRAL_100,
      background: Colors.NEUTRAL_20
    },
    pressed: {
      color: Colors.NEUTRAL_100,
      background: Colors.NEUTRAL_30
    },
    disabled: {
      color: Colors.NEUTRAL_40,
      background: Colors.NEUTRAL_10
    }
  },
  [ButtonColor.HYPERLINK]: {
    root: {
      color: Colors.SECONDARY_50,
      background: 'transparent'
    },
    hover: {
      color: Colors.SECONDARY_60,
      background: 'transparent'
    },
    pressed: {
      color: Colors.SECONDARY_70,
      background: 'transparent'
    },
    disabled: {
      color: Colors.SECONDARY_30,
      background: 'transparent'
    }
  },
  [ButtonColor.PRIMARY_DARK]: {
    root: {
      color: Colors.NEUTRAL_0,
      background: Colors.NEUTRAL_100
    },
    hover: {
      color: Colors.NEUTRAL_0,
      background: Colors.NEUTRAL_80
    },
    pressed: {
      color: Colors.NEUTRAL_0,
      background: Colors.NEUTRAL_70
    },
    disabled: {
      color: Colors.NEUTRAL_10,
      background: Colors.NEUTRAL_30
    }
  },
  [ButtonColor.GHOST]: {
    root: {
      color: Colors.NEUTRAL_80,
      background: 'transparent'
    },
    hover: {
      color: Colors.NEUTRAL_80,
      background: Colors.NEUTRAL_10
    },
    pressed: {
      color: Colors.NEUTRAL_80,
      background: Colors.NEUTRAL_20
    },
    disabled: {
      color: Colors.NEUTRAL_40,
      background: 'transparent'
    }
  },
  [ButtonColor.PRIMARY_DIM]: {
    root: {
      color: Colors.WHITE,
      background: Colors.PRIMARY_90
    },
    hover: {
      color: Colors.WHITE,
      background: Colors.PRIMARY_110
    },
    pressed: {
      color: Colors.WHITE,
      background: Colors.PRIMARY_110
    },
    disabled: {
      color: Colors.WHITE,
      background: Colors.PRIMARY_110
    }
  }
};

const BUTTON_DARK_THEME = {
  [ButtonColor.PRIMARY]: {
    root: {
      color: Colors.NEUTRAL_10,
      background: Colors.SECONDARY_50
    },
    hover: {
      color: Colors.NEUTRAL_0,
      background: Colors.SECONDARY_40
    },
    pressed: {
      color: Colors.NEUTRAL_10,
      background: Colors.SECONDARY_60
    },
    disabled: {
      color: Colors.SECONDARY_40,
      background: Colors.SECONDARY_60
    }
  },
  [ButtonColor.SECONDARY]: {
    root: {
      color: Colors.SECONDARY_50,
      background: Colors.NEUTRAL_100,
      border: Colors.SECONDARY_50
    },
    hover: {
      color: Colors.SECONDARY_50,
      background: Colors.NEUTRAL_80,
      border: Colors.SECONDARY_50
    },
    pressed: {
      color: Colors.SECONDARY_60,
      background: Colors.NEUTRAL_90,
      border: Colors.SECONDARY_50
    },
    disabled: {
      color: Colors.SECONDARY_80,
      background: Colors.NEUTRAL_100,
      border: Colors.SECONDARY_80
    }
  },
  [ButtonColor.SECONDARY_DARK]: {
    root: {
      color: Colors.NEUTRAL_10,
      background: 'transparent',
      border: Colors.NEUTRAL_10
    },
    hover: {
      color: Colors.NEUTRAL_0,
      background: Colors.NEUTRAL_90,
      border: Colors.NEUTRAL_0
    },
    pressed: {
      color: Colors.NEUTRAL_10,
      background: Colors.NEUTRAL_100,
      border: Colors.NEUTRAL_10
    },
    disabled: {
      color: Colors.NEUTRAL_40,
      background: 'transparent',
      border: Colors.NEUTRAL_40
    }
  },
  [ButtonColor.TERTIARY]: {
    root: {
      color: Colors.NEUTRAL_20,
      background: Colors.NEUTRAL_80
    },
    hover: {
      color: Colors.NEUTRAL_0,
      background: Colors.NEUTRAL_70
    },
    pressed: {
      color: Colors.NEUTRAL_0,
      background: Colors.NEUTRAL_90
    },
    disabled: {
      color: Colors.NEUTRAL_60,
      background: Colors.NEUTRAL_90
    }
  },
  [ButtonColor.HYPERLINK]: {
    root: {
      color: Colors.SECONDARY_50,
      background: 'transparent'
    },
    hover: {
      color: Colors.SECONDARY_40,
      background: 'transparent'
    },
    pressed: {
      color: Colors.SECONDARY_60,
      background: 'transparent'
    },
    disabled: {
      color: Colors.SECONDARY_80,
      background: 'transparent'
    }
  }
};

const BUTTON_THEME = {
  [ThemeMode.LIGHT]: BUTTON_LIGHT_THEME,
  [ThemeMode.DARK]: BUTTON_DARK_THEME
};

export const buttonColorGetter = ({
  color = ButtonColor.PRIMARY,
  themeMode = ThemeMode.LIGHT
}: {
  color: ButtonColor | undefined;
  themeMode: ThemeMode | undefined;
}) => {
  return get(BUTTON_THEME, [themeMode, color]);
};
