import { LoadDocumentHandler } from '../loadDocument';
import { DocumentItemFactory } from '../documentItem/factory';
import { FileSource } from '../../enum';

jest.mock('core', () => ({
  __esModule: true,
  default: {
    loadFullApi: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('helpers/sequentialRequestBuilder', () => ({
  __esModule: true,
  default: jest.fn((list, handler) => Promise.all(list.map(handler))),
}));

jest.mock('../documentItem/factory', () => ({
  DocumentItemFactory: {
    createDocumentItem: jest.fn(),
  },
}));

describe('LoadDocumentHandler', () => {
  const mockCore = require('core').default;
  const mockSequentialRequestBuilder = require('helpers/sequentialRequestBuilder').default;
  const mockCreateDocumentItem = DocumentItemFactory.createDocumentItem as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations to default
    mockCore.loadFullApi.mockResolvedValue(undefined);
    mockSequentialRequestBuilder.mockImplementation((list: unknown[], handler: (item: unknown) => Promise<unknown>) =>
      Promise.all(list.map(handler))
    );
  });

  describe('setter methods', () => {
    it('should return this from setItems for method chaining', () => {
      const handler = new LoadDocumentHandler();
      const result = handler.setItems([]);
      expect(result).toBe(handler);
    });

    it('should return this from setAbortSignal for method chaining', () => {
      const handler = new LoadDocumentHandler();
      const abortController = new AbortController();
      const result = handler.setAbortSignal(abortController.signal);
      expect(result).toBe(handler);
    });

    it('should return this from setDocumentIdAbortControllers for method chaining', () => {
      const handler = new LoadDocumentHandler();
      const controllers = new Map<string, AbortController>();
      const result = handler.setDocumentIdAbortControllers(controllers);
      expect(result).toBe(handler);
    });

    it('should return this from setOnSetupPasswordHandler for method chaining', () => {
      const handler = new LoadDocumentHandler();
      const result = handler.setOnSetupPasswordHandler(jest.fn());
      expect(result).toBe(handler);
    });

    it('should return this from setOnLoadDocumentComplete for method chaining', () => {
      const handler = new LoadDocumentHandler();
      const result = handler.setOnLoadDocumentComplete(jest.fn());
      expect(result).toBe(handler);
    });

    it('should return this from setOnError for method chaining', () => {
      const handler = new LoadDocumentHandler();
      const result = handler.setOnError(jest.fn());
      expect(result).toBe(handler);
    });
  });

  describe('handle method', () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const mockDocuments = [
      { _id: 'doc-1', remoteId: 'remote-1', file: mockFile, source: FileSource.LOCAL, name: 'test.pdf' },
    ];

    it('should call core.loadFullApi before processing documents', async () => {
      const mockDocumentItem = {
        getDocumentData: jest.fn().mockResolvedValue({ _id: 'doc-1', buffer: new ArrayBuffer(8) }),
      };
      mockCreateDocumentItem.mockReturnValue(mockDocumentItem);

      const handler = new LoadDocumentHandler();
      handler.setItems(mockDocuments);

      await handler.handle();

      expect(mockCore.loadFullApi).toHaveBeenCalledTimes(1);
    });

    it('should process documents using sequentialRequestBuilder', async () => {
      const mockDocumentItem = {
        getDocumentData: jest.fn().mockResolvedValue({ _id: 'doc-1', buffer: new ArrayBuffer(8) }),
      };
      mockCreateDocumentItem.mockReturnValue(mockDocumentItem);

      const handler = new LoadDocumentHandler();
      handler.setItems(mockDocuments);

      await handler.handle();

      expect(mockSequentialRequestBuilder).toHaveBeenCalledWith(mockDocuments, expect.any(Function));
    });

    it('should pass correct parameters to DocumentItemFactory', async () => {
      const mockOnError = jest.fn();
      const mockOnLoadDocumentComplete = jest.fn();
      const mockOnSetupPasswordHandler = jest.fn();
      const mockDocumentItem = {
        getDocumentData: jest.fn().mockResolvedValue({ _id: 'doc-1', buffer: new ArrayBuffer(8) }),
      };
      mockCreateDocumentItem.mockReturnValue(mockDocumentItem);

      const handler = new LoadDocumentHandler();
      handler
        .setItems(mockDocuments)
        .setOnError(mockOnError)
        .setOnLoadDocumentComplete(mockOnLoadDocumentComplete)
        .setOnSetupPasswordHandler(mockOnSetupPasswordHandler);

      await handler.handle();

      expect(mockCreateDocumentItem).toHaveBeenCalledWith({
        mergeItem: {
          _id: 'doc-1',
          remoteId: 'remote-1',
          file: mockFile,
          name: 'test.pdf',
          source: FileSource.LOCAL,
        },
        onError: mockOnError,
        onLoadDocumentComplete: mockOnLoadDocumentComplete,
        onSetupPasswordHandler: mockOnSetupPasswordHandler,
      });
    });

    it('should return document data when documentItem is created', async () => {
      const mockDocumentData = { _id: 'doc-1', buffer: new ArrayBuffer(8), thumbnail: 'thumb' };
      const mockDocumentItem = {
        getDocumentData: jest.fn().mockResolvedValue(mockDocumentData),
      };
      mockCreateDocumentItem.mockReturnValue(mockDocumentItem);

      const handler = new LoadDocumentHandler();
      handler.setItems(mockDocuments);

      const result = await handler.handle();

      expect(mockDocumentItem.getDocumentData).toHaveBeenCalled();
      expect(result).toEqual([mockDocumentData]);
    });

    it('should return null when documentItem is null', async () => {
      mockCreateDocumentItem.mockReturnValue(null);

      const handler = new LoadDocumentHandler();
      handler.setItems(mockDocuments);

      const result = await handler.handle();

      expect(result).toEqual([null]);
    });

    describe('abort signal handling', () => {
      it('should throw abort reason when global abortSignal is aborted', async () => {
        const abortController = new AbortController();
        const abortReason = new Error('User cancelled');
        abortController.abort(abortReason);

        const handler = new LoadDocumentHandler();
        handler.setItems(mockDocuments).setAbortSignal(abortController.signal);

        await expect(handler.handle()).rejects.toThrow('Failed to load document');
      });

      it('should throw abort reason when document-specific abort signal is aborted', async () => {
        const globalAbortController = new AbortController();
        const documentAbortController = new AbortController();
        const abortReason = new Error('Document cancelled');
        documentAbortController.abort(abortReason);

        const documentIdAbortControllers = new Map<string, AbortController>();
        documentIdAbortControllers.set('doc-1', documentAbortController);

        const handler = new LoadDocumentHandler();
        handler
          .setItems(mockDocuments)
          .setAbortSignal(globalAbortController.signal)
          .setDocumentIdAbortControllers(documentIdAbortControllers);

        await expect(handler.handle()).rejects.toThrow('Failed to load document');
      });

      it('should process document when abort signals are not aborted', async () => {
        const globalAbortController = new AbortController();
        const documentAbortController = new AbortController();

        const documentIdAbortControllers = new Map<string, AbortController>();
        documentIdAbortControllers.set('doc-1', documentAbortController);

        const mockDocumentData = { _id: 'doc-1', buffer: new ArrayBuffer(8) };
        const mockDocumentItem = {
          getDocumentData: jest.fn().mockResolvedValue(mockDocumentData),
        };
        mockCreateDocumentItem.mockReturnValue(mockDocumentItem);

        const handler = new LoadDocumentHandler();
        handler
          .setItems(mockDocuments)
          .setAbortSignal(globalAbortController.signal)
          .setDocumentIdAbortControllers(documentIdAbortControllers);

        const result = await handler.handle();

        expect(result).toEqual([mockDocumentData]);
      });

      it('should handle when documentIdAbortControllers does not have the document id', async () => {
        const globalAbortController = new AbortController();
        const documentIdAbortControllers = new Map<string, AbortController>();
        // Not setting 'doc-1' in the map

        const mockDocumentData = { _id: 'doc-1', buffer: new ArrayBuffer(8) };
        const mockDocumentItem = {
          getDocumentData: jest.fn().mockResolvedValue(mockDocumentData),
        };
        mockCreateDocumentItem.mockReturnValue(mockDocumentItem);

        const handler = new LoadDocumentHandler();
        handler
          .setItems(mockDocuments)
          .setAbortSignal(globalAbortController.signal)
          .setDocumentIdAbortControllers(documentIdAbortControllers);

        const result = await handler.handle();

        expect(result).toEqual([mockDocumentData]);
      });

      it('should handle when abortSignal is undefined', async () => {
        const mockDocumentData = { _id: 'doc-1', buffer: new ArrayBuffer(8) };
        const mockDocumentItem = {
          getDocumentData: jest.fn().mockResolvedValue(mockDocumentData),
        };
        mockCreateDocumentItem.mockReturnValue(mockDocumentItem);

        const handler = new LoadDocumentHandler();
        handler.setItems(mockDocuments);

        const result = await handler.handle();

        expect(result).toEqual([mockDocumentData]);
      });

      it('should handle when documentIdAbortControllers is undefined', async () => {
        const globalAbortController = new AbortController();

        const mockDocumentData = { _id: 'doc-1', buffer: new ArrayBuffer(8) };
        const mockDocumentItem = {
          getDocumentData: jest.fn().mockResolvedValue(mockDocumentData),
        };
        mockCreateDocumentItem.mockReturnValue(mockDocumentItem);

        const handler = new LoadDocumentHandler();
        handler.setItems(mockDocuments).setAbortSignal(globalAbortController.signal);

        const result = await handler.handle();

        expect(result).toEqual([mockDocumentData]);
      });
    });

    describe('error handling', () => {
      it('should wrap error with "Failed to load document" message', async () => {
        const originalError = new Error('Network error');
        mockCore.loadFullApi.mockRejectedValue(originalError);

        const handler = new LoadDocumentHandler();
        handler.setItems(mockDocuments);

        await expect(handler.handle()).rejects.toThrow('Failed to load document');
      });

      it('should include original error as cause', async () => {
        const originalError = new Error('Network error');
        mockCore.loadFullApi.mockRejectedValue(originalError);

        const handler = new LoadDocumentHandler();
        handler.setItems(mockDocuments);

        try {
          await handler.handle();
        } catch (error) {
          expect((error as Error).cause).toBe(originalError);
        }
      });

      it('should wrap sequentialRequestBuilder errors', async () => {
        const originalError = new Error('Processing error');
        mockSequentialRequestBuilder.mockRejectedValue(originalError);

        const handler = new LoadDocumentHandler();
        handler.setItems(mockDocuments);

        await expect(handler.handle()).rejects.toThrow('Failed to load document');
      });
    });

    describe('multiple documents', () => {
      it('should process multiple documents', async () => {
        const mockFile1 = new File(['test1'], 'test1.pdf', { type: 'application/pdf' });
        const mockFile2 = new File(['test2'], 'test2.pdf', { type: 'application/pdf' });
        const multipleDocuments = [
          { _id: 'doc-1', file: mockFile1, source: FileSource.LOCAL, name: 'test1.pdf' },
          { _id: 'doc-2', file: mockFile2, source: FileSource.GOOGLE, name: 'test2.pdf', remoteId: 'remote-2' },
        ];

        const mockDocumentItem1 = {
          getDocumentData: jest.fn().mockResolvedValue({ _id: 'doc-1', buffer: new ArrayBuffer(8) }),
        };
        const mockDocumentItem2 = {
          getDocumentData: jest.fn().mockResolvedValue({ _id: 'doc-2', buffer: new ArrayBuffer(16) }),
        };

        mockCreateDocumentItem
          .mockReturnValueOnce(mockDocumentItem1)
          .mockReturnValueOnce(mockDocumentItem2);

        const handler = new LoadDocumentHandler();
        handler.setItems(multipleDocuments);

        const result = await handler.handle();

        expect(result).toHaveLength(2);
        expect(mockCreateDocumentItem).toHaveBeenCalledTimes(2);
      });
    });

    describe('default callback handlers', () => {
      it('should use default callbacks when not set', async () => {
        const mockDocumentItem = {
          getDocumentData: jest.fn().mockResolvedValue({ _id: 'doc-1', buffer: new ArrayBuffer(8) }),
        };
        mockCreateDocumentItem.mockReturnValue(mockDocumentItem);

        const handler = new LoadDocumentHandler();
        handler.setItems(mockDocuments);

        // Should not throw when callbacks are not set (default empty functions)
        const result = await handler.handle();
        expect(result).toBeDefined();
        expect(mockCreateDocumentItem).toHaveBeenCalledWith(
          expect.objectContaining({
            onError: expect.any(Function),
            onLoadDocumentComplete: expect.any(Function),
            onSetupPasswordHandler: expect.any(Function),
          })
        );
      });
    });
  });
});
