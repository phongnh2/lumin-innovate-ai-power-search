import { useLayoutEffect } from 'react';

import { useThemeMode } from './useThemeMode';
import { useViewerMatch } from './useViewerMatch';

export const useOnSwitchTheme = () => {
  const themeMode = useThemeMode();
  const { isViewer } = useViewerMatch();

  useLayoutEffect(() => {
    if (isViewer) {
      if (themeMode === 'dark') {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [themeMode, isViewer]);
};
