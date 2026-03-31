import { useCallback, useEffect } from 'react';

import { SCRIPT_INITIALIZED_FLAG } from '../constants';

interface IUseGoogleOneTapPromptParams {
  isGoogleReady: boolean;
  disabled: boolean;
  disableCancelOnUnmount: boolean;
}

export const useGoogleOneTapPrompt = ({
  isGoogleReady,
  disabled,
  disableCancelOnUnmount,
}: IUseGoogleOneTapPromptParams) => {
  const showPrompt = useCallback(() => {
    window.google.accounts.id.prompt();
  }, []);

  const cancelPrompt = useCallback(() => {
    window.google?.accounts?.id?.cancel();
  }, []);

  useEffect(() => {
    const isInitialized = window[SCRIPT_INITIALIZED_FLAG];
    if (!isGoogleReady || !isInitialized) {
      return undefined;
    }

    if (disabled) {
      cancelPrompt();
      return undefined;
    }

    showPrompt();

    return () => {
      if (!disableCancelOnUnmount) {
        cancelPrompt();
      }
    };
  }, [disabled, isGoogleReady, disableCancelOnUnmount, showPrompt, cancelPrompt]);
};
