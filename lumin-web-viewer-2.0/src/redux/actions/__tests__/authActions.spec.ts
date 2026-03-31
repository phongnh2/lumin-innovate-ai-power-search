import { flushSync } from 'react-dom';

// Mock dependencies before imports
const mockGetCurrentUser = jest.fn();
const mockLogError = jest.fn();
const mockAuthObserverNotify = jest.fn();
const mockAxiosGet = jest.fn();

jest.mock('services/userServices', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

jest.mock('@libs/axios', () => ({
  __esModule: true,
  default: {
    axiosLuminSignInstance: {
      get: (url: string) => mockAxiosGet(url),
    },
  },
}));

jest.mock('helpers/authenticationObserver', () => ({
  __esModule: true,
  default: {
    notify: () => mockAuthObserverNotify(),
  },
}));

jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: (args: any) => mockLogError(args),
  },
}));

jest.mock('react-dom', () => ({
  flushSync: jest.fn((fn) => fn()),
}));

jest.mock('constants/lumin-common', () => ({
  LOGGER: {
    Service: {
      NETWORK_ERROR: 'NETWORK_ERROR',
    },
  },
}));

jest.mock('constants/paymentConstant', () => ({
  FREE_USER_SIGN_PAYMENT: { plan: 'free' },
}));

import * as authActions from '../authActions';

