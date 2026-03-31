import { useSelector } from 'react-redux';

import selectors from 'selectors';
import { RootState } from 'store';

import { documentSyncSelectors } from 'features/Document/document-sync.slice';

import { DataElements } from 'constants/dataElement';
import { SAVE_OPERATION_STATUS } from 'constants/saveOperationConstants';

export const useProcessStatus = (): boolean => {
  const globalSaveStatus = useSelector(documentSyncSelectors.getSaveOperationsGlobalStatus);
  const isSaving = globalSaveStatus === SAVE_OPERATION_STATUS.SAVING;
  const isMultipleViewerMerging = useSelector(selectors.getIsMultipleViewerMerging);
  const isViewerLoading = useSelector((state: RootState) =>
    selectors.isElementOpen(state, DataElements.VIEWER_LOADING_MODAL)
  );

  return isSaving || isMultipleViewerMerging || isViewerLoading;
};
