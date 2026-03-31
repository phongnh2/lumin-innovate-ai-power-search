import { stringify, parse } from 'flatted';
import { omitBy, isNil } from 'lodash';

import logger from 'helpers/logger';

const sensitivePatterns: Record<string, RegExp> = {
  email: /^(?:user)?(?:email|mail)(?:address|addr)?$/i,

  personal: /^(?:ssn|social|tax|passport|driver|license|phone|mobile|tel|address|zip|postal|dob|birth)/i,

  auth: /^(?:password|secret|token|key|credential|auth)(?:hash|encrypted|token)?$/i,

  session: /^(?:cookie)(?:id|token|key)?$/i,

  apiKey: /^(?:api|service)(?:key|token|secret)$/i,

  'authorization-v2': /^authorization/i,
};

const isSensitiveField = (fieldName: string): boolean =>
  Object.values(sensitivePatterns).some((pattern) => pattern.test(fieldName));

const handleCircularReferences = (data: unknown): unknown => {
  try {
    return parse(stringify(data));
  } catch (error) {
    return { message: 'Data filtered due to circular reference complexity' };
  }
};

function filterSensitiveDataRecursive(data: unknown, depth = 0): unknown {
  if (depth > 10) {
    return data;
  }

  if (isNil(data)) {
    return data;
  }

  const processedData = handleCircularReferences(data);

  if (Array.isArray(processedData)) {
    return processedData.map((item) => filterSensitiveDataRecursive(item, depth + 1));
  }

  if (typeof processedData === 'object') {
    const filtered: Record<string, unknown> = {};
    Object.keys(processedData as Record<string, unknown>).forEach((key) => {
      if (!isSensitiveField(key)) {
        filtered[key] = filterSensitiveDataRecursive((processedData as Record<string, unknown>)[key], depth + 1);
      }
    });
    return filtered;
  }

  return processedData;
}

export const filterSensitiveData = (message: unknown): unknown => {
  try {
    return filterSensitiveDataRecursive(message);
  } catch (error) {
    logger.logError({
      reason: 'FAILED_TO_FILTER_SENSITIVE_DATA',
      message: (error as Error)?.message || 'Failed to filter sensitive data',
      error: error as Error,
    });
    return { message: 'Log data filtered due to processing error' };
  }
};

export const filterSensitiveAttributes = (attributes: unknown): unknown => {
  if (!attributes || typeof attributes !== 'object') {
    return attributes;
  }

  return omitBy(attributes as Record<string, unknown>, (value, key) => isNil(value) || isSensitiveField(key));
};

export const addSensitivePattern = (name: string, pattern: RegExp): void => {
  sensitivePatterns[name] = pattern;
};

export default {
  filterSensitiveData,
  filterSensitiveAttributes,
  isSensitiveField,
  addSensitivePattern,
};
