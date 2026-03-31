/* eslint-disable class-methods-use-this */
import * as folderApi from 'services/graphServices/folder';

import { LocationType } from 'constants/locationConstant';

export class PersonalFolder {
  create({ name, color, parentId, orgId }) {
    if (orgId) {
      return folderApi.createPersonalFolderInOrg({ name, color, parentId, orgId });
    }
    return folderApi.createPersonalFolder({ name, color, parentId });
  }

  getTotal = ({ orgId }) => folderApi.getTotalFolders({ refId: orgId, targetType: LocationType.PERSONAL });

  getAll({ searchKey, sortOptions, parentId, isStarredTab, orgId, fetchOptions }) {
    if (parentId) {
      return folderApi.getFoldersInFolder({
        searchKey,
        sortOptions,
        folderId: parentId,
        isStarredTab,
        fetchOptions
      });
    }
    if (orgId) {
      return folderApi.getPersonalFoldersInOrg({
        orgId,
        sortOptions,
        searchKey,
        fetchOptions,
      });
    }
    return folderApi.getPersonalFolders({
      searchKey,
      sortOptions,
      parentId,
      isStarredTab,
      fetchOptions,
    });
  }

  getLocation() {
    return 'Personal Documents';
  }

  deleteMultipleFolder({ folderIds, isNotify, clientId }) {
    return folderApi.deleteMultipleFolder({
      folderIds,
      isNotify,
      clientId,
    });
  }
}
