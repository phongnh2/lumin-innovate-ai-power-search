import { renderHook, waitFor } from '@testing-library/react';

import { MergeDocumentType } from '../../types';
import { useLoadDocument } from '../useLoadDocument';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('actions', () => ({
  __esModule: true,
  default: {
    openElement: jest.fn((el) => ({ type: 'OPEN_ELEMENT', payload: el })),
    closeElement: jest.fn((el) => ({ type: 'CLOSE_ELEMENT', payload: el })),
    setPasswordProtectedDocumentName: jest.fn((name) => ({ type: 'SET_PASSWORD_NAME', payload: name })),
    setPasswordAttempts: jest.fn((attempts) => ({ type: 'SET_PASSWORD_ATTEMPTS', payload: attempts })),
  },
}));

jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
  },
}));

jest.mock('../../core/loadDocument', () => ({
  LoadDocumentHandler: jest.fn().mockImplementation(() => ({
    setItems: jest.fn().mockReturnThis(),
    setAbortSignal: jest.fn().mockReturnThis(),
    setOnSetupPasswordHandler: jest.fn().mockReturnThis(),
    setOnLoadDocumentComplete: jest.fn().mockReturnThis(),
    setOnError: jest.fn().mockReturnThis(),
    handle: jest.fn().mockResolvedValue([]),
  })),
}));

jest.mock('../../enum', () => ({
  FileSource: { LUMIN: 'lumin', GOOGLE: 'google', LOCAL: 'local' },
  UploadStatus: { UPLOADING: 'uploading', UPLOADED: 'uploaded', FAILED: 'failed' },
}));

