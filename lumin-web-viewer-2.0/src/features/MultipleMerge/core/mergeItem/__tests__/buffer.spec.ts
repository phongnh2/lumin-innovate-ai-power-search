import { ArrayBufferMergeItem } from '../buffer';

describe('ArrayBufferMergeItem', () => {
  const mockBuffer = new ArrayBuffer(8);
  const mockPDFDoc = { id: 'pdf-doc-instance' };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock window.Core structure
    const coreMock = {
      PDFNet: {
        PDFDoc: {
          createFromBuffer: jest.fn().mockResolvedValue(mockPDFDoc),
        },
      },
    };

    // Assign to window
    Object.defineProperty(window, 'Core', {
      value: coreMock,
      writable: true,
    });
  });

  describe('getPDFDoc', () => {
    it('should create a PDFDoc from the provided buffer', async () => {
      const item = new ArrayBufferMergeItem(mockBuffer);
      const result = await item.getPDFDoc();

      expect(window.Core.PDFNet.PDFDoc.createFromBuffer).toHaveBeenCalledWith(mockBuffer);
      expect(result).toBe(mockPDFDoc);
    });
  });
});