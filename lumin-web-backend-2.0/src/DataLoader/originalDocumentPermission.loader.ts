import * as DataLoader from 'dataloader';

import { Utils } from 'Common/utils/Utils';

import { DocumentRoleEnum } from 'Document/document.enum';
import { DocumentService } from 'Document/document.service';
import { IDocumentPermission } from 'Document/interfaces/document.interface';

export class OriginalDocumentPermissionsLoader {
  public static create(documentService: DocumentService): DataLoader<string, IDocumentPermission> {
    return new DataLoader<string, IDocumentPermission>(async (ids: string[]) => {
      const documentPermissions = await documentService.getDocumentPermissionByConditions({
        documentId: { $in: ids },
        role: { $in: [DocumentRoleEnum.OWNER, DocumentRoleEnum.ORGANIZATION, DocumentRoleEnum.ORGANIZATION_TEAM] },
      });
      const docPermissionsMap = Utils.createKeyedMap(documentPermissions, (docPermission) => docPermission.documentId.toHexString());
      return ids.map((id) => docPermissionsMap[id]);
    });
  }
}
