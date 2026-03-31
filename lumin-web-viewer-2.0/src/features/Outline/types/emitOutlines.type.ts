import { TDocumentOutline } from 'interfaces/document/document.interface';

import { OutlineActionType } from './outlineActionType';
import { OutlineMovePosition } from './outlineMovePosition';

export type EmitInsertOutlineDataType = {
  documentId: string;
  refId: string;
  data: TDocumentOutline;
  isAddSub?: boolean;
};

export type EmitDeleteOutlineDataType = {
  documentId: string;
  pathId: string;
};

export type EmitEditOutlineDataType = {
  documentId: string;
  pathId: string;
  data: TDocumentOutline;
};

export type EmitMoveOutlineDataType = {
  documentId: string;
  refId: string;
  movePosition: OutlineMovePosition;
  pathId: string;
};

export type EmitOutlineHandlerType =
  | {
      outlineAction: OutlineActionType.Insert;
      data: EmitInsertOutlineDataType;
    }
  | {
      outlineAction: OutlineActionType.Edit;
      data: EmitEditOutlineDataType;
    }
  | {
      outlineAction: OutlineActionType.Delete;
      data: EmitDeleteOutlineDataType;
    }
  | {
      outlineAction: OutlineActionType.Move;
      data: EmitMoveOutlineDataType;
    };
