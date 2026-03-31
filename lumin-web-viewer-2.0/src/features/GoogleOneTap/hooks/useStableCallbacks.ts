import { useEffect, useRef } from 'react';

import { IUseGoogleOneTapLogin } from '../types';

export const useStableCallbacks = ({
  onSuccess,
  onError,
  googleAccountConfigs,
}: Pick<IUseGoogleOneTapLogin, 'onSuccess' | 'onError' | 'googleAccountConfigs'>) => {
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const configsRef = useRef(googleAccountConfigs);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    configsRef.current = googleAccountConfigs;
  }, [onSuccess, onError, googleAccountConfigs]);

  return { onSuccessRef, onErrorRef, configsRef };
};
