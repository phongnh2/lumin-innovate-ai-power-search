export type SaveOperationType =
  | 'AUTO_SYNC'
  | 'MANUAL_SAVE'
  | 'PAGE_TOOLS'
  | 'CONTENT_EDIT'
  | 'BASE64_CONVERT'
  | 'ANNOTATION_CHANGE'
  | 'FIELD_CHANGE'
  | 'REDACTION';

export type SaveOperationStatus = 'SAVING' | 'SUCCESS' | 'ERROR' | 'CANCELLED' | 'OFFLINE';

export interface SaveOperation {
  id: string;
  type: SaveOperationType;
  status: SaveOperationStatus;
  message?: string;
  progress?: number;
  startTime: number;
  endTime?: number;
  priority: number;
  metadata?: Record<string, any>;
}

export interface SaveOperationsState {
  operations: Record<string, SaveOperation>;
  primaryOperation: string | null;
  globalStatus: string;
}

export interface StartSaveOperationPayload {
  id: string;
  type: SaveOperationType;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface UpdateSaveOperationPayload {
  id: string;
  updates: Partial<SaveOperation>;
}

export interface CompleteSaveOperationPayload {
  id: string;
  status: SaveOperationStatus;
  message?: string;
}

export interface RemoveSaveOperationPayload {
  id: string;
}

export const SAVE_OPERATION_ACTION_TYPES = {
  START_SAVE_OPERATION: 'START_SAVE_OPERATION',
  UPDATE_SAVE_OPERATION: 'UPDATE_SAVE_OPERATION',
  COMPLETE_SAVE_OPERATION: 'COMPLETE_SAVE_OPERATION',
  REMOVE_SAVE_OPERATION: 'REMOVE_SAVE_OPERATION',
} as const;

export interface StartSaveOperationAction {
  type: typeof SAVE_OPERATION_ACTION_TYPES.START_SAVE_OPERATION;
  payload: StartSaveOperationPayload;
}

export interface UpdateSaveOperationAction {
  type: typeof SAVE_OPERATION_ACTION_TYPES.UPDATE_SAVE_OPERATION;
  payload: UpdateSaveOperationPayload;
}

export interface CompleteSaveOperationAction {
  type: typeof SAVE_OPERATION_ACTION_TYPES.COMPLETE_SAVE_OPERATION;
  payload: CompleteSaveOperationPayload;
}

export interface RemoveSaveOperationAction {
  type: typeof SAVE_OPERATION_ACTION_TYPES.REMOVE_SAVE_OPERATION;
  payload: RemoveSaveOperationPayload;
}

export type SaveOperationAction =
  | StartSaveOperationAction
  | UpdateSaveOperationAction
  | CompleteSaveOperationAction
  | RemoveSaveOperationAction;

export interface UseSaveOperationReturn {
  startOperation: (type: SaveOperationType, metadata?: Record<string, any>) => string;
  updateOperation: (id: string, updates: Partial<SaveOperation>) => void;
  completeOperation: (id: string, result: { status: SaveOperationStatus; message?: string }) => void;
  cancelOperation: (id: string) => void;
  removeOperation: (id: string) => void;
  OPERATION_TYPES: Record<string, SaveOperationType>;
}

export interface OperationMetadata {
  documentId?: string;
  action?: string;
  pageNumber?: number;
  batchSize?: number;
  annotationId?: string;
  [key: string]: any;
}
