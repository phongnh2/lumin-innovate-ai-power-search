import {
  getViewerActiveSideNav,
  getLanguageAttr,
  getCommonAttributes,
  MAX_PINPOINT_VALUE_CHARACTER,
  convertQueryStringToObject,
  getOrgIdFromOrgList,
} from '../getCommonAttributes';
import { LEFT_SIDE_BAR } from '@new-ui/components/LuminLeftSideBar/constants';
import selectors from 'selectors';
import { GrowthBookServices } from 'services/growthBookServices';
import authenticationObserver from 'helpers/authenticationObserver';
import { cookieManager } from 'helpers/cookieManager';
import { getUserBrowserForAllDevices, getUserOs } from 'helpers/device';
import logger from 'helpers/logger';
import lastAccessOrgs from 'utils/lastAccessOrgs';
import { quickSearchSelectors } from 'features/QuickSearch/slices';
import { getLanguage, getLanguageFromBrowser } from '../getLanguage';
import getLanguageName from '../getLanguageName';
import { store } from '../../redux/store';
import { QUERY_STRING_WHITE_LIST_TRACKING } from 'constants/queryStringWhiteListTracking';
import { LocalStorageKey } from 'constants/localStorageKey';
import UserEventConstants from 'constants/eventConstants';

jest.mock('selectors');
jest.mock('services/growthBookServices');
jest.mock('helpers/authenticationObserver');
jest.mock('helpers/cookieManager');
jest.mock('helpers/device');
jest.mock('helpers/logger');
let mockIsStandaloneModeValue = false;
jest.mock('helpers/pwa', () => ({
  get isStandaloneMode() {
    return mockIsStandaloneModeValue;
  },
}));
jest.mock('utils/lastAccessOrgs');
jest.mock('features/QuickSearch/slices');
jest.mock('../getLanguage');
jest.mock('../getLanguageName');
jest.mock('../../redux/store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(),
  },
}));

