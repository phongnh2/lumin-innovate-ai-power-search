import { IFolder } from 'interfaces/folder/folder.interface';

export function getFolderTree(folderId: string): Promise<IFolder & { folders: IFolder[] }>;

export function getFoldersInFolder(input: {
  folderId: string;
  sortOptions?: { createdAt: string };
  searchKey?: string;
  isStarredTab?: boolean;
}): Promise<IFolder[]>;

export function getTotalFolders(input: { refId: string; targetType: string }): Promise<number>;

export function getFoldersAvailability(orgId: string): Promise<{
  personal: boolean;
  organization: boolean;
  teams: string[];
}>;
