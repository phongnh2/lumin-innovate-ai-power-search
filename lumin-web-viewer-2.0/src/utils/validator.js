/* eslint-disable sonarjs/no-duplicate-string */
/// <reference path="./validator.d.ts" />

import i18next from 'i18next';
import { isEmpty } from 'lodash';
import { isEmail as isEmailValidator } from 'validator';

import { MEGABYTES_TO_BYTES } from '@new-ui/components/ToolProperties/components/MergePanel/constants';

import getCurrentRole from 'helpers/getCurrentRole';

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from 'utils/password';

import {
  FEATURE_EXPLORATION_LIMIT_PER_USER,
  FEATURE_PREMIUM_LIMIT_FOR_GUEST_MODE_FROM_FLP,
} from 'features/EnableToolFromQueryParams/constants';
import { AppFeatures, featureStoragePolicy } from 'features/FeatureConfigs';
import { TEMP_EDIT_MODE_ALLOWED_TOOLS, TEMP_EDIT_MODE_MANIPULATE_ALLOWS_TOOL } from 'features/OpenForm/constants';

import { MAX_LENGTH_DOCUMENT_NAME } from 'constants/documentConstants';
import educationMailDomains from 'constants/educationMailDomains';
import { LocalStorageKey } from 'constants/localStorageKey';
import {
  FEATURE_VALIDATION,
  DOCUMENT_ROLES,
  FEATURE_USED_ONCE_FROM_FLP_FOR_LOGIN_USER,
  TOOL_NAME_TO_ACTION,
  FEATURE_USED_ONCE_FROM_FLP_FOR_GUEST_MODE,
} from 'constants/lumin-common';
import {
  ERROR_MESSAGE_CARDHOLDER_NAME_LENGTH,
  ERROR_MESSAGE_INVALID_FIELD,
  ERROR_MESSAGE_TEAM_NAME_LENGTH,
  ERROR_MESSAGE_ORGANIZATION_NAME_LENGTH,
  ERROR_MESSAGE_NOT_CONTAIN_URL,
  ERROR_MESSAGE_DOCUMENT,
  ERROR_MESSAGE_PASSWORD_LENGTH_MIN,
  ERROR_MESSAGE_PASSWORD_LENGTH_MAX,
} from 'constants/messages';
import { EDUCATION_DOMAIN, PREFIX_EDUCATION_DOMAIN } from 'constants/organizationConstants';
import { PLAN_TYPE } from 'constants/plan';
import { PREMIUM_FEATURE_NAME, TOOLS_NAME, SYNC_TOOLS } from 'constants/toolsName';
import { MAX_NAME_LENGTH, MAX_EMAIL_LENGTH } from 'constants/userConstants';

function getValidMergeFileSize(currentDocument) {
  if (!currentDocument) {
    return 0;
  }
  return MEGABYTES_TO_BYTES * currentDocument.premiumToolsInfo.maximumMergeSize;
}

const fieldRequiredMessage = 'errorMessage.fieldRequired';

function isEmail(email) {
  const validEmailLength = email.length >= 1 && email.length < MAX_EMAIL_LENGTH;
  return validEmailLength && isEmailValidator(email);
}

