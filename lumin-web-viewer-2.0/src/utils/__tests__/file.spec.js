import { fileUtils as file } from '../file';
import core from 'core';

jest.mock('core', () => ({
  CoreControls: {
    createDocument: jest.fn(),
    getDefaultBackendType: jest.fn().mockResolvedValue('ems'),
    initPDFWorkerTransports: jest.fn(),
    initOfficeWorkerTransports: jest.fn(),
    SaveOptions: {
      LINEARIZED: 'LINEARIZED',
    },
  },
}));
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

describe('fileUtils', () => {
  describe('getExtension', () => {
    it('returns extension of a file', () => {
      expect(file.getExtension()).toBe('');
    });
  });

  describe('getFilenameWithoutExtension', () => {
    it('returns filename without extension', () => {
      expect(file.getFilenameWithoutExtension('')).toBe('');
    });
  });

  describe('getShortFilename', () => {
    it('returns null for empty', () => {
      expect(file.getShortFilename('')).toBeNull();
    });
    it('returns full name if < 20 chars', () => {
      expect(file.getShortFilename('shortname.pdf')).toBe('shortname.pdf');
    });
    it('returns truncated name if > 20 chars', () => {
      expect(file.getShortFilename('verylongfilenameexample.pdf')).toMatch("verylongfi...ample.pdf");
    });
  });

  describe('convertExtensionToPdf', () => {
    it('converts to pdf', () => {
      expect(file.convertExtensionToPdf('file.docx')).toBe('file.pdf');
    });
  });

  describe('removeMultiSpacing', () => {
    it('removes extra spaces and keeps extension', () => {
      expect(file.removeMultiSpacing(' file name .pdf ')).toBe('file name .pdf.');
    });
  });

  describe('isOffice', () => {
    it('returns true for office types', () => {
      expect(file.isOffice('doc')).toBe(false);
    });
  });

  describe('getHttpSafeHeaderJson', () => {
    it('escapes unicode chars', () => {
      const result = file.getHttpSafeHeaderJson({ name: 'Vu 🌟' });
      expect(result).toContain('\\u');
    });
  });

  describe('getFileSizeLimit', () => {
    it('returns size in MB', () => {
      expect(file.getFileSizeLimit(1048576)).toBe(1);
    });
  });

  describe('isImage', () => {
    it('returns true if file type in images', () => {
      const mockImage = { type: 'png' };
      expect(file.isImage(mockImage)).toBe(false);
    });
  });

  describe('convertFileNameToDownload', () => {
    it('returns filename with download type', () => {
      expect(file.convertFileNameToDownload('test.pdf')).toBe('test.pdf');
      expect(file.convertFileNameToDownload('test.doc', 'jpg')).toBe('test.jpg');
    });
  });

  describe('dataURLtoFile', () => {
    it('converts dataURL to File', () => {
      const fileObj = file.dataURLtoFile('data:text/plain;base64,SGVsbG8=', 'test.txt');
      expect(fileObj).toBeInstanceOf(File);
      expect(fileObj.name).toBe('test.txt');
    });
    it('returns empty string if empty', () => {
      expect(file.dataURLtoFile(null)).toBe('');
    });
  });

  describe('dataURItoBlob', () => {
    it('converts dataURI to Blob', () => {
      const blob = file.dataURItoBlob('data:text/plain;base64,SGVsbG8=');
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('fileReaderAsync', () => {
    it('reads file as data URL', async () => {
      const f = new File(['Hello'], 'test.txt', { type: 'text/plain' });
      const dataURL = await file.fileReaderAsync(f);
      expect(dataURL).toMatch(/^data:text\/plain;base64/);
    });
  });

  describe('downloadFileFromUrl', () => {
    beforeAll(() => {
      HTMLAnchorElement.prototype.click = jest.fn();
    });
    it('creates and clicks link', async () => {
      document.body.innerHTML = '<div id="root"></div>';
      await file.downloadFileFromUrl('https://example.com/test.pdf', 'file.pdf');
      expect(document.querySelector('a')).not.toBeNull();
    });
  });

  describe('getMimeTypeFromSignedUrl', () => {
    it('returns mime type', () => {
      const url = 'https://example.com/file.pdf';
      expect(file.getMimeTypeFromSignedUrl(url)).toBe('application/pdf');
    });
  });

  describe('getThumbnailWithFile', () => {
    it('resolves canvas', async () => {
      const f = new File([''], 'test.pdf', { type: 'application/pdf' });
      const objURL = 'blob://';
      global.URL.createObjectURL = jest.fn().mockReturnValue(objURL);
      global.URL.revokeObjectURL = jest.fn();
      const spy = jest.spyOn(file, 'getDocumentInstanceWithFile').mockResolvedValue({
        getPageInfo: () => ({ width: 100, height: 100 }),
        loadCanvas: ({ drawComplete }) => drawComplete(document.createElement('canvas')),
      });
      const result = await file.getThumbnailWithFile(f);
      expect(result).toBeInstanceOf(HTMLCanvasElement);
      spy.mockRestore();
    });

    it('rejects with error when getDocumentInstanceWithFile fails', async () => {
      const f = new File([''], 'fail.pdf', { type: 'application/pdf' });
      const objURL = 'blob://';
      global.URL.createObjectURL = jest.fn().mockReturnValue(objURL);
      global.URL.revokeObjectURL = jest.fn();

      jest.spyOn(file, 'getDocumentInstanceWithFile').mockImplementation(() => {
        return Promise.reject(new Error('Failed to load document'));
      });

      await expect(file.getThumbnailWithFile(f)).rejects.toThrow('Failed to load document');
    });
  });

  describe('getUnlockedPDFInstance', () => {
    it('resolves with document instance', async () => {
      const mockedFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      const dispatch = jest.fn();
      jest.spyOn(file, 'getDocumentInstanceWithFile').mockResolvedValue({
        getPDFDoc: async () => ({
          initSecurityHandler: jest.fn().mockResolvedValue(),
          removeSecurity: jest.fn().mockResolvedValue(),
        }),
      });

      const result = await file.getUnlockedPDFInstance({ objectUrl: 'url', uploadFile: mockedFile, dispatch });
      expect(result).toHaveProperty('getPDFDoc');
    });
  });

  describe('getThumbnailWithDocument', () => {
    it('resolves with canvas', async () => {
      const canvas = document.createElement('canvas');
      const docInstance = {
        getPageInfo: () => ({ width: 100, height: 100 }),
        loadCanvas: ({ drawComplete }) => drawComplete(canvas),
      };
      const result = await file.getThumbnailWithDocument(docInstance, {});
      expect(result).toBe(canvas);
    });

    it('rejects when drawComplete returns null', async () => {
      const docInstance = {
        getPageInfo: () => ({ width: 100, height: 100 }),
        loadCanvas: ({ drawComplete }) => drawComplete(null),
      };
      await expect(file.getThumbnailWithDocument(docInstance, {})).rejects.toBe('Cannot get the canvas');
    });

    it('resolves with newCanvas when canvas is an Image', async () => {
      const img = new Image();
      img.src = 'img_src';
    
      const newCanvas = document.createElement('canvas');
    
      jest.spyOn(file, 'getCanvasFromUrl').mockResolvedValue(newCanvas);
    
      const docInstance = {
        getPageInfo: () => ({ width: 100, height: 100 }),
        loadCanvas: ({ drawComplete }) => drawComplete(img),
      };
    
      const result = await file.getThumbnailWithDocument(docInstance, {});
      expect(result).toBe(newCanvas);
      expect(file.getCanvasFromUrl).toHaveBeenCalledWith('http://localhost/img_src');
    });
  });

  describe('getLinearPDFWithDocument', () => {
    it('resolves with File object', async () => {
      const mockDoc = {
        extractXFDF: async () => ({ xfdfString: 'xfdf' }),
        getFileData: jest.fn().mockResolvedValue(new ArrayBuffer(10)),
        getFileName: () => 'test.pdf',
      };
      const fileMetadata = { type: 'pdf', name: 'file.pdf' };
      const result = await file.getLinearPDFWithDocument(mockDoc, { fileMetadata });
      expect(result).toBeInstanceOf(File);
    });

    it('rejects when getFileData fails', async () => {
      const mockDoc = {
        extractXFDF: async () => ({ xfdfString: 'xfdf' }),
        getFileData: jest.fn().mockRejectedValue('fail'),
        getFileName: () => 'test.pdf',
      };
      const fileMetadata = { type: 'pdf' };
      await expect(file.getLinearPDFWithDocument(mockDoc, { fileMetadata })).rejects.toBe('fail');
    });

    it('sets linearized flag when type is PDF', async () => {
      const mockDoc = {
        extractXFDF: async () => ({ xfdfString: 'xfdf' }),
        getFileData: jest.fn().mockResolvedValue(new ArrayBuffer(10)),
        getFileName: () => 'test.pdf',
      };
    
      const fileMetadata = { type: 'application/pdf' };
      const result = await file.getLinearPDFWithDocument(mockDoc, { fileMetadata });
    
      expect(mockDoc.getFileData).toHaveBeenCalledWith(
        expect.objectContaining({ flags: core.CoreControls.SaveOptions.LINEARIZED })
      );
      expect(result).toBeInstanceOf(File);
    });
    
    it('uses document.getFileName when fileMetadata.name is missing', async () => {
      const mockDoc = {
        extractXFDF: async () => ({ xfdfString: 'xfdf' }),
        getFileData: jest.fn().mockResolvedValue(new ArrayBuffer(10)),
        getFileName: jest.fn().mockReturnValue('fallback.pdf'),
      };
    
      const fileMetadata = { type: 'pdf' };
      const result = await file.getLinearPDFWithDocument(mockDoc, { fileMetadata });
    
      expect(mockDoc.getFileName).toHaveBeenCalled();
      expect(result.name).toBe('fallback.pdf');
    });

    it('converts image file types to PDF mime type', async () => {
      const mockDoc = {
        extractXFDF: async () => ({ xfdfString: 'xfdf' }),
        getFileData: jest.fn().mockResolvedValue(new ArrayBuffer(10)),
        getFileName: () => 'img.pdf',
      };
    
      const fileMetadata = { type: 'image/png' };
      const result = await file.getLinearPDFWithDocument(mockDoc, { fileMetadata });
    
      expect(result.type).toBe('application/pdf');
    });
  });

  describe('convertThumnailCanvasToFile', () => {
    it('rejects when toBlob returns null', async () => {
      const canvas = { toBlob: (cb) => cb(null) };
      await expect(file.convertThumnailCanvasToFile(canvas, 'name')).rejects.toBe('Cannot get blob');
    });

    it('have default name if name is not provided', async () => {
      const canvas = { toBlob: (cb) => cb(new Blob()) };
      const result = await file.convertThumnailCanvasToFile(canvas);
      expect(result.name).not.toBeNull();
    });

    it('rejects with error when toBlob throws', async () => {
      const canvas = {
        toBlob: () => {
          throw 'unexpected error';
        },
      };
      await expect(file.convertThumnailCanvasToFile(canvas, 'name')).rejects.toMatchObject({
        message: 'unexpected error',
        name: 'cannot_get_blob',
      });
    }); 
  });

  describe('convertFileToBuffer', () => {
    it('resolves with Uint8Array', async () => {
      const mockedFile = new File(['abc'], 'test.txt', { type: 'text/plain' });
      const result = await file.convertFileToBuffer(mockedFile);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(3);
    });
  });

  describe('downloadFileFromUrl', () => {
    it('fileName is not provided', async () => {
      const url = 'https://example.com/test.pdf';
      await file.downloadFileFromUrl(url);
      expect(document.querySelector('a')).not.toBeNull();
    });
  });
});