describe('useLoadDocument', () => {
  const mockDispatch = jest.fn();
  const mockSetDocuments = jest.fn();
  const mockSetIsLoadingDocument = jest.fn();
  const mockGetAbortController = jest.fn(() => new AbortController());

  beforeEach(() => {
    jest.clearAllMocks();
    const { useDispatch } = require('react-redux');
    useDispatch.mockReturnValue(mockDispatch);
  });

  const defaultProps = {
    documents: [] as MergeDocumentType[],
    getAbortController: mockGetAbortController,
    setDocuments: mockSetDocuments,
    setIsLoadingDocument: mockSetIsLoadingDocument,
  };

  describe('when no uploading documents', () => {
    it('should not call LoadDocumentHandler when there are no uploading documents', async () => {
      const { LoadDocumentHandler } = require('../../core/loadDocument');

      const uploadedDocs: MergeDocumentType[] = [
        { _id: '1', status: 'uploaded', name: 'doc.pdf', source: 'lumin', mimeType: 'application/pdf', size: 1024 },
      ];
      renderHook(() =>
        useLoadDocument({
          ...defaultProps,
          documents: uploadedDocs,
        })
      );

      await waitFor(() => {
        expect(mockSetIsLoadingDocument).toHaveBeenCalledWith(false);
      });

      // Handler is instantiated but handle() returns early due to no uploading docs
      expect(LoadDocumentHandler).not.toHaveBeenCalled();
    });

    it('should call setIsLoadingDocument(false) in finally block', async () => {
      renderHook(() => useLoadDocument(defaultProps));

      await waitFor(() => {
        expect(mockSetIsLoadingDocument).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('when there are uploading documents', () => {
    const uploadingDocuments: MergeDocumentType[] = [
      {
        _id: 'doc-1',
        status: 'uploading',
        name: 'test.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        source: 'local',
        file: new File([''], 'test.pdf'),
        remoteId: undefined,
      },
    ];

    it('should create LoadDocumentHandler and call handle', async () => {
      const { LoadDocumentHandler } = require('../../core/loadDocument');
      const mockHandle = jest.fn().mockResolvedValue([]);
      const mockHandler = {
        setItems: jest.fn().mockReturnThis(),
        setAbortSignal: jest.fn().mockReturnThis(),
        setOnSetupPasswordHandler: jest.fn().mockReturnThis(),
        setOnLoadDocumentComplete: jest.fn().mockReturnThis(),
        setOnError: jest.fn().mockReturnThis(),
        handle: mockHandle,
      };
      LoadDocumentHandler.mockImplementation(() => mockHandler);

      renderHook(() =>
        useLoadDocument({
          ...defaultProps,
          documents: uploadingDocuments,
        })
      );

      await waitFor(() => {
        expect(LoadDocumentHandler).toHaveBeenCalled();
        expect(mockHandler.setItems).toHaveBeenCalledWith([
          {
            _id: 'doc-1',
            file: expect.any(File),
            source: 'local',
            name: 'test.pdf',
            remoteId: undefined,
          },
        ]);
        expect(mockHandle).toHaveBeenCalled();
      });
    });

    it('should update documents when loadedDocuments are returned', async () => {
      const { LoadDocumentHandler } = require('../../core/loadDocument');
      const loadedDocument: Partial<MergeDocumentType> = {
        _id: 'doc-1',
        buffer: new ArrayBuffer(8),
        thumbnail: 'new-thumb',
        status: 'uploaded',
        metadata: undefined,
      };
      const mockHandler = {
        setItems: jest.fn().mockReturnThis(),
        setAbortSignal: jest.fn().mockReturnThis(),
        setOnSetupPasswordHandler: jest.fn().mockReturnThis(),
        setOnLoadDocumentComplete: jest.fn().mockReturnThis(),
        setOnError: jest.fn().mockReturnThis(),
        handle: jest.fn().mockResolvedValue([loadedDocument]),
      };
      LoadDocumentHandler.mockImplementation(() => mockHandler);

      renderHook(() =>
        useLoadDocument({
          ...defaultProps,
          documents: uploadingDocuments,
        })
      );

      await waitFor(() => {
        expect(mockSetDocuments).toHaveBeenCalled();
      });
    });

    it('should use abort signal from getAbortController', async () => {
      const { LoadDocumentHandler } = require('../../core/loadDocument');
      const mockAbortController = new AbortController();
      const customGetAbortController = jest.fn(() => mockAbortController);

      const mockHandler = {
        setItems: jest.fn().mockReturnThis(),
        setAbortSignal: jest.fn().mockReturnThis(),
        setOnSetupPasswordHandler: jest.fn().mockReturnThis(),
        setOnLoadDocumentComplete: jest.fn().mockReturnThis(),
        setOnError: jest.fn().mockReturnThis(),
        handle: jest.fn().mockResolvedValue([]),
      };
      LoadDocumentHandler.mockImplementation(() => mockHandler);

      renderHook(() =>
        useLoadDocument({
          ...defaultProps,
          documents: uploadingDocuments,
          getAbortController: customGetAbortController,
        })
      );

      await waitFor(() => {
        expect(customGetAbortController).toHaveBeenCalled();
        expect(mockHandler.setAbortSignal).toHaveBeenCalledWith(mockAbortController.signal);
      });
    });
  });

  describe('error handling', () => {
    it('should log error when loadDocuments fails', async () => {
      const logger = require('helpers/logger').default;
      const { LoadDocumentHandler } = require('../../core/loadDocument');
      const testError = new Error('Load failed');

      const mockHandler = {
        setItems: jest.fn().mockReturnThis(),
        setAbortSignal: jest.fn().mockReturnThis(),
        setOnSetupPasswordHandler: jest.fn().mockReturnThis(),
        setOnLoadDocumentComplete: jest.fn().mockReturnThis(),
        setOnError: jest.fn().mockReturnThis(),
        handle: jest.fn().mockRejectedValue(testError),
      };
      LoadDocumentHandler.mockImplementation(() => mockHandler);

      const errorDocs: MergeDocumentType[] = [
        { _id: '1', status: 'uploading', name: 'test.pdf', source: 'local', mimeType: 'application/pdf', size: 1024 },
      ];
      renderHook(() =>
        useLoadDocument({
          ...defaultProps,
          documents: errorDocs,
        })
      );

      await waitFor(() => {
        expect(logger.logError).toHaveBeenCalled();
        expect(mockSetIsLoadingDocument).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('password modal handling', () => {
    it('should dispatch password modal actions via setOnSetupPasswordHandler', async () => {
      const { LoadDocumentHandler } = require('../../core/loadDocument');
      let capturedSetupHandler: (params: { attempt: number; name: string }) => void;

      type MockHandler = {
        setItems: jest.Mock;
        setAbortSignal: jest.Mock;
        setOnSetupPasswordHandler: jest.Mock;
        setOnLoadDocumentComplete: jest.Mock;
        setOnError: jest.Mock;
        handle: jest.Mock;
      };

      const mockHandler: MockHandler = {
        setItems: jest.fn().mockReturnThis(),
        setAbortSignal: jest.fn().mockReturnThis(),
        setOnSetupPasswordHandler: jest.fn((handler: (params: { attempt: number; name: string }) => void): MockHandler => {
          capturedSetupHandler = handler;
          return mockHandler;
        }),
        setOnLoadDocumentComplete: jest.fn().mockReturnThis(),
        setOnError: jest.fn().mockReturnThis(),
        handle: jest.fn().mockResolvedValue([]),
      };
      LoadDocumentHandler.mockImplementation(() => mockHandler);

      const passwordDocs: MergeDocumentType[] = [
        { _id: '1', status: 'uploading', name: 'test.pdf', source: 'local', mimeType: 'application/pdf', size: 1024 },
      ];
      renderHook(() =>
        useLoadDocument({
          ...defaultProps,
          documents: passwordDocs,
        })
      );

      await waitFor(() => {
        expect(mockHandler.setOnSetupPasswordHandler).toHaveBeenCalled();
      });

      // Simulate password setup callback
      capturedSetupHandler!({ attempt: 1, name: 'protected.pdf' });

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'OPEN_ELEMENT', payload: expect.anything() });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_PASSWORD_NAME', payload: 'protected.pdf' });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_PASSWORD_ATTEMPTS', payload: 1 });
    });

    it('should dispatch close password modal actions via setOnLoadDocumentComplete', async () => {
      const { LoadDocumentHandler } = require('../../core/loadDocument');
      let capturedLoadCompleteHandler: () => void;

      const mockHandler = {
        setItems: jest.fn().mockReturnThis(),
        setAbortSignal: jest.fn().mockReturnThis(),
        setOnSetupPasswordHandler: jest.fn().mockReturnThis(),
        setOnLoadDocumentComplete: jest.fn((handler: () => void) => {
          capturedLoadCompleteHandler = handler;
          return mockHandler;
        }),
        setOnError: jest.fn().mockReturnThis(),
        handle: jest.fn().mockResolvedValue([]),
      };
      LoadDocumentHandler.mockImplementation(() => mockHandler);

      const docs: MergeDocumentType[] = [
        { _id: '1', status: 'uploading', name: 'test.pdf', source: 'local', mimeType: 'application/pdf', size: 1024 },
      ];
      renderHook(() =>
        useLoadDocument({
          ...defaultProps,
          documents: docs,
        })
      );

      await waitFor(() => {
        expect(mockHandler.setOnLoadDocumentComplete).toHaveBeenCalled();
      });

      // Simulate load complete callback
      capturedLoadCompleteHandler!();

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_ELEMENT', payload: expect.anything() });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_PASSWORD_NAME', payload: '' });
    });

    it('should log error via setOnError callback', async () => {
      const logger = require('helpers/logger').default;
      const { LoadDocumentHandler } = require('../../core/loadDocument');
      let capturedErrorHandler: (error: Error) => void;

      const mockHandler = {
        setItems: jest.fn().mockReturnThis(),
        setAbortSignal: jest.fn().mockReturnThis(),
        setOnSetupPasswordHandler: jest.fn().mockReturnThis(),
        setOnLoadDocumentComplete: jest.fn().mockReturnThis(),
        setOnError: jest.fn((handler: (error: Error) => void) => {
          capturedErrorHandler = handler;
          return mockHandler;
        }),
        handle: jest.fn().mockResolvedValue([]),
      };
      LoadDocumentHandler.mockImplementation(() => mockHandler);

      const docs: MergeDocumentType[] = [
        { _id: '1', status: 'uploading', name: 'test.pdf', source: 'local', mimeType: 'application/pdf', size: 1024 },
      ];
      renderHook(() =>
        useLoadDocument({
          ...defaultProps,
          documents: docs,
        })
      );

      await waitFor(() => {
        expect(mockHandler.setOnError).toHaveBeenCalled();
      });

      // Simulate error callback
      const testError = new Error('Document load error');
      capturedErrorHandler!(testError);

      expect(logger.logError).toHaveBeenCalledWith({
        reason: expect.any(String),
        error: testError,
      });
    });
  });

  describe('document update edge cases', () => {
    it('should skip document update when loaded document id not found in documents', async () => {
      const { LoadDocumentHandler } = require('../../core/loadDocument');
      const loadedDocument: Partial<MergeDocumentType> = {
        _id: 'non-existent-id',
        buffer: new ArrayBuffer(8),
        thumbnail: 'thumb',
        status: 'uploaded',
      };
      const mockHandler = {
        setItems: jest.fn().mockReturnThis(),
        setAbortSignal: jest.fn().mockReturnThis(),
        setOnSetupPasswordHandler: jest.fn().mockReturnThis(),
        setOnLoadDocumentComplete: jest.fn().mockReturnThis(),
        setOnError: jest.fn().mockReturnThis(),
        handle: jest.fn().mockResolvedValue([loadedDocument]),
      };
      LoadDocumentHandler.mockImplementation(() => mockHandler);

      const docs: MergeDocumentType[] = [
        { _id: 'existing-id', status: 'uploading', name: 'test.pdf', source: 'local', mimeType: 'application/pdf', size: 1024 },
      ];
      renderHook(() =>
        useLoadDocument({
          ...defaultProps,
          documents: docs,
        })
      );

      await waitFor(() => {
        expect(mockSetDocuments).toHaveBeenCalled();
      });

      // Verify setDocuments was called - the produce will return updated documents array
      const setDocumentsCall = mockSetDocuments.mock.calls[0][0];
      expect(Array.isArray(setDocumentsCall)).toBe(true);
    });

    it('should update file for Google source documents', async () => {
      const { LoadDocumentHandler } = require('../../core/loadDocument');
      const googleFile = new File(['google content'], 'google.pdf');
      const loadedDocument: Partial<MergeDocumentType> = {
        _id: 'google-doc',
        buffer: new ArrayBuffer(8),
        thumbnail: 'thumb',
        status: 'uploaded',
        file: googleFile,
      };
      const mockHandler = {
        setItems: jest.fn().mockReturnThis(),
        setAbortSignal: jest.fn().mockReturnThis(),
        setOnSetupPasswordHandler: jest.fn().mockReturnThis(),
        setOnLoadDocumentComplete: jest.fn().mockReturnThis(),
        setOnError: jest.fn().mockReturnThis(),
        handle: jest.fn().mockResolvedValue([loadedDocument]),
      };
      LoadDocumentHandler.mockImplementation(() => mockHandler);

      const googleDocs: MergeDocumentType[] = [
        {
          _id: 'google-doc',
          status: 'uploading',
          name: 'google.pdf',
          source: 'google',
          mimeType: 'application/pdf',
          size: 1024,
        },
      ];
      renderHook(() =>
        useLoadDocument({
          ...defaultProps,
          documents: googleDocs,
        })
      );

      await waitFor(() => {
        expect(mockSetDocuments).toHaveBeenCalled();
      });

      // Verify setDocuments was called with updated documents array including file for Google source
      const setDocumentsCall = mockSetDocuments.mock.calls[0][0];
      expect(Array.isArray(setDocumentsCall)).toBe(true);
      expect(setDocumentsCall[0].file).toBe(googleFile);
    });
  });
});

