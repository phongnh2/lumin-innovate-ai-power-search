// Mock dependencies
const mockGetOrganizationList = jest.fn();
const mockGetCurrentUser = jest.fn();
const mockGetTeams = jest.fn();
const mockGetOrgList = jest.fn();
const mockGetOrgByUrl = jest.fn();
const mockGetMainOrganizationCanJoin = jest.fn();
const mockGetPremiumToolInfoAvailableForUser = jest.fn();
const mockSetOrganizations = jest.fn();
const mockSetPremiumToolsInfo = jest.fn();
const mockExtractGqlError = jest.fn();
const mockRemoveByOrgUrl = jest.fn();

jest.mock('selectors', () => ({
  __esModule: true,
  default: {
    getOrganizationList: (state: any) => mockGetOrganizationList(state),
    getCurrentUser: (state: any) => mockGetCurrentUser(state),
    getTeams: (state: any) => mockGetTeams(state),
  },
}));

jest.mock('services/graphServices', () => ({
  documentGraphServices: {
    getPremiumToolInfoAvailableForUser: () => mockGetPremiumToolInfoAvailableForUser(),
  },
}));

jest.mock('services/graphServices/organization', () => ({
  getOrgList: () => mockGetOrgList(),
  getOrgByUrl: (params: any) => mockGetOrgByUrl(params),
  getMainOrganizationCanJoin: () => mockGetMainOrganizationCanJoin(),
}));

jest.mock('services/indexedDBService', () => ({
  __esModule: true,
  default: {
    setOrganizations: (orgs: any) => mockSetOrganizations(orgs),
    setPremiumToolsInfo: (info: any) => mockSetPremiumToolsInfo(info),
  },
}));

jest.mock('helpers/requestIdleCallback', () => ({
  requestIdleCallback: (fn: any) => fn(),
}));

jest.mock('utils/error', () => ({
  __esModule: true,
  default: {
    extractGqlError: (error: any) => mockExtractGqlError(error),
  },
}));

jest.mock('utils/lastAccessOrgs', () => ({
  __esModule: true,
  default: {
    removeByOrgUrl: (url: string) => mockRemoveByOrgUrl(url),
  },
}));

jest.mock('react-redux', () => ({
  batch: (fn: any) => fn(),
}));

import * as organizationActions from '../organizationActions';

