import '@testing-library/jest-dom';
import { CURRENT_USER, OTHER_USER, AuthTestCase } from './testUtils';

jest.mock('constants/organizationConstants', () => ({
  ORG_TEAM_ROLE: { ADMIN: 'ADMIN', MEMBER: 'MEMBER' },
  OrgTeamDocumentRole: {
    Admin: ['View', 'Rename', 'Move', 'Remove', 'Share', 'MakeACopy', 'CopyLink', 'MarkFavorite', 'UploadToLumin', 'CreateAsTemplate', 'Merge'],
    Owner: ['View', 'Rename', 'Move', 'Remove', 'Share', 'MakeACopy', 'CopyLink', 'MarkFavorite', 'UploadToLumin'],
    Member: ['View', 'MakeACopy', 'CopyLink', 'MarkFavorite'],
  },
}));

import withOrgTeamAuthorization from '../withOrgTeamAuthorization';

describe('withOrgTeamAuthorization', () => {
  const teamTestCases: AuthTestCase[] = [
    { userRole: 'ADMIN', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'View', expected: true },
    { userRole: 'ADMIN', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'Remove', expected: true },
    { userRole: 'ADMIN', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'Rename', expected: true },
    { userRole: 'ADMIN', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'Share', expected: true },
    { userRole: 'ADMIN', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'Move', expected: true },
    { userRole: 'ADMIN', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'MakeACopy', expected: true },
    { userRole: 'ADMIN', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'CreateAsTemplate', expected: true },
    { userRole: 'MEMBER', ownerId: CURRENT_USER._id, docRole: 'OWNER', action: 'View', expected: true },
    { userRole: 'MEMBER', ownerId: CURRENT_USER._id, docRole: 'OWNER', action: 'Remove', expected: true },
    { userRole: 'MEMBER', ownerId: CURRENT_USER._id, docRole: 'OWNER', action: 'Rename', expected: true },
    { userRole: 'MEMBER', ownerId: CURRENT_USER._id, docRole: 'OWNER', action: 'Move', expected: true },
    { userRole: 'MEMBER', ownerId: CURRENT_USER._id, docRole: 'OWNER', action: 'Share', expected: true },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'EDITOR', action: 'View', expected: true },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'EDITOR', action: 'MakeACopy', expected: true },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'EDITOR', action: 'CopyLink', expected: true },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'EDITOR', action: 'Remove', expected: false },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'EDITOR', action: 'Rename', expected: false },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'EDITOR', action: 'Move', expected: false },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'EDITOR', action: 'Share', expected: false },
    { userRole: 'admin', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'View', expected: true },
    { userRole: 'member', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'View', expected: true },
  ];

  test.each(teamTestCases)('Team: $userRole/$docRole - $action = $expected', ({ userRole, ownerId, docRole, action, expected }) => {
    const auth = withOrgTeamAuthorization({ document: { ownerId, roleOfDocument: docRole }, userRole, currentUser: CURRENT_USER });
    expect(auth(action)).toBe(expected);
  });

  it('throws for unknown team role', () => {
    expect(() => {
      const auth = withOrgTeamAuthorization({ document: { ownerId: OTHER_USER, roleOfDocument: 'VIEWER' }, userRole: 'UNKNOWN', currentUser: CURRENT_USER });
      auth('View');
    }).toThrow();
  });
});
