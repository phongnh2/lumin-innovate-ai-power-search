import { useEffect } from 'react';

import { LocalStorageKey } from '@/constants/localStorageKey';
import { buttonEvent } from '@/lib/factory/button.event';

const useTrackingOidcButton = () => {
  useEffect(() => {
    [LocalStorageKey.SIGN_IN, LocalStorageKey.SIGN_UP].map(key => {
      const params = localStorage.getItem(key);
      if (params) {
        buttonEvent.buttonClick(JSON.parse(params as string));
        localStorage.removeItem(key);
      }
    });
  }, []);
};

export default useTrackingOidcButton;
