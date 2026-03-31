import { renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';

import actions from 'actions';
import timeTracking from 'screens/Viewer/time-tracking';
import documentServices from 'services/documentServices';
import googleServices from 'services/googleServices';
import { documentGraphServices } from 'services/graphServices';
import { oneDriveServices } from 'services/oneDriveServices';
import { socketService } from 'services/socketServices';
import documentEvent from 'utils/Factory/EventCollection/DocumentEventCollection';
import { getLinearizedDocumentFile } from 'utils/getFileService';
import { documentCacheBase, getCacheKey } from 'features/DocumentCaching';
import { DRIVE_FOLDER_URL } from 'constants/customConstant';
import { general } from 'constants/documentType';
import { STORAGE_TYPE } from 'constants/lumin-common';
import { SAVING_DOCUMENT } from 'constants/timeTracking';
import { IDocumentBase } from 'interfaces/document/document.interface';

import getFile from '../getFile';
import useUploadFile from '../useUploadFile';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('actions', () => ({
  updateCurrentDocument: jest.fn((payload) => ({ type: 'UPDATE_CURRENT_DOCUMENT', payload })),
  setDownloadType: jest.fn((payload) => ({ type: 'SET_DOWNLOAD_TYPE', payload })),
}));

jest.mock('screens/Viewer/time-tracking', () => ({
  register: jest.fn(),
  finishTracking: jest.fn(),
  getTrackingInfo: jest.fn(),
  unRegister: jest.fn(),
}));

jest.mock('services/documentServices', () => ({
  insertFileToDrive: jest.fn(),
  syncFileToDropbox: jest.fn(),
  insertFileToDropbox: jest.fn(),
  getDropboxFileInfo: jest.fn(),
  renameFileFromDropbox: jest.fn(),
}));

jest.mock('services/googleServices', () => ({
  uploadFileToDrive: jest.fn(),
  getFileInfo: jest.fn(),
}));

jest.mock('services/graphServices', () => ({
  documentGraphServices: {
    updateDocumentMimeTypeToPdf: jest.fn(),
  },
}));

jest.mock('services/oneDriveServices', () => ({
  oneDriveServices: {
    overrideContent: jest.fn(),
    insertFileToOneDrive: jest.fn(),
    getRootInfo: jest.fn(),
  },
}));

jest.mock('services/socketServices', () => ({
  socketService: {
    updateDocumentSize: jest.fn(),
  },
}));

jest.mock('utils/Factory/EventCollection/DocumentEventCollection', () => ({
  documentSaving: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('utils/getFileService', () => ({
  getLinearizedDocumentFile: jest.fn(),
}));

jest.mock('utils/mappingDownloadTypeWithMimeType', () => ({
  mappingDownloadTypeWithMimeType: jest.fn((mime) => `mapped_${mime}`),
}));

jest.mock('features/DocumentCaching', () => ({
  documentCacheBase: {
    updateCache: jest.fn(),
  },
  getCacheKey: jest.fn((id) => `key_${id}`),
}));

jest.mock('features/FeatureConfigs', () => ({
  featureStoragePolicy: {
    externalStorages: ['google', 'dropbox', 'onedrive'],
  },
}));

jest.mock('../getFile', () => jest.fn());

describe('useUploadFile', () => {
  const mockDispatch = jest.fn();
  const mockCurrentDocument = {
    _id: 'doc_1',
    remoteId: 'remote_1',
    name: 'test.pdf',
    mimeType: general.PDF,
    service: 'google',
    externalStorageAttributes: { driveId: 'drive_1' },
    etag: 'etag_1',
  } as unknown as IDocumentBase;

  const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
  const mockSignal = new AbortController().signal;

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (getFile as jest.Mock).mockResolvedValue(mockFile);
    (timeTracking.getTrackingInfo as jest.Mock).mockReturnValue({ timeTracking: 100 });
  });

  describe('Google Drive', () => {
    it('should handle override correctly', async () => {
      const { result } = renderHook(() => useUploadFile(STORAGE_TYPE.GOOGLE));
      const upload = result.current;

      const response = await upload({
        isOverride: true,
        currentDocument: mockCurrentDocument,
        newDocumentName: 'New Name',
        folderInfo: { id: 'folder_1', location: '', icon: '', webUrl: '' },
        signal: mockSignal,
      });

      expect(getFile).toHaveBeenCalledWith({
        name: mockCurrentDocument.name,
        downloadType: undefined,
        file: undefined,
        signal: mockSignal,
        flattenPdf: undefined,
      });
      expect(googleServices.uploadFileToDrive).toHaveBeenCalledWith({
        fileId: mockCurrentDocument.remoteId,
        fileMetadata: {
          name: 'New Name',
          mimeType: mockFile.type,
          parents: ['folder_1'],
        },
        fileData: mockFile,
      });
      expect(mockDispatch).toHaveBeenCalledWith(actions.updateCurrentDocument({ size: mockFile.size }));
      expect(socketService.updateDocumentSize).toHaveBeenCalledWith(mockCurrentDocument._id, mockFile.size);
      expect(response).toBe('');
    });

    it('should handle insert correctly with mimetype conversion', async () => {
      const nonPdfDoc = { ...mockCurrentDocument, mimeType: 'image/png' };
      (documentServices.insertFileToDrive as jest.Mock).mockResolvedValue({ id: 'new_remote_id' });
      (documentGraphServices.updateDocumentMimeTypeToPdf as jest.Mock).mockResolvedValue({
        data: { mimeType: general.PDF, remoteId: 'new_remote_id', name: 'converted.pdf' },
      });
      (googleServices.getFileInfo as jest.Mock).mockResolvedValue({ parents: ['parent_id'] });

      const { result } = renderHook(() => useUploadFile(STORAGE_TYPE.GOOGLE));
      const upload = result.current;

      const response = await upload({
        isOverride: false,
        currentDocument: nonPdfDoc,
        newDocumentName: 'New Name',
        signal: mockSignal,
      });

      expect(documentServices.insertFileToDrive).toHaveBeenCalled();
      expect(documentGraphServices.updateDocumentMimeTypeToPdf).toHaveBeenCalledWith(nonPdfDoc._id, 'new_remote_id');
      expect(mockDispatch).toHaveBeenCalledWith(
        actions.updateCurrentDocument({
          mimeType: general.PDF,
          remoteId: 'new_remote_id',
          name: 'converted.pdf',
        })
      );
      expect(mockDispatch).toHaveBeenCalledWith(actions.setDownloadType('mapped_application/pdf'));
      expect(googleServices.getFileInfo).toHaveBeenCalledWith('new_remote_id', '*', 'uploadToDrive');
      expect(response).toBe(`${DRIVE_FOLDER_URL}parent_id`);
    });

    it('should handle insert without mimetype conversion if already pdf', async () => {
      (documentServices.insertFileToDrive as jest.Mock).mockResolvedValue({ id: 'new_remote_id' });
      (googleServices.getFileInfo as jest.Mock).mockResolvedValue({ parents: ['parent_id'] });

      const { result } = renderHook(() => useUploadFile(STORAGE_TYPE.GOOGLE));
      const upload = result.current;

      await upload({
        isOverride: false,
        currentDocument: mockCurrentDocument,
        newDocumentName: 'New Name',
      });

      expect(documentGraphServices.updateDocumentMimeTypeToPdf).not.toHaveBeenCalled();
    });
  });

  describe('Dropbox', () => {
    it('should handle override with rename and cache update', async () => {
      (documentServices.syncFileToDropbox as jest.Mock).mockResolvedValue({
        data: { content_hash: 'new_etag' },
      });
      (documentServices.getDropboxFileInfo as jest.Mock).mockResolvedValue({
        data: { name: 'Old Name', path_display: '/path/old' },
      });
      (getLinearizedDocumentFile as jest.Mock).mockResolvedValue(new Blob([]));

      const { result } = renderHook(() => useUploadFile(STORAGE_TYPE.DROPBOX));
      const upload = result.current;

      await upload({
        isOverride: true,
        currentDocument: mockCurrentDocument,
        newDocumentName: 'New Name',
        signal: mockSignal,
      });

      expect(timeTracking.register).toHaveBeenCalledWith(SAVING_DOCUMENT);
      expect(documentServices.syncFileToDropbox).toHaveBeenCalled();
      expect(documentEvent.documentSaving).toHaveBeenCalled();
      expect(documentServices.renameFileFromDropbox).toHaveBeenCalledWith(
        mockCurrentDocument.remoteId,
        'New Name',
        '/path/old',
        { signal: mockSignal }
      );
      expect(documentCacheBase.updateCache).toHaveBeenCalledWith({
        key: 'key_doc_1',
        etag: 'new_etag',
        file: expect.any(Blob),
      });
      expect(socketService.updateDocumentSize).toHaveBeenCalled();
    });

    it('should handle override without rename if name matches', async () => {
      (documentServices.syncFileToDropbox as jest.Mock).mockResolvedValue({
        data: { content_hash: 'etag_1' },
      });
      (documentServices.getDropboxFileInfo as jest.Mock).mockResolvedValue({
        data: { name: 'New Name' },
      });

      const { result } = renderHook(() => useUploadFile(STORAGE_TYPE.DROPBOX));
      const upload = result.current;

      await upload({
        isOverride: true,
        currentDocument: mockCurrentDocument,
        newDocumentName: 'New Name',
      });

      expect(documentServices.renameFileFromDropbox).not.toHaveBeenCalled();
      expect(documentCacheBase.updateCache).not.toHaveBeenCalled();
    });

    it('should handle insert correctly', async () => {
      (documentServices.insertFileToDropbox as jest.Mock).mockResolvedValue({ data: { id: 'new_id' } });
      (documentServices.getDropboxFileInfo as jest.Mock).mockResolvedValue({
        data: { name: 'Old Name', path_display: '/path/old' },
      });
      const { result } = renderHook(() => useUploadFile(STORAGE_TYPE.DROPBOX));
      const upload = result.current;

      await upload({
        isOverride: false,
        currentDocument: mockCurrentDocument,
        newDocumentName: 'New Name',
        signal: mockSignal,
      });

      expect(getFile).toHaveBeenCalledWith({
        name: 'New Name',
        downloadType: '',
        file: undefined,
        signal: mockSignal,
        flattenPdf: undefined,
      });
      expect(documentServices.insertFileToDropbox).toHaveBeenCalledWith(
        { file: mockFile, fileName: 'New Name.pdf', folderPath: '/path' },
        { signal: mockSignal }
      );
    });

    it('should handle analytics exception gracefully', async () => {
      (documentServices.syncFileToDropbox as jest.Mock).mockResolvedValue({
        data: { content_hash: 'etag_1' },
      });
      (documentServices.getDropboxFileInfo as jest.Mock).mockResolvedValue({ data: { name: 'Name' } });
      (documentEvent.documentSaving as jest.Mock).mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useUploadFile(STORAGE_TYPE.DROPBOX));
      const upload = result.current;

      await expect(
        upload({
          isOverride: true,
          currentDocument: mockCurrentDocument,
          newDocumentName: 'Name',
        })
      ).resolves.not.toThrow();
    });

    it('should handle override when timeTracking returns falsy value', async () => {
      (documentServices.syncFileToDropbox as jest.Mock).mockResolvedValue({
        data: { content_hash: 'etag_1' },
      });
      (documentServices.getDropboxFileInfo as jest.Mock).mockResolvedValue({
        data: { name: 'New Name' },
      });
      (timeTracking.getTrackingInfo as jest.Mock).mockReturnValue(null);

      const { result } = renderHook(() => useUploadFile(STORAGE_TYPE.DROPBOX));
      const upload = result.current;

      await upload({
        isOverride: true,
        currentDocument: mockCurrentDocument,
        newDocumentName: 'New Name',
        signal: mockSignal,
      });

      expect(timeTracking.register).toHaveBeenCalledWith(SAVING_DOCUMENT);
      expect(timeTracking.finishTracking).toHaveBeenCalledWith(SAVING_DOCUMENT);
      expect(documentEvent.documentSaving).not.toHaveBeenCalled();
      expect(timeTracking.unRegister).toHaveBeenCalledWith(SAVING_DOCUMENT);
      expect(documentServices.getDropboxFileInfo).toHaveBeenCalled();
    });
  });

  describe('OneDrive', () => {
    it('should handle override with etag update', async () => {
      (oneDriveServices.overrideContent as jest.Mock).mockResolvedValue({ eTag: 'new_etag' });

      const { result } = renderHook(() => useUploadFile(STORAGE_TYPE.ONEDRIVE));
      const upload = result.current;

      await upload({
        isOverride: true,
        currentDocument: mockCurrentDocument,
        newDocumentName: 'Name',
        signal: mockSignal,
      });

      expect(oneDriveServices.overrideContent).toHaveBeenCalledWith(
        {
          remoteId: mockCurrentDocument.remoteId,
          driveId: mockCurrentDocument.externalStorageAttributes.driveId,
          file: mockFile,
        },
        { signal: mockSignal }
      );
      expect(documentCacheBase.updateCache).toHaveBeenCalled();
      expect(socketService.updateDocumentSize).toHaveBeenCalled();
    });

    it('should handle insert with folder info', async () => {
      (oneDriveServices.insertFileToOneDrive as jest.Mock).mockResolvedValue({ id: 'new_id' });
      const folderInfo = { id: 'folder_1', location: '', icon: '', webUrl: 'https://folder.url' };

      const { result } = renderHook(() => useUploadFile(STORAGE_TYPE.ONEDRIVE));
      const upload = result.current;

      const response = await upload({
        isOverride: false,
        currentDocument: mockCurrentDocument,
        newDocumentName: 'Name',
        folderInfo,
        signal: mockSignal,
      });

      expect(oneDriveServices.insertFileToOneDrive).toHaveBeenCalledWith(
        {
          driveId: mockCurrentDocument.externalStorageAttributes.driveId,
          file: mockFile,
          fileName: 'Name.pdf',
          folderId: 'folder_1',
        },
        { signal: mockSignal }
      );
      expect(response).toBe('https://folder.url');
    });

    it('should handle insert without folder info (root fallback)', async () => {
      (oneDriveServices.insertFileToOneDrive as jest.Mock).mockResolvedValue({ id: 'new_id' });
      (oneDriveServices.getRootInfo as jest.Mock).mockResolvedValue({ webUrl: 'https://root.url' });

      const { result } = renderHook(() => useUploadFile(STORAGE_TYPE.ONEDRIVE));
      const upload = result.current;

      const response = await upload({
        isOverride: false,
        currentDocument: mockCurrentDocument,
        newDocumentName: 'Name',
      });

      expect(oneDriveServices.getRootInfo).toHaveBeenCalled();
      expect(response).toBe('https://root.url');
    });

    it('should handle override when timeTracking returns falsy value', async () => {
      (oneDriveServices.overrideContent as jest.Mock).mockResolvedValue({ eTag: 'new_etag' });
      (getLinearizedDocumentFile as jest.Mock).mockResolvedValue(new Blob([]));
      (timeTracking.getTrackingInfo as jest.Mock).mockReturnValue(null);

      const { result } = renderHook(() => useUploadFile(STORAGE_TYPE.ONEDRIVE));
      const upload = result.current;

      await upload({
        isOverride: true,
        currentDocument: mockCurrentDocument,
        newDocumentName: 'Name',
        signal: mockSignal,
      });

      expect(timeTracking.register).toHaveBeenCalledWith(SAVING_DOCUMENT);
      expect(timeTracking.finishTracking).toHaveBeenCalledWith(SAVING_DOCUMENT);
      expect(documentEvent.documentSaving).not.toHaveBeenCalled();
      expect(timeTracking.unRegister).toHaveBeenCalledWith(SAVING_DOCUMENT);
      expect(documentCacheBase.updateCache).toHaveBeenCalled();
      expect(socketService.updateDocumentSize).toHaveBeenCalled();
    });

    it('should handle override when etags match (skip cache update)', async () => {
      (oneDriveServices.overrideContent as jest.Mock).mockResolvedValue({ eTag: 'etag_1' });

      const { result } = renderHook(() => useUploadFile(STORAGE_TYPE.ONEDRIVE));
      const upload = result.current;

      await upload({
        isOverride: true,
        currentDocument: mockCurrentDocument,
        newDocumentName: 'Name',
        signal: mockSignal,
      });

      expect(oneDriveServices.overrideContent).toHaveBeenCalled();
      expect(documentCacheBase.updateCache).not.toHaveBeenCalled();
      expect(socketService.updateDocumentSize).toHaveBeenCalled();
    });
  });

  describe('Common & Edge Cases', () => {
    it('should throw error for invalid storage type', () => {
      const { result } = renderHook(() => useUploadFile('INVALID_TYPE' as any));
      const upload = result.current;

      expect(() => {
        upload({
          currentDocument: mockCurrentDocument,
          newDocumentName: 'Name',
        });
      }).toThrow('Invalid storage type');
    });
  });
});