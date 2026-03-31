import { IDocumentBase } from 'interfaces/document/document.interface';
import organizationServices from 'services/organizationServices';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { DocumentPermissionBase } from './base';

export class DocumentPermissionOrganization extends DocumentPermissionBase {
  userRole: string;

  documentUserRole: IDocumentBase['roleOfDocument'];

  createChecker({
    document,
    userRole,
  }: {
    document: IDocumentBase;
    userRole: string;
  }): DocumentPermissionOrganization {
    super.createChecker({ document });
    this.userRole = userRole;
    return this;
  }

  isManager(): boolean {
    return organizationServices.isManager(this.userRole);
  }

  isMember(): boolean {
    return this.userRole === ORGANIZATION_ROLES.MEMBER;
  }

  // canComment() {}

  // canEdit() {}

  // canSpectator() {}

  // canRemove() {}

  canUpdateShareSetting(): boolean {
    return this.isManager();
  }
}
