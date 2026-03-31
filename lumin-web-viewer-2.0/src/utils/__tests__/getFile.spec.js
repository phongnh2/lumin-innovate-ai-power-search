import getExternalStorageFile from '../getFile';
import { dropboxServices, googleServices, oneDriveServices } from 'services';
import { getFileService } from 'utils';
import { documentStorage } from 'constants/documentConstants';
import { MAX_DOCUMENT_SIZE } from 'constants/lumin-common';

jest.mock('services', () => ({
  dropboxServices: {
    getDropboxUserInfo: jest.fn(),
    getFileMetaData: jest.fn(),
  },
  googleServices: {
    isSignedIn: jest.fn(),
    implicitSignIn: jest.fn(),
    getFileInfo: jest.fn(),
  },
  oneDriveServices: {
    isSignedIn: jest.fn(),
    getToken: jest.fn(),
    getFileInfo: jest.fn(),
  },
}));

jest.mock('utils', () => ({
  getFileService: {
    getDocument: jest.fn(),
  },
}));

describe('getFile', () => {
  const mockFile = new File(['test'], 'test.pdf');

  beforeEach(() => {
    jest.clearAllMocks();
    window.open = jest.fn();
  });

  it('should return null for S3 storage', async () => {
    const document = { service: documentStorage.s3, remoteId: 'test-id' };
    expect(await getExternalStorageFile(document)).toBeNull();
  });

  it('should handle Dropbox - success case', async () => {
    const document = { service: documentStorage.dropbox, remoteId: '/path/to/file.pdf' };
    dropboxServices.getDropboxUserInfo.mockResolvedValue({ id: 'user-123' });
    dropboxServices.getFileMetaData.mockResolvedValue({ data: { size: 10 * 1024 * 1024 } });
    getFileService.getDocument.mockResolvedValue(mockFile);
    expect(await getExternalStorageFile(document)).toBe(mockFile);
  });

  it('should handle Dropbox - not signed in', async () => {
    const document = { service: documentStorage.dropbox, remoteId: '/path/to/file.pdf' };
    dropboxServices.getDropboxUserInfo.mockResolvedValue(null);
    await expect(getExternalStorageFile(document)).rejects.toThrow('AUTHENTICATION_FAILED');
  });

  it('should handle Dropbox - file size exceeds limit', async () => {
    const document = { service: documentStorage.dropbox, remoteId: '/path/to/file.pdf' };
    dropboxServices.getDropboxUserInfo.mockResolvedValue({ id: 'user-123' });
    dropboxServices.getFileMetaData.mockResolvedValue({
      data: { size: (MAX_DOCUMENT_SIZE + 1) * 1024 * 1024 },
    });
    await expect(getExternalStorageFile(document)).rejects.toThrow('File size must be less than 200 MB.');
  });

  it('should handle Google - success case', async () => {
    const document = { service: documentStorage.google, remoteId: 'file-123' };
    googleServices.isSignedIn.mockReturnValue(true);
    googleServices.getFileInfo.mockResolvedValue({ size: 10 * 1024 * 1024 });
    getFileService.getDocument.mockResolvedValue(mockFile);
    expect(await getExternalStorageFile(document)).toBe(mockFile);
  });

  it('should handle Google - sign in required', async () => {
    const document = { service: documentStorage.google, remoteId: 'file-123' };
    googleServices.isSignedIn.mockReturnValue(false);
    googleServices.implicitSignIn.mockResolvedValue({});
    googleServices.getFileInfo.mockResolvedValue({ size: 10 * 1024 * 1024 });
    getFileService.getDocument.mockResolvedValue(mockFile);
    await getExternalStorageFile(document);
    expect(googleServices.implicitSignIn).toHaveBeenCalled();
  });

  it('should handle Google - sign in fails', async () => {
    const document = { service: documentStorage.google, remoteId: 'file-123' };
    googleServices.isSignedIn.mockReturnValue(false);
    googleServices.implicitSignIn.mockRejectedValue(new Error('Failed'));
    await expect(getExternalStorageFile(document)).rejects.toThrow('AUTHENTICATION_FAILED');
  });

  it('should handle OneDrive - success case', async () => {
    const document = {
      service: documentStorage.onedrive,
      remoteId: 'file-123',
      externalStorageAttributes: { driveId: 'drive-123' },
    };
    oneDriveServices.isSignedIn.mockReturnValue(true);
    oneDriveServices.getFileInfo.mockResolvedValue({ size: 10 * 1024 * 1024 });
    getFileService.getDocument.mockResolvedValue(mockFile);
    expect(await getExternalStorageFile(document)).toBe(mockFile);
  });

  it('should handle OneDrive - get token required', async () => {
    const document = {
      service: documentStorage.onedrive,
      remoteId: 'file-123',
      externalStorageAttributes: { driveId: 'drive-123' },
    };
    oneDriveServices.isSignedIn.mockReturnValue(false);
    oneDriveServices.getToken.mockResolvedValue({ access_token: 'token' });
    oneDriveServices.getFileInfo.mockResolvedValue({ size: 10 * 1024 * 1024 });
    getFileService.getDocument.mockResolvedValue(mockFile);
    await getExternalStorageFile(document);
    expect(oneDriveServices.getToken).toHaveBeenCalled();
  });

  it('should throw error for unknown service', async () => {
    const document = { service: 'unknown', remoteId: 'test-id' };
    await expect(getExternalStorageFile(document)).rejects.toThrow('No service found');
  });
});
