import DataLoader = require('dataloader');

import { FolderRoleEnum } from 'Folder/folder.enum';
import { FolderService } from 'Folder/folder.service';
import { IFolderPermission } from 'Folder/interfaces/folder.interface';

export class FolderPermissionLoader {
  public static create(folderService: FolderService): DataLoader<string, IFolderPermission[]> {
    return new DataLoader<string, IFolderPermission[]>(async (ids: string[]) => {
      const folderPermissions = await folderService.findFolderPermissionsByCondition({
        folderId: { $in: ids },
        role: { $in: [FolderRoleEnum.OWNER, FolderRoleEnum.ORGANIZATION, FolderRoleEnum.ORGANIZATION_TEAM] },
      });
      const permissionsMap = folderPermissions.reduce((map, permission) => {
        if (!map[permission.folderId]) {
          map[permission.folderId] = [];
        }
        map[permission.folderId].push(permission);
        return map;
      }, {});

      return ids.map((id) => permissionsMap[id] ?? []);
    });
  }
}
