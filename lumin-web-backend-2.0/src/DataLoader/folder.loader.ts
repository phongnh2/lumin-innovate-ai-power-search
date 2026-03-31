import * as DataLoader from 'dataloader';

import { Utils } from 'Common/utils/Utils';

import { FolderService } from 'Folder/folder.service';
import { IFolder } from 'Folder/interfaces/folder.interface';

export class FolderLoader {
  public static create(folderService: FolderService): DataLoader<string, IFolder> {
    return new DataLoader<string, IFolder>(async (ids: string[]) => {
      const folders = await folderService.findFolderByIds(ids);
      const foldersMap = Utils.createKeyedMap(folders, (folder) => folder._id);
      return ids.map((id) => foldersMap[id]);
    });
  }
}
