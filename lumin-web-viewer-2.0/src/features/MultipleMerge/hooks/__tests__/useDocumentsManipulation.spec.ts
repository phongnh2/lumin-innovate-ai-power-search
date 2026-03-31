import { renderHook, act } from '@testing-library/react';
import { v4 } from 'uuid';

import { reorder } from 'features/MultipleMerge/utils/documentsManipulation';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { FileSource, UploadDocumentError, UploadStatus } from '../../enum';
import { useDocumentsManipulation } from '../useDocumentsManipulation';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

jest.mock('../../utils/documentsManipulation', () => ({
  reorder: jest.fn(),
}));

jest.mock('../../constants', () => ({
  SUPPORTED_FILE_TYPES: ['application/pdf', 'image/jpeg'],
}));

// Mocking enum values to ensure test stability if the real enums change
jest.mock('../../enum', () => ({
  FileSource: { LUMIN: 'LUMIN', GOOGLE: 'GOOGLE' },
  UploadDocumentError: {
    FILE_INVALID_TYPE: 'FILE_INVALID_TYPE',
    DOCUMENT_PERMISSION_DENIED: 'DOCUMENT_PERMISSION_DENIED',
  },
  UploadStatus: {
    UPLOADED: 'UPLOADED',
    FAILED: 'FAILED',
    UPLOADING: 'UPLOADING',
  },
}));

