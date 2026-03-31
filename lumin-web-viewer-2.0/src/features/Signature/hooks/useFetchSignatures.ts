import { useCallback, useMemo } from 'react';
import { batch, useDispatch } from 'react-redux';
import { v4 } from 'uuid';

import actions from 'actions';
import selectors from 'selectors';

import useGetCurrentUser from 'hooks/useGetCurrentUser';
import { useIdleCallback } from 'hooks/useIdleCallback';
import { useNetworkStatus } from 'hooks/useNetworkStatus';
import useShallowSelector from 'hooks/useShallowSelector';

import signatureUtils from 'utils/signature';

import { useIsTempEditMode } from 'features/OpenForm';

import { useBackupSignatures } from './useBackupSignatures';
import { useFetchSignaturesOffline } from './useFetchSignaturesOffline';

export const useFetchSignatures = () => {
  const { backup } = useBackupSignatures();
  const userSignatures = useShallowSelector(selectors.getUserSignatures);
  const { isFetching, isSyncing, hasNext, isFetchedAfterMount } = useShallowSelector(selectors.getUserSignatureStatus);
  const dispatch = useDispatch();
  const { isOffline, isOnline } = useNetworkStatus();
  const { fetchSignaturesOffline } = useFetchSignaturesOffline();
  const { isTempEditMode } = useIsTempEditMode();
  const currentUser = useGetCurrentUser();
  const isLoggedIn = currentUser?._id;

  const setLoading = useCallback(
    (loading: boolean) => {
      dispatch(
        actions.setSignatureStatus({
          isFetching: loading,
        })
      );
    },
    [dispatch]
  );

  const fetchSignaturesOnline = useCallback(
    async (fetchOptions: { offset?: number } = {}) => {
      setLoading(true);
      const results = await signatureUtils.fetchUserSignatureSignedUrlsInRange({
        offset: fetchOptions.offset || userSignatures.length,
      });
      const formatedResults = await Promise.all(
        results.signatures.map(async (signature: { presignedUrl: string; remoteId: string }) => {
          const imageData = await signatureUtils.getBase64FromUrl({
            imageData: signature.presignedUrl,
            remoteId: signature.remoteId,
          });
          return { ...signature, index: v4(), ...imageData };
        })
      );

      batch(() => {
        dispatch(actions.updateUserSignatures(formatedResults));
        dispatch(
          actions.setSignatureStatus({
            isFetching: false,
            hasNext: results.hasNext,
          })
        );
      });
    },
    [dispatch, userSignatures.length]
  );

  const fetchSignatures = useCallback(
    async (fetchOptions: { offset?: number } = {}) => {
      if (!isLoggedIn || isTempEditMode) {
        return;
      }
      if (isOffline) {
        await fetchSignaturesOffline();
        return;
      }
      if (!hasNext) {
        return;
      }

      await fetchSignaturesOnline(fetchOptions);
    },
    [isOffline, hasNext, fetchSignaturesOnline, isTempEditMode, isLoggedIn]
  );

  const loadMore = useCallback(async () => {
    if (isOnline) {
      const currentOffset = userSignatures.length;
      await fetchSignatures({ offset: currentOffset });
    }
  }, [hasNext, isFetching, userSignatures.length, isOnline, fetchSignatures]);

  useIdleCallback(backup);

  const fetchSignaturesAfterMount = useCallback(async () => {
    if (!isFetchedAfterMount) {
      await fetchSignatures();
      dispatch(
        actions.setSignatureStatus({
          isFetchedAfterMount: true,
        })
      );
    }
  }, [fetchSignatures, isFetchedAfterMount]);

  return useMemo(
    () => ({
      loading: isFetching,
      isSyncing,
      fetchSignatures,
      loadMore,
      hasNext,
      fetchSignaturesAfterMount,
    }),
    [isFetching, isSyncing, fetchSignatures, loadMore, hasNext, fetchSignaturesAfterMount]
  );
};
