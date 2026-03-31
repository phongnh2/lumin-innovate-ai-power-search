import { ORG_TEXT } from './organizationConstants';

export const MAX_TEAMNAME_LENGTH = 30;

export const TEAM_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEMBER: 'member',
};

export const SOCKET_TYPE = {
  REMOVE_MEMBER: 'REMOVE_MEMBER',
  LEAVE_TEAM: 'LEAVE_TEAM',
  DELETE_TEAM: 'DELETE_TEAM',
};

export const MAX_FREE_TEAM = 2;
export const MAX_PREMIUM_TEAM = 200;

// only used for URL
export const TEAM_TEXT = 'space';

// only used for URL
export const TEAMS_TEXT = `${TEAM_TEXT}s`;

export const TEAM_DOCUMENT_PATHS = [
  `/${ORG_TEXT}/:orgDomain/documents/${TEAM_TEXT}/:teamId`,
  `/${ORG_TEXT}/:orgDomain/documents/${TEAM_TEXT}/:teamId/folder/:folderId`,
];

export const OLD_TEAM_DASHBOARD_PATHS = [`/${ORG_TEXT}/:orgName/teams/:id/:tab`];

export const OLD_TEAM_DOCUMENT_PATHS = ['/documents/team/:teamId', '/documents/team/:teamId/folder/:folderId'];
