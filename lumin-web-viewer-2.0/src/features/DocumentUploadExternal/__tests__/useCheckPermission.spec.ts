import { renderHook } from '@testing-library/react';
import googleServices from 'services/googleServices';
import dropboxServices from 'services/dropboxServices';
import { oneDriveServices } from 'services/oneDriveServices';
import { STORAGE_TYPE } from 'constants/lumin-common';

import useCheckPermission from '../useCheckPermission';

jest.mock('services/dropboxServices', () => ({
  isSignedIn: jest.fn(),
}));

jest.mock('services/googleServices', () => ({
  isSignedIn: jest.fn(),
}));

jest.mock('services/oneDriveServices', () => ({
  oneDriveServices: {
    isSignedIn: jest.fn(),
  },
}));

jest.mock('features/FeatureConfigs', () => ({
  featureStoragePolicy: {
    externalStorages: ['google', 'dropbox', 'onedrive'],
  },
}));

describe('useCheckPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Google Drive Permission', () => {
    it('should check Google permission correctly when signed in', () => {
      (googleServices.isSignedIn as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useCheckPermission(STORAGE_TYPE.GOOGLE));
      const checkPermission = result.current;
      
      const hasPermission = checkPermission();

      expect(googleServices.isSignedIn).toHaveBeenCalledTimes(1);
      expect(hasPermission).toBe(true);
    });

    it('should check Google permission correctly when signed out', () => {
      (googleServices.isSignedIn as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useCheckPermission(STORAGE_TYPE.GOOGLE));
      const checkPermission = result.current;

      const hasPermission = checkPermission();

      expect(googleServices.isSignedIn).toHaveBeenCalledTimes(1);
      expect(hasPermission).toBe(false);
    });
  });

  describe('Dropbox Permission', () => {
    it('should check Dropbox permission correctly when signed in', () => {
      (dropboxServices.isSignedIn as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useCheckPermission(STORAGE_TYPE.DROPBOX));
      const checkPermission = result.current;

      const hasPermission = checkPermission();

      expect(dropboxServices.isSignedIn).toHaveBeenCalledTimes(1);
      expect(hasPermission).toBe(true);
    });

    it('should check Dropbox permission correctly when signed out', () => {
      (dropboxServices.isSignedIn as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useCheckPermission(STORAGE_TYPE.DROPBOX));
      const checkPermission = result.current;

      const hasPermission = checkPermission();

      expect(dropboxServices.isSignedIn).toHaveBeenCalledTimes(1);
      expect(hasPermission).toBe(false);
    });
  });

  describe('OneDrive Permission', () => {
    it('should check OneDrive permission correctly when signed in', () => {
      (oneDriveServices.isSignedIn as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useCheckPermission(STORAGE_TYPE.ONEDRIVE));
      const checkPermission = result.current;

      const hasPermission = checkPermission();

      expect(oneDriveServices.isSignedIn).toHaveBeenCalledTimes(1);
      expect(hasPermission).toBe(true);
    });

    it('should check OneDrive permission correctly when signed out', () => {
      (oneDriveServices.isSignedIn as jest.Mock).mockReturnValue(null); // or false/undefined

      const { result } = renderHook(() => useCheckPermission(STORAGE_TYPE.ONEDRIVE));
      const checkPermission = result.current;

      const hasPermission = checkPermission();

      expect(oneDriveServices.isSignedIn).toHaveBeenCalledTimes(1);
      expect(hasPermission).toBe(false); // !!null is false
    });
  });

  describe('Edge Cases', () => {
    it('should return undefined or throw if invalid storage type is passed (depending on TS usage)', () => {
      // In strict TypeScript this might not compile, but at runtime:
      const { result } = renderHook(() => useCheckPermission('INVALID_TYPE' as any));
      const checkPermission = result.current;

      expect(checkPermission).toBeUndefined();
    });
  });
});
