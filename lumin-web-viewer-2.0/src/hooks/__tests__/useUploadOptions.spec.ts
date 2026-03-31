import { renderHook } from '@testing-library/react';

import useUploadOptions from '../useUploadOptions';
import { useRestrictedUser } from '../useRestrictedUser';

import { DocumentStorage } from 'constants/documentConstants';

jest.mock('../useRestrictedUser', () => ({
  useRestrictedUser: jest.fn(),
}));

const mockUseRestrictedUser = useRestrictedUser as jest.Mock;

describe('useUploadOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when user is not a drive-only user', () => {
    beforeEach(() => {
      mockUseRestrictedUser.mockReturnValue({
        isDriveOnlyUser: false,
      });
    });

    it('should allow S3 uploads', () => {
      const { result } = renderHook(() => useUploadOptions());

      expect(result.current[DocumentStorage.S3]).toBe(true);
    });

    it('should allow Google Drive uploads', () => {
      const { result } = renderHook(() => useUploadOptions());

      expect(result.current[DocumentStorage.GOOGLE]).toBe(true);
    });

    it('should allow OneDrive uploads', () => {
      const { result } = renderHook(() => useUploadOptions());

      expect(result.current[DocumentStorage.ONEDRIVE]).toBe(true);
    });

    it('should allow Dropbox uploads', () => {
      const { result } = renderHook(() => useUploadOptions());

      expect(result.current[DocumentStorage.DROPBOX]).toBe(true);
    });

    it('should return all upload options as enabled', () => {
      const { result } = renderHook(() => useUploadOptions());

      expect(result.current).toEqual({
        [DocumentStorage.S3]: true,
        [DocumentStorage.GOOGLE]: true,
        [DocumentStorage.ONEDRIVE]: true,
        [DocumentStorage.DROPBOX]: true,
      });
    });
  });

  describe('when user is a drive-only user', () => {
    beforeEach(() => {
      mockUseRestrictedUser.mockReturnValue({
        isDriveOnlyUser: true,
      });
    });

    it('should not allow S3 uploads', () => {
      const { result } = renderHook(() => useUploadOptions());

      expect(result.current[DocumentStorage.S3]).toBe(false);
    });

    it('should still allow Google Drive uploads', () => {
      const { result } = renderHook(() => useUploadOptions());

      expect(result.current[DocumentStorage.GOOGLE]).toBe(true);
    });

    it('should not allow OneDrive uploads', () => {
      const { result } = renderHook(() => useUploadOptions());

      expect(result.current[DocumentStorage.ONEDRIVE]).toBe(false);
    });

    it('should not allow Dropbox uploads', () => {
      const { result } = renderHook(() => useUploadOptions());

      expect(result.current[DocumentStorage.DROPBOX]).toBe(false);
    });

    it('should return correct upload options for drive-only user', () => {
      const { result } = renderHook(() => useUploadOptions());

      expect(result.current).toEqual({
        [DocumentStorage.S3]: false,
        [DocumentStorage.GOOGLE]: true,
        [DocumentStorage.ONEDRIVE]: false,
        [DocumentStorage.DROPBOX]: false,
      });
    });
  });

  describe('useRestrictedUser hook integration', () => {
    it('should call useRestrictedUser hook', () => {
      mockUseRestrictedUser.mockReturnValue({ isDriveOnlyUser: false });

      renderHook(() => useUploadOptions());

      expect(mockUseRestrictedUser).toHaveBeenCalled();
    });
  });
});

