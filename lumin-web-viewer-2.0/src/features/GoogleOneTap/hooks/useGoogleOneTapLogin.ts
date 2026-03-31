import { useGapiLoaded } from 'hooks/useGapiLoaded';

import { useGoogleOneTapInitialize } from './useGoogleOneTapInitialize';
import { useGoogleOneTapPrompt } from './useGoogleOneTapPrompt';
import { useStableCallbacks } from './useStableCallbacks';
import { IUseGoogleOneTapLogin } from '../types';

export const useGoogleOneTapLogin = ({
  onError,
  disabled = false,
  onSuccess,
  googleAccountConfigs,
  disableCancelOnUnmount = false,
}: IUseGoogleOneTapLogin) => {
  const isGoogleReady = useGapiLoaded();

  const { onSuccessRef, onErrorRef, configsRef } = useStableCallbacks({
    onSuccess,
    onError,
    googleAccountConfigs,
  });

  useGoogleOneTapInitialize({ isGoogleReady, configsRef, onSuccessRef, onErrorRef });
  useGoogleOneTapPrompt({ isGoogleReady, disabled, disableCancelOnUnmount });
};
