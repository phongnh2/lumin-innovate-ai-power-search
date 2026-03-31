import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useViewerMatch } from './useViewerMatch';

export function useThemeMode(): 'light' | 'dark' {
  const themeMode = useSelector<unknown, 'light' | 'dark'>(selectors.getThemeMode);
  const { isViewer } = useViewerMatch();
  return isViewer ? themeMode : 'light';
}

export const useIsDarkMode = (): boolean => {
  const themeMode = useThemeMode();
  return themeMode === 'dark';
};

export const useIsLightMode = (): boolean => {
  const themeMode = useThemeMode();
  return themeMode === 'light';
};
