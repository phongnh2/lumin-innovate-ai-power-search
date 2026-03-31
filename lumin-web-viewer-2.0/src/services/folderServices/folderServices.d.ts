import { IFolder } from 'interfaces/folder/folder.interface';

import { OrganizationFolder } from './organization';
import { OrganizationTeamFolder } from './organizationTeam';
import { PersonalFolder } from './personal';

export default FolderServices;
declare class FolderServices {
  constructor(type: string);

  instance: OrganizationFolder | OrganizationTeamFolder | PersonalFolder;

  create(params: unknown): unknown;

  getTotal(params: unknown): unknown;

  getAll(params: unknown): Promise<IFolder[]>;

  edit({ folderId, color, name }: { folderId: string; color: string; name: string }): Promise<unknown>;

  starFolder(folderId: string): Promise<IFolder>;

  addColor(color: unknown): Promise<void>;

  delete(folderId: unknown, isNotify: unknown): Promise<unknown>;

  getDetail(folderId: unknown): Promise<unknown>;

  getLocation(params: unknown): string;
}
