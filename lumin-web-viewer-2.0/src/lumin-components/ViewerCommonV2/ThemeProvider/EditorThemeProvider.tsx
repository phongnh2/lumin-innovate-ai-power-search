import { themes } from 'lumin-ui/tokens/themes';
import React from 'react';
import { ThemeProvider } from 'styled-components';

import { ThemeTypes } from 'types/styled';

import { useThemeMode } from 'hooks';

import { colors } from 'constants/styles/editor';

export default function EditorThemeProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const themeMode: string = useThemeMode();

  const getDesignTokens = (theme: string) =>
    theme === 'light'
      ? {
          ...colors.themes.light,
          ...themes.light,
        }
      : {
          ...colors.themes.dark,
          ...themes.dark,
        };

  const theme = React.useMemo(() => getDesignTokens(themeMode), [themeMode]);
  return <ThemeProvider theme={theme as ThemeTypes}>{children}</ThemeProvider>;
}