function validateEmail(email) {
  const re =
    // eslint-disable-next-line no-useless-escape
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function validateEmailByDomains(email, domainList) {
  const [, domain] = email.split('@');
  return domainList.includes(domain);
}

function isEmailInWhiteList(email, whiteList) {
  return whiteList.includes(email);
}

const MAX_LOCAL_PART_EMAIL = 65;

function validateEmailWithValidAtCharacter(value) {
  return value.substring(0, value.indexOf('@')).length < MAX_LOCAL_PART_EMAIL;
}

function validateEmailLength(value) {
  return value.length >= 1 && value.length < MAX_EMAIL_LENGTH;
}

function validateNameLength(value) {
  return value.length >= 1 && value.length <= MAX_NAME_LENGTH;
}

const MAX_ORG_NAME_LENGTH = 100;

function validateOrgAndTeamNameLength(value) {
  return value.length >= 1 && value.length <= MAX_ORG_NAME_LENGTH;
}

function validatePasswordLength(value) {
  if (value.length < MIN_PASSWORD_LENGTH) {
    return i18next.t(ERROR_MESSAGE_PASSWORD_LENGTH_MIN.key, { ...ERROR_MESSAGE_PASSWORD_LENGTH_MIN.interpolation });
  }
  if (value.length > MAX_PASSWORD_LENGTH) {
    return i18next.t(ERROR_MESSAGE_PASSWORD_LENGTH_MAX.key, { ...ERROR_MESSAGE_PASSWORD_LENGTH_MAX.interpolation });
  }
  return '';
}

function validateNameUrl(value) {
  const isContainUrlRegex =
    /(((https?|ftp):\/\/[a-zA-z0-9]+)|([a-zA-Z0-9]+\.[a-zA-Z]{2,})|([0-9]{1,3}\.){3}([0-9]{1,3})\b)/g;
  return !isContainUrlRegex.test(value);
}

function validateNameHtml(value) {
  const htmlRegex = /<([a-zA-Z1-6]+)>?.*?|<(.*) \/>/;
  return !htmlRegex.test(value);
}

function validateNumber(input) {
  return input >= 0 && Number.isInteger(input);
}

function validateInputPages(input) {
  return input > 0 && Number.isInteger(input);
}

function validatePremiumPersonal(user) {
  return user.payment?.type !== 'FREE';
}

function validatePremiumOrganization(organization) {
  return organization.payment.type !== 'FREE';
}

function validatePremiumUser(currentUser, userOrgs = []) {
  const { payment: userPayment } = currentUser;
  const isPersonalPremium = userPayment?.type !== PLAN_TYPE.FREE;
  return isPersonalPremium || userOrgs?.some(({ organization }) => organization.payment.type !== PLAN_TYPE.FREE);
}

function validateFirstTimeUsedFeature(metadata = {}, toolName = '') {
  const urlParams = new URLSearchParams(window.location.search);
  const from = urlParams.get('from');
  const action = urlParams.get('action');
  const featureKey = FEATURE_USED_ONCE_FROM_FLP_FOR_LOGIN_USER[toolName];
  const featureUsedCount = metadata?.exploredFeatures?.[featureKey] || 0;
  const isFromFunctionalLandingPage = from === 'functional-landing-page';
  const isMatchAction = TOOL_NAME_TO_ACTION[toolName] === action;
  return (
    featureUsedCount < FEATURE_EXPLORATION_LIMIT_PER_USER[featureKey] && isFromFunctionalLandingPage && isMatchAction
  );
}

function validateFirstTimeUsedFeatureGuestMode(metadata = {}, toolName = '') {
  const featureKey = FEATURE_USED_ONCE_FROM_FLP_FOR_GUEST_MODE[toolName];
  const featureUsedCount = metadata?.[featureKey] || 0;
  return featureUsedCount < FEATURE_PREMIUM_LIMIT_FOR_GUEST_MODE_FROM_FLP[featureKey];
}

function validateFeature({ currentUser, currentDocument = {}, toolName = '', currentMergeSize = 0, featureName = '' }) {
  const { premiumToolsInfo = {}, mimeType, temporaryEdit } = currentDocument || {};
  const { metadata = {} } = currentUser || {};
  const currentRole = getCurrentRole(currentDocument);
  const hasUsedFeature = validateFirstTimeUsedFeature(metadata, toolName);
  const exploreFeaturesGuestModeFLP =
    JSON.parse(localStorage.getItem(LocalStorageKey.EXPLORE_FEATURES_GUEST_MODE_FLP)) || {};
  const hasUsedFeatureGuestMode = validateFirstTimeUsedFeatureGuestMode(exploreFeaturesGuestModeFLP, toolName);

  const isAllowedToolsAtTemporaryEdit =
    TEMP_EDIT_MODE_ALLOWED_TOOLS.includes(toolName) ||
    (TEMP_EDIT_MODE_MANIPULATE_ALLOWS_TOOL.includes(toolName) && hasUsedFeatureGuestMode);

  if (temporaryEdit && isAllowedToolsAtTemporaryEdit) {
    const isSetPasswordAllowedAtTemporaryEdit = featureName === AppFeatures.SET_PASSWORD && !isEmpty(currentUser);

    if (toolName === TOOLS_NAME.PASSWORD_PROTECTION && !isSetPasswordAllowedAtTemporaryEdit) {
      return FEATURE_VALIDATION.SIGNIN_REQUIRED;
    }

    return '';
  }

  if (isEmpty(currentUser)) {
    return FEATURE_VALIDATION.SIGNIN_REQUIRED;
  }

  if (hasUsedFeature) {
    return '';
  }

  if (featureName && !featureStoragePolicy.isFeatureEnabledForMimeType(featureName, mimeType)) {
    return FEATURE_VALIDATION.UNSUPPORTED_FILE_TYPE;
  }

  if ([DOCUMENT_ROLES.VIEWER, DOCUMENT_ROLES.SPECTATOR].includes(currentRole)) {
    return FEATURE_VALIDATION.PERMISSION_REQUIRED;
  }

  const upgradeToMerge =
    toolName === TOOLS_NAME.MERGE_PAGE && currentMergeSize > getValidMergeFileSize(currentDocument);

  const needsUpgradeForSyncTool =
    SYNC_TOOLS.includes(toolName) && !premiumToolsInfo?.externalSync?.[PREMIUM_FEATURE_NAME[toolName]];

  const upgradeToUseSummarization =
    toolName === TOOLS_NAME.DOCUMENT_SUMMARIZATION && !premiumToolsInfo?.documentSummarization?.enabled;

  const upgradeToUsePremiumTools =
    !SYNC_TOOLS.includes(toolName) &&
    PREMIUM_FEATURE_NAME[toolName] &&
    !premiumToolsInfo[PREMIUM_FEATURE_NAME[toolName]];
  if (upgradeToMerge || upgradeToUsePremiumTools || needsUpgradeForSyncTool || upgradeToUseSummarization) {
    return FEATURE_VALIDATION.PREMIUM_FEATURE;
  }
  return '';
}

function validateCardholderName(value) {
  const valueTrimmed = value.trim();
  if (!valueTrimmed || valueTrimmed.length === 0) {
    return i18next.t(fieldRequiredMessage);
  }

  // eslint-disable-next-line no-magic-numbers
  if (valueTrimmed.length < 2 || valueTrimmed.length > 26) {
    return i18next.t(ERROR_MESSAGE_CARDHOLDER_NAME_LENGTH);
  }

  if (!validateCardholderNameCharacter(valueTrimmed)) {
    return i18next.t(ERROR_MESSAGE_INVALID_FIELD);
  }

  return '';
}

function validateCardholderNameCharacter(value) {
  // eslint-disable-next-line no-useless-escape
  const reg = /^[a-zA-Z\.\-\'\s]+$/;
  return reg.test(value);
}

function validateTeamName(teamName) {
  if (!teamName) {
    return i18next.t(fieldRequiredMessage);
  }

  if (!validateOrgAndTeamNameLength(teamName)) {
    return i18next.t(ERROR_MESSAGE_TEAM_NAME_LENGTH.key, { ...ERROR_MESSAGE_TEAM_NAME_LENGTH.interpolation });
  }

  if (!validateNameUrl(teamName)) {
    return i18next.t(ERROR_MESSAGE_NOT_CONTAIN_URL);
  }

  if (!validateNameHtml(teamName)) {
    return i18next.t(ERROR_MESSAGE_INVALID_FIELD);
  }

  return '';
}

function validateOrgName(orgName) {
  if (!orgName) {
    return i18next.t(fieldRequiredMessage);
  }

  if (!validateOrgAndTeamNameLength(orgName)) {
    return i18next.t(ERROR_MESSAGE_ORGANIZATION_NAME_LENGTH.key, {
      ...ERROR_MESSAGE_ORGANIZATION_NAME_LENGTH.interpolation,
    });
  }

  if (!validateNameUrl(orgName)) {
    return i18next.t(ERROR_MESSAGE_NOT_CONTAIN_URL);
  }

  if (!validateNameHtml(orgName)) {
    return i18next.t(ERROR_MESSAGE_INVALID_FIELD);
  }

  return '';
}

function validateDocumentName(name) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return {
      error: i18next.t(fieldRequiredMessage),
      isValidated: false,
    };
  }
  if (trimmedName.length > MAX_LENGTH_DOCUMENT_NAME) {
    return {
      error: i18next.t(ERROR_MESSAGE_DOCUMENT.MAX_LENGTH.key, { ...ERROR_MESSAGE_DOCUMENT.MAX_LENGTH.interpolation }),
      isValidated: false,
    };
  }
  return {
    isValidated: true,
    error: null,
  };
}

