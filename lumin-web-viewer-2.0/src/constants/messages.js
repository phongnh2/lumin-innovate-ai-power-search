/* eslint-disable max-len */
import i18next from 'i18next';
import React from 'react';
import { Trans } from 'react-i18next';

import avatarUtils from 'utils/avatar';

import { avatarSizeLimit } from 'constants/customConstant';
import { MAX_LENGTH_DOCUMENT_NAME } from 'constants/documentConstants';
import { MAX_LENGTH_TEMPLATE_DESCRIPTION, MAX_LENGTH_TEMPLATE_NAME, MAX_SIZE_UPLOAD_TEMPLATE } from 'constants/templateConstant';
import { MAX_NAME_LENGTH as MAX_PERSONAL_NAME_LENGTH, MAX_EMAIL_LENGTH } from 'constants/userConstants';

const getMaxLengthMessage = (length) => ({ key: 'errorMessage.maxLengthMessage', interpolation: { length } });
const getMinLengthMessage = (length) => ({ key: 'errorMessage.minLengthMessage', interpolation: { length } });

export const getSignInFailedAttemptError = (times) => i18next.t('errorMessage.signInFailedAttemptError', { times });
export const getBlockedAccountError = (remainingMinutes) => i18next.t('errorMessage.blockedAccountError', { remainingMinutes });
export const getUploadOverFileSizeError = (size) => i18next.t('errorMessage.uploadOverFileSizeError', { size });
export const getErrorMessageMaxFieldLength = (length) => i18next.t('errorMessage.errorMessageMaxFieldLength', { length });
export const getAvatarUploadSizeError = (size) => i18next.t('errorMessage.avatarUploadSizeError', { size: avatarUtils.getAvatarFileSizeLimit(size) });
export const getAssociateDomainNotExistMemberError = (type) => i18next.t('errorMessage.associateDomainNotExistMemberError', { type });
export const getAssociateDomainPopularDomain = (type) => i18next.t('errorMessage.associateDomainPopularDomain', { type });
export const getErrorMessageInNameFieldByService = (service) => i18next.t('errorMessage.errorMessageInNameFieldByService', { service });

