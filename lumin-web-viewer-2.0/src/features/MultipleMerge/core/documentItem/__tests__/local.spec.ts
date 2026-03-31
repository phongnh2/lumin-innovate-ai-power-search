import { LocalDocumentItem } from '../local';
import { UploadDocumentError, UploadStatus } from '../../../enum';
import core from 'core';
import { passwordHandlers } from 'helpers/passwordHandlers';
import { file as fileUtils } from 'utils';

// 1. Mock Base Class
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

// 2. Mock Core
jest.mock('core', () => ({
  __esModule: true,
  default: {
    CoreControls: {
      createDocument: jest.fn(),
    },
  },
}));

// 3. Mock Helpers
jest.mock('helpers/passwordHandlers', () => ({
  passwordHandlers: {
    setCheckFn: jest.fn(),
    setCancelFn: jest.fn(),
  },
}));

// 4. Mock Utils
jest.mock('utils', () => ({
  file: {
    getThumbnailWithDocument: jest.fn(),
    getExtension: jest.fn(),
  },
}));

// 5. Mock Constants and Enums
jest.mock('features/MultipleMerge/constants', () => ({
  SUPPORTED_FILE_TYPES: {
    PDF: ['application/pdf'],
    JPG: ['image/jpeg'],
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

describe('LocalDocumentItem', () => {
  const mockOnError = jest.fn();
  const mockOnLoadDocumentComplete = jest.fn();
  const mockOnSetupPasswordHandler = jest.fn();

  // Create a mock File object
  const mockFile = {
    name: 'test-local.pdf',
    type: 'application/pdf',
  } as unknown as File;

  const defaultProps = {
    _id: 'doc-local-1',
    file: mockFile,
    name: 'test-local.pdf',
    onError: mockOnError,
    onLoadDocumentComplete: mockOnLoadDocumentComplete,
    onSetupPasswordHandler: mockOnSetupPasswordHandler,
  };

  const mockDocInstance = { id: 'doc-instance' };
  const mockThumbnailCanvas = {
    toDataURL: jest.fn().mockReturnValue('data:image/png;base64,thumb'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFileBufferFromSecureDoc.mockResolvedValue(new ArrayBuffer(8));
    (core.CoreControls.createDocument as jest.Mock).mockResolvedValue(mockDocInstance);
    (fileUtils.getThumbnailWithDocument as jest.Mock).mockResolvedValue(mockThumbnailCanvas);
    (fileUtils.getExtension as jest.Mock).mockReturnValue('pdf');
  });

  describe('getDocumentData', () => {
    it('should process a local document successfully', async () => {
      const item = new LocalDocumentItem(defaultProps);

      const result = await item.getDocumentData();

      // 1. Verify Utils calls
      expect(fileUtils.getExtension).toHaveBeenCalledWith('test-local.pdf');

      // 2. Verify Core Document creation
      expect(core.CoreControls.createDocument).toHaveBeenCalledWith(mockFile, expect.objectContaining({
        extension: 'pdf',
        loadAsPDF: true, // Based on mocked SUPPORTED_FILE_TYPES and file.type
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
        _id: 'doc-local-1',
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
      const error = new Error('File read failed');
      (core.CoreControls.createDocument as jest.Mock).mockRejectedValue(error);

      const item = new LocalDocumentItem(defaultProps);

      const result = await item.getDocumentData();

      // Should call onError
      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
      const errorArg = (mockOnError as jest.Mock).mock.calls[0][0];
      expect(errorArg.message).toContain('Failed to get document data of local document: test-local.pdf');
      expect(errorArg.cause).toBe(error);

      // Should resolve with FAILED status
      expect(result).toEqual({
        _id: 'doc-local-1',
        file: mockFile,
        status: UploadStatus.FAILED,
      });
    });

    it('should handle password protected documents correctly', async () => {
      let passwordCallback: (fn: (password: string) => void) => void;

      // Intercept the password callback passed to createDocument
      (core.CoreControls.createDocument as jest.Mock).mockImplementation((_, options) => {
        passwordCallback = options.password;
        // Return a promise that doesn't resolve yet to simulate waiting for password
        return new Promise(() => {});
      });

      const item = new LocalDocumentItem(defaultProps);

      // Trigger the process
      const promise = item.getDocumentData();

      // Wait for execution loop
      await new Promise(resolve => setTimeout(resolve, 0));

      // Invoke password callback with a verification function (as Core does)
      expect(passwordCallback!).toBeDefined();
      const mockVerifyPasswordFn = jest.fn();
      passwordCallback!(mockVerifyPasswordFn);

      // Verify Password Handlers setup
      expect(passwordHandlers.setCheckFn).toHaveBeenCalledWith(mockVerifyPasswordFn);
      expect(mockOnSetupPasswordHandler).toHaveBeenCalledWith({ attempt: 0, name: 'test-local.pdf' });

      // Simulate User clicking Cancel
      const cancelFn = (passwordHandlers.setCancelFn as jest.Mock).mock.calls[0][0];
      cancelFn();

      // Promise should now resolve with FAILED
      const result = await promise;

      expect(result).toEqual({
        _id: 'doc-local-1',
        file: mockFile,
        metadata: {
          errorCode: UploadDocumentError.FILE_ENCRYPTED,
        },
        status: UploadStatus.FAILED,
      });
    });

    it('should set loadAsPDF correctly for unsupported PDF-like types', async () => {
      const imageFile = { name: 'test.png', type: 'image/png' } as unknown as File;
      (fileUtils.getExtension as jest.Mock).mockReturnValue('png');
      
      const item = new LocalDocumentItem({ ...defaultProps, file: imageFile, name: 'test.png' });
      await item.getDocumentData();

      expect(core.CoreControls.createDocument).toHaveBeenCalledWith(imageFile, expect.objectContaining({
        extension: 'png',
        loadAsPDF: false, // image/png is not in our mocked PDF types
      }));
    });
  });
});