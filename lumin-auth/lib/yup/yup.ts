import isEmail from 'validator/lib/isEmail';
import * as yup from 'yup';

import { ValidatorMessage } from '@/constants/validator-message';
import { ValidatorRule } from '@/constants/validator-rule';
import validatorUtils from '@/utils/validator.utils';

import './index.d';

yup.addMethod<yup.Schema>(yup.string, 'isEmail', function (message = '') {
  return this.test('isEmail', message, function (email = '' as never) {
    const { path, createError } = this;
    const isValid = isEmail(email) || !email;

    if (!isValid) {
      return createError({
        path,
        message: message || ValidatorMessage.Common.InvalidField
      });
    }

    return true;
  });
});

yup.addMethod<yup.Schema>(yup.string, 'notContainUrl', function (message = '') {
  return this.test('notContainUrl', message, function (value = '') {
    const { path, createError } = this;
    const isValid = validatorUtils.validateNameUrl(value);
    if (!isValid) {
      return createError({
        path,
        message: message || ValidatorMessage.Common.InvalidField
      });
    }
    return true;
  });
});

yup.addMethod<yup.Schema>(yup.string, 'notContainHtml', function (message = '') {
  return this.test('notContainHtml', message, function (value = '') {
    const { path, createError } = this;
    const isValid = validatorUtils.validateNameHtml(value);
    if (!isValid) {
      return createError({
        path,
        message: message || ValidatorMessage.Common.InvalidField
      });
    }
    return true;
  });
});

yup.addMethod<yup.Schema>(yup.string, 'notContainDangerousUriSchemes', function (message = '') {
  return this.test('notContainDangerousUriSchemes', message, function (value = '') {
    const { path, createError } = this;
    const isValid = validatorUtils.validateDangerousUriSchemes(value);
    if (!isValid) {
      return createError({
        path,
        message: message || ValidatorMessage.Common.InvalidField
      });
    }
    return true;
  });
});

const yupValidator = {
  email: yup
    .string()
    .trim()
    .isEmail()
    .max(ValidatorRule.Email.MaxLength, ValidatorMessage.Email.MaxLength)
    // eslint-disable-next-line sonarjs/no-duplicate-string
    .required(ValidatorMessage.Common.FieldRequired),
  password: yup
    .string()
    .trim()
    .required(ValidatorMessage.Common.FieldRequired)
    .min(ValidatorRule.Password.MinLength, ValidatorMessage.Password.MinLength)
    .max(ValidatorRule.Password.MaxLength, ValidatorMessage.Password.MaxLength),
  username: yup
    .string()
    .trim()
    .max(ValidatorRule.Username.MaxLength, ValidatorMessage.Username.MaxLength)
    .notContainUrl(ValidatorMessage.Username.NotContainUrl)
    .notContainHtml(ValidatorMessage.Common.InvalidField)
    .notContainDangerousUriSchemes()
    .required(ValidatorMessage.Common.FieldRequired),
  terms: yup.bool().oneOf([true], ValidatorMessage.Terms.Required),
  reCaptcha: yup.string().required(ValidatorMessage.Common.FieldRequired)
};

export { yup, yupValidator };
