import { MergeHandler } from '../merge';
import { MergeItemFactory } from '../mergeItem/factory';
import { RemoteMergeItem } from '../mergeItem/remote';
import { FileSource, UploadStatus } from '../../enum';

jest.mock('core', () => ({
  __esModule: true,
  default: {
    loadFullApi: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('helpers/sequentialRequestBuilder', () => ({
  __esModule: true,
  default: jest.fn(async (list, handler) => {
    for (const item of list) {
      await handler(item);
    }
  }),
}));

jest.mock('../mergeItem/factory', () => ({
  MergeItemFactory: {
    createMergeItem: jest.fn(),
  },
}));

jest.mock('../mergeItem/remote', () => ({
  RemoteMergeItem: jest.fn(),
}));

describe('MergeHandler', () => {
  const mockCore = require('core').default;
  const mockSequentialRequestBuilder = require('helpers/sequentialRequestBuilder').default;
  const mockCreateMergeItem = MergeItemFactory.createMergeItem as jest.Mock;

  const createMockPdfDoc = (pageCount = 5) => ({
    getPageCount: jest.fn().mockResolvedValue(pageCount),
    insertPages: jest.fn().mockResolvedValue(undefined),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations to default - process sequentially for merge tests
    mockCore.loadFullApi.mockResolvedValue(undefined);
    mockSequentialRequestBuilder.mockImplementation(async (list: unknown[], handler: (item: unknown) => Promise<unknown>) => {
      for (const item of list) {
        await handler(item);
      }
    });
    // Reset window.Core mock - set on both global and window for compatibility
    const coreMock = {
      PDFNet: {
        PDFDoc: {
          InsertFlag: {
            e_insert_bookmark: 1,
          },
        },
      },
    };
    (global as unknown as { window: { Core: typeof coreMock } }).window = {
      Core: coreMock,
    };
    // Also set directly on window if it exists
    if (typeof window !== 'undefined') {
      (window as unknown as { Core: typeof coreMock }).Core = coreMock;
    }
  });

  describe('setter methods', () => {
    it('should return this from setItems for method chaining', () => {
      const handler = new MergeHandler();
      const result = handler.setItems([]);
      expect(result).toBe(handler);
    });

    it('should set abort signal', () => {
      const handler = new MergeHandler();
      const abortController = new AbortController();
      handler.setAbortSignal(abortController.signal);
      // No return value to check, but should not throw
    });

    it('should set onMergeItemComplete callback', () => {
      const handler = new MergeHandler();
      const callback = jest.fn();
      handler.setOnMergeItemComplete(callback);
      // No return value to check, but should not throw
    });

    it('should set onError callback', () => {
      const handler = new MergeHandler();
      const callback = jest.fn();
      handler.setOnError(callback);
      // No return value to check, but should not throw
    });

    it('should set onMergeComplete callback', () => {
      const handler = new MergeHandler();
      const callback = jest.fn();
      handler.setOnMergeComplete(callback);
      // No return value to check, but should not throw
    });

    it('should set onSetupPasswordHandler callback', () => {
      const handler = new MergeHandler();
      const callback = jest.fn();
      handler.setOnSetupPasswordHandler(callback);
      // No return value to check, but should not throw
    });

    it('should set onLoadDocumentComplete callback', () => {
      const handler = new MergeHandler();
      const callback = jest.fn();
      handler.setOnLoadDocumentComplete(callback);
      // No return value to check, but should not throw
    });

    it('should set onCancelPassword callback', () => {
      const handler = new MergeHandler();
      const callback = jest.fn();
      handler.setOnCancelPassword(callback);
      // No return value to check, but should not throw
    });
  });

  describe('handle method', () => {
    const mockPdfDoc = createMockPdfDoc();

    describe('with existing pdfDoc', () => {
      it('should use existing pdfDoc without creating merge item', async () => {
        const documents = [
          { id: 'doc-1', name: 'test.pdf', pdfDoc: mockPdfDoc as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL },
        ];

        const mockOnMergeComplete = jest.fn();
        const mockOnMergeItemComplete = jest.fn();

        const handler = new MergeHandler();
        handler.setItems(documents);
        handler.setOnMergeComplete(mockOnMergeComplete);
        handler.setOnMergeItemComplete(mockOnMergeItemComplete);

        await handler.handle();

        expect(mockCreateMergeItem).not.toHaveBeenCalled();
        expect(mockOnMergeItemComplete).toHaveBeenCalledWith('doc-1');
        expect(mockOnMergeComplete).toHaveBeenCalled();
      });
    });

    describe('without existing pdfDoc', () => {
      it('should create merge item using MergeItemFactory', async () => {
        const mockNewPdfDoc = createMockPdfDoc();
        const mockMergeItem = {
          getPDFDoc: jest.fn().mockResolvedValue(mockNewPdfDoc),
        };
        mockCreateMergeItem.mockReturnValue(mockMergeItem);

        const buffer = new ArrayBuffer(8);
        const documents = [
          { id: 'doc-1', name: 'test.pdf', pdfDoc: null as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL, buffer },
        ];

        const handler = new MergeHandler();
        handler.setItems(documents);
        handler.setOnMergeComplete(jest.fn());

        await handler.handle();

        expect(mockCreateMergeItem).toHaveBeenCalledWith(
          expect.objectContaining({
            buffer,
            id: 'doc-1',
            name: 'test.pdf',
          })
        );
      });

      it('should handle RemoteMergeItem with status and metadata', async () => {
        const mockNewPdfDoc = createMockPdfDoc();
        const mockMetadata = { pageCount: 10 };
        const mockMergeItem = {
          getPDFDoc: jest.fn().mockResolvedValue(mockNewPdfDoc),
          getItemStatus: jest.fn().mockReturnValue(UploadStatus.UPLOADED),
          getItemMetadata: jest.fn().mockReturnValue(mockMetadata),
        };
        mockCreateMergeItem.mockReturnValue(mockMergeItem);

        // Make mockMergeItem instanceof RemoteMergeItem return true
        Object.setPrototypeOf(mockMergeItem, RemoteMergeItem.prototype);

        const documents = [
          { id: 'doc-1', name: 'test.pdf', pdfDoc: null as unknown as Core.PDFNet.PDFDoc, source: FileSource.LUMIN, remoteId: 'remote-1' },
        ];

        const handler = new MergeHandler();
        handler.setItems(documents);
        handler.setOnMergeComplete(jest.fn());

        await handler.handle();

        const processedPdfDoc = handler.getProcessedPdfDoc();
        expect(processedPdfDoc['doc-1'].status).toBe(UploadStatus.UPLOADED);
        expect(processedPdfDoc['doc-1'].metadata).toBe(mockMetadata);
      });

      it('should handle non-RemoteMergeItem with null status and metadata', async () => {
        const mockNewPdfDoc = createMockPdfDoc();
        const mockMergeItem = {
          getPDFDoc: jest.fn().mockResolvedValue(mockNewPdfDoc),
        };
        mockCreateMergeItem.mockReturnValue(mockMergeItem);

        const buffer = new ArrayBuffer(8);
        const documents = [
          { id: 'doc-1', name: 'test.pdf', pdfDoc: null as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL, buffer },
        ];

        const handler = new MergeHandler();
        handler.setItems(documents);
        handler.setOnMergeComplete(jest.fn());

        await handler.handle();

        const processedPdfDoc = handler.getProcessedPdfDoc();
        expect(processedPdfDoc['doc-1'].status).toBeNull();
        expect(processedPdfDoc['doc-1'].metadata).toBeNull();
      });
    });

    describe('abort signal handling', () => {
      it('should throw when abort signal is aborted at start of iteration', async () => {
        const abortController = new AbortController();
        const abortReason = new Error('User cancelled');
        abortController.abort(abortReason);

        const documents = [
          { id: 'doc-1', name: 'test.pdf', pdfDoc: mockPdfDoc as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL },
        ];

        const handler = new MergeHandler();
        handler.setItems(documents);
        handler.setAbortSignal(abortController.signal);

        await expect(handler.handle()).rejects.toThrow(abortReason);
      });

      it('should throw when abort signal is aborted after getting pdfDoc', async () => {
        const abortController = new AbortController();
        const abortReason = new Error('User cancelled');

        const mockMergeItem = {
          getPDFDoc: jest.fn().mockImplementation(async () => {
            abortController.abort(abortReason);
            return createMockPdfDoc();
          }),
        };
        mockCreateMergeItem.mockReturnValue(mockMergeItem);

        const buffer = new ArrayBuffer(8);
        const documents = [
          { id: 'doc-1', name: 'test.pdf', pdfDoc: null as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL, buffer },
        ];

        const handler = new MergeHandler();
        handler.setItems(documents);
        handler.setAbortSignal(abortController.signal);

        await expect(handler.handle()).rejects.toThrow('User does not provide password');
      });

      it('should store metadata and status when aborted after getOrCreatePdfDoc', async () => {
        const abortController = new AbortController();
        const abortReason = new Error('User cancelled');
        const mockMetadata = { pageCount: 5 };

        const mockMergeItem = {
          getPDFDoc: jest.fn().mockImplementation(async () => {
            abortController.abort(abortReason);
            return createMockPdfDoc();
          }),
          getItemStatus: jest.fn().mockReturnValue(UploadStatus.UPLOADING),
          getItemMetadata: jest.fn().mockReturnValue(mockMetadata),
        };
        mockCreateMergeItem.mockReturnValue(mockMergeItem);
        Object.setPrototypeOf(mockMergeItem, RemoteMergeItem.prototype);

        const documents = [
          { id: 'doc-1', name: 'test.pdf', pdfDoc: null as unknown as Core.PDFNet.PDFDoc, source: FileSource.LUMIN, remoteId: 'remote-1' },
        ];

        const handler = new MergeHandler();
        handler.setItems(documents);
        handler.setAbortSignal(abortController.signal);

        try {
          await handler.handle();
        } catch {
          // Expected to throw
        }

        const processedPdfDoc = handler.getProcessedPdfDoc();
        expect(processedPdfDoc['doc-1'].status).toBe(UploadStatus.UPLOADING);
        expect(processedPdfDoc['doc-1'].metadata).toBe(mockMetadata);
      });
    });

    describe('pdfDoc is null', () => {
      it('should store metadata and status when pdfDoc is null and return early', async () => {
        const mockMetadata = { pageCount: 5 };
        const mockMergeItem = {
          getPDFDoc: jest.fn().mockResolvedValue(null),
          getItemStatus: jest.fn().mockReturnValue(UploadStatus.FAILED),
          getItemMetadata: jest.fn().mockReturnValue(mockMetadata),
        };
        mockCreateMergeItem.mockReturnValue(mockMergeItem);
        Object.setPrototypeOf(mockMergeItem, RemoteMergeItem.prototype);

        const documents = [
          { id: 'doc-1', name: 'test.pdf', pdfDoc: null as unknown as Core.PDFNet.PDFDoc, source: FileSource.LUMIN, remoteId: 'remote-1' },
        ];

        const handler = new MergeHandler();
        handler.setItems(documents);

        // Should throw because no document was merged
        await expect(handler.handle()).rejects.toThrow('Can not merge any document');

        const processedPdfDoc = handler.getProcessedPdfDoc();
        expect(processedPdfDoc['doc-1'].status).toBe(UploadStatus.FAILED);
        expect(processedPdfDoc['doc-1'].metadata).toBe(mockMetadata);
        expect(processedPdfDoc['doc-1'].pdfDoc).toBeUndefined();
      });
    });

    describe('multiple documents merging', () => {
      it('should set first document as root and insert subsequent documents', async () => {
        // Create shared mock objects to track calls across iterations
        const insertPagesMock = jest.fn().mockResolvedValue(undefined);
        const mockRootPdfDoc = {
          getPageCount: jest.fn().mockResolvedValue(5),
          insertPages: insertPagesMock,
        };
        const mockSecondPdfDoc = {
          getPageCount: jest.fn().mockResolvedValue(3),
          insertPages: jest.fn().mockResolvedValue(undefined),
        };

        const documents = [
          { id: 'doc-1', name: 'first.pdf', pdfDoc: mockRootPdfDoc as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL },
          { id: 'doc-2', name: 'second.pdf', pdfDoc: mockSecondPdfDoc as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL },
        ];

        const mockOnMergeItemComplete = jest.fn();

        const handler = new MergeHandler();
        handler.setItems(documents);
        handler.setOnMergeComplete(jest.fn());
        handler.setOnMergeItemComplete(mockOnMergeItemComplete);

        await handler.handle();

        // First document becomes root, cursor is set to pageCount + 1
        expect(mockRootPdfDoc.getPageCount).toHaveBeenCalled();
        // Second document is inserted
        expect(mockSecondPdfDoc.getPageCount).toHaveBeenCalled();
        expect(insertPagesMock).toHaveBeenCalledWith(
          6, // cursor = 5 + 1
          mockSecondPdfDoc,
          1,
          3,
          1 // e_insert_bookmark
        );
        expect(mockOnMergeItemComplete).toHaveBeenCalledTimes(2);
        expect(mockOnMergeItemComplete).toHaveBeenNthCalledWith(1, 'doc-1');
        expect(mockOnMergeItemComplete).toHaveBeenNthCalledWith(2, 'doc-2');
      });

      it('should update cursor correctly after each merge', async () => {
        const insertPagesMock = jest.fn().mockResolvedValue(undefined);
        const mockRootPdfDoc = {
          getPageCount: jest.fn().mockResolvedValue(5),
          insertPages: insertPagesMock,
        };
        const mockSecondPdfDoc = {
          getPageCount: jest.fn().mockResolvedValue(3),
          insertPages: jest.fn().mockResolvedValue(undefined),
        };
        const mockThirdPdfDoc = {
          getPageCount: jest.fn().mockResolvedValue(2),
          insertPages: jest.fn().mockResolvedValue(undefined),
        };

        const documents = [
          { id: 'doc-1', name: 'first.pdf', pdfDoc: mockRootPdfDoc as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL },
          { id: 'doc-2', name: 'second.pdf', pdfDoc: mockSecondPdfDoc as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL },
          { id: 'doc-3', name: 'third.pdf', pdfDoc: mockThirdPdfDoc as unknown as Core.PDFNet.PDFDoc, source: FileSource.GOOGLE },
        ];

        const handler = new MergeHandler();
        handler.setItems(documents);
        handler.setOnMergeComplete(jest.fn());

        await handler.handle();

        // Second document inserted at cursor 6
        expect(insertPagesMock).toHaveBeenNthCalledWith(1, 6, mockSecondPdfDoc, 1, 3, 1);
        // Third document inserted at cursor 6 + 3 = 9
        expect(insertPagesMock).toHaveBeenNthCalledWith(2, 9, mockThirdPdfDoc, 1, 2, 1);

        expect(handler.getOtherFileSource()).toEqual([FileSource.LOCAL, FileSource.LOCAL, FileSource.GOOGLE]);
      });
    });

    describe('error handling', () => {
      it('should throw with password error message when abort signal is aborted in catch', async () => {
        const abortController = new AbortController();
        const abortReason = new Error('Password cancelled');

        // Don't abort before calling handle - abort should happen during getPDFDoc
        const mockMergeItem = {
          getPDFDoc: jest.fn().mockImplementation(async () => {
            // Abort during getPDFDoc
            abortController.abort(abortReason);
            throw new Error('Load failed');
          }),
        };
        mockCreateMergeItem.mockReturnValue(mockMergeItem);

        const buffer = new ArrayBuffer(8);
        const documents = [
          { id: 'doc-1', name: 'test.pdf', pdfDoc: null as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL, buffer },
        ];

        const handler = new MergeHandler();
        handler.setItems(documents);
        handler.setAbortSignal(abortController.signal);

        await expect(handler.handle()).rejects.toThrow('User does not provide password for document: test.pdf');
      });

      it('should call onError when error occurs and abort signal is not aborted', async () => {
        const mockOnError = jest.fn();
        const loadError = new Error('Load failed');
        const mockMergeItem = {
          getPDFDoc: jest.fn().mockRejectedValue(loadError),
        };
        mockCreateMergeItem.mockReturnValue(mockMergeItem);

        const buffer = new ArrayBuffer(8);
        const documents = [
          { id: 'doc-1', name: 'test.pdf', pdfDoc: null as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL, buffer },
        ];

        const handler = new MergeHandler();
        handler.setItems(documents);
        handler.setOnError(mockOnError);

        await expect(handler.handle()).rejects.toThrow('Can not merge any document');

        expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
        expect(mockOnError.mock.calls[0][0].message).toBe('Can not merge document: test.pdf');
      });

      it('should continue processing other documents when one fails', async () => {
        const mockOnError = jest.fn();
        const loadError = new Error('Load failed');

        const mockFailedMergeItem = {
          getPDFDoc: jest.fn().mockRejectedValue(loadError),
        };
        const mockSuccessPdfDoc = createMockPdfDoc();

        mockCreateMergeItem
          .mockReturnValueOnce(mockFailedMergeItem)
          .mockReturnValueOnce({ getPDFDoc: jest.fn().mockResolvedValue(mockSuccessPdfDoc) });

        const buffer = new ArrayBuffer(8);
        const documents = [
          { id: 'doc-1', name: 'fail.pdf', pdfDoc: null as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL, buffer },
          { id: 'doc-2', name: 'success.pdf', pdfDoc: null as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL, buffer },
        ];

        const mockOnMergeComplete = jest.fn();

        const handler = new MergeHandler();
        handler.setItems(documents);
        handler.setOnError(mockOnError);
        handler.setOnMergeComplete(mockOnMergeComplete);

        await handler.handle();

        expect(mockOnError).toHaveBeenCalledTimes(1);
        expect(mockOnMergeComplete).toHaveBeenCalled();
      });
    });

    describe('no documents merged', () => {
      it('should throw error when no documents can be merged', async () => {
        const mockOnError = jest.fn();
        const mockMergeItem = {
          getPDFDoc: jest.fn().mockResolvedValue(null),
        };
        mockCreateMergeItem.mockReturnValue(mockMergeItem);

        const buffer = new ArrayBuffer(8);
        const documents = [
          { id: 'doc-1', name: 'test.pdf', pdfDoc: null as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL, buffer },
        ];

        const handler = new MergeHandler();
        handler.setItems(documents);
        handler.setOnError(mockOnError);

        await expect(handler.handle()).rejects.toThrow('Can not merge any document');
      });
    });

    describe('callbacks', () => {
      it('should call core.loadFullApi before processing', async () => {
        const documents = [
          { id: 'doc-1', name: 'test.pdf', pdfDoc: mockPdfDoc as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL },
        ];

        const handler = new MergeHandler();
        handler.setItems(documents);
        handler.setOnMergeComplete(jest.fn());

        await handler.handle();

        expect(mockCore.loadFullApi).toHaveBeenCalledTimes(1);
      });

      it('should call onMergeComplete when merge is successful', async () => {
        const mockOnMergeComplete = jest.fn();

        const documents = [
          { id: 'doc-1', name: 'test.pdf', pdfDoc: mockPdfDoc as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL },
        ];

        const handler = new MergeHandler();
        handler.setItems(documents);
        handler.setOnMergeComplete(mockOnMergeComplete);

        await handler.handle();

        expect(mockOnMergeComplete).toHaveBeenCalledTimes(1);
      });

      it('should not throw when callbacks are not set', async () => {
        const documents = [
          { id: 'doc-1', name: 'test.pdf', pdfDoc: mockPdfDoc as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL },
        ];

        const handler = new MergeHandler();
        handler.setItems(documents);

        // Should not throw even without callbacks
        await expect(handler.handle()).resolves.not.toThrow();
      });
    });
  });

  describe('getter methods', () => {
    it('should return result from getResult', async () => {
      const mockPdfDoc = createMockPdfDoc();
      const documents = [
        { id: 'doc-1', name: 'test.pdf', pdfDoc: mockPdfDoc as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL },
      ];

      const handler = new MergeHandler();
      handler.setItems(documents);
      handler.setOnMergeComplete(jest.fn());

      await handler.handle();

      expect(handler.getResult()).toBe(mockPdfDoc);
    });

    it('should return processedPdfDoc from getProcessedPdfDoc', async () => {
      const mockPdfDoc = createMockPdfDoc();
      const documents = [
        { id: 'doc-1', name: 'test.pdf', pdfDoc: mockPdfDoc as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL },
      ];

      const handler = new MergeHandler();
      handler.setItems(documents);
      handler.setOnMergeComplete(jest.fn());

      await handler.handle();

      const processedPdfDoc = handler.getProcessedPdfDoc();
      expect(processedPdfDoc['doc-1'].pdfDoc).toBe(mockPdfDoc);
    });

    it('should return file sources from getOtherFileSource', async () => {
      const insertPagesMock = jest.fn().mockResolvedValue(undefined);
      const mockPdfDoc1 = {
        getPageCount: jest.fn().mockResolvedValue(5),
        insertPages: insertPagesMock,
      };
      const mockPdfDoc2 = {
        getPageCount: jest.fn().mockResolvedValue(3),
        insertPages: jest.fn().mockResolvedValue(undefined),
      };
      const documents = [
        { id: 'doc-1', name: 'test1.pdf', pdfDoc: mockPdfDoc1 as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL },
        { id: 'doc-2', name: 'test2.pdf', pdfDoc: mockPdfDoc2 as unknown as Core.PDFNet.PDFDoc, source: FileSource.GOOGLE },
      ];

      const handler = new MergeHandler();
      handler.setItems(documents);
      handler.setOnMergeComplete(jest.fn());

      await handler.handle();

      expect(handler.getOtherFileSource()).toEqual([FileSource.LOCAL, FileSource.GOOGLE]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty documents array', async () => {
      const handler = new MergeHandler();
      handler.setItems([]);
      handler.setOnMergeComplete(jest.fn());

      await expect(handler.handle()).rejects.toThrow('Can not merge any document');
    });

    it('should pass all callbacks to MergeItemFactory', async () => {
      const mockOnError = jest.fn();
      const mockOnLoadDocumentComplete = jest.fn();
      const mockOnSetupPasswordHandler = jest.fn();
      const mockOnCancelPassword = jest.fn();
      const abortController = new AbortController();

      const mockNewPdfDoc = createMockPdfDoc();
      const mockMergeItem = {
        getPDFDoc: jest.fn().mockResolvedValue(mockNewPdfDoc),
      };
      mockCreateMergeItem.mockReturnValue(mockMergeItem);

      const buffer = new ArrayBuffer(8);
      const documents = [
        { id: 'doc-1', name: 'test.pdf', pdfDoc: null as unknown as Core.PDFNet.PDFDoc, source: FileSource.LOCAL, buffer, remoteId: 'remote-1' },
      ];

      const handler = new MergeHandler();
      handler.setItems(documents);
      handler.setAbortSignal(abortController.signal);
      handler.setOnError(mockOnError);
      handler.setOnLoadDocumentComplete(mockOnLoadDocumentComplete);
      handler.setOnSetupPasswordHandler(mockOnSetupPasswordHandler);
      handler.setOnCancelPassword(mockOnCancelPassword);
      handler.setOnMergeComplete(jest.fn());

      await handler.handle();

      expect(mockCreateMergeItem).toHaveBeenCalledWith({
        abortSignal: abortController.signal,
        buffer,
        id: 'doc-1',
        name: 'test.pdf',
        remoteId: 'remote-1',
        onError: mockOnError,
        onLoadDocumentComplete: mockOnLoadDocumentComplete,
        onSetupPasswordHandler: mockOnSetupPasswordHandler,
        onCancelPassword: mockOnCancelPassword,
      });
    });
  });
});
