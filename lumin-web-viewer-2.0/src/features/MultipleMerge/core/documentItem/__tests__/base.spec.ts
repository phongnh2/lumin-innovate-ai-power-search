import { DocumentBaseItem } from '../base';
import { images, general } from 'constants/documentType';
import { MergeDocumentType } from '../../../types';

jest.mock('constants/documentType', () => ({
  general: {
    PDF: 'application/pdf',
  },
  images: {
    JPG: 'image/jpg',
  },
}));

class TestableDocumentItem extends DocumentBaseItem {
  protected _id: string = 'test-id';
  protected _name: string = 'test-name';
  protected _onError: (error: Error) => void = jest.fn();
  protected _onLoadDocumentComplete: () => void = jest.fn();
  protected _onSetupPasswordHandler: (params: { attempt: number; name: string }) => void = jest.fn();

  async getDocumentData(): Promise<Partial<MergeDocumentType>> {
    return {};
  }

  // Public wrapper to access the protected method for testing
  public async callGetFileBufferFromSecureDoc(params: {
    docInstance: Core.Document;
    file: File;
  }): Promise<ArrayBuffer> {
    return this.getFileBufferFromSecureDoc(params);
  }
}

describe('DocumentBaseItem', () => {
  let testItem: TestableDocumentItem;

  beforeEach(() => {
    jest.clearAllMocks();
    testItem = new TestableDocumentItem();

    // Mock window.Core structure needed for the method
    const coreMock = {
      SaveOptions: {
        INCREMENTAL: 1,
      },
      PDFNet: {
        SDFDoc: {
          SaveOptions: {
            e_linearized: 2,
          },
        },
      },
    };

    // Safely assign to window
    Object.defineProperty(window, 'Core', {
      value: coreMock,
      writable: true,
    });
  });

  describe('getFileBufferFromSecureDoc', () => {
    it('should return incremental file data for non-PDF files', async () => {
      // 1. Setup Inputs - using Object casting to avoid "File is not defined" issues
      const mockFile = { type: images.JPG } as unknown as File;
      const expectedBuffer = new ArrayBuffer(8);

      const mockDocInstance = {
        getFileData: jest.fn().mockResolvedValue(expectedBuffer),
        getPDFDoc: jest.fn(), // Should not be called
      } as unknown as Core.Document;

      // 2. Execute
      const result = await testItem.callGetFileBufferFromSecureDoc({
        docInstance: mockDocInstance,
        file: mockFile,
      });

      // 3. Assertions
      expect(result).toBe(expectedBuffer);
      expect(mockDocInstance.getFileData).toHaveBeenCalledWith({
        flags: window.Core.SaveOptions.INCREMENTAL,
      });
      expect(mockDocInstance.getPDFDoc).not.toHaveBeenCalled();
    });

    it('should process PDF files: get PDFDoc, remove security, and save memory buffer', async () => {
      // 1. Setup Inputs
      const mockFile = { type: general.PDF } as unknown as File;
      
      // Mock the buffer returned by saveMemoryBuffer
      const mockSavedBuffer = new Uint8Array([1, 2, 3]).buffer;

      // Mock the PDFDoc object
      const mockPdfDoc = {
        removeSecurity: jest.fn().mockResolvedValue(undefined),
        saveMemoryBuffer: jest.fn().mockResolvedValue(mockSavedBuffer),
      };

      // Mock the Core.Document instance
      const mockDocInstance = {
        getPDFDoc: jest.fn().mockResolvedValue(mockPdfDoc),
        getFileData: jest.fn(), // Should not be called
      } as unknown as Core.Document;

      // 2. Execute
      const result = await testItem.callGetFileBufferFromSecureDoc({
        docInstance: mockDocInstance,
        file: mockFile,
      });

      // 3. Assertions
      expect(result).toBeInstanceOf(Uint8Array);
      expect((result as unknown as Uint8Array).buffer).toBe(mockSavedBuffer);

      // Verify sequence
      expect(mockDocInstance.getFileData).not.toHaveBeenCalled();
      expect(mockDocInstance.getPDFDoc).toHaveBeenCalledTimes(1);
      expect(mockPdfDoc.removeSecurity).toHaveBeenCalledTimes(1);
      expect(mockPdfDoc.saveMemoryBuffer).toHaveBeenCalledWith(
        window.Core.PDFNet.SDFDoc.SaveOptions.e_linearized
      );
    });

    it('should propagate errors from docInstance methods', async () => {
      const mockFile = { type: general.PDF } as unknown as File;
      const error = new Error('PDF Error');

      const mockDocInstance = {
        getPDFDoc: jest.fn().mockRejectedValue(error),
      } as unknown as Core.Document;

      await expect(
        testItem.callGetFileBufferFromSecureDoc({
          docInstance: mockDocInstance,
          file: mockFile,
        })
      ).rejects.toThrow(error);
    });
  });
});