import { GoogleDriveItem } from '../googleDrive';
import { UploadDocumentError, UploadStatus } from '../../../enum';
import { googleServices } from 'services';
import core from 'core';
import { passwordHandlers } from 'helpers/passwordHandlers';
import { file as fileUtils } from 'utils';

// 1. Mock Base Class
// We mock the base class to isolate GoogleDriveItem logic and avoid testing the base implementation again.
const mockGetFileBufferFromSecureDoc = jest.fn();
jest.mock('../base', () => {
  return {
    DocumentBaseItem: class {
      async getFileBufferFromSecureDoc(args: any) {
        return mockGetFileBufferFromSecureDoc(args);
      }
    },
  };
});

// 2. Mock Services
jest.mock('services', () => ({
  googleServices: {
    getFileInfo: jest.fn(),
    downloadFile: jest.fn(),
  },
}));

// 3. Mock Core
jest.mock('core', () => ({
  __esModule: true,
  default: {
    CoreControls: {
      createDocument: jest.fn(),
    },
  },
}));

// 4. Mock Helpers
jest.mock('helpers/passwordHandlers', () => ({
  passwordHandlers: {
    setCheckFn: jest.fn(),
    setCancelFn: jest.fn(),
  },
}));

// 5. Mock Utils
jest.mock('utils', () => ({
  file: {
    getThumbnailWithDocument: jest.fn(),
  },
}));

// 6. Mock Constants and Enums
jest.mock('features/MultipleMerge/constants', () => ({
  SUPPORTED_FILE_TYPES: {
    PDF: ['application/pdf'],
  },
}));

jest.mock('../../../enum', () => ({
  UploadDocumentError: {
    FILE_ENCRYPTED: 'FILE_ENCRYPTED',
  },
  UploadStatus: {
    UPLOADED: 'UPLOADED',
    FAILED: 'FAILED',
  },
}));

