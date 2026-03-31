import type { TFunctionKeys } from 'i18next';
import i18next from 'i18next';
import { isObject, isString } from 'lodash';

const getErrorMessageTranslated = (error: string | Record<string, TFunctionKeys[]>) => {
  if (!error) {
    return null;
  }

  if (isObject(error) && error.key && error.interpolation) {
    return i18next.t(error.key, { ...error.interpolation });
  }

  if (isString(error)) {
    return i18next.t(error);
  }

  return String(error);
};

export default getErrorMessageTranslated;
