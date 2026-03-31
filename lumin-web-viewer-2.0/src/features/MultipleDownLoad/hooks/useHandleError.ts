import { get } from 'lodash';

import { useTranslation } from 'hooks';

import { oneDriveServices } from 'services';

import logger from 'helpers/logger';

import { dropboxError, googleDriveError } from 'utils';
import { ErrorType } from 'utils/Factory/EventCollection/constants/DocumentActionsEvent';
import OneDriveErrorUtils, { ErrorBase } from 'utils/oneDriveError';

import { DocumentStorage } from 'constants/documentConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';

// To debug error from third party service
const logInfo = ({
  reason = 'getThirdPartyErrorMessage',
  message,
  attributes,
}: {
  reason?: string;
  message: string;
  attributes: Record<string, string | number>;
}) => {
  logger.logInfo({
    reason,
    message,
    attributes,
  });
};

export const useHandleError = () => {
  const { t } = useTranslation();

  const fileNotFoundErrorMessage = (service: string) =>
    t('multipleDownload.documentDeletedOrAccessRevoked', {
      service,
    });

  const getGoogleDriveErrorMessage = ({ error, doc }: { error: Error; doc: IDocumentBase }) => {
    if (googleDriveError.isBlockPopUpError(error)) {
      return { errorMessage: t('openDrive.blockByBrowser'), errorType: ErrorType.BLOCK_POPUP };
    }
    if (googleDriveError.isFileNotFoundError(error)) {
      return {
        errorMessage: fileNotFoundErrorMessage(DocumentStorage.GOOGLE),
        errorType: ErrorType.ORIGINAL_FILE_DELETED_OR_INSUFFICIENT_PERMISSIONS,
      };
    }
    if (googleDriveError.isUnauthorizedError(error)) {
      const { tokenInfo } = (error.cause as { tokenInfo: { email: string } }) || { tokenInfo: { email: '' } };
      return {
        errorMessage: t('multipleDownload.errorDifferentAccount', {
          docRemoteEmail: doc.remoteEmail,
          remoteEmail: tokenInfo.email,
        }),
        errorType: ErrorType.INCORRECT_UPLOADED_ACCOUNT,
      };
    }
    if (googleDriveError.isClosePopUpError(error) || googleDriveError.isAccessDeniedError(error)) {
      return { errorMessage: t('openDrive.accessDenied'), errorType: ErrorType.ACCESS_DENIED };
    }
    logInfo({
      message: 'Error getting Google Drive error message',
      attributes: {
        errorMessage: error?.message ?? '',
        errorCode: (error as unknown as { code: string }).code ?? '',
      },
    });
    return { errorMessage: error?.message ?? '', errorType: ErrorType.INSUFFICIENT_DOWNLOAD_PERMISSIONS };
  };

  const getOneDriveErrorMessage = ({ error, doc }: { error: { errors: ErrorBase[] }; doc: IDocumentBase }) => {
    const errors = (error.errors ?? [{ error }] ?? []) as [ErrorBase];
    const oneDriveErrorUtils = new OneDriveErrorUtils(errors);
    if (oneDriveErrorUtils.isClosePopUpError()) {
      return { errorMessage: t('openDrive.accessDenied'), errorType: ErrorType.ACCESS_DENIED };
    }
    if (oneDriveErrorUtils.isPopupBlockedError()) {
      return {
        errorMessage: t('openDrive.popupBrowserBlocked', { storageService: DocumentStorage.ONEDRIVE }),
        errorType: ErrorType.BLOCK_POPUP,
      };
    }
    if (oneDriveErrorUtils.isFileNotFound()) {
      return {
        errorMessage: fileNotFoundErrorMessage(DocumentStorage.ONEDRIVE),
        errorType: ErrorType.ORIGINAL_FILE_DELETED_OR_INSUFFICIENT_PERMISSIONS,
      };
    }
    if (
      oneDriveErrorUtils.isAccessDenied() ||
      oneDriveErrorUtils.isAuthenticationError() ||
      oneDriveErrorUtils.isInvalidRequestError()
    ) {
      const remoteEmail = oneDriveServices.getCurrentAccountEmailInCache();
      const docRemoteEmail = doc.remoteEmail;
      return {
        errorMessage: t('multipleDownload.errorDifferentAccount', {
          docRemoteEmail,
          remoteEmail,
        }),
        errorType: ErrorType.INCORRECT_UPLOADED_ACCOUNT,
      };
    }
    const { errorMessage, errorCode, statusCode } = oneDriveErrorUtils.getErrorData;
    logInfo({
      message: 'Error getting OneDrive error message',
      attributes: {
        errorMessage,
        errorCode,
        statusCode,
      },
    });
    return { errorMessage, errorType: ErrorType.INSUFFICIENT_DOWNLOAD_PERMISSIONS };
  };

  const getDropboxErrorMessage = ({ error }: { error: Error }) => {
    if (dropboxError.isFileNotFoundError(get(error, 'response.data.error'))) {
      return {
        errorMessage: fileNotFoundErrorMessage(DocumentStorage.DROPBOX),
        errorType: ErrorType.ORIGINAL_FILE_DELETED_OR_INSUFFICIENT_PERMISSIONS,
      };
    }
    logInfo({
      message: 'Error getting Dropbox error message',
      attributes: {
        errorMessage: error?.message ?? '',
        errorCode: (error as unknown as { code: string }).code ?? '',
      },
    });
    return {
      errorMessage: error?.message ?? t('common.somethingWentWrong'),
      errorType: ErrorType.INSUFFICIENT_DOWNLOAD_PERMISSIONS,
    };
  };

  return {
    getOneDriveErrorMessage,
    getGoogleDriveErrorMessage,
    getDropboxErrorMessage,
  };
};