describe('GoogleDriveItem', () => {
  const mockOnError = jest.fn();
  const mockOnLoadDocumentComplete = jest.fn();
  const mockOnSetupPasswordHandler = jest.fn();

  const defaultProps = {
    _id: 'doc-1',
    remoteId: 'remote-123',
    name: 'test-doc.pdf',
    onError: mockOnError,
    onLoadDocumentComplete: mockOnLoadDocumentComplete,
    onSetupPasswordHandler: mockOnSetupPasswordHandler,
  };

  const mockFile = new File(['content'], 'test-doc.pdf', { type: 'application/pdf' });
  const mockDocInstance = { id: 'doc-instance' };
  const mockThumbnailCanvas = {
    toDataURL: jest.fn().mockReturnValue('data:image/png;base64,thumb'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFileBufferFromSecureDoc.mockResolvedValue(new ArrayBuffer(8));
    (googleServices.getFileInfo as jest.Mock).mockResolvedValue({ name: 'test-doc.pdf' });
    (googleServices.downloadFile as jest.Mock).mockResolvedValue(mockFile);
    (core.CoreControls.createDocument as jest.Mock).mockResolvedValue(mockDocInstance);
    (fileUtils.getThumbnailWithDocument as jest.Mock).mockResolvedValue(mockThumbnailCanvas);
  });

  describe('getDocumentData', () => {
    it('should process a Google Drive document successfully', async () => {
      const item = new GoogleDriveItem(defaultProps);

      const result = await item.getDocumentData();

      // 1. Verify Google Service calls
      expect(googleServices.getFileInfo).toHaveBeenCalledWith('remote-123', '*', 'onPickFileFromGoogle');
      expect(googleServices.downloadFile).toHaveBeenCalledWith('remote-123', 'test-doc.pdf');

      // 2. Verify Core Document creation
      expect(core.CoreControls.createDocument).toHaveBeenCalledWith(mockFile, expect.objectContaining({
        loadAsPDF: true, // Based on mocked SUPPORTED_FILE_TYPES
      }));

      // 3. Verify Base Class method call
      expect(mockGetFileBufferFromSecureDoc).toHaveBeenCalledWith({
        docInstance: mockDocInstance,
        file: mockFile,
      });

      // 4. Verify Thumbnail generation
      expect(fileUtils.getThumbnailWithDocument).toHaveBeenCalledWith(mockDocInstance, { thumbSize: 60 });

      // 5. Verify Result
      expect(result).toEqual({
        _id: 'doc-1',
        remoteId: 'remote-123',
        file: mockFile,
        buffer: expect.any(ArrayBuffer),
        thumbnail: 'data:image/png;base64,thumb',
        status: UploadStatus.UPLOADED,
      });

      // 6. Verify Callback
      expect(mockOnLoadDocumentComplete).toHaveBeenCalled();
      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('should handle errors during processing', async () => {
      const error = new Error('Download failed');
      (googleServices.getFileInfo as jest.Mock).mockRejectedValue(error);

      const item = new GoogleDriveItem(defaultProps);

      const result = await item.getDocumentData();

      // Should call onError
      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
      const errorArg = (mockOnError as jest.Mock).mock.calls[0][0];
      expect(errorArg.message).toContain('Failed to get document data of google drive document: test-doc.pdf');
      expect(errorArg.cause).toBe(error);

      // Should resolve with FAILED status
      expect(result).toEqual({
        _id: 'doc-1',
        remoteId: 'remote-123',
        status: UploadStatus.FAILED,
      });
    });

    it('should handle password protected documents correctly', async () => {
      let passwordCallback: (fn: (password: string) => void) => void;
      
      // Intercept the password callback passed to createDocument
      (core.CoreControls.createDocument as jest.Mock).mockImplementation((_, options) => {
        passwordCallback = options.password;
        // Simulate waiting for password indefinitely or until cancel in this test context
        // We return a promise that doesn't resolve immediately to simulate the pause, 
        // but for the sake of testing the callback setup, we just return the instance 
        // effectively, but we need to trigger the callback logic manually.
        return new Promise(() => {}); 
      });

      const item = new GoogleDriveItem(defaultProps);

      // Trigger the process (it won't resolve yet)
      const promise = item.getDocumentData();

      // Wait for createDocument to be called and our interceptor to capture the callback
      await new Promise(resolve => setTimeout(resolve, 0));

      // Simulate Core invoking the password callback with a verification function
      expect(passwordCallback!).toBeDefined();
      const mockVerifyPasswordFn = jest.fn();
      passwordCallback!(mockVerifyPasswordFn);

      // Verify Password Handlers setup
      expect(passwordHandlers.setCheckFn).toHaveBeenCalledWith(mockVerifyPasswordFn);
      expect(mockOnSetupPasswordHandler).toHaveBeenCalledWith({ attempt: 0, name: 'test-doc.pdf' });

      // Simulate User clicking Cancel
      const cancelFn = (passwordHandlers.setCancelFn as jest.Mock).mock.calls[0][0];
      cancelFn();

      // Now the promise should resolve with FAILED status due to cancellation
      const result = await promise;

      expect(result).toEqual({
        _id: 'doc-1',
        remoteId: 'remote-123',
        metadata: {
          errorCode: UploadDocumentError.FILE_ENCRYPTED,
        },
        status: UploadStatus.FAILED,
      });
    });

    it('should determine loadAsPDF correctly based on file type', async () => {
        // Test with unsupported type to verify loadAsPDF is false
        const imageFile = new File(['img'], 'test.png', { type: 'image/png' });
        (googleServices.downloadFile as jest.Mock).mockResolvedValue(imageFile);

        const item = new GoogleDriveItem(defaultProps);
        await item.getDocumentData();

        expect(core.CoreControls.createDocument).toHaveBeenCalledWith(imageFile, expect.objectContaining({
            loadAsPDF: false,
        }));
    });
  });
});