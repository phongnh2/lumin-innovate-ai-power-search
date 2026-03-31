import { SearchUserStatus } from 'constants/lumin-common';

import { IUserResult } from 'interfaces/user/user.interface';

export const mockUser1: IUserResult = {
  _id: 'user1-id',
  email: 'user1@example.com',
  name: 'User One',
  status: SearchUserStatus.USER_VALID,
  avatarRemoteId: 'avatar1',
  grantedPermission: true,
};

export const mockUser2: IUserResult = {
  _id: 'user2-id',
  email: 'user2@example.com',
  name: 'User Two',
  status: SearchUserStatus.USER_VALID,
  avatarRemoteId: 'avatar2',
  grantedPermission: true,
};

export const mockUser3: IUserResult = {
  _id: 'user3-id',
  email: 'user3@example.com',
  name: 'User Three',
  status: SearchUserStatus.USER_VALID,
  avatarRemoteId: 'avatar3',
  grantedPermission: true,
};

export const mockUserUnavailable: IUserResult = {
  _id: 'user4-id',
  email: 'user4@example.com',
  name: '',
  status: SearchUserStatus.USER_UNAVAILABLE,
  avatarRemoteId: '',
  grantedPermission: false,
};
const mockInviteToOrganizationInputs = [
  {
    email: 'alice@example.com',
    role: 'MEMBER',
    _id: 'usr_0001',
  },
  {
    email: 'fatima@example.com',
    role: 'OWNER',
    _id: 'usr_0006',
  },
  {
    email: 'charlie+test@example.org',
    role: 'ADMIN',
    _id: 'usr_0003',
  },
];

const mockUserResults = [
  {
    _id: 'usr_0001',
    name: 'Alice Example',
    email: 'alice@example.com',
    avatarRemoteId: 'avt_0001',
    status: 'active',
    grantedPermission: true,
  },
  {
    _id: 'usr_0002',
    name: 'Bob Example',
    email: 'bob@example.com',
    avatarRemoteId: 'avt_0002',
    status: 'pending',
    grantedPermission: false,
    disabled: true,
  },
  {
    _id: 'usr_0003',
    name: 'Charlie Example',
    email: 'charlie+test@example.org',
    avatarRemoteId: '',
    status: 'inactive',
    grantedPermission: true,
  },
  {
    _id: 'usr_0004',
    name: 'Dana Example',
    email: 'dana@example.net',
    avatarRemoteId: 'avt_0004',
    status: 'blocked',
    grantedPermission: false,
  },
  {
    _id: 'usr_0005',
    name: 'Evan Example',
    email: 'evan@example.com',
    avatarRemoteId: 'avt_0005',
    status: 'active',
    grantedPermission: false,
  },
  {
    _id: 'usr_0006',
    name: 'Fatima Example',
    email: 'fatima@example.org',
    avatarRemoteId: 'avt_0006',
    status: 'invited',
    grantedPermission: true,
    disabled: false,
  },
  {
    _id: 'usr_0007',
    name: 'Renée Example',
    email: 'renee@example.net',
    avatarRemoteId: 'avt_0007',
    status: 'suspended',
    grantedPermission: false,
  },
  {
    _id: 'usr_0008',
    name: 'Hana Example',
    email: 'hana@example.com',
    avatarRemoteId: 'avt_0008',
    status: 'active',
    grantedPermission: true,
  },
  {
    _id: 'usr_0009',
    name: 'Ivan Example',
    email: 'ivan@example.org',
    avatarRemoteId: 'avt_0009',
    status: 'pending',
    grantedPermission: true,
  },
  {
    _id: 'usr_0010',
    name: 'Jules Example',
    email: 'jules@example.net',
    avatarRemoteId: 'avt_0010',
    status: 'inactive',
    grantedPermission: false,
    disabled: true,
  },
  {
    _id: 'usr_0011',
    name: null,
    email: 'vincent@example.net',
    avatarRemoteId: 'avt_0011',
    status: 'inactive',
    grantedPermission: false,
    disabled: true,
  },
];

const mockUsersWithNullId = [
  {
    _id: null,
    name: 'Maya Example',
    email: 'maya@example.net',
    avatarRemoteId: '',
    status: 'inactive',
    grantedPermission: true,
    disabled: true,
  },
  {
    _id: null,
    name: 'Liam Example',
    email: 'liam@example.org',
    avatarRemoteId: 'avt_1013',
    status: 'pending',
    grantedPermission: false,
  },
  {
    _id: 'usr_1012',
    name: 'Kira Example',
    email: 'kira@example.com',
    avatarRemoteId: 'avt_1012',
    status: 'active',
    grantedPermission: true,
  },
  {
    _id: 'usr_1015',
    name: 'Noah Example',
    email: 'noah@example.com',
    avatarRemoteId: 'avt_1015',
    status: 'invited',
    grantedPermission: false,
  },
  {
    _id: 'usr_1016',
    name: 'Olivia Example',
    email: 'olivia@example.org',
    avatarRemoteId: 'avt_1016',
    status: 'suspended',
    grantedPermission: false,
    disabled: true,
  },
];
export { mockInviteToOrganizationInputs, mockUserResults, mockUsersWithNullId };
