import '@testing-library/jest-dom';
import { CURRENT_USER, OTHER_USER, AuthTestCase } from './testUtils';

jest.mock('constants/lumin-common', () => ({
  DOCUMENT_ROLES: { OWNER: 'OWNER', SHARER: 'SHARER', EDITOR: 'EDITOR', VIEWER: 'VIEWER', SPECTATOR: 'SPECTATOR' },
}));

jest.mock('constants/organizationConstants', () => ({
  ORGANIZATION_ROLES: { ORGANIZATION_ADMIN: 'ORGANIZATION_ADMIN', BILLING_MODERATOR: 'BILLING_MODERATOR', MEMBER: 'MEMBER' },
  OrgDocumentRole: {
    Admin: ['View', 'Rename', 'Move', 'Remove', 'Share', 'MakeACopy', 'CopyLink', 'MarkFavorite', 'UploadToLumin', 'CreateAsTemplate', 'Merge'],
    Billing: ['View', 'CopyLink', 'MarkFavorite'],
    Owner: ['View', 'Rename', 'Move', 'Remove', 'Share', 'MakeACopy', 'CopyLink', 'MarkFavorite', 'UploadToLumin'],
  },
  OrgDocumentPermission: {
    CanView: ['View', 'CopyLink', 'MarkFavorite'],
    CanEdit: ['View', 'MakeACopy', 'CopyLink', 'MarkFavorite'],
    CanShare: ['View', 'Rename', 'Share', 'MakeACopy', 'CopyLink', 'MarkFavorite'],
  },
}));

import withOrganizationAuthorization from '../withOrganizationAuthorization';

describe('withOrganizationAuthorization', () => {
  const orgTestCases: AuthTestCase[] = [
    { userRole: 'ORGANIZATION_ADMIN', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'View', expected: true },
    { userRole: 'ORGANIZATION_ADMIN', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'Remove', expected: true },
    { userRole: 'ORGANIZATION_ADMIN', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'Rename', expected: true },
    { userRole: 'ORGANIZATION_ADMIN', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'Share', expected: true },
    { userRole: 'ORGANIZATION_ADMIN', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'Move', expected: true },
    { userRole: 'BILLING_MODERATOR', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'View', expected: true },
    { userRole: 'BILLING_MODERATOR', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'CopyLink', expected: true },
    { userRole: 'BILLING_MODERATOR', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'Remove', expected: false },
    { userRole: 'BILLING_MODERATOR', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'Rename', expected: false },
    { userRole: 'MEMBER', ownerId: CURRENT_USER._id, docRole: 'OWNER', action: 'View', expected: true },
    { userRole: 'MEMBER', ownerId: CURRENT_USER._id, docRole: 'OWNER', action: 'Remove', expected: true },
    { userRole: 'MEMBER', ownerId: CURRENT_USER._id, docRole: 'OWNER', action: 'Rename', expected: true },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'View', expected: true },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'CopyLink', expected: true },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'VIEWER', action: 'Remove', expected: false },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'SPECTATOR', action: 'View', expected: true },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'EDITOR', action: 'View', expected: true },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'EDITOR', action: 'MakeACopy', expected: true },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'EDITOR', action: 'Rename', expected: false },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'SHARER', action: 'View', expected: true },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'SHARER', action: 'Share', expected: true },
    { userRole: 'MEMBER', ownerId: OTHER_USER, docRole: 'SHARER', action: 'Rename', expected: true },
  ];

  test.each(orgTestCases)('Org: $userRole/$docRole - $action = $expected', ({ userRole, ownerId, docRole, action, expected }) => {
    const auth = withOrganizationAuthorization({ document: { ownerId, roleOfDocument: docRole }, userRole, currentUser: CURRENT_USER });
    expect(auth(action)).toBe(expected);
  });

  it('returns undefined for unknown user role', () => {
    const auth = withOrganizationAuthorization({ document: { ownerId: OTHER_USER, roleOfDocument: 'VIEWER' }, userRole: 'UNKNOWN', currentUser: CURRENT_USER });
    expect(auth('View')).toBeUndefined();
  });

  it('returns undefined for unknown document role', () => {
    const auth = withOrganizationAuthorization({ document: { ownerId: OTHER_USER, roleOfDocument: 'INVALID' }, userRole: 'MEMBER', currentUser: CURRENT_USER });
    expect(auth('View')).toBeUndefined();
  });
});