export const ERROR_MESSAGE_TNC = 'errorMessage.tnc';
export const ERROR_MESSAGE_FIELD_NON_WHITESPACE = 'errorMessage.fieldNonWhitespace';
export const ERROR_MESSAGE_NAME_LENGTH = getMaxLengthMessage(30);
export const ERROR_MESSAGE_EMAIL_LENGTH = getMaxLengthMessage(MAX_EMAIL_LENGTH);
export const ERROR_MESSAGE_EMAIL_EXISTED = 'errorMessage.emailExisted';
export const ERROR_MESSAGE_INVALID_FIELD = 'errorMessage.invalidField';
export const ERROR_MESSAGE_FIELD_REQUIRED = 'errorMessage.fieldRequired';
export const ERROR_MESSAGE_ALL_FIELDS_REQUIRED = 'errorMessage.allFieldsRequired';
export const ERROR_MESSAGE_PASSWORD_DO_NOT_MATCH = 'errorMessage.passwordDoNotMatch';
export const ERROR_MESSAGE_INVALID_TOKEN = 'errorMessage.invalidToken';
export const ERROR_MESSAGE_EXPIRED_TOKEN = 'errorMessage.expiredToken';
export const ERROR_MESSAGE_PASSWORD_LENGTH_MAX = getMaxLengthMessage(100);
export const ERROR_MESSAGE_PASSWORD_LENGTH_MIN = getMinLengthMessage(8);
export const ERROR_MESSAGE_PASSWORD_STRENGTH = (
  <Trans i18nKey="errorMessage.passwordStrength">
    Make sure your password matches at least 3 requirements (<strong>8 letters</strong> is required).
  </Trans>
);
export const ERROR_MESSAGE_PERSONAL_NAME_LENGTH = getMaxLengthMessage(MAX_PERSONAL_NAME_LENGTH);
export const ERROR_MESSAGE_TEAM_NAME_LENGTH = getMaxLengthMessage(100);
export const ERROR_MESSAGE_DOCUMENT_NAME_LENGTH = getMaxLengthMessage(255);
export const ERROR_MESSAGE_WRONG_CURRENT_PASSWORD = 'errorMessage.wrongCurrentPassword';
export const ERROR_MESSAGE_NEW_PASSWORD_IS_THE_SAME = 'errorMessage.newPasswordIsTheSame';
export const ERROR_MESSAGE_WRONG_PASSWORD = 'errorMessage.wrongPassword';
export const ERROR_MESSAGE_CAN_NOT_USE_FREE_TRIAL = 'errorMessage.canNotUseFreeTrial';
export const ERROR_MESSAGE_PAYMENT_CONTACT_SUPPORT = 'errorMessage.paymentContactSupport';
export const ERROR_MESSAGE_CARDHOLDER_NAME_LENGTH = 'errorMessage.cardholderNameLength';
export const ERROR_MESSAGE_ORGANIZATION_NAME_LENGTH = getMaxLengthMessage(100);
export const ERROR_MESSAGE_NO_PERMISSION = 'errorMessage.noPermission';
export const ERROR_MESSAGE_UNKNOWN_ERROR = 'errorMessage.unknownError';
export const ERROR_MESSAGE_CONTACT_SUPPORT = 'errorMessage.contactSupport';
export const ERROR_MESSAGE_NOT_FOUND = 'errorMessage.notFound';
export const ERROR_MESSAGE_NOT_CONTAIN_URL = 'errorMessage.notContainUrl';
export const ERROR_MESSAGE_NOT_VERIFY_ACCOUNT = 'errorMessage.notVerifyAccount';
export const ERROR_MESSAGE_LIMIT_REQUESTS = 'errorMessage.limitRequests';
export const ERROR_MESSAGE_NOT_BELONG_TO_ORG = { key: 'errorMessage.notBelongToOrg' };
export const ERROR_MESSAGE_LIMIT_RESEND_EMAIL_FORGOT_PASSWORD = 'errorMessage.limitResendEmailForgotPassword';
export const ERROR_MESSAGE_AVATAR_OVERSIZE = { key: 'errorMessage.avatarOversize', interpolation: { avatarSizeLimit: avatarUtils.getAvatarFileSizeLimit(avatarSizeLimit) } };
export const ERROR_MESSAGE_BANNED_EMAIL = 'errorMessage.bannedEmail';
export const ERROR_MESSAGE_ALREADY_SIGNUP_BY_THIRD_PARTY = 'errorMessage.alreadySignupByThirdParty';
export const ERROR_MESSAGE_RESEND_VERIFIED_FAILED = 'errorMessage.resendVerifiedFailed';
export const ERROR_MESSAGE_REQUEST_ALREADY_SENT = 'errorMessage.requestAlreadySent';
export const ERROR_MESSAGE_DUPLICATE_RECENT_PASSWORD = 'errorMessage.duplicateRecentPassword';
export const ERROR_MESSAGE_RESET_PASSWORD_FAIL = 'errorMessage.resetPasswordFail';
export const ERROR_MESSAGE_RESET_PASSWORD_INVALID_LINK = 'errorMessage.resetPasswordInvalidLink';
export const ERROR_MESSAGE_SIGNOUT_FAILED = 'errorMessage.signoutFailed';
export const ERROR_MESSAGE_ALREADY_VERIFY_USER = 'errorMessage.alreadyVerifyUser';
export const ERROR_MESSAGE_REQUIRE_STRONG_PASSWORD = 'errorMessage.requireStrongPassword';
export const ERROR_MESSAGE_INVALID_PAGE = 'errorMessage.invalidPage';
export const ERROR_MESSAGE_DOMAIN_LENGTH = getMaxLengthMessage(255);
export const ERROR_MESSAGE_LOCATION_CURRENCY = 'errorMessage.locationCurrency';
export const ERROR_MESSAGE_RESTRICTED_ACTION = 'An Admin of your Workspace has disabled this feature.';

