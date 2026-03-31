import { RemoteMergeItem } from '../remote';
import { UploadStatus } from '../../../enum';
import { RemoteDocumentItem } from '../../documentItem/remote';
import { PdfProcessor } from 'features/PdfProcessor/pdfProcessor';
import { IAnnotation, IFormField, TDocumentOutline } from 'interfaces/document/document.interface';

// Create mock instance that will be returned by the mock constructor
const mockGetDocumentData = jest.fn();
const mockRemoteDocumentItemInstance = {
  getDocumentData: mockGetDocumentData,
};

// Mock the dependencies
jest.mock('features/PdfProcessor/pdfProcessor', () => ({
  PdfProcessor: jest.fn().mockImplementation(() => ({
    process: jest.fn(),
  })),
}));

jest.mock('../../documentItem/remote', () => ({
  RemoteDocumentItem: jest.fn().mockImplementation(() => mockRemoteDocumentItemInstance),
}));

// Mock Enums
jest.mock('../../../enum', () => ({
  UploadStatus: {
    UPLOADED: 'UPLOADED',
    FAILED: 'FAILED',
    UPLOADING: 'UPLOADING',
  },
}));

describe('RemoteMergeItem', () => {
  const mockAbortSignal = new AbortController().signal;
  const defaultParams = {
    abortSignal: mockAbortSignal,
    id: 'doc-1',
    name: 'test.pdf',
    remoteId: 'remote-123',
    onError: jest.fn(),
    onLoadDocumentComplete: jest.fn(),
    onSetupPasswordHandler: jest.fn(),
    onCancelPassword: jest.fn(),
  };

  const mockBuffer = new ArrayBuffer(8);
  const mockProcessedPDF = { id: 'processed-pdf' };
  
  // Data returned by RemoteDocumentItem
  const mockDocumentData = {
    document: { id: 'api-doc' },
    annotations: [] as unknown as IAnnotation[],
    outlines: [] as unknown as TDocumentOutline[],
    buffer: mockBuffer,
    fields: [] as unknown as IFormField[],
    signedUrls: {},
    status: UploadStatus.UPLOADED,
    metadata: { pageCount: 5 },
  };

  let remoteMergeItem: RemoteMergeItem;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Instantiate item
    remoteMergeItem = new RemoteMergeItem(defaultParams);
  });

  describe('constructor', () => {
    it('should initialize RemoteDocumentItem with correct parameters', () => {
      expect(RemoteDocumentItem).toHaveBeenCalledWith({
        _id: defaultParams.id,
        abortSignal: defaultParams.abortSignal,
        remoteId: defaultParams.remoteId,
        name: defaultParams.name,
        onError: defaultParams.onError,
        onLoadDocumentComplete: defaultParams.onLoadDocumentComplete,
        onSetupPasswordHandler: defaultParams.onSetupPasswordHandler,
        onCancelPassword: defaultParams.onCancelPassword,
      });
    });
  });

  describe('getPDFDoc', () => {
    it('should return null if status is FAILED', async () => {
      mockGetDocumentData.mockResolvedValue({
        ...mockDocumentData,
        status: UploadStatus.FAILED,
        buffer: undefined, // Buffer might be missing on fail
      });

      const result = await remoteMergeItem.getPDFDoc();

      expect(result).toBeNull();
      // Should update internal status/metadata
      expect(remoteMergeItem.getItemStatus()).toBe(UploadStatus.FAILED);
    });

    it('should throw error if status is not FAILED but buffer is missing', async () => {
      mockGetDocumentData.mockResolvedValue({
        ...mockDocumentData,
        status: UploadStatus.UPLOADED,
        buffer: undefined,
      });

      await expect(remoteMergeItem.getPDFDoc()).rejects.toThrow('Failed to load document');
    });

    it('should process and return PDFDoc if successful', async () => {
      // 1. Setup Data
      mockGetDocumentData.mockResolvedValue(mockDocumentData);
      
      const mockPdfProcessorInstance = {
        process: jest.fn().mockResolvedValue(mockProcessedPDF),
      };
      (PdfProcessor as jest.Mock).mockImplementation(() => mockPdfProcessorInstance);

      // 2. Execute
      const result = await remoteMergeItem.getPDFDoc();

      // 3. Assertions
      expect(result).toBe(mockProcessedPDF);
      
      // Verify PdfProcessor initialization
      expect(PdfProcessor).toHaveBeenCalledWith(
        mockDocumentData.document,
        mockDocumentData.annotations,
        mockDocumentData.fields,
        mockDocumentData.outlines,
        mockDocumentData.signedUrls,
        mockDocumentData.buffer
      );
      
      // Verify internal state update
      expect(remoteMergeItem.getItemStatus()).toBe(UploadStatus.UPLOADED);
      expect(remoteMergeItem.getItemMetadata()).toEqual(mockDocumentData.metadata);
    });
  });

  describe('Getters', () => {
    it('should return item status and metadata after getPDFDoc is called', async () => {
      mockGetDocumentData.mockResolvedValue(mockDocumentData);
      (PdfProcessor as jest.Mock).mockImplementation(() => ({ process: jest.fn() }));

      await remoteMergeItem.getPDFDoc();

      expect(remoteMergeItem.getItemStatus()).toBe(UploadStatus.UPLOADED);
      expect(remoteMergeItem.getItemMetadata()).toEqual(mockDocumentData.metadata);
    });

    it('should return undefined before getPDFDoc is called', () => {
      expect(remoteMergeItem.getItemStatus()).toBeUndefined();
      expect(remoteMergeItem.getItemMetadata()).toBeUndefined();
    });
  });
});