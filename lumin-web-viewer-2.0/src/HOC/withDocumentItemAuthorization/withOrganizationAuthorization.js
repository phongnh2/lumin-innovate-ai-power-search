import { DOCUMENT_ROLES } from 'constants/lumin-common';
import { ORGANIZATION_ROLES, OrgDocumentRole, OrgDocumentPermission } from 'constants/organizationConstants';

const getMemberPermission = (actions, roleOfDocument) => {
  switch (roleOfDocument.toUpperCase()) {
    case DOCUMENT_ROLES.SPECTATOR:
    case DOCUMENT_ROLES.VIEWER:
      return OrgDocumentPermission.CanView.includes(actions);
    case DOCUMENT_ROLES.EDITOR:
      return OrgDocumentPermission.CanEdit.includes(actions);
    case DOCUMENT_ROLES.SHARER:
      return OrgDocumentPermission.CanShare.includes(actions);
    default:
      break;
  }
};

const withOrganizationAuthorization = ({ document, userRole, currentUser }) => (actions) => {
  switch (userRole.toUpperCase()) {
    case ORGANIZATION_ROLES.ORGANIZATION_ADMIN: {
      return OrgDocumentRole.Admin.includes(actions);
    }
    case ORGANIZATION_ROLES.BILLING_MODERATOR: {
      return OrgDocumentRole.Billing.includes(actions);
    }
    case ORGANIZATION_ROLES.MEMBER: {
      if (currentUser._id === document.ownerId) {
        return OrgDocumentRole.Owner.includes(actions);
      }
      return getMemberPermission(actions, document.roleOfDocument);
    }
    default:
      break;
  }
};

export default withOrganizationAuthorization;
