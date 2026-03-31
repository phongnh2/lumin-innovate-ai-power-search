import { useSelector } from 'react-redux';

import { documentSyncSelectors } from 'features/Document/slices';

import { useNetworkStatus } from './useNetworkStatus';

export const usePageToolDisabled = () => {
  const { isOffline } = useNetworkStatus();
  const isSyncing = useSelector(documentSyncSelectors.isSyncing);

  return {
    isDisabled: isOffline || isSyncing,
  };
};
