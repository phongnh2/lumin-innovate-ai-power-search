import { isEmail, isFQDN } from 'validator';
import * as Yup from 'yup';

import {
  MAX_PASSWORD_LENGTH,
  PASSWORD_STRENGTH,
  validatePassword,
  MIN_OLD_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from 'utils/password';
import { WHITE_SPACE_REGEX } from 'utils/regex';
import validators from 'utils/validator';

import { MAX_LENGTH_DOCUMENT_NAME } from 'constants/documentConstants';
import {
  ERROR_MESSAGE_INVALID_FIELD,
  ERROR_MESSAGE_PASSWORD_STRENGTH,
  ERROR_MESSAGE_EMAIL_LENGTH,
  ERROR_MESSAGE_PASSWORD_LENGTH_MAX,
  ERROR_MESSAGE_FIELD_NON_WHITESPACE,
  ERROR_MESSAGE_PERSONAL_NAME_LENGTH,
  ERROR_MESSAGE_PASSWORD_LENGTH_MIN,
  ERROR_MESSAGE_DOMAIN_LENGTH,
  ERROR_MESSAGE_ORGANIZATION_NAME_LENGTH,
  ERROR_MESSAGE_NOT_CONTAIN_URL,
  ERROR_MESSAGE_DOCUMENT_NAME_LENGTH,
} from 'constants/messages';
import { MAX_DOMAIN_LENGTH, MAX_ORGANIZATION_NAME_LENGTH } from 'constants/organizationConstants';
import { MAX_EMAIL_LENGTH, MAX_NAME_LENGTH } from 'constants/userConstants';

Yup.addMethod(Yup.string, 'preventSpaces', function (message) {
  return this.test('preventSpaces', message, function (value) {
    const { path, createError } = this;
    const hasSpace = /^\s+$/.test(value);
    if (!value || hasSpace) {
      return createError({
        path,
        message: message as string,
      });
    }
    return true;
  });
});

Yup.addMethod(Yup.string, 'passwordStrength', function (level = PASSWORD_STRENGTH.MEDIUM, message = '') {
  return this.test('passwordStrength', message, function (password) {
    const { path, createError } = this;
    const trimmedPassword = password.trim();
    const isValid = validatePassword(trimmedPassword, level);
    if (!isValid) {
      return createError({
        path,
        message: (message || ERROR_MESSAGE_PASSWORD_STRENGTH) as string,
      });
    }
    return true;
  });
});

Yup.addMethod<Yup.StringSchema>(Yup.string, 'isEmail', function (message = '') {
  return this.test('isEmail', message, function (email = '') {
    const { path, createError } = this;
    const isValid = isEmail(email) || !email;

    if (!isValid) {
      return createError({
        path,
        message: (message || ERROR_MESSAGE_INVALID_FIELD) as string,
      });
    }

    return true;
  });
});

Yup.addMethod(Yup.string, 'isFQDN', function (message = '') {
  return this.test('isFQDN', message, function (domain = '') {
    const { path, createError } = this;
    const isValid = isFQDN(domain) || !domain;

    if (!isValid) {
      return createError({
        path,
        message: (message || ERROR_MESSAGE_INVALID_FIELD) as string,
      });
    }

    return true;
  });
});

Yup.addMethod(Yup.string, 'notContainUrl', function (message = '') {
  return this.test('notContainUrl', message, function (value = '') {
    const { path, createError } = this;
    const isValid = validators.validateNameUrl(value);
    if (!isValid) {
      return createError({
        path,
        message: (message || ERROR_MESSAGE_INVALID_FIELD) as string,
      });
    }
    return true;
  });
});

Yup.addMethod(Yup.string, 'notContainHtml', function (message = '') {
  return this.test('notContainHtml', message, function (value = '') {
    const { path, createError } = this;
    const isValid = validators.validateNameHtml(value);
    if (!isValid) {
      return createError({
        path,
        message: (message || ERROR_MESSAGE_INVALID_FIELD) as string,
      });
    }
    return true;
  });
});

export const yupValidator = () => {
  const fieldRequiredMessage = 'errorMessage.fieldRequired';

  return {
    email: Yup.string().trim().isEmail().max(MAX_EMAIL_LENGTH, ERROR_MESSAGE_EMAIL_LENGTH),
    emailRequired: Yup.string()
      .trim()
      .isEmail()
      .max(MAX_EMAIL_LENGTH, ERROR_MESSAGE_EMAIL_LENGTH)
      // eslint-disable-next-line sonarjs/no-duplicate-string
      .required(fieldRequiredMessage),
    passwordWithStrength: Yup.string()
      .trim()
      .required(fieldRequiredMessage)
      .min(MIN_PASSWORD_LENGTH, ERROR_MESSAGE_PASSWORD_LENGTH_MIN)
      .max(MAX_PASSWORD_LENGTH, ERROR_MESSAGE_PASSWORD_LENGTH_MAX)
      .matches(WHITE_SPACE_REGEX, ERROR_MESSAGE_FIELD_NON_WHITESPACE)
      .passwordStrength(),
    password: Yup.string()
      .trim()
      .required(fieldRequiredMessage)
      .max(MAX_PASSWORD_LENGTH, ERROR_MESSAGE_PASSWORD_LENGTH_MAX)
      .min(MIN_OLD_PASSWORD_LENGTH, ''),

    name: Yup.string().trim().max(MAX_NAME_LENGTH, ERROR_MESSAGE_PERSONAL_NAME_LENGTH),
    userName: Yup.string()
      .trim()
      .max(MAX_NAME_LENGTH, ERROR_MESSAGE_PERSONAL_NAME_LENGTH)
      .required(fieldRequiredMessage)
      .notContainUrl(ERROR_MESSAGE_NOT_CONTAIN_URL)
      .notContainHtml(ERROR_MESSAGE_INVALID_FIELD),
    domainRequired: Yup.string()
      .trim()
      .max(MAX_DOMAIN_LENGTH, ERROR_MESSAGE_DOMAIN_LENGTH)
      .isFQDN()
      .required(fieldRequiredMessage),
    organizationName: Yup.string()
      .trim()
      .required(fieldRequiredMessage)
      .max(MAX_ORGANIZATION_NAME_LENGTH, ERROR_MESSAGE_ORGANIZATION_NAME_LENGTH)
      .notContainUrl(ERROR_MESSAGE_NOT_CONTAIN_URL)
      .notContainHtml(ERROR_MESSAGE_INVALID_FIELD),
    storageNameValidate: Yup.string()
      .trim()
      .max(MAX_LENGTH_DOCUMENT_NAME, ERROR_MESSAGE_DOCUMENT_NAME_LENGTH)
      .required(fieldRequiredMessage),
  };
};

declare module 'yup' {
  interface StringSchema {
    preventSpaces(message: string): StringSchema;
    passwordStrength(level?: number, message?: string): StringSchema;
    isEmail(message?: string): StringSchema;
    isFQDN(message?: string): StringSchema;
    notContainUrl(message?: string): StringSchema;
    notContainHtml(message?: string): StringSchema;
  }
}

export default Yup;
