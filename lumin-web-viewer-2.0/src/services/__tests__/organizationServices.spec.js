import organizationServices from '../organizationServices';
import selectors from 'selectors';
import { store } from 'src/redux/store';
import * as actions from 'actions';
import * as reactRedux from 'react-redux';
import * as orgTracking from 'services/awsTracking/organizationTracking';
import * as organizationGraph from 'services/graphServices/organization';
import { matchPath } from 'react-router';
import { NotiOrg } from 'constants/notificationConstant';

jest.mock('services/graphServices/organization');
jest.mock('actions', () => ({
  updateCurrentOrganization: jest.fn((payload) => ({
    type: 'UPDATE_CURRENT_ORG',
    payload,
  })),
  updateOrganizationInList: jest.fn((orgId, organization) => ({
    type: 'UPDATE_ORG_IN_LIST',
    payload: { orgId, organization },
  })),
  openModal: jest.fn((payload) => ({
    type: 'OPEN_MODAL',
    payload,
  })),
  updateCurrentRoleInOrganizationList: jest.fn((orgId, role) => ({
    type: 'UPDATE_ROLE_IN_LIST',
    payload: { orgId, role },
  })),
}));

jest.mock('selectors', () => ({
  getOrganizationList: jest.fn(),
  getCurrentUser: jest.fn(),
  getCurrentOrganization: jest.fn(),
  getCurrentDocument: jest.fn(),
  isOffline: jest.fn(),
}));

jest.mock('services/awsTracking/organizationTracking', () => ({
  trackAddUser: jest.fn(),
  trackRemoveUser: jest.fn(),
  trackCreate: jest.fn(),
  trackDelete: jest.fn(),
  trackSettingChanged: jest.fn(),
}));

jest.mock('constants/notificationConstant', () => ({
  NotiOrg: {
    UPDATE_USER_ROLE: 'UPDATE_USER_ROLE',
    LEAVE_ORG: 'LEAVE_ORG',
    REMOVE_MEMBER: 'REMOVE_MEMBER',
  },
  NotificationTabs: {
    GENERAL: 'GENERAL',
    ALL: 'ALL',
  },
}));

jest.mock('react-router', () => ({
  matchPath: jest.fn(),
}));

const mockDispatch = jest.fn();
store.dispatch = mockDispatch;

