/* eslint-disable class-methods-use-this */
import { DOCUMENT_ROLES } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

export abstract class DocumentPermissionBase {
  document: IDocumentBase;

  createChecker({ document }: { document: IDocumentBase }): DocumentPermissionBase {
    this.document = document;
    return this;
  }

  getDocumentRole(): string {
    return this.document.roleOfDocument?.toUpperCase();
  }

  isOwner(): boolean {
    return this.getDocumentRole() === DOCUMENT_ROLES.OWNER;
  }

  canShare(): boolean {
    return [DOCUMENT_ROLES.SHARER, DOCUMENT_ROLES.OWNER].includes(this.getDocumentRole());
  }

  canComment(): boolean {
    return [DOCUMENT_ROLES.SHARER, DOCUMENT_ROLES.OWNER, DOCUMENT_ROLES.EDITOR, DOCUMENT_ROLES.VIEWER].includes(
      this.getDocumentRole()
    );
  }

  hasSharePermission(): boolean {
    return this.getDocumentRole() === DOCUMENT_ROLES.SHARER;
  }

  abstract canUpdateShareSetting(): void;
}
