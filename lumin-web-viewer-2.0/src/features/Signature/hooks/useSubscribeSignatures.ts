import { useEffect } from 'react';

import selectors from 'selectors';

import { useNetworkStatus } from 'hooks/useNetworkStatus';
import useShallowSelector from 'hooks/useShallowSelector';

import { useSignatureRealtime } from './useSignatureRealtime';

export const useSubscribeSignatures = () => {
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const { isOffline } = useNetworkStatus();
  const { addSignatureEvent } = useSignatureRealtime();
  useEffect(() => {
    if (!currentUser?._id || isOffline) {
      return undefined;
    }
    addSignatureEvent.listener();
    return () => {
      addSignatureEvent.destroy();
    };
  }, [currentUser?._id, isOffline]);
};
