import React from 'react';
import { ThemeProvider } from 'styled-components';
import PropTypes from 'prop-types';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';
import { useThemeMode } from 'hooks';

const LIGHT_THEME = {
  TextColor: Colors.NEUTRAL_80,
  MainTitleColor: Colors.NEUTRAL_100,
  LabelBg: Colors.PRIMARY_10,
  SeparatorColor: Colors.NEUTRAL_20,
  ItemHoverColor: Colors.PRIMARY_20,
  ItemUnreadColor: Colors.NEUTRAL_10,
  TitleColor: Colors.NEUTRAL_100,
  DescColor: Colors.NEUTRAL_80,
  BackgroundContainer: Colors.PRIMARY_10,
  TodayTextSkeleton: Colors.NEUTRAL_20,
};

const DARK_THEME = {
  TextColor: Colors.NEUTRAL_20,
  MainTitleColor: Colors.NEUTRAL_10,
  LabelBg: Colors.PRIMARY_90,
  SeparatorColor: Colors.NEUTRAL_80,
  ItemHoverColor: Colors.PRIMARY_80,
  ItemUnreadColor: Colors.NEUTRAL_90,
  TitleColor: Colors.NEUTRAL_5,
  DescColor: Colors.NEUTRAL_10,
  BackgroundContainer: Colors.NEUTRAL_90,
  TodayTextSkeleton: Colors.PRIMARY_80,
};

const NOTIFICATION_PANEL_THEME = {
  [THEME_MODE.LIGHT]: LIGHT_THEME,
  [THEME_MODE.DARK]: DARK_THEME,
};

function NotificationPanelTheme({
  children,
}) {
  const themeMode = useThemeMode();
  return (
    <ThemeProvider theme={{
      notificationPanel: NOTIFICATION_PANEL_THEME[themeMode],
    }}
    >
      <div className={`theme-${themeMode}`}>{children}</div>
    </ThemeProvider>
  );
}

NotificationPanelTheme.propTypes = {
  children: PropTypes.node.isRequired,
};

export const notificationPanelThemeGetter = (props) => props.theme.notificationPanel;

export default NotificationPanelTheme;
