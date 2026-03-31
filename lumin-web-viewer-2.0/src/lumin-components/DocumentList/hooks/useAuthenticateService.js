import get from 'lodash/get';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { enqueueSnackbar } from '@libs/snackbar';

import actions from 'actions';
import selectors from 'selectors';
import { store } from 'store';

import { useTranslation } from 'hooks/useTranslation';

import electronDropboxServices from 'services/electronDropboxServices';
import googleServices from 'services/googleServices';
import { oneDriveServices } from 'services/oneDriveServices';

import logger from 'helpers/logger';

import { isElectron } from 'utils/corePathHelper';
import dropboxError from 'utils/dropboxError';
import fileUtil from 'utils/file';
import googleDriveError from 'utils/googleDriveError';
import OneDriveErrorUtils from 'utils/oneDriveError';

import { DriveErrorCode, DriveScopes } from 'constants/authConstant';
import { documentStorage } from 'constants/documentConstants';
import { LocalStorageKey } from 'constants/localStorageKey';
import { LOGGER, ModalTypes, STORAGE_TYPE } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';
import { ModalPriority } from 'constants/styles/Modal';
import { DROPBOX_AUTHORIZE_DOWNLOAD_API } from 'constants/urls';

export const DOCUMENT_DECORATOR_ACTION = {
  MOVE_MULTIPLE: 'move_multiple',
  OPEN_DOCUMENT: 'open_document',
  MERGE_MULTIPLE: 'merge_multiple',
};

