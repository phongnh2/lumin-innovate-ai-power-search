import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { SaveOperationType, SaveOperation, SaveOperationStatus } from 'types/saveOperations';

import { documentSyncActions } from 'features/Document/document-sync.slice';

import {
  SAVE_OPERATION_TYPES,
  OPERATION_PRIORITIES,
  OPERATION_CLEANUP_DELAY,
  SAVE_OPERATION_STATUS,
} from 'constants/saveOperationConstants';

export const generateOperationId = (type: SaveOperationType) => `${type}_${Date.now()}_${uuidv4()}`;

export const useSaveOperation = () => {
  const dispatch = useDispatch();

  const startOperation = useCallback(
    (type: SaveOperationType, metadata: Record<string, any> = {}) => {
      const id = generateOperationId(type);
      const priority = OPERATION_PRIORITIES[type] || 0;

      dispatch(
        documentSyncActions.startSaveOperation({
          id,
          type,
          priority,
          metadata,
        })
      );

      return id;
    },
    [dispatch]
  );

  const updateOperation = useCallback(
    (id: string, updates: Partial<SaveOperation>) => {
      dispatch(documentSyncActions.updateSaveOperation({ id, updates }));
    },
    [dispatch]
  );

  const completeOperation = useCallback(
    (id: string, result: { status: SaveOperationStatus; message?: string }) => {
      dispatch(documentSyncActions.completeSaveOperation({ id, ...result }));

      setTimeout(() => {
        dispatch(documentSyncActions.removeSaveOperation({ id }));
      }, OPERATION_CLEANUP_DELAY);
    },
    [dispatch]
  );

  const cancelOperation = useCallback(
    (id: string) => {
      dispatch(documentSyncActions.completeSaveOperation({ id, status: SAVE_OPERATION_STATUS.CANCELLED }));

      setTimeout(() => {
        dispatch(documentSyncActions.removeSaveOperation({ id }));
      }, OPERATION_CLEANUP_DELAY);
    },
    [dispatch]
  );

  const removeOperation = useCallback(
    (id: string) => {
      dispatch(documentSyncActions.removeSaveOperation({ id }));
    },
    [dispatch]
  );

  return {
    startOperation,
    updateOperation,
    completeOperation,
    cancelOperation,
    removeOperation,
    OPERATION_TYPES: SAVE_OPERATION_TYPES,
  };
};