export const ERROR_MESSAGE_DOCUMENT = {
  NOT_FOUND: 'errorMessage.documentNotFound',
  CREATE_FAILED: 'errorMessage.documentCreateFailed',
  REQUESTER_DOCUMENT_NOT_FOUND: 'errorMessage.documentRequesterDocumentNotFound',
  REQUESTER_DOCUMENT_HAS_BEEN_ADDED: 'errorMessage.documentRequesterDocumentHasBeenAdded',
  NO_DOCUMENT_PERMISSION: 'errorMessage.documentNoDocumentPermission',
  REQUEST_ACCESS_DOCUMENT_NOT_FOUND: 'errorMessage.documentRequestAccessDocumentNotFound',
  DOCUMENT_NOT_FOUND: 'errorMessage.documentNotFound',
  DAILY_UPLOAD_LIMIT: 'errorMessage.documentDailyUploadLimit',
  MAX_LENGTH: getMaxLengthMessage(MAX_LENGTH_DOCUMENT_NAME),
  UPLOAD_FILE: 'errorMessage.documentUploadFile',
  MOVE_DOCUMENT_FAILED: 'errorMessage.documentMoveDocumentFailed',
  ORG_REACHED_DOC_STACK_LIMIT: 'errorMessage.orgReachedDocStackLimit',
  TOO_MANY_REQUESTS: 'errorMessage.documentUploadRateLimit',
};

export const SUCCESS_MESSAGE = {
  APPROVE_REQUESTS: 'successMessage.approveRequests',
  APPROVE_REQUEST: 'successMessage.approveRequest',
  REJECT_REQUESTS: 'successMessage.rejectRequests',
  REJECT_REQUEST: 'successMessage.rejectRequest',
};

export const ERROR_MESSAGE_NOTIFICATION = {
  READ_NOTIFICATION_FAIL: 'errorMessage.readNotificationFail',
  READ_ALL_NOTIFICATIONS_FAIL: 'errorMessage.readAllNotificationsFail',
};

export const ERROR_MESSAGE_ORG = {
  USER_NOT_IN_ORGANIZATION: 'errorMessage.userNotInOrganization',
  INVALID_ASSOCIATE_DOMAIN_USE_BY_ANOTHER_CIRCLE: 'errorMessage.invalidAssociateDomainUseByAnotherOrg',
  DOMAIN_ALREADY_ADDED: 'errorMessage.domainAlreadyAdded',
  ACTION_BLOCKED_BY_SCIM: 'scimProvision.actionBlockedByScimMessage',
};

export const WARNING_MESSAGE_CAN_NOT_INVITE_MEMBER = 'errorMessage.warningMessageCanNotInviteMember';

export const MESSAGE_CREATE_SOURCE_FAILED = 'errorMessage.messageCreateSourceFailed';
export const MESSAGE_PURCHASE_FREE_TRIAL_FAILED = 'errorMessage.messagePurchaseFreeTrialFailed';
export const ERROR_MESSAGE_CANNOT_CREATE_ANOTHER_SUBSCRIPTION = 'errorMessage.errorMessageCannotCreateAnotherSubscription';
export const ERROR_MESSAGE_CHECK_CVC_FAILED = { key: 'errorMessage.errorMessageCheckCvcFailed', interpolation: { plan: 'business' } };

export const ERROR_MESSAGE_PDFTRON = {
  UNSUPPORTED_COPY_TEXT: 'errorMessage.unsupportedCopyText',
  UNSUPPORTED_FIT_MODE: 'errorMessage.unsupportedFitMode',
  INVALID_SET_ZOOM: 'errorMessage.invalidSetZoom',
  UNACCESS_LOCALSTORAGE: 'errorMessage.unaccessLocalstorage',
  ENABLE_REDACTION: 'errorMessage.enableRedaction',
  FIND_WEBVIEWER_INSTANCE: 'errorMessage.findWebviewerInstance',
  RETRIEVE_DATA_WEBVIEWER_INSTANCE: 'errorMessage.retrieveDataWebviewerInstance',
  DEPRECATED_SET_SORT_NOTES_BY: 'errorMessage.deprecatedSetSortNotesBy',
};

