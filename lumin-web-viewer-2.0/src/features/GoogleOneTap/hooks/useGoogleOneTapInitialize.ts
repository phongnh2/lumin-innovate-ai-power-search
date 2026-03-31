import { useEffect } from 'react';

import { PROMPT_ANCHOR_ID, SCRIPT_INITIALIZED_FLAG } from '../constants';
import { IUseGoogleOneTapLogin } from '../types';
import { createGoogleCallback } from '../utils';

interface IUseGoogleOneTapInitializeParams {
  isGoogleReady: boolean;
  configsRef: React.RefObject<IUseGoogleOneTapLogin['googleAccountConfigs']>;
  onSuccessRef: React.RefObject<IUseGoogleOneTapLogin['onSuccess']>;
  onErrorRef: React.RefObject<IUseGoogleOneTapLogin['onError']>;
}

export const useGoogleOneTapInitialize = ({
  isGoogleReady,
  configsRef,
  onSuccessRef,
  onErrorRef,
}: IUseGoogleOneTapInitializeParams) => {
  useEffect(() => {
    if (!isGoogleReady || window[SCRIPT_INITIALIZED_FLAG]) {
      return;
    }

    const callback = configsRef.current?.callback ?? createGoogleCallback(onSuccessRef.current, onErrorRef.current);

    window.google.accounts.id.initialize({
      ...configsRef.current,
      callback,
      prompt_parent_id: PROMPT_ANCHOR_ID,
      cancel_on_tap_outside: false,
      use_fedcm_for_prompt: true,
      auto_select: false,
      context: 'signin',
      itp_support: true,
    });

    window[SCRIPT_INITIALIZED_FLAG] = true;
  }, [isGoogleReady, configsRef, onSuccessRef, onErrorRef]);
};
