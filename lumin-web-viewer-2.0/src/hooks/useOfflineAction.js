/* eslint-disable no-use-before-define */
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import { cachingFileHandler, storageHandler } from 'HOC/OfflineStorageHOC';

import { useLatestRef, useStrictDownloadGooglePerms, useTranslation } from 'hooks';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { documentServices, uploadServices } from 'services';
import PersonalDocumentUploadService from 'services/personalDocumentUploadService';

import logger from 'helpers/logger';

import { errorUtils, getFile, toastUtils, validator } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { DOCUMENT_OFFLINE_STATUS } from 'constants/documentConstants';
import { ErrorCode, GoogleErrorCode } from 'constants/errorCode';
import { ModalTypes, STORAGE_TYPE } from 'constants/lumin-common';
import { ERROR_MESSAGE_RESTRICTED_ACTION } from 'constants/messages';
import { SOCKET_EMIT } from 'constants/socketConstant';

import { socket } from '../socket';

export function useOfflineAction() {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const isSourceDownloading = useSelector(selectors.isSourceDownloading);
  const [pendingDownloadedDocument, setPendingDownloadedDocument] = useState();
  const [isConverting, setIsConverting] = useState(false);
  const isProcessing = useRef(false);
  const { t } = useTranslation();
  const { showModal } = useStrictDownloadGooglePerms();
  const { isViewer } = useViewerMatch();
  const organizations = useSelector(selectors.getOrganizationList, shallowEqual);
  const organizationRef = useLatestRef(organizations);

  const renderLearnMoreLink = () => (
    <Link to="/setting/general" style={{ textDecoration: 'underline', fontWeight: 600 }} target="_blank">
      {t('viewer.header.learnMore')}
    </Link>
  );

  const handleDownloadError = (documentId, error) => {
    const { code } = errorUtils.extractGqlError(error);
    const isRestrictedAction = code === ErrorCode.Common.RESTRICTED_ACTION;
    let errorMessage;
    if (isRestrictedAction) {
      errorMessage = ERROR_MESSAGE_RESTRICTED_ACTION;
    } else {
      errorMessage = t('errorMessage.unknownError');
      logger.logError({
        error,
        reason: 'Failed to download document',
      });
    }
    toastUtils.openToastMulti({
      type: ModalTypes.ERROR,
      message: errorMessage,
    });
    cachingFileHandler.onDownloadFailed(documentId);
  };

  const onDownloadDocument = async (downloadingDocument) => {
    toastUtils.openToastMulti({
      type: ModalTypes.INFO,
      message: t('viewer.header.makingFileAvailableOffline'),
    });
    try {
      await cachingFileHandler.download(downloadingDocument);
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: (
          <>
            <b>{downloadingDocument.name}</b> {t('viewer.header.isNowAvailableOffline')}
          </>
        ),
      });
    } catch (error) {
      handleDownloadError(downloadingDocument._id, error);
    }
  };

  const onEnableOfflineMode = () => {
    toastUtils.openToastMulti({
      type: ModalTypes.INFO,
      message: t('common.settingUpOffline'),
    });
    storageHandler.downloadSource();
  };

  const preCheckOfflineMode = async (document) => {
    const { email: currentUserEmail } = currentUser || {};
    const { email: offlineEmail } = await cachingFileHandler.getActiveOfflineUser();

    if (!offlineEmail) {
      const modalSetting = {
        type: ModalTypes.WARNING,
        title: t('viewer.header.enableOfflineSupport'),
        message: (
          <>
            {t('viewer.header.descEnableOfflineSupport')} {renderLearnMoreLink()}.
          </>
        ),
        confirmButtonTitle: t('common.enable'),
        cancelButtonTitle: t('common.cancel'),
        onConfirm: onEnableOfflineMode,
        onCancel: () => dispatch(actions.closeModal()),
        confirmBtnElementName: ButtonName.ENABLE_OFFLINE_ITEM,
      };
      dispatch(actions.openModal(modalSetting));
      setPendingDownloadedDocument(document);
      return { canMakeOffline: false };
    }

    if (currentUserEmail !== offlineEmail) {
      const modalSetting = {
        type: ModalTypes.WARNING,
        title: t('viewer.header.cannotEnableOfflineSupport'),
        message: (
          <>
            <Trans i18nKey="viewer.header.descCannotEnableOfflineSupport">
              Another user (<b>{{ offlineEmail }}</b>) has already enabled offline support on this device.
            </Trans>
            {renderLearnMoreLink()}.
          </>
        ),
        confirmButtonTitle: t('common.ok'),
        onConfirm: () => dispatch(actions.closeModal()),
      };
      dispatch(actions.openModal(modalSetting));
      return { canMakeOffline: false };
    }
    return { canMakeOffline: true };
  };

  const makeThirdPartyDocOffline = (document) => async () => {
    dispatch(actions.closeModal());
    const fileSize = await uploadServices.getFileSize(document);
    const { allowedUpload, maxSizeAllow } = uploadServices.checkUploadBySize(
      fileSize,
      validator.validatePremiumUser(currentUser, organizationRef.current.data)
    );
    if (!allowedUpload) {
      dispatch(
        actions.openModal({
          type: ModalTypes.ERROR,
          title: t('viewer.header.documentUploadFailed'),
          message: t('viewer.header.fileSizeMustBeLessThan', { maxSizeAllow }),
          confirmButtonTitle: t('common.ok'),
          onConfirm: () => dispatch(actions.closeModal()),
        })
      );
      return;
    }
    setIsConverting(true);

    try {
      const file = await getFile(document);
      if (file) {
        toastUtils.openToastMulti({
          message: t('viewer.header.driveDropboxFilesNeedMoreTimeToProgress'),
          type: ModalTypes.INFO,
          duration: 10000,
        });

        const { encodedUploadData } = await documentServices.uploadDocumentWithThumbnailToS3({ file });
        const uploader = new PersonalDocumentUploadService();
        const newDocument = await uploader.upload({
          encodedUploadData,
          documentId: document._id,
          orgId: document.belongsTo.workspaceId,
        });

        socket.emit(SOCKET_EMIT.UPDATE_DOCUMENT, { roomId: newDocument._id, type: 'updateService' });

        if (isViewer) {
          dispatch(actions.setCurrentDocument(newDocument));
        }
        const { canMakeOffline } = await preCheckOfflineMode(newDocument);
        if (canMakeOffline) {
          onDownloadDocument({
            ...document,
            ...newDocument,
            service: STORAGE_TYPE.S3,
            lastAccess: document.lastAccess,
            createdAt: document.createdAt,
          });
        }
      }
    } catch (error) {
      logger.logError({ error });
      const { code } = errorUtils.extractGqlError(error);
      if (code === ErrorCode.Common.RESTRICTED_ACTION) {
        toastUtils.error({
          message: ERROR_MESSAGE_RESTRICTED_ACTION,
        });
        return;
      }
      const { errors } = error.result.error;
      if (errors[0].reason === GoogleErrorCode.CANNOT_DOWNLOAD_FILE) {
        showModal(
          () => makeThirdPartyDocOffline(document),
          () => {}
        );
        return;
      }
      const modalSettings = {
        type: ModalTypes.ERROR,
        title: t('viewer.header.documentUploadFailed'),
        message: t('viewer.header.pleaseTryAndUploadTheDocumentAgain'),
      };
      dispatch(actions.openModal(modalSettings));
    } finally {
      setIsConverting(false);
    }
  };

  const handleMakeAvailableOffline = async (document) => {
    const { name: documentName, service } = document;
    const hasAvailableStorage = await storageHandler.hasAvailableOfflineStorage();

    if (!hasAvailableStorage) {
      const modalSetting = {
        type: ModalTypes.WARNING,
        title: t('viewer.header.offlineStorageReachesTheLimit'),
        message: t('viewer.header.descOfflineStorageReachesTheLimit'),
        confirmButtonTitle: t('common.ok'),
        onConfirm: () => dispatch(actions.closeModal()),
      };
      dispatch(actions.openModal(modalSetting));
      return;
    }

    if (service !== STORAGE_TYPE.S3) {
      const modalSetting = {
        type: ModalTypes.WARNING,
        title: t('viewer.header.filesStorageWillBeChanged'),
        message: (
          <>
            <b>{documentName}</b> {t('viewer.header.messageFilesStorageWillBeChanged')}
          </>
        ),
        confirmButtonTitle: t('viewer.header.makeOffline'),
        cancelButtonTitle: t('common.cancel'),
        closeOnConfirm: false,
        onConfirm: makeThirdPartyDocOffline(document),
        onCancel: () => dispatch(actions.closeModal()),
      };
      dispatch(actions.openModal(modalSetting));
      return;
    }

    const { canMakeOffline } = await preCheckOfflineMode(document);
    if (canMakeOffline) {
      onDownloadDocument(document);
    }
  };

  const makeOffline = useCallback(
    (document, { callback = () => {} } = {}) =>
      async () => {
        const { _id: documentId, name: documentName, offlineStatus } = document;
        if (offlineStatus === DOCUMENT_OFFLINE_STATUS.DOWNLOADING || isProcessing.current) {
          return;
        }
        const deletedItem = await cachingFileHandler.delete(documentId);
        if (deletedItem) {
          toastUtils.openToastMulti({
            type: ModalTypes.SUCCESS,
            message: (
              <>
                <b>{documentName}</b> {t('viewer.header.isNoLongerAvailableOffline')}
              </>
            ),
          });
          callback(false);
        } else {
          await handleMakeAvailableOffline(document);
          callback(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      },
    []
  );

  useEffect(() => {
    isProcessing.current = isSourceDownloading || isConverting;
  }, [isSourceDownloading, isConverting]);

  return {
    makeOffline,
    pendingDownloadedDocument,
    setPendingDownloadedDocument,
    onDownloadDocument,
  };
}
