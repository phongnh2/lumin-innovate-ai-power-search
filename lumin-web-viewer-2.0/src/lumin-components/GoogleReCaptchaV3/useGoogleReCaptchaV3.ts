import { createContext, useContext } from 'react';

import type { GoogleReCaptchaContextValue } from './GoogleReCaptchaV3.interface';
import { ERROR_MESSAGES } from './GoogleReCaptchaV3.interface';

export const GoogleReCaptchaContext = createContext<GoogleReCaptchaContextValue>({
  instance: undefined,
  siteKey: '',
  isLoading: true,
  executeV3: () => {
    throw new Error(ERROR_MESSAGES.CONTEXT_NOT_INITIALIZED);
  },
});

export const useGoogleReCaptchaV3 = (): GoogleReCaptchaContextValue => useContext(GoogleReCaptchaContext);
