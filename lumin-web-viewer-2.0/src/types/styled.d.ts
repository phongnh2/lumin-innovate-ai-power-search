import { ThemeProperties } from 'lumin-ui/tokens/themes';

import { colors } from 'constants/styles/editor';

export type ThemeTypes = Partial<ThemeProperties & typeof colors.themes.light & Record<string, any>>;

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends ThemeTypes {}
}
