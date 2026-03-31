import { capitalize } from 'utils';

import { folderType } from 'constants/documentConstants';
import { ORGANIZATION_TEXT } from 'constants/organizationConstants';

export const FolderType = {
  PERSONAL: 'personal',
  ORGANIZATION: 'organization',
  ORGANIZATION_TEAM: 'organization_team',
};

export const FOLDER_SORT_OPTIONS = {
  DATE_CREATED: {
    name: 'Date Created',
    key: 'createdAt',
  },
  NAME: {
    name: 'Name',
    key: 'name',
  },
};
export const FOLDER_SORT_DIRECTION = {
  ASC: 'ASC',
  DESC: 'DESC',
};

export const MAXIMUM_FOLDER = 200;

// Count from 0
export const MAXIMUM_FOLDER_DEPTH = 9;

export const MAXIMUM_FOLDER_COLOR = 100;

export const FolderAction = {
  INFO: 'INFO',
  EDIT: 'EDIT',
  STAR: 'STAR',
  REMOVE: 'REMOVE',
};

export const DocFolderMapping = {
  [folderType.INDIVIDUAL]: FolderType.PERSONAL,
  [folderType.TEAMS]: FolderType.ORGANIZATION_TEAM,
  [folderType.ORGANIZATION]: FolderType.ORGANIZATION,
  [folderType.SHARED]: FolderType.PERSONAL,
};

export const FOLDER_INFO_KEY = {
  NAME: 'name',
  LOCATION: 'location',
  CREATOR_NAME: 'creatorName',
  CREATED_AT: 'createdAt',
  TOTAL_DOCUMENT: 'totalDocument',
};

export const DocTabMapping = {
  [FolderType.PERSONAL]: folderType.INDIVIDUAL,
  [FolderType.ORGANIZATION_TEAM]: folderType.TEAMS,
  [FolderType.ORGANIZATION]: folderType.ORGANIZATION,
};

export const FolderPermission = {
  EDIT: 'EDIT',
  VIEW_INFO: 'VIEW_INFO',
  CREATE: 'CREATE',
  DELETE: 'DELETE',
  STAR: 'STAR',
  UPLOAD_DOCUMENT: 'UPLOAD_DOCUMENT',
  REMOVE_DOCUMENT: 'REMOVE_DOCUMENT',
};

export const FolderRole = {
  MANAGER: 'MANAGER',
  MEMBER: 'MEMBER',
  OWNER: 'OWNER',
  SHARED: 'SHARED',
};
export const TOTAL_FOLDER_DUMMY = 6;

export const FOLDER_TEXT_MAPPING = {
  [folderType.INDIVIDUAL]: 'My Documents',
  [folderType.TEAMS]: 'Team Documents',
  [folderType.ORGANIZATION]: `${capitalize(ORGANIZATION_TEXT)} Documents`,
  [folderType.STARRED]: 'Starred Documents',
  [folderType.SHARED]: 'Shared with me',
};

export const FolderLocationType = {
  PERSONAL: 'PERSONAL',
  ORGANIZATION: 'ORGANIZATION',
  ORGANIZATION_TEAM: 'ORGANIZATION_TEAM',
  FOLDER: 'FOLDER',
};

export const FolderLocationTypeMapping = {
  [FolderLocationType.FOLDER]: FolderType.PERSONAL,
  [FolderLocationType.PERSONAL]: FolderType.PERSONAL,
  [FolderLocationType.ORGANIZATION_TEAM]: FolderType.ORGANIZATION_TEAM,
  [FolderLocationType.ORGANIZATION]: FolderType.ORGANIZATION,
};
