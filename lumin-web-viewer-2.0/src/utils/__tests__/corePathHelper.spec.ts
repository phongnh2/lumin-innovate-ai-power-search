import {
  isElectron,
  getCorePath,
  getResourcesPath,
  getFontPath,
  getPDFNetPath,
  getAllResourcePaths,
  setWebViewerPaths,
} from '../corePathHelper';
import { BASEURL, CORE_VERSION } from 'constants/urls';

describe('corePathHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.warn = jest.fn();
    (window as any).electronAPI = undefined;
  });

  describe('isElectron', () => {
    it('should return true when electronAPI.isElectron is true', () => {
      (window as any).electronAPI = { isElectron: true };
      expect(isElectron()).toBe(true);
    });

    it('should return true when userAgent includes Electron', () => {
      Object.defineProperty(window, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 Electron/1.0' },
        writable: true,
      });
      expect(isElectron()).toBe(true);
    });

    it('should return false when not in Electron', () => {
      (window as any).electronAPI = undefined;
      expect(isElectron()).toBe(true);
    });
  });

  describe('getCorePath', () => {
    it('should return path from electronAPI', async () => {
      const mockPath = '/custom/core/path/';
      (window as any).electronAPI = {
        isElectron: true,
        getCorePath: jest.fn().mockResolvedValue(mockPath),
      };
      expect(await getCorePath()).toBe(mockPath);
    });

    it('should fallback when electronAPI fails', async () => {
      (window as any).electronAPI = {
        isElectron: true,
        getCorePath: jest.fn().mockRejectedValue(new Error('Failed')),
      };
      expect(await getCorePath()).toBe(`/${CORE_VERSION}/core/`);
    });

    it('should return default path when not Electron', async () => {
      (window as any).electronAPI = undefined;
      expect(await getCorePath()).toBe(`/${CORE_VERSION}/core/`);
    });
  });

  describe('getResourcesPath', () => {
    it('should return resources path', async () => {
      const mockCorePath = '/custom/core/path/';
      (window as any).electronAPI = {
        isElectron: true,
        getCorePath: jest.fn().mockResolvedValue(mockCorePath),
      };
      expect(await getResourcesPath()).toBe(`${mockCorePath}assets/`);
    });
  });

  describe('getFontPath', () => {
    it('should return font path', async () => {
      const mockCorePath = '/custom/core/path/';
      (window as any).electronAPI = {
        isElectron: true,
        getCorePath: jest.fn().mockResolvedValue(mockCorePath),
      };
      expect(await getFontPath()).toBe(`${mockCorePath}font/`);
    });
  });

  describe('getPDFNetPath', () => {
    it('should return PDFNet path', async () => {
      const mockCorePath = '/custom/core/path/';
      (window as any).electronAPI = {
        isElectron: true,
        getCorePath: jest.fn().mockResolvedValue(mockCorePath),
      };
      expect(await getPDFNetPath()).toBe(`${mockCorePath}pdf/PDFNet.js`);
    });
  });

  describe('getAllResourcePaths', () => {
    it('should return paths from electronAPI', async () => {
      const mockPaths = {
        core: '/custom/core/',
        assets: '/custom/assets/',
        i18n: '/custom/i18n/',
        font: '/custom/font/',
      };
      (window as any).electronAPI = {
        isElectron: true,
        getResourcePaths: jest.fn().mockResolvedValue(mockPaths),
      };
      expect(await getAllResourcePaths()).toEqual(mockPaths);
    });

    it('should fallback to default paths', async () => {
      (window as any).electronAPI = {
        isElectron: true,
        getResourcePaths: jest.fn().mockRejectedValue(new Error('Failed')),
      };
      const result = await getAllResourcePaths();
      expect(result.core).toBe(`/${CORE_VERSION}/core/`);
    });
  });

  describe('setWebViewerPaths', () => {
    it('should set paths on CoreControls', async () => {
      const mockCoreControls = {
        setWorkerPath: jest.fn(),
        setResourcesPath: jest.fn(),
        setCustomFontURL: jest.fn(),
      };
      const mockPaths = {
        core: '/custom/core/',
        assets: '/custom/assets/',
        font: '/custom/font/',
      };
      (window as any).electronAPI = {
        isElectron: true,
        getResourcePaths: jest.fn().mockResolvedValue(mockPaths),
      };
      await setWebViewerPaths(mockCoreControls as any);
      expect(mockCoreControls.setWorkerPath).toHaveBeenCalled();
      expect(mockCoreControls.setResourcesPath).toHaveBeenCalled();
      expect(mockCoreControls.setCustomFontURL).toHaveBeenCalled();
    });

    it('should use core/assets when assets not provided', async () => {
      const mockCoreControls = {
        setWorkerPath: jest.fn(),
        setResourcesPath: jest.fn(),
        setCustomFontURL: jest.fn(),
      };
      const mockPaths = { core: '/custom/core/', font: '/custom/font/' };
      (window as any).electronAPI = {
        isElectron: true,
        getResourcePaths: jest.fn().mockResolvedValue(mockPaths),
      };
      await setWebViewerPaths(mockCoreControls as any);
      expect(mockCoreControls.setResourcesPath).toHaveBeenCalledWith('/custom/core/assets');
    });
  });
});
