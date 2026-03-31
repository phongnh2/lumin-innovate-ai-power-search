/// <reference path="./logger.d.ts" />

import { store } from 'src/redux/store';

import selectors from 'selectors';

import loggerServices from 'services/loggerServices';

import { parseErrorString } from 'helpers/warningPDFTronErrors';

import { getCommonAttributes } from 'utils/getCommonAttributes';

import { LOGGER } from 'constants/lumin-common';

const getCommonInfo = async (attributes) => {
  const state = store.getState();
  const currentDocument = selectors.getCurrentDocument(state) || '';
  const documentId = currentDocument?._id;
  const commonAttrs = await getCommonAttributes();
  return {
    documentId,
    ...commonAttrs,
    ...attributes,
  };
};

const logError = async ({ reason, message, error, attributes }) => {
  try {
    const codeLocation = {};
    switch (reason) {
      case LOGGER.Service.NETWORK_ERROR: {
        const errorResponseInfo = error?.response;
        const functionName = `Axios.axiosInstance.${error?.response?.config?.method}('${error?.response?.config?.url}...`;
        const stack = errorResponseInfo?.config?.errorContext?.stack;
        codeLocation.functionName = functionName;
        codeLocation.stack = stack;
        break;
      }
      case LOGGER.Service.GRAPHQL_ERROR: {
        break;
      }
      case LOGGER.Service.APRYSE_PDF_WORKER: {
        codeLocation.stack = error.stack;
        codeLocation.message = error.message;
        break;
      }
      default: {
        const stack = error?.stack;
        codeLocation.stack = stack;
        break;
      }
    }

    loggerServices.error({
      reason,
      message: message || parseErrorString(error)?.message || error?.message,
      attributes: await getCommonInfo(attributes),
      codeLocation,
      error,
    });
  } catch (err) {
    loggerServices.error(err);
  }
};

const logInfo = async ({ reason, message, attributes = {} }) => {
  const codeLocation = {};
  const stack = new Error()?.stack
    ?.toString()
    .split(/\r\n|\n/)
    .splice(1);
  codeLocation.stack = stack;

  delete attributes.variables;

  loggerServices.info({
    reason,
    message,
    attributes: await getCommonInfo(attributes),
    codeLocation,
  });
};

const logWarning = async ({ reason, message, attributes = {} }) => {
  const codeLocation = {};
  const stack = new Error()?.stack
    ?.toString()
    .split(/\r\n|\n/)
    .splice(1);
  codeLocation.stack = stack;

  delete attributes.variables;

  loggerServices.warn({
    reason,
    message,
    attributes: await getCommonInfo(attributes),
    codeLocation,
  });
};

// Temporary expose logError to window for sending errors from PDFWorker to Datadog.
window.__logger = new Proxy(
  {
    error: logError,
    info: logInfo,
  },
  {
    get(target, prop) {
      const value = target[prop];
      if (!(value instanceof Function)) {
        return value;
      }
      return (params) => {
        const { reason } = params;
        if (reason !== LOGGER.Service.APRYSE_PDF_WORKER) {
          return;
        }
        value(params);
      };
    },
  }
);

export default {
  logError,
  logInfo,
  logWarning,
};