describe('useDocumentsManipulation', () => {
  const mockSetIsLoadingDocument = jest.fn();
  const mockUuid = v4 as jest.Mock;

  const validDoc: IDocumentBase = {
    _id: 'remote-doc-1',
    name: 'valid.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    thumbnail: 'thumb-url',
    capabilities: { canMerge: true },
  } as IDocumentBase;

  const invalidTypeDoc: IDocumentBase = {
    _id: 'remote-doc-2',
    name: 'invalid.txt',
    mimeType: 'text/plain',
    size: 500,
    thumbnail: null,
    capabilities: { canMerge: true },
  } as IDocumentBase;

  const noPermissionDoc: IDocumentBase = {
    _id: 'remote-doc-3',
    name: 'locked.pdf',
    mimeType: 'application/pdf',
    size: 2048,
    thumbnail: null,
    capabilities: { canMerge: false },
  } as IDocumentBase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUuid.mockReturnValue('mock-uuid-default');
  });

  describe('Initialization', () => {
    it('should initialize with valid supported documents correctly', () => {
      mockUuid.mockReturnValueOnce('generated-id-1');

      const { result } = renderHook(() =>
        useDocumentsManipulation({
          initialDocuments: [validDoc],
          setIsLoadingDocument: mockSetIsLoadingDocument,
        })
      );

      expect(result.current.documents).toHaveLength(1);
      expect(result.current.documents[0]).toEqual({
        _id: 'generated-id-1',
        remoteId: validDoc._id,
        name: validDoc.name,
        mimeType: validDoc.mimeType,
        size: validDoc.size,
        thumbnail: validDoc.thumbnail,
        status: UploadStatus.UPLOADED,
        source: FileSource.LUMIN,
        metadata: null,
      });
    });

    it('should mark unsupported file types as FAILED with correct error code', () => {
      mockUuid.mockReturnValueOnce('generated-id-2');

      const { result } = renderHook(() =>
        useDocumentsManipulation({
          initialDocuments: [invalidTypeDoc],
          setIsLoadingDocument: mockSetIsLoadingDocument,
        })
      );

      expect(result.current.documents[0].status).toBe(UploadStatus.FAILED);
      expect(result.current.documents[0].metadata).toEqual({
        errorCode: UploadDocumentError.FILE_INVALID_TYPE,
      });
    });

    it('should mark documents without merge permission as FAILED with correct error code', () => {
      mockUuid.mockReturnValueOnce('generated-id-3');

      const { result } = renderHook(() =>
        useDocumentsManipulation({
          initialDocuments: [noPermissionDoc],
          setIsLoadingDocument: mockSetIsLoadingDocument,
        })
      );

      expect(result.current.documents[0].status).toBe(UploadStatus.FAILED);
      expect(result.current.documents[0].metadata).toEqual({
        errorCode: UploadDocumentError.DOCUMENT_PERMISSION_DENIED,
      });
    });

    it('should handle mixed valid and invalid documents', () => {
      mockUuid.mockReturnValueOnce('id-1').mockReturnValueOnce('id-2');

      const { result } = renderHook(() =>
        useDocumentsManipulation({
          initialDocuments: [validDoc, invalidTypeDoc],
          setIsLoadingDocument: mockSetIsLoadingDocument,
        })
      );

      expect(result.current.documents).toHaveLength(2);
      expect(result.current.documents[0].status).toBe(UploadStatus.UPLOADED);
      expect(result.current.documents[1].status).toBe(UploadStatus.FAILED);
    });
  });

  describe('deleteDocument', () => {
    it('should remove the document with the specified ID', () => {
      mockUuid.mockReturnValueOnce('id-1').mockReturnValueOnce('id-2');
      const { result } = renderHook(() =>
        useDocumentsManipulation({
          initialDocuments: [validDoc, noPermissionDoc],
          setIsLoadingDocument: mockSetIsLoadingDocument,
        })
      );

      expect(result.current.documents).toHaveLength(2);

      act(() => {
        result.current.deleteDocument('id-1');
      });

      expect(result.current.documents).toHaveLength(1);
      expect(result.current.documents[0]._id).toBe('id-2');
    });

    it('should do nothing if the document ID does not exist', () => {
      mockUuid.mockReturnValueOnce('id-1');
      const { result } = renderHook(() =>
        useDocumentsManipulation({
          initialDocuments: [validDoc],
          setIsLoadingDocument: mockSetIsLoadingDocument,
        })
      );

      act(() => {
        result.current.deleteDocument('non-existent-id');
      });

      expect(result.current.documents).toHaveLength(1);
    });
  });

  describe('handleSortDocuments', () => {
    it('should not reorder if destination is null', () => {
      const { result } = renderHook(() =>
        useDocumentsManipulation({
          initialDocuments: [validDoc],
          setIsLoadingDocument: mockSetIsLoadingDocument,
        })
      );

      const dropResult: any = {
        destination: null,
        source: { index: 0 },
      };

      act(() => {
        result.current.handleSortDocuments(dropResult);
      });

      expect(reorder).not.toHaveBeenCalled();
    });

    it('should not reorder if destination index equals source index', () => {
      const { result } = renderHook(() =>
        useDocumentsManipulation({
          initialDocuments: [validDoc],
          setIsLoadingDocument: mockSetIsLoadingDocument,
        })
      );

      const dropResult: any = {
        destination: { index: 0 },
        source: { index: 0 },
      };

      act(() => {
        result.current.handleSortDocuments(dropResult);
      });

      expect(reorder).not.toHaveBeenCalled();
    });

    it('should reorder documents and update state correctly', () => {
      mockUuid.mockReturnValueOnce('id-1').mockReturnValueOnce('id-2');
      const { result } = renderHook(() =>
        useDocumentsManipulation({
          initialDocuments: [validDoc, validDoc], // Two docs to allow sorting
          setIsLoadingDocument: mockSetIsLoadingDocument,
        })
      );

      const reorderedList = [result.current.documents[1], result.current.documents[0]];
      (reorder as jest.Mock).mockReturnValue(reorderedList);

      const dropResult: any = {
        destination: { index: 1 },
        source: { index: 0 },
      };

      act(() => {
        result.current.handleSortDocuments(dropResult);
      });

      expect(reorder).toHaveBeenCalledWith(expect.anything(), 0, 1);
      expect(result.current.documents).toEqual(reorderedList);
    });
  });

  describe('handleUploadDocuments', () => {
    it('should handle file uploads correctly', () => {
      const { result } = renderHook(() =>
        useDocumentsManipulation({
          initialDocuments: [],
          setIsLoadingDocument: mockSetIsLoadingDocument,
        })
      );

      const mockFile = new File(['content'], 'new-file.pdf', { type: 'application/pdf' });
      Object.defineProperty(mockFile, 'size', { value: 1024 });

      mockUuid.mockReturnValue('new-upload-id');

      act(() => {
        result.current.handleUploadDocuments({
          files: [mockFile],
          fileRejections: [],
          source: FileSource.LUMIN,
        });
      });

      expect(mockSetIsLoadingDocument).toHaveBeenCalledWith(true);
      expect(result.current.documents).toHaveLength(1);
      expect(result.current.documents[0]).toEqual(
        expect.objectContaining({
          _id: 'new-upload-id',
          name: 'new-file.pdf',
          status: UploadStatus.UPLOADING,
          source: FileSource.LUMIN,
          mimeType: 'application/pdf',
          size: 1024,
          file: mockFile,
        })
      );
    });

    it('should handle file rejections correctly', () => {
      const { result } = renderHook(() =>
        useDocumentsManipulation({
          initialDocuments: [],
          setIsLoadingDocument: mockSetIsLoadingDocument,
        })
      );

      const mockFile = new File([''], 'bad.exe', { type: 'application/x-msdownload' });
      const rejection = {
        file: mockFile,
        errors: [{ code: 'file-invalid-type', message: 'Invalid type' }],
      };

      mockUuid.mockReturnValue('rejection-id');

      act(() => {
        result.current.handleUploadDocuments({
          files: [],
          fileRejections: [rejection as any],
          source: FileSource.LUMIN,
        });
      });

      expect(mockSetIsLoadingDocument).toHaveBeenCalledWith(true);
      expect(result.current.documents).toHaveLength(1);
      expect(result.current.documents[0]).toEqual(
        expect.objectContaining({
          _id: 'rejection-id',
          name: 'bad.exe',
          status: UploadStatus.FAILED,
          source: FileSource.LUMIN,
          metadata: { errorCode: 'file-invalid-type' },
        })
      );
    });

    it('should handle both files and rejections simultaneously', () => {
      const { result } = renderHook(() =>
        useDocumentsManipulation({
          initialDocuments: [],
          setIsLoadingDocument: mockSetIsLoadingDocument,
        })
      );

      mockUuid.mockReturnValueOnce('upload-id').mockReturnValueOnce('reject-id');

      const mockFile = new File([''], 'good.pdf', { type: 'application/pdf' });
      const mockRejectedFile = new File([''], 'bad.txt', { type: 'text/plain' });

      act(() => {
        result.current.handleUploadDocuments({
          files: [mockFile],
          fileRejections: [{ file: mockRejectedFile, errors: [{ code: 'bad-code' }] } as any],
          source: FileSource.LUMIN,
        });
      });

      expect(result.current.documents).toHaveLength(2);
      // Order: files first, then rejections based on implementation
      expect(result.current.documents[0]._id).toBe('upload-id');
      expect(result.current.documents[0].status).toBe(UploadStatus.UPLOADING);
      expect(result.current.documents[1]._id).toBe('reject-id');
      expect(result.current.documents[1].status).toBe(UploadStatus.FAILED);
    });
  });
});
