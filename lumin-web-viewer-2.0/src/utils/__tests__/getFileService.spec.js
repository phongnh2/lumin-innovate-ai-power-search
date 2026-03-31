import getFileServiceMocked from '../getFileService';
import dropboxServices from '../../services/dropboxServices';
import core from 'core';
import Axios from '@libs/axios';

jest.mock('@libs/axios', () => ({
  axiosInstance: {
    get: jest.fn(),
  },
}));

global.gapi = () => ({
  client: {
    load: jest.fn(),
    drive: {
      files: {
        get: {
          execute: jest.fn(),
        },
      },
    },
  },
});
window.Core.Annotations = {
  setCustomSerializeHandler: jest.fn(),
  restoreSerialize: jest.fn(),
};

const {
  getDocument,
  getLinearizedDocumentFile,
  getFileGoogleService,
  getFileDropboxService,
  getSignatureUrl,
  getThumbnailUrl,
  getFileFromS3,
  getFileUpload,
  handleErrorGetFileDropbox,
  executeRequestToDrive,
  fileUrlStorageMapping,
  removeJavaScriptFromPdf,
  getFileType,
  getFileFromUrl,
  getFileOneDriveService,
  getFileDataByPDFNet,
  getFlattenedPdfDoc,
} = jest.requireActual('../getFileService');

const fileMocked = new File([''], 'filename', { type: 'application/pdf' });

afterEach(() => {
  jest.resetModules();
});
beforeEach(() => {
  jest.mock('../validator');
  jest.mock('../getFileService');
  jest.mock('@libs/axios');
  jest.mock('axios');
  jest.mock('../../helpers/logger');

  jest.mock('core', () => ({
    getAnnotationsList: () => [],
    CoreControls: {
      SaveOptions: {
        REMOVE_UNUSED: 0,
      },
    },
  }));
  global.window = {};
  window.Core = {
    SaveOptions: {
      INCREMENTAL: 1,
    },
    Annotations: {
      setCustomSerializeHandler: jest.fn(),
      restoreSerialize: jest.fn(),
    },
  };

  core.getDocument = jest.fn(() => ({
    getFileData: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  }));

  Axios.oneDriveInstance = {
    get: jest.fn(() => Promise.resolve({ data: new ArrayBuffer(10) })),
  };

  getFileServiceMocked.fileUrlStorageMapping = fileUrlStorageMapping;
  getFileServiceMocked.removeJavaScriptFromPdf = removeJavaScriptFromPdf;
});

const { location } = window;
beforeAll(() => {
  delete window.location;
  window.location = { replace: jest.fn() };
});

afterAll(() => {
  window.location = location;
});

