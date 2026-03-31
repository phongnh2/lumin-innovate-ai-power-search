/// <reference path="./convertToOfficeFile.d.ts" />
import { v4 } from 'uuid';

import selectors from 'selectors';

import { documentServices } from 'services';
import convertDocumentSocketService from 'services/socket/convertDocumentSocketServices';

import logger from 'helpers/logger';

import { extensions } from 'constants/documentType';
import { ConversionError } from 'constants/errorCode';
import { LOGGER } from 'constants/lumin-common';

import { store } from '../redux/store';

const timeoutDuration = parseInt(process.env.MAXIMUM_CONVERT_DOCX_TIME);
class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = ConversionError.TIMEOUT_ERROR;
  }
}

const convertToOfficeFile = async (convertType = extensions.DOCX) => {
  try {
    const currentDocument = selectors.getCurrentDocument(store.getState());
    const key = v4();
    convertDocumentSocketService.convertToOfficeFile().emitter({
      fileName: key,
    });
    await documentServices.uploadTemporaryDocument(currentDocument, key, convertType);
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new TimeoutError('Conversion timed out'));
      }, timeoutDuration);

      convertDocumentSocketService.convertToOfficeFile().listener(key, async ({ preSignedUrl, errorMessage }) => {
        clearTimeout(timeoutId);

        if (errorMessage) {
          reject(new Error(errorMessage));
        }

        try {
          const response = await fetch(preSignedUrl);
          const buffer = await response.arrayBuffer();
          resolve(buffer);
        } catch (fetchError) {
          reject(fetchError);
        } finally {
          convertDocumentSocketService.convertToOfficeFile().clean();
        }
      });
    });
  } catch (error) {
    logger.logError({
      reason: LOGGER.Service.CONVERT_DOCUMENT_TO_OFFICE_FILE_ERROR,
      error,
    });
  }
};

export default convertToOfficeFile;
