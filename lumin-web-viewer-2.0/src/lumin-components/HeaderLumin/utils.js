import { t } from 'i18next';
import { isNil } from 'lodash';
import get from 'lodash/get';
import React from 'react';

import { store } from 'src/redux/store';

import actions from 'actions';
import core from 'core';

import { loggerServices, googleServices } from 'services';
import documentServices from 'services/documentServices';

import convertToOfficeFile from 'helpers/convertToOfficeFile';
import logger from 'helpers/logger';

import { file as fileUtils, validator, getFileService, toastUtils, dropboxError } from 'utils';

import { AnimationBanner } from 'constants/banner';
import { DRIVE_FOLDER_URL } from 'constants/customConstant';
import { documentStorage } from 'constants/documentConstants';
import { office } from 'constants/documentType';
import { ConversionError } from 'constants/errorCode';
import { LocalStorageKey } from 'constants/localStorageKey';
import { ModalTypes, STORAGE_TYPE, STORAGE_TYPE_DESC, LOGGER } from 'constants/lumin-common';
import { ERROR_TIMEOUT_MESSAGE, getErrorMessageInNameFieldByService } from 'constants/messages';
import { SOCKET_EMIT } from 'constants/socketConstant';

import { socket } from '../../socket';

export const handleUploadGoogleDrive = async ({ isOverrideMode, handleInternalStoragePermission, fileInfo }) => {
  const { fileId, fileMetadata, fileData } = fileInfo;
  if (!googleServices.isSignedIn()) {
    logger.logInfo({
      message: LOGGER.EVENT.HANDLE_UPLOAD_GOOGLE_DRIVE,
      reason: LOGGER.Service.GOOGLE_API_INFO,
      attributes: { fileInfo },
    });

    handleInternalStoragePermission({
      storageType: STORAGE_TYPE.GOOGLE,
    });

    throw new Error('REQUEST_PERMISSION');
  } else if (isOverrideMode) {
    await documentServices.syncFileToDrive({
      fileId,
      fileMetadata,
      fileData,
    });
    return '';
  } else {
    const uploadInfo = await documentServices.insertFileToDrive({ fileData, fileMetadata });
    const response = await googleServices.getFileInfo(uploadInfo.id, '*', 'uploadToDrive');
    return `${DRIVE_FOLDER_URL}${response.parents[0]}`;
  }
};

const _handleUploadDropbox = async (isOverrideMode, handleInternalStoragePermission, document, fileInfo) => {
  const { file, fileId, fileName } = fileInfo;
  if (!localStorage.getItem(LocalStorageKey.DROPBOX_TOKEN)) {
    handleInternalStoragePermission({
      storageType: STORAGE_TYPE.DROPBOX,
    });
    throw new Error('REQUEST_PERMISSION');
  } else if (isOverrideMode) {
    await documentServices.syncFileToDropbox({ file, fileId });
    const fileMetaData = await documentServices.getDropboxFileInfo(fileId);
    if (fileMetaData.data.name !== fileName) {
      await documentServices.renameFileFromDropbox(document.remoteId, fileName, fileMetaData.data.path_display);
    }
  } else {
    await documentServices.insertFileToDropbox({
      file,
      fileName,
    });
  }
};

export const openTimeoutModal = () => {
  const { dispatch } = store;

  dispatch(
    actions.openViewerModal({
      type: ModalTypes.ERROR,
      title: t(ERROR_TIMEOUT_MESSAGE.REQUEST_TIMEOUT),
      message: t(ERROR_TIMEOUT_MESSAGE.CHECK_CONNECTION),
      confirmButtonTitle: t('common.gotIt'),
      isFullWidthButton: true,
      disableBackdropClick: true,
      cancelButtonTitle: '',
      onConfirm: () => {
        dispatch(actions.closeModal());
      },
    })
  );
};

