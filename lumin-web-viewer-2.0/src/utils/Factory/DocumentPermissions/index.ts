import { DOCUMENT_TYPE } from 'constants/documentConstants';
import { DocumentPermissionOrganization } from './organization';
import { DocumentPermissionTeam } from './team';
import { DocumentPermissionPersonal } from './personal';

class DocumentPermissions {
  // eslint-disable-next-line class-methods-use-this
  from(documentType: string): DocumentPermissionPersonal | DocumentPermissionOrganization | DocumentPermissionTeam {
    switch (documentType.toUpperCase()) {
      case DOCUMENT_TYPE.PERSONAL:
        return new DocumentPermissionPersonal();
      case DOCUMENT_TYPE.ORGANIZATION:
        return new DocumentPermissionOrganization();
      case DOCUMENT_TYPE.ORGANIZATION_TEAM:
        return new DocumentPermissionTeam();
      default:
        throw new Error('Invalid document type');
    }
  }
}

export default new DocumentPermissions();
