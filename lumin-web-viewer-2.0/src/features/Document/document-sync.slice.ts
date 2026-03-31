import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type {
  SaveOperation,
  UpdateSaveOperationPayload,
  CompleteSaveOperationPayload,
  RemoveSaveOperationPayload,
  StartSaveOperationPayload,
} from 'types/saveOperations';

import { RootState } from 'store';

import { OPERATION_PRIORITIES, SAVE_OPERATION_STATUS } from 'constants/saveOperationConstants';

const determinePrimaryOperation = (operations: Record<string, SaveOperation>): string | null => {
  const operationsList = Object.values(operations);

  const activeOperations = operationsList.filter((op) => op.status === SAVE_OPERATION_STATUS.SAVING);

  if (activeOperations.length === 0) {
    const completedOperations = operationsList
      .filter((op) => op.status !== SAVE_OPERATION_STATUS.SAVING)
      .sort((a, b) => (b.endTime || 0) - (a.endTime || 0));
    return completedOperations[0]?.id || null;
  }

  const priorityOperation = activeOperations.sort((a, b) => b.priority - a.priority)[0];
  return priorityOperation.id;
};

export type DocumentSyncState = {
  isSyncing: boolean;
  increaseVersion: boolean;
  operations: Record<string, SaveOperation>;
  primaryOperation: string | null;
  globalStatus: string;
};

const initialState: DocumentSyncState = {
  /**
   * @description Whether the document is syncing from another user
   */
  isSyncing: false,
  /**
   * @description Whether the file content has changed
   */
  increaseVersion: false,
  operations: {},
  primaryOperation: null,
  globalStatus: '',
};

const documentSyncSlice = createSlice({
  name: 'DOCUMENT_SYNC',
  initialState,
  reducers: {
    setIsSyncing: (state, action: PayloadAction<{ isSyncing: boolean; increaseVersion?: boolean }>) => {
      state.isSyncing = action.payload.isSyncing;
      state.increaseVersion = action.payload.increaseVersion;
    },
    toggleIsSyncing: (state) => {
      state.isSyncing = !state.isSyncing;
    },
    reset: () => initialState,
    startSaveOperation: (state, action: PayloadAction<StartSaveOperationPayload>) => {
      const { id, type, priority = OPERATION_PRIORITIES[type] || 0, metadata = {} } = action.payload;

      const operation: SaveOperation = {
        id,
        type,
        status: SAVE_OPERATION_STATUS.SAVING,
        startTime: Date.now(),
        priority,
        metadata,
      };

      state.operations[id] = operation;
      state.primaryOperation = determinePrimaryOperation(state.operations);
      state.globalStatus = operation.status;
    },

    updateSaveOperation: (state, action: PayloadAction<UpdateSaveOperationPayload>) => {
      const { id, updates } = action.payload;

      if (!state.operations[id]) {
        return;
      }

      Object.assign(state.operations[id], updates);

      state.primaryOperation = determinePrimaryOperation(state.operations);
      state.globalStatus = state.primaryOperation ? state.operations[state.primaryOperation].status : '';
    },

    completeSaveOperation: (state, action: PayloadAction<CompleteSaveOperationPayload>) => {
      const { id, status, message } = action.payload;

      if (!state.operations[id]) {
        return;
      }

      const completedOperation = state.operations[id];
      completedOperation.status = status;
      completedOperation.message = message;
      completedOperation.endTime = Date.now();

      state.primaryOperation = determinePrimaryOperation(state.operations);
      state.globalStatus = state.primaryOperation ? state.operations[state.primaryOperation].status : message || status;
    },

    removeSaveOperation: (state, action: PayloadAction<RemoveSaveOperationPayload>) => {
      const { id } = action.payload;

      delete state.operations[id];

      state.primaryOperation = determinePrimaryOperation(state.operations);
      state.globalStatus = state.primaryOperation ? state.operations[state.primaryOperation].status : '';
    },
  },
});

export const documentSyncSelectors = {
  isSyncing: (state: RootState) => state.documentSync.isSyncing,
  isFileContentChanged: (state: RootState) => state.documentSync.increaseVersion,
  getSaveOperations: (state: RootState) => state.documentSync.operations,
  getPrimarySaveOperation: (state: RootState) => {
    const { operations, primaryOperation } = state.documentSync;
    return primaryOperation ? operations[primaryOperation] : null;
  },
  getSaveOperationsGlobalStatus: (state: RootState) => state.documentSync.globalStatus,
  getSaveOperationById: (state: RootState, id: string) => state.documentSync.operations[id],
};

export const documentSyncActions = documentSyncSlice.actions;

export default documentSyncSlice.reducer;
