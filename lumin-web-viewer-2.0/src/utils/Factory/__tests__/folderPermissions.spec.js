import { FolderPermissions } from '../FolderPermissions';
import { FolderPermission, FolderRole, FolderType } from 'constants/folderConstant';

import selectors from 'selectors';
import { OrganizationUtilities } from 'utils/Factory/Organization';
import { TeamUtilities } from 'utils/Factory/Team';

jest.mock('selectors', () => ({
  getCurrentUser: jest.fn(),
  getCurrentOrganization: jest.fn(),
}));

jest.mock('src/redux/store', () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}));

jest.mock('utils/Factory/Organization', () => ({
  OrganizationUtilities: jest.fn().mockImplementation(() => ({
    isManager: jest.fn(),
  })),
}));

jest.mock('utils/Factory/Team', () => ({
  TeamUtilities: jest.fn().mockImplementation(() => ({
    isManager: jest.fn(),
  })),
}));

const mockUser = (overrides = {}) => ({
  _id: 'user1',
  ...overrides,
});

const mockFolder = (overrides = {}) => ({
  ownerId: 'user1',
  ...overrides,
});

const mockOrg = (overrides = {}) => ({
  id: 'org1',
  ...overrides,
});

describe('FolderPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    selectors.getCurrentUser.mockReturnValue(mockUser());
    selectors.getCurrentOrganization.mockReturnValue({ data: mockOrg() });
  });

  const createInstance = (opts = {}) =>
    new FolderPermissions({
      type: opts.type,
      folder: opts.folder ?? mockFolder(),
      team: opts.team ?? {},
    });

  test('getUser returns current user', () => {
    expect(createInstance({ type: FolderType.PERSONAL }).getUser()).toEqual(mockUser());
  });

  test('getUser returns empty object when selector returns null', () => {
    selectors.getCurrentUser.mockReturnValue(null);

    const fp = new FolderPermissions({
      type: FolderType.PERSONAL,
      folder: mockFolder(),
      team: {},
    });

    expect(fp.getUser()).toEqual({});
  });

  test('getOrganization returns current organization', () => {
    const fp = createInstance({ type: FolderType.PERSONAL });
    expect(fp.getOrganization()).toEqual(mockOrg());
  });

  test('getOrganization returns empty object when selector returns null', () => {
    selectors.getCurrentOrganization.mockReturnValue({ data: null });

    const fp = new FolderPermissions({
      type: FolderType.PERSONAL,
      folder: mockFolder(),
      team: {},
    });

    expect(fp.getOrganization()).toEqual({});
  });

  test('PERSONAL → OWNER if user owns folder', () => {
    const fp = createInstance({ type: FolderType.PERSONAL, folder: mockFolder({ ownerId: 'user1' }) });
    expect(fp.getRole()).toBe(FolderRole.OWNER);
  });

  test('PERSONAL → SHARED if user is not owner', () => {
    const fp = createInstance({ type: FolderType.PERSONAL, folder: mockFolder({ ownerId: 'other' }) });
    expect(fp.getRole()).toBe(FolderRole.SHARED);
  });

  test('ORGANIZATION → MANAGER if org manager', () => {
    OrganizationUtilities.mockImplementation(() => ({ isManager: () => true }));
    const fp = createInstance({ type: FolderType.ORGANIZATION });
    expect(fp.getRole()).toBe(FolderRole.MANAGER);
  });

  test('ORGANIZATION → MEMBER if not manager', () => {
    OrganizationUtilities.mockImplementation(() => ({ isManager: () => false }));
    const fp = createInstance({ type: FolderType.ORGANIZATION });
    expect(fp.getRole()).toBe(FolderRole.MEMBER);
  });

  test('ORGANIZATION_TEAM → MANAGER if team manager', () => {
    TeamUtilities.mockImplementation(() => ({ isManager: () => true }));
    const fp = createInstance({ type: FolderType.ORGANIZATION_TEAM });
    expect(fp.getRole()).toBe(FolderRole.MANAGER);
  });

  test('ORGANIZATION_TEAM → MEMBER if not manager', () => {
    TeamUtilities.mockImplementation(() => ({ isManager: () => false }));
    const fp = createInstance({ type: FolderType.ORGANIZATION_TEAM });
    expect(fp.getRole()).toBe(FolderRole.MEMBER);
  });

  test('getRole throws if unknown type', () => {
    const fp = createInstance({ type: 'INVALID_TYPE' });
    expect(() => fp.getRole()).toThrow('Type is invalid.');
  });

  test('Manager has highest permissions', () => {
    OrganizationUtilities.mockImplementation(() => ({ isManager: () => true }));
    const fp = createInstance({ type: FolderType.ORGANIZATION });

    const perms = fp.getPermissions();
    expect(perms).toContain(FolderPermission.CREATE);
    expect(fp.hasPermission(FolderPermission.DELETE)).toBe(true);
  });

  test('Shared role has no permissions', () => {
    const fp = createInstance({
      type: FolderType.PERSONAL,
      folder: mockFolder({ ownerId: 'someone-else' }),
    });

    expect(fp.getRole()).toBe(FolderRole.SHARED);
    expect(fp.getPermissions()).toEqual([]);
    expect(fp.hasPermission(FolderPermission.CREATE)).toBe(false);
  });

  test('Member has only UPLOAD_DOCUMENT', () => {
    OrganizationUtilities.mockImplementation(() => ({ isManager: () => false }));
    const fp = createInstance({ type: FolderType.ORGANIZATION });

    expect(fp.getPermissions()).toEqual([FolderPermission.UPLOAD_DOCUMENT]);
    expect(fp.hasPermission(FolderPermission.UPLOAD_DOCUMENT)).toBe(true);
    expect(fp.hasPermission(FolderPermission.DELETE)).toBe(false);
  });

  test('isFolderOwner returns true when user owns folder', () => {
    const fp = createInstance({ type: FolderType.PERSONAL });
    expect(fp.isFolderOwner()).toBe(true);
  });

  test('isFolderOwner returns false when user is not owner', () => {
    const fp = createInstance({
      type: FolderType.PERSONAL,
      folder: mockFolder({ ownerId: 'other' }),
    });
    expect(fp.isFolderOwner()).toBe(false);
  });
});
