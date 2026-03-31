import { useEffect } from 'react';

import { usePrevious } from 'hooks';
import { useNetworkStatus } from 'hooks/useNetworkStatus';

import { RetryService } from 'services/retryServices';

import logger from 'helpers/logger';

import { useAddSignature } from './useAddSignature';
import { useOfflineSignatures } from './useOfflineSignatures';

export const useSyncOfflineSignatures = () => {
  const { isOnline, isOffline } = useNetworkStatus();
  const offlineSignatures = useOfflineSignatures();
  const { addSignatureMutation } = useAddSignature();
  const previousOnlineStatus = usePrevious(isOnline);
  const sync = async () => {
    const syncPromises = offlineSignatures.map((signature) =>
      addSignatureMutation.trigger({
        base64: signature.imgSrc,
        id: signature.id,
        status: 'syncing',
      })
    );
    await Promise.all(syncPromises);
  };

  useEffect(() => {
    const onOnline = async () => {
      await RetryService.retry({
        fn: sync,
        shouldCancel: isOffline || !offlineSignatures.length,
      });
    };

    if (isOnline && !previousOnlineStatus) {
      onOnline().catch((err) =>
        logger.logError({
          error: err,
          reason: 'Failed to sync offline signatures',
        })
      );
    }
  }, [isOffline, isOnline, offlineSignatures.length, previousOnlineStatus]);

  return {
    sync,
  };
};
