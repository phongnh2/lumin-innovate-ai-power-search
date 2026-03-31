import { isEmpty } from 'lodash';
import get from 'lodash/get';

import UploadUtils from 'utils/uploadUtils';

import { folderType } from 'constants/documentConstants';

import { getCurrentOrganization } from './organizationSelectors';

export const isValidForUpload = (state) => {
  const { files } = state.uploadingDocuments;
  return (groupId) => {
    const file = files[groupId];
    return file && file.status === UploadUtils.UploadStatus.PROCESSING;
  };
};
export const getDocViewer = (state) => state.docViewer;
export const getUploadingDocuments = (state) => {
  const { files, queue } = state.uploadingDocuments;
  return queue.map((groupId) => {
    const file = files[groupId];
    if (!file) {
      return null;
    }
    return {
      groupId,
      ...file,
    };
  });
};
export const getUploadBoxQueue = (state) => state.uploadingDocuments.queue;
export const getUploadingDocumentsStat = (state) => {
  const files = state.uploadingDocuments.files || {};
  let failed = 0;
  let completed = 0;
  let uploading = 0;
  const items = Object.values(files);
  items.forEach((item) => {
    switch (item.status) {
      case UploadUtils.UploadStatus.PROCESSING:
      case UploadUtils.UploadStatus.UPLOADING:
        uploading += 1;
        break;
      case UploadUtils.UploadStatus.COMPLETED:
        completed += 1;
        break;
      case UploadUtils.UploadStatus.ERROR:
        failed += 1;
        break;
      default:
        break;
    }
  });
  return {
    failed,
    uploading,
    completed,
    total: items.length,
  };
};
export const getUploadingDocumentByGroupId = (state, groupId, attributes = []) => {
  const { files } = state.uploadingDocuments;
  const file = files[groupId];
  if (!file) {
    return null;
  }
  const data = {
    groupId,
    ...file,
  };
  return !attributes.length
    ? data
    : Object.keys(data)
        .filter((key) => attributes.includes(key))
        .reduce((acc, key) => {
          acc[key] = data[key];
          return acc;
        }, {});
};
const isBelongToMobileQueue = ({ state, groupId, folderId, currentFolderType, currentTeam }) => {
  const { files } = state.uploadingDocuments;
  const { folder } = files[groupId];
  const isBelongToFolder = folderId === folder.folderId;
  const currentOrganization = getCurrentOrganization(state);

  const isInCurrentFolder = folder.type === currentFolderType;
  const isInMyDocument = folder.type === folderType.INDIVIDUAL;
  const isInCurrentTeam = folder.type === folderType.TEAMS && folder.entityId === currentTeam?._id;
  const isInCurrentOrg =
    folder.type === folderType.ORGANIZATION && folder.entityId === get(currentOrganization, 'data._id');
  return folder.folderId
    ? isBelongToFolder
    : isInCurrentFolder && (isInMyDocument || isInCurrentTeam || isInCurrentOrg);
};
export const getQueueInMobile = ({ state, folderId = null, currentFolderType, currentTeam }) => {
  const { queue } = state.uploadingDocuments;
  return queue.filter((groupId) =>
    isBelongToMobileQueue({
      state,
      groupId,
      folderId,
      currentFolderType,
      currentTeam,
    })
  );
};

export const getIsCompletedUploadDocuments = (state) => {
  const files = state.uploadingDocuments.files || {};
  const isOpenUploadingPopper = state.uploadingDocuments.openUploadingPopper;
  return (
    !isOpenUploadingPopper ||
    (!isEmpty(files) &&
      Object.values(files).every((item) =>
        [UploadUtils.UploadStatus.COMPLETED, UploadUtils.UploadStatus.ERROR].includes(item.status)
      ))
  );
};

export const isOpenUploadingPopper = (state) => state.uploadingDocuments.openUploadingPopper;
