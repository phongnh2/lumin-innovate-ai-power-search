/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useHomeEditAPdfFlowHandler } from 'luminComponents/TopFeaturesSection/hooks';
import errorUploadMessageUtils from 'luminComponents/UploadHandler/utils/getErrorUploadMessage';

import useGetUploadFolderType from 'hooks/useGetUploadFolderType';
import useGetUserOrgForUpload from 'hooks/useGetUserOrgForUpload';
import useHandlePickThirdPartyFile from 'hooks/useHandlePickThirdPartyFile';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';
import { useTranslation } from 'hooks/useTranslation';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { documentServices, oneDriveServices } from 'services';
import { OnedriveFileInfo, OneDrivePickerModes, PickedOnedriveFileInfo } from 'services/oneDriveServices';
import PersonalDocumentUploadService from 'services/personalDocumentUploadService';

import { compressImage, file as fileUtils, toastUtils } from 'utils';
import { handleDisplayModal } from 'utils/uploadingModalUtils';

import { UPLOAD_FILE_TYPE } from 'constants/customConstant';
import { DocumentService } from 'constants/document.enum';
import { folderType } from 'constants/documentConstants';
import { MAX_THUMBNAIL_SIZE, STORAGE_TYPE } from 'constants/lumin-common';

import { DocumentImportParams } from 'interfaces/document/document.interface';

import { OneDriveFilePickerContext } from './context';
import { useOneDriveMessageHandler } from './hooks';

type OneDriveFilePickerProps = {
  children: React.ReactNode;
  folderId: string;
  folderType?: string;
  uploadType: string;
  onClose(): void;
  uploadFiles(params: unknown, storage: string): void;
  updateDocumentData(type: string, documentData: unknown): void;
  isOnHomeEditAPdfFlow?: boolean;
};

const OneDriveFilePicker = ({
  children,
  folderId,
  folderType: folderTypeFromHomeEditPdfFlow,
  uploadType = UPLOAD_FILE_TYPE.DOCUMENT,
  onClose,
  uploadFiles,
  updateDocumentData,
  isOnHomeEditAPdfFlow = false,
}: OneDriveFilePickerProps) => {
  const { t } = useTranslation();

  const { openPickerIframe, closePickerIframe, iframeRef } = useContext(OneDriveFilePickerContext);

  const currentFolderType = useGetUploadFolderType();
  const currentOrganization = useGetUserOrgForUpload();
  const currentDocument = useSelector(selectors.getCurrentDocument);
  const { isViewer } = useViewerMatch();

  const { handlePickThirdPartyFile } = useHandlePickThirdPartyFile();
  const { handleNavigateToEditor, handleVerifyBeforeUploadingFlow } = useHomeEditAPdfFlowHandler({
    isOnHomeEditAPdfFlow,
  });
  const { onKeyDown } = useKeyboardAccessibility();

  const folderTypeValue = useMemo(
    () => folderTypeFromHomeEditPdfFlow || currentFolderType,
    [folderTypeFromHomeEditPdfFlow, currentFolderType]
  );

  const handleUpdateThumbnail = async (fileInfo: OnedriveFileInfo, documentId: string) => {
    try {
      const listThumbnails = await oneDriveServices.getListThumbnails({
        driveId: fileInfo.parentReference.driveId,
        remoteId: fileInfo.id,
      });
      const thumbnailLink = listThumbnails?.value?.[0]?.large?.url;
      if (!thumbnailLink) return;

      const thumbnailCanvas = await fileUtils.getCanvasFromUrl(thumbnailLink);
      const thumbnailFile = await fileUtils.convertThumnailCanvasToFile(
        thumbnailCanvas,
        fileUtils.getFilenameWithoutExtension(fileInfo.name)
      );
      const compressedThumbnail =
        thumbnailFile &&
        (await compressImage(thumbnailFile, {
          convertSize: MAX_THUMBNAIL_SIZE,
          maxWidth: 200,
          maxHeight: 300,
        }));
      const { data: thumbnail } = await documentServices.uploadThumbnail(documentId, compressedThumbnail);
      updateDocumentData(folderTypeValue, {
        _id: documentId,
        thumbnail,
      });
    } catch (error) {}
  };

  const handleUploadFile = async (documentList: DocumentImportParams[], files: OnedriveFileInfo[]) => {
    try {
      const uploader = new PersonalDocumentUploadService();
      const isSharedDocument = currentDocument?.isShared;
      const createdDocuments = await uploader.import({
        documents: documentList,
        ...(folderId && !isSharedDocument && { folderId }),
        orgId: currentOrganization?._id,
      });
      if (isViewer) {
        handleDisplayModal(createdDocuments, DocumentService.onedrive, folderTypeValue, currentOrganization, folderId);
        return;
      }
      files.forEach((f) => {
        const documentId = createdDocuments.find((item) => item.remoteId === f.id)?._id;
        if (documentId) {
          handleUpdateThumbnail(f, documentId).catch(() => {});
        }
      });
      if (createdDocuments.length) {
        toastUtils.success({ message: t('openDrive.yourDocumentsWereSuccessfullyImported'), useReskinToast: true });
        handleNavigateToEditor(createdDocuments[0]._id);
      }
    } catch (error) {
      const message = errorUploadMessageUtils.getErrorMessage({ t, fileUpload: {}, error });
      toastUtils.error({ message, useReskinToast: true });
    }
  };

  const handleUpload = async (files: OnedriveFileInfo[]) => {
    if (folderTypeValue === folderType.INDIVIDUAL && uploadType === UPLOAD_FILE_TYPE.DOCUMENT) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
      const remoteEmail = await oneDriveServices.getAccountRemoteEmail();
      try {
        const documentList = files.map((f) => ({
          remoteId: f.id,
          remoteEmail,
          name: f.name,
          size: f.size,
          mimeType: f.file.mimeType,
          service: DocumentService.onedrive,
          externalStorageAttributes: {
            driveId: f.parentReference.driveId,
          },
        }));

        await handlePickThirdPartyFile({
          documents: documentList,
          handleUploadFile: () => handleUploadFile(documentList, files),
          destinationFolderId: folderId,
          destinationOrgId: currentOrganization?._id,
        });
      } catch (error) {
        toastUtils.error({
          message: t('importExternalDocument.failToImport', { externalService: 'OneDrive' }),
          useReskinToast: true,
        });
      }
    } else {
      uploadFiles(files, STORAGE_TYPE.ONEDRIVE);
    }
  };

  async function onPicked(pickerResults: PickedOnedriveFileInfo[], onClear: () => void) {
    if (!pickerResults) return;

    const { allowedUpload, errorHandler } = handleVerifyBeforeUploadingFlow(pickerResults);

    if (!allowedUpload) {
      onClear();
      errorHandler();
      return;
    }

    try {
      const filesInfo = await Promise.all(
        pickerResults.map(({ id, parentReference }) =>
          oneDriveServices.getFileInfo({ driveId: parentReference.driveId, remoteId: id })
        )
      );
      await handleUpload(filesInfo);
    } catch (e) {
    } finally {
      onClear();
    }
  }

  const { openFilePicker } = useOneDriveMessageHandler({
    iframeRef,
    openPickerIframe,
    closePickerIframe,
    onClose,
    onPicked,
    mode: OneDrivePickerModes.FILES,
  });

  return (
    <div
      role="button"
      tabIndex={-1}
      onClick={(e) => {
        e.stopPropagation();
        openFilePicker();
      }}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
};

export default OneDriveFilePicker;
