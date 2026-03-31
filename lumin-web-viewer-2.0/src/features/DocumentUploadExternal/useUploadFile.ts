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
import { mappingDownloadTypeWithMimeType } from 'utils/mappingDownloadTypeWithMimeType';

import { documentCacheBase, getCacheKey } from 'features/DocumentCaching';
import { featureStoragePolicy } from 'features/FeatureConfigs';
import { FolderPropertiesType } from 'features/SaveToThirdPartyStorage/type';

import { DRIVE_FOLDER_URL, DROPBOX_FOLDER_URL } from 'constants/customConstant';
import { general } from 'constants/documentType';
import { STORAGE_TYPE } from 'constants/lumin-common';
import { SAVING_DOCUMENT } from 'constants/timeTracking';

import { IDocumentBase } from 'interfaces/document/document.interface';

import getFile from './getFile';

type SyncFileInput = {
  isOverride?: boolean;
  currentDocument: IDocumentBase;
  newDocumentName: string;
  folderInfo?: FolderPropertiesType;
  downloadType?: string;
  file?: File;
  signal?: AbortSignal;
  flattenPdf?: boolean;
  isShared?: boolean;
};
interface ITrackingData {
  startTime: number;
  endTime: number;
  timeTracking: number;
}

const useUploadFile = (
  syncFileTo: typeof featureStoragePolicy.externalStorages[number]
): ((input: SyncFileInput) => Promise<unknown>) => {
  const dispatch = useDispatch();

  const updateFileSize = (documentId: string, size: number) => {
    dispatch(actions.updateCurrentDocument({ size }));
    socketService.updateDocumentSize(documentId, size);
  };

  const handleConvertMimeTypeForThirdParty = async (
    currentDocument: IDocumentBase,
    newRemoteId: string
  ): Promise<void> => {
    const hasDocumentId = Boolean(currentDocument._id);
    const isRemoteIdChanged = currentDocument.remoteId !== newRemoteId;
    const isNotPdfDocument = currentDocument.mimeType !== general.PDF;
    const shouldConvertMimeType = hasDocumentId && isRemoteIdChanged && isNotPdfDocument;

    if (shouldConvertMimeType) {
      const { data } = await documentGraphServices.updateDocumentMimeTypeToPdf(currentDocument._id, newRemoteId);
      dispatch(actions.updateCurrentDocument({ mimeType: data.mimeType, remoteId: newRemoteId, name: data.name }));

      const downloadType = mappingDownloadTypeWithMimeType(data.mimeType);
      dispatch(actions.setDownloadType(downloadType));
    }
  };

  const uploadToDrive = async ({
    isOverride,
    currentDocument,
    newDocumentName,
    folderInfo,
    downloadType,
    file,
    signal,
    flattenPdf,
  }: SyncFileInput) => {
    const uploadFile = await getFile({ name: currentDocument.name, downloadType, file, signal, flattenPdf });

    const fileMetadata = {
      name: newDocumentName,
      mimeType: uploadFile.type,
    } as Record<string, unknown>;
    if (folderInfo?.id) {
      fileMetadata.parents = [folderInfo.id];
    }
    if (isOverride) {
      await googleServices.uploadFileToDrive({
        fileId: currentDocument.remoteId,
        fileMetadata,
        fileData: uploadFile,
      });
      updateFileSize(currentDocument._id, uploadFile.size);
      return '';
    }
    const uploadInfo = (await documentServices.insertFileToDrive({ fileData: uploadFile, fileMetadata })) as {
      id: string;
    };
    await handleConvertMimeTypeForThirdParty(currentDocument, uploadInfo.id);
    const response = await googleServices.getFileInfo(uploadInfo.id, '*', 'uploadToDrive');
    return `${DRIVE_FOLDER_URL}${response.parents[0]}`;
  };

  const uploadToDropbox = async ({ isOverride, currentDocument, newDocumentName, file, signal }: SyncFileInput) => {
    const uploadFile = await getFile({ name: newDocumentName, downloadType: '', file, signal });
    if (isOverride) {
      timeTracking.register(SAVING_DOCUMENT);
      const { data: result } = await documentServices.syncFileToDropbox(
        { file: uploadFile, fileId: currentDocument.remoteId },
        { signal }
      );
      timeTracking.finishTracking(SAVING_DOCUMENT);
      const timeToSaveTheDocument = (timeTracking.getTrackingInfo(SAVING_DOCUMENT) as ITrackingData)?.timeTracking;
      if (timeToSaveTheDocument) {
        documentEvent.documentSaving({ timeToSaveTheDocument, source: currentDocument.service }).catch(() => {});
      }
      timeTracking.unRegister(SAVING_DOCUMENT);
      const fileMetaData = await documentServices.getDropboxFileInfo(currentDocument.remoteId, { signal });
      if (fileMetaData.data.name !== newDocumentName) {
        await documentServices.renameFileFromDropbox(
          currentDocument.remoteId,
          newDocumentName,
          fileMetaData.data.path_display,
          { signal }
        );
      }
      if (currentDocument?.etag !== result?.content_hash) {
        const fileData = await getLinearizedDocumentFile(currentDocument.name);
        await documentCacheBase.updateCache({
          key: getCacheKey(currentDocument._id),
          etag: result.content_hash,
          file: fileData,
        });
      }
      updateFileSize(currentDocument._id, uploadFile.size);
    } else {
      const { data: fileInfo } = await documentServices.getDropboxFileInfo(currentDocument.remoteId, { signal });
      const { data } = await documentServices.insertFileToDropbox(
        {
          file: uploadFile,
          fileName: `${newDocumentName}.pdf`,
          folderPath: fileInfo.path_display.split('/').slice(0, -1).join('/'),
        },
        { signal }
      );
      await handleConvertMimeTypeForThirdParty(currentDocument, data.id);
      return `${DROPBOX_FOLDER_URL}${fileInfo.path_display}`;
    }
  };

  const uploadToOneDrive = async ({
    isOverride,
    currentDocument,
    newDocumentName,
    file,
    signal,
    folderInfo,
  }: SyncFileInput) => {
    const fileData = await getFile({ name: currentDocument.name, downloadType: '', file, signal });
    const isDocShared = currentDocument.isShared;
    const currentDriveId = currentDocument.externalStorageAttributes?.driveId;
    const myFolderDriveId = folderInfo?.driveId;
    if (isOverride) {
      timeTracking.register(SAVING_DOCUMENT);
      const result = await oneDriveServices.overrideContent(
        {
          remoteId: currentDocument.remoteId,
          driveId: currentDriveId,
          file: fileData,
        },
        { signal }
      );
      timeTracking.finishTracking(SAVING_DOCUMENT);
      const timeToSaveTheDocument = (timeTracking.getTrackingInfo(SAVING_DOCUMENT) as ITrackingData)?.timeTracking;
      if (timeToSaveTheDocument) {
        documentEvent.documentSaving({ timeToSaveTheDocument, source: currentDocument.service }).catch(() => {});
      }
      timeTracking.unRegister(SAVING_DOCUMENT);
      if (currentDocument?.etag !== result?.eTag) {
        const cachedFile = await getLinearizedDocumentFile(currentDocument.name);
        await documentCacheBase.updateCache({
          key: getCacheKey(currentDocument._id),
          etag: result.eTag,
          file: cachedFile,
        });
      }
      updateFileSize(currentDocument._id, fileData.size);
    } else {
      const data = await oneDriveServices.insertFileToOneDrive(
        {
          driveId: isDocShared ? myFolderDriveId : currentDriveId,
          file: fileData,
          fileName: `${newDocumentName}.pdf`,
          folderId: folderInfo?.id,
        },
        { signal }
      );
      await handleConvertMimeTypeForThirdParty(currentDocument, data.id);
      if (folderInfo?.webUrl) {
        return folderInfo.webUrl;
      }
      const rootInfo = await oneDriveServices.getRootInfo();
      return rootInfo.webUrl;
    }
  };

  return (input: SyncFileInput) => {
    switch (syncFileTo) {
      case STORAGE_TYPE.GOOGLE:
        return uploadToDrive(input);
      case STORAGE_TYPE.DROPBOX:
        return uploadToDropbox(input);
      case STORAGE_TYPE.ONEDRIVE:
        return uploadToOneDrive(input);
      default:
        throw new Error('Invalid storage type');
    }
  };
};

export default useUploadFile;
