import * as DataLoader from 'dataloader';

import { DocumentRoleEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { IDocumentPermission } from 'Document/interfaces/document.interface';

export class SharedDocumentPermissionsLoader {
  public static create(documentService: DocumentService): DataLoader<string, IDocumentPermission> {
    return new DataLoader<string, IDocumentPermission>(async (ids: string[]) => {
      // Key: `${userId}-${documentId}`
      const documentIds = ids.map((id) => id.split('-')[1]);
      const userId = ids[0].split('-')[0];
      const sharedDocPermissions = await documentService.getDocumentPermissionByConditions({
        refId: userId,
        documentId: { $in: documentIds },
        role: { $ne: DocumentRoleEnum.OWNER },
      });
      const permissionsMap = sharedDocPermissions.reduce((map, permission) => {
        const key = `${permission.refId.toHexString()}-${permission.documentId.toHexString()}`;
        map[key] = permission;
        return map;
      }, {});
      return ids.map((id) => permissionsMap[id]);
    });
  }
}
