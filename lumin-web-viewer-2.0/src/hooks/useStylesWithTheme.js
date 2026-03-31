import { useTheme } from 'styled-components';
import { useThemeMode } from './useThemeMode';

export function useStylesWithTheme(useStyles, props) {
  const themeModeDefault = useThemeMode();
  const { themeMode } = useTheme() || {};

  return useStyles({ ...props, themeMode: themeMode || themeModeDefault });
}
