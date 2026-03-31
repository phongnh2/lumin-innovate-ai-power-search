import { authService } from '../../services/authServices';
import * as authGraph from 'services/graphServices/authentication';
import * as orgGraph from 'services/graphServices/organization';
import * as newAuthUtils from 'utils/newAuthenTesting';
import * as userServices from 'services/userServices';
import { store } from '../../redux/store';
import { kratosService } from 'services/oryServices';
import { client, subscriptionClient } from '../../apollo';
import googleServices from 'services/googleServices';
import googleDriveEvent from 'utils/Factory/EventCollection/GoogleDriveEventCollection';
import * as ga from 'utils/ga';
import { formFieldAutocompleteBase } from 'features/FormFieldAutosuggestion';
import hubspotServices from 'services/hubspotServices';
import brazeAdapter from 'utils/Factory/BrazeAdapter';
import { redirectFlowUtils } from 'utils/redirectFlow';
import { PaymentUrlSerializer } from 'utils/payment';
import { isUserNeedToJoinOrg } from 'utils/newAuthenTesting';
import indexedDBService from 'services/indexedDBService';
import { NEW_AUTH_FLOW_ROUTE } from 'constants/Routers';
import actions from 'actions';
import { cachingFileHandler } from 'HOC/OfflineStorageHOC';

jest.mock('utils/newAuthenTesting', () => ({
  isUserInNewAuthenTestingScope: jest.fn(),
  isUserNeedToJoinOrg: jest.fn(),
}));
jest.mock('services/graphServices/authentication');
jest.mock('services/graphServices/organization');
jest.mock('services/graphServices');
jest.mock('services/userServices', () => ({
  getSuggestedOrgListOfUser: jest.fn(),
  saveHubspotProperties: jest.fn(),
}));
jest.mock('services/socketServices');
jest.mock('services/oryServices');
jest.mock('../../apollo');
jest.mock('utils/Factory/BrazeAdapter');
jest.mock('services/hubspotServices');
jest.mock('features/FormFieldAutosuggestion');
jest.mock('services/googleServices');
jest.mock('utils/Factory/EventCollection/GoogleDriveEventCollection');
jest.mock('utils/ga');
jest.mock('utils/redirectFlow');
jest.mock('utils/payment');
jest.mock('actions', () => ({
  fetchOrganizations: jest.fn(() => ({ type: 'FETCH_ORGANIZATIONS' })),
  fetchMainOrganization: jest.fn(() => ({ type: 'FETCH_MAIN_ORG' })),
  setOrganizations: jest.fn((payload) => ({ type: 'SET_ORGS', payload })),
  setSuggestedOrganizations: jest.fn((payload) => ({
    type: 'SET_SUGGESTED_ORGS',
    payload,
  })),
  setCurrentUser: jest.fn((payload) => ({
    type: 'SET_CURRENT_USER',
    payload,
  })),
  setIsCompletedGettingUserData: jest.fn((payload) => ({
    type: 'SET_COMPLETED',
    payload,
  })),
  signOutUser: jest.fn(() => ({ type: 'SIGN_OUT' })),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  batch: jest.fn((fn) => fn()),
}));

jest.mock('HOC/OfflineStorageHOC', () => ({
  cachingFileHandler: {
    initialize: jest.fn(),
  },
}));

const mockDispatch = jest.fn();
store.dispatch = mockDispatch;

googleDriveEvent.totalPopupInSession = jest.fn();
ga.trackingUser = jest.fn();
formFieldAutocompleteBase.clear = jest.fn();
hubspotServices.clear = jest.fn();
brazeAdapter.clear = jest.fn();
redirectFlowUtils.deleteCookies = jest.fn();
googleServices.clearGoogleAccessTokenCookie = jest.fn();

