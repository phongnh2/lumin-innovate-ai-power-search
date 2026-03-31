import documentServices from 'services/documentServices';

import { general } from 'constants/documentType';

import { uploadFileToS3ForDetection } from '../uploadFileToS3ForDetection';

jest.mock('services/documentServices', () => ({
  __esModule: true,
  default: {
    uploadFileToS3: jest.fn(),
  },
}));

jest.mock('constants/documentType', () => ({
  general: {
    PDF: 'application/pdf',
  },
}));

describe('uploadFileToS3ForDetection', () => {
  const mockUploadFileToS3 = documentServices.uploadFileToS3 as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful upload', () => {
    it('should upload file to S3 with all required parameters', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.pdf?presigned';
      const documentName = 'test-document.pdf';
      const fileBuffer = new Uint8Array([1, 2, 3, 4, 5]);
      const signal = new AbortController().signal;
      const mockResponse = 'success';

      mockUploadFileToS3.mockResolvedValue(mockResponse);

      const result = await uploadFileToS3ForDetection({
        presignedUrl,
        documentName,
        fileBuffer,
        options: { signal },
      });

      expect(result).toBe(mockResponse);
      expect(mockUploadFileToS3).toHaveBeenCalledTimes(1);
      expect(mockUploadFileToS3).toHaveBeenCalledWith({
        file: expect.any(File),
        presignedUrl,
        headers: undefined,
        options: { signal },
      });

      const fileArg = mockUploadFileToS3.mock.calls[0][0].file;
      expect(fileArg).toBeInstanceOf(File);
      expect(fileArg.name).toBe(documentName);
      expect(fileArg.type).toBe(general.PDF);
    });

    it('should upload file to S3 with headers provided', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.pdf?presigned';
      const documentName = 'test-document.pdf';
      const fileBuffer = new Uint8Array([10, 20, 30]);
      const headers = {
        'Content-Encoding': 'gzip',
        'X-Custom-Header': 'custom-value',
      };
      const signal = new AbortController().signal;
      const mockResponse = 'success';

      mockUploadFileToS3.mockResolvedValue(mockResponse);

      const result = await uploadFileToS3ForDetection({
        presignedUrl,
        documentName,
        fileBuffer,
        headers,
        options: { signal },
      });

      expect(result).toBe(mockResponse);
      expect(mockUploadFileToS3).toHaveBeenCalledTimes(1);
      expect(mockUploadFileToS3).toHaveBeenCalledWith({
        file: expect.any(File),
        presignedUrl,
        headers,
        options: { signal },
      });
    });

    it('should create File with correct buffer content', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.pdf?presigned';
      const documentName = 'document.pdf';
      const fileBuffer = new Uint8Array([255, 254, 253, 252]);
      const signal = new AbortController().signal;

      mockUploadFileToS3.mockResolvedValue('success');

      await uploadFileToS3ForDetection({
        presignedUrl,
        documentName,
        fileBuffer,
        options: { signal },
      });

      const fileArg = mockUploadFileToS3.mock.calls[0][0].file;
      expect(fileArg).toBeInstanceOf(File);
      expect(fileArg.name).toBe(documentName);
      expect(fileArg.type).toBe(general.PDF);
      
      // Verify file size matches buffer length
      expect(fileArg.size).toBe(fileBuffer.length);
    });

    it('should handle empty file buffer', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.pdf?presigned';
      const documentName = 'empty-document.pdf';
      const fileBuffer = new Uint8Array(0);
      const signal = new AbortController().signal;

      mockUploadFileToS3.mockResolvedValue('success');

      await uploadFileToS3ForDetection({
        presignedUrl,
        documentName,
        fileBuffer,
        options: { signal },
      });

      const fileArg = mockUploadFileToS3.mock.calls[0][0].file;
      expect(fileArg).toBeInstanceOf(File);
      expect(fileArg.size).toBe(0);
    });

    it('should handle large file buffer', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.pdf?presigned';
      const documentName = 'large-document.pdf';
      const fileBuffer = new Uint8Array(10000).fill(42);
      const signal = new AbortController().signal;

      mockUploadFileToS3.mockResolvedValue('success');

      await uploadFileToS3ForDetection({
        presignedUrl,
        documentName,
        fileBuffer,
        options: { signal },
      });

      const fileArg = mockUploadFileToS3.mock.calls[0][0].file;
      expect(fileArg.size).toBe(10000);
    });

    it('should handle different document names', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.pdf?presigned';
      const documentNames = [
        'simple.pdf',
        'document-with-dashes.pdf',
        'document_with_underscores.pdf',
        'document.with.dots.pdf',
        'document with spaces.pdf',
        '123numeric.pdf',
        'UPPERCASE.PDF',
        'mixedCase.PDF',
      ];
      const fileBuffer = new Uint8Array([1, 2, 3]);
      const signal = new AbortController().signal;

      mockUploadFileToS3.mockResolvedValue('success');

      for (const documentName of documentNames) {
        await uploadFileToS3ForDetection({
          presignedUrl,
          documentName,
          fileBuffer,
          options: { signal },
        });

        const fileArg = mockUploadFileToS3.mock.calls[mockUploadFileToS3.mock.calls.length - 1][0].file;
        expect(fileArg.name).toBe(documentName);
      }
    });

    it('should handle different presigned URLs', async () => {
      const presignedUrls = [
        'https://s3.amazonaws.com/bucket/file.pdf?presigned',
        'https://s3-us-west-2.amazonaws.com/bucket/file.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256',
        'https://bucket.s3.amazonaws.com/file.pdf?presigned=true',
      ];
      const documentName = 'test.pdf';
      const fileBuffer = new Uint8Array([1, 2, 3]);
      const signal = new AbortController().signal;

      mockUploadFileToS3.mockResolvedValue('success');

      for (const presignedUrl of presignedUrls) {
        await uploadFileToS3ForDetection({
          presignedUrl,
          documentName,
          fileBuffer,
          options: { signal },
        });

        expect(mockUploadFileToS3).toHaveBeenCalledWith(
          expect.objectContaining({
            presignedUrl,
          })
        );
      }
    });
  });

  describe('error handling', () => {
    it('should propagate error when uploadFileToS3 fails', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.pdf?presigned';
      const documentName = 'test-document.pdf';
      const fileBuffer = new Uint8Array([1, 2, 3]);
      const signal = new AbortController().signal;
      const mockError = new Error('Upload failed');

      mockUploadFileToS3.mockRejectedValue(mockError);

      await expect(
        uploadFileToS3ForDetection({
          presignedUrl,
          documentName,
          fileBuffer,
          options: { signal },
        })
      ).rejects.toThrow('Upload failed');

      expect(mockUploadFileToS3).toHaveBeenCalledTimes(1);
    });

    it('should propagate network error', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.pdf?presigned';
      const documentName = 'test-document.pdf';
      const fileBuffer = new Uint8Array([1, 2, 3]);
      const signal = new AbortController().signal;
      const networkError = new Error('Network request failed');

      mockUploadFileToS3.mockRejectedValue(networkError);

      await expect(
        uploadFileToS3ForDetection({
          presignedUrl,
          documentName,
          fileBuffer,
          options: { signal },
        })
      ).rejects.toThrow('Network request failed');
    });

    it('should propagate abort error when signal is aborted', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.pdf?presigned';
      const documentName = 'test-document.pdf';
      const fileBuffer = new Uint8Array([1, 2, 3]);
      const controller = new AbortController();
      const signal = controller.signal;
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';

      controller.abort();
      mockUploadFileToS3.mockRejectedValue(abortError);

      await expect(
        uploadFileToS3ForDetection({
          presignedUrl,
          documentName,
          fileBuffer,
          options: { signal },
        })
      ).rejects.toThrow('Aborted');
    });
  });

  describe('parameter validation and edge cases', () => {
    it('should handle headers as empty object', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.pdf?presigned';
      const documentName = 'test-document.pdf';
      const fileBuffer = new Uint8Array([1, 2, 3]);
      const headers = {};
      const signal = new AbortController().signal;

      mockUploadFileToS3.mockResolvedValue('success');

      await uploadFileToS3ForDetection({
        presignedUrl,
        documentName,
        fileBuffer,
        headers,
        options: { signal },
      });

      expect(mockUploadFileToS3).toHaveBeenCalledWith({
        file: expect.any(File),
        presignedUrl,
        headers: {},
        options: { signal },
      });
    });

    it('should handle headers with special characters', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.pdf?presigned';
      const documentName = 'test-document.pdf';
      const fileBuffer = new Uint8Array([1, 2, 3]);
      const headers = {
        'X-Special-Header': 'value with spaces',
        'X-Another-Header': 'value-with-dashes',
        'X-Header-3': 'value_with_underscores',
      };
      const signal = new AbortController().signal;

      mockUploadFileToS3.mockResolvedValue('success');

      await uploadFileToS3ForDetection({
        presignedUrl,
        documentName,
        fileBuffer,
        headers,
        options: { signal },
      });

      expect(mockUploadFileToS3).toHaveBeenCalledWith({
        file: expect.any(File),
        presignedUrl,
        headers,
        options: { signal },
      });
    });

    it('should pass signal correctly to uploadFileToS3', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.pdf?presigned';
      const documentName = 'test-document.pdf';
      const fileBuffer = new Uint8Array([1, 2, 3]);
      const controller = new AbortController();
      const signal = controller.signal;

      mockUploadFileToS3.mockResolvedValue('success');

      await uploadFileToS3ForDetection({
        presignedUrl,
        documentName,
        fileBuffer,
        options: { signal },
      });

      expect(mockUploadFileToS3).toHaveBeenCalledWith({
        file: expect.any(File),
        presignedUrl,
        headers: undefined,
        options: { signal },
      });

      // Verify signal is the same instance
      const passedSignal = mockUploadFileToS3.mock.calls[0][0].options.signal;
      expect(passedSignal).toBe(signal);
    });

    it('should create File with PDF MIME type', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.pdf?presigned';
      const documentName = 'test-document.pdf';
      const fileBuffer = new Uint8Array([1, 2, 3]);
      const signal = new AbortController().signal;

      mockUploadFileToS3.mockResolvedValue('success');

      await uploadFileToS3ForDetection({
        presignedUrl,
        documentName,
        fileBuffer,
        options: { signal },
      });

      const fileArg = mockUploadFileToS3.mock.calls[0][0].file;
      expect(fileArg.type).toBe(general.PDF);
      expect(fileArg.type).toBe('application/pdf');
    });
  });

  describe('integration with documentServices', () => {
    it('should call uploadFileToS3 with correct parameter structure', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.pdf?presigned';
      const documentName = 'test-document.pdf';
      const fileBuffer = new Uint8Array([1, 2, 3, 4, 5]);
      const headers = { 'X-Custom': 'value' };
      const signal = new AbortController().signal;

      mockUploadFileToS3.mockResolvedValue('success');

      await uploadFileToS3ForDetection({
        presignedUrl,
        documentName,
        fileBuffer,
        headers,
        options: { signal },
      });

      expect(mockUploadFileToS3).toHaveBeenCalledTimes(1);
      const callArgs = mockUploadFileToS3.mock.calls[0][0];
      
      expect(callArgs).toHaveProperty('file');
      expect(callArgs).toHaveProperty('presignedUrl', presignedUrl);
      expect(callArgs).toHaveProperty('headers', headers);
      expect(callArgs).toHaveProperty('options');
      expect(callArgs.options).toHaveProperty('signal', signal);
      
      expect(callArgs.file).toBeInstanceOf(File);
      expect(callArgs.file.name).toBe(documentName);
      expect(callArgs.file.type).toBe(general.PDF);
    });

    it('should handle when uploadFileToS3 returns different response types', async () => {
      const presignedUrl = 'https://s3.amazonaws.com/bucket/file.pdf?presigned';
      const documentName = 'test-document.pdf';
      const fileBuffer = new Uint8Array([1, 2, 3]);
      const signal = new AbortController().signal;

      const responses = ['success', '', null, undefined, { status: 200 }, 200];

      for (const mockResponse of responses) {
        mockUploadFileToS3.mockResolvedValue(mockResponse);

        const result = await uploadFileToS3ForDetection({
          presignedUrl,
          documentName,
          fileBuffer,
          options: { signal },
        });

        expect(result).toBe(mockResponse);
      }
    });
  });
});