export const handleUploadFileToRemote = async ({
  isOverride,
  t,
  handleSyncFileError,
  syncFileTo,
  handleInternalStoragePermission,
  document,
  newDocumentName,
  folderId = '',
  setErrorMessage = () => {},
  setOpenCopyDocModal = () => {},
  setOpenSaveDocumentModal = () => {},
  downloadType = '',
}) => {
  const { dispatch } = store;
  let documentLocation = '';
  const setShowRating = (status) => dispatch(actions.setShouldShowRating(status));
  setErrorMessage('');
  if (![STORAGE_TYPE.DROPBOX, STORAGE_TYPE.GOOGLE].includes(syncFileTo)) {
    logger.logInfo({
      message: LOGGER.EVENT.HANDLE_UPLOAD_FILE_TO_REMOTE_REMOTE_INVALID,
      reason: LOGGER.Service.GOOGLE_API_INFO,
    });
    loggerServices.info('handleUploadFileToRemote - remote not valid');
    return {};
  }

  try {
    let file;
    if (downloadType === 'docx') {
      const fileBuffer = await convertToOfficeFile();
      file = new File([fileBuffer], newDocumentName, { type: office.DOCX });
    } else {
      file = await getFileService.getLinearizedDocumentFile(newDocumentName, { mimeType: document.mimeType });
    }
    switch (syncFileTo) {
      case STORAGE_TYPE.GOOGLE: {
        const fileMetadata = {
          name: `${newDocumentName}.${downloadType}`,
          mimeType: file.type,
        };
        if (folderId) {
          fileMetadata.parents = [folderId];
        }
        documentLocation = await handleUploadGoogleDrive({
          isOverride,
          handleInternalStoragePermission,
          document,
          fileInfo: {
            fileId: document.remoteId,
            fileMetadata,
            fileData: file,
          },
        });
        break;
      }
      case STORAGE_TYPE.DROPBOX: {
        await _handleUploadDropbox(isOverride, handleInternalStoragePermission, document, {
          file,
          fileId: document.remoteId,
          fileName: `${newDocumentName}.pdf`,
        });
        setShowRating(AnimationBanner.SHOW);
        break;
      }
      default:
        break;
    }

    if (isOverride) {
      logger.logInfo({
        message: LOGGER.EVENT.CLEAR_ANNOTATION_AND_MANIPULATION_OF_DOCUMENT,
        reason: LOGGER.Service.DOCUMENT_INFO,
        documentId: document._id,
      });
      socket.emit(SOCKET_EMIT.CLEAR_ANNOTATION_AND_MANIPULATION_OF_DOCUMENT, document._id);
    }

    const destinationStorage = STORAGE_TYPE_DESC[syncFileTo];
    const successMsg = isOverride
      ? t('viewer.header.yourFileHasBeenSyncedTo', { destinationStorage: '' })
      : t('viewer.header.copyIsCreatedOnYour', { destinationStorage: '' });

    if (!documentLocation) {
      toastUtils.success({
        message: (
          <>
            {successMsg} {destinationStorage}
          </>
        ),
      });
    }
    setOpenCopyDocModal(false);
    setOpenSaveDocumentModal(false);
    setErrorMessage('');

    return {
      successMsg,
      destinationStorage,
      documentLocation,
    };
  } catch (e) {
    handleSyncFileError(e);
    return {};
  }
};

export const handleChangeName = async ({ documentName, setDocumentName, setCurrentDocument, document, t }) => {
  const newName = documentName.trim();
  const oldName = fileUtils.getFilenameWithoutExtension(document.name);
  const nameValidation = validator.validateDocumentName(newName);
  if (documentName && nameValidation.isValidated) {
    if (newName !== oldName) {
      const nameWithExtension = await documentServices.renameDocument({
        document,
        newName,
        t,
      });
      if (nameWithExtension) {
        document.name = nameWithExtension;
        setCurrentDocument(document);
      } else {
        setDocumentName(oldName);
      }
    }
  } else {
    toastUtils.error({
      message: nameValidation.error,
    });
    setDocumentName(oldName);
  }
};

export const removeDuplicateMember = ({ onlineMembers = [], currentUser }) => {
  const arrayDuplicate = [];
  const removeDuplicateMembers = [];
  const filteredOnlineMembers = onlineMembers?.filter((member) => !isNil(member)) || [];
  for (let i = 0; i < filteredOnlineMembers.length; i++) {
    if (currentUser) {
      if (filteredOnlineMembers[i]._id === currentUser._id) {
        // eslint-disable-next-line no-continue
        continue;
      }
    } else {
      const annotManager = core.getAnnotationManager();
      const anonymousId = annotManager.getCurrentUser().split(' - ')[1];
      if (filteredOnlineMembers[i]._id === anonymousId) {
        // eslint-disable-next-line no-continue
        continue;
      }
    }
    if (!arrayDuplicate.includes(filteredOnlineMembers[i]._id)) {
      arrayDuplicate.push(filteredOnlineMembers[i]._id);
      removeDuplicateMembers.push(filteredOnlineMembers[i]);
    }
  }
  return removeDuplicateMembers;
};

export const handleSyncFileError = ({
  error,
  t,
  openViewerModal,
  setDocumentNotFound,
  handleInternalStoragePermission,
  syncFileTo,
  setErrorMessage = () => {},
  setDuplicateDocumentLoading = () => {},
}) => {
  if (error.name === ConversionError.TIMEOUT_ERROR) {
    openTimeoutModal();
    return;
  }

  const reason = get(error, 'errors[0].reason', error.message);
  if (reason === 'notFound' || dropboxError.isFileNotFoundError(error.response?.data?.error)) {
    setDocumentNotFound();
    return;
  }

  if (reason === 'insufficientFilePermissions') {
    openViewerModal({
      type: ModalTypes.ERROR,
      message: (
        <>
          <p>{t('viewer.header.errorPermissionDrive')}</p>
          <p>{t('viewer.header.errorPermissionDrive1')}</p>
        </>
      ),
      confirmButtonTitle: t('common.gotIt'),
      onConfirm: () => {},
    });
  }

  if (reason === 'insufficientParentPermissions') {
    setErrorMessage(t('viewer.header.errorPermissionDrive'));
    setDuplicateDocumentLoading(false);
    return;
  }

  if (dropboxError.isTokenExpiredError(error.response?.data?.error)) {
    handleInternalStoragePermission({
      storageType: STORAGE_TYPE.DROPBOX,
    });
    return;
  }

  if (reason !== 'REQUEST_PERMISSION') {
    if (syncFileTo === documentStorage.dropbox && dropboxError.isWrongPath(error.response?.data?.error)) {
      setErrorMessage(getErrorMessageInNameFieldByService(STORAGE_TYPE_DESC[syncFileTo]));
    }

    toastUtils.error({
      message: t('viewer.header.failedToSyncYourDocument'),
    });
  }
};