describe('organizationActions', () => {
  let dispatch: jest.Mock;
  let getState: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = jest.fn((action) => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }
      return action;
    });
    getState = jest.fn();
  });

  describe('updateTeamById', () => {
    it('should dispatch UPDATE_TEAM_BY_ID', () => {
      organizationActions.updateTeamById('team-123', { name: 'Updated Team' })(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_TEAM_BY_ID',
        payload: { teamId: 'team-123', data: { name: 'Updated Team' } },
      });
    });
  });

  describe('setOrganizations', () => {
    it('should dispatch SET_ORGANIZATIONS', () => {
      const organizations = [{ _id: 'org-1' }];
      organizationActions.setOrganizations(organizations)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_ORGANIZATIONS',
        payload: { organizations },
      });
    });
  });

  describe('setFetchOrganizationsSuccess', () => {
    it('should dispatch FETCH_ORGANIZATIONS_SUCCESS', () => {
      const organizations = [{ _id: 'org-1' }];
      organizationActions.setFetchOrganizationsSuccess(organizations)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'FETCH_ORGANIZATIONS_SUCCESS',
        payload: { organizations },
      });
    });
  });

  describe('fetchOrganizations', () => {
    it('should dispatch FETCH_ORGANIZATIONS and FETCH_ORGANIZATIONS_SUCCESS on success', async () => {
      const organizations = [{ _id: 'org-1' }];
      mockGetOrgList.mockResolvedValue(organizations);
      mockGetPremiumToolInfoAvailableForUser.mockResolvedValue({ premium: true });

      await organizationActions.fetchOrganizations()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({ type: 'FETCH_ORGANIZATIONS' });
      expect(dispatch).toHaveBeenCalledWith({
        type: 'FETCH_ORGANIZATIONS_SUCCESS',
        payload: { organizations },
      });
      expect(mockSetOrganizations).toHaveBeenCalledWith(organizations);
    });

    it('should not dispatch FETCH_ORGANIZATIONS when disabledLoading is true', async () => {
      mockGetOrgList.mockResolvedValue([]);

      await organizationActions.fetchOrganizations({ disabledLoading: true })(dispatch);

      expect(dispatch).not.toHaveBeenCalledWith({ type: 'FETCH_ORGANIZATIONS' });
    });

    it('should dispatch FETCH_ORGANIZATIONS_FAILED on error', async () => {
      const error = new Error('Network error');
      mockGetOrgList.mockRejectedValue(error);
      mockExtractGqlError.mockReturnValue('Extracted error');

      await organizationActions.fetchOrganizations()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'FETCH_ORGANIZATIONS_FAILED',
        payload: { error: 'Extracted error' },
      });
    });

    it('should use empty array when getOrgList returns null', async () => {
      mockGetOrgList.mockResolvedValue(null);

      await organizationActions.fetchOrganizations()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'FETCH_ORGANIZATIONS_SUCCESS',
        payload: { organizations: [] },
      });
    });
  });

  describe('removeOrganizationInListById', () => {
    it('should remove organization and update state', () => {
      const orgList = [
        { organization: { _id: 'org-1', url: 'org-1-url' } },
        { organization: { _id: 'org-2', url: 'org-2-url' } },
      ];
      mockGetOrganizationList.mockReturnValue({ data: orgList });
      mockGetCurrentUser.mockReturnValue({
        setting: { defaultWorkspace: 'org-1' },
        lastAccessedOrgUrl: 'org-1-url',
      });

      organizationActions.removeOrganizationInListById('org-1')(dispatch, getState);

      expect(mockRemoveByOrgUrl).toHaveBeenCalledWith('org-1-url');
      expect(dispatch).toHaveBeenCalled();
    });

    it('should return early when organization list is empty', () => {
      mockGetOrganizationList.mockReturnValue({ data: [] });

      organizationActions.removeOrganizationInListById('org-1')(dispatch, getState);

      expect(mockRemoveByOrgUrl).not.toHaveBeenCalled();
    });

    it('should return early when organization is not found', () => {
      mockGetOrganizationList.mockReturnValue({
        data: [{ organization: { _id: 'org-2', url: 'org-2-url' } }],
      });

      organizationActions.removeOrganizationInListById('org-1')(dispatch, getState);

      expect(mockRemoveByOrgUrl).not.toHaveBeenCalled();
    });
  });

  describe('removeOrganizationInListByUrl', () => {
    it('should remove organization by url', () => {
      const orgList = [
        { organization: { _id: 'org-1', url: 'org-1-url' } },
        { organization: { _id: 'org-2', url: 'org-2-url' } },
      ];
      mockGetOrganizationList.mockReturnValue({ data: orgList });

      organizationActions.removeOrganizationInListByUrl('org-1-url')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_ORGANIZATIONS',
        payload: {
          data: [{ organization: { _id: 'org-2', url: 'org-2-url' } }],
        },
      });
    });

    it('should return early when organization list is empty', () => {
      mockGetOrganizationList.mockReturnValue({ data: [] });

      organizationActions.removeOrganizationInListByUrl('org-1-url')(dispatch, getState);

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should return early when organization url is not found', () => {
      mockGetOrganizationList.mockReturnValue({
        data: [{ organization: { _id: 'org-2', url: 'org-2-url' } }],
      });

      organizationActions.removeOrganizationInListByUrl('org-1-url')(dispatch, getState);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('updateOrganizationInList', () => {
    it('should update organization in list', () => {
      const orgList = [
        { organization: { _id: 'org-1', name: 'Old Name' }, role: 'admin' },
      ];
      mockGetOrganizationList.mockReturnValue({ data: orgList });

      organizationActions.updateOrganizationInList('org-1', { name: 'New Name' })(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: 'UPDATE_ORGANIZATIONS',
      }));
    });

    it('should update role when userRole is provided', () => {
      const orgList = [
        { organization: { _id: 'org-1' }, role: 'member' },
      ];
      mockGetOrganizationList.mockReturnValue({ data: orgList });

      organizationActions.updateOrganizationInList('org-1', { userRole: 'admin' })(dispatch, getState);

      expect(dispatch).toHaveBeenCalled();
    });

    it('should return early when organization list is empty', () => {
      mockGetOrganizationList.mockReturnValue({ data: [] });

      organizationActions.updateOrganizationInList('org-1', { name: 'New' })(dispatch, getState);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('updateCurrentRoleInOrganizationList', () => {
    it('should update role for organization', () => {
      const orgList = [
        { organization: { _id: 'org-1' }, role: 'member' },
      ];
      mockGetOrganizationList.mockReturnValue({ data: orgList });

      organizationActions.updateCurrentRoleInOrganizationList('org-1', 'admin')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_ORGANIZATIONS',
        payload: {
          organizationId: 'org-1',
          data: [{ organization: { _id: 'org-1' }, role: 'admin' }],
        },
      });
    });

    it('should return early when organization list is empty', () => {
      mockGetOrganizationList.mockReturnValue({ data: [] });

      organizationActions.updateCurrentRoleInOrganizationList('org-1', 'admin')(dispatch, getState);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('resetOrganization', () => {
    it('should dispatch RESET_ORGANIZATION', () => {
      organizationActions.resetOrganization()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({ type: 'RESET_ORGANIZATION' });
    });
  });

  describe('addNewOrganization', () => {
    it('should add new organization to list', () => {
      mockGetOrganizationList.mockReturnValue({ data: [] });

      const newOrg = { _id: 'org-new', name: 'New Org', userRole: 'ADMIN' };
      organizationActions.addNewOrganization(newOrg)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_ORGANIZATIONS',
        payload: {
          data: [{ organization: newOrg, role: 'admin' }],
        },
      });
    });
  });

  describe('fetchCurrentOrganization', () => {
    it('should fetch and set current organization on success', async () => {
      const orgData = { _id: 'org-1', name: 'Test Org' };
      mockGetOrgByUrl.mockResolvedValue({
        orgData,
        documentsAvailable: 100,
        actionCountDocStack: { count: 5 },
        aiChatbotDailyLimit: 10,
      });
      mockGetOrganizationList.mockReturnValue({ data: [] });

      await organizationActions.fetchCurrentOrganization('test-org')(dispatch);

      expect(dispatch).toHaveBeenCalledWith({ type: 'FETCH_ORGANIZATION' });
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: 'UPDATE_CURRENT_USER',
      }));
      expect(dispatch).toHaveBeenCalledWith({
        type: 'FETCH_ORGANIZATION_SUCCESS',
        payload: {
          organization: { ...orgData, documentsAvailable: 100, aiChatbotDailyLimit: 10 },
        },
      });
    });

    it('should not dispatch FETCH_ORGANIZATION when disabledLoading is true', async () => {
      mockGetOrgByUrl.mockResolvedValue({
        orgData: { _id: 'org-1' },
        documentsAvailable: 100,
        actionCountDocStack: {},
        aiChatbotDailyLimit: 10,
      });
      mockGetOrganizationList.mockReturnValue({ data: [] });

      await organizationActions.fetchCurrentOrganization('test-org', { disabledLoading: true })(dispatch);

      expect(dispatch).not.toHaveBeenCalledWith({ type: 'FETCH_ORGANIZATION' });
    });

    it('should dispatch FETCH_ORGANIZATION_FAILED on error', async () => {
      const error = new Error('Network error');
      mockGetOrgByUrl.mockRejectedValue(error);
      mockExtractGqlError.mockReturnValue('Extracted error');

      await organizationActions.fetchCurrentOrganization('test-org')(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'FETCH_ORGANIZATION_FAILED',
        payload: { error: 'Extracted error', organizationUrl: 'test-org' },
      });
    });
  });

  describe('updateCurrentOrganization', () => {
    it('should dispatch UPDATE_ORGANIZATION', () => {
      organizationActions.updateCurrentOrganization({ name: 'Updated' })(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_ORGANIZATION',
        payload: { data: { name: 'Updated' } },
      });
    });
  });

  describe('setCurrentOrganization', () => {
    it('should dispatch FETCH_ORGANIZATION_SUCCESS', () => {
      const organization = { _id: 'org-1' };
      organizationActions.setCurrentOrganization(organization)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'FETCH_ORGANIZATION_SUCCESS',
        payload: { organization },
      });
    });
  });

  describe('fetchMainOrganization', () => {
    it('should fetch and dispatch main organization', async () => {
      const organization = { _id: 'main-org' };
      mockGetMainOrganizationCanJoin.mockResolvedValue(organization);

      await organizationActions.fetchMainOrganization()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'FETCH_MAIN_ORGANIZATION',
        payload: { organization },
      });
    });
  });

  describe('updateStatusRequestMainOrganization', () => {
    it('should dispatch UPDATE_STATUS_REQUEST_MAIN_ORGANIZATION', () => {
      organizationActions.updateStatusRequestMainOrganization('pending')(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_STATUS_REQUEST_MAIN_ORGANIZATION',
        payload: { joinStatus: 'pending' },
      });
    });
  });

  describe('removeMainOrganizationCanRequest', () => {
    it('should dispatch REMOVE_REQUEST_MAIN_ORGANIZATION', () => {
      organizationActions.removeMainOrganizationCanRequest()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({ type: 'REMOVE_REQUEST_MAIN_ORGANIZATION' });
    });
  });

  describe('removeTeamById', () => {
    it('should remove team and dispatch UPDATE_TEAMS', () => {
      const teams = [{ _id: 'team-1' }, { _id: 'team-2' }];
      mockGetTeams.mockReturnValue(teams);

      organizationActions.removeTeamById('team-1')(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_TEAMS',
        payload: { teams: [{ _id: 'team-2' }] },
      });
    });
  });

  describe('updateTeam', () => {
    it('should update team and dispatch UPDATE_TEAMS', () => {
      const teams = [{ _id: 'team-1', name: 'Old Name' }];
      mockGetTeams.mockReturnValue(teams);

      organizationActions.updateTeam('team-1', { name: 'New Name' })(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: 'UPDATE_TEAMS',
      }));
    });

    it('should return early when team is not found', () => {
      mockGetTeams.mockReturnValue([{ _id: 'team-2' }]);

      organizationActions.updateTeam('team-1', { name: 'New' })(dispatch, getState);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('updateTeamList', () => {
    it('should dispatch UPDATE_TEAMS', () => {
      const teams = [{ _id: 'team-1' }];
      organizationActions.updateTeamList(teams)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_TEAMS',
        payload: { teams },
      });
    });
  });

  describe('setSuggestedOrganizations', () => {
    it('should dispatch SET_SUGGESTED_ORGANIZATIONS', () => {
      const organizations = [{ _id: 'org-1' }];
      organizationActions.setSuggestedOrganizations(organizations)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_SUGGESTED_ORGANIZATIONS',
        payload: { organizations },
      });
    });
  });
});