describe('organizationServices basic tests', () => {
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getTotalMembers should calculate totalMember and dispatch update', async () => {
    organizationGraph.getTotalMembers.mockResolvedValueOnce({
      member: 2,
      guest: 1,
      pending: 1,
      request: 0,
    });
  
    selectors.getCurrentOrganization.mockReturnValue({
      data: { _id: 'org1', name: 'Org 1' },
    });
  
    const result = await organizationServices.getTotalMembers({ orgId: 'org1' });
  
    expect(actions.updateCurrentOrganization).toHaveBeenCalledWith({
      _id: 'org1',
      name: 'Org 1',
      totalMember: 4,
    });
  
    expect(result).toEqual({
      member: 2,
      guest: 1,
      pending: 1,
      request: 0,
    });
  });
  
  describe('createOrganizationSubscription', () => {
    it('should return data when subscriptionRemoteId exists', async () => {
      const orgId = 'org1';
      const input = { plan: 'PRO' };

      const mockData = {
        subscriptionRemoteId: 'sub_123',
        status: 'ACTIVE',
      };

      organizationGraph.createOrganizationSubscription.mockResolvedValueOnce({
        data: mockData,
      });

      const result = await organizationServices.createOrganizationSubscription(orgId, input);

      expect(organizationGraph.createOrganizationSubscription).toHaveBeenCalledWith(orgId, input);
      expect(result).toEqual(mockData);
    });

    it('should throw error when subscriptionRemoteId is missing', async () => {
      const orgId = 'org1';
      const input = { plan: 'PRO' };

      organizationGraph.createOrganizationSubscription.mockResolvedValueOnce({
        data: {
          status: 'ACTIVE',
        },
      });

      await expect(organizationServices.createOrganizationSubscription(orgId, input)).rejects.toThrow(
        'No subscription'
      );
    });
  });

  it('getAllOrganizationWithTeams', () => {
    expect(organizationServices.getAllOrganizationWithTeams()).toBeUndefined();
  });

  describe('createOrganization', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should NOT trackAddUser when invitations is undefined (condition = false)', async () => {
      const file = { name: 'logo.png' };

      const organizationData = {
        type: 'TEAM',
        members: ['user1'],
      };

      const createdData = {
        organization: { _id: 'org1' },
      };

      organizationGraph.createOrganization.mockResolvedValueOnce(createdData);

      await organizationServices.createOrganization({ file, organizationData });

      expect(orgTracking.trackCreate).toHaveBeenCalled();
      expect(orgTracking.trackAddUser).not.toHaveBeenCalled();
    });

    it('should run full createOrganization flow', async () => {
      const file = { name: 'logo.png' };
      const organizationData = {
        type: 'TEAM',
        members: ['user1', 'user2'],
      };

      const createdData = {
        organization: { _id: 'org1', name: 'Org 1' },
        invitations: ['inv1', 'inv2'],
      };

      organizationGraph.createOrganization.mockResolvedValueOnce(createdData);

      const result = await organizationServices.createOrganization({
        file,
        organizationData,
      });
      expect(organizationGraph.createOrganization).toHaveBeenCalledWith({
        file,
        organizationData,
      });

      expect(orgTracking.trackCreate).toHaveBeenCalledWith({
        type: 'TEAM',
        organization: createdData.organization,
      });

      expect(orgTracking.trackAddUser).toHaveBeenCalledWith({
        members: organizationData.members,
        invitations: createdData.invitations,
      });

      expect(result).toBe(createdData);
    });
  });

  describe('reactiveOrganization', () => {
    let batchSpy;

    beforeEach(() => {
      batchSpy = jest.spyOn(reactRedux, 'batch').mockImplementation((fn) => fn());

      organizationGraph.reactiveOrganization.mockResolvedValue({
        organization: { _id: 'org1', name: 'Org 1' },
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should update current org AND org list when shouldUpdateCurrentOrg = true', async () => {
      await organizationServices.reactiveOrganization('org1');

      expect(organizationGraph.reactiveOrganization).toHaveBeenCalledWith('org1');
      expect(actions.updateCurrentOrganization).toHaveBeenCalledWith(expect.objectContaining({ _id: 'org1' }));
      expect(actions.updateOrganizationInList).toHaveBeenCalledWith('org1', expect.objectContaining({ _id: 'org1' }));
    });

    it('should ONLY update org list when shouldUpdateCurrentOrg = false', async () => {
      await organizationServices.reactiveOrganization('org1', false);
      expect(actions.updateCurrentOrganization).not.toHaveBeenCalled();
      expect(actions.updateOrganizationInList).toHaveBeenCalledWith('org1', expect.objectContaining({ _id: 'org1' }));
    });
  });

  it('getOrgByUrl', () => {
    expect(organizationServices.getOrgByUrl('https://www.google.com')).toBeUndefined();
  });

  it('removeAvatarOrganization', () => {
    expect(organizationServices.removeAvatarOrganization({ orgId: 'org1' })).not.toBeNull();
  });

  it('getOrgById', () => {
    expect(organizationServices.getOrgById('org1')).toBeUndefined();
  });

  it('getReachLimitedOrgMembers', () => {
    expect(organizationServices.getReachLimitedOrgMembers({ orgId: 'org1' })).toBe(false);
  });

  it('checkOrganizationDocStack', () => {
    expect(organizationServices.checkOrganizationDocStack({ orgId: 'org1' })).toBeUndefined();
  });

  it('should go through REMOVE_MEMBER when membersList exists (isNotExistMemberList = false)', () => {
    const membersList = [];

    const newMemberState = {
      userId: 'user1',
      actionType: NotiOrg.REMOVE_MEMBER,
    };

    organizationServices.handleUpdateInnerMemberListWhenReceivedNewNotification(membersList, newMemberState);
    expect(membersList).toEqual([]);
  });

  it('should return early if membersList is empty', () => {
    const membersList = [];

    const newMemberState = {
      userId: 'user1',
      actionType: NotiOrg.UPDATE_USER_ROLE,
      data: { role: 'MEMBER' },
    };

    expect(() =>
      organizationServices.handleUpdateInnerMemberListWhenReceivedNewNotification(membersList, newMemberState)
    ).not.toThrow();
  });

  it('should NOT update anything when member is not found (UPDATE_USER_ROLE)', () => {
    const membersList = [{ _id: 'user1', role: 'ADMIN' }];

    const newMemberState = {
      userId: 'user-not-exist',
      actionType: NotiOrg.UPDATE_USER_ROLE,
      data: { role: 'MEMBER' },
    };

    organizationServices.handleUpdateInnerMemberListWhenReceivedNewNotification(membersList, newMemberState);
    expect(membersList).toEqual([{ _id: 'user1', role: 'ADMIN' }]);
  });

  it('should return early when membersList is undefined (UPDATE_USER_ROLE)', () => {
    const membersList = undefined;

    const newMemberState = {
      userId: 'user1',
      actionType: NotiOrg.UPDATE_USER_ROLE,
      data: { role: 'MEMBER' },
    };

    expect(() =>
      organizationServices.handleUpdateInnerMemberListWhenReceivedNewNotification(membersList, newMemberState)
    ).not.toThrow();
  });

  it('should update member role when receiving UPDATE_USER_ROLE', () => {
    const membersList = [{ _id: 'user1', role: 'ADMIN' }];

    const newMemberState = {
      userId: 'user1',
      actionType: NotiOrg.UPDATE_USER_ROLE,
      data: { role: 'MEMBER' },
    };

    organizationServices.handleUpdateInnerMemberListWhenReceivedNewNotification(membersList, newMemberState);

    expect(membersList).toEqual([{ _id: 'user1', role: 'MEMBER' }]);
  });

  it('should remove member when receiving LEAVE_ORG', () => {
    const membersList = [
      { _id: 'user1', role: 'ADMIN' },
      { _id: 'user2', role: 'MEMBER' },
    ];

    const newMemberState = {
      userId: 'user1',
      actionType: NotiOrg.LEAVE_ORG,
    };

    organizationServices.handleUpdateInnerMemberListWhenReceivedNewNotification(membersList, newMemberState);

    expect(membersList).toEqual([{ _id: 'user2', role: 'MEMBER' }]);
  });

  it('handleUpdateInnerMemberListWhenReceivedNewNotification', () => {
    const membersList = [{ _id: 'user1', role: 'ADMIN' }];
    const newMemberState = { userId: 'user1', actionType: 'UPDATE_ROLE', data: { role: 'MEMBER' } };
    organizationServices.handleUpdateInnerMemberListWhenReceivedNewNotification(membersList, newMemberState);
    expect(membersList).toEqual([{ _id: 'user1', role: 'ADMIN' }]);
  });

  it('returns false if no organization has manager role', () => {
    selectors.getOrganizationList.mockReturnValue({
      data: [{ role: 'MEMBER' }, { role: 'GUEST' }],
    });

    const result = organizationServices.hasManagerRole();
    expect(result).toBe(false);
  });

  it('returns false if getOrganizationList returns undefined', () => {
    selectors.getOrganizationList.mockReturnValue({ data: undefined });
    const result = organizationServices.hasManagerRole();
    expect(result).toBeUndefined();
  });

  it('should navigate with shouldUpdateInnerMembersList when standing in organization route', () => {
    matchPath.mockReturnValue(false);

    const targetDataChanged = {
      targetId: 'user1',
      targetData: { role: 'ADMIN' },
    };
    const actionType = 'UPDATE_ROLE';
    const location = { pathname: '/organization/test-org' };

    organizationServices.handleShouldUpdateInnerMembersListInOrganization(
      targetDataChanged,
      actionType,
      navigate,
      location
    );

    expect(matchPath).toHaveBeenCalled();
  });

  it('should navigate with shouldUpdateInnerMembersList when standing in organization route', () => {
    matchPath.mockReturnValue(true);

    const targetDataChanged = {
      id: 'user1',
    };
    const actionType = 'UPDATE_ROLE';
    const location = { pathname: '/organization/test-org' };

    organizationServices.handleShouldUpdateInnerMembersListInOrganization(
      targetDataChanged,
      actionType,
      navigate,
      location
    );

    expect(matchPath).toHaveBeenCalled();
  });

  it('should navigate with shouldUpdateInnerMembersList when standing in organization route', () => {
    matchPath.mockReturnValue(true);

    const targetDataChanged = {
      targetId: 'user1',
      targetData: { role: 'ADMIN' },
    };
    const actionType = 'UPDATE_ROLE';
    const location = { pathname: '/organization/test-org' };

    organizationServices.handleShouldUpdateInnerMembersListInOrganization(
      targetDataChanged,
      actionType,
      navigate,
      location
    );

    expect(matchPath).toHaveBeenCalled();
  });

  describe('inviteMemberToOrg', () => {
    const orgId = 'org1';
    const members = ['user1'];
    const invitedFrom = 'dashboard';
    const extraTrial = 3;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call inviteMemberToOrg and track events when invitations exist', async () => {
      const res = { invitations: ['inv1'] };
      organizationGraph.inviteMemberToOrg.mockResolvedValue(res);

      const result = await organizationServices.inviteMemberToOrg({ orgId, members, invitedFrom, extraTrial });

      expect(organizationGraph.inviteMemberToOrg).toHaveBeenCalledWith({ orgId, members, extraTrial });
      expect(result).toBe(res);
      expect(orgTracking.trackAddUser).toHaveBeenCalledWith({ members, invitations: res.invitations, invitedFrom });
    });

    it('should call inviteMemberToOrg and return res when invitations do not exist', async () => {
      const res = {};
      organizationGraph.inviteMemberToOrg.mockResolvedValue(res);

      const result = await organizationServices.inviteMemberToOrg({ orgId, members });

      expect(organizationGraph.inviteMemberToOrg).toHaveBeenCalledWith({ orgId, members, extraTrial: undefined });
      expect(result).toBe(res);
      expect(orgTracking.trackAddUser).not.toHaveBeenCalled();
    });
  });

  it('checkPermission', () => {
    expect(organizationServices.checkPermission(['A', 'B'])).toBe(false);
  });

  it('isManager', () => {
    expect(organizationServices.isManager()).toBe(false);
  });

  it('isOrgAdmin', () => {
    expect(organizationServices.isOrgAdmin()).toBe(false);
  });

  it('isOrgTeamAdmin', () => {
    expect(organizationServices.isOrgTeamAdmin()).toBe(false);
  });

  it('isOrgMember', () => {
    expect(organizationServices.isOrgMember()).toBe(false);
  });

  it('leaveOrganization', () => {
    expect(organizationServices.leaveOrganization({ orgId: 'org1' })).toBeUndefined();
  });

  it('confirmOrganizationAdminTransfer', () => {
    expect(organizationServices.confirmOrganizationAdminTransfer({ token: 'token' })).toBeUndefined();
  });

  it('getMembersInOrgByRole', () => {
    expect(organizationServices.getMembersInOrgByRole({ orgId: 'org1' })).toBeUndefined();
  });

  it('setOrganizationMembersRole', () => {
    expect(
      organizationServices.setOrganizationMembersRole({ orgId: 'org1', members: ['user1'], role: 'ADMIN' })
    ).toBeUndefined();
  });

  it('checkOrganizationTransfering', () => {
    expect(organizationServices.checkOrganizationTransfering({ orgId: 'org1' })).toBeUndefined();
  });

  it('renderProcessingTransferModal', () => {
    expect(organizationServices.renderProcessingTransferModal({ t: (key) => key })).toBeUndefined();
    expect(
      organizationServices.renderProcessingTransferModal({ t: (key) => key, isEnableReskin: true })
    ).toBeUndefined();
  });

  it('updateCurrentRoleInOrg', () => {
    selectors.getCurrentOrganization.mockReturnValue({ data: { _id: 'org1' } });
    organizationServices.updateCurrentRoleInOrg('org1', 'ADMIN');
    expect(selectors.getCurrentOrganization).toHaveBeenCalled();
    selectors.getCurrentOrganization.mockReturnValue({ data: { _id: 'org1' } });
    organizationServices.updateCurrentRoleInOrg('org2', 'ADMIN');
    expect(selectors.getCurrentOrganization).toHaveBeenCalled();
  });

  it('isEnterprise', () => {
    expect(organizationServices.isEnterprise()).toBe(false);
  });

  it('renderProcessingTransferModal should dispatch openModal and allow onConfirm to be called', () => {
    const t = (key) => key;

    organizationServices.renderProcessingTransferModal({ t });

    expect(actions.openModal).toHaveBeenCalledTimes(1);
    const modalPayload = actions.openModal.mock.calls[0][0];

    expect(modalPayload).toMatchObject({
      title: 'processingTransferModal.title',
      message: 'processingTransferModal.message',
      confirmButtonTitle: 'common.gotIt',
      useReskinModal: true,
    });
    expect(typeof modalPayload.onConfirm).toBe('function');
    modalPayload.onConfirm();
  });
});
