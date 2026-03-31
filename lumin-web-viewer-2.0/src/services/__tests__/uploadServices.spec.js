import Axios from '@libs/axios';

import { file as fileUtils } from 'utils';

import documentServices from 'services/documentServices';
import dropboxServices from 'services/dropboxServices';
import googleServices from 'services/googleServices';

import uploadService from '../uploadServices';

import { documentStorage } from 'constants/documentConstants';
import { MAXIMUM_FILE_SIZE, MAX_DOCUMENT_SIZE } from 'constants/lumin-common';

jest.mock('@libs/axios');
jest.mock('utils', () => ({
  file: {
    getDocumentInstanceWithFile: jest.fn(),
    getUnlockedPDFInstance: jest.fn(),
    getLinearPDFWithDocument: jest.fn(),
    getThumbnailWithDocument: jest.fn(),
    convertThumnailCanvasToFile: jest.fn(),
  },
  capitalize: jest.fn((str) => str?.charAt(0).toUpperCase() + str?.slice(1)),
}));
jest.mock('services/documentServices');
jest.mock('services/dropboxServices');
jest.mock('services/googleServices');
jest.mock('helpers/logger', () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('UploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should convert image URL to base64 using canvas', (done) => {
    const mockImage = {
      crossOrigin: '',
      onload: null,
      src: '',
      naturalHeight: 10,
      naturalWidth: 20,
    };
    global.Image = jest.fn(() => mockImage);

    const mockCanvas = {
      getContext: jest.fn(() => ({
        drawImage: jest.fn(),
      })),
      height: 0,
      width: 0,
      toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
    };
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'CANVAS') return mockCanvas;
      return document.createElement(tag);
    });

    const handler = jest.fn((result) => {
      expect(result).toBe('data:image/png;base64,mock');
      done();
    });

    uploadService.loadThumbnailBase64('mock-image-url', handler);
    mockImage.onload();
  });

  it('should call documentInstance.getFileName when fileUpload.name is missing', async () => {
    const mockFileNoName = { ...new File(['content'], '', { type: 'application/pdf' }), name: undefined };
    const mockDocInstance = {
      getFileName: jest.fn(() => 'generated.pdf'),
    };
    fileUtils.getDocumentInstanceWithFile.mockResolvedValue(mockDocInstance);
    fileUtils.getLinearPDFWithDocument.mockRejectedValue(new Error('Linearization failed'));

    const result = await uploadService.linearPdfFromFiles(mockFileNoName);

    expect(mockDocInstance.getFileName).toHaveBeenCalled();
    expect(result.linearizedFile.name).toBe('generated.pdf');
  });

  describe('Handler Registration', () => {
    describe('registerHandler', () => {
      it('should register a handler with given name', () => {
        const mockHandler = jest.fn();

        uploadService.registerHandler('test_handler', mockHandler);

        expect(uploadService.getUploadHandler('test_handler')).toBe(mockHandler);
      });

      it('should overwrite existing handler with same name', () => {
        const firstHandler = jest.fn();
        const secondHandler = jest.fn();

        uploadService.registerHandler('test_handler', firstHandler);
        uploadService.registerHandler('test_handler', secondHandler);

        expect(uploadService.getUploadHandler('test_handler')).toBe(secondHandler);
      });
    });

    describe('removeHandler', () => {
      it('should remove a registered handler', () => {
        const mockHandler = jest.fn();
        uploadService.registerHandler('test_handler', mockHandler);

        uploadService.removeHandler('test_handler');
        expect(uploadService.uploadHandler['test_handler']).toBeUndefined();
      });

      it('should not throw when removing non-existent handler', () => {
        expect(() => {
          uploadService.removeHandler('non_existent');
        }).not.toThrow();
      });
    });

    describe('getUploadHandler', () => {
      it('should return registered handler', () => {
        const mockHandler = jest.fn();
        uploadService.registerHandler('custom_handler', mockHandler);

        expect(uploadService.getUploadHandler('custom_handler')).toBe(mockHandler);
      });

      it('should return DOCUMENT_HANDLER as fallback', () => {
        const documentHandler = jest.fn();
        uploadService.registerHandler(uploadService.DOCUMENT_HANDLER, documentHandler);

        const result = uploadService.getUploadHandler('non_existent');

        expect(result).toBe(documentHandler);
      });
    });
  });

  describe('linearPdfFromFiles', () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const mockDocInstance = {
      getFileName: jest.fn(() => 'test.pdf'),
    };
    const mockLinearizedFile = new File(['linearized'], 'test.pdf', { type: 'application/pdf' });

    beforeEach(() => {
      fileUtils.getDocumentInstanceWithFile.mockResolvedValue(mockDocInstance);
      fileUtils.getLinearPDFWithDocument.mockResolvedValue(mockLinearizedFile);
    });

    it('should create linearized PDF from file', async () => {
      const result = await uploadService.linearPdfFromFiles(mockFile);

      expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
      expect(fileUtils.getDocumentInstanceWithFile).toHaveBeenCalled();
      expect(fileUtils.getLinearPDFWithDocument).toHaveBeenCalledWith(mockDocInstance, {
        fileMetadata: mockFile,
      });
      expect(URL.revokeObjectURL).toHaveBeenCalled();
      expect(result).toEqual({
        linearizedFile: mockLinearizedFile,
        documentInstance: mockDocInstance,
      });
    });

    it('should use getUnlockedPDFInstance when unlockPassword is true', async () => {
      fileUtils.getUnlockedPDFInstance.mockResolvedValue(mockDocInstance);

      await uploadService.linearPdfFromFiles(mockFile, {
        unlockPassword: true,
        passwordModalMessage: 'Enter password',
      });

      expect(fileUtils.getUnlockedPDFInstance).toHaveBeenCalledWith({
        objectUrl: 'blob:mock-url',
        uploadFile: mockFile,
        dispatch: expect.any(Function),
        passwordModalMessage: 'Enter password',
      });
    });

    it('should return original file when linearization fails', async () => {
      fileUtils.getLinearPDFWithDocument.mockRejectedValue(new Error('Linearization failed'));

      const result = await uploadService.linearPdfFromFiles(mockFile);

      expect(result.linearizedFile).toBeInstanceOf(File);
      expect(result.linearizedFile.name).toBe('test.pdf');
      expect(result.documentInstance).toBe(mockDocInstance);
    });

    it('should always revoke object URL even on error', async () => {
      fileUtils.getLinearPDFWithDocument.mockRejectedValue(new Error('Error'));

      await uploadService.linearPdfFromFiles(mockFile);

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('getThumbnailDocument', () => {
    it('should get thumbnail from document instance', async () => {
      const mockDocInstance = {
        getFilename: jest.fn(() => 'test.pdf'),
      };
      const mockCanvas = { width: 100, height: 100 };
      const mockThumbnailFile = new File(['thumb'], 'test.jpg', { type: 'image/jpeg' });

      fileUtils.getThumbnailWithDocument.mockResolvedValue(mockCanvas);
      fileUtils.convertThumnailCanvasToFile.mockResolvedValue(mockThumbnailFile);

      const result = await uploadService.getThumbnailDocument(mockDocInstance);

      expect(fileUtils.getThumbnailWithDocument).toHaveBeenCalledWith(mockDocInstance, { thumbSize: 2500 });
      expect(fileUtils.convertThumnailCanvasToFile).toHaveBeenCalledWith(mockCanvas, 'test.pdf');
      expect(result).toBe(mockThumbnailFile);
    });
  });

  describe('loadThumbnailBase64', () => {
    it('should call handler with empty string when file is null', async () => {
      const handler = jest.fn();

      await uploadService.loadThumbnailBase64(null, handler);

      expect(handler).toHaveBeenCalledWith('');
    });

    it('should call handler with empty string when file is undefined', async () => {
      const handler = jest.fn();

      await uploadService.loadThumbnailBase64(undefined, handler);

      expect(handler).toHaveBeenCalledWith('');
    });

    it('should read Blob file and call handler with data URL', (done) => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      const handler = jest.fn((result) => {
        expect(result).toContain('data:');
        done();
      });

      uploadService.loadThumbnailBase64(mockBlob, handler);
    });
  });

  describe('checkUploadBySize', () => {
    it('should not allow upload when file exceeds MAX_DOCUMENT_SIZE', () => {
      const fileSizeBytes = (MAX_DOCUMENT_SIZE + 1) * 1024 * 1024;

      const result = uploadService.checkUploadBySize(fileSizeBytes, true);

      expect(result).toEqual({
        allowedUpload: false,
        maxSizeAllow: MAX_DOCUMENT_SIZE,
      });
    });

    it('should allow upload for premium plan within premium limit', () => {
      const fileSizeBytes = (MAXIMUM_FILE_SIZE.PREMIUM_PLAN - 1) * 1024 * 1024;

      const result = uploadService.checkUploadBySize(fileSizeBytes, true);

      expect(result).toEqual({
        allowedUpload: true,
        maxSizeAllow: MAXIMUM_FILE_SIZE.PREMIUM_PLAN,
      });
    });

    it('should not allow upload for premium plan exceeding premium limit', () => {
      const fileSizeBytes = (MAXIMUM_FILE_SIZE.PREMIUM_PLAN + 1) * 1024 * 1024;
      // Only if this doesn't exceed MAX_DOCUMENT_SIZE
      if (MAXIMUM_FILE_SIZE.PREMIUM_PLAN < MAX_DOCUMENT_SIZE) {
        const result = uploadService.checkUploadBySize(fileSizeBytes, true);

        expect(result.allowedUpload).toBe(false);
        expect(result.maxSizeAllow).toBe(MAXIMUM_FILE_SIZE.PREMIUM_PLAN);
      }
    });

    it('should allow upload for free plan within free limit', () => {
      const fileSizeBytes = (MAXIMUM_FILE_SIZE.FREE_PLAN - 1) * 1024 * 1024;

      const result = uploadService.checkUploadBySize(fileSizeBytes, false);

      expect(result).toEqual({
        allowedUpload: true,
        maxSizeAllow: MAXIMUM_FILE_SIZE.FREE_PLAN,
      });
    });

    it('should not allow upload for free plan exceeding free limit', () => {
      const fileSizeBytes = (MAXIMUM_FILE_SIZE.FREE_PLAN + 1) * 1024 * 1024;

      const result = uploadService.checkUploadBySize(fileSizeBytes, false);

      expect(result.allowedUpload).toBe(false);
      expect(result.maxSizeAllow).toBe(MAXIMUM_FILE_SIZE.FREE_PLAN);
    });

    it('should allow small file for both plans', () => {
      const smallFileSize = 1 * 1024 * 1024; // 1MB

      const resultFree = uploadService.checkUploadBySize(smallFileSize, false);
      const resultPremium = uploadService.checkUploadBySize(smallFileSize, true);

      expect(resultFree.allowedUpload).toBe(true);
      expect(resultPremium.allowedUpload).toBe(true);
    });

    it('should handle zero file size', () => {
      const result = uploadService.checkUploadBySize(0, false);

      expect(result.allowedUpload).toBe(true);
    });
  });

  describe('getFileSize', () => {
    it('should get file size from Dropbox', async () => {
      const mockFileInfo = { data: { size: 12345 } };
      dropboxServices.getFileMetaData.mockResolvedValue(mockFileInfo);

      const result = await uploadService.getFileSize({
        remoteId: 'dropbox-file-id',
        service: documentStorage.dropbox,
        size: 0,
      });

      expect(dropboxServices.getFileMetaData).toHaveBeenCalledWith('dropbox-file-id');
      expect(result).toBe(12345);
    });

    it('should get file size from Google Drive', async () => {
      const mockFileInfo = { size: 67890 };
      googleServices.getFileInfo.mockResolvedValue(mockFileInfo);

      const result = await uploadService.getFileSize({
        remoteId: 'google-file-id',
        service: documentStorage.google,
        size: 0,
      });

      expect(googleServices.getFileInfo).toHaveBeenCalledWith('google-file-id', '*', 'getFileSize');
      expect(result).toBe(67890);
    });

    it('should return provided size for unknown service', async () => {
      const result = await uploadService.getFileSize({
        remoteId: 'unknown-file-id',
        service: 'unknown',
        size: 99999,
      });

      expect(result).toBe(99999);
    });

    it('should return provided size for S3 service', async () => {
      const result = await uploadService.getFileSize({
        remoteId: 's3-file-id',
        service: 's3',
        size: 54321,
      });

      expect(result).toBe(54321);
    });
  });

  describe('handleUploadDocumentToPersonal', () => {
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const mockThumbnail = new File(['thumb'], 'thumb.jpg', { type: 'image/jpeg' });
    const mockPersonalData = {
      file: mockFile,
      thumbnail: mockThumbnail,
      folderId: 'folder-123',
      clientId: 'client-456',
    };

    beforeEach(() => {
      documentServices.uploadDocumentWithThumbnailToS3.mockResolvedValue({
        thumbnail: { fields: { key: 'thumbnail-key' } },
        document: { fields: { key: 'document-key' } },
        encodedUploadData: 'encoded-data',
      });
      Axios.axiosInstance = {
        post: jest.fn().mockResolvedValue({ data: { documentId: 'new-doc-id' } }),
      };
    });

    it('should upload document with thumbnail to S3', async () => {
      const result = await uploadService.handleUploadDocumentToPersonal(mockPersonalData);

      expect(documentServices.uploadDocumentWithThumbnailToS3).toHaveBeenCalledWith({
        file: mockFile,
        thumbnail: mockThumbnail,
      });
      expect(Axios.axiosInstance.post).toHaveBeenCalledWith(
        '/document/v2/upload',
        expect.objectContaining({
          folderId: 'folder-123',
          fileRemoteId: 'document-key',
          clientId: 'client-456',
          fileName: 'test.pdf',
          encodedUploadData: 'encoded-data',
          thumbnailRemoteId: 'thumbnail-key',
        })
      );
      expect(result).toEqual({ documentId: 'new-doc-id' });
    });

    it('should handle upload without thumbnail', async () => {
      documentServices.uploadDocumentWithThumbnailToS3.mockResolvedValue({
        thumbnail: null,
        document: { fields: { key: 'document-key' } },
        encodedUploadData: 'encoded-data',
      });

      await uploadService.handleUploadDocumentToPersonal({
        ...mockPersonalData,
        thumbnail: null,
      });

      expect(Axios.axiosInstance.post).toHaveBeenCalledWith(
        '/document/v2/upload',
        expect.not.objectContaining({
          thumbnailRemoteId: expect.any(String),
        })
      );
    });
  });

  describe('getDocumentInstanceFromFile', () => {
    it('should create document instance from file', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockDocInstance = { id: 'doc-instance' };
      fileUtils.getDocumentInstanceWithFile.mockResolvedValue(mockDocInstance);

      const result = await uploadService.getDocumentInstanceFromFile(mockFile);

      expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
      expect(fileUtils.getDocumentInstanceWithFile).toHaveBeenCalledWith(
        'blob:mock-url',
        mockFile,
        expect.any(Function)
      );
      expect(result).toEqual({
        documentInstance: mockDocInstance,
        objectURL: 'blob:mock-url',
      });
    });
  });

  describe('Constants', () => {
    it('should have TEMPLATE_HANDLER constant', () => {
      expect(uploadService.TEMPLATE_HANDLER).toBe('upload_template_handler');
    });

    it('should have DOCUMENT_HANDLER constant', () => {
      expect(uploadService.DOCUMENT_HANDLER).toBe('upload_document_handler');
    });
  });
});
