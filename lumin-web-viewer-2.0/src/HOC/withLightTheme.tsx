import React from 'react';
import { ThemeProvider } from 'styled-components';

import { useThemeProvider } from 'hooks';

import { THEME_MODE } from 'constants/lumin-common';

const withLightTheme = (Component: React.ElementType) => (props: Record<string, unknown>) => {
  const theme = useThemeProvider(THEME_MODE.LIGHT);

  return (
    <ThemeProvider theme={theme}>
      <Component {...props} />
    </ThemeProvider>
  );
};

export default withLightTheme;
