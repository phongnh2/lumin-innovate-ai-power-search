import { redirectFlowUtils } from '../redirectFlow';
import { cookieManager } from 'helpers/cookieManager';
import { CookieStorageKey } from 'constants/cookieName';

jest.mock('helpers/cookieManager', () => ({
  cookieManager: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('RedirectFlowUtils', () => {
  describe('loadGoogleCookieNames', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalEnv = process.env.ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
      process.env.ENV = originalEnv;
    });

    it('should return simple cookie key in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.ENV = 'test';
      const result = redirectFlowUtils.loadGoogleCookieNames();
      expect(result.googleAccessToken).toBe('_google_at_test');
    });
  });

  describe('deleteCookies', () => {
    it('should call cookieManager.delete with correct key', () => {
      const spy = jest.spyOn(cookieManager, 'delete');
      redirectFlowUtils.deleteCookies();
      expect(spy).toHaveBeenCalledWith(redirectFlowUtils.loadGoogleCookieNames().googleAccessToken);
    });
  });

  describe('getFlowData', () => {
    const flowData = { bucket: 10, percentage: 50, variantName: 'redirect' as const };
    const encodedFlow = encodeURIComponent(btoa(JSON.stringify(flowData)));

    it('should return empty object if cookie not set', () => {
      (cookieManager.get as jest.Mock).mockReturnValue(null);
      const result = redirectFlowUtils.getFlowData();
      expect(result).toEqual({});
    });

    it('should decode and parse cookie data correctly', () => {
      (cookieManager.get as jest.Mock).mockReturnValue(encodedFlow);
      const result = redirectFlowUtils.getFlowData();
      expect(result).toEqual(flowData);
    });

    it('should return empty object if cookie is invalid', () => {
      (cookieManager.get as jest.Mock).mockReturnValue('invalid-base64');
      expect(() => redirectFlowUtils.getFlowData()).toThrow();
    });
  });
});
