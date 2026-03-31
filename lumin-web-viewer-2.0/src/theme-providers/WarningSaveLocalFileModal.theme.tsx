import React from 'react';
import { ThemeProvider } from 'styled-components';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';
import { useThemeMode } from 'hooks';

const THEMES = {
  [THEME_MODE.LIGHT]: {
    text: Colors.NEUTRAL_100,
    checkboxTitle: Colors.NEUTRAL_80,
    border: Colors.NEUTRAL_20,
    borderBottom: Colors.PRIMARY_60,
    headerTableBackground: Colors.PRIMARY_10,
  },
  [THEME_MODE.DARK]: {
    text: Colors.NEUTRAL_10,
    checkboxTitle: Colors.NEUTRAL_20,
    border: Colors.NEUTRAL_80,
    borderBottom: Colors.PRIMARY_40,
    headerTableBackground: Colors.PRIMARY_90,
  },
};

const WarningSaveLocalFileModal = ({ children }: { children: JSX.Element }): JSX.Element => {
  const themeMode = useThemeMode();
  return (
    <ThemeProvider
      theme={{
        warningSaveLocalFileModal: THEMES[themeMode],
      }}
    >
      <div className={`theme-${themeMode}`}>{children}</div>
    </ThemeProvider>
  );
};

export default WarningSaveLocalFileModal;
