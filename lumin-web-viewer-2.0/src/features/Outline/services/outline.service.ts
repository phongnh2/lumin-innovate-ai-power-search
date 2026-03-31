import { SOCKET_EMIT } from 'constants/socketConstant';

import { socket } from '../../../socket';
import { OutlineActionType } from '../types';
import {
  EmitDeleteOutlineDataType,
  EmitEditOutlineDataType,
  EmitInsertOutlineDataType,
  EmitMoveOutlineDataType,
} from '../types/emitOutlines.type';

export class OutlineService {
  static emitInsertOutline = ({ documentId, refId, data, isAddSub }: EmitInsertOutlineDataType) => {
    socket.emit(SOCKET_EMIT.OUTLINES_CHANGE, {
      roomId: documentId,
      data: {
        action: OutlineActionType.Insert,
        refId,
        outline: data,
        isSubOutline: isAddSub || false,
      },
    });
  };

  static emitDeleteOutline = ({ documentId, pathId }: EmitDeleteOutlineDataType) => {
    socket.emit(SOCKET_EMIT.OUTLINES_CHANGE, {
      roomId: documentId,
      data: {
        action: OutlineActionType.Delete,
        pathId,
      },
    });
  };

  static emitEditOutline = ({ documentId, pathId, data }: EmitEditOutlineDataType) => {
    socket.emit(SOCKET_EMIT.OUTLINES_CHANGE, {
      roomId: documentId,
      data: {
        action: OutlineActionType.Edit,
        pathId,
        outline: data,
      },
    });
  };

  static emitMoveOutline = ({ documentId, refId, movePosition, pathId }: EmitMoveOutlineDataType) => {
    socket.emit(SOCKET_EMIT.OUTLINES_CHANGE, {
      roomId: documentId,
      data: {
        action: OutlineActionType.Move,
        refId,
        movePosition,
        pathId,
      },
    });
  };
}
