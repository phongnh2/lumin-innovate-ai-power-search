/* eslint-disable class-methods-use-this */
import * as folderApi from 'services/graphServices/folder';

import { LocationType } from 'constants/locationConstant';
import { ORGANIZATION_TEXT } from 'constants/organizationConstants';

export class OrganizationFolder {
  create({
    name, color, parentId, orgId, isNotify,
  }) {
    return folderApi.createOrganizationFolder({
      name, color, parentId, orgId, isNotify,
    });
  }

  getTotal({ orgId }) {
    return folderApi.getTotalFolders({
      refId: orgId,
      targetType: LocationType.ORGANIZATION,
    });
  }

  getAll({ sortOptions, parentId, orgId, isStarredTab, searchKey, fetchOptions }) {
    if (parentId) {
      return folderApi.getFoldersInFolder({
        searchKey,
        sortOptions,
        folderId: parentId,
        isStarredTab,
        fetchOptions,
      });
    }
    return folderApi.getOrganizationFolders({
      sortOptions,
      parentId,
      orgId,
      isStarredTab,
      searchKey,
      fetchOptions,
    });
  }

  getLocation({ organizationName }) {
    return `${organizationName} ${ORGANIZATION_TEXT}`;
  }

  deleteMultipleFolder({ folderIds, isNotify, clientId }) {
    return folderApi.deleteMultipleFolder({
      folderIds,
      isNotify,
      clientId,
    });
  }
}
