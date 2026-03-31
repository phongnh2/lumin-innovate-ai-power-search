import { folderType } from 'constants/documentConstants';

function checkDocumentRoleType(role) {
  const INDVIDUAL_DOCUMENT = ['VIEWER', 'EDITOR', 'SHARER', 'OWNER'];
  // const TEAM_DOCUMENT = ['MEMBER', 'MODERATOR', 'ADMIN'];
  if (INDVIDUAL_DOCUMENT.includes(role.toUpperCase())) {
    return folderType.INDIVIDUAL;
  }
  return folderType.TEAMS;
}

export default checkDocumentRoleType;
