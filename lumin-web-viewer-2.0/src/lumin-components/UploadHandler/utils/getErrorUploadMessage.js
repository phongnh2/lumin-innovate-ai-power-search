import logger from 'helpers/logger';

import { file as fileUtils, errorUtils } from 'utils';

import { ErrorCode, GoogleErrorCode } from 'constants/errorCode';
import { ERROR_MESSAGE_DOCUMENT, ERROR_MESSAGE_RESTRICTED_ACTION, ERROR_MESSAGE_TYPE } from 'constants/messages';
import { MAX_TEMPLATE_COUNT } from 'constants/templateConstant';

const getUploadErrorMessage = ({ t, messageType, fileData: { fileName, maxSizeAllow } = {} }) => {
  const UPLOAD_ERROR_MESSAGES = {
    [ERROR_MESSAGE_TYPE.PDF_SIZE]: {
      toast: t('errorMessage.pdfSize', { maxSizeAllow }),
      popup: t('errorMessage.pdfSizePopup', { maxSizeAllow }),
    },
    [ERROR_MESSAGE_TYPE.PDF_PASSWORD]: t('errorMessage.pdfPassword', {
      fileName: fileUtils.getShortFilename(fileName),
    }),
    [ERROR_MESSAGE_TYPE.PDF_CANCEL_PASSWORD]: t('errorMessage.cancelPassword', {
      fileName: fileUtils.getShortFilename(fileName),
    }),
    [ERROR_MESSAGE_TYPE.PDF_UNSUPPORT_TYPE]: {
      toast: t('errorMessage.unSupportType'),
      popup: t('errorMessage.upSupportMessage'),
    },
    [ERROR_MESSAGE_TYPE.PDF_NOT_FOUND]: t('errorMessage.pdfNotFound'),
    [ERROR_MESSAGE_TYPE.DAILY_DOCUMENT_UPLOAD]: {
      toast: t('errorMessage.dailyUpload'),
      popup: t(ERROR_MESSAGE_DOCUMENT.DAILY_UPLOAD_LIMIT),
    },
    [ERROR_MESSAGE_TYPE.DOCUMENT_TEMPLATE_QUOTA_EXCEEDED]: t('errorMessage.documentTemplateQuotaExceeded', {
      maxTemplateCount: MAX_TEMPLATE_COUNT.toLocaleString('en-US'),
    }),
    [ERROR_MESSAGE_TYPE.REACH_DOCUMENT_STACK]: t('errorMessage.reachDocstack'),
    [ERROR_MESSAGE_TYPE.RESTRICTED_ACTION]: ERROR_MESSAGE_RESTRICTED_ACTION,
    [ERROR_MESSAGE_TYPE.STRICTED_DOWNLOAD_PERMISSION]: t('errorMessage.makeSureDowloadPerms'),
    [ERROR_MESSAGE_TYPE.DEFAULT]: t('errorMessage.retryUpload'),
  };

  return {
    of: (type) => {
      const message = UPLOAD_ERROR_MESSAGES[messageType] || UPLOAD_ERROR_MESSAGES.default;
      return message[type] || message;
    },
  };
};

const getErrorMessage = ({ t, fileUpload = {}, error }) => {
  const { message, code, metadata = {} } = errorUtils.extractGqlError(error);
  logger.logError({ error });
  if (code === ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT) {
    return getUploadErrorMessage({ t, messageType: ERROR_MESSAGE_TYPE.REACH_DOCUMENT_STACK }).of('popup');
  }
  if (code === ErrorCode.Document.DOCUMENT_TEMPLATE_QUOTA_EXCEEDED) {
    return getUploadErrorMessage({ t, messageType: ERROR_MESSAGE_TYPE.DOCUMENT_TEMPLATE_QUOTA_EXCEEDED }).of('popup');
  }
  if (errorUtils.isRateLimitError(error) || code === ERROR_MESSAGE_TYPE.DAILY_DOCUMENT_UPLOAD) {
    return getUploadErrorMessage({ t, messageType: ERROR_MESSAGE_TYPE.DAILY_DOCUMENT_UPLOAD }).of('popup');
  }
  if (code === ErrorCode.Common.RESTRICTED_ACTION) {
    return getUploadErrorMessage({ t, messageType: ERROR_MESSAGE_TYPE.RESTRICTED_ACTION }).of('popup');
  }
  if (error.result?.error?.errors[0]?.reason === GoogleErrorCode.CANNOT_DOWNLOAD_FILE) {
    return getUploadErrorMessage({ t, messageType: ERROR_MESSAGE_TYPE.STRICTED_DOWNLOAD_PERMISSION }).of('popup');
  }
  const fileName = fileUpload.fileData?.file?.name || '';
  return getUploadErrorMessage({ t, messageType: message, fileData: { fileName, ...metadata } }).of('popup');
};

export default {
  getUploadErrorMessage,
  getErrorMessage,
};