describe('getCommonAttributes', () => {
  const mockDispatch = jest.fn();
  const mockGetState = jest.fn();
  const mockGrowthBookInstance = {
    getAttributes: jest.fn(),
  };
  const mockGrowthBookServices = {
    instance: jest.fn(() => ({
      getGrowthBookInstance: mockGrowthBookInstance,
    })),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    store.dispatch = mockDispatch;
    store.getState = mockGetState;

    GrowthBookServices.instance = jest.fn(() => ({
      getGrowthBookInstance: mockGrowthBookInstance,
    }));

    authenticationObserver.wait = jest.fn().mockResolvedValue();
    cookieManager.anonymousUserId = 'anonymous-123';
    getUserBrowserForAllDevices.mockReturnValue('Chrome');
    getUserOs.mockReturnValue('MacOS');
    logger.logError = jest.fn();
    mockIsStandaloneModeValue = false;
    getLanguage.mockReturnValue('en');
    getLanguageFromBrowser.mockReturnValue('en');
    getLanguageName.mockResolvedValue('English');

    delete window.location;
    window.location = {
      origin: 'https://example.com',
      pathname: '/test',
      search: '',
    };

    Storage.prototype.getItem = jest.fn((key) => {
      if (key === LocalStorageKey.BROWSER_MODE) {
        return 'normal';
      }
      return null;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getViewerActiveSideNav', () => {
    it('should return null when document is not loaded', () => {
      const state = {};
      selectors.isDocumentLoaded.mockReturnValue(false);

      const result = getViewerActiveSideNav(state);

      expect(result).toBeNull();
    });

    it('should return "[]" when toolbarValue is not in mapping', () => {
      const state = {};
      selectors.isDocumentLoaded.mockReturnValue(true);
      selectors.toolbarValue.mockReturnValue('unknown-toolbar');

      const result = getViewerActiveSideNav(state);

      expect(result).toBe('[]');
    });
  });

  describe('convertQueryStringToObject', () => {
    it('convertQueryStringToObject', () => {
      const unknownKey = 'not_in_whitelist';
      window.location.search = `?${unknownKey}=value123`;

      const result = convertQueryStringToObject();

      expect(result).toEqual({});
    });
  });

  describe('getOrgIdFromOrgList', () => {
    it('should return null if currentUser is null', () => {
      selectors.getCurrentUser.mockReturnValue(null);
      selectors.getOrganizationList.mockReturnValue({ data: [{ organization: { _id: 'org-1', url: 'org-url' } }] });

      const result = getOrgIdFromOrgList();
      expect(result).toBeNull();
    });

    it('should return null if currentUser.lastAccessedOrgUrl is missing', () => {
      selectors.getCurrentUser.mockReturnValue({ _id: 'user-1' }); // no lastAccessedOrgUrl
      selectors.getOrganizationList.mockReturnValue({ data: [{ organization: { _id: 'org-1', url: 'org-url' } }] });

      const result = getOrgIdFromOrgList();
      expect(result).toBeNull();
    });

    it('should return null if no organization matches lastAccessedOrgUrl', () => {
      selectors.getCurrentUser.mockReturnValue({ _id: 'user-1', lastAccessedOrgUrl: 'org-url-not-found' });
      selectors.getOrganizationList.mockReturnValue({ data: [{ organization: { _id: 'org-1', url: 'org-url' } }] });

      const result = getOrgIdFromOrgList();
      expect(result).toBeNull();
    });
  });

  describe('getLanguageAttr', () => {
    it('should return language attributes successfully', async () => {
      getLanguage.mockReturnValue('en');
      getLanguageFromBrowser.mockReturnValue('en');
      getLanguageName.mockResolvedValue('English');

      const result = await getLanguageAttr();

      expect(result).toEqual({
        LuminLanguage: 'English',
        browserLanguage: 'English',
      });
      expect(getLanguageName).toHaveBeenCalledWith('en');
    });

    it('should handle error when getLanguageName fails', async () => {
      getLanguage.mockReturnValue('en');
      getLanguageFromBrowser.mockReturnValue('en');
      getLanguageName.mockRejectedValue(new Error('Failed to get language name'));

      const result = await getLanguageAttr();

      expect(result).toEqual({
        LuminLanguage: 'English',
        browserLanguage: null,
      });
      expect(logger.logError).toHaveBeenCalled();
    });
  });

  describe('getCommonAttributes', () => {
    const mockState = {};
    const mockCurrentUser = {
      _id: 'user-123',
      payment: {
        customerRemoteId: 'stripe-customer-123',
        subscriptionRemoteId: 'stripe-sub-123',
        planRemoteId: 'stripe-plan-123',
      },
    };
    const mockCurrentDocument = {
      _id: 'doc-123',
    };
    const mockCurrentOrganization = {
      data: {
        _id: 'org-123',
        payment: {
          customerRemoteId: 'org-stripe-customer-123',
        },
      },
    };
    const mockOrganizationList = {
      data: [],
    };

    beforeEach(() => {
      mockGetState.mockReturnValue(mockState);
      selectors.getCurrentUser.mockReturnValue(mockCurrentUser);
      selectors.getCurrentDocument.mockReturnValue(mockCurrentDocument);
      selectors.getCurrentOrganization.mockReturnValue(mockCurrentOrganization);
      selectors.getOrganizationList.mockReturnValue(mockOrganizationList);
      selectors.getActionCountDocStack.mockReturnValue({ sync: true });
      selectors.isOffline.mockReturnValue(false);
      selectors.isDocumentLoaded.mockReturnValue(true);
      selectors.toolbarValue.mockReturnValue(LEFT_SIDE_BAR.POPULAR);
      quickSearchSelectors.isOpenQuickSearch.mockReturnValue(false);
      mockGrowthBookInstance.getAttributes.mockReturnValue({
        feature1: 'value1',
        feature2: 'value2',
      });
      lastAccessOrgs.getFromStorage.mockReturnValue([]);
    });

    it('should return common attributes with all data', async () => {
      const attributes = { customAttr: 'customValue' };

      const result = await getCommonAttributes(attributes);

      expect(result).toMatchObject({
        LuminFileId: 'doc-123',
        organizationId: 'org-123',
        LuminUserId: 'user-123',
        userBrowser: 'Chrome',
        userOS: 'MacOS',
        clientType: 'Web',
        url: 'https://example.com/test',
        anonymousUserId: 'anonymous-123',
        browserMode: 'normal',
        syncIsCounted: 'true',
        viewerActiveSideNav: 'Popular',
        customAttr: 'customValue',
      });
      expect(authenticationObserver.wait).toHaveBeenCalled();
    });

    it('should return PWA client type when window.lMode is PWA', async () => {
      mockIsStandaloneModeValue = false;
      window.lMode = 'PWA';

      const result = await getCommonAttributes();

      expect(result.clientType).toBe('PWA');
    });

    it('should include query string attributes when present', async () => {
      const mockQueryParam = QUERY_STRING_WHITE_LIST_TRACKING[0];
      window.location.search = `?${mockQueryParam}=testValue`;

      const originalURLSearchParams = global.URLSearchParams;
      global.URLSearchParams = jest.fn((search) => {
        const params = new originalURLSearchParams(search);
        return params;
      });

      const result = await getCommonAttributes();

      expect(result[`queryString_${mockQueryParam}`]).toBe('testValue');

      global.URLSearchParams = originalURLSearchParams;
    });

    it('should include selectFrom when quick search is open and elementName is provided', async () => {
      quickSearchSelectors.isOpenQuickSearch.mockReturnValue(true);
      const attributes = { elementName: 'button' };

      const result = await getCommonAttributes(attributes);

      expect(result.selectFrom).toBe(UserEventConstants.EventType.VIEWER_QUICK_SEARCH);
    });

    it('should get organizationId from lastAccessOrgs when currentOrg has no data', async () => {
      selectors.getCurrentOrganization.mockReturnValue({
        data: null,
      });
      lastAccessOrgs.getFromStorage.mockReturnValue([{ id: 'last-org-123' }]);

      const result = await getCommonAttributes();

      expect(result.organizationId).toBe('last-org-123');
    });

    it('should get organizationId from organizationList when other methods fail', async () => {
      selectors.getCurrentOrganization.mockReturnValue({
        data: null,
      });
      lastAccessOrgs.getFromStorage.mockReturnValue([]);
      selectors.getCurrentUser.mockReturnValue({
        _id: 'user-123',
        lastAccessedOrgUrl: 'org-url',
      });
      selectors.getOrganizationList.mockReturnValue({
        data: [
          {
            organization: {
              _id: 'org-from-list-123',
              url: 'org-url',
            },
          },
        ],
      });

      const result = await getCommonAttributes();

      expect(result.organizationId).toBe('org-from-list-123');
    });

    it('should omit nil values from result', async () => {
      selectors.getCurrentUser.mockReturnValue(null);
      selectors.getCurrentDocument.mockReturnValue(null);

      const result = await getCommonAttributes();

      expect(result.LuminFileId).toBeUndefined();
      expect(result.LuminUserId).toBeUndefined();
    });

    it('should handle missing browser mode in localStorage', async () => {
      Storage.prototype.getItem.mockReturnValue(null);

      const result = await getCommonAttributes();

      expect(result.browserMode).toBe('unknown');
    });

    it('should handle empty user payment gracefully', async () => {
      selectors.getCurrentUser.mockReturnValue({
        _id: 'user-123',
        payment: {},
      });
      selectors.getCurrentOrganization.mockReturnValue({
        data: {
          _id: 'org-123',
          payment: {},
        },
      });

      const result = await getCommonAttributes();

      expect(result.StripeCustomerId).toBeUndefined();
      expect(logger.logError).toHaveBeenCalled();
    });

    it('should fallback to "other browsers" and empty string for userBrowser and userOS', async () => {
        getUserBrowserForAllDevices.mockReturnValue(null);
        getUserOs.mockReturnValue(undefined);
      
        const result = await getCommonAttributes();
      
        expect(result.userBrowser).toBe('other browsers');
        expect(result.userOS).toBe('');
      });
  });
});
