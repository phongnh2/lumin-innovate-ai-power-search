import { OrgTeamDocumentRole, ORG_TEAM_ROLE } from 'constants/organizationConstants';

const withOrgTeamAuthorization = ({ userRole, document, currentUser }) => (actions) => {
  switch (userRole.toUpperCase()) {
    case ORG_TEAM_ROLE.ADMIN: {
      return OrgTeamDocumentRole.Admin.includes(actions);
    }
    case ORG_TEAM_ROLE.MEMBER: {
      if (document.ownerId === currentUser._id) {
        return OrgTeamDocumentRole.Owner.includes(actions);
      }
      return OrgTeamDocumentRole.Member.includes(actions);
    }
    default:
      throw new Error();
  }
};

export default withOrgTeamAuthorization;
