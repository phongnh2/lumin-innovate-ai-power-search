import { useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';

import { MERGE_EVENTS, MERGE_EVENTS_PURPOSE } from '@new-ui/components/ToolProperties/components/MergePanel/constants';

import actions from 'actions';

import ViewerContext from 'screens/Viewer/Context';

import { eventTracking } from 'utils/recordUtil';

import { documentSyncActions } from 'features/Document/slices';

import UserEventConstants from 'constants/eventConstants';

import { FileInfo, useMergeDocumentMutation } from './useMergeDocumentMutation';
import { useMergeValidation } from './useMergeValidation';

interface MergeHandlerParams {
  filesInfo: FileInfo[];
  pagePosition: number;
  insertBeforeOrAfter: string;
  allPages: boolean;
  calculateRange: () => number[];
  shouldCancelMerge: React.MutableRefObject<boolean>;
  setPagePositionErrorMessage: (msg: string) => void;
  currentMergeSize: number;
}

export const useMergeHandler = () => {
  const { validatePagePosition, validateFeatureAccess } = useMergeValidation();
  const { mutateAsync: mergeDocument, isMerging, error } = useMergeDocumentMutation();
  const { bookmarkIns } = useContext(ViewerContext);
  const dispatch = useDispatch();

  const handleMerge = useCallback(
    async (params: MergeHandlerParams) => {
      const {
        filesInfo,
        pagePosition,
        insertBeforeOrAfter,
        allPages,
        calculateRange,
        shouldCancelMerge,
        setPagePositionErrorMessage,
        currentMergeSize,
      } = params;

      const featureValidation = validateFeatureAccess(currentMergeSize);
      if (featureValidation) {
        return { shouldShowModal: true, featureValidation };
      }

      const validation = validatePagePosition(pagePosition);
      if (!validation.isValid) {
        setPagePositionErrorMessage(validation.errorMessage);
        return { shouldShowModal: false };
      }

      await mergeDocument({
        filesInfo,
        pagePosition,
        insertBeforeOrAfter,
        allPages,
        calculateRange,
        shouldCancelMerge,
        bookmarkIns,
      });

      eventTracking(UserEventConstants.EventType.CLICK, {
        elementName: MERGE_EVENTS.START_TO_MERGE,
        elementPurpose: MERGE_EVENTS_PURPOSE[MERGE_EVENTS.START_TO_MERGE],
      }).catch(() => {});
      return { shouldShowModal: false };
    },
    [validatePagePosition, validateFeatureAccess, mergeDocument, bookmarkIns]
  );

  const lockDocumentWhileMerging = useCallback(() => {
    dispatch(documentSyncActions.setIsSyncing({ isSyncing: true, increaseVersion: true }));
  }, [dispatch]);

  const unlockDocumentAfterMerging = useCallback(() => {
    dispatch(actions.setBackDropMessage(null));
    dispatch(documentSyncActions.reset());
  }, [dispatch]);

  return {
    handleMerge,
    isMerging,
    error,
    lockDocumentWhileMerging,
    unlockDocumentAfterMerging,
  };
};
