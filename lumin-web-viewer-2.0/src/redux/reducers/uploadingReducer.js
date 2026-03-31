import { produce } from 'immer';
import merge from 'lodash/merge';
import v4 from 'uuid/v4';

import UploadUtils from 'utils/uploadUtils';

/**
 * {
 *  queue: [groupId]
 *  files: {
 *    [groupId]: {
 *      file,
        thumbnail,
        progress,
        status: processing, uploading, completed, error,
        cancelToken,
        documentId,
        folder: {
          type: individual, team, organization
          entityId : organizationId, teamId, userId,
          folderId,
        },
        oldGroupIndice: [],
 *    }
 *  }
 *  openUploadingPopper
 * }
 */

function cancelUploadFile(draffState, groupId) {
  const file = draffState.files[groupId];
  if (
    file
    && [
      UploadUtils.UploadStatus.UPLOADING,
      UploadUtils.UploadStatus.PROCESSING,
    ].includes(file.status)
  ) {
    if (file.status === UploadUtils.UploadStatus.UPLOADING && file.progress === 100) {
      return;
    }
    if (file.cancelToken) {
      file.cancelToken.cancel();
    }
    const fileIndex = draffState.queue.indexOf(groupId);
    const newGroupId = v4();
    if (fileIndex !== -1) {
      draffState.queue.splice(fileIndex, 1, newGroupId);
    }
    draffState.files[newGroupId] = merge({}, file, {
      status: UploadUtils.UploadStatus.ERROR,
      progress: 0,
      cancelToken: null,
      oldGroupIndice: file.oldGroupIndice.concat([groupId]),
    });
    Reflect.deleteProperty(draffState.files, groupId);
  }
}

// eslint-disable-next-line default-param-last
export default (initialState) => (state = initialState, action) => {
  const {
    type,
    payload,
  } = action;

  switch (type) {
    case 'ADD_UPLOADING_FILES': {
      const {
        files,
      } = payload;
      return produce(state, (draffState) => {
        files.forEach(({
          groupId,
          fileData,
          thumbnail,
          folderType,
          entityId,
          folderId,
          isNotify,
          handlerName,
          errorMessage,
          status,
        }) => {
          draffState.openUploadingPopper = true;
          draffState.queue.unshift(groupId);
          draffState.files[groupId] = {
            fileData,
            thumbnail,
            progress: 0,
            status: status || UploadUtils.UploadStatus.PROCESSING,
            cancelToken: null,
            documentId: null,
            folder: {
              type: folderType,
              entityId,
              folderId,
            },
            oldGroupIndice: [],
            isNotify,
            handlerName,
            errorMessage,
          };
        });
      });
    }
    case 'REMOVE_UPLOADING_FILES':
    {
      const {
        groupIds,
      } = payload;
      return produce(state, (draffState) => {
        groupIds.forEach((groupId) => {
          const fileIndex = draffState.queue.indexOf(groupId);
          if (fileIndex !== -1) {
            draffState.queue.splice(fileIndex, 1);
          }
          Reflect.deleteProperty(draffState.files, groupId);
        });
      });
    }
    case 'UPDATE_UPLOADING_FILE':
    {
      const {
        groupId,
        fileData,
        thumbnail,
        status,
        progress,
        cancelToken,
        documentId,
        errorMessage,
        errorCode,
        organization,
        document,
      } = payload;
      return produce(state, (draffState) => {
        const { files } = draffState;
        if (files[groupId]) {
          files[groupId] = merge({}, files[groupId], {
              fileData,
              thumbnail,
              status,
              progress,
              cancelToken,
              documentId,
              errorMessage,
              errorCode,
              organization,
              document,
          });
        }
      });
    }
    case 'RETRY_UPLOADING_FILE':
    {
      const {
        groupId,
      } = payload;
      // move file to the bottom of the queue
      return produce(state, (draffState) => {
        draffState.files[groupId] = merge({}, draffState.files[groupId], {
          status: UploadUtils.UploadStatus.PROCESSING,
          progress: 0,
          cancelToken: null,
        });
      });
    }
    case 'CANCEL_UPLOADING_FILE':
    {
      const {
        groupId,
      } = payload;
      return produce(state, (draffState) => {
        cancelUploadFile(draffState, groupId);
      });
    }
    case 'CANCEL_ALL_UPLOADING_FILES': {
      return produce(state, (draffState) => {
        const queueLength = draffState.queue.length;
        for (let i = 0; i < queueLength; i++) {
          const groupId = draffState.queue[i];
          cancelUploadFile(draffState, groupId);
        }
      });
    }
    case 'REMOVE_ALL_UPLOADING': {
      return {
        queue: [],
        files: {},
        openUploadingPopper: false,
      };
    }
    default:
      return state;
  }
};
