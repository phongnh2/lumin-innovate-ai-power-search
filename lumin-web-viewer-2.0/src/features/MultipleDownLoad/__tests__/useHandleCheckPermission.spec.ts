import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import useHandleCheckPermission from '../hooks/useHandleCheckPermission';

// Mock hooks
const mockAuthentication = {
  drive: jest.fn().mockResolvedValue(undefined),
  oneDrive: jest.fn().mockResolvedValue(undefined),
};

jest.mock('luminComponents/DocumentList/hooks/useAuthenticateService', () => ({
  __esModule: true,
  default: () => ({
    authentication: mockAuthentication,
  }),
}));

jest.mock('hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  useLatestRef: (value: any) => ({ current: value }),
}));

// Mock services
const mockGetFileInfo = jest.fn();
const mockGetFileMetaData = jest.fn();
const mockOneDriveGetFileInfo = jest.fn();

jest.mock('services', () => ({
  googleServices: {
    getFileInfo: (...args: any[]) => mockGetFileInfo(...args),
  },
  dropboxServices: {
    getFileMetaData: (...args: any[]) => mockGetFileMetaData(...args),
  },
  oneDriveServices: {
    getFileInfo: (...args: any[]) => mockOneDriveGetFileInfo(...args),
  },
}));

// Mock electron services
const mockElectronSubscribe = jest.fn();
const mockElectronAuthenticate = jest.fn();

jest.mock('services/electronDropboxServices', () => ({
  __esModule: true,
  default: {
    subscribe: (...args: any[]) => mockElectronSubscribe(...args),
    authenticate: (...args: any[]) => mockElectronAuthenticate(...args),
  },
}));

// Mock isElectron
jest.mock('utils/corePathHelper', () => ({
  isElectron: jest.fn().mockReturnValue(false),
}));

// Mock constants
jest.mock('constants/localStorageKey', () => ({
  LocalStorageKey: {
    DROPBOX_TOKEN: 'dropbox_token',
  },
}));

jest.mock('constants/urls', () => ({
  DROPBOX_AUTHORIZE_DOWNLOAD_API: 'https://dropbox.com/authorize',
}));

const mockStore = configureMockStore([]);

describe('useHandleCheckPermission', () => {
  const mockDocument = {
    _id: 'doc-1',
    name: 'test.pdf',
    remoteId: 'remote-123',
    remoteEmail: 'test@example.com',
    externalStorageAttributes: {
      driveId: 'drive-123',
    },
  } as any;

  const defaultState = {
    multipleDownload: {
      hasOpenedDropboxAuthWindow: false,
    },
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const store = mockStore(defaultState);
    return React.createElement(Provider, { store }, children);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Reset default mock implementations
    mockGetFileInfo.mockResolvedValue({
      capabilities: { canDownload: true },
    });
    mockOneDriveGetFileInfo.mockResolvedValue({});
    mockGetFileMetaData.mockResolvedValue({});
  });

  describe('checkDriveDocument', () => {
    it('should authenticate and check file permissions', async () => {
      const { result } = renderHook(() => useHandleCheckPermission(), { wrapper });
      
      await act(async () => {
        await result.current.checkDriveDocument(mockDocument);
      });
      
      expect(mockAuthentication.drive).toHaveBeenCalledWith([mockDocument]);
      expect(mockGetFileInfo).toHaveBeenCalledWith('remote-123');
    });

    it('should throw error when canDownload is false', async () => {
      mockGetFileInfo.mockResolvedValue({
        capabilities: { canDownload: false },
      });
      
      const { result } = renderHook(() => useHandleCheckPermission(), { wrapper });
      
      await expect(
        result.current.checkDriveDocument(mockDocument)
      ).rejects.toThrow('multipleDownload.lackOfPermission');
    });

    it('should succeed when canDownload is true', async () => {
      mockGetFileInfo.mockResolvedValue({
        capabilities: { canDownload: true },
      });
      
      const { result } = renderHook(() => useHandleCheckPermission(), { wrapper });
      
      await expect(
        result.current.checkDriveDocument(mockDocument)
      ).resolves.toBeUndefined();
    });
  });

  describe('checkOneDriveDocument', () => {
    it('should authenticate and get file info', async () => {
      const { result } = renderHook(() => useHandleCheckPermission(), { wrapper });
      
      await act(async () => {
        await result.current.checkOneDriveDocument(mockDocument);
      });
      
      expect(mockAuthentication.oneDrive).toHaveBeenCalled();
      expect(mockOneDriveGetFileInfo).toHaveBeenCalledWith({
        driveId: 'drive-123',
        remoteId: 'remote-123',
      });
    });

    it('should throw error when getFileInfo fails', async () => {
      mockOneDriveGetFileInfo.mockRejectedValue(new Error('File not found'));
      
      const { result } = renderHook(() => useHandleCheckPermission(), { wrapper });
      
      await expect(
        result.current.checkOneDriveDocument(mockDocument)
      ).rejects.toThrow('File not found');
    });

    it('should handle document without externalStorageAttributes', async () => {
      const docWithoutAttrs = {
        ...mockDocument,
        externalStorageAttributes: undefined,
      };
      
      const { result } = renderHook(() => useHandleCheckPermission(), { wrapper });
      
      await act(async () => {
        await result.current.checkOneDriveDocument(docWithoutAttrs);
      });
      
      expect(mockOneDriveGetFileInfo).toHaveBeenCalledWith({
        driveId: undefined,
        remoteId: 'remote-123',
      });
    });
  });

  describe('checkDropboxDocument', () => {
    it('should verify file metadata when token exists', async () => {
      localStorage.setItem('dropbox_token', 'valid-token');
      
      const { result } = renderHook(() => useHandleCheckPermission(), { wrapper });
      
      await act(async () => {
        await result.current.checkDropboxDocument({ document: mockDocument });
      });
      
      expect(mockGetFileMetaData).toHaveBeenCalledWith('remote-123');
    });

    it('should throw error when token exists but file not found', async () => {
      localStorage.setItem('dropbox_token', 'valid-token');
      mockGetFileMetaData.mockRejectedValue(new Error('File not found'));
      
      const { result } = renderHook(() => useHandleCheckPermission(), { wrapper });
      
      await expect(
        result.current.checkDropboxDocument({ document: mockDocument })
      ).rejects.toThrow('File not found');
    });

    it('should throw access denied when auth window was already opened', async () => {
      const stateWithOpenedWindow = {
        multipleDownload: {
          hasOpenedDropboxAuthWindow: true,
        },
      };
      
      const wrapperWithOpenedWindow = ({ children }: { children: React.ReactNode }) => {
        const store = mockStore(stateWithOpenedWindow);
        return React.createElement(Provider, { store }, children);
      };
      
      const { result } = renderHook(() => useHandleCheckPermission(), { 
        wrapper: wrapperWithOpenedWindow,
      });
      
      await expect(
        result.current.checkDropboxDocument({ document: mockDocument })
      ).rejects.toThrow('openDrive.accessDenied');
    });
  });

  describe('hook return values', () => {
    it('should return all check functions', () => {
      const { result } = renderHook(() => useHandleCheckPermission(), { wrapper });
      
      expect(typeof result.current.checkDriveDocument).toBe('function');
      expect(typeof result.current.checkOneDriveDocument).toBe('function');
      expect(typeof result.current.checkDropboxDocument).toBe('function');
    });
  });
});