export const CAN_NOT_DELETE_ONLY_PAGE = 'errorMessage.canNotDeleteOnlyPage';
export const KEEP_AT_LEAST_ONE_PAGE = 'errorMessage.keepAtLeastOnePage';

export const PAGES_TOOL_ERROR_MESSAGE = {
  GENERAL_INVALID: 'errorMessage.generalInvalid',
  INVALID_PAGE_POSITION: 'errorMessage.invalidPagePosition',
  MAKE_SURE_ABOVE_FORMAT: 'errorMessage.makeSureAboveFormat',
  GREATER_THAN_TOTAL_PAGE: 'errorMessage.greaterThanTotalPage',
};

export const ERROR_MESSAGE_TEMPLATE = {
  TEMPLATE_NAME_LENGTH: getMaxLengthMessage(MAX_LENGTH_TEMPLATE_NAME),
  TEMPLATE_DESCRIPTION_LENGTH: getMaxLengthMessage(MAX_LENGTH_TEMPLATE_DESCRIPTION),
  DAILY_UPLOAD_TEMPLATE_LIMIT: 'errorMessage.dailyUploadTemplateLimit',
  OVER_TEMPLATE_FILE_SIZE: getUploadOverFileSizeError(MAX_SIZE_UPLOAD_TEMPLATE),
  TEMPLATE_UNSUPPORT_TYPE: 'errorMessage.templateUnsupportType',
  TEMPLATE_NOT_FOUND: 'errorMessage.templateNotFound',
};

export const MESSAGE_CANCEL_PAYMENT_INDIVIDUAL = 'errorMessage.messageCancelPaymentIndividual';
export const MESSAGE_CANCEL_PAYMENT_ORGANIZATION = 'errorMessage.messageCancelPaymentOrganization';
export const MESSAGE_REACTIVATED_PAYMENT = 'errorMessage.messageReactivatedPayment';
export const MESSAGE_MIGRATE_TEAM_PAYMENT = 'errorMessage.messageMigrateTeamPayment';
export const MESSAGE_ORG_DOMAIN_EXISTED = 'errorMessage.messageOrgDomainExisted';
export const MESSAGE_INELIGIBLE_TO_CREATE_MAIN_ORG = 'errorMessage.messageIneligibleToCreateMainOrg';
export const RELOAD_MESSAGE = 'errorMessage.reloadMessage';

export const DEVICE_FILE_ERROR_MAPPING = {
  'A requested file or directory could not be found at the time an operation was processed.': 'This file cannot be uploaded because is removed or deleted.',
  default: 'This file cannot be uploaded because is removed or deleted.'
};

export const MESSAGE_OVER_FILE_SIZE = 'Over file size';

export const ERROR_TIMEOUT_MESSAGE = {
  REQUEST_TIMEOUT: 'errorMessage.requestTimeout',
  CHECK_CONNECTION: 'errorMessage.checkConnection',
};

export const ERROR_MESSAGE_TYPE = {
  CANCEL_UPLOAD: 'cancel_upload',
  PDF_UNSUPPORT_TYPE: 'unsupport_pdf_type',
  PDF_NOT_FOUND: 'pdf_not_found',
  PDF_SIZE: 'fileSize',
  PDF_PASSWORD: 'This document requires a password',
  PDF_CANCEL_PASSWORD: 'Cancel enter password',
  DAILY_DOCUMENT_UPLOAD: 'daily_limit_upload',
  TOO_MANY_REQUESTS: 'too_many_requests',
  REACH_DOCUMENT_STACK: 'reach_document_stack',
  RESTRICTED_ACTION: 'restricted_action_by_domain',
  STRICTED_DOWNLOAD_PERMISSION: 'stricted_download_permission',
  DEFAULT: 'default',
  DOCUMENT_TEMPLATE_QUOTA_EXCEEDED: 'document_template_quota_exceeded',
};
