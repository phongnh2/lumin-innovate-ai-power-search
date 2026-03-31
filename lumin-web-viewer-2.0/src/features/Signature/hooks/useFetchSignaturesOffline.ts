import { useCallback, useMemo } from 'react';
import { batch, useDispatch } from 'react-redux';

import actions from 'actions';

import { indexedDBService } from 'services';

export const useFetchSignaturesOffline = () => {
  const dispatch = useDispatch();
  const fetchSignaturesOffline = useCallback(async () => {
    const localSignatures = await indexedDBService.getUserSignatures();
    batch(() => {
      dispatch(actions.setUserSignatures(localSignatures));
      dispatch(
        actions.setSignatureStatus({
          isFetching: false,
        })
      );
    });
  }, [dispatch]);

  return useMemo(
    () => ({
      fetchSignaturesOffline,
    }),
    [fetchSignaturesOffline]
  );
};