authService.socket.closeConnection = jest.fn();
authService.socket.authorizeSocket = jest.fn();
authService.socket.onSocketConnected = jest.fn();
authService.socket.releasePendingEvents = jest.fn();
authService.socketService.addUserToRoom = jest.fn();
authService.socketService.startConnectionWithQuery = jest.fn();

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authService.dispatch = mockDispatch;
    userServices.saveHubspotProperties = jest.fn();
  });

  describe('getNewAuthenRedirectUrl', () => {
    const mockGetState = (suggestedOrgs = []) => ({
      organization: {
        suggestedOrganizations: {
          data: suggestedOrgs,
        },
      },
    });

    const mockGetState1 = (suggestedOrgs = []) => ({
      organization: {
        suggestedOrganizations: {
          data: undefined,
        },
      },
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return empty url if user is NOT in new auth testing scope', () => {
      newAuthUtils.isUserInNewAuthenTestingScope.mockReturnValue(false);

      authService.getState = jest.fn().mockReturnValue(mockGetState1([{ id: 'org1' }]));

      const user = { isPopularDomain: false };

      const result = authService.getNewAuthenRedirectUrl(user);

      expect(result).toEqual({ url: '' });
      expect(userServices.saveHubspotProperties).not.toHaveBeenCalled();
    });

    it('should return empty url if user is NOT in new auth testing scope', () => {
      newAuthUtils.isUserInNewAuthenTestingScope.mockReturnValue(false);

      authService.getState = jest.fn().mockReturnValue(mockGetState([{ id: 'org1' }]));

      const user = { isPopularDomain: false };

      const result = authService.getNewAuthenRedirectUrl(user);

      expect(result).toEqual({ url: '' });
      expect(userServices.saveHubspotProperties).not.toHaveBeenCalled();
    });

    it('should redirect to SET_UP_ORGANIZATION if user is popular domain', () => {
      newAuthUtils.isUserInNewAuthenTestingScope.mockReturnValue(true);

      authService.getState = jest.fn().mockReturnValue(mockGetState([{ id: 'org1' }]));

      const user = { isPopularDomain: true };

      const result = authService.getNewAuthenRedirectUrl(user);

      expect(result.url).toBe(NEW_AUTH_FLOW_ROUTE.SET_UP_ORGANIZATION);
    });

    it('should redirect to JOIN_YOUR_ORGANIZATION if has suggested organizations', () => {
      newAuthUtils.isUserInNewAuthenTestingScope.mockReturnValue(true);

      authService.getState = jest.fn().mockReturnValue(mockGetState([{ id: 'org1' }]));

      const user = { isPopularDomain: false };

      const result = authService.getNewAuthenRedirectUrl(user);

      expect(result.url).toBe(NEW_AUTH_FLOW_ROUTE.JOIN_YOUR_ORGANIZATION);
    });
  });

  describe('AuthService - organization and premium tools functions', () => {
    it('updateOrganizationList', async () => {
      const orgList = [{ id: 'org1' }];
      orgGraph.getOrgList.mockResolvedValue(orgList);

      await authService.updateOrganizationList();

      expect(orgGraph.getOrgList).toHaveBeenCalled();
      expect(authService.dispatch).toHaveBeenCalledWith(actions.setOrganizations(orgList));
    });

    it('getSuggestedOrgListOfUser - popular domain', async () => {
      const user = { isPopularDomain: true };
      await authService.getSuggestedOrgListOfUser(user);
      expect(authService.dispatch).toHaveBeenCalledWith(actions.setSuggestedOrganizations([]));
    });

    it('getSuggestedOrgListOfUser - satisfied user', async () => {
      const user = { isPopularDomain: false };
      isUserNeedToJoinOrg.mockReturnValue(true);
      const orgList = [{ id: 'org1' }];
      userServices.getSuggestedOrgListOfUser.mockResolvedValue(orgList);

      await authService.getSuggestedOrgListOfUser(user);

      expect(userServices.getSuggestedOrgListOfUser).toHaveBeenCalled();
      expect(authService.dispatch).toHaveBeenCalledWith(actions.setSuggestedOrganizations(orgList));
    });

    it('getSuggestedOrgListOfUser - error', async () => {
      const user = { isPopularDomain: false };
      isUserNeedToJoinOrg.mockReturnValue(true);
      userServices.getSuggestedOrgListOfUser.mockRejectedValue(new Error('fail'));

      await authService.getSuggestedOrgListOfUser(user);

      expect(authService.dispatch).toHaveBeenCalledWith(actions.setSuggestedOrganizations([]));
    });

    it('getSuggestedOrgListOfUser - not satisfied', async () => {
      const user = { isPopularDomain: false };
      isUserNeedToJoinOrg.mockReturnValue(false);

      await authService.getSuggestedOrgListOfUser(user);

      expect(userServices.getSuggestedOrgListOfUser).not.toHaveBeenCalled();
    });
  });

  it('should call getMe', async () => {
    authGraph.getMe.mockResolvedValue('me');
    await expect(authService.getMe({ invitationToken: 't' })).resolves.toBe('me');
  });

  it('should reverse signatures', () => {
    const user = { signatures: [1, 2, 3] };
    const result = authService.reverseSignatures(user);
    expect(result.signatures).toEqual([3, 2, 1]);
  });

  it('should call afterSignOut', async () => {
    client.clearStore.mockResolvedValue();
    subscriptionClient.dispose = jest.fn();
    await authService.afterSignOut();
    expect(mockDispatch).toHaveBeenCalled();
    expect(kratosService.signIn).toHaveBeenCalled();
    expect(googleDriveEvent.totalPopupInSession).toHaveBeenCalled();
    expect(authService.socket.closeConnection).toHaveBeenCalled();
    expect(actions.signOutUser).toHaveBeenCalled();
  });

  it('should handle signInSuccess', async () => {
    const user = { _id: 'u1', signatures: [], email: 'a@b.com', isPopularDomain: false };
    authService.updateOrganizationList = jest.fn();
    authService.getSuggestedOrgListOfUser = jest.fn();
    authService.updatePremiumToolsInfo = jest.fn();

    await authService.signInSuccess({ user });

    expect(mockDispatch).toHaveBeenCalled();
    expect(ga.trackingUser).toHaveBeenCalledWith(user._id);
    expect(actions.setCurrentUser).toHaveBeenCalledWith(authService.reverseSignatures(user));
    expect(actions.fetchMainOrganization).toHaveBeenCalled();
  });

  it('should setup socket on sign in', () => {
    authService.setupSocketOnSignIn('id1');
    expect(authService.socketService.addUserToRoom).toHaveBeenCalledWith('id1');
    expect(authService.socket.authorizeSocket).toHaveBeenCalled();
    expect(authService.socket.onSocketConnected).toHaveBeenCalled();
  });

  it('should setup socket for anonymous', () => {
    authService.setupSocketForAnonymous();
    expect(authService.socket.releasePendingEvents).toHaveBeenCalled();
  });

  it('should validate sharing document token', async () => {
    authGraph.verifySharingDocumentToken.mockResolvedValue({});
    await expect(authService.validateSharingDocumentToken('token')).resolves.toBeUndefined();
  });

  it('should handle triggerSessionExpired', () => {
    localStorage.setItem('logout', 'true');
    authService.triggerSessionExpired();
    expect(localStorage.getItem('logout')).toBe('true');
  });

  it('should get new auth redirect url', () => {
    const user = { isPopularDomain: true };
    authService.getState = jest.fn().mockReturnValue({ organization: { suggestedOrganizations: { data: [] } } });
    const result = authService.getNewAuthenRedirectUrl(user);
    expect(result.url).toBeDefined();
  });

  it('should verify new user invitation token', () => {
    authGraph.verifyNewUserInvitationToken.mockReturnValue('ok');
    expect(authService.verifyNewUserInvitationToken('token')).toBe('ok');
  });

  it('should signInInsideViewer with normal', () => {
    kratosService.signIn = jest.fn();
    authService.signInInsideViewer({ isAnonymousDocument: false });
    expect(kratosService.signIn).toHaveBeenCalledWith(true);
  });

  it('should validate IP whitelist', () => {
    authGraph.validateIPWhitelist.mockReturnValue(true);
    expect(authService.validateIPWhitelist('email')).toBe(true);
  });

  it('should handle handleRedirectForPricing', () => {
    const navigate = jest.fn();
    PaymentUrlSerializer.mockImplementation(() => ({
      trial: () => ({ period: () => ({ plan: () => ({ get: () => 'url' }) }) }),
    }));
    authService.handleRedirectForPricing({ plan: 'plan1', isTrial: true, navigate });
    expect(navigate).toHaveBeenCalledWith('url', { replace: true });
  });

  it('should navigate with promotion', () => {
    const navigate = jest.fn();
    const getMock = jest.fn().mockReturnValue('url');
    PaymentUrlSerializer.mockImplementation(() => ({
      trial: () => ({ period: () => ({ plan: () => ({ get: getMock }) }) }),
    }));

    authService.handleRedirectForPricing({
      plan: 'plan1',
      isTrial: true,
      promotion: 'discount',
      navigate,
    });

    expect(getMock).toHaveBeenCalled();
  });

  it('should navigate without promotion', () => {
    const navigate = jest.fn();
    const getMock = jest.fn().mockReturnValue('url');
    PaymentUrlSerializer.mockImplementation(() => ({
      trial: () => ({ period: () => ({ plan: () => ({ get: getMock }) }) }),
    }));

    authService.handleRedirectForPricing({
      plan: 'plan1',
      isTrial: false,
      navigate,
    });

    expect(getMock).toHaveBeenCalled();
  });
});
