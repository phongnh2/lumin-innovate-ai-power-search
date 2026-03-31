import * as yup from 'yup';

declare module 'yup' {
  interface StringSchema extends yup.StringSchema {
    isEmail(message?: string): StringSchema;
    notContainUrl(message?: string): StringSchema;
    notContainHtml(message?: string): StringSchema;
    notContainDangerousUriSchemes(message?: string): StringSchema;
  }
}
