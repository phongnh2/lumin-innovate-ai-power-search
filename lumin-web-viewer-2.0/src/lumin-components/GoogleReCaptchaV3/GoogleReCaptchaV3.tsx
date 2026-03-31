import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ERROR_MESSAGES } from './GoogleReCaptchaV3.interface';
import type { GoogleReCaptchaV3ProviderProps, GrecaptchaInstance } from './GoogleReCaptchaV3.interface';
import {
  executeRecaptcha,
  getGrecaptchaFromWindow,
  injectRecaptchaScript,
  isGrecaptchaReady,
} from './GoogleReCaptchaV3.utils';
import { GoogleReCaptchaContext } from './useGoogleReCaptchaV3';

const GoogleReCaptchaV3: React.FC<GoogleReCaptchaV3ProviderProps> = ({ children, siteKey }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [instance, setInstance] = useState<GrecaptchaInstance | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    /**
     * Initializes reCAPTCHA by injecting script and setting up instance
     */
    const initializeRecaptcha = async (): Promise<void> => {
      // Inject script if needed
      await injectRecaptchaScript(siteKey);

      // Wait for grecaptcha to be ready
      const grecaptcha = getGrecaptchaFromWindow();
      if (!grecaptcha) {
        throw new Error(ERROR_MESSAGES.RECAPTCHA_NOT_AVAILABLE);
      }

      grecaptcha.ready(() => {
        if (mounted) {
          setInstance(grecaptcha);
          setIsLoading(false);
        }
      });
    };

    // Check if already loaded (e.g., from previous mount)
    const existingGrecaptcha = getGrecaptchaFromWindow();
    if (isGrecaptchaReady(existingGrecaptcha)) {
      existingGrecaptcha.ready(() => {
        if (mounted) {
          setInstance(existingGrecaptcha);
          setIsLoading(false);
        }
      });
    } else {
      initializeRecaptcha().catch(() => {});
    }

    // IMPORTANT: No cleanup that removes the script!
    // This prevents the grecaptcha internal state corruption that causes
    // "Cannot read properties of undefined (reading 'siteKey')" errors
    return () => {
      mounted = false;
    };
  }, [siteKey]);

  /**
   * Execute reCAPTCHA v3 with proper ready() handling
   * Always gets fresh grecaptcha reference to avoid stale state issues
   */
  const executeV3 = useCallback((action: string): Promise<string> => executeRecaptcha(siteKey, action), [siteKey]);

  const contextValue = useMemo(
    () => ({
      instance,
      siteKey,
      isLoading,
      executeV3,
    }),
    [instance, siteKey, isLoading, executeV3]
  );

  return <GoogleReCaptchaContext.Provider value={contextValue}>{children}</GoogleReCaptchaContext.Provider>;
};

export default GoogleReCaptchaV3;
