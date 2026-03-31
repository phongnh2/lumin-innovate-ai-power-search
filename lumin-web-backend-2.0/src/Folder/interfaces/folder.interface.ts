import { DocumentWorkspace } from 'Document/document.enum';
import { FolderSortOptions } from 'graphql.schema';

export interface IFolderModel {
  ownerId: string,
  shareSetting: any,
  listUserStar: [string],
  path: string,
  depth: number,
  parentId: string,
  name: string,
  color: string,
  createdAt: string
}

export interface IFolder extends IFolderModel {
  _id: string;
}

export interface IFolderPermissionModel {
  refId: string,
  folderId: string,
  role: string
  workspace: {
    refId: string,
    type: DocumentWorkspace.ORGANIZATION,
  }
}

export interface IFolderPermission extends IFolderPermissionModel {
  _id: string;
}
export type GetFoldersInput = {
  userId: string,
  sortOptions: FolderSortOptions,
  isStarredTab: boolean,
  searchKey?: string
}
