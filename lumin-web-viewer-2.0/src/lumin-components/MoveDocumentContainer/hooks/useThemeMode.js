import { useSelector } from 'react-redux';
import { useMatch } from 'react-router';

import selectors from 'selectors';

import { THEME_MODE } from 'constants/lumin-common';
import { DarkTheme, LightTheme } from 'constants/styles';

export const useThemeMode = () => {
  const themeMode = useSelector(selectors.getThemeMode);
  const isViewerMatched = useMatch('/viewer/:documentId');
  const isUsingLightMode = !isViewerMatched || themeMode === THEME_MODE.LIGHT;

  const getTheme = () => (isUsingLightMode ? {
    ...LightTheme,
    mode: THEME_MODE.LIGHT,
  } : {
    ...DarkTheme,
    mode: THEME_MODE.DARK,
  });

  const theme = getTheme();

  return { theme: { ...theme, isLightMode: isUsingLightMode } };
};
