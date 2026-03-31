import {
  getLanguageFromUrl,
  getFullLanguageFromBrowser,
  getLanguageFromBrowser,
  getLanguage,
  getUrlWithoutLanguage,
  getPathnameWithoutLanguage,
  getFullPathWithPresetLang,
} from '../getLanguage';
import { cookieManager } from 'helpers/cookieManager';
import { LANGUAGES } from 'constants/language';
import { LocalStorageKey } from 'constants/localStorageKey';

jest.mock('helpers/cookieManager', () => ({
  cookieManager: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('getLanguage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { pathname: '/' },
      writable: true,
    });
    Object.defineProperty(window, 'navigator', {
      value: { language: 'en-US', userLanguage: undefined },
      writable: true,
    });
    localStorage.clear();
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getLanguageFromUrl', () => {
    it('should extract supported language from URL', () => {
      window.location.pathname = '/en/test';
      expect(getLanguageFromUrl()).toBe('en');
    });

    it('should return empty for unsupported language', () => {
      window.location.pathname = '/xx/test';
      expect(getLanguageFromUrl()).toBe('');
    });

    it('should handle path without trailing content', () => {
      window.location.pathname = '/fr';
      expect(getLanguageFromUrl()).toBe('fr');
    });
  });

  describe('getLanguage', () => {
    it('should return language from cookie', () => {
      cookieManager.get.mockReturnValue('fr');
      expect(getLanguage()).toBe('fr');
    });

    it('should return language from URL when cookie is null', () => {
      cookieManager.get.mockReturnValue(null);
      window.location.pathname = '/es/test';
      expect(getLanguage()).toBe('es');
    });

    it('should return language from browser when cookie and URL are null', () => {
      cookieManager.get.mockReturnValue(null);
      window.location.pathname = '/test';
      window.navigator.language = 'de-DE';
      expect(getLanguage()).toBe('en');
    });

    it('should migrate localStorage to cookie in production', () => {
      process.env.NODE_ENV = 'production';
      cookieManager.get.mockReturnValue(null);
      localStorage.setItem(LocalStorageKey.LANGUAGE, 'ja');
      window.location.pathname = '/test';
      getLanguage();
      expect(cookieManager.set).toHaveBeenCalled();
    });

    it('should return default EN for unsupported language', () => {
      cookieManager.get.mockReturnValue(null);
      window.location.pathname = '/test';
      window.navigator.language = 'xx-XX';
      expect(getLanguage()).toBe(LANGUAGES.EN);
    });
  });

  describe('getUrlWithoutLanguage', () => {
    it('should remove first 3 characters', () => {
      window.location.pathname = '/en/test';
      expect(getUrlWithoutLanguage()).toBe('/test');
    });
  });

  describe('getPathnameWithoutLanguage', () => {
    it('should return pathname without language when language exists', () => {
      window.location.pathname = '/fr/test';
      expect(getPathnameWithoutLanguage()).toBe('/test');
    });

    it('should return full pathname when no language', () => {
      window.location.pathname = '/test';
      expect(getPathnameWithoutLanguage()).toBe('/test');
    });
  });

  describe('getFullPathWithPresetLang', () => {
    it('should prepend language when language exists', () => {
      window.location.pathname = '/de/test';
      expect(getFullPathWithPresetLang('/new-path')).toBe('/new-path');
    });
  });
});