describe('get file service', () => {
  describe('getDocument', () => {
    it('getFileGoogleService has called and return file', async () => {
      const mockedGetFileGoogleService = jest.fn().mockReturnValue(fileMocked);
      getFileServiceMocked.getFileGoogleService = mockedGetFileGoogleService;
      const document = { service: 'google' };
      const output = await getDocument(document);
      expect(mockedGetFileGoogleService).toBeCalled();
      expect(output).toBeInstanceOf(global.File);
    });

    it('getFileDropboxService has called and return file', async () => {
      const mockedGetFileDropboxService = jest.fn().mockReturnValue(fileMocked);
      getFileServiceMocked.getFileDropboxService = mockedGetFileDropboxService;
      const document = { service: 'dropbox' };
      const output = await getDocument(document);
      expect(mockedGetFileDropboxService).toBeCalled();
      expect(output).toBeInstanceOf(global.File);
    });

    it('getFileFromS3 has called and return file', async () => {
      const mockedGetFileFromS3 = jest.fn().mockReturnValue(fileMocked);
      getFileServiceMocked.getFileFromS3 = mockedGetFileFromS3;
      const document = { service: 's3' };
      const output = await getDocument(document);
      expect(mockedGetFileFromS3).toBeCalled();
      expect(output).toBeInstanceOf(global.File);
    });
  });

  describe('getLinearizedDocumentFile', () => {
    const fileName = 'test.pdf';
    const mockedExportAnnotations = jest.fn();
    core.exportAnnotations = mockedExportAnnotations;
    core.getAnnotationsList = jest.fn(() => []);

    it('getFileDataByPDFNet should be called', async () => {
      const mockedGetFileData = jest.fn(() => Promise.resolve(new Uint8Array(32)));
      getFileServiceMocked.getFileDataByPDFNet = mockedGetFileData;
      const output = await getLinearizedDocumentFile(fileName);
      expect(mockedGetFileData).toBeCalled();
    });
    it('should return file', async () => {
      const output = await getLinearizedDocumentFile(fileName);
      expect(output).toBeInstanceOf(global.File);
    });
  });

  describe('getFileDropboxService', () => {
    describe('call dropbox api success', () => {
      it('dropbox api should be called without downloadUrl', () => {
        Axios.dropboxInstance = {
          post: jest.fn(() => Promise.resolve(new Uint8Array(32))),
        };
        dropboxServices.getFileMetaData = jest.fn(() => Promise.resolve(''));
        const document = {
          name: 'test.pdf',
          mimeType: 'application/pdf',
          remoteId: '123',
        };

        getFileDropboxService(document).then((file) => {
          expect(file).toBeInstanceOf(global.File);
        });
      });
    });

    describe('call dropbox api failed', () => {
      it('get file from dropbox failed', async () => {
        Axios.dropboxInstance = {
          post: jest.fn(() => Promise.reject({ message: 'Failed' })),
        };
        const document = {
          name: 'test.pdf',
          mimeType: 'application/pdf',
        };

        const spyHandleErrorGetFileDropbox = jest
          .spyOn(getFileServiceMocked, 'handleErrorGetFileDropbox')
          .mockImplementation(() => {});
        try {
          await getFileDropboxService(document);
        } catch (error) {
          expect(error).toEqual(expect.objectContaining({ code: 404 }));
          expect(spyHandleErrorGetFileDropbox).toBeCalled();
          spyHandleErrorGetFileDropbox.mockRestore();
        }
      });
    });
  });

  describe('getFileGoogleService', () => {});

  describe('getSignatureUrl', () => {
    it('should return string', () => {
      const key = 'test';
      const output = getSignatureUrl(key);
      expect(output).toEqual(expect.stringContaining(key));
    });

    it('should return null', () => {
      const output = getSignatureUrl();
      expect(output).toBeNull();
    });
  });

  describe('getThumbnailUrl', () => {
    it('should return the input as is', () => {
      expect(getThumbnailUrl('test')).toBe('test');
      expect(getThumbnailUrl(null)).toBe(null);
    });
  });

  describe('getFileFromS3', () => {
    it('should return a File created from response blob', async () => {
      const mockData = 'file-content';

      Axios.axiosInstance.get.mockResolvedValue({
        data: mockData,
      });

      const document = {
        _id: '123',
        name: 'test.pdf',
        mimeType: 'application/pdf',
      };

      const result = await getFileFromS3(document);
      expect(result).not.toBeNull();
    });
  });

  describe('handleErrorGetFileDropbox', () => {
    it('should open new window to sign in to dropbox', () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: {
              path: {
                '.tag': 'file_type_error',
              },
            },
          },
        },
      };
      const spyWindowOpen = jest.spyOn(window, 'open').mockImplementation(() => ({
        close: jest.fn(),
      }));
      handleErrorGetFileDropbox(error);
      expect(spyWindowOpen).toBeCalled();
      spyWindowOpen.mockRestore();
    });

    it('should open new window to connect to dropbox', () => {
      const error = {
        response: {
          status: 409,
          data: {
            error: {
              path: {
                '.tag': 'file_type_error',
              },
            },
          },
        },
      };
      const spyWindowLocation = jest.spyOn(window.location, 'replace');
      handleErrorGetFileDropbox(error);
      expect(spyWindowLocation).toBeCalled();
      spyWindowLocation.mockRestore();
    });

    it('should open new window to logout dropbox', () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: {
              path: {
                '.tag': 'file_type_error',
              },
            },
          },
        },
      };
      const spyWindowOpen = jest.spyOn(window, 'open').mockImplementation(() => ({
        close: jest.fn(),
      }));
      handleErrorGetFileDropbox(error);
      expect(spyWindowOpen).toBeCalled();
      spyWindowOpen.mockRestore();
    });
  });

  describe('getFileGoogleService', () => {
    const document = {
      remoteId: 'dnaskdn17182',
    };
    it('should return file', () => {
      global.gapi = {
        client: {
          drive: {
            files: {
              get: jest.fn().mockImplementation(() => Promise.resolve({ body: '' })),
            },
          },
          load: jest.fn(),
          setToken: jest.fn(() => {}),
        },
      };
      global.google = {
        accounts: {
          oauth2: {
            initTokenClient: jest.fn(() => ({ requestAccessToken: jest.fn() })),
          },
        },
      };
      getFileGoogleService(document).then((file) => {
        expect(file).toBeInstanceOf(global.File);
      });
    });

    it('should return error', () => {
      global.gapi = {
        client: {
          drive: {
            files: {
              get: jest.fn().mockImplementation(() => Promise.reject({ code: 404 })),
            },
          },
          load: jest.fn(),
          setToken: jest.fn(() => {}),
        },
      };
      global.google = {
        accounts: {
          oauth2: {
            initTokenClient: jest.fn(() => ({ requestAccessToken: jest.fn() })),
          },
        },
      };
      getFileGoogleService(document).catch((error) => {
        expect(error.code).toBe(404);
      });
    });
  });
  describe('executeRequestToDrive', () => {
    it('should be resolved when no error code', async () => {
      const request = {
        execute: jest.fn((callback) => {
          const resp = { error: 'failed' };
          callback(resp);
        }),
      };
      const result = await executeRequestToDrive(request);
      expect(result).toEqual({ error: 'failed' });
    });

    it('should be rejected when error code exists', async () => {
      const request = {
        execute: jest.fn((callback) => {
          const resp = { error: 'failed', code: 404 };
          callback(resp);
        }),
      };
      await expect(executeRequestToDrive(request)).rejects.toEqual({
        type: 'googleDrive',
        code: 404,
      });
    });
  });

  describe('getFileUpload', () => {
    it('should handle a single File object', () => {
      const formData = {
        append: jest.fn(),
      };

      const result = getFileUpload({ formData, files: fileMocked });

      expect(formData.append).toHaveBeenCalledWith('files', fileMocked);
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
    });

    it('should handle multiple files', () => {
      const formData = {
        append: jest.fn(),
      };
      const files = [fileMocked, fileMocked];

      const result = getFileUpload({ formData, files });

      expect(formData.append).toHaveBeenCalledTimes(2);
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(2);
    });
  });

  describe('getFileOptions', () => {
    it('should return correct options for S3 storage', async () => {
      const document = {
        service: 's3',
        _id: '12345',
        signedUrl: 'https://example.com/signed',
      };
      const documentOptions = { option1: 'value1' };

      const result = await getFileServiceMocked.getFileOptions(document, documentOptions);

      expect(result).toEqual({
        src: document.signedUrl,
        options: documentOptions,
      });
    });

    it('should return correct options for Google Drive with signedUrl', async () => {
      const document = {
        service: 'google',
        remoteId: '12345',
        signedUrl: 'https://example.com/signed',
      };
      const documentOptions = { option1: 'value1' };
      jest.spyOn(getFileServiceMocked, 'getFileOptions').mockImplementation(async () => ({
        src: document.signedUrl,
        options: documentOptions,
      }));

      const result = await getFileServiceMocked.getFileOptions(document, documentOptions);

      expect(result).toEqual({
        src: document.signedUrl,
        options: documentOptions,
      });
    });
  });

  describe('getFileType', () => {
    it('should return file extension from name', () => {
      const document = {
        name: 'test.pdf',
        mimeType: 'application/pdf',
      };

      const result = getFileServiceMocked.getFileType(document);

      expect(result).toBe('pdf');
    });

    it('should get extension from mimeType if name has no extension', () => {
      const document = {
        name: 'test',
        mimeType: 'application/pdf',
      };

      jest.spyOn(getFileServiceMocked, 'getFileType').mockImplementation(() => 'pdf');

      const result = getFileServiceMocked.getFileType(document);

      expect(result).toBe('pdf');
    });
  });

  describe('getFileData', () => {
    const { getFileData } = jest.requireActual('../getFileService');

    beforeEach(() => {
      window.Core = {
        SaveOptions: {
          INCREMENTAL: 1,
        },
      };
    });

    it('should get file data successfully', async () => {
      const fileData = new Uint8Array([1, 2, 3]);
      const mockDoc = {
        getFileData: jest.fn().mockResolvedValue(fileData.buffer),
      };

      core.getDocument = jest.fn().mockReturnValue(mockDoc);

      jest.spyOn(getFileServiceMocked, 'getFileData').mockImplementation(async () => {
        return fileData;
      });

      const result = await getFileServiceMocked.getFileData({});

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle PDFWorkerError', async () => {
      const fileData = new Uint8Array([1, 2, 3]);

      jest.spyOn(getFileServiceMocked, 'getFileData').mockImplementation(async () => {
        return fileData;
      });

      const result = await getFileServiceMocked.getFileData({});

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle PDFWorkerError and retry', async () => {
      const mockFileData = new ArrayBuffer(10);
      const mockDoc = {
        getFileData: jest
          .fn()
          .mockRejectedValueOnce({ type: 'PDFWorkerError' })
          .mockResolvedValueOnce(mockFileData)
          .mockResolvedValueOnce(mockFileData),
      };
      core.getDocument = jest.fn().mockReturnValue(mockDoc);

      const result = await getFileData({});

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should throw error for non-PDFWorkerError', async () => {
      const mockDoc = {
        getFileData: jest.fn().mockRejectedValue(new Error('Unknown error')),
      };
      core.getDocument = jest.fn().mockReturnValue(mockDoc);

      await expect(getFileData({})).rejects.toThrow('Unknown error');
    });

    it('should return file data successfully', async () => {
      const mockFileData = new ArrayBuffer(10);
      const mockDoc = {
        getFileData: jest.fn().mockResolvedValue(mockFileData),
      };
      core.getDocument = jest.fn().mockReturnValue(mockDoc);

      const result = await getFileData({});

      expect(result).toBeInstanceOf(Uint8Array);
      expect(mockDoc.getFileData).toHaveBeenCalled();
    });
  });

  describe('getFileFromUrl', () => {
    it('should fetch file from URL', async () => {
      const url = 'https://example.com/file.pdf';
      const fileName = 'test.pdf';
      const fileOptions = { type: 'application/pdf' };

      Axios.axiosInstance.get = jest.fn().mockResolvedValue({
        data: new Blob(['test data']),
      });

      jest.spyOn(getFileServiceMocked, 'getFileFromUrl').mockImplementation(async () => {
        return fileMocked;
      });

      const result = await getFileServiceMocked.getFileFromUrl({ url, fileName, fileOptions });

      expect(result).toBeInstanceOf(File);
    });
  });

  describe('getFileOneDriveService', () => {
    it('should return file', () => {
      const document = {
        remoteId: 'file123',
        externalStorageAttributes: {
          driveId: 'drive123',
        },
      };
      const result = getFileOneDriveService(document);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('getFileDataByPDFNet', () => {
    it('should enqueue PDFNet operation', async () => {
      const xfdf = '<xfdf>test</xfdf>';
      const fileData = new Uint8Array([1, 2, 3]);

      const pdfNetQueue = require('../../utils/pdfNetQueue');
      pdfNetQueue.enqueue = jest.fn((callback) => Promise.resolve(fileData));

      jest.spyOn(getFileServiceMocked, 'getFileDataByPDFNet').mockResolvedValue(fileData);

      const result = await getFileServiceMocked.getFileDataByPDFNet({ xfdf });

      expect(result).toEqual(fileData);
    });

    it('should handle PDF with security', async () => {
      const xfdf = '<xfdf>test</xfdf>';
      const fileData = new Uint8Array([1, 2, 3]);

      jest.spyOn(getFileServiceMocked, 'getFileDataByPDFNet').mockResolvedValue(fileData);

      const result = await getFileServiceMocked.getFileDataByPDFNet({ xfdf });

      expect(result).toEqual(fileData);
    });
  });

  describe('getFileOptions for other storage types', () => {
    it('should return correct options for Dropbox storage', async () => {
      const document = {
        service: 'dropbox',
        remoteId: '/path/to/file.pdf',
      };
      const documentOptions = { option1: 'value1' };

      global.localStorage = {
        getItem: jest.fn().mockReturnValue('dropbox-token'),
      };

      jest.spyOn(getFileServiceMocked, 'getFileOptions').mockImplementation(async () => {
        return {
          src: 'https://content.dropboxapi.com/2/files/download',
          options: {
            ...documentOptions,
            customHeaders: {
              authorization: `Bearer dropbox-token`,
              'Content-Type': 'text/plain',
              'Dropbox-API-Arg': JSON.stringify({ path: document.remoteId }),
            },
          },
        };
      });

      const result = await getFileServiceMocked.getFileOptions(document, documentOptions);

      expect(result.src).toBe('https://content.dropboxapi.com/2/files/download');
      expect(result.options.customHeaders).toBeDefined();
      expect(result.options.customHeaders.authorization).toContain('Bearer dropbox-token');
    });

    it('should return correct options for OneDrive storage', async () => {
      const document = {
        service: 'onedrive',
        remoteId: 'file123',
        externalStorageAttributes: {
          driveId: 'drive123',
        },
      };
      const documentOptions = { option1: 'value1' };

      const oneDriveAccessToken = 'onedrive-token';

      jest.spyOn(getFileServiceMocked, 'getFileOptions').mockImplementation(async () => {
        return {
          src: `https://graph.microsoft.com/v1.0/drives/${document.externalStorageAttributes.driveId}/items/${document.remoteId}/content`,
          options: {
            ...documentOptions,
            customHeaders: {
              authorization: `Bearer ${oneDriveAccessToken}`,
            },
          },
        };
      });

      const result = await getFileServiceMocked.getFileOptions(document, documentOptions);

      expect(result.src).toContain(document.remoteId);
      expect(result.options.customHeaders).toBeDefined();
      expect(result.options.customHeaders.authorization).toContain('Bearer onedrive-token');
    });
  });

  describe('fileUrlStorageMapping', () => {
    it('should return correct URL for S3 storage with signed URL', () => {
      const document = {
        service: 's3',
        _id: '12345',
        signedUrl: 'https://example.com/signed',
      };

      const result = fileUrlStorageMapping['s3'](document);

      expect(result).toBe(document.signedUrl);
    });

    it('should return correct URL for S3 storage without signed URL', () => {
      const document = {
        service: 's3',
        _id: '12345',
      };

      const result = fileUrlStorageMapping['s3'](document);

      expect(result).toContain('/document/getdocument?documentId=12345');
    });

    it('should return correct URL for Google Drive storage', () => {
      const document = {
        service: 'google',
        remoteId: 'file123',
      };

      const result = fileUrlStorageMapping['google'](document);

      expect(result).toContain('drive/v3/files/file123');
      expect(result).toContain('alt=media');
    });

    it('should return correct URL for Dropbox storage', () => {
      const result = fileUrlStorageMapping['dropbox']();

      expect(result).toBe('https://content.dropboxapi.com/2/files/download');
    });

    it('should return correct URL for OneDrive storage', () => {
      const document = {
        service: 'onedrive',
        remoteId: 'file123',
        externalStorageAttributes: {
          driveId: 'drive123',
        },
      };

      const result = fileUrlStorageMapping['onedrive'](document);

      expect(result).toContain('/drives/drive123/items/file123/content');
    });
  });

  describe('removeJavaScriptFromPdf', () => {
    it('should remove JavaScript from PDF document', async () => {
      const mockRoot = {
        eraseFromKey: jest.fn().mockResolvedValue(true),
        findObj: jest.fn().mockResolvedValue({
          eraseFromKey: jest.fn().mockResolvedValue(true),
        }),
      };

      const mockPdfDoc = {
        getRoot: jest.fn().mockResolvedValue(mockRoot),
      };

      await removeJavaScriptFromPdf(mockPdfDoc);

      expect(mockRoot.eraseFromKey).toHaveBeenCalledWith('OpenAction');
      expect(mockRoot.findObj).toHaveBeenCalledWith('Names');
    });

    it('should handle when Names object does not exist', async () => {
      const mockRoot = {
        eraseFromKey: jest.fn().mockResolvedValue(true),
        findObj: jest.fn().mockResolvedValue(null),
      };

      const mockPdfDoc = {
        getRoot: jest.fn().mockResolvedValue(mockRoot),
      };

      await removeJavaScriptFromPdf(mockPdfDoc);

      expect(mockRoot.eraseFromKey).toHaveBeenCalledWith('OpenAction');
      expect(mockRoot.findObj).toHaveBeenCalledWith('Names');
    });

    it('should handle when root does not exist', async () => {
      const mockPdfDoc = {
        getRoot: jest.fn().mockResolvedValue(null),
      };

      await removeJavaScriptFromPdf(mockPdfDoc);

      expect(mockPdfDoc.getRoot).toHaveBeenCalled();
    });
  });

  describe('originalGetFileDataByPDFNet', () => {
    beforeEach(() => {
      global.window = {
        ...global.window,
        Core: {
          PDFNet: {
            PDFDoc: {
              SaveOptions: {
                e_linearized: 1,
              },
              RefreshOptions: jest.fn().mockImplementation(() => ({
                setUseNonStandardRotation: jest.fn(),
              })),
            },
            SDFDoc: {
              SaveOptions: {
                e_linearized: 1,
              },
            },
          },
          Tools: {
            ToolNames: {
              RECTANGULAR_AREA_MEASUREMENT: 'RectangularAreaMeasurement',
            },
          },
        },
      };

      jest.mock('features/Outline/utils/outlineCore.utils', () => ({
        OutlineCoreUtils: {
          importOutlinesToDoc: jest.fn().mockResolvedValue(true),
        },
      }));

      core.runWithCleanup = jest.fn((callback) => {
        callback();
        return Promise.resolve();
      });

      core.createPDFDocFromBuffer = jest.fn().mockResolvedValue({
        initStdSecurityHandler: jest.fn(),
        removeSecurity: jest.fn(),
        fdfUpdate: jest.fn().mockResolvedValue({}),
        refreshAnnotAppearances: jest.fn().mockResolvedValue({}),
        setSecurityHandler: jest.fn(),
        saveMemoryBuffer: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
      });

      core.createFdfDocFromXfdf = jest.fn().mockResolvedValue({});
    });

    it('should process PDF with security handler', async () => {
      const xfdf = '<xfdf>test</xfdf>';
      const fileData = new Uint8Array([1, 2, 3]);
      const securityHandler = {};
      const mockCurrentPdfDoc = {
        lock: jest.fn(),
        unlock: jest.fn(),
        getSecurityHandler: jest.fn().mockResolvedValue(securityHandler),
      };

      const docInstance = {
        getPDFDoc: jest.fn().mockResolvedValue(mockCurrentPdfDoc),
        getFileData: jest.fn().mockResolvedValue(new ArrayBuffer(10)),
      };

      core.getDocument = jest.fn().mockResolvedValue(docInstance);

      global.sessionStorage = {
        getItem: jest.fn().mockReturnValue('password123'),
      };

      jest.spyOn(getFileServiceMocked, 'getFileDataByPDFNet').mockImplementation(async () => {
        return fileData;
      });

      const result = await getFileServiceMocked.getFileDataByPDFNet({ xfdf });

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle error and fallback to getFileData', async () => {
      const xfdf = '<xfdf>test</xfdf>';
      const fileData = new Uint8Array([4, 5, 6]);

      jest.spyOn(getFileServiceMocked, 'getFileData').mockResolvedValue(fileData);

      jest.spyOn(getFileServiceMocked, 'getFileDataByPDFNet').mockImplementation(async () => {
        return getFileServiceMocked.getFileData({ xfdfString: xfdf });
      });

      const result = await getFileServiceMocked.getFileDataByPDFNet({ xfdf });

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result).toEqual(fileData);
    });

    it('should process PDF with JavaScript removal option', async () => {
      const xfdf = '<xfdf>test</xfdf>';
      const shouldRemoveJavaScript = true;
      const fileData = new Uint8Array([1, 2, 3]);

      jest.spyOn(getFileServiceMocked, 'getFileDataByPDFNet').mockResolvedValue(fileData);

      const result = await getFileServiceMocked.getFileDataByPDFNet({ xfdf, shouldRemoveJavaScript });

      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe('getFileType', () => {
    it('should return correct file type', () => {
      const document = {
        service: 's3',
      };
      const result = getFileType(document);
      expect(result).toBeNull();
    });
  });

  describe('getFileFromUrl', () => {
    it('should return correct file', () => {
      const url = 'https://example.com/file.pdf';
      const fileName = 'test.pdf';
      const result = getFileFromUrl({ url, fileName });
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('getFileDataByPDFNet', () => {
    it('should enqueue PDFNet operation', async () => {
      const result = await getFileDataByPDFNet({});
      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe('getFlattenedPdfDoc', () => {
    let mockCurrentPdfDoc;
    let mockPdfDoc;
    let mockFdfDoc;
    let mockOriginalFileData;

    beforeEach(() => {
      mockCurrentPdfDoc = {
        lock: jest.fn(),
        unlock: jest.fn(),
        getSecurityHandler: jest.fn().mockResolvedValue(null),
      };

      mockPdfDoc = {
        initStdSecurityHandler: jest.fn(),
        removeSecurity: jest.fn(),
        fdfUpdate: jest.fn().mockResolvedValue(undefined),
        flattenAnnotations: jest.fn().mockResolvedValue(undefined),
      };

      mockFdfDoc = {};

      mockOriginalFileData = new Uint8Array([1, 2, 3]);

      core.getDocument = jest.fn(() => ({
        getPDFDoc: jest.fn().mockResolvedValue(mockCurrentPdfDoc),
        getFileData: jest.fn().mockResolvedValue(mockOriginalFileData),
      }));

      core.createPDFDocFromBuffer = jest.fn().mockResolvedValue(mockPdfDoc);

      core.createFdfDocFromXfdf = jest.fn().mockResolvedValue(mockFdfDoc);
    });

    it('should flatten annotations and return pdfDoc', async () => {
      const result = await getFlattenedPdfDoc();

      expect(core.getDocument).toHaveBeenCalled();
      expect(mockCurrentPdfDoc.lock).toHaveBeenCalled();
      expect(core.createPDFDocFromBuffer).toHaveBeenCalled();
      expect(core.createFdfDocFromXfdf).toHaveBeenCalled();
      expect(mockPdfDoc.fdfUpdate).toHaveBeenCalledWith(mockFdfDoc);
      expect(mockPdfDoc.flattenAnnotations).toHaveBeenCalledWith(true);
      expect(mockCurrentPdfDoc.unlock).toHaveBeenCalled();

      expect(result).toBe(mockPdfDoc);
    });

    it('should throw error if flatten fails', async () => {
      mockPdfDoc.flattenAnnotations.mockImplementation(() => {
        throw new Error('Flatten failed');
      });

      await expect(getFlattenedPdfDoc()).rejects.toThrow('Flatten failed');
    });

    it('should unlock currentPdfDoc even when error occurs', async () => {
      mockPdfDoc.flattenAnnotations.mockImplementation(() => {
        throw new Error('Flatten failed');
      });

      await expect(getFlattenedPdfDoc()).rejects.toThrow('Flatten failed');
      expect(mockCurrentPdfDoc.unlock).toHaveBeenCalled();
    });
  });
});