describe('authActions', () => {
  let dispatch: jest.Mock;
  let getState: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = jest.fn();
    getState = jest.fn();
  });

  describe('fetchCurrentUser', () => {
    it('should dispatch UPDATE_CURRENT_USER when user is fetched', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockGetCurrentUser.mockResolvedValue(mockUser);

      await authActions.fetchCurrentUser()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_CURRENT_USER',
        payload: { data: mockUser },
      });
    });

    it('should not dispatch when user is null', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      await authActions.fetchCurrentUser()(dispatch);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('setCurrentUser', () => {
    it('should dispatch SET_CURRENT_USER', () => {
      const currentUser = { id: 'user-123' };
      authActions.setCurrentUser(currentUser)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_CURRENT_USER',
        payload: { currentUser },
      });
    });
  });

  describe('updateCurrentUser', () => {
    it('should dispatch UPDATE_CURRENT_USER', () => {
      const data = { name: 'John Doe' };
      authActions.updateCurrentUser(data)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_CURRENT_USER',
        payload: { data },
      });
    });
  });

  describe('setCurrentDocument', () => {
    it('should dispatch SET_CURRENT_DOCUMENT', () => {
      const document = { id: 'doc-123' };
      authActions.setCurrentDocument(document)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_CURRENT_DOCUMENT',
        payload: { document },
      });
    });
  });

  describe('updateCurrentDocument', () => {
    it('should dispatch UPDATE_CURRENT_DOCUMENT', () => {
      const data = { name: 'Test Doc' };
      authActions.updateCurrentDocument(data)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_CURRENT_DOCUMENT',
        payload: { data },
      });
    });
  });

  describe('startFetchingCurrentDocument', () => {
    it('should dispatch START_FETCHING_CURRENT_DOCUMENT', () => {
      authActions.startFetchingCurrentDocument()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'START_FETCHING_CURRENT_DOCUMENT',
      });
    });
  });

  describe('fetchingCurrentDocumentComplete', () => {
    it('should dispatch FETCHING_CURRENT_DOCUMENT_COMPLETE', () => {
      const currentDocument = { id: 'doc-123' };
      authActions.fetchingCurrentDocumentComplete(currentDocument)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'FETCHING_CURRENT_DOCUMENT_COMPLETE',
        payload: { currentDocument },
      });
    });
  });

  describe('fetchingCurrentDocumentError', () => {
    it('should dispatch FETCHING_CURRENT_DOCUMENT_ERROR', () => {
      authActions.fetchingCurrentDocumentError()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'FETCHING_CURRENT_DOCUMENT_ERROR',
      });
    });
  });

  describe('resetCurrentDocument', () => {
    it('should dispatch RESET_CURRENT_DOCUMENT', () => {
      authActions.resetCurrentDocument()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'RESET_CURRENT_DOCUMENT',
      });
    });
  });

  describe('signOutUser', () => {
    it('should dispatch CANCEL_ALL_UPLOADING_FILES and USER_LOGGED_OUT', () => {
      authActions.signOutUser()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'CANCEL_ALL_UPLOADING_FILES',
      });
      expect(flushSync).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith({
        type: 'USER_LOGGED_OUT',
      });
    });
  });

  describe('setDeletePassword', () => {
    it('should dispatch SET_DELETE_PASSWORD', () => {
      const password = 'secret123';
      authActions.setDeletePassword(password)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_DELETE_PASSWORD',
        payload: { password },
      });
    });
  });

  describe('setOffline', () => {
    it('should dispatch SET_OFFLINE', () => {
      authActions.setOffline(true)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_OFFLINE',
        payload: { isOffline: true },
      });
    });
  });

  describe('setSubMenuType', () => {
    it('should dispatch SET_SUB_MENU_TYPE', () => {
      const subMenuType = 'documents';
      authActions.setSubMenuType(subMenuType)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_SUB_MENU_TYPE',
        payload: { subMenuType },
      });
    });
  });

  describe('loadGapiSuccess', () => {
    it('should dispatch LOAD_GAPI_SUCCESS', () => {
      authActions.loadGapiSuccess()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'LOAD_GAPI_SUCCESS',
      });
    });
  });

  describe('setSourceDownloading', () => {
    it('should dispatch SET_SOURCE_DOWNLOADING', () => {
      authActions.setSourceDownloading(true)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_SOURCE_DOWNLOADING',
        payload: { isSourceDownloading: true },
      });
    });
  });

  describe('updateLocationCurrency', () => {
    it('should return UPDATE_LOCATION_CURRENCY action', () => {
      const result = authActions.updateLocationCurrency('USD');

      expect(result).toEqual({
        type: 'UPDATE_LOCATION_CURRENCY',
        payload: { currency: 'USD' },
      });
    });
  });

  describe('updateLastAccessOrg', () => {
    it('should dispatch updateCurrentUser with provided url', () => {
      getState.mockReturnValue({
        organization: {
          organizations: { data: [{ organization: { url: 'fallback-org' } }] },
        },
      });

      authActions.updateLastAccessOrg('my-org')(dispatch, getState);

      expect(dispatch).toHaveBeenCalled();
    });

    it('should use fallback url when url is not provided', () => {
      getState.mockReturnValue({
        organization: {
          organizations: { data: [{ organization: { url: 'fallback-org' } }] },
        },
      });

      authActions.updateLastAccessOrg(null)(dispatch, getState);

      expect(dispatch).toHaveBeenCalled();
    });
  });

  describe('setIsAuthenticating', () => {
    it('should return SET_IS_AUTHENTICATING action', () => {
      const result = authActions.setIsAuthenticating(true);

      expect(result).toEqual({
        type: 'SET_IS_AUTHENTICATING',
        payload: { isAuthenticating: true },
      });
    });
  });

  describe('setWrongIpStatus', () => {
    it('should return SET_WRONG_IP_STATUS action', () => {
      const result = authActions.setWrongIpStatus({ open: true, email: 'test@example.com' });

      expect(result).toEqual({
        type: 'SET_WRONG_IP_STATUS',
        payload: { open: true, email: 'test@example.com' },
      });
    });
  });

  describe('setMembershipOfOrg', () => {
    it('should return SET_MEMBERSHIP_OF_ORG action', () => {
      const result = authActions.setMembershipOfOrg({ require: true, email: 'test@example.com' });

      expect(result).toEqual({
        type: 'SET_MEMBERSHIP_OF_ORG',
        payload: { require: true, email: 'test@example.com' },
      });
    });
  });

  describe('setLanguage', () => {
    it('should return SET_LANGUAGE action', () => {
      const result = authActions.setLanguage('en');

      expect(result).toEqual({
        type: 'SET_LANGUAGE',
        payload: { language: 'en' },
      });
    });
  });

  describe('loadUserLocationSuccess', () => {
    it('should dispatch LOAD_USER_LOCATION_SUCCESS', () => {
      authActions.loadUserLocationSuccess()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'LOAD_USER_LOCATION_SUCCESS',
      });
    });
  });

  describe('fetchUserPaymentInfoFromLuminSign', () => {
    it('should dispatch SET_USER_SIGN_PAYMENT on success', async () => {
      const mockPayment = { plan: 'premium' };
      mockAxiosGet.mockResolvedValue({ data: { user: { payment: mockPayment } } });

      await authActions.fetchUserPaymentInfoFromLuminSign()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_USER_SIGN_PAYMENT',
        payload: { userSignPayment: mockPayment },
      });
    });

    it('should use FREE_USER_SIGN_PAYMENT when payment is null', async () => {
      mockAxiosGet.mockResolvedValue({ data: { user: { payment: null } } });

      await authActions.fetchUserPaymentInfoFromLuminSign()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_USER_SIGN_PAYMENT',
        payload: { userSignPayment: { plan: 'free' } },
      });
    });

    it('should log error when request fails', async () => {
      const error = new Error('Network error');
      mockAxiosGet.mockRejectedValue(error);

      await authActions.fetchUserPaymentInfoFromLuminSign()(dispatch);

      expect(mockLogError).toHaveBeenCalledWith({
        reason: 'NETWORK_ERROR',
        error,
        message: "Can't get user payment info from Lumin Sign",
      });
    });
  });

  describe('loadGTMSuccess', () => {
    it('should dispatch LOAD_GTM_SUCCESS', () => {
      authActions.loadGTMSuccess()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'LOAD_GTM_SUCCESS',
      });
    });
  });

  describe('setIsCompletedGettingUserData', () => {
    it('should dispatch SET_IS_COMPLETED_GETTING_USER_DATA and notify observer', () => {
      authActions.setIsCompletedGettingUserData(true)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_IS_COMPLETED_GETTING_USER_DATA',
        payload: { isCompletedGettingUserData: true },
      });
      expect(mockAuthObserverNotify).toHaveBeenCalled();
    });
  });
});

