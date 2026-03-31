import { DocumentRole } from 'constants/documentConstants';

import { getDocumentRoleIndex } from './permission';

type DocumentRoleType = Lowercase<keyof typeof DocumentRole>;

export class DocumentPermission {
  static canShare({ roleOfDocument }: { roleOfDocument: DocumentRoleType }) {
    return getDocumentRoleIndex(roleOfDocument) <= getDocumentRoleIndex(DocumentRole.SHARER);
  }

  static canEdit({ roleOfDocument }: { roleOfDocument: DocumentRoleType }) {
    return getDocumentRoleIndex(roleOfDocument) <= getDocumentRoleIndex(DocumentRole.EDITOR);
  }

  static canComment({ roleOfDocument }: { roleOfDocument: DocumentRoleType }) {
    return getDocumentRoleIndex(roleOfDocument) <= getDocumentRoleIndex(DocumentRole.VIEWER);
  }

  static canView({ roleOfDocument }: { roleOfDocument: DocumentRoleType }) {
    return getDocumentRoleIndex(roleOfDocument) <= getDocumentRoleIndex(DocumentRole.SPECTATOR);
  }
}