function isSlashEnding(newDocumentName) {
  const replaceSpaceInDocumentName = newDocumentName.replaceAll(' ', '');
  if (replaceSpaceInDocumentName.length) {
    return replaceSpaceInDocumentName[replaceSpaceInDocumentName.length - 1] === '/';
  }
  return false;
}

function findDuplicatedContinueSlashCharacter(newDocumentName) {
  const replaceSpaceInDocumentName = newDocumentName.replaceAll(' ', '');
  return replaceSpaceInDocumentName.search('//') >= 0;
}

function hasNumberAfterDot(newDocumentName) {
  const replaceSpaceAndDotInDocumentName = newDocumentName.replaceAll(' ', '').split('.');
  if (replaceSpaceAndDotInDocumentName.length > 1) {
    return Boolean(
      replaceSpaceAndDotInDocumentName.filter((word) => word.length && !Number.isNaN(Number(word[0]))).length
    );
  }
  return false;
}

function validateDomainEducation(email) {
  const [, domain] = email.split('@');
  const splittedDomain = domain.split('.');

  return (
    [...EDUCATION_DOMAIN, ...PREFIX_EDUCATION_DOMAIN].some((_domain) => splittedDomain.includes(_domain)) ||
    educationMailDomains.some((_domain) => domain.includes(_domain))
  );
}

