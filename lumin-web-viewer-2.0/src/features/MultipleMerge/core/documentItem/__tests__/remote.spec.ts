import { RemoteDocumentItem } from '../remote';
import { UploadDocumentError, UploadStatus } from '../../../enum';
import { getDocumentData as getDocumentDataFromAPI } from '../../../apis';
import core from 'core';
import { passwordHandlers } from 'helpers/passwordHandlers';
import fileUtils from 'utils/file';
import getFileService from 'utils/getFileService';
import { STORAGE_TYPE } from 'constants/lumin-common';
import { IAnnotation, IFormField, TDocumentOutline } from 'interfaces/document/document.interface';

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

// 2. Mock API
jest.mock('../../../apis', () => ({
  getDocumentData: jest.fn(),
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

// 5. Mock Utils - Mock the actual import paths used in remote.ts
jest.mock('utils/file', () => ({
  __esModule: true,
  default: {
    getExtension: jest.fn(),
  },
}));

jest.mock('utils/getFileService', () => ({
  __esModule: true,
  default: {
    getFileOptions: jest.fn(),
    getFileFromUrl: jest.fn(),
    getDocument: jest.fn(),
  },
}));

// 6. Mock Constants and Enums
jest.mock('features/MultipleMerge/constants', () => ({
  SUPPORTED_FILE_TYPES: {
    PDF: ['application/pdf'],
  },
}));

jest.mock('constants/lumin-common', () => ({
  STORAGE_TYPE: {
    S3: 'S3',
    GOOGLE: 'GOOGLE',
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

describe('RemoteDocumentItem', () => {
  const mockOnError = jest.fn();
  const mockOnLoadDocumentComplete = jest.fn();
  const mockOnSetupPasswordHandler = jest.fn();
  const mockOnCancelPassword = jest.fn();
  const mockAbortSignal = new AbortController().signal;

  const defaultProps = {
    _id: 'doc-remote-1',
    remoteId: 'remote-id-123',
    name: 'test-remote.pdf',
    abortSignal: mockAbortSignal,
    onError: mockOnError,
    onLoadDocumentComplete: mockOnLoadDocumentComplete,
    onSetupPasswordHandler: mockOnSetupPasswordHandler,
    onCancelPassword: mockOnCancelPassword,
  };

  const mockFile = new File(['content'], 'test-remote.pdf', { type: 'application/pdf' });
  const mockDocInstance = { id: 'doc-instance' };
  
  const mockApiData = {
    document: { 
      name: 'test-remote.pdf', 
      mimeType: 'application/pdf', 
      service: 'DROPBOX' 
    },
    annotations: [] as unknown as IAnnotation[],
    outlines: [] as unknown as TDocumentOutline[],
    fields: [] as unknown as IFormField[],
    signedUrls: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default Successful Setup
    mockGetFileBufferFromSecureDoc.mockResolvedValue(new ArrayBuffer(8));
    (getDocumentDataFromAPI as jest.Mock).mockResolvedValue(mockApiData);
    (core.CoreControls.createDocument as jest.Mock).mockResolvedValue(mockDocInstance);
    (getFileService.getDocument as jest.Mock).mockResolvedValue(mockFile);
    (fileUtils.getExtension as jest.Mock).mockReturnValue('pdf');
  });

  describe('getDocumentData', () => {
    it('should process a standard remote document (Non-S3) successfully', async () => {
      const item = new RemoteDocumentItem(defaultProps);

      const result = await item.getDocumentData();

      // 1. Verify API Call
      expect(getDocumentDataFromAPI).toHaveBeenCalledWith({
        documentId: 'remote-id-123',
        abortSignal: mockAbortSignal,
      });

      // 2. Verify File Fetching (Non-S3 path)
      expect(getFileService.getDocument).toHaveBeenCalledWith(mockApiData.document);
      expect(getFileService.getFileOptions).not.toHaveBeenCalled();

      // 3. Verify Core Document Creation
      expect(core.CoreControls.createDocument).toHaveBeenCalledWith(mockFile, expect.objectContaining({
        extension: 'pdf',
        loadAsPDF: true,
      }));

      // 4. Verify Result
      expect(result).toEqual({
        _id: 'doc-remote-1',
        remoteId: 'remote-id-123',
        document: mockApiData.document,
        buffer: expect.any(ArrayBuffer),
        file: mockFile,
        status: UploadStatus.UPLOADED,
        annotations: mockApiData.annotations,
        outlines: mockApiData.outlines,
        fields: mockApiData.fields,
        signedUrls: mockApiData.signedUrls,
      });

      expect(mockOnLoadDocumentComplete).toHaveBeenCalled();
    });

    it('should process an S3 remote document successfully', async () => {
      const s3DocData = { 
        ...mockApiData, 
        document: { ...mockApiData.document, service: STORAGE_TYPE.S3 } 
      };
      (getDocumentDataFromAPI as jest.Mock).mockResolvedValue(s3DocData);
      
      const mockS3File = new File(['s3-content'], 's3.pdf', { type: 'application/pdf' });
      
      (getFileService.getFileOptions).mockResolvedValue({ src: 'presigned-url' });
      (getFileService.getFileFromUrl).mockResolvedValue(mockS3File);

      const item = new RemoteDocumentItem(defaultProps);

      const result = await item.getDocumentData();

      // 1. Verify S3 File Fetching Logic
      expect(getFileService.getDocument).not.toHaveBeenCalled();
      expect(getFileService.getFileOptions).toHaveBeenCalledWith(s3DocData.document, {});
      expect(getFileService.getFileFromUrl).toHaveBeenCalledWith({
        url: 'presigned-url',
        fileName: 'test-remote.pdf',
        fileOptions: { type: 'application/pdf' },
        abortSignal: mockAbortSignal,
      });

      // 2. Verify Core creation with S3 file
      expect(core.CoreControls.createDocument).toHaveBeenCalledWith(mockS3File, expect.anything());

      expect(result.status).toBe(UploadStatus.UPLOADED);
    });

    it('should handle API errors correctly', async () => {
      const error = new Error('API Error');
      (getDocumentDataFromAPI as jest.Mock).mockRejectedValue(error);

      const item = new RemoteDocumentItem(defaultProps);
      const result = await item.getDocumentData();

      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
      const errorArg = (mockOnError as jest.Mock).mock.calls[0][0];
      expect(errorArg.message).toContain('Failed to get document data of remote document: test-remote.pdf API Error');
      
      expect(result).toEqual({
        _id: 'doc-remote-1',
        remoteId: 'remote-id-123',
        status: UploadStatus.FAILED,
      });
    });

    it('should handle file fetching errors correctly', async () => {
      const error = new Error('File Fetch Error');
      (getFileService.getDocument as jest.Mock).mockRejectedValue(error);

      const item = new RemoteDocumentItem(defaultProps);
      const result = await item.getDocumentData();

      expect(mockOnError).toHaveBeenCalled();
      expect(result.status).toBe(UploadStatus.FAILED);
    });

    it('should handle password protected documents correctly', async () => {
      let passwordCallback: (fn: (password: string) => void) => void;

      // Intercept the callback
      (core.CoreControls.createDocument as jest.Mock).mockImplementation((_, options) => {
        passwordCallback = options.password;
        return new Promise(() => {}); // Pause execution
      });

      const item = new RemoteDocumentItem(defaultProps);
      const promise = item.getDocumentData();

      // Wait for event loop
      await new Promise(resolve => setTimeout(resolve, 0));

      // 1. Invoke the password callback provided by RemoteDocumentItem
      // It expects a verification function (fn) as an argument
      const mockVerifyPasswordFn = jest.fn(); // The "fn" from Core
      
      expect(passwordCallback!).toBeDefined();
      passwordCallback!(mockVerifyPasswordFn);

      // 2. Verify Handlers are set up using the passed verification function
      expect(passwordHandlers.setCheckFn).toHaveBeenCalledWith(mockVerifyPasswordFn);
      expect(mockOnSetupPasswordHandler).toHaveBeenCalledWith({ attempt: 0, name: 'test-remote.pdf' });

      // 3. Simulate User Cancel
      const cancelFn = (passwordHandlers.setCancelFn as jest.Mock).mock.calls[0][0];
      cancelFn();

      // 4. Verify Cancel side effects
      expect(mockOnCancelPassword).toHaveBeenCalled();

      // 5. Result should be FAILED
      const result = await promise;
      expect(result).toEqual({
        _id: 'doc-remote-1',
        remoteId: 'remote-id-123',
        metadata: {
          errorCode: UploadDocumentError.FILE_ENCRYPTED,
        },
        status: UploadStatus.FAILED,
      });
    });

    it('should force loadAsPDF if parameter is true', async () => {
      // Setup file that is NOT typically PDF (e.g. Image) to verify override
      (fileUtils.getExtension as jest.Mock).mockReturnValue('png');
      const imageApiData = { 
        ...mockApiData, 
        document: { ...mockApiData.document, mimeType: 'image/png' } 
      };
      (getDocumentDataFromAPI as jest.Mock).mockResolvedValue(imageApiData);

      const item = new RemoteDocumentItem(defaultProps);

      // Pass loadAsPDF: true
      await item.getDocumentData({ loadAsPDF: true });

      expect(core.CoreControls.createDocument).toHaveBeenCalledWith(mockFile, expect.objectContaining({
        loadAsPDF: true,
      }));
    });
  });
});