/// <reference path="./socketServices.d.ts" />
import { SOCKET_EMIT } from 'constants/socketConstant';
import { SOCKET_TYPE } from 'constants/teamConstant';

import { socket } from '../socket';

class SocketService {
  constructor() {
    this.socket = socket;
  }

  addUserToRoom(userId) {
    this.socket.emit(SOCKET_EMIT.ADD_USER_TO_ROOM, { userId });
    return this;
  }

  userLeaveTeam({ teamId, userId }) {
    this.socket.emit(SOCKET_EMIT.REMOVE_TEAMMEMBER, { teamId, userId, type: SOCKET_TYPE.LEAVE_TEAM });
    return this;
  }

  changeTeamRole({ teamId, userId, role }) {
    this.socket.emit(SOCKET_EMIT.CHANGE_TEAM_ROLE, { teamId, userId, role });
    return this;
  }

  sendAutoSyncResult({
    remoteId,
    documentId,
    status,
    message,
    reason,
    dataSync,
    hasAppliedRedaction,
    increaseVersion,
  }) {
    this.socket.emit(SOCKET_EMIT.RESPONSE_AUTO_SYNC, {
      remoteId,
      documentId,
      status,
      message,
      reason,
      dataSync,
      hasAppliedRedaction,
      increaseVersion,
    });
    return this;
  }

  toggleAutoSync(documentId, enableGoogleSync) {
    this.socket.emit(SOCKET_EMIT.TOGGLE_AUTO_SYNC, {
      documentId,
      enableGoogleSync,
    });
    return this;
  }

  /**
   * Keep this function for backward compatibility on mobile app
   */
  startMergingDocument({ documentId, userId }) {
    this.socket.emit(SOCKET_EMIT.START_MERGING_DOCUMENT, { documentId, userId });
    return this;
  }

  /**
   * Keep this function for backward compatibility on mobile app
   */
  finishMergingDocument({ documentId, userId, totalPages }) {
    this.socket.emit(SOCKET_EMIT.MERGED_DOCUMENT, { documentId, userId, totalPages });
    return this;
  }

  modifyDocumentContent(documentId, { status, increaseVersion, isAppliedOCR }) {
    this.socket.emit(SOCKET_EMIT.UPDATED_TEXT_CONTENT, { documentId, status, increaseVersion, isAppliedOCR });
    return this;
  }

  annotationChange(data) {
    return this.socket.emit(SOCKET_EMIT.ANNOTATION_CHANGE, data);
  }

  updateDocumentSize(documentId, size) {
    this.socket.emit(SOCKET_EMIT.UPDATE_DOCUMENT, { roomId: documentId, size, type: 'size' });
    return this;
  }
}

export const socketService = new SocketService();

export default SocketService;
