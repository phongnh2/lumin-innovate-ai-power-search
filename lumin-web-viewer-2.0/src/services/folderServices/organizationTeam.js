/* eslint-disable class-methods-use-this */
import * as folderApi from 'services/graphServices/folder';

import { LocationType } from 'constants/locationConstant';

export class OrganizationTeamFolder {
  create({
    name, color, parentId, teamId,
  }) {
    return folderApi.createOrgTeamFolder({
      name, color, parentId, teamId,
    });
  }

  getTotal = async ({ teamId }) => {
    if (teamId) {
      return folderApi.getTotalFolders({ refId: teamId, targetType: LocationType.ORGANIZATION_TEAM });
    }
  };

  getAll({ searchKey, sortOptions, parentId, teamId, fetchOptions }) {
    if (parentId) {
      return folderApi.getFoldersInFolder({
        searchKey,
        sortOptions,
        folderId: parentId,
        fetchOptions,
      });
    }
    return folderApi.getOrgTeamFolders({
      searchKey,
      sortOptions,
      parentId,
      teamId,
      fetchOptions,
    });
  }

  getLocation({ organizationName, teamName }) {
    return `${teamName} team in ${organizationName} organization`;
  }

  deleteMultipleFolder({ folderIds, isNotify, clientId }) {
    return folderApi.deleteMultipleFolder({
      folderIds,
      isNotify,
      clientId,
    });
  }
}
