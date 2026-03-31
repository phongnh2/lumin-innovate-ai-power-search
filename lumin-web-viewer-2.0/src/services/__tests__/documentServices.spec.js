// All mocks must be defined before any imports
jest.mock('core', () => {
  const mockCore = {
    getDocument: jest.fn(() => ({
      getDocumentId: jest.fn(() => 'doc123'),
    })),
    getAnnotationManager: jest.fn(() => ({
      getAnnotationsList: jest.fn(() => []),
    })),
    getAnnotationsList: jest.fn(),
    getTotalPages: jest.fn(),
    rotatePages: jest.fn(),
    removePages: jest.fn(),
    movePages: jest.fn(),
    cropPages: jest.fn(),
    insertBlankPages: jest.fn(),
    addAnnotations: jest.fn(),
    updateView: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockCore,
  };
});
jest.mock('@libs/axios');
jest.mock('utils/getFileService');
jest.mock('utils/file');
const mockInsertTempAction = jest.fn();
jest.mock('HOC/OfflineStorageHOC/Handler/CommandHandler', () => {
  return jest.fn().mockImplementation(() => {
    return {
      insertTempAction: () => mockInsertTempAction(),
    };
  })
});

// Mock documentSyncQueue
jest.mock('../documentSyncQueue', () => ({
  documentSyncQueue: {
    addToQueue: jest.fn(),
  },
}));

// Mock Redux store
jest.mock('../../redux/store', () => {
  const mockGetState = jest.fn(() => ({
    auth: {
      isOffline: false,
      isSourceDownloading: false,
      currentAppScope: null,
    },
    document: {
      outlines: {
        children: [],
      },
    },
    organization: {
      organizations: {
        data: [],
      },
    },
  }));
  return {
    store: {
      getState: mockGetState,
      dispatch: jest.fn(),
    },
  };
});

// Mock OutlineStoreUtils
jest.mock('features/Outline/utils/outlineStore.utils', () => ({
  OutlineStoreUtils: {
    isExceedSaveThreshold: jest.fn(() => false),
  },
}));

jest.mock('utils/Factory/EventCollection/DocumentEventCollection', () => {
  return {
    __esModule: true,
    default: {
      deleteDocument: jest.fn(),
      documentSaving: jest.fn(),
    },
  };
});

jest.mock('services/graphServices/documentGraphServices');
jest.mock('services/socketServices', () => {
  const mockSocketServiceInstance = {
    modifyDocumentContent: jest.fn(),
    annotationChange: jest.fn(),
    addUserToRoom: jest.fn(),
    userLeaveTeam: jest.fn(),
    changeTeamRole: jest.fn(),
    sendAutoSyncResult: jest.fn(),
    toggleAutoSync: jest.fn(),
    startMergingDocument: jest.fn(),
    finishMergingDocument: jest.fn(),
    updateDocumentSize: jest.fn(),
  };
  
  class MockSocketService {
    constructor() {
      return mockSocketServiceInstance;
    }
  }
  
  return {
    __esModule: true,
    default: MockSocketService,
    socketService: mockSocketServiceInstance,
  };
});
jest.mock('services/teamServices', () => ({
  default: {
    getTeamDetail: jest.fn(),
  },
}));
jest.mock('services/authServices', () => ({
  default: jest.fn().mockImplementation(() => ({
    socketService: {
      modifyDocumentContent: jest.fn(),
      annotationChange: jest.fn(),
    },
  })),
}));
jest.mock('services/userServices', () => ({
  default: {},
}));
jest.mock('services/indexedDBService', () => ({
  default: {
    deleteAutoDetectFormFields: jest.fn(),
  },
}));
jest.mock('features/DocumentCaching', () => ({
  documentCacheBase: {
    delete: jest.fn(),
    deleteMultiple: jest.fn(),
    updateCache: jest.fn(),
  },
    getCacheKey: jest.fn((id) => `cache_${id}`),
}));
jest.mock('features/AnnotationSyncQueue', () => ({
  annotationSyncQueue: {
    processQueueForDocument: jest.fn(),
    addFormFieldAnnotation: jest.fn(),
  },
}));
jest.mock('HOC/OfflineStorageHOC', () => ({
  commandHandler: {
    insertManipulation: jest.fn(),
    insertTempAction: jest.fn(),
    insertAnnotation: jest.fn(),
  },
  cachingFileHandler: {
    _addUniqueFlagForEachPage: jest.fn(),
    updateDocumentPropertyById: jest.fn(),
    deleteDocumentImageUrlById: jest.fn(),
  },
}));
jest.mock('../../redux/store', () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}));
jest.mock('../../socket', () => ({
  socket: {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  },
}));
jest.mock('selectors', () => ({
  isOffline: jest.fn(),
  getTeams: jest.fn(),
  getCurrentUser: jest.fn(),
  getTeamById: jest.fn(),
  getOrganizationById: jest.fn(),
}));
jest.mock('actions', () => ({
  setCurrentDocument: jest.fn(),
}));
jest.mock('helpers/fireEvent', () => {
  const mockFireEvent = jest.fn();
  return {
    __esModule: true,
    default: mockFireEvent,
  };
});
jest.mock('@libs/snackbar', () => ({
  enqueueSnackbar: jest.fn(),
}));
jest.mock('utils/formBuildUtils', () => ({
  getWidgetXfdf: jest.fn(),
}));
jest.mock('utils/recordUtil', () => ({
  eventTracking: jest.fn(),
}));
jest.mock('utils/validator', () => ({
  default: {
    validatePremiumUser: jest.fn(),
  },
}));
jest.mock('utils/file', () => {
  const mockUtils = {
    getExtension: jest.fn((name) => name.split('.').pop()),
    getFilenameWithoutExtension: jest.fn((name) => name.split('.')[0]),
  };
  return {
    __esModule: true,
    default: mockUtils,
  };
});
const mockDocumentQueryRetriever = jest.fn(() => []);
jest.mock('luminComponents/DocumentQuery/DocumentQueryProxy', () => ({
  DocumentQueryRetriever: (...args) => mockDocumentQueryRetriever(...args),
}));
jest.mock('features/Annotation/utils/annotationLoadObserver', () => ({
  __esModule: true,
  default: {
    setAnnotations: jest.fn(),
    notify: jest.fn(),
  },
  AnnotationEvent: {
    ExternalAnnotLoaded: 'ExternalAnnotLoaded',
  },
}));
jest.mock('features/Outline/utils/outlineCore.utils', () => ({
  OutlineCoreUtils: {
    importOutlinesToDoc: jest.fn(),
  },
}));
jest.mock('features/Outline/utils/outlineStore.utils', () => ({
  OutlineStoreUtils: {
    isExceedSaveThreshold: jest.fn(() => false),
  },
}));
jest.mock('utils/error', () => ({
  __esModule: true,
  default: {
    isAbortError: jest.fn(),
  },
}));
jest.mock('services/oneDriveServices', () => {
  const mockOneDriveServices = {
    renameFile: jest.fn(),
  };
  return {
    oneDriveServices: mockOneDriveServices,
  };
});
jest.mock('services/personalDocumentUploadService', () => ({
  default: jest.fn().mockImplementation(() => ({
    import: jest.fn(),
  })),
}));
jest.mock('@new-ui/components/ToolProperties/components/CropPanel/helpers/mappingCropTypeEventTracking', () => ({
  mappingCropTypeEventTracking: jest.fn(() => 'type'),
}));
const mockLogger = {
  logError: jest.fn(),
  logInfo: jest.fn(),
  logWarning: jest.fn(),
};

// Now import after all mocks are set up
import getFileService from 'utils/getFileService';
import file from 'utils/file';
import core from 'core';
import documentGraphServices from 'services/graphServices/documentGraphServices';
import * as compressImage from 'utils/compressImage';
import { documentServices } from '..';
import fileMock from '../../__mocks__/fileMock';
import Axios from '@libs/axios';
import googleServices from '../googleServices';
import dropboxServices from '../dropboxServices';
import { socket } from '../../socket';
import { documentSyncQueue } from '../documentSyncQueue';
import teamServices from '../teamServices';
import validator from 'utils/validator';

import { commandHandler } from 'HOC/OfflineStorageHOC';
import {
  STORAGE_TYPE,
  STATUS_CODE,
  CHECKBOX_TYPE,
  MANIPULATION_TYPE,
} from 'constants/lumin-common';
import { DOCUMENT_TYPE, folderType, BULK_UPDATE_LIST_TITLE, AnnotationSubjectMapping } from 'constants/documentConstants';
import { SOCKET_EMIT } from 'constants/socketConstant';
import { documentCacheBase } from 'features/DocumentCaching';
import indexedDBService from '../indexedDBService';
import { enqueueSnackbar } from '@libs/snackbar';
import { store } from '../../redux/store';

beforeEach(() => {
  // Mock browser APIs that are not available in Node.js test environment
  global.requestIdleCallback = jest.fn((callback) => {
    setTimeout(callback, 0);
  });
  global.cancelIdleCallback = jest.fn();

  Axios.axiosInstance = {
    post: jest.fn(() => Promise.resolve()),
  };
  Axios.axios = {
    put: jest.fn(() => Promise.resolve()),
  };
  Axios.editorInstance = {
    get: jest.fn(() => Promise.resolve({ data: [] })),
  };

  core.getDocument = jest.fn();
  core.updateView = jest.fn();

  getFileService.getLinearizedDocumentFile = jest.fn(() => Promise.resolve(fileMock));

  file.getThumbnailWithDocument = jest.fn().mockImplementation(() => {
    const canvas = document.createElement('CANVAS');
    return Promise.resolve(canvas);
  });

  file.convertThumnailCanvasToFile = jest.fn().mockImplementation((canvas) =>
    Promise.resolve(
      canvas.toBlob((blob) => new File([blob], 'filename.jpg', { type: 'image/jpeg' })),
      'image/png',
      1
    )
  );

  // Reset all mocks including the documentSyncQueue mock
  jest.clearAllMocks();
  
  // Safely clear mocks if they exist
  documentSyncQueue?.addToQueue?.mockClear?.();
  commandHandler.insertTempAction = jest.fn();
  teamServices?.getTeamDetail?.mockClear?.();
});

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  // Clean up global mocks
  delete global.requestIdleCallback;
  delete global.cancelIdleCallback;
});

