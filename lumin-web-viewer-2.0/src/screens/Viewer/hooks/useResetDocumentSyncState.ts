import { useDispatch } from 'react-redux';

import { useCleanup } from 'hooks/useCleanup';

import { resetSyncFileDestination } from 'features/CopyDocumentModal/slice';
import { documentSyncActions } from 'features/Document/slices';

export const useResetDocumentSyncState = () => {
  const dispatch = useDispatch();
  useCleanup(() => {
    dispatch(documentSyncActions.reset());
    dispatch(resetSyncFileDestination());
  }, []);
};
