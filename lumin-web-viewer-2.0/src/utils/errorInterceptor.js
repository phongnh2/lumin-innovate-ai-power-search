import i18next from 'i18next';

import errorExtract from 'utils/error';

import { MAX_SIZE_UPLOAD_DOCUMENT } from 'constants/documentConstants';
import { DefaultErrorCode, ErrorCode } from 'constants/errorCode';
import {
  ERROR_MESSAGE_BANNED_EMAIL,
  ERROR_MESSAGE_EMAIL_EXISTED,
  ERROR_MESSAGE_UNKNOWN_ERROR,
  ERROR_MESSAGE_NOT_VERIFY_ACCOUNT,
  ERROR_MESSAGE_ALREADY_SIGNUP_BY_THIRD_PARTY,
  ERROR_MESSAGE_LIMIT_REQUESTS,
  ERROR_MESSAGE_NOT_FOUND,
  ERROR_MESSAGE_RESEND_VERIFIED_FAILED,
  ERROR_MESSAGE_EXPIRED_TOKEN,
  ERROR_MESSAGE_INVALID_TOKEN,
  ERROR_MESSAGE_REQUEST_ALREADY_SENT,
  ERROR_MESSAGE_DUPLICATE_RECENT_PASSWORD,
  ERROR_MESSAGE_RESET_PASSWORD_FAIL,
  ERROR_MESSAGE_RESET_PASSWORD_INVALID_LINK,
  ERROR_MESSAGE_NO_PERMISSION,
  ERROR_MESSAGE_DOCUMENT,
  ERROR_MESSAGE_NOTIFICATION,
  ERROR_MESSAGE_ALREADY_VERIFY_USER,
  ERROR_MESSAGE_REQUIRE_STRONG_PASSWORD,
  ERROR_MESSAGE_NEW_PASSWORD_IS_THE_SAME,
  ERROR_MESSAGE_WRONG_CURRENT_PASSWORD,
  getUploadOverFileSizeError,
  getSignInFailedAttemptError,
  getBlockedAccountError,
  ERROR_MESSAGE_TEMPLATE,
  ERROR_MESSAGE_RESTRICTED_ACTION,
} from 'constants/messages';

const getAuthErrorMessage = (error) => {
  const { code, metadata } = errorExtract.extractGqlError(error);
  return (
    {
      [ErrorCode.User.CREATE_USER_FAIL]: i18next.t(ERROR_MESSAGE_UNKNOWN_ERROR),
      [ErrorCode.User.EMAIL_ALREADY_EXISTS]: i18next.t(ERROR_MESSAGE_EMAIL_EXISTED),
      [ErrorCode.User.EMAIL_IS_BANNED]: i18next.t(ERROR_MESSAGE_BANNED_EMAIL),
      [ErrorCode.User.USER_NOT_VERIFIED]: i18next.t(ERROR_MESSAGE_NOT_VERIFY_ACCOUNT),
      [ErrorCode.User.USER_ALREADY_VERIFIED]: i18next.t(ERROR_MESSAGE_ALREADY_VERIFY_USER),
      [ErrorCode.User.USER_NOT_FOUND]: i18next.t(ERROR_MESSAGE_NOT_FOUND),
      [ErrorCode.User.RESEND_VERIFY_EMAIL_FAIL]: i18next.t(ERROR_MESSAGE_RESEND_VERIFIED_FAILED),
      [ErrorCode.User.THIRD_PARTY_ACCOUNT]: i18next.t(ERROR_MESSAGE_ALREADY_SIGNUP_BY_THIRD_PARTY),
      [ErrorCode.User.DUPLICATE_RECENT_PASSWORD]: i18next.t(ERROR_MESSAGE_DUPLICATE_RECENT_PASSWORD),
      [ErrorCode.User.RESET_PASSWORD_FAIL]: i18next.t(ERROR_MESSAGE_RESET_PASSWORD_FAIL),
      [ErrorCode.User.RESET_PASSWORD_INVALID_LINK]: i18next.t(ERROR_MESSAGE_RESET_PASSWORD_INVALID_LINK),
      [ErrorCode.User.SAME_OLD_PASSWORD]: i18next.t(ERROR_MESSAGE_NEW_PASSWORD_IS_THE_SAME),
      [ErrorCode.User.SIGN_OUT_FAIL]: i18next.t(ERROR_MESSAGE_RESET_PASSWORD_INVALID_LINK),
      [ErrorCode.User.ORGANIZATION_REQUIRE_STRONG_PASSWORD]: i18next.t(ERROR_MESSAGE_REQUIRE_STRONG_PASSWORD),
      [ErrorCode.User.USER_REQUIRE_STRONG_PASSWORD]: i18next.t(ERROR_MESSAGE_REQUIRE_STRONG_PASSWORD),
      [ErrorCode.User.INVALID_PASSWORD_INPUT]: i18next.t(ERROR_MESSAGE_WRONG_CURRENT_PASSWORD),
      [ErrorCode.Common.REQUEST_ALREADY_SENT]: i18next.t(ERROR_MESSAGE_REQUEST_ALREADY_SENT),
      [DefaultErrorCode.TOO_MANY_REQUESTS]: i18next.t(ERROR_MESSAGE_LIMIT_REQUESTS),
      [ErrorCode.Common.TOKEN_EXPIRED]: i18next.t(ERROR_MESSAGE_EXPIRED_TOKEN),
      [ErrorCode.Common.TOKEN_INVALID]: i18next.t(ERROR_MESSAGE_INVALID_TOKEN),
      [ErrorCode.User.SIGN_IN_FAIL_ATTEMPT_REMAINING]: getSignInFailedAttemptError(metadata.remainingAttempts),
      [ErrorCode.User.ACCOUNT_BLOCKED]: getBlockedAccountError(metadata.blockTime),
    }[code] || i18next.t(ERROR_MESSAGE_UNKNOWN_ERROR)
  );
};