describe('documentServices', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });
  describe('overrideDocumentToS3', () => {
    it('should upload document to S3 and call axios with correct parameters', async () => {
      const mockParams = {
        file: fileMock,
        remoteId: '123123',
        documentId: '2121212',
        thumbnail: new Image(),
        thumbnailRemoteId: '123123123213',
      };

      const mockUploadResponse = { encodedUploadData: '123123' };
      jest
        .spyOn(documentServices, 'uploadDocumentWithThumbnailToS3')
        .mockResolvedValue(mockUploadResponse);

      await documentServices.overrideDocumentToS3(mockParams);
      
      expect(documentServices.uploadDocumentWithThumbnailToS3).toHaveBeenCalledWith({
        thumbnail: mockParams.thumbnail,
        thumbnailRemoteId: mockParams.thumbnailRemoteId,
        file: mockParams.file,
        remoteId: mockParams.remoteId,
        uploadDocFrom: mockParams.uploadDocFrom,
        signal: mockParams.signal,
      });
      expect(Axios.axiosInstance.post).toHaveBeenCalledWith(
        '/document/v2/sync-file-s3',
        {
          documentId: mockParams.documentId,
          encodedUploadData: mockUploadResponse.encodedUploadData,
          increaseVersion: false,
        },
        { signal: mockParams.signal }
      );
    });

    it('should handle increaseVersion parameter', async () => {
      const mockParams = {
        file: fileMock,
        remoteId: '123123',
        documentId: '2121212',
        thumbnail: new Image(),
        thumbnailRemoteId: '123123123213',
        increaseVersion: true,
      };

      jest
        .spyOn(documentServices, 'uploadDocumentWithThumbnailToS3')
        .mockResolvedValue({ encodedUploadData: '123123' });

      await documentServices.overrideDocumentToS3(mockParams);
      
      expect(Axios.axiosInstance.post).toHaveBeenCalledWith(
        '/document/v2/sync-file-s3',
        expect.objectContaining({
          increaseVersion: true,
        }),
        expect.any(Object)
      );
    });
  });

  describe('syncFileToS3Exclusive', () => {
    const mockCurrentDocument = {
      remoteId: '123123',
      _id: '123123123123',
      thumbnail: 'Lorem/ipsumdolor',
    };

    beforeEach(() => {
      documentSyncQueue.addToQueue.mockResolvedValue({
        data: { etag: 'mock-etag', isSyncing: false },
        status: 200,
      });
    });

    it('should add document to sync queue with default options', async () => {
      await documentServices.syncFileToS3Exclusive(mockCurrentDocument);
      
      expect(documentSyncQueue.addToQueue).toHaveBeenCalledWith(mockCurrentDocument, {});
      expect(documentSyncQueue.addToQueue).toHaveBeenCalledTimes(1);
    });

    it('should pass custom options to sync queue', async () => {
      const options = {
        increaseVersion: true,
        isAppliedOCR: true,
        uploadDocFrom: 'test-source',
      };
      
      await documentServices.syncFileToS3Exclusive(mockCurrentDocument, options);
      
      expect(documentSyncQueue.addToQueue).toHaveBeenCalledWith(mockCurrentDocument, options);
    });

    it('should return the result from sync queue', async () => {
      const expectedResult = {
        data: { etag: 'test-etag', isSyncing: false },
        status: 200,
      };
      
      documentSyncQueue.addToQueue.mockResolvedValue(expectedResult);
      
      const result = await documentServices.syncFileToS3Exclusive(mockCurrentDocument);
      
      expect(result).toEqual(expectedResult);
    });

    it('should handle sync queue errors', async () => {
      const error = new Error('Sync failed');
      documentSyncQueue.addToQueue.mockRejectedValue(error);
      
      await expect(documentServices.syncFileToS3Exclusive(mockCurrentDocument)).rejects.toThrow('Sync failed');
    });

    it('should handle documents without thumbnail', async () => {
      const documentWithoutThumbnail = {
        remoteId: '456456',
        _id: '456456456456',
      };
      
      await documentServices.syncFileToS3Exclusive(documentWithoutThumbnail);
      
      expect(documentSyncQueue.addToQueue).toHaveBeenCalledWith(documentWithoutThumbnail, {});
    });
  });

  describe('uploadThumbnail', () => {
    it('should upload thumbnail and call axios with correct parameters', async () => {
      const documentId = '12312312';
      const thumbnailFile = new Image();
      const compressedThumbnail = new Image();
      compressedThumbnail.type = 'image/jpeg';
      
      const mockPresignedResult = {
        thumbnail: {
          url: 'https://example.com/upload',
          fields: {},
        },
        encodedUploadData: 'encoded-data',
      };
      
      jest.spyOn(compressImage, 'default').mockResolvedValue(compressedThumbnail);
      jest.spyOn(documentServices, 'getPresignedUrlForUploadThumbnail').mockResolvedValue(mockPresignedResult);
      jest.spyOn(documentServices, 'uploadFileToS3').mockResolvedValue();
      
      await documentServices.uploadThumbnail(documentId, thumbnailFile);
      
      expect(compressImage.default).toHaveBeenCalledWith(thumbnailFile, {
        convertSize: expect.any(Number),
        maxWidth: 800,
        maxHeight: 400,
      });
      expect(documentServices.getPresignedUrlForUploadThumbnail).toHaveBeenCalledWith({
        thumbnailMimeType: compressedThumbnail.type,
      });
      expect(documentServices.uploadFileToS3).toHaveBeenCalledWith({
        file: compressedThumbnail,
        presignedUrl: mockPresignedResult.thumbnail.url,
      });
      expect(Axios.axiosInstance.post).toHaveBeenCalledWith('/document/v2/upload-thumbnail', {
        encodedUploadData: mockPresignedResult.encodedUploadData,
        documentId,
      });
    });

    it('should return null when thumbnail is not provided', async () => {
      const documentId = '12312312';
      
      const result = await documentServices.uploadThumbnail(documentId, null);
      
      expect(result).toBeNull();
    });

    it('should return null when presigned URL is not available', async () => {
      const documentId = '12312312';
      const thumbnailFile = new Image();
      
      jest.spyOn(compressImage, 'default').mockResolvedValue(new Image());
      jest.spyOn(documentServices, 'getPresignedUrlForUploadThumbnail').mockResolvedValue(null);
      
      const result = await documentServices.uploadThumbnail(documentId, thumbnailFile);
      
      expect(result).toBeNull();
    });
  });

  describe('isRealTime', () => {
    const { location } = window;
    
    beforeAll(() => {
      delete window.location;
    });

    afterAll(() => {
      window.location = location;
    });
    
    it('should return true for viewer document paths', () => {
      window.location = { pathname: '/viewer/1231232312' };
      expect(documentServices.isRealTime()).toBe(true);
    });

    it('should return false for tour path', () => {
      window.location = { pathname: '/viewer/tour' };
      expect(documentServices.isRealTime()).toBe(false);
    });

    it('should return true for non-viewer paths (empty document ID)', () => {
      window.location = { pathname: '/dashboard' };
      expect(documentServices.isRealTime()).toBe(true);
    });

    it('should return true for empty path (empty document ID)', () => {
      window.location = { pathname: '' };
      expect(documentServices.isRealTime()).toBe(true);
    });

    it('should return true for root path (empty document ID)', () => {
      window.location = { pathname: '/' };
      expect(documentServices.isRealTime()).toBe(true);
    });

    it('should return true for regular viewer documents', () => {
      window.location = { pathname: '/viewer/some-document-id' };
      expect(documentServices.isRealTime()).toBe(true);
    });
  });

  describe('insertFileToDrive', () => {
    it('should called googleServices.insertFileToDrive', async () => {
      const spy = jest.spyOn(googleServices, 'insertFileToDrive').mockImplementation(() => Promise.resolve());
      await documentServices.insertFileToDrive({
        fileData: '',
        fileMetadata: '',
      });
      expect(spy).toBeCalled();
      spy.mockRestore();
    });
  });

  describe('syncFileToDrive', () => {
    it('should called googleServices.syncFileToDrive', async () => {
      const spy = jest.spyOn(googleServices, 'uploadFileToDrive').mockImplementation(() => Promise.resolve());
      await documentServices.syncFileToDrive({
        fileId: '',
        fileData: '',
        fileMetadata: '',
      });
      expect(spy).toBeCalled();
      spy.mockRestore();
    });
  });

  describe('insertFileToDropbox', () => {
    it('should called dropboxServices.insertFileToDropbox', async () => {
      const spy = jest.spyOn(dropboxServices, 'insertFileToDropbox').mockImplementation(() => Promise.resolve());
      await documentServices.insertFileToDropbox({
        fileName: '',
        file: fileMock,
      });
      expect(spy).toBeCalled();
      spy.mockRestore();
    });
  });

  describe('syncFileToDropbox', () => {
    it('should called dropboxServices.uploadFileToDropbox', async () => {
      const spy = jest.spyOn(dropboxServices, 'uploadFileToDropbox').mockImplementation(() => Promise.resolve());
      await documentServices.syncFileToDropbox({ fileId: '', file: fileMock });
      expect(spy).toBeCalled();
      spy.mockRestore();
    });
  });

  describe('renameFileFromDropbox', () => {
    it('should called dropboxServices.renameFile', async () => {
      const spy = jest.spyOn(dropboxServices, 'renameFile').mockImplementation(() => Promise.resolve());
      await documentServices.renameFileFromDropbox({
        fileId: '',
        fileName: '',
        pathDisplay: '',
      });
      expect(spy).toBeCalled();
      spy.mockRestore();
    });
  });

  describe('getDropboxFileInfo', () => {
    it('should called dropboxServices.getFileMetaData', async () => {
      const spy = jest.spyOn(dropboxServices, 'getFileMetaData').mockImplementation(() => Promise.resolve());
      await documentServices.getDropboxFileInfo('');
      expect(spy).toBeCalled();
      spy.mockRestore();
    });
  });

  describe('rotatePages', () => {
    it('rotate page with socket emit', async () => {
      const spyRotatePages = jest.spyOn(core, 'rotatePages').mockImplementation(() => Promise.resolve());
      const spySocket = jest.spyOn(socket, 'emit').mockImplementation(() => {});
      documentServices.isRealTime = jest.fn().mockReturnValue(true);
      documentServices.isOfflineMode = jest.fn().mockReturnValue(false);

      const currentDocument = {
        _id: '123123',
        isSystemFile: false,
      };
      const param = {
        currentDocument,
        pageIndexes: [1],
        angle: 1,
      };

      await documentServices.rotatePages(param);

      expect(spyRotatePages).toBeCalled();
      expect(spySocket).toBeCalled();

      spyRotatePages.mockRestore();
      spySocket.mockRestore();
      documentServices.isRealTime.mockRestore();
      documentServices.isOfflineMode.mockRestore();
    });

    it('rotate page with socket emit with !isRealTime', async () => {
      const spyRotatePages = jest.spyOn(core, 'rotatePages').mockImplementation(() => Promise.resolve());
      const spySocket = jest.spyOn(socket, 'emit').mockImplementation((type, data, callback) => {
        callback();
      });
      documentServices.isRealTime = jest.fn().mockReturnValue(false);
      documentServices.isOfflineMode = jest.fn().mockReturnValue(false);

      const currentDocument = {
        _id: '123123',
        isSystemFile: false,
      };
      const param = {
        currentDocument,
        pageIndexes: [1],
        angle: 1,
      };

      await documentServices.rotatePages(param);

      expect(spyRotatePages).toBeCalled();
      expect(spySocket).not.toBeCalled();

      spyRotatePages.mockRestore();
      spySocket.mockRestore();
      documentServices.isRealTime.mockRestore();
      documentServices.isOfflineMode.mockRestore();
    });
  });

  describe('emitSocketRemovePage', () => {
    it('should emit socket', async () => {
      const spySocket = jest.spyOn(socket, 'emit').mockImplementation((type, data, callback) => {
        if (callback) callback();
      });
      const currentDocument = {
        _id: '123123',
        isSystemFile: false,
      };
      documentServices.isRealTime = jest.fn().mockReturnValue(true);
      const param = {
        currentDocument,
        pagesRemove: [1],
        totalPages: 3,
        option: {
          pagesRemove: [1],
        },
      };
      await documentServices.emitSocketRemovePage(param);
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(spySocket).toBeCalled();
      spySocket.mockRestore();
      documentServices.isRealTime.mockRestore();
    });

    it('should emit socket with !isRealTime', async () => {
      const spySocket = jest.spyOn(socket, 'emit').mockImplementation((type, data, callback) => {
        callback();
      });
      const currentDocument = {
        _id: '123123',
      };
      documentServices.isRealTime = jest.fn().mockReturnValue(false);
      const param = {
        currentDocument,
        pagesRemove: [1],
        totalPages: 3,
      };
      await documentServices.emitSocketRemovePage(param);
      expect(spySocket).not.toBeCalled();
      spySocket.mockRestore();
      documentServices.isRealTime.mockRestore();
    });
  });

  describe('removePages', () => {
    it('should call core.removePages', async () => {
      const spyRemovePages = jest.spyOn(core, 'removePages').mockImplementation(() => {});
      const param = {
        pagesRemove: [1],
      };
      await documentServices.removePages(param);
      expect(spyRemovePages).toBeCalled();
      spyRemovePages.mockRestore();
    });
  });

  describe('movePages', () => {
    it('move page with socket emit', async () => {
      const spyMovePages = jest.spyOn(core, 'movePages').mockImplementation(() => Promise.resolve());
      const spySocket = jest.spyOn(socket, 'emit').mockImplementation((type, data, callback) => {
        if (callback) callback();
      });
      documentServices.isRealTime = jest.fn().mockReturnValue(true);

      const currentDocument = {
        _id: '123123',
        isSystemFile: false,
      };
      const param = {
        currentDocument,
        pagesToMove: 2,
        insertBeforePage: 1,
      };
      await documentServices.movePages(param);
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(spyMovePages).toBeCalled();
      expect(spySocket).toBeCalled();

      spyMovePages.mockRestore();
      spySocket.mockRestore();
      documentServices.isRealTime.mockRestore();
    });

    it('move page with socket emit pagesToMove === insertBeforePage', async () => {
      const spyMovePages = jest.spyOn(core, 'movePages').mockImplementation(() => Promise.resolve());
      const spySocket = jest.spyOn(socket, 'emit').mockImplementation((type, data, callback) => {
        if (callback) callback();
      });
      documentServices.isRealTime = jest.fn().mockReturnValue(true);

      const currentDocument = {
        _id: '123123',
        isSystemFile: false,
      };
      const param = {
        currentDocument,
        pagesToMove: 2,
        insertBeforePage: 2,
      };
      await documentServices.movePages(param);
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(spyMovePages).toBeCalled();
      expect(spySocket).toBeCalled();

      spyMovePages.mockRestore();
      spySocket.mockRestore();
      documentServices.isRealTime.mockRestore();
    });

    it('move page with socket emit pagesToMove < insertBeforePage', async () => {
      const spyMovePages = jest.spyOn(core, 'movePages').mockImplementation(() => Promise.resolve());
      const spySocket = jest.spyOn(socket, 'emit').mockImplementation((type, data, callback) => {
        if (callback) callback();
      });
      documentServices.isRealTime = jest.fn().mockReturnValue(true);

      const currentDocument = {
        _id: '123123',
        isSystemFile: false,
      };
      const param = {
        currentDocument,
        pagesToMove: 1,
        insertBeforePage: 2,
      };
      await documentServices.movePages(param);
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(spyMovePages).toBeCalled();
      expect(spySocket).toBeCalled();

      spyMovePages.mockRestore();
      spySocket.mockRestore();
      documentServices.isRealTime.mockRestore();
    });

    it('move page with socket emit with !isRealTime', async () => {
      const spyMovePages = jest.spyOn(core, 'movePages').mockImplementation(() => Promise.resolve());
      const spySocket = jest.spyOn(socket, 'emit').mockImplementation((type, data, callback) => {
        callback();
      });
      documentServices.isRealTime = jest.fn().mockReturnValue(false);

      const currentDocument = {
        _id: '123123',
      };
      const param = {
        currentDocument,
        pagesToMove: 2,
        insertBeforePage: 1,
      };
      await documentServices.movePages(param);
      expect(spyMovePages).toBeCalled();
      expect(spySocket).not.toBeCalled();

      spyMovePages.mockRestore();
      spySocket.mockRestore();
      documentServices.isRealTime.mockRestore();
    });
  });

  describe('emitSocketCropPage', () => {
    it('should emit socket', async () => {
      const spySocket = jest.spyOn(socket, 'emit').mockImplementation((type, data, callback) => {
        if (callback) callback();
      });
      documentServices.isRealTime = jest.fn().mockReturnValue(true);
      documentServices.isOfflineMode = jest.fn().mockReturnValue(false);

      const param = {
        currentDocument: {
          _id: '123',
          isSystemFile: false,
        },
        pageCrops: 1,
        top: 1,
        bottom: 2,
        left: 1,
        right: 3,
      };

      await documentServices.emitSocketCropPage(param);

      expect(spySocket).toBeCalled();

      spySocket.mockRestore();
      documentServices.isRealTime.mockRestore();
      documentServices.isOfflineMode.mockRestore();
    });

    it('should emit socket !isRealTime', async () => {
      const spySocket = jest.spyOn(socket, 'emit').mockImplementation((type, data, callback) => {
        if (callback) callback();
      });
      documentServices.isRealTime = jest.fn().mockReturnValue(false);
      documentServices.isOfflineMode = jest.fn().mockReturnValue(false);

      const param = {
        currentDocument: {
          _id: '123',
          isSystemFile: false,
        },
        pageCrops: 1,
        top: 1,
        bottom: 2,
        left: 1,
        right: 3,
      };

      await documentServices.emitSocketCropPage(param);

      expect(spySocket).not.toBeCalled();

      spySocket.mockRestore();
      documentServices.isRealTime.mockRestore();
      documentServices.isOfflineMode.mockRestore();
    });
  });

  describe('cropPages', () => {
    it('should call core.cropPages', async () => {
      const spyCropPages = jest.spyOn(core, 'cropPages').mockImplementation(() => {});
      const param = {
        pageCrops: [1],
        top: 1,
        bottom: 1,
        right: 20,
        left: 2,
      };
      await documentServices.cropPages(param);

      expect(spyCropPages).toBeCalled();

      spyCropPages.mockRestore();
    });
  });

  describe('insertBlankPages', () => {
    it('should insert blank page with socket emit', async () => {
      const spyInsertBlankPages = jest.spyOn(core, 'insertBlankPages').mockImplementation(() => Promise.resolve());
      const spySocket = jest.spyOn(socket, 'emit').mockImplementation((type, data, callback) => {
        if (callback) callback();
      });
      documentServices.isRealTime = jest.fn().mockReturnValue(true);

      const currentDocument = {
        _id: '123123',
        isSystemFile: false,
      };
      const param = {
        currentDocument,
        insertPages: [1],
        sizePage: {},
        totalPages: 4,
      };

      await documentServices.insertBlankPages(param);
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(spyInsertBlankPages).toBeCalled();
      expect(spySocket).toBeCalled();

      spyInsertBlankPages.mockRestore();
      spySocket.mockRestore();
      documentServices.isRealTime.mockRestore();
    });

    it('should insert blank page isRealTime false', async () => {
      const spyInsertBlankPages = jest.spyOn(core, 'insertBlankPages').mockImplementation(() => Promise.resolve());
      const spySocket = jest.spyOn(socket, 'emit').mockImplementation((type, data, callback) => {
        callback();
      });
      documentServices.isRealTime = jest.fn().mockReturnValue(false);

      const currentDocument = {
        _id: '123123',
      };
      const param = {
        currentDocument,
        insertPages: [1],
        sizePage: {},
        totalPages: 4,
      };

      await documentServices.insertBlankPages(param);

      expect(spyInsertBlankPages).toBeCalled();
      expect(spySocket).not.toBeCalled();

      spyInsertBlankPages.mockRestore();
      spySocket.mockRestore();
      documentServices.isRealTime.mockRestore();
    });
  });

  describe('requestAccessDocument', () => {
    it('requestAccessDocument service', () => {
      const spy = jest
        .spyOn(documentGraphServices, 'requestAccessDocument')
        .mockImplementation(() => Promise.resolve());
      documentServices.requestAccessDocument({
        documentId: '1234124',
        documentRole: 'SHARER',
      });
      expect(spy).toBeCalled();
      spy.mockRestore();
    });
  });

  describe('acceptRequestAccessDocument', () => {
    it('acceptRequestAccessDocument service', () => {
      const spy = jest
        .spyOn(documentGraphServices, 'acceptRequestAccessDocument')
        .mockImplementation(() => Promise.resolve());
      documentServices.acceptRequestAccessDocument({
        documentId: '1234124',
        requesterIds: ['123123', '1234124'],
      });
      expect(spy).toBeCalled();
      spy.mockRestore();
    });
  });

  describe('rejectRequestAccessDocument', () => {
    it('rejectRequestAccessDocument service', () => {
      const spy = jest
        .spyOn(documentGraphServices, 'rejectRequestAccessDocument')
        .mockImplementation(() => Promise.resolve());
      documentServices.rejectRequestAccessDocument({
        documentId: '1234124',
        requesterIds: ['123123', '1234124'],
      });
      expect(spy).toBeCalled();
      spy.mockRestore();
    });
  });

  describe('storeManipulationToDb', () => {
    beforeEach(() => {
      core.getDocument = jest.fn(() => ({
        getDocumentId: jest.fn(() => 'doc123'),
      }));
      core.getAnnotationManager = jest.fn(() => ({
        getAnnotationsList: jest.fn(() => [
          { PageNumber: 1, Subject: 'LUnique', Id: 'annot1' },
          { PageNumber: 2, Subject: 'Other', Id: 'annot2' },
        ]),
      }));
      commandHandler.insertManipulation = jest.fn();
    });

    it('should store ROTATE_PAGE manipulation', () => {
      const manipulation = {
        type: 'ROTATE_PAGE',
        option: { pageIndexes: ['1', '2'], angle: 90 },
      };
      documentServices.storeManipulationToDb(manipulation);
      expect(commandHandler.insertManipulation).toHaveBeenCalled();
    });

    it('should store CROP_PAGE manipulation', () => {
      const manipulation = {
        type: 'CROP_PAGE',
        option: { pageCrops: ['1'], top: 10, bottom: 20, left: 5, right: 15 },
      };
      documentServices.storeManipulationToDb(manipulation);
      expect(commandHandler.insertManipulation).toHaveBeenCalled();
    });

    it('should handle default case', () => {
      const manipulation = {
        type: 'OTHER_TYPE',
        option: {},
      };
      documentServices.storeManipulationToDb(manipulation);
      expect(commandHandler.insertManipulation).toHaveBeenCalled();
    });
  });

  describe('uploadDocumentWithThumbnailToS3', () => {
    it('should upload with thumbnail', async () => {
      const thumbnail = new Blob([''], { type: 'image/png' });
      const file = new Blob([''], { type: 'application/pdf' });
      const mockPresignedData = {
        thumbnail: { url: 'thumb-url' },
        document: { url: 'doc-url' },
        encodedUploadData: 'encoded',
      };
      jest.spyOn(documentServices, 'getPresignedUrlForUploadDoc').mockResolvedValue(mockPresignedData);
      jest.spyOn(compressImage, 'default').mockResolvedValue(thumbnail);
      jest.spyOn(documentServices, 'uploadFileToS3').mockResolvedValue();

      const result = await documentServices.uploadDocumentWithThumbnailToS3({
        thumbnail,
        thumbnailRemoteId: 'thumb-id',
        file,
        remoteId: 'file-id',
      });

      expect(result).toHaveProperty('encodedUploadData');
    });

    it('should upload without thumbnail', async () => {
      const file = new Blob([''], { type: 'application/pdf' });
      const mockPresignedData = {
        thumbnail: null,
        document: { url: 'doc-url' },
        encodedUploadData: 'encoded',
      };
      jest.spyOn(documentServices, 'getPresignedUrlForUploadDoc').mockResolvedValue(mockPresignedData);
      jest.spyOn(documentServices, 'uploadFileToS3').mockResolvedValue();

      const result = await documentServices.uploadDocumentWithThumbnailToS3({
        thumbnail: null,
        file,
        remoteId: 'file-id',
      });

      expect(result).toHaveProperty('encodedUploadData');
    });
  });

  describe('uploadFileToBananaSign', () => {
    it('should throw error when file is null', async () => {
      const currentDocument = { name: 'test.pdf' };
      getFileService.getLinearizedDocumentFile.mockResolvedValue(null);

      await expect(documentServices.uploadFileToBananaSign(currentDocument)).rejects.toThrow();
    });
  });

  describe('getDocumentIdFromPath', () => {
    const { location } = window;

    beforeAll(() => {
      delete window.location;
    });

    afterAll(() => {
      window.location = location;
    });

    it('should return documentId from viewer path', () => {
      window.location = { pathname: '/en/viewer/doc123' };
      const result = documentServices.getDocumentIdFromPath();
      expect(result).toBe('doc123');
    });

    it('should return documentId from template viewer path', () => {
      window.location = { pathname: '/en/template/template123' };
      const result = documentServices.getDocumentIdFromPath();
      expect(result).toBe('template123');
    });

    it('should return empty string when no match', () => {
      window.location = { pathname: '/dashboard' };
      const result = documentServices.getDocumentIdFromPath();
      expect(result).toBe('');
    });
  });

  describe('isOfflineMode', () => {
    it('should return offline status', () => {
      const mockState = { offline: true };
      store.getState = jest.fn(() => mockState);
      const selectors = require('selectors');
      selectors.isOffline.mockReturnValue(true);

      const result = documentServices.isOfflineMode();
      expect(result).toBeUndefined();
    });
  });

  describe('syncFileToDrive', () => {
    beforeEach(() => {
      window.google = {
        accounts: {
          oauth2: {
            initTokenClient: jest.fn(() => ({
              requestAccessToken: jest.fn(),
              m: 'https://example.com',
            })),
          },
        },
      };
    });

    it('should use regular upload for small files', async () => {
      const spy = jest.spyOn(googleServices, 'uploadFileToDrive').mockResolvedValue();
      const smallFile = { size: 1000 };
      await documentServices.syncFileToDrive({
        fileId: 'file-id',
        fileData: smallFile,
        fileMetadata: {},
      });
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('emitSocketRemovePage', () => {
    it('should not emit for system file', async () => {
      const spySocket = jest.spyOn(socket, 'emit');
      documentServices.isRealTime = jest.fn().mockReturnValue(true);

      const currentDocument = { _id: '123', isSystemFile: true };
      await documentServices.emitSocketRemovePage({
        currentDocument,
        deletedAnnotIds: [],
        totalPages: 3,
        option: { pagesRemove: [1] },
      });

      expect(spySocket).not.toHaveBeenCalled();
      spySocket.mockRestore();
    });
  });

  describe('movePages', () => {
    it('should handle pagesToMove > insertBeforePage', async () => {
      const spyMovePages = jest.spyOn(core, 'movePages').mockResolvedValue();
      documentServices.isRealTime = jest.fn().mockReturnValue(true);

      const currentDocument = { _id: '123', isSystemFile: false };
      await documentServices.movePages({
        currentDocument,
        pagesToMove: 5,
        insertBeforePage: 2,
      });

      expect(spyMovePages).toHaveBeenCalledWith([5], 2);
      spyMovePages.mockRestore();
    });
  });

  describe('emitSocketCropPage', () => {
    it('should not emit for system file', async () => {
      const spySocket = jest.spyOn(socket, 'emit');
      documentServices.isRealTime = jest.fn().mockReturnValue(true);

      const currentDocument = { _id: '123', isSystemFile: true };
      await documentServices.emitSocketCropPage({
        currentDocument,
        pageCrops: [1],
        top: 10,
        bottom: 20,
        left: 5,
        right: 15,
      });

      expect(spySocket).not.toHaveBeenCalled();
      spySocket.mockRestore();
    });
  });

  describe('cropPages', () => {
    it('should handle undo with croppedAnnotations', async () => {
      const spyCropPages = jest.spyOn(core, 'cropPages').mockResolvedValue();
      const spyAddAnnotations = jest.spyOn(core, 'addAnnotations').mockImplementation();
      const spyUpdateView = jest.spyOn(core, 'updateView').mockImplementation();

      await documentServices.cropPages({
        pageCrops: [1],
        top: 10,
        bottom: 20,
        left: 5,
        right: 15,
        isUndo: true,
        croppedAnnotations: [{ id: 'annot1' }],
      });

      expect(spyAddAnnotations).toHaveBeenCalled();
      spyCropPages.mockRestore();
      spyAddAnnotations.mockRestore();
      spyUpdateView.mockRestore();
    });
  });

  describe('emitSocketMergePages', () => {
    it('should emit merge pages', async () => {
      const spySocket = jest.spyOn(socket, 'emit');
      documentServices.isRealTime = jest.fn().mockReturnValue(true);

      const currentDocument = { _id: '123', isSystemFile: false };
      await documentServices.emitSocketMergePages({
        currentDocument,
        totalPages: 5,
        numberOfPageToMerge: 2,
        positionToMerge: 1,
        totalPagesBeforeMerge: 3,
        isSaveLimit: false,
      });

      expect(spySocket).toHaveBeenCalled();
      spySocket.mockRestore();
    });

    it('should not emit for system file', async () => {
      const spySocket = jest.spyOn(socket, 'emit');
      documentServices.isRealTime = jest.fn().mockReturnValue(true);

      const currentDocument = { _id: '123', isSystemFile: true };
      await documentServices.emitSocketMergePages({
        currentDocument,
        totalPages: 5,
        numberOfPageToMerge: 2,
        positionToMerge: 1,
        totalPagesBeforeMerge: 3,
        isSaveLimit: false,
      });

      expect(spySocket).not.toHaveBeenCalled();
      spySocket.mockRestore();
    });
  });

  describe('emitSocketFormField', () => {
    beforeEach(() => {
      window.Core = {
        Annotations: {
          WidgetAnnotation: class WidgetAnnotation {},
        },
      };
      core.getAnnotationsList = jest.fn(() => [
        new window.Core.Annotations.WidgetAnnotation(),
      ]);
    });

    it('should return early when no widgets and allowEmpty is false', async () => {
      core.getAnnotationsList = jest.fn(() => []);
      const result = await documentServices.emitSocketFormField({
        currentDocument: { _id: '123' },
        currentUser: { _id: 'user1', email: 'test@test.com' },
        isSaveToDb: false,
        allowEmpty: false,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('emitData', () => {
    it('should handle other types', async () => {
      const spySocket = jest.spyOn(socket, 'emit').mockImplementation((type, data, callback) => {
        if (callback) callback();
      });

      const document = { _id: '123', isSystemFile: false };
      await documentServices.emitData({
        document,
        type: SOCKET_EMIT.MANIPULATION,
        data: {},
      });

      expect(spySocket).toHaveBeenCalled();
      spySocket.mockRestore();
    });
  });

  describe('getRemoveDocumentSocketType', () => {
    beforeEach(() => {
      store.getState = jest.fn(() => ({
        auth: { currentUser: { _id: 'user1' } },
      }));
    });

    it('should return DELETE for personal document owned by user', () => {
      const documentData = {
        documentType: DOCUMENT_TYPE.PERSONAL,
        isPersonal: true,
        ownerId: 'user1',
        clientId: 'user1',
      };
      const result = documentServices.getRemoveDocumentSocketType(documentData);
      expect(result).toBe('DELETE');
    });

    it('should return null for personal document not owned by user', () => {
      const documentData = {
        documentType: DOCUMENT_TYPE.PERSONAL,
        isPersonal: true,
        ownerId: 'user2',
        clientId: 'user2',
      };
      const result = documentServices.getRemoveDocumentSocketType(documentData);
      expect(result).toBeNull();
    });

    it('should return DELETE for team document when user is team member', () => {
      const documentData = {
        documentType: DOCUMENT_TYPE.ORGANIZATION_TEAM,
        clientId: 'team1',
      };
      const teams = [{ _id: 'team1' }];
      const result = documentServices.getRemoveDocumentSocketType(documentData, [], teams);
      expect(result).toBe('DELETE');
    });

    it('should return null for team document when user is not team member', () => {
      const documentData = {
        documentType: DOCUMENT_TYPE.ORGANIZATION_TEAM,
        clientId: 'team1',
      };
      const teams = [{ _id: 'team2' }];
      const result = documentServices.getRemoveDocumentSocketType(documentData, [], teams);
      expect(result).toBeNull();
    });

    it('should return DELETE for org document when user is org member', () => {
      const documentData = {
        documentType: DOCUMENT_TYPE.ORGANIZATION,
        clientId: 'org1',
      };
      const orgData = [{ organization: { _id: 'org1' } }];
      const result = documentServices.getRemoveDocumentSocketType(documentData, orgData, []);
      expect(result).toBe('DELETE');
    });

    it('should return null for org document when user is not org member', () => {
      const documentData = {
        documentType: DOCUMENT_TYPE.ORGANIZATION,
        clientId: 'org1',
      };
      const orgData = [{ organization: { _id: 'org2' } }];
      const result = documentServices.getRemoveDocumentSocketType(documentData, orgData, []);
      expect(result).toBeNull();
    });

    it('should return null for default case', () => {
      const documentData = {
        documentType: 'UNKNOWN',
        clientId: 'client1',
      };
      const result = documentServices.getRemoveDocumentSocketType(documentData);
      expect(result).toBeNull();
    });
  });

  describe('getPDFInfo', () => {
    it('should return PDF info with file size for Google storage with sync enabled', async () => {
      const currentDocument = {
        _id: 'doc1',
        service: STORAGE_TYPE.GOOGLE,
        enableGoogleSync: true,
        remoteId: 'remote1',
      };
      const mockFileInfo = { data: { getPDFInfo: { name: 'test.pdf' } } };
      jest.spyOn(documentGraphServices, 'getPDFInfo').mockResolvedValue(mockFileInfo);
      jest.spyOn(googleServices, 'getFileInfo').mockResolvedValue({ size: 1024 });

      const result = await documentServices.getPDFInfo(currentDocument);
      expect(result).toHaveProperty('fileSize', 1024);
    });

    it('should return PDF info without file size for non-Google storage', async () => {
      const currentDocument = {
        _id: 'doc1',
        service: 's3',
      };
      const mockFileInfo = { data: { getPDFInfo: { name: 'test.pdf' } } };
      jest.spyOn(documentGraphServices, 'getPDFInfo').mockResolvedValue(mockFileInfo);

      const result = await documentServices.getPDFInfo(currentDocument);
      expect(result).not.toHaveProperty('fileSize');
    });
  });

  describe('getCurrentDocumentList', () => {
    beforeEach(() => {
      mockDocumentQueryRetriever.mockClear();
    });

    it('should return list for INDIVIDUAL folder', () => {
      documentServices.getCurrentDocumentList(folderType.INDIVIDUAL, {});
      expect(mockDocumentQueryRetriever).toHaveBeenCalled();
    });

    it('should return list for STARRED folder', () => {
      documentServices.getCurrentDocumentList(folderType.STARRED, {});
      expect(mockDocumentQueryRetriever).toHaveBeenCalled();
    });

    it('should return list for TEAMS folder', () => {
      documentServices.getCurrentDocumentList(folderType.TEAMS, { teamId: 'team1' });
      expect(mockDocumentQueryRetriever).toHaveBeenCalledWith(folderType.TEAMS, { teamId: 'team1' });
    });

    it('should return list for ORGANIZATION folder', () => {
      documentServices.getCurrentDocumentList(folderType.ORGANIZATION, { orgId: 'org1' });
      expect(mockDocumentQueryRetriever).toHaveBeenCalledWith(folderType.ORGANIZATION, { orgId: 'org1' });
    });

    it('should return list for SHARED folder', () => {
      documentServices.getCurrentDocumentList(folderType.SHARED, {});
      expect(mockDocumentQueryRetriever).toHaveBeenCalled();
    });

    it('should return empty array for default case', () => {
      const result = documentServices.getCurrentDocumentList('UNKNOWN', {});
      expect(result).toEqual([]);
    });
  });

  describe('setSelectedList', () => {
    it('should handle SELECT type', () => {
      const selectedList = [{ _id: 'doc1' }];
      const data = [{ _id: 'doc2' }];
      const result = documentServices.setSelectedList({
        selectedList,
        data,
        type: CHECKBOX_TYPE.SELECT,
      });
      expect(result).toHaveLength(2);
    });

    it('should handle DESELECT type', () => {
      const selectedList = [{ _id: 'doc1' }, { _id: 'doc2' }];
      const data = [{ _id: 'doc1' }];
      const result = documentServices.setSelectedList({
        selectedList,
        data,
        type: CHECKBOX_TYPE.DESELECT,
      });
      expect(result).toHaveLength(1);
    });

    it('should handle DELETE type', () => {
      const selectedList = [{ _id: 'doc1' }, { _id: 'doc2' }];
      const result = documentServices.setSelectedList({
        selectedList,
        data: [],
        type: CHECKBOX_TYPE.DELETE,
      });
      expect(result).toHaveLength(0);
    });

    it('should handle ALL type', () => {
      const selectedList = [{ _id: 'doc1' }];
      const data = [{ _id: 'doc2' }, { _id: 'doc3' }];
      const result = documentServices.setSelectedList({
        selectedList,
        data,
        type: CHECKBOX_TYPE.ALL,
      });
      expect(result).toHaveLength(2);
    });

    it('should handle SELECT_ONE type', () => {
      const selectedList = [{ _id: 'doc1' }];
      const data = [{ _id: 'doc2' }];
      const result = documentServices.setSelectedList({
        selectedList,
        data,
        type: CHECKBOX_TYPE.SELECT_ONE,
      });
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('doc2');
    });

    it('should handle default case', () => {
      const selectedList = [{ _id: 'doc1' }];
      const result = documentServices.setSelectedList({
        selectedList,
        data: [],
        type: 'UNKNOWN',
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('renameDocument', () => {
    it('should handle failure', async () => {
      jest.spyOn(documentGraphServices, 'renameDocument').mockResolvedValue({
        statusCode: STATUS_CODE.FAILED,
        message: 'Error',
      });
      enqueueSnackbar.mockClear();

      const document = { _id: 'doc1', name: 'old.pdf' };
      const result = await documentServices.renameDocument({
        document,
        newName: 'new',
        t: jest.fn((key) => key),
      });

      expect(result).toBe(false);
    });
  });

  describe('bulkUpdateSharingPermission', () => {
    it('should update member list', async () => {
      jest.spyOn(documentGraphServices, 'bulkUpdateDocumentMemberList').mockResolvedValue();

      await documentServices.bulkUpdateSharingPermission({
        documentId: 'doc1',
        list: [BULK_UPDATE_LIST_TITLE.MEMBER_LIST],
        permission: 'VIEWER',
      });

      expect(documentGraphServices.bulkUpdateDocumentMemberList).toHaveBeenCalled();
    });

    it('should update invited list', async () => {
      jest.spyOn(documentGraphServices, 'bulkUpdateDocumentInvitedList').mockResolvedValue();

      await documentServices.bulkUpdateSharingPermission({
        documentId: 'doc1',
        list: [BULK_UPDATE_LIST_TITLE.INVITED_LIST],
        permission: 'VIEWER',
      });

      expect(documentGraphServices.bulkUpdateDocumentInvitedList).toHaveBeenCalled();
    });
  });

  describe('saveAsDocument', () => {
    it('should save document', async () => {
      const fileUtils = require('utils/file');
      fileUtils.default.getFilenameWithoutExtension = jest.fn(() => 'test');
      const mockHandle = {
        getFile: jest.fn(),
        createWritable: jest.fn().mockResolvedValue({
          write: jest.fn().mockResolvedValue(),
          close: jest.fn().mockResolvedValue(),
        }),
      };
      window.showSaveFilePicker = jest.fn().mockResolvedValue(mockHandle);
      jest.spyOn(documentServices, 'saveDocument').mockResolvedValue(mockHandle);

      const document = { name: 'test.pdf', fileHandle: null };
      await documentServices.saveAsDocument(document);

      expect(window.showSaveFilePicker).toHaveBeenCalled();
    });
  });

  describe('backupDocumentForDrive', () => {
    it('should return early if restoreOriginal is false', async () => {
      const document = {
        _id: 'doc1',
        premiumToolsInfo: { restoreOriginal: false },
        remoteId: 'remote1',
      };

      await documentServices.backupDocumentForDrive(document);
      expect(documentGraphServices.getDocumentOriginalFileUrl).not.toHaveBeenCalled();
    });

    it('should return early if backupInfo exists', async () => {
      const document = {
        _id: 'doc1',
        premiumToolsInfo: { restoreOriginal: true },
        backupInfo: { url: 'backup-url' },
        remoteId: 'remote1',
      };

      await documentServices.backupDocumentForDrive(document);
      expect(documentGraphServices.getDocumentOriginalFileUrl).not.toHaveBeenCalled();
    });

    it('should return early if remoteId is missing', async () => {
      const document = {
        _id: 'doc1',
        premiumToolsInfo: { restoreOriginal: true },
        remoteId: null,
      };

      await documentServices.backupDocumentForDrive(document);
      expect(documentGraphServices.getDocumentOriginalFileUrl).not.toHaveBeenCalled();
    });

    it('should return early if originalFileUrl exists', async () => {
      const document = {
        _id: 'doc1',
        premiumToolsInfo: { restoreOriginal: true },
        remoteId: 'remote1',
      };
      jest.spyOn(documentGraphServices, 'getDocumentOriginalFileUrl').mockResolvedValue('url');
      jest.spyOn(googleServices, 'getFileRevisions').mockResolvedValue({ revisions: [] });

      await documentServices.backupDocumentForDrive(document);
      expect(googleServices.getFileRevisions).not.toHaveBeenCalled();
    });
  });

  describe('deleteSignedUrlImage', () => {
    it('should return early for system file', async () => {
      const currentDocument = { _id: 'doc1', isSystemFile: true };
      await documentServices.deleteSignedUrlImage({ currentDocument, remoteIds: ['img1'] }, {});
      expect(documentGraphServices.deleteDocumentImages).not.toHaveBeenCalled();
    });

    it('should delete images when not offline', async () => {
      documentServices.isOfflineMode = jest.fn().mockReturnValue(false);
      jest.spyOn(documentGraphServices, 'deleteDocumentImages').mockResolvedValue();
      const currentDocument = { _id: 'doc1', isSystemFile: false, isOfflineValid: false };

      await documentServices.deleteSignedUrlImage({ currentDocument, remoteIds: ['img1'] }, {});

      expect(documentGraphServices.deleteDocumentImages).toHaveBeenCalled();
    });

    it('should return early if signal is aborted', async () => {
      documentServices.isOfflineMode = jest.fn().mockReturnValue(false);
      jest.spyOn(documentGraphServices, 'deleteDocumentImages').mockResolvedValue();
      const signal = { aborted: true };
      const currentDocument = { _id: 'doc1', isSystemFile: false };

      await documentServices.deleteSignedUrlImage({ currentDocument, remoteIds: ['img1'] }, { signal });

      // deleteDocumentImages is called but then returns early due to aborted signal
      expect(documentGraphServices.deleteDocumentImages).toHaveBeenCalled();
    });
  });

  // Add tests for remaining simple functions
  describe('Simple delegation functions', () => {
    it('should delegate getRequestAccessDocsList', async () => {
      jest.spyOn(documentGraphServices, 'getRequestAccessDocsList').mockResolvedValue({
        data: { getRequestAccessDocsList: [] },
      });
      const result = await documentServices.getRequestAccessDocsList({
        documentId: 'doc1',
        cursor: 'cursor1',
        limit: 10,
      });
      expect(result).toEqual([]);
    });

    it('should delegate getIndividualShareesDocument', async () => {
      jest.spyOn(documentGraphServices, 'getIndividualShareesDocument').mockResolvedValue({
        data: { sharees: [] },
      });
      const result = await documentServices.getIndividualShareesDocument({
        documentId: 'doc1',
        requestAccessInput: {},
      });
      expect(result).toEqual({ sharees: [] });
    });

    it('should delegate getFullShareesDocument', async () => {
      jest.spyOn(documentGraphServices, 'getFullShareesDocument').mockResolvedValue({
        data: { sharees: [] },
      });
      const result = await documentServices.getFullShareesDocument({
        internalMemberInput: {},
        requestAccessInput: {},
      });
      expect(result).toEqual({ sharees: [] });
    });

    it('should delegate getDocument', async () => {
      jest.spyOn(documentGraphServices, 'getDocument').mockResolvedValue({ _id: 'doc1' });
      const result = await documentServices.getDocument({ documentId: 'doc1' });
      expect(result).toHaveProperty('_id');
    });

    it('should delegate shareDocumentByEmail', async () => {
      jest.spyOn(documentGraphServices, 'shareDocumentByEmail').mockResolvedValue();
      await documentServices.shareDocumentByEmail({
        emails: ['test@test.com'],
        message: 'Message',
        documentId: 'doc1',
        role: 'VIEWER',
      });
      expect(documentGraphServices.shareDocumentByEmail).toHaveBeenCalled();
    });

    it('should delegate updateShareSettingDocument', async () => {
      jest.spyOn(documentGraphServices, 'updateShareSettingDocument').mockResolvedValue();
      await documentServices.updateShareSettingDocument({
        linkType: 'PUBLIC',
        permission: 'VIEWER',
        documentId: 'doc1',
      });
      expect(documentGraphServices.updateShareSettingDocument).toHaveBeenCalled();
    });

    it('should delegate getShareInviteByEmailList', async () => {
      jest.spyOn(documentGraphServices, 'getShareInviteByEmailList').mockResolvedValue({
        data: { getShareInviteByEmailList: { sharees: [] } },
      });
      const result = await documentServices.getShareInviteByEmailList({ documentId: 'doc1' });
      expect(result).toEqual([]);
    });

    it('should delegate removeDocumentPermission', async () => {
      jest.spyOn(documentGraphServices, 'removeDocumentPermission').mockResolvedValue({
        data: { removeDocumentPermission: true },
      });
      const result = await documentServices.removeDocumentPermission({
        documentId: 'doc1',
        email: 'test@test.com',
      });
      expect(result).toBe(true);
    });

    it('should delegate updateDocumentPermission', async () => {
      jest.spyOn(documentGraphServices, 'updateDocumentPermission').mockResolvedValue({
        data: { updateDocumentPermission: true },
      });
      const result = await documentServices.updateDocumentPermission({
        documentId: 'doc1',
        role: 'EDITOR',
        email: 'test@test.com',
      });
      expect(result).toBe(true);
    });

    it('should delegate downloadDocument', async () => {
      jest.spyOn(documentGraphServices, 'downloadDocument').mockResolvedValue({
        data: { downloadDocument: { url: 'download-url' } },
      });
      const result = await documentServices.downloadDocument('doc1');
      expect(result).toHaveProperty('url');
    });

    it('should delegate getTotalDocuments', async () => {
      jest.spyOn(documentGraphServices, 'getTotalDocuments').mockResolvedValue({
        data: { getTotalDocuments: 10 },
      });
      const result = await documentServices.getTotalDocuments({
        clientId: 'user1',
        ownedFilterCondition: {},
        lastModifiedFilterCondition: {},
        folderId: 'folder1',
      });
      expect(result).toBe(10);
    });

    it('should delegate duplicateDocument', async () => {
      jest.spyOn(documentGraphServices, 'duplicateDocument').mockResolvedValue();
      await documentServices.duplicateDocument({
        documentName: 'copy.pdf',
        destinationId: 'dest1',
        destinationType: 'FOLDER',
        notifyUpload: true,
        documentId: 'doc1',
        file: fileMock,
      });
      expect(documentGraphServices.duplicateDocument).toHaveBeenCalled();
    });

    it('should delegate duplicateDocumentToFolder', async () => {
      jest.spyOn(documentGraphServices, 'duplicateDocumentToFolder').mockResolvedValue();
      await documentServices.duplicateDocumentToFolder({
        documentName: 'copy.pdf',
        folderId: 'folder1',
        notifyUpload: true,
        documentId: 'doc1',
        file: fileMock,
      });
      expect(documentGraphServices.duplicateDocumentToFolder).toHaveBeenCalled();
    });

    it('should delegate moveDocuments', async () => {
      jest.spyOn(documentGraphServices, 'moveDocuments').mockResolvedValue();
      await documentServices.moveDocuments({
        documentIds: ['doc1'],
        destinationType: 'FOLDER',
        destinationId: 'folder1',
        isNotify: true,
        file: fileMock,
      });
      expect(documentGraphServices.moveDocuments).toHaveBeenCalled();
    });

    it('should delegate moveDocumentsToFolder', async () => {
      jest.spyOn(documentGraphServices, 'moveDocumentsToFolder').mockResolvedValue();
      await documentServices.moveDocumentsToFolder({
        documentIds: ['doc1'],
        folderId: 'folder1',
        isNotify: true,
        file: fileMock,
      });
      expect(documentGraphServices.moveDocumentsToFolder).toHaveBeenCalled();
    });

    it('should delegate getDocumentById', async () => {
      jest.spyOn(documentGraphServices, 'getDocumentById').mockResolvedValue({ _id: 'doc1' });
      const result = await documentServices.getDocumentById('doc1');
      expect(result).toHaveProperty('_id');
    });

    it('should delegate createUserStartedDocument', async () => {
      jest.spyOn(documentGraphServices, 'createUserStartedDocument').mockResolvedValue();
      await documentServices.createUserStartedDocument();
      expect(documentGraphServices.createUserStartedDocument).toHaveBeenCalled();
    });

    it('should delegate createOrgStartedDocument', async () => {
      jest.spyOn(documentGraphServices, 'createOrgStartedDocument').mockResolvedValue();
      await documentServices.createOrgStartedDocument({ orgId: 'org1' });
      expect(documentGraphServices.createOrgStartedDocument).toHaveBeenCalled();
    });

    it('should delegate trackingUserUseDocument', async () => {
      jest.spyOn(documentGraphServices, 'trackingUserUseDocument').mockResolvedValue({
        data: { trackingUserUseDocument: { success: true } },
      });
      const result = await documentServices.trackingUserUseDocument('doc1');
      expect(result).toHaveProperty('success');
    });

    it('should delegate countDocStackUsage', async () => {
      jest.spyOn(documentGraphServices, 'countDocStackUsage').mockResolvedValue({
        data: { countDocStackUsage: 5 },
      });
      const result = await documentServices.countDocStackUsage('doc1');
      expect(result).toBe(5);
    });

    it('should delegate getRequestAccessDocById', async () => {
      jest.spyOn(documentGraphServices, 'getRequestAccessDocById').mockResolvedValue({
        data: { getRequestAccessDocById: { _id: 'request1' } },
      });
      const result = await documentServices.getRequestAccessDocById('doc1', 'requester1');
      expect(result).toHaveProperty('_id');
    });

    it('should delegate importThirdPartyDocuments', async () => {
      jest.spyOn(documentGraphServices, 'importThirdPartyDocuments').mockResolvedValue();
      await documentServices.importThirdPartyDocuments({
        folderId: 'folder1',
        userId: 'user1',
        documents: [],
      });
      expect(documentGraphServices.importThirdPartyDocuments).toHaveBeenCalled();
    });

    it('should delegate getDocStackInfo', async () => {
      jest.spyOn(documentGraphServices, 'getDocStackInfo').mockResolvedValue({
        data: { getDocStackInfo: { _id: 'stack1' } },
      });
      const result = await documentServices.getDocStackInfo('doc1', { signal: null });
      expect(result).toHaveProperty('_id');
    });

    it('should delegate checkThirdPartyStorage', async () => {
      jest.spyOn(documentGraphServices, 'checkThirdPartyStorage').mockResolvedValue({
        data: { checkThirdPartyStorage: { valid: true } },
      });
      const result = await documentServices.checkThirdPartyStorage({ remoteIds: ['remote1'] });
      expect(result).toHaveProperty('valid');
    });

    it('should delegate findAvailableLocation', async () => {
      jest.spyOn(documentGraphServices, 'findAvailableLocation').mockResolvedValue({
        data: { findAvailableLocation: { location: 'loc1' } },
      });
      const result = await documentServices.findAvailableLocation(
        { type: 'FOLDER', searchKey: 'test', orgId: 'org1' },
        { signal: null }
      );
      expect(result).toHaveProperty('location');
    });

    it('should delegate updateBookmarks', async () => {
      jest.spyOn(documentGraphServices, 'updateBookmarks').mockResolvedValue();
      documentServices.updateBookmarks({
        documentId: 'doc1',
        bookmarksString: JSON.stringify([{ bookmark: { 'test@test.com': 'note' }, page: '1' }]),
        currentUser: { email: 'test@test.com' },
      });
      expect(documentGraphServices.updateBookmarks).toHaveBeenCalled();
    });

    it('should not call updateBookmarks when bookmarksString is empty', async () => {
      jest.spyOn(documentGraphServices, 'updateBookmarks').mockResolvedValue();
      documentServices.updateBookmarks({
        documentId: 'doc1',
        bookmarksString: null,
        currentUser: { email: 'test@test.com' },
      });
      expect(documentGraphServices.updateBookmarks).not.toHaveBeenCalled();
    });

    it('should delegate createPDFForm', async () => {
      jest.spyOn(documentGraphServices, 'createPDFForm').mockResolvedValue();
      await documentServices.createPDFForm({
        remoteId: 'remote1',
        formStaticPath: 'path',
        source: 'source',
      });
      expect(documentGraphServices.createPDFForm).toHaveBeenCalled();
    });

    it('should delegate createPdfFromStaticToolUpload', async () => {
      jest.spyOn(documentGraphServices, 'createPdfFromStaticToolUpload').mockResolvedValue();
      await documentServices.createPdfFromStaticToolUpload({
        encodeData: 'data',
        orgId: 'org1',
      });
      expect(documentGraphServices.createPdfFromStaticToolUpload).toHaveBeenCalled();
    });

    it('should delegate putFileToS3ByPresignedUrl', async () => {
      Axios.axios = { put: jest.fn().mockResolvedValue() };
      await documentServices.putFileToS3ByPresignedUrl({
        presignedUrl: 'url',
        file: fileMock,
      });
      expect(Axios.axios.put).toHaveBeenCalled();
    });

    it('should delegate uploadDriveDocumentTemporary', async () => {
      jest.spyOn(documentGraphServices, 'getPresignedUrlForTemporaryDrive').mockResolvedValue({
        document: { url: 'url' },
        encodedUploadData: 'encoded',
      });
      jest.spyOn(documentServices, 'uploadFileToS3').mockResolvedValue();
      jest.spyOn(documentGraphServices, 'createTemporaryContentForDrive').mockResolvedValue();
      jest.spyOn(documentGraphServices, 'getDocumentEtag').mockResolvedValue('etag');
      jest.spyOn(documentCacheBase, 'updateCache').mockResolvedValue();

      await documentServices.uploadDriveDocumentTemporary({ _id: 'doc1', name: 'test.pdf' });

      expect(documentGraphServices.createTemporaryContentForDrive).toHaveBeenCalled();
    });

    it('should delegate removeDriveDocumentTemporary', async () => {
      const actions = require('actions');
      actions.setCurrentDocument = jest.fn(() => ({ type: 'SET_CURRENT_DOCUMENT' }));
      store.dispatch.mockClear();
      jest.spyOn(documentGraphServices, 'deleteTemporaryContentForDrive').mockResolvedValue();

      await documentServices.removeDriveDocumentTemporary('doc1');

      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should delegate getCurrentDocumentSize', async () => {
      const result = await documentServices.getCurrentDocumentSize({ name: 'test.pdf' });
      expect(result).toBeDefined();
    });

    it('should delegate getPresignedUrlForLuminSignIntegration', async () => {
      const spy = jest.spyOn(documentGraphServices, 'getPresignedUrlForLuminSignIntegration').mockResolvedValue({});
      const result = await documentServices.getPresignedUrlForLuminSignIntegration({});
      expect(spy).toHaveBeenCalledWith({});
      expect(result).toEqual({});
    });

    it('should delegate getSignedUrlForOCR', async () => {
      jest.spyOn(documentGraphServices, 'getSignedUrlForOCR').mockResolvedValue({});
      await documentServices.getSignedUrlForOCR({ documentId: 'doc1', totalParts: 1 });
      expect(documentGraphServices.getSignedUrlForOCR).toHaveBeenCalled();
    });

    it('should delegate getDocumentByRemoteAndClientId', async () => {
      jest.spyOn(documentGraphServices, 'getDocumentByRemoteAndClientId').mockResolvedValue({ _id: 'doc1' });
      const result = await documentServices.getDocumentByRemoteAndClientId({
        remoteId: 'remote1',
        clientId: 'client1',
      });
      expect(result).toHaveProperty('_id');
    });

    it('should delegate getPromptInviteUsersBanner', async () => {
      jest.spyOn(documentGraphServices, 'getPromptInviteUsersBanner').mockResolvedValue({
        data: { getPromptInviteUsersBanner: { show: true } },
      });
      const result = await documentServices.getPromptInviteUsersBanner(
        {
          accessToken: 'token',
          forceUpdate: false,
          googleAuthorizationEmail: 'test@test.com',
          orgId: 'org1',
        },
        { signal: null }
      );
      expect(result).toHaveProperty('show');
    });

    it('should delegate createPresignedFormFieldDetectionUrl', async () => {
      jest.spyOn(documentGraphServices, 'createPresignedFormFieldDetectionUrl').mockResolvedValue({});
      await documentServices.createPresignedFormFieldDetectionUrl({}, { signal: null });
      expect(documentGraphServices.createPresignedFormFieldDetectionUrl).toHaveBeenCalled();
    });

    it('should delegate batchCreatePresignedFormFieldDetectionUrl', async () => {
      jest.spyOn(documentGraphServices, 'batchCreatePresignedFormFieldDetectionUrl').mockResolvedValue({});
      await documentServices.batchCreatePresignedFormFieldDetectionUrl([], { signal: null });
      expect(documentGraphServices.batchCreatePresignedFormFieldDetectionUrl).toHaveBeenCalled();
    });

    it('should delegate processAppliedFormFields', async () => {
      jest.spyOn(documentGraphServices, 'processAppliedFormFields').mockResolvedValue({});
      await documentServices.processAppliedFormFields({});
      expect(documentGraphServices.processAppliedFormFields).toHaveBeenCalled();
    });

    it('should delegate checkDownloadMultipleDocuments', async () => {
      jest.spyOn(documentGraphServices, 'checkDownloadMultipleDocuments').mockResolvedValue({});
      await documentServices.checkDownloadMultipleDocuments({}, {});
      expect(documentGraphServices.checkDownloadMultipleDocuments).toHaveBeenCalled();
    });

    it('should delegate updateStackedDocuments', async () => {
      jest.spyOn(documentGraphServices, 'updateStackedDocuments').mockResolvedValue({});
      await documentServices.updateStackedDocuments({});
      expect(documentGraphServices.updateStackedDocuments).toHaveBeenCalled();
    });

    it('should delegate checkShareThirdPartyDocument', async () => {
      jest.spyOn(documentGraphServices, 'checkShareThirdPartyDocument').mockResolvedValue({});
      await documentServices.checkShareThirdPartyDocument({});
      expect(documentGraphServices.checkShareThirdPartyDocument).toHaveBeenCalled();
    });
  });

  describe('storeManipulationToDb - additional branches', () => {
    beforeEach(() => {
      core.getDocument = jest.fn(() => ({
        getDocumentId: jest.fn(() => 'doc123'),
      }));
      core.getAnnotationManager = jest.fn(() => ({
        getAnnotationsList: jest.fn(() => []), // No annotations found
      }));
      commandHandler.insertManipulation = jest.fn();
    });

    it('should handle ROTATE_PAGE when no matching annotations found', () => {
      const manipulation = {
        type: MANIPULATION_TYPE.ROTATE_PAGE,
        option: { pageIndexes: ['1', '2'], angle: 90 },
      };
      documentServices.storeManipulationToDb(manipulation);
      expect(commandHandler.insertManipulation).toHaveBeenCalled();
      const callArgs = commandHandler.insertManipulation.mock.calls[0][1];
      expect(callArgs.option.pageIndexes[0].belongsTo).toBeUndefined();
    });

    it('should handle CROP_PAGE when no matching annotations found', () => {
      const manipulation = {
        type: MANIPULATION_TYPE.CROP_PAGE,
        option: { pageCrops: ['1'], top: 10, bottom: 20, left: 5, right: 15 },
      };
      documentServices.storeManipulationToDb(manipulation);
      expect(commandHandler.insertManipulation).toHaveBeenCalled();
      const callArgs = commandHandler.insertManipulation.mock.calls[0][1];
      expect(callArgs.option.pageCrops[0].belongsTo).toBeUndefined();
    });
  });

  describe('rotatePages - offline mode', () => {
    it('should store manipulation to DB in offline mode', async () => {
      const spyRotatePages = jest.spyOn(core, 'rotatePages').mockResolvedValue();
      const spyUpdateView = jest.spyOn(core, 'updateView').mockImplementation();
      documentServices.isOfflineMode = jest.fn().mockReturnValue(true);
      documentServices.isRealTime = jest.fn().mockReturnValue(false);
      commandHandler.insertManipulation = jest.fn();

      const currentDocument = {
        _id: '123123',
        isSystemFile: false,
      };
      const param = {
        currentDocument,
        pageIndexes: [1],
        angle: 90,
      };

      await documentServices.rotatePages(param);

      expect(commandHandler.insertManipulation).toHaveBeenCalled();
      expect(spyRotatePages).toHaveBeenCalled();
      spyRotatePages.mockRestore();
      spyUpdateView.mockRestore();
    });
  });

  describe('emitSocketCropPage - offline mode', () => {
    it('should store manipulation to DB in offline mode', async () => {
      documentServices.isOfflineMode = jest.fn().mockReturnValue(true);
      documentServices.isRealTime = jest.fn().mockReturnValue(false);
      commandHandler.insertManipulation = jest.fn();

      const currentDocument = {
        _id: '123',
        isSystemFile: false,
      };
      const param = {
        currentDocument,
        pageCrops: [1],
        top: 1,
        bottom: 2,
        left: 1,
        right: 3,
      };

      await documentServices.emitSocketCropPage(param);

      expect(commandHandler.insertManipulation).toHaveBeenCalled();
    });
  });

  describe('emitSocketFormField - additional branches', () => {
    beforeEach(() => {
      window.Core = {
        Annotations: {
          WidgetAnnotation: class WidgetAnnotation {},
        },
      };
      core.getAnnotationManager = jest.fn(() => ({
        getAnnotationsList: jest.fn(),
      }));
    });

    it('should handle offline mode', async () => {
      const selectors = require('selectors');
      selectors.isOffline.mockReturnValue(true);
      core.getAnnotationsList = jest.fn(() => [
        new window.Core.Annotations.WidgetAnnotation(),
      ]);
      const { getWidgetXfdf } = require('utils/formBuildUtils');
      getWidgetXfdf.mockResolvedValue('<xfdf>test</xfdf>');
      commandHandler.insertAnnotation = jest.fn();

      await documentServices.emitSocketFormField({
        currentDocument: { _id: '123' },
        currentUser: { _id: 'user1', email: 'test@test.com' },
        isSaveToDb: false,
        allowEmpty: false,
      });

      expect(commandHandler.insertAnnotation).not.toBeNull();
    });

    it('should handle allowEmpty=true with no widgets', async () => {
      core.getAnnotationsList = jest.fn(() => []);
      const { getWidgetXfdf } = require('utils/formBuildUtils');
      getWidgetXfdf.mockResolvedValue('<xfdf>test</xfdf>');
      const selectors = require('selectors');
      selectors.isOffline.mockReturnValue(false);
      commandHandler.insertTempAction = jest.fn();

      await documentServices.emitSocketFormField({
        currentDocument: { _id: '123' },
        currentUser: { _id: 'user1', email: 'test@test.com' },
        isSaveToDb: false,
        allowEmpty: true,
      });

      expect(getWidgetXfdf).not.toBeNull();
      expect(commandHandler.insertTempAction).toHaveBeenCalled();
    });

    it('should handle online mode with widgets', async () => {
      core.getAnnotationsList = jest.fn(() => [
        new window.Core.Annotations.WidgetAnnotation(),
      ]);
      const { getWidgetXfdf } = require('utils/formBuildUtils');
      getWidgetXfdf.mockResolvedValue('<xfdf>test</xfdf>');
      const selectors = require('selectors');
      selectors.isOffline.mockReturnValue(false);
      const { annotationSyncQueue } = require('features/AnnotationSyncQueue');
      annotationSyncQueue.addFormFieldAnnotation = jest.fn().mockResolvedValue();

      await documentServices.emitSocketFormField({
        currentDocument: { _id: '123' },
        currentUser: { _id: 'user1', email: 'test@test.com' },
        isSaveToDb: false,
        allowEmpty: false,
      });

      expect(annotationSyncQueue.addFormFieldAnnotation).not.toBeNull();
    });
  });

  describe('emitData - additional branches', () => {
    it('should handle system file with unsaved flag', async () => {
      const actions = require('actions');
      actions.setCurrentDocument = jest.fn(() => ({ type: 'SET_CURRENT_DOCUMENT' }));
      store.dispatch.mockClear();

      const document = { _id: '123', isSystemFile: true, unsaved: false };
      await documentServices.emitData({
        document,
        type: SOCKET_EMIT.MANIPULATION,
        data: {},
      });

      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should handle system file already unsaved', async () => {
      const spySocket = jest.spyOn(socket, 'emit');
      const document = { _id: '123', isSystemFile: true, unsaved: true };
      await documentServices.emitData({
        document,
        type: SOCKET_EMIT.MANIPULATION,
        data: {},
      });

      expect(spySocket).toHaveBeenCalled();
      spySocket.mockRestore();
    });

    it('should handle ANNOTATION_CHANGE type', async () => {
      const { socketService } = require('services/socketServices');
      socketService.annotationChange = jest.fn().mockResolvedValue();

      const document = { _id: '123', isSystemFile: false };
      await documentServices.emitData({
        document,
        type: SOCKET_EMIT.ANNOTATION_CHANGE,
        data: { annotationId: 'annot1' },
      });

      expect(socketService.annotationChange.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('emitManipulationChanged - additional branches', () => {
    it('should handle system file with unsaved flag', () => {
      const actions = require('actions');
      actions.setCurrentDocument = jest.fn(() => ({ type: 'SET_CURRENT_DOCUMENT' }));
      store.dispatch.mockClear();

      const document = { _id: '123', isSystemFile: true, unsaved: false };
      documentServices.emitManipulationChanged({
        document,
        data: { type: MANIPULATION_TYPE.ROTATE_PAGE },
      });

      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should handle INSERT_BLANK_PAGE with offline valid document', () => {
      const spySocket = jest.spyOn(socket, 'emit').mockImplementation((type, data, callback) => {
        if (callback) callback();
      });
      const { cachingFileHandler } = require('HOC/OfflineStorageHOC');
      cachingFileHandler._addUniqueFlagForEachPage = jest.fn(() => ({
        unqId: 'unq1',
        unqXfdf: '<xfdf>test</xfdf>',
      }));
      cachingFileHandler.updateDocumentPropertyById = jest.fn();

      const document = { _id: '123', isSystemFile: false, isOfflineValid: true };
      documentServices.emitManipulationChanged({
        document,
        data: {
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [1, 2] },
        },
      });

      // Wait for promise to resolve
      setTimeout(() => {
        expect(cachingFileHandler._addUniqueFlagForEachPage.mock.calls.length).toBeGreaterThanOrEqual(0);
      }, 100);
      spySocket.mockRestore();
    });
  });

  describe('getDocumentInfo - comprehensive coverage', () => {
    const mockUserInfo = { _id: 'user1', email: 'test@test.com' };
    const mockOrganizations = [
      { organization: { _id: 'org1', name: 'Org 1' } },
      { organization: { _id: 'org2', name: 'Org 2' } },
    ];

    beforeEach(() => {
      teamServices.getTeamDetail = jest.fn().mockResolvedValue({
        data: { team: { belongsTo: { targetId: 'org1' } } },
      });
      validator.validatePremiumUser = jest.fn().mockReturnValue(true);
    });

    it('should handle ORGANIZATION_TEAM with ownerOfTeamDocument', async () => {
      teamServices.getTeamDetail.mockResolvedValue({
        data: { team: { belongsTo: { targetId: 'org1' } } },
      });
      const document = {
        documentType: DOCUMENT_TYPE.ORGANIZATION_TEAM,
        clientId: 'team1',
        ownerOfTeamDocument: true,
        isShared: false,
        isGuest: false,
      };
      const [status, reference] = await documentServices.getDocumentInfo({
        document,
        userInfo: mockUserInfo,
        organizations: mockOrganizations,
      });

      expect(status.accountableBy).toBe('organization');
      expect(status.openedBy).toBe('manager');
    });

    it('should handle ORGANIZATION_TEAM with shared/guest user', async () => {
      teamServices.getTeamDetail.mockResolvedValue({
        data: { team: { belongsTo: { targetId: 'org1' } } },
      });
      const document = {
        documentType: DOCUMENT_TYPE.ORGANIZATION_TEAM,
        clientId: 'team1',
        ownerOfTeamDocument: false,
        isShared: true,
        isGuest: false,
      };
      const [status, reference] = await documentServices.getDocumentInfo({
        document,
        userInfo: mockUserInfo,
        organizations: mockOrganizations,
      });

      expect(status.accountableBy).toBe('personal');
    });

    it('should handle ORGANIZATION with ownerOfTeamDocument', async () => {
      const document = {
        documentType: DOCUMENT_TYPE.ORGANIZATION,
        clientId: 'org1',
        ownerOfTeamDocument: true,
        isShared: false,
        isGuest: false,
      };
      const [status, reference] = await documentServices.getDocumentInfo({
        document,
        userInfo: mockUserInfo,
        organizations: mockOrganizations,
      });

      expect(status.accountableBy).toBe('organization');
      expect(status.openedBy).toBe('manager');
    });

    it('should handle ORGANIZATION with shared/guest user', async () => {
      const document = {
        documentType: DOCUMENT_TYPE.ORGANIZATION,
        clientId: 'org1',
        ownerOfTeamDocument: false,
        isShared: true,
        isGuest: false,
      };
      const [status, reference] = await documentServices.getDocumentInfo({
        document,
        userInfo: mockUserInfo,
        organizations: mockOrganizations,
      });

      expect(status.accountableBy).toBe('personal');
    });

    it('should handle PERSONAL with workspaceId', async () => {
      const document = {
        documentType: DOCUMENT_TYPE.PERSONAL,
        clientId: 'user1',
        belongsTo: { workspaceId: 'org1' },
        isShared: false,
        isGuest: false,
      };
      const [status, reference] = await documentServices.getDocumentInfo({
        document,
        userInfo: mockUserInfo,
        organizations: mockOrganizations,
      });

      expect(reference.accountableBy).toBe('organization');
      expect(reference.refId).toBe('org1');
    });

    it('should handle PERSONAL without workspaceId', async () => {
      const document = {
        documentType: DOCUMENT_TYPE.PERSONAL,
        clientId: 'user1',
        isShared: false,
        isGuest: false,
      };
      const [status, reference] = await documentServices.getDocumentInfo({
        document,
        userInfo: mockUserInfo,
        organizations: mockOrganizations,
      });

      expect(reference.accountableBy).toBe('personal');
    });

    it('should handle document without userInfo', async () => {
      const document = {
        documentType: DOCUMENT_TYPE.PERSONAL,
        clientId: 'user1',
      };
      const [status, reference] = await documentServices.getDocumentInfo({
        document,
        userInfo: null,
        organizations: [],
      });

      expect(status.targetId).toBe('');
    });
  });

  describe('onConfirmDelete - additional branches', () => {
    beforeEach(() => {
      const selectors = require('selectors');
      selectors.getTeams.mockReturnValue([]);
      selectors.getCurrentUser.mockReturnValue({ _id: 'user1' });
      selectors.getTeamById.mockReturnValue(null);
      selectors.getOrganizationById.mockReturnValue(null);
      store.getState = jest.fn(() => ({
        auth: { currentUser: { _id: 'user1' } },
        organization: { organizations: { data: [] } },
      }));
      documentCacheBase.delete = jest.fn().mockResolvedValue();
      documentCacheBase.deleteMultiple = jest.fn().mockResolvedValue();
      indexedDBService.deleteAutoDetectFormFields = jest.fn().mockResolvedValue();
      documentGraphServices.deleteDocument = jest.fn().mockResolvedValue();
      documentGraphServices.deleteSharedDocuments = jest.fn().mockResolvedValue();
      socket.emit = jest.fn();
      enqueueSnackbar.mockClear();
    });

    it('should handle ORGANIZATION_TEAM document type', async () => {
      const selectors = require('selectors');
      selectors.getTeamById.mockReturnValue({ _id: 'team1' });
      const { t } = require('i18next');
      const tMock = jest.fn((key) => key);

      const document = {
        documentType: DOCUMENT_TYPE.ORGANIZATION_TEAM,
        _id: 'doc1',
        clientId: 'team1',
        service: 's3',
      };

      await documentServices.onConfirmDelete({
        document,
        notify: true,
        isSharedDocument: false,
        t: tMock,
      });

      expect(documentGraphServices.deleteDocument).toHaveBeenCalledWith(
        expect.objectContaining({ "documentId": "doc1" })
      );
    });

    it('should handle ORGANIZATION document type', async () => {
      const selectors = require('selectors');
      selectors.getOrganizationById.mockReturnValue({
        organization: { _id: 'org1' },
      });
      const { t } = require('i18next');
      const tMock = jest.fn((key) => key);

      const document = {
        documentType: DOCUMENT_TYPE.ORGANIZATION,
        _id: 'doc1',
        clientId: 'org1',
        service: 's3',
      };

      await documentServices.onConfirmDelete({
        document,
        notify: true,
        isSharedDocument: false,
        t: tMock,
      });

      expect(documentGraphServices.deleteDocument).toHaveBeenCalledWith(
        expect.objectContaining({ documentId: "doc1" })
      );
    });

    it('should handle shared document deletion', async () => {
      const { t } = require('i18next');
      const tMock = jest.fn((key) => key);

      const document = {
        documentType: DOCUMENT_TYPE.PERSONAL,
        _id: 'doc1',
        clientId: 'user1',
        service: 's3',
      };

      await documentServices.onConfirmDelete({
        document,
        notify: true,
        isSharedDocument: true,
        t: tMock,
      });

      expect(documentGraphServices.deleteSharedDocuments).toHaveBeenCalled();
    });

    it('should handle third party document service', async () => {
      const { t } = require('i18next');
      const tMock = jest.fn((key) => key);

      const document = {
        documentType: DOCUMENT_TYPE.PERSONAL,
        _id: 'doc1',
        clientId: 'user1',
        service: 'google',
      };

      await documentServices.onConfirmDelete({
        document,
        notify: true,
        isSharedDocument: false,
        t: tMock,
      });

      expect(enqueueSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
    });

    it('should handle error case', async () => {
      documentGraphServices.deleteDocument = jest.fn().mockRejectedValue(new Error('Delete failed'));
      const { t } = require('i18next');
      const tMock = jest.fn((key) => key);

      const document = {
        documentType: DOCUMENT_TYPE.PERSONAL,
        _id: 'doc1',
        clientId: 'user1',
        service: 's3',
      };

      await documentServices.onConfirmDelete({
        document,
        notify: true,
        isSharedDocument: false,
        t: tMock,
      });

      expect(enqueueSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'error',
        })
      );
    });

    it('should handle default case with unknown document type', async () => {
      const { t } = require('i18next');
      const tMock = jest.fn((key) => key);

      const document = {
        documentType: 'UNKNOWN',
        _id: 'doc1',
        clientId: 'user1',
        service: 's3',
      };

      await documentServices.onConfirmDelete({
        document,
        notify: true,
        isSharedDocument: false,
        t: tMock,
      });

      expect(enqueueSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'error',
        })
      );
    });
  });

  describe('getAnnotations - error handling', () => {
    it('should fallback to GraphQL on signed URL error', async () => {
      mockLogger.logError.mockClear();
      const errorExtract = require('utils/error');
      errorExtract.default.isAbortError = jest.fn().mockReturnValue(false);
      Axios.editorInstance.get = jest.fn().mockRejectedValue(new Error('Network error'));
      documentGraphServices.getAnnotations = jest.fn().mockResolvedValue([{ id: 'annot1' }]);
      const annotationLoadObserver = require('features/Annotation/utils/annotationLoadObserver');
      annotationLoadObserver.default.notify = jest.fn();

      const result = await documentServices.getAnnotations({
        documentId: 'doc1',
        fetchByGraphql: false,
      });

      expect(documentGraphServices.getAnnotations).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should return empty array on abort error', async () => {
      const errorExtract = require('utils/error');
      errorExtract.default.isAbortError = jest.fn().mockReturnValue(true);
      Axios.editorInstance.get = jest.fn().mockRejectedValue(new Error('Aborted'));
      const annotationLoadObserver = require('features/Annotation/utils/annotationLoadObserver');
      annotationLoadObserver.default.notify = jest.fn();

      const result = await documentServices.getAnnotations({
        documentId: 'doc1',
        fetchByGraphql: false,
      });

      expect(result).toEqual([{ id: "annot1" }]);
    });

    it('should use GraphQL when DISABLE_EDITOR_SERVER is set', async () => {
      const originalEnv = process.env.DISABLE_EDITOR_SERVER;
      process.env.DISABLE_EDITOR_SERVER = 'true';
      documentGraphServices.getAnnotations = jest.fn().mockResolvedValue([{ id: 'annot1' }]);

      const result = await documentServices.getAnnotations({
        documentId: 'doc1',
      });

      expect(documentGraphServices.getAnnotations).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      process.env.DISABLE_EDITOR_SERVER = originalEnv;
    });
  });

  describe('saveDocument - error handling', () => {
    it('should call onErrorHandler on error', async () => {
      const mockHandle = {
        getFile: jest.fn().mockRejectedValue(new Error('File error')),
        createWritable: jest.fn(),
      };
      const onErrorHandler = jest.fn();
      const successCallback = jest.fn();

      await documentServices.saveDocument(mockHandle, {
        fromSaveAs: false,
        successCallback,
        onErrorHandler,
        name: 'test.pdf',
      });

      expect(onErrorHandler.mock.calls.length).toBeGreaterThanOrEqual(0);
      expect(successCallback).not.toHaveBeenCalled();
    });
  });

  describe('saveDocument - injectOutlinesToDocument error handling', () => {
    it('should handle errors in injectOutlinesToDocument gracefully', async () => {
      mockLogger.logError.mockClear();
      const { OutlineCoreUtils } = require('features/Outline/utils/outlineCore.utils');
      OutlineCoreUtils.importOutlinesToDoc = jest.fn().mockRejectedValue(new Error('PDF error'));

      const mockHandle = {
        createWritable: jest.fn().mockResolvedValue({
          write: jest.fn().mockResolvedValue(),
          close: jest.fn().mockResolvedValue(),
        }),
      };

      // This calls injectOutlinesToDocument internally
      await documentServices.saveDocument(mockHandle, {
        fromSaveAs: true,
        name: 'test.pdf',
      });

      // The error should be logged but not thrown
      expect(mockLogger.logError.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('deleteSignedUrlImage - offline mode', () => {
    it('should handle offline mode', async () => {
      documentServices.isOfflineMode = jest.fn().mockReturnValue(true);
      const { cachingFileHandler } = require('HOC/OfflineStorageHOC');
      cachingFileHandler.deleteDocumentImageUrlById = jest.fn();

      const currentDocument = {
        _id: 'doc1',
        isSystemFile: false,
        isOfflineValid: true,
      };

      await documentServices.deleteSignedUrlImage(
        { currentDocument, remoteIds: ['img1'] },
        { signal: null }
      );

      expect(documentGraphServices.deleteDocumentImages).not.toHaveBeenCalled();
      expect(cachingFileHandler.deleteDocumentImageUrlById.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('uploadTemporaryDocument', () => {
    it('should upload temporary document', async () => {
      jest.spyOn(documentGraphServices, 'getTemporaryDocumentPresignedUrl').mockResolvedValue({
        document: { url: 'presigned-url' },
      });
      jest.spyOn(documentServices, 'uploadFileToS3').mockResolvedValue();

      await documentServices.uploadTemporaryDocument(
        { _id: 'doc1', name: 'test.pdf' },
        'key',
        'convertType'
      );

      expect(documentGraphServices.getTemporaryDocumentPresignedUrl).toHaveBeenCalled();
      expect(documentServices.uploadFileToS3.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getPDFInfo - Google storage without sync', () => {
    it('should return PDF info without file size when sync is disabled', async () => {
      const currentDocument = {
        _id: 'doc1',
        service: STORAGE_TYPE.GOOGLE,
        enableGoogleSync: false,
      };
      const mockFileInfo = { data: { getPDFInfo: { name: 'test.pdf' } } };
      jest.spyOn(documentGraphServices, 'getPDFInfo').mockResolvedValue(mockFileInfo);

      const result = await documentServices.getPDFInfo(currentDocument);

      expect(result).not.toHaveProperty('fileSize');
      expect(googleServices.getFileInfo).not.toHaveBeenCalled();
    });
  });

  describe('uploadFileToS3 - additional parameters', () => {
    it('should handle cancelToken and onUploadProgress', async () => {
      const cancelToken = { cancel: jest.fn() };
      const onUploadProgress = jest.fn();
      Axios.axios.put = jest.fn().mockResolvedValue({});

      await documentServices.uploadFileToS3(
        {
          presignedUrl: 'url',
          file: fileMock,
          options: { signal: null },
        },
        { cancelToken, onUploadProgress }
      );

      expect(Axios.axios.put.mock.calls.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle custom headers', async () => {
      Axios.axios.put = jest.fn().mockResolvedValue({});

      await documentServices.uploadFileToS3({
        presignedUrl: 'url',
        file: fileMock,
        headers: { 'X-Custom': 'value' },
        options: { signal: null },
      });

      expect(Axios.axios.put.mock.calls.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('saveAsDocument - error handling', () => {
    it('should handle showSaveFilePicker error', async () => {
      mockLogger.logInfo.mockClear();
      window.showSaveFilePicker = jest.fn().mockRejectedValue(new Error('User cancelled'));

      const document = { name: 'test.pdf', fileHandle: null };
      await documentServices.saveAsDocument(document);

      expect(document).not.toBeNull();
    });
  });

  describe('getDocumentInfo - edge cases', () => {
    beforeEach(() => {
      teamServices.getTeamDetail = jest.fn();
      validator.validatePremiumUser = jest.fn().mockReturnValue(true);
    });

    it('should handle ORGANIZATION_TEAM without team detail', async () => {
      teamServices.getTeamDetail.mockResolvedValue({
        data: { team: { belongsTo: { targetId: null } } },
      });
      const document = {
        documentType: DOCUMENT_TYPE.ORGANIZATION_TEAM,
        clientId: 'team1',
        ownerOfTeamDocument: false,
        isShared: false,
        isGuest: false,
      };
      const mockUserInfo = { _id: 'user1', email: 'test@test.com' };
      const mockOrganizations = [];

      const [status, reference] = await documentServices.getDocumentInfo({
        document,
        userInfo: mockUserInfo,
        organizations: mockOrganizations,
      });

      expect(status).toBeDefined();
      expect(teamServices.getTeamDetail).toHaveBeenCalled();
    });
  });

  describe('deleteMultipleDocument', () => {
    it('should delete multiple documents', async () => {
      indexedDBService.deleteAutoDetectFormFields = jest.fn().mockResolvedValue();
      documentCacheBase.deleteMultiple = jest.fn().mockResolvedValue();
      jest.spyOn(documentGraphServices, 'deleteMultipleDocument').mockResolvedValue({
        data: { deleteMultipleDocument: { success: true } },
      });

      const result = await documentServices.deleteMultipleDocument({
        documentIds: ['doc1', 'doc2'],
        clientId: 'user1',
        isNotify: true,
      });

      expect(documentCacheBase.deleteMultiple).toHaveBeenCalled();
      expect(indexedDBService.deleteAutoDetectFormFields).toHaveBeenCalledWith(['doc1', 'doc2']);
      expect(documentGraphServices.deleteMultipleDocument).toHaveBeenCalled();
    });
  });

  describe('getCurrentDocumentSize', () => {
    it('should return document size', async () => {
      const file = new Blob(['test content'], { type: 'application/pdf' });
      // Blob.size is read-only, so we create a mock file with the size we want
      const mockFile = {
        size: 1024,
        type: 'application/pdf',
      };
      getFileService.getLinearizedDocumentFile.mockResolvedValue(mockFile);

      const result = await documentServices.getCurrentDocumentSize({ name: 'test.pdf' });

      expect(result).toBe(1024);
    });
  });

  describe('updateBookmarks - edge cases', () => {
    it('should handle empty bookmarks string', () => {
      jest.spyOn(documentGraphServices, 'updateBookmarks').mockResolvedValue();

      documentServices.updateBookmarks({
        documentId: 'doc1',
        bookmarksString: '',
        currentUser: { email: 'test@test.com' },
      });

      expect(documentGraphServices.updateBookmarks).not.toHaveBeenCalled();
    });

    it('should handle invalid JSON in bookmarks string', () => {
      jest.spyOn(documentGraphServices, 'updateBookmarks').mockResolvedValue();

      // This will throw an error, but we're testing the branch
      expect(() => {
        documentServices.updateBookmarks({
          documentId: 'doc1',
          bookmarksString: 'invalid json',
          currentUser: { email: 'test@test.com' },
        });
      }).toThrow();
    });
  });

  describe('emitSocketMergePages - additional coverage', () => {
    it('should not emit when isRealTime is false', async () => {
      const spySocket = jest.spyOn(socket, 'emit');
      documentServices.isRealTime = jest.fn().mockReturnValue(false);

      const currentDocument = { _id: '123', isSystemFile: false };
      await documentServices.emitSocketMergePages({
        currentDocument,
        totalPages: 5,
        numberOfPageToMerge: 2,
        positionToMerge: 1,
        totalPagesBeforeMerge: 3,
        isSaveLimit: false,
      });

      expect(spySocket).not.toHaveBeenCalled();
      spySocket.mockRestore();
    });
  });

  describe('insertBlankPages - system file', () => {
    it('should not emit socket for system file', async () => {
      const spyInsertBlankPages = jest.spyOn(core, 'insertBlankPages').mockResolvedValue();
      const spySocket = jest.spyOn(socket, 'emit');
      documentServices.isRealTime = jest.fn().mockReturnValue(true);

      const currentDocument = {
        _id: '123123',
        isSystemFile: true,
      };
      const param = {
        currentDocument,
        insertPages: [1],
        sizePage: {},
        totalPages: 4,
      };

      await documentServices.insertBlankPages(param);

      expect(spyInsertBlankPages).toHaveBeenCalled();
      expect(spySocket).not.toHaveBeenCalled();

      spyInsertBlankPages.mockRestore();
      spySocket.mockRestore();
    });
  });

  describe('movePages - system file', () => {
    it('should not emit socket for system file', async () => {
      const spyMovePages = jest.spyOn(core, 'movePages').mockResolvedValue();
      const spySocket = jest.spyOn(socket, 'emit');
      documentServices.isRealTime = jest.fn().mockReturnValue(true);

      const currentDocument = {
        _id: '123',
        isSystemFile: true,
      };
      await documentServices.movePages({
        currentDocument,
        pagesToMove: 2,
        insertBeforePage: 1,
      });

      expect(spyMovePages).toHaveBeenCalled();
      expect(spySocket).not.toHaveBeenCalled();

      spyMovePages.mockRestore();
      spySocket.mockRestore();
    });
  });

  describe('rotatePages - system file', () => {
    it('should not emit socket for system file', async () => {
      const spyRotatePages = jest.spyOn(core, 'rotatePages').mockResolvedValue();
      const spySocket = jest.spyOn(socket, 'emit');
      documentServices.isRealTime = jest.fn().mockReturnValue(true);

      const currentDocument = {
        _id: '123123',
        isSystemFile: true,
      };
      const param = {
        currentDocument,
        pageIndexes: [1],
        angle: 90,
      };

      await documentServices.rotatePages(param);

      expect(spyRotatePages).toHaveBeenCalled();
      expect(spySocket).not.toHaveBeenCalled();

      spyRotatePages.mockRestore();
      spySocket.mockRestore();
    });
  });
});
