import React from 'react';
import { ThemeProvider } from 'styled-components';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';
import { useThemeMode } from 'hooks';

const THEMES = {
  [THEME_MODE.LIGHT]: {
    background: Colors.NEUTRAL_10,
    fullListBackground: Colors.WHITE,
    headerText: Colors.NEUTRAL_100,
    headerTextHover: Colors.NEUTRAL_20,
    subHeaderText: Colors.NEUTRAL_80,
    itemTitle: Colors.NEUTRAL_20,
    itemTitleBold: Colors.NEUTRAL_10,
    rejectButtonColor: Colors.SECONDARY_50,
  },
  [THEME_MODE.DARK]: {
    background: Colors.NEUTRAL_90,
    fullListBackground: Colors.NEUTRAL_100,
    headerText: Colors.NEUTRAL_10,
    headerTextHover: Colors.NEUTRAL_80,
    subHeaderText: Colors.NEUTRAL_20,
    itemTitle: Colors.NEUTRAL_20,
    itemTitleBold: Colors.NEUTRAL_10,
    rejectButtonColor: Colors.SECONDARY_40,
    viewAll: Colors.PRIMARY_20,
  },
};

const RequestAccessList = ({ children }: { children: JSX.Element }): JSX.Element => {
  const themeMode = useThemeMode();
  return (
    <ThemeProvider
      theme={{
        requestAccessList: THEMES[themeMode],
      }}
    >
      <div className={`theme-${themeMode}`}>{children}</div>
    </ThemeProvider>
  );
};

export default RequestAccessList;
