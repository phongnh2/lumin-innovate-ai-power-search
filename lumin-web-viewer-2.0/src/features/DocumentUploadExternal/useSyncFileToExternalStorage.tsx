import axios, { AxiosError } from 'axios';
import get from 'lodash/get';
import React from 'react';
import { useDispatch } from 'react-redux';

import toastUtils from '@new-ui/utils/toastUtils';

import actions from 'actions';
import core from 'core';

import { useTranslation } from 'hooks';

import { OneDriveErrorCode } from 'services/oneDriveServices';

import logger from 'helpers/logger';

import { dropboxError } from 'utils';

import { socket } from '@socket';

import { featureStoragePolicy } from 'features/FeatureConfigs';
import { setIsExceedQuotaExternalStorage } from 'features/QuotaExternalStorage/slices';
import { FolderPropertiesType } from 'features/SaveToThirdPartyStorage/type';

import { AnimationBanner } from 'constants/banner';
import { ConversionError } from 'constants/errorCode';
import { LOGGER, ModalTypes, STORAGE_TYPE, STORAGE_TYPE_DESC } from 'constants/lumin-common';
import { ERROR_TIMEOUT_MESSAGE } from 'constants/messages';
import { SOCKET_EMIT } from 'constants/socketConstant';

import { IDocumentBase } from 'interfaces/document/document.interface';

import useCheckPermission from './useCheckPermission';
import useRequestPermission from './useRequestPermission';
import useUploadFile from './useUploadFile';

const I18N_GOT_IT = 'common.gotIt';

const useSyncFileToExternalStorage = (syncFileTo: typeof featureStoragePolicy.externalStorages[number]) => {
  const handleUpload = useUploadFile(syncFileTo);
  const checkPermission = useCheckPermission(syncFileTo);
  const requestPermission = useRequestPermission(syncFileTo);
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const openTimeoutModal = () => {
    dispatch(
      actions.openViewerModal({
        type: ModalTypes.ERROR,
        title: t(ERROR_TIMEOUT_MESSAGE.REQUEST_TIMEOUT),
        message: t(ERROR_TIMEOUT_MESSAGE.CHECK_CONNECTION),
        confirmButtonTitle: t(I18N_GOT_IT),
        isFullWidthButton: true,
        disableBackdropClick: true,
        cancelButtonTitle: '',
        onConfirm: () => {
          dispatch(actions.closeModal());
        },
      })
    );
  };

  const handleOneDriveError = (error: AxiosError) => {
    const oneDriveErrorCode = get(error, 'response.data.error.code');
    switch (oneDriveErrorCode) {
      case OneDriveErrorCode.ITEM_NOT_FOUND: {
        dispatch(actions.setDocumentNotFound());
        break;
      }
      case OneDriveErrorCode.ACCESS_DENIED: {
        dispatch(
          actions.openViewerModal({
            type: ModalTypes.ERROR,
            title: t('viewer.autoSync.unableSync'),
            message: t('errorMessage.accessDenied'),
            confirmButtonTitle: t(I18N_GOT_IT),
            cancelButtonTitle: '',
            footerVariant: 'variant2',
          })
        );
        break;
      }
      case OneDriveErrorCode.QUOTA_LIMIT_REACHED: {
        dispatch(setIsExceedQuotaExternalStorage(true));
        break;
      }
      default: {
        if (axios.isCancel(error)) {
          return;
        }

        toastUtils.error({
          message: t('viewer.header.failedToSyncYourDocument'),
        });
      }
    }
  };

  const handleSyncFileError = (error: {
    name?: string;
    response: {
      data?: {
        error: unknown;
      };
    };
    message: string;
  }) => {
    if (error.name === ConversionError.TIMEOUT_ERROR) {
      openTimeoutModal();
      return;
    }

    const reason = get(error, 'errors[0].reason', error.message);
    const isSyncFileToOneDrive = syncFileTo === STORAGE_TYPE.ONEDRIVE;
    if (isSyncFileToOneDrive) {
      handleOneDriveError(error as AxiosError);
      return;
    }

    if (reason === 'notFound' || dropboxError.isFileNotFoundError(error.response?.data?.error)) {
      dispatch(actions.setDocumentNotFound());
      return;
    }

    if (reason === 'insufficientFilePermissions') {
      dispatch(
        actions.openViewerModal({
          type: ModalTypes.ERROR,
          message: (
            <>
              <p>{t('viewer.header.errorPermissionDrive')}</p>
              <p>{t('viewer.header.errorPermissionDrive1')}</p>
            </>
          ),
          confirmButtonTitle: t(I18N_GOT_IT),
          onConfirm: () => {},
        })
      );
    }

    if (reason === 'insufficientParentPermissions') {
      return;
    }

    if (axios.isCancel(error)) {
      return;
    }

    toastUtils.error({
      message: t('viewer.header.failedToSyncYourDocument'),
    });
  };

  const handleRequestPermission = () =>
    new Promise((resolve, reject) => {
      requestPermission(() => resolve(1), reject) as void;
    });

  return async ({
    isOverride,
    currentDocument,
    shouldShowRatingModal,
    newDocumentName,
    folderInfo,
    downloadType,
    file,
    signal,
    flattenPdf,
  }: {
    isOverride: boolean;
    currentDocument: IDocumentBase;
    shouldShowRatingModal: boolean;
    newDocumentName: string;
    folderInfo?: FolderPropertiesType;
    downloadType?: string;
    file?: File;
    signal?: AbortSignal;
    flattenPdf?: boolean;
  }): Promise<{
    successMsg?: string;
    destinationStorage?: string;
    documentLocation?: string;
  }> => {
    const onHasPermissionCallback = async () => {
      const result = (await handleUpload({
        isOverride,
        currentDocument,
        newDocumentName,
        downloadType,
        folderInfo,
        file,
        signal,
        flattenPdf,
      })) as string;
      if (isOverride) {
        logger.logInfo({
          message: LOGGER.EVENT.CLEAR_ANNOTATION_AND_MANIPULATION_OF_DOCUMENT,
          reason: LOGGER.Service.DOCUMENT_INFO,
          attributes: {
            documentId: currentDocument._id,
          },
        });
        socket.emit(SOCKET_EMIT.CLEAR_ANNOTATION_AND_MANIPULATION_OF_DOCUMENT, currentDocument._id);
      }
      if (shouldShowRatingModal) {
        dispatch(actions.setShouldShowRating(AnimationBanner.SHOW));
      }
      const annotationIds = core.getAnnotationsList().map((annotation) => annotation.Id);
      dispatch(actions.setInternalAnnotationIds(annotationIds));

      const destinationStorage = STORAGE_TYPE_DESC[syncFileTo];
      const successMsg = isOverride
        ? t('viewer.header.yourFileHasBeenSyncedTo', { destinationStorage: '' })
        : t('viewer.header.copyIsCreatedOnYour', { destinationStorage: '' });
      return {
        successMsg,
        destinationStorage,
        documentLocation: result,
      };
    };
    try {
      if (checkPermission()) {
        return await onHasPermissionCallback();
      }
      await handleRequestPermission();
      return await onHasPermissionCallback();
    } catch (err) {
      handleSyncFileError(err);
      return {};
    }
  };
};

export default useSyncFileToExternalStorage;