const getDocumentErrorMessage = (error) => {
  if (errorExtract.isRateLimitError(error)) {
    return i18next.t(ERROR_MESSAGE_DOCUMENT.TOO_MANY_REQUESTS);
  }
  const { code } = errorExtract.extractGqlError(error);
  return (
    {
      [ErrorCode.Common.NO_PERMISSION]: i18next.t(ERROR_MESSAGE_NO_PERMISSION),
      [ErrorCode.Document.CREATE_DOCUMENT_FAIL]: i18next.t(ERROR_MESSAGE_DOCUMENT.CREATE_FAILED),
      [ErrorCode.Document.DOCUMENT_NOT_FOUND]: i18next.t(ERROR_MESSAGE_DOCUMENT.DOCUMENT_NOT_FOUND),
      [ErrorCode.Document.REQUESTER_DOCUMENT_NOT_FOUND]: i18next.t(ERROR_MESSAGE_DOCUMENT.REQUESTER_DOCUMENT_NOT_FOUND),
      [ErrorCode.Document.REQUESTER_DOCUMENT_HAS_BEEN_ADDED]: i18next.t(
        ERROR_MESSAGE_DOCUMENT.REQUESTER_DOCUMENT_HAS_BEEN_ADDED
      ),
      [ErrorCode.Document.NO_DOCUMENT_PERMISSION]: i18next.t(ERROR_MESSAGE_DOCUMENT.NO_DOCUMENT_PERMISSION),
      [ErrorCode.Document.REQUEST_ACCESS_DOCUMENT_NOT_FOUND]: i18next.t(
        ERROR_MESSAGE_DOCUMENT.REQUEST_ACCESS_DOCUMENT_NOT_FOUND
      ),
      [ErrorCode.Document.OVER_FILE_SIZE_FREE]: getUploadOverFileSizeError(MAX_SIZE_UPLOAD_DOCUMENT.FREE),
      [ErrorCode.Document.OVER_FILE_SIZE_PREMIUM]: getUploadOverFileSizeError(MAX_SIZE_UPLOAD_DOCUMENT.PAID),
      [ErrorCode.Document.DAILY_LIMIT_UPLOAD]: i18next.t(ERROR_MESSAGE_DOCUMENT.DAILY_UPLOAD_LIMIT),
      [ErrorCode.Document.ORG_REACHED_DOC_STACK_LIMIT]: i18next.t(ERROR_MESSAGE_DOCUMENT.ORG_REACHED_DOC_STACK_LIMIT),
      [ErrorCode.Common.RESTRICTED_ACTION]: ERROR_MESSAGE_RESTRICTED_ACTION,
      [DefaultErrorCode.TOO_MANY_REQUESTS]: i18next.t(ERROR_MESSAGE_DOCUMENT.TOO_MANY_REQUESTS),
    }[code] || i18next.t(ERROR_MESSAGE_UNKNOWN_ERROR)
  );
};

const getNotificationErrorMessage = (error) => {
  const { code } = errorExtract.extractGqlError(error);
  return ({
    [ErrorCode.Noti.READ_NOTIFICATION_FAIL]: i18next.t(ERROR_MESSAGE_NOTIFICATION.READ_NOTIFICATION_FAIL),
    [ErrorCode.Noti.READ_ALL_NOTIFICATIONS_FAIL]: i18next.t(ERROR_MESSAGE_NOTIFICATION.READ_ALL_NOTIFICATIONS_FAIL),
  })[code] || i18next.t(ERROR_MESSAGE_UNKNOWN_ERROR);
};

const getOrgErrorMessage = (error) => {
  const { code } = errorExtract.extractGqlError(error);
  return ({

  })[code] || i18next.t(ERROR_MESSAGE_UNKNOWN_ERROR);
};

const getTemplateErrorMessage = (error) => {
  const { code } = errorExtract.extractGqlError(error);
  return (
    {
      [ErrorCode.Template.DAILY_UPLOAD_TEMPLATE_LIMIT]: i18next.t(ERROR_MESSAGE_TEMPLATE.DAILY_UPLOAD_TEMPLATE_LIMIT),
    }[code] || i18next.t(ERROR_MESSAGE_UNKNOWN_ERROR)
  );
};

export default {
  getAuthErrorMessage,
  getDocumentErrorMessage,
  getNotificationErrorMessage,
  getOrgErrorMessage,
  getTemplateErrorMessage,
};
