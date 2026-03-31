import { IDocumentBase } from 'interfaces/document/document.interface';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { DocumentPermissionBase } from './base';

export class DocumentPermissionTeam extends DocumentPermissionBase {
  userRole: string;

  createChecker({
    document,
    userRole,
  }: {
    document: IDocumentBase;
    userRole: string;
  }): DocumentPermissionTeam {
    super.createChecker({ document });
    this.userRole = userRole;
    return this;
  }

  isManager(): boolean {
    return this.userRole === ORGANIZATION_ROLES.TEAM_ADMIN;
  }

  isMember(): boolean {
    return this.userRole === ORGANIZATION_ROLES.MEMBER;
  }

  // canShare() {}

  // canComment() {}

  // canEdit() {}

  // canSpectator() {}

  // canRemove() {}

  canUpdateShareSetting(): boolean {
    return this.isManager();
  }
}
