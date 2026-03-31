import {
  isValidToApplyOCR,
  mergeFile,
  updateForOfflineMode,
  updateCache,
  setAssociateSignatureToWidget,
  onCheckboxValue,
  syncFileToS3AfterOCR,
} from '../utils';

jest.spyOn(console, 'error').mockImplementation(() => {});

jest.mock('helpers/i18n', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('core', () => ({
  getTotalPages: jest.fn(() => 10),
  getAnnotationsList: jest.fn(),
  getDocument: jest.fn(() => ({})),
}));

jest.mock('HOC/OfflineStorageHOC', () => ({
  Handler: { isOfflineEnabled: true },
  storageHandler: {
    deleteFile: jest.fn(),
    putCustomFile: jest.fn(),
  },
}));

jest.mock('services/documentServices', () => ({
  __esModule: true,
  default: {
    overrideDocumentToS3: jest.fn(),
  },
}));

jest.mock('services/indexedDBService', () => ({
  __esModule: true,
  default: {
    putProfileDataByKey: jest.fn(),
  },
}));

jest.mock('services/socketServices', () => ({
  socketService: {
    modifyDocumentContent: jest.fn(),
  },
}));

jest.mock('utils/file', () => ({
  __esModule: true,
  default: {
    getThumbnailWithDocument: jest.fn(() => Promise.resolve('canvas')),
    convertThumnailCanvasToFile: jest.fn(() => Promise.resolve(new File(['thumb'], 'thumb.png'))),
  },
}));

jest.mock('utils/calculateTimeTracking', () => ({
  handleTrackTimeDocumentSaving: jest.fn((promise) => Promise.resolve({ data: { etag: 'etag-1' } })),
}));

jest.mock('features/DocumentCaching', () => ({
  documentCacheBase: {
    updateCache: jest.fn(),
  },
  getCacheKey: (id: string) => `cache-${id}`,
}));

jest.mock('helpers/setAssociatedSignatureAnnotation', () => jest.fn());

jest.mock('utils/Factory/EventCollection/ModalEventCollection', () => ({
  __esModule: true,
  default: {
    modalHidden: jest.fn(),
  },
}));

jest.mock('../constants', () => ({
  maxOCRFileSize: 20,
  maxOCRPages: 100,
}));

jest.mock('constants/customDataConstant', () => ({
  CUSTOM_DATA_WIDGET_ANNOTATION: {
    WIDGET_ID: { key: 'widget-id' },
  },
}));

jest.mock('constants/documentConstants', () => ({
  AnnotationSubjectMapping: {
    signature: 'signature',
  },
}));

describe('DocumentOCR utils', () => {
  const core = jest.requireMock('core') as jest.Mocked<typeof import('core')>;
  const Handler = jest.requireMock('HOC/OfflineStorageHOC').Handler as { isOfflineEnabled: boolean };
  const storageHandler = jest.requireMock('HOC/OfflineStorageHOC').storageHandler as {
    deleteFile: jest.Mock;
    putCustomFile: jest.Mock;
  };
  const indexedDBService = jest.requireMock('services/indexedDBService').default as {
    putProfileDataByKey: jest.Mock;
  };
  const documentCacheBase = jest.requireMock('features/DocumentCaching').documentCacheBase as {
    updateCache: jest.Mock;
  };
  const setAssociatedSignatureAnnotation = jest.requireMock('helpers/setAssociatedSignatureAnnotation') as jest.Mock;
  const socketService = jest.requireMock('services/socketServices').socketService as {
    modifyDocumentContent: jest.Mock;
  };
  const documentServices = jest.requireMock('services/documentServices').default as {
    overrideDocumentToS3: jest.Mock;
  };
  const fileUtils = jest.requireMock('utils/file').default as {
    getThumbnailWithDocument: jest.Mock;
    convertThumnailCanvasToFile: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Handler.isOfflineEnabled = true;
  });

  beforeAll(() => {
    (global as unknown as { Response: typeof Response }).Response = class {
      private body: Blob | File;
      constructor(body: Blob | File) {
        this.body = body;
      }
      clone() {
        return this;
      }
      blob() {
        return Promise.resolve(this.body);
      }
    } as unknown as typeof Response;
    (window as any).Core = {
      PDFNet: {
        PDFDoc: {
          InsertFlag: { e_none: 0 },
        },
      },
      Annotations: {},
    };
  });

  describe('isValidToApplyOCR', () => {
    it('returns true when under size and page limits', () => {
      const result = isValidToApplyOCR({ size: 10 } as never);

      expect(result).toBe(true);
      expect(core.getTotalPages).toHaveBeenCalled();
    });

    it('returns false when exceeding limits', () => {
      core.getTotalPages.mockReturnValue(150);
      const result = isValidToApplyOCR({ size: 25 } as never);

      expect(result).toBe(false);
    });
  });

  describe('mergeFile', () => {
    it('merges PDF chunks in position order and appends XFDF', async () => {
      const insertPages = jest.fn();
      const mergeXFDFString = jest.fn();
      const resultPDFDoc = { insertPages, mergeXFDFString } as unknown as any;
      const first = {
        position: 2,
        pdfDoc: {
          getPageCount: jest.fn().mockResolvedValue(1),
        },
      };
      const second = {
        position: 1,
        pdfDoc: {
          getPageCount: jest.fn().mockResolvedValue(2),
        },
      };
      const insertFlag = (window as any).Core?.PDFNet?.PDFDoc?.InsertFlag?.e_none ?? 0;

      await mergeFile([first as never, second as never], resultPDFDoc, 'xfdf-string');

      expect(insertPages).toHaveBeenNthCalledWith(1, 1, second.pdfDoc, 1, 2, insertFlag);
      expect(insertPages).toHaveBeenNthCalledWith(2, 3, first.pdfDoc, 1, 1, insertFlag);
      expect(mergeXFDFString).toHaveBeenCalledWith('xfdf-string');
    });
  });

  describe('updateForOfflineMode', () => {
    it('replaces cached offline file when offline is enabled', async () => {
      Handler.isOfflineEnabled = true;
      const document = { signedUrl: '/doc', isOfflineValid: true } as never;
      const file = new File(['data'], 'ocr.pdf');

      await updateForOfflineMode(document, file);

      expect(storageHandler.deleteFile).toHaveBeenCalledWith('/doc');
      expect(storageHandler.putCustomFile).toHaveBeenCalled();
    });

    it('skips when offline is not enabled', async () => {
      Handler.isOfflineEnabled = false;
      const document = { signedUrl: '/doc', isOfflineValid: false } as never;
      const file = new File(['data'], 'ocr.pdf');

      await updateForOfflineMode(document, file);

      expect(storageHandler.deleteFile).not.toHaveBeenCalled();
    });
  });

  it('updateCache forwards to documentCacheBase', async () => {
    const doc = { _id: 'doc-1' } as never;
    const file = new File(['data'], 'ocr.pdf');

    await updateCache(doc, { etag: 'etag' }, file);

    expect(documentCacheBase.updateCache).toHaveBeenCalledWith({
      key: 'cache-doc-1',
      etag: 'etag',
      file,
      shouldCount: false,
    });
  });

  describe('setAssociateSignatureToWidget', () => {
    beforeAll(() => {
      class SignatureWidgetAnnotation {}
      class WidgetAnnotation {
        styledInnerElement = jest.fn();
      }
      (window as any).Core = {
        ...(window as any).Core,
        Annotations: {
          SignatureWidgetAnnotation,
          WidgetAnnotation,
        },
      };
    });

    it('associates signatures and styles widgets', () => {
      const signatureAnnot = new (window as any).Core.Annotations.SignatureWidgetAnnotation();
      signatureAnnot.Subject = 'signature';
      signatureAnnot.getCustomData = jest.fn(() => 'widget-id');
      const widgetAnnot = new (window as any).Core.Annotations.WidgetAnnotation();

      core.getAnnotationsList.mockReturnValue([signatureAnnot, widgetAnnot]);

      setAssociateSignatureToWidget();

      expect(setAssociatedSignatureAnnotation).toHaveBeenCalledWith({
        annotation: signatureAnnot,
        signatureWidgets: [signatureAnnot],
      });
      expect(widgetAnnot.styledInnerElement).toHaveBeenCalled();
    });
  });

  describe('onCheckboxValue', () => {
    it('persists preference when checkbox is checked', () => {
      onCheckboxValue(true, { modalName: 'name', modalPurpose: 'purpose' });

      expect(indexedDBService.putProfileDataByKey).toHaveBeenCalledWith('preventShowOCRModal', true);
    });

    it('does nothing when checkbox is not checked', () => {
      onCheckboxValue(false, { modalName: 'name', modalPurpose: 'purpose' });

      expect(indexedDBService.putProfileDataByKey).not.toHaveBeenCalled();
    });
  });

  describe('syncFileToS3AfterOCR', () => {
    it('uploads file, updates cache and offline storage', async () => {
      Handler.isOfflineEnabled = true;
      const modifySpy = socketService.modifyDocumentContent;
      const doc = {
        _id: 'doc-id',
        name: 'file.pdf',
        mimeType: 'application/pdf',
        remoteId: 'remote',
        service: 's3',
        thumbnailRemoteId: 'thumb-remote',
        isOfflineValid: true,
      } as never;
      const ocrBuffer = new Uint8Array([1, 2]);
      documentServices.overrideDocumentToS3.mockResolvedValue({});
      const signatureAnnot = new (window as any).Core.Annotations.SignatureWidgetAnnotation();
      signatureAnnot.Subject = 'signature';
      signatureAnnot.getCustomData = jest.fn(() => 'widget-id');
      const widgetAnnot = new (window as any).Core.Annotations.WidgetAnnotation();
      core.getAnnotationsList.mockReturnValue([signatureAnnot, widgetAnnot]);

      await syncFileToS3AfterOCR(ocrBuffer, doc);

      expect(modifySpy).toHaveBeenCalledWith('doc-id', expect.objectContaining({ status: 'preparing' }));
      expect(setAssociatedSignatureAnnotation).toHaveBeenCalled();
      expect(fileUtils.getThumbnailWithDocument).toHaveBeenCalled();
      expect(fileUtils.convertThumnailCanvasToFile).toHaveBeenCalled();
      expect(documentCacheBase.updateCache).toHaveBeenCalled();
      expect(storageHandler.putCustomFile).toHaveBeenCalled();
    });

    it('notifies failed status and re-throws when an error occurs', async () => {
      const modifySpy = socketService.modifyDocumentContent;
      const doc = {
        _id: 'doc-id',
        name: 'file.pdf',
        mimeType: 'application/pdf',
        remoteId: 'remote',
        service: 's3',
        thumbnailRemoteId: 'thumb-remote',
        isOfflineValid: true,
      } as never;
      const ocrBuffer = new Uint8Array([1, 2]);
      const testError = new Error('Upload failed');
      const handleTrackTimeDocumentSaving = jest.requireMock('utils/calculateTimeTracking')
        .handleTrackTimeDocumentSaving as jest.Mock;
      handleTrackTimeDocumentSaving.mockRejectedValueOnce(testError);

      await expect(syncFileToS3AfterOCR(ocrBuffer, doc)).rejects.toThrow('Upload failed');

      expect(modifySpy).toHaveBeenCalledWith('doc-id', {
        status: 'failed',
        increaseVersion: true,
        isAppliedOCR: true,
      });
    });
  });
});
