import { Dispatch } from 'redux';

import { SaveOperationStatus } from 'types/saveOperations';

import { generateOperationId } from 'hooks/useSaveOperation';

import { documentSyncActions } from 'features/Document/document-sync.slice';

import { OPERATION_CLEANUP_DELAY, OPERATION_PRIORITIES, SAVE_OPERATION_TYPES } from 'constants/saveOperationConstants';

export const startSaveOperation = (
  dispatch: Dispatch,
  type: keyof typeof SAVE_OPERATION_TYPES,
  metadata: Record<string, any> = {}
) => {
  const operationId = generateOperationId(type);
  dispatch(
    documentSyncActions.startSaveOperation({
      id: operationId,
      type,
      priority: OPERATION_PRIORITIES[type],
      metadata,
    })
  );
  return operationId;
};

export const completeSaveOperation = (
  dispatch: Dispatch,
  operationId: string,
  result: { status: SaveOperationStatus; message?: string }
) => {
  dispatch(documentSyncActions.completeSaveOperation({ id: operationId, ...result }));
  setTimeout(() => {
    dispatch(documentSyncActions.removeSaveOperation({ id: operationId }));
  }, OPERATION_CLEANUP_DELAY);
};
