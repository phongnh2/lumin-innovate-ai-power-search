import { folderType } from './documentConstants';

export const FolderType: {
  PERSONAL: string;
  ORGANIZATION: string;
  ORGANIZATION_TEAM: string;
};

export const FOLDER_SORT_OPTIONS: {
  DATE_CREATED: {
    name: string;
    key: string;
  };
  NAME: {
    name: string;
    key: string;
  };
};

export const FOLDER_SORT_DIRECTION: {
  ASC: string;
  DESC: string;
};

export const MAXIMUM_FOLDER: number;

export const MAXIMUM_FOLDER_DEPTH: number;

export const MAXIMUM_FOLDER_COLOR: number;

export const FolderAction: {
  INFO: string;
  EDIT: string;
  STAR: string;
  REMOVE: string;
};

export const DocFolderMapping: {
  [x: typeof folderType[keyof typeof folderType]]: string;
};

export const FOLDER_INFO_KEY: {
  NAME: string;
  LOCATION: string;
  CREATOR_NAME: string;
  CREATED_AT: string;
  TOTAL_DOCUMENT: string;
};

export const DocTabMapping: {
  [x: string]: typeof folderType[keyof typeof folderType];
};

export const FolderPermission: {
  EDIT: string;
  VIEW_INFO: string;
  CREATE: string;
  DELETE: string;
  STAR: string;
  UPLOAD_DOCUMENT: string;
  REMOVE_DOCUMENT: string;
};

export const FolderRole: {
  MANAGER: string;
  MEMBER: string;
  OWNER: string;
  SHARED: string;
};

export const TOTAL_FOLDER_DUMMY: number;

export const FOLDER_TEXT_MAPPING: {
  [x: number]: string;
};

export declare const FolderLocationType: {
  PERSONAL: string;
  ORGANIZATION: string;
  ORGANIZATION_TEAM: string;
  FOLDER: string;
};
export declare const FolderLocationTypeMapping: {
  [x: typeof FolderLocationType[keyof typeof FolderLocationType]]: typeof FolderType[keyof typeof FolderType];
};
