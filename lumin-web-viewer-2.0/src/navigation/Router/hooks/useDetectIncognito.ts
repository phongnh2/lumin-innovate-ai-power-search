import { detectIncognito } from 'detectincognitojs';
import { useCallback } from 'react';

import { useIdleCallback } from 'hooks/useIdleCallback';

import { LocalStorageKey } from 'constants/localStorageKey';

type BrowserMode = 'incognito' | 'normal' | 'unknown';

export const useDetectIncognito = (): void => {
  const onIdle = useCallback(() => {
    detectIncognito()
      .then((isIncognito) => {
        localStorage.setItem(
          LocalStorageKey.BROWSER_MODE,
          <BrowserMode>(isIncognito.isPrivate ? 'incognito' : 'normal')
        );
      })
      .catch(() => localStorage.setItem(LocalStorageKey.BROWSER_MODE, 'unknown'));
  }, []);

  useIdleCallback(onIdle);
};