export default function useAuthenticateService() {
  const dispatch = useDispatch();
  const googleEmailRef = useRef(null);
  const redirectInfoRef = useRef();
  const [notFoundDocuments, setNotFoundDocuments] = useState([]);
  const [documentAction, setDocumentAction] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const displayFallbackModalError = () => {
    dispatch(
      actions.openModal({
        type: ModalTypes.ERROR,
        title: t('modalCannotOpenFile.title'),
        message: t('modalCannotOpenFile.message'),
        cancelButtonTitle: t('common.openAnotherFile'),
        confirmButtonTitle: t('common.reload'),
        footerVariant: 'variant4',
        onCancel: () => {
          if (!selectors.getCurrentUser(store.getState())) {
            navigate(Routers.SIGNIN);
            return;
          }
          const documentListFallbackUrl =
            sessionStorage.getItem(SESSION_STORAGE_KEY.DOCUMENT_LIST_FALLBACK_URL) || Routers.DOCUMENTS;
          navigate(documentListFallbackUrl);
        },
        onConfirm: () => window.location.reload(),
      })
    );
  };

  const displayAccessDeniedToast = () => {
    enqueueSnackbar({
      message: t('openDrive.accessDenied'),
      variant: 'error',
    });
  };

  const verifyDriveAuthentication = async (documents) => {
    const tokenInfo = await googleServices.getTokenInfo();
    if (!tokenInfo) {
      googleServices.removeImplicitAccessToken();
      const error = new Error(DriveErrorCode.SIGNIN_REQUIRED);
      logger.logError({
        reason: LOGGER.Service.GOOGLE_API_ERROR,
        error,
      });
      throw error;
    }
    if (!googleServices.hasGrantedScope(DriveScopes.DRIVE_FILE)) {
      throw new Error(DriveErrorCode.PERMISSION_REQUIRED);
    }

    try {
      // Issue: We store incorrect remoteEmail field when uploading from drive because we get incorrect token to get profile from google
      // That's why we can't use remoteEmail to check user has permission to open that file
      // So we use getFileInfo to check token has permission to open this file from google
      await Promise.all(
        documents
          .map(({ remoteId, isAnonymousDocument }) => !isAnonymousDocument && remoteId)
          .filter(Boolean)
          .map((remoteId) => googleServices.getFileInfo(remoteId, '*', 'verifyDriveAuthentication'))
      );
    } catch (error) {
      googleEmailRef.current = tokenInfo.email;
      const hasOtherEmail = documents.some(({ remoteEmail }) => remoteEmail !== tokenInfo.email);
      if (hasOtherEmail) {
        throw new Error(DriveErrorCode.UNAUTHORIZED, {
          cause: { tokenInfo },
        });
      }
    }

    return true;
  };

  const verifyOneDriveAuthentication = async () => {
    const tokenInfo = await oneDriveServices.getAccessToken();
    if (!tokenInfo) {
      throw new Error('Unable to obtain token');
    }

    return true;
  };

  const handleDropboxAuthResult = useCallback(({ token = null, error = null } = {}) => {
    if (!redirectInfoRef.current) {
      if (token) {
        localStorage.setItem(LocalStorageKey.DROPBOX_TOKEN, token);
      }
      return;
    }

    const { documents, onSuccess, executer } = redirectInfoRef.current;

    if (token) {
      const currentDropboxToken = localStorage.getItem(LocalStorageKey.DROPBOX_TOKEN);
      if (token !== currentDropboxToken) {
        localStorage.setItem(LocalStorageKey.DROPBOX_TOKEN, token);
      }
      redirectInfoRef.current = null;
      executer(documents, onSuccess);
      return;
    }

    if (error) {
      redirectInfoRef.current = null;
    }
  }, []);

  const verifyDropboxAuthentication = ({ documents, onSuccess, executer }) => {
    if (localStorage.getItem(LocalStorageKey.DROPBOX_TOKEN)) {
      return true;
    }

    redirectInfoRef.current = {
      documents,
      onSuccess,
      executer,
    };

    if (isElectron()) {
      electronDropboxServices.authenticate({ authorizeUrl: DROPBOX_AUTHORIZE_DOWNLOAD_API }).catch((error) => {
        logger.logError({
          reason: LOGGER.Service.DROPBOX_API_ERROR,
          error,
        });
        handleDropboxAuthResult({ error: (error instanceof Error ? error.message : String(error)) || null });
      });
      return false;
    }

    window.open(DROPBOX_AUTHORIZE_DOWNLOAD_API, '_blank');
    return false;
  };

  const handleSignInDriveRequiredError = ({ documents, onSuccess, executer }) => {
    googleServices.implicitSignIn({
      callback: () => {
        executer(documents, onSuccess);
        logger.logInfo({
          message: LOGGER.EVENT.HANDLE_SIGN_IN_DRIVE_REQUIRED_ERROR,
          reason: LOGGER.Service.GOOGLE_API_INFO,
          attributes: { documents },
        });
      },
      onError: (error) => {
        logger.logError({
          reason: LOGGER.Service.GOOGLE_API_ERROR,
          error,
        });
      },
    });
  };

  const reSignIn = ({ documents, onSuccess, executer, loginHint = '' }) => {
    googleServices.implicitSignIn({
      callback: () => {
        executer(documents, onSuccess);
        logger.logInfo({
          message: LOGGER.EVENT.RE_SIGN_IN,
          reason: LOGGER.Service.GOOGLE_API_INFO,
        });
      },
      onError: (error) => {
        logger.logError({
          reason: LOGGER.Service.GOOGLE_API_ERROR,
          error,
        });
      },
      loginHint,
    });
  };

  const reSignInOneDrive = async ({ documents, onSuccess, executer, setLoading }) => {
    dispatch(actions.closeModal());
    setLoading(true);
    try {
      await oneDriveServices.logoutCurrentAccount();
      await verifyOneDriveAuthentication();
      executer(documents, onSuccess);
    } catch (error) {
      setLoading(false);
      const oneDriveErrorUtils = new OneDriveErrorUtils([{ error }]);
      if (oneDriveErrorUtils.isClosePopUpError()) {
        displayAccessDeniedToast();
      }
    }
  };

  const handleUnAuthorizedGoogleDriveError = ({ documents, onSuccess, executer, onCancel = () => {} }) => {
    const driveDocument = documents.find(
      (doc) => doc.service === documentStorage.google && doc.remoteEmail !== googleEmailRef.current?.toLowerCase()
    );
    dispatch(
      actions.openModal({
        type: ModalTypes.ERROR,
        title: t('cannotInteractWithThisFileModal.title'),
        message: (
          <Trans
            i18nKey="cannotInteractWithThisFileModal.message"
            values={{
              docName: fileUtil.getShortFilename(driveDocument.name),
              docRemoteEmail: driveDocument.remoteEmail,
              remoteEmail: googleEmailRef.current,
            }}
            components={{
              EmailText: <span style={{ color: 'var(--kiwi-colors-core-primary)' }} />,
            }}
          />
        ),
        onCancel,
        confirmButtonTitle: t('cannotInteractWithThisFileModal.reauthorize'),
        onConfirm: () => reSignIn({ documents, onSuccess, executer }),
        useReskinModal: true,
      })
    );
  };

  const handleUnAuthorizedOneDriveError = ({ documents, onSuccess, executer, setLoading, onCancel = () => {} }) => {
    const remoteEmail = oneDriveServices.getCurrentAccountEmailInCache();
    const foundDocument = documents.find(
      (doc) => doc.service === documentStorage.onedrive && doc.remoteEmail !== remoteEmail
    );

    if (!foundDocument) {
      displayFallbackModalError();
      return;
    }

    dispatch(
      actions.openModal({
        type: ModalTypes.ERROR,
        title: t('cannotInteractWithThisFileModal.title'),
        message: (
          <Trans
            i18nKey="cannotInteractWithThisFileModal.message"
            values={{
              docName: fileUtil.getShortFilename(foundDocument.name),
              docRemoteEmail: foundDocument.remoteEmail,
              remoteEmail,
            }}
            components={{
              EmailText: <span style={{ color: 'var(--kiwi-colors-core-primary)' }} />,
            }}
          />
        ),
        onCancel,
        confirmButtonTitle: t('cannotInteractWithThisFileModal.reauthorize'),
        onConfirm: () => reSignInOneDrive({ documents, onSuccess, executer, setLoading }),
        useReskinModal: true,
      })
    );
  };

  const getModalPopupBlockedProps = (storage) =>
    ({
      [STORAGE_TYPE.GOOGLE]: {
        type: ModalTypes.DRIVE,
        message: t('openDrive.popupBrowserBlocked', { storageService: 'Drive' }),
      },
      [STORAGE_TYPE.ONEDRIVE]: {
        type: ModalTypes.ONE_DRIVE,
        message: t('openDrive.popupBrowserBlocked', { storageService: 'OneDrive' }),
      },
    }[storage]);

  const handleBlockedPopupError = ({ onConfirm, storage }) => {
    dispatch(
      actions.openModal({
        ...getModalPopupBlockedProps(storage),
        title: t('openDrive.permissionRequired'),
        confirmButtonTitle: t('openDrive.givePermission'),
        onConfirm,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        isFullWidthButton: false,
        priority: ModalPriority.HIGH,
        useReskinModal: true,
        ...(isElectron() && {
          cancelButtonTitle: t('common.cancel'),
          onCancel: () => dispatch(actions.closeModal()),
        }),
      })
    );
  };

  const handleCheckError = (error, { documents, onSuccess, executer, setLoading, onCancel = () => {} }) => {
    const errors = error.errors ?? [{ error }] ?? [];
    const oneDriveErrorUtils = new OneDriveErrorUtils(errors);
    setLoading(false);

    if (
      oneDriveErrorUtils.isAccessDenied() ||
      oneDriveErrorUtils.isAuthenticationError() ||
      oneDriveErrorUtils.isInvalidRequestError()
    ) {
      handleUnAuthorizedOneDriveError({
        documents,
        onSuccess,
        executer,
        setLoading,
        onCancel,
      });
      return;
    }

    if (oneDriveErrorUtils.isPopupBlockedError()) {
      handleBlockedPopupError({
        onConfirm: () => reSignInOneDrive({ documents, onSuccess, executer, setLoading }),
        storage: STORAGE_TYPE.ONEDRIVE,
      });
      return;
    }

    if (
      oneDriveErrorUtils.isClosePopUpError() ||
      oneDriveErrorUtils.isAuthenticationCancelled() ||
      googleDriveError.isClosePopUpError(error) ||
      googleDriveError.isAccessDeniedError(error)
    ) {
      displayAccessDeniedToast();
      return;
    }

    if (oneDriveErrorUtils.isExpectedAuthError()) {
      return;
    }

    if (googleDriveError.isSigninDriveRequiredError(error) || googleDriveError.isInvalidCredential(errors[0]?.error)) {
      handleSignInDriveRequiredError({
        documents,
        onSuccess,
        executer,
      });
      return;
    }

    if (googleDriveError.isPermissionRequiredError(error)) {
      googleServices.implicitSignIn({
        scope: [DriveScopes.DRIVE_FILE, DriveScopes.DRIVE_INSTALL],
        callback: () => {
          executer(documents, onSuccess);
        },
        onError: (error) => {
          if (googleDriveError.isBlockPopUpError(error)) {
            logger.logError({
              reason: LOGGER.Service.GOOGLE_API_ERROR,
              error,
            });
            handleBlockedPopupError({
              onConfirm: () =>
                reSignIn({
                  documents,
                  onSuccess: () => {
                    setLoading(true);
                    onSuccess();
                  },
                  executer,
                  loginHint: googleServices.getAccessTokenEmail(),
                }),
              storage: STORAGE_TYPE.GOOGLE,
            });
            return;
          }
          displayAccessDeniedToast();
        },
        loginHint: googleServices.getAccessTokenEmail(),
      });
      return;
    }
    if (googleDriveError.isUnauthorizedError(error)) {
      handleUnAuthorizedGoogleDriveError({
        documents,
        onSuccess,
        executer,
        onCancel,
      });
      return;
    }

    if (googleDriveError.isBlockPopUpError(error)) {
      handleBlockedPopupError({
        onConfirm: () =>
          reSignIn({
            documents,
            onSuccess,
            executer,
            loginHint: googleServices.getAccessTokenEmail(),
          }),
        storage: STORAGE_TYPE.GOOGLE,
      });
      return;
    }
    const hasExpiredTokenError = errors.some(({ error: e }) =>
      dropboxError.isTokenExpiredError(get(e, 'response.data.error'))
    );
    if (hasExpiredTokenError) {
      localStorage.removeItem(LocalStorageKey.DROPBOX_TOKEN);
      redirectInfoRef.current = {
        documents,
        onSuccess,
        executer,
      };
      window.open(DROPBOX_AUTHORIZE_DOWNLOAD_API, '_blank');
      return;
    }

    const hasNotFoundError = errors.some(
      ({ error: e }) =>
        googleDriveError.isFileNotFoundError(e) ||
        dropboxError.isFileNotFoundError(get(e, 'response.data.error')) ||
        oneDriveErrorUtils.isFileNotFound()
    );
    if (hasNotFoundError) {
      setNotFoundDocuments(errors.map(({ document }) => document));
      dispatch(actions.setDocumentNotFound());
      return;
    }

    logger.logError({
      reason: 'Open document error',
      error,
    });
    displayFallbackModalError();
  };

  useEffect(() => {
    const handleMessageDropbox = (e) => {
      if (window.location.origin !== e.origin) {
        return;
      }

      if (e.data.token) {
        handleDropboxAuthResult({ token: e.data.token });
      }

      if (e.data.cancelAuthorize) {
        handleDropboxAuthResult({ error: 'cancelAuthorize' });
      }
    };

    window.addEventListener('message', handleMessageDropbox, false);

    const unsubscribeElectron = electronDropboxServices.subscribe((payload) => {
      handleDropboxAuthResult(payload);
    });

    return () => {
      window.removeEventListener('message', handleMessageDropbox);
      unsubscribeElectron();
    };
  }, [handleDropboxAuthResult]);

  return {
    documentAction,
    setDocumentAction,
    redirectInfoRef,
    notFoundDocuments,
    setNotFoundDocuments,
    handleCheckError,
    authentication: {
      drive: verifyDriveAuthentication,
      dropbox: verifyDropboxAuthentication,
      oneDrive: verifyOneDriveAuthentication,
    },
  };
}