function validateWhitelistUrl(url) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const whitelistedUrl = isDevelopment
    ? /^(?:http?:\/\/)?(?:www\.)?(localhost|.+\.localhost)(?::\d+)?(?:\/|$|\?.*)/
    : /^(?:https:\/\/)?(?:www\.)?(?:[a-zA-Z0-9-]+\.)?luminpdf\.com(?:\/|$|\?.*)/g;
  return whitelistedUrl.test(url);
}

export default {
  validateEmail,
  validateEmailByDomains,
  isEmailInWhiteList,
  validatePremiumUser,
  validateFirstTimeUsedFeature,
  validateFirstTimeUsedFeatureGuestMode,
  validateNumber,
  validateNameUrl,
  validateInputPages,
  validateFeature,
  validateEmailLength,
  validateNameLength,
  validateEmailWithValidAtCharacter,
  validateCardholderName,
  validateCardholderNameCharacter,
  validateTeamName,
  validateOrgAndTeamNameLength,
  validateOrgName,
  validatePremiumOrganization,
  validatePremiumPersonal,
  isEmail,
  validateDocumentName,
  validatePasswordLength,
  validateNameHtml,
  isSlashEnding,
  findDuplicatedContinueSlashCharacter,
  hasNumberAfterDot,
  validateDomainEducation,
  getValidMergeFileSize,
  validateWhitelistUrl,
};
