import i18next from 'i18next';
import React from 'react';
import { Trans } from 'react-i18next';

import { enqueueSnackbar } from '@libs/snackbar';
import { store } from 'src/redux/store';

import actions from 'actions';
import selectors from 'selectors';

import { PLATFORM } from 'screens/OpenLumin/constants';

import { systemFileHandler } from 'HOC/OfflineStorageHOC';

import documentServices from 'services/documentServices';

import fireEvent from 'helpers/fireEvent';
import logger from 'helpers/logger';

import { getLinearizedDocumentFile } from 'utils/getFileService';

import { general } from 'constants/documentType';
import { LocalStorageKey } from 'constants/localStorageKey';
import { ModalTypes } from 'constants/lumin-common';

const { getState, dispatch } = store;

const updateDocumentInDatabase = (documentId, updateData) => {
  systemFileHandler.update(documentId, updateData);
};

const getDocumentData = async (documentName) => getLinearizedDocumentFile(documentName);

const writeFileToElectron = async (filePath, data) => window.electronAPI.writeFile(filePath, data);

const updateDocumentState = (updateData) => {
  dispatch(
    actions.updateCurrentDocument({
      ...updateData,
    })
  );
};

const showSaveErrorModal = (documentName, onConfirm) => {
  const modalSettings = {
    type: ModalTypes.WARNING,
    title: i18next.t('common.cannotSaveChanges'),
    message: (
      <span>
        <Trans i18nKey="common.movedOrDeletedFile" values={{ documentName }} components={{ b: <b /> }} />
      </span>
    ),
    confirmButtonTitle: i18next.t('action.saveAs'),
    onConfirm,
    onCancel: () => {},
  };
  dispatch(actions.openViewerModal(modalSettings));
};

const addNewDocumentToDB = (newFileHandle, documentId, options = {}) => {
  updateDocumentInDatabase(documentId, {
    fileHandle: newFileHandle,
    name: newFileHandle.name,
    ...options,
  });
};

const successCallback = (newFileHandle, fileSize) => {
  const currentDocument = selectors.getCurrentDocument(getState());
  const unsavedAllAnnotations = currentDocument.newLocalFileTotalAnnotations > 0;
  dispatch(
    actions.updateCurrentDocument({
      fileHandle: newFileHandle,
      unsaved: unsavedAllAnnotations,
      name: newFileHandle.name,
      mimeType: currentDocument.mimeType || general.PDF,
      size: fileSize,
    })
  );
  addNewDocumentToDB(newFileHandle, currentDocument._id, {
    size: fileSize,
    mimeType: currentDocument.mimeType || general.PDF,
  });
  enqueueSnackbar({
    variant: 'success',
    message: i18next.t('message.savedChanges'),
  });
};

export const saveFileToDevice = () => {
  const currentDocument = selectors.getCurrentDocument(getState());
  documentServices.saveAsDocument(currentDocument, { successCallback });
};

export const saveFileToCloud = () =>
  dispatch(
    actions.setUploadDocVisible({
      visible: true,
      title: i18next.t('viewer.saveModal.save'),
      submitTitle: i18next.t('action.save'),
    })
  );

const onConfirm = () => {
  const isOffline = selectors.isOffline(getState());

  if (isOffline) {
    saveFileToDevice();
    return;
  }
  const defaultSaved = localStorage.getItem(LocalStorageKey.SYSTEM_DEFAULT_SAVED);
  if (!defaultSaved) {
    fireEvent('confirmed_save_local');
    return;
  }
  if (defaultSaved === 'to_device') {
    saveFileToDevice();
  } else {
    saveFileToCloud();
  }
};

const saveElectronFile = async (currentDocument) => {
  try {
    const documentFile = await getDocumentData(currentDocument.name);
    const arrayBuffer = await documentFile.arrayBuffer();
    const documentData = new Uint8Array(arrayBuffer);

    const result = await writeFileToElectron(currentDocument.filePath, documentData);

    if (result.success) {
      const updateData = {
        unsaved: false,
        lastModified: Date.now(),
      };

      updateDocumentState(updateData);
      updateDocumentInDatabase(currentDocument._id, updateData);

      enqueueSnackbar({
        variant: 'success',
        message: i18next.t('message.savedChanges'),
      });
    } else {
      throw new Error('Failed to save file');
    }
  } catch (error) {
    logger.logError({
      context: saveElectronFile.name,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error,
    });
    showSaveErrorModal(currentDocument.name, onConfirm);
  }
};

export const saveLocalFile = async () => {
  const currentDocument = selectors.getCurrentDocument(getState());
  dispatch(
    actions.updateCurrentDocument({
      newLocalFileTotalAnnotations: 0,
    })
  );
  const isPdfFile = currentDocument.mimeType === general.PDF;
  if (!isPdfFile) {
    saveFileToDevice();
    return;
  }

  /**
   * Save file from PWA
   */
  if (currentDocument.fileHandle && currentDocument.platform === PLATFORM.PWA) {
    documentServices.saveDocument(currentDocument.fileHandle, {
      name: currentDocument.name,
      onErrorHandler: () => {
        const modalSettings = {
          type: ModalTypes.WARNING,
          title: i18next.t('common.cannotSaveChanges'),
          message: (
            <span>
              <Trans
                i18nKey="common.movedOrDeletedFile"
                values={{ documentName: currentDocument.name }}
                components={{ b: <b /> }}
              />
            </span>
          ),
          confirmButtonTitle: i18next.t('action.saveAs'),
          onConfirm: () => {
            onConfirm();
          },
          onCancel: () => {},
        };
        dispatch(actions.openViewerModal(modalSettings));
      },
      successCallback,
    });
  }

  const isFileFromDesktopApp = currentDocument.platform === PLATFORM.ELECTRON;

  if (isFileFromDesktopApp) {
    await saveElectronFile(currentDocument);
  }
};
