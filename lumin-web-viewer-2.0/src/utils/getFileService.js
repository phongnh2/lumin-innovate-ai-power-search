/* eslint-disable import/no-named-as-default-member */
import Axios from '@libs/axios';

import core from 'core';

import dropboxServices from 'services/dropboxServices';
import electronDropboxServices from 'services/electronDropboxServices';
import googleServices from 'services/googleServices';
import { oneDriveServices } from 'services/oneDriveServices';

import { isIE } from 'helpers/device';
import exportAnnotations from 'helpers/exportAnnotations';
import logger from 'helpers/logger';

import { isElectron } from 'utils/corePathHelper';
import dropboxError from 'utils/dropboxError';
import { executeWithCancellation } from 'utils/executeWithCancellation';
import { fileUtils } from 'utils/file';
import mime from 'utils/mime-types';
import pdfNetQueue from 'utils/pdfNetQueue';

import { OutlineCoreUtils } from 'features/Outline/utils/outlineCore.utils';

import { general } from 'constants/documentType';
import { LOGGER, STATUS_CODE, STORAGE_TYPE, OPERATION_CANCELED_MESSAGE } from 'constants/lumin-common';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';
import { AXIOS_BASEURL, DROPBOX_AUTHORIZE_DOWNLOAD_API } from 'constants/urls';

import getFileService from './getFileService';

export async function getFileData(options) {
  options.flags = options.flags || window.Core.SaveOptions.INCREMENTAL;
  const doc = core.getDocument();
  try {
    const fileData = await doc.getFileData({ ...options });
    return new Uint8Array(fileData);
  } catch (err) {
    if (err.type === 'PDFWorkerError') {
      return handlePDFWorkerError(doc, options);
    }
    throw err;
  }
}

async function handlePDFWorkerError(doc, options) {
  // Try to update document appearance of PDFDoc to make it call fdfUpdate success.
  await doc.getFileData({ flags: window.Core.SaveOptions.INCREMENTAL });
  const data = await doc.getFileData({ ...options });
  return new Uint8Array(data);
}

/**
 * Removes JavaScript elements from a PDF document
 * @param {object} pdfDoc - The PDF document object
 */
export const removeJavaScriptFromPdf = async (pdfDoc) => {
  const root = await pdfDoc.getRoot();
  if (root) {
    await root.eraseFromKey('OpenAction');
    const names = await root.findObj('Names');
    if (names) {
      await names.eraseFromKey('JavaScript');
    }
  }
};

async function handleSecurityHandler(pdfDoc, securityHandler, password) {
  const newHandler = await window.Core.PDFNet.SecurityHandler.createDefault();

  if (password) {
    await newHandler.changeUserPasswordUString(password);
  }

  const permissionValues = Object.values(window.Core.PDFNet.SecurityHandler.Permission);

  await Promise.all(
    permissionValues.map(async (permValue) => {
      try {
        const hasPermission = await securityHandler.getPermission(permValue);
        await newHandler.setPermission(permValue, hasPermission);
      } catch (e) {
        logger.logError({
          error: e,
          reason: LOGGER.Service.SECURITY_HANDLER,
        });
      }
    })
  );

  await pdfDoc.setSecurityHandler(newHandler);
}

async function processGetFileDataByPDFNet({
  xfdf,
  shouldRemoveJavaScript = false,
  shouldRemoveSecurity = false,
  flattenPdf = false,
}) {
  const password = sessionStorage.getItem(SESSION_STORAGE_KEY.PDF_PASSWORD);
  let securityHandler = null;
  let currentPdfDoc = null;
  try {
    const docInstance = await core.getDocument();
    currentPdfDoc = await docInstance.getPDFDoc();
    currentPdfDoc.lock();
    /*
      Need to export file with incremental flag to remain old appearance reference
      If PDFDoc is repaired, we need to prevent incremental save
    */
    const repaired = await currentPdfDoc.hasRepairedXRef();
    const saveFlags = repaired
      ? window.Core.PDFNet.SDFDoc.SaveOptions.e_remove_unused
      : window.Core.PDFNet.SDFDoc.SaveOptions.e_linearized;
    const rawDocument = await docInstance.getFileData({ flags: saveFlags });
    if (password) {
      securityHandler = await currentPdfDoc.getSecurityHandler();
    }
    return new Promise((resolve, reject) => {
      core
        .runWithCleanup(async () => {
          const pdfDoc = await core.createPDFDocFromBuffer(rawDocument);
          const fdfDoc = await core.createFdfDocFromXfdf(xfdf);
          const emptyfdfDoc = await core.createFdfDocFromXfdf(window.Core.EMPTY_XFDF);
          if (securityHandler) {
            pdfDoc.initStdSecurityHandler(password);
            pdfDoc.removeSecurity();
          }
          await pdfDoc.fdfUpdate(emptyfdfDoc);
          await pdfDoc.fdfUpdate(fdfDoc);
          /*
            Some PDF viewers (like Chrome) cannot display annotations that don't already have an appearance,
            so it is often desirable to call this method after calling fdfUdpate to ensure these annotations
            can still be displayed in those applications.
          */
          const refreshAnnotOptions = new window.Core.PDFNet.PDFDoc.RefreshOptions();
          refreshAnnotOptions.setUseNonStandardRotation(true);
          await pdfDoc.refreshAnnotAppearances(refreshAnnotOptions);
          await pdfDoc.refreshFieldAppearances();

          if (flattenPdf) {
            const annotManager = core.getAnnotationManager();
            const annotations = annotManager.getAnnotationsList();
            const widgetAnnotations = annotations.filter(
              (annot) => annot instanceof window.Core.Annotations.WidgetAnnotation && annot.StrokeThickness === 0
            );
            /*
              When flattening a PDF, widget annotations with StrokeThickness = 0 still show borders
              This code explicitly sets the StrokeColor to transparent (rgba 0,0,0,0) for such annotations
              before flattening to ensure borders don't appear in the flattened output
            */
            if (widgetAnnotations.length > 0) {
              widgetAnnotations.forEach((annot) => {
                annot.StrokeColor = new window.Core.Annotations.Color(0, 0, 0, 0);
              });
              const updatedXfdf = await exportAnnotations();
              const updatedFdfDoc = await core.createFdfDocFromXfdf(updatedXfdf);
              await pdfDoc.fdfUpdate(updatedFdfDoc);
            }

            await pdfDoc.flattenAnnotations();
          }

          // Remove outline from the document
          await OutlineCoreUtils.importOutlinesToDoc({ pdfDoc });

          if (shouldRemoveJavaScript) {
            await removeJavaScriptFromPdf(pdfDoc);
          }

          if (securityHandler && !shouldRemoveSecurity) {
            await handleSecurityHandler(pdfDoc, securityHandler, password);
          }
          resolve(pdfDoc.saveMemoryBuffer(window.Core.PDFNet.SDFDoc.SaveOptions.e_linearized));
        })
        .catch(reject);
    });
  } finally {
    currentPdfDoc?.unlock();
  }
}

async function originalGetFileDataByPDFNet({
  xfdf,
  shouldRemoveJavaScript = false,
  shouldRemoveSecurity = false,
  flattenPdf = false,
  signal,
}) {
  try {
    const cancellableProcess = executeWithCancellation({
      callback: processGetFileDataByPDFNet,
      signal,
    });
    return await cancellableProcess({ xfdf, shouldRemoveJavaScript, shouldRemoveSecurity, flattenPdf });
  } catch (error) {
    if (error.message === OPERATION_CANCELED_MESSAGE) {
      logger.logInfo({
        message: 'Get file data by PDFNet was canceled by user',
        reason: LOGGER.Service.USER_CANCEL,
      });
      throw error;
    }

    logger.logError({
      error,
      reason: LOGGER.Service.EXPORT_FILE_CONTENT_ERROR,
    });
    // If error, fallback to WebViewer API to export file
    return getFileData({ xfdfString: xfdf, flatten: flattenPdf });
  }
}

export async function getFileDataByPDFNet(params) {
  return pdfNetQueue.enqueue(() => originalGetFileDataByPDFNet(params));
}

export async function getFlattenedPdfDoc() {
  const password = sessionStorage.getItem(SESSION_STORAGE_KEY.PDF_PASSWORD);
  let securityHandler = null;
  let currentPdfDoc = null;
  try {
    const docInstance = await core.getDocument();
    currentPdfDoc = await docInstance.getPDFDoc();
    currentPdfDoc.lock();
    if (password) {
      securityHandler = await currentPdfDoc.getSecurityHandler();
    }
    const rawDocument = await docInstance.getFileData({ flags: window.Core.SaveOptions.INCREMENTAL });
    const pdfDoc = await core.createPDFDocFromBuffer(rawDocument);
    if (securityHandler) {
      pdfDoc.initStdSecurityHandler(password);
      pdfDoc.removeSecurity();
    }
    const xfdf = await exportAnnotations();
    const fdfDoc = await core.createFdfDocFromXfdf(xfdf);
    await pdfDoc.fdfUpdate(fdfDoc);
    await pdfDoc.flattenAnnotations(true);
    return pdfDoc;
  } catch (error) {
    logger.logError({
      error,
      reason: LOGGER.Service.EXPORT_FILE_CONTENT_ERROR,
    });
    throw error;
  } finally {
    if (currentPdfDoc) {
      currentPdfDoc.unlock();
    }
  }
}

export function getDocument(document) {
  let file;
  const mapDocServiceToCallback = {
    [STORAGE_TYPE.S3]: getFileService.getFileFromS3,
    [STORAGE_TYPE.GOOGLE]: getFileService.getFileGoogleService,
    [STORAGE_TYPE.DROPBOX]: getFileService.getFileDropboxService,
    [STORAGE_TYPE.ONEDRIVE]: getFileService.getFileOneDriveService,
  };
  return mapDocServiceToCallback[document.service](document) || file;
}

export async function getLinearizedDocumentFile(fileName, pdfNetOptions = {}, requestOptions = {}) {
  let file;
  const xfdf = await exportAnnotations();
  const fileData = await getFileService.getFileDataByPDFNet({ xfdf, ...pdfNetOptions, ...requestOptions });
  if (isIE) {
    file = new Blob([fileData], { type: general.PDF });
  } else {
    file = new File([fileData], fileUtils.convertExtensionToPdf(fileName), {
      type: general.PDF,
    });
  }
  return file;
}

export const fileUrlStorageMapping = {
  [STORAGE_TYPE.S3]: (document) =>
    document.signedUrl || `${AXIOS_BASEURL}/document/getdocument?documentId=${document._id}`,
  [STORAGE_TYPE.GOOGLE]: (document) =>
    `https://www.googleapis.com/drive/v3/files/${document.remoteId}?alt=media&supportsAllDrives=true`,
  [STORAGE_TYPE.DROPBOX]: () => `https://content.dropboxapi.com/2/files/download`,
  [STORAGE_TYPE.ONEDRIVE]: (document) =>
    `https://graph.microsoft.com/v1.0/drives/${document.externalStorageAttributes.driveId}/items/${document.remoteId}/content`,
};

export async function getFileOptions(document, documentOptions) {
  let oneDriveToken;
  if (document.service === STORAGE_TYPE.ONEDRIVE) {
    oneDriveToken = await oneDriveServices.getAccessToken();
  }
  const mapDocServiceToCallback = {
    [STORAGE_TYPE.S3]: () => ({
      src: fileUrlStorageMapping[STORAGE_TYPE.S3](document),
      options: documentOptions,
    }),
    [STORAGE_TYPE.GOOGLE]: () => {
      const { access_token = '' } = googleServices.getImplicitAccessToken() || {};
      if (document.signedUrl) {
        return { src: document.signedUrl, options: documentOptions };
      }
      return {
        src: fileUrlStorageMapping[STORAGE_TYPE.GOOGLE](document),
        options: {
          ...documentOptions,
          customHeaders: {
            authorization: `Bearer ${access_token}`,
          },
        },
      };
    },
    [STORAGE_TYPE.DROPBOX]: () => ({
      src: fileUrlStorageMapping[STORAGE_TYPE.DROPBOX](),
      options: {
        ...documentOptions,
        customHeaders: {
          authorization: `Bearer ${localStorage.getItem('token-dropbox')}`,
          'Content-Type': 'text/plain',
          'Dropbox-API-Arg': JSON.stringify({ path: document.remoteId }),
        },
      },
    }),
    [STORAGE_TYPE.ONEDRIVE]: () => ({
      src: fileUrlStorageMapping[STORAGE_TYPE.ONEDRIVE](document),
      options: {
        ...documentOptions,
        customHeaders: {
          authorization: `Bearer ${oneDriveToken}`,
        },
      },
    }),
  };
  return mapDocServiceToCallback[document.service]();
}

export async function getFileDropboxService(document) {
  try {
    await dropboxServices.getFileMetaData(document.remoteId);
    const url = document.downloadUrl || 'https://content.dropboxapi.com/2/files/download';
    const options = { responseType: 'blob' };
    if (!document.downloadUrl) {
      options.headers = {
        'Content-Type': 'text/plain',
        'Dropbox-API-Arg': JSON.stringify({ path: document.remoteId }),
      };
    }
    const response = await Axios.dropboxInstance.post(url, null, options);
    const attribute = {
      status: response.status,
      statusText: response.statusText,
    };

    logger.logInfo({
      message: LOGGER.EVENT.DROPBOX_GET_FILE,
      reason: LOGGER.Service.DROPBOX_API_INFO,
      attributes: { attribute },
    });
    return new File([new Blob([response.data])], document.name, {
      type: document.mimeType,
    });
  } catch (error) {
    getFileService.handleErrorGetFileDropbox(error);
  }
}

export function handleErrorGetFileDropbox(error) {
  if (dropboxError.isFileNotFoundError(error.response?.data?.error)) {
    throw new Error('file_not_found_dropbox');
  }
  localStorage.removeItem('token-dropbox');
  logger.logError({
    error,
    reason: LOGGER.Service.DROPBOX_API_INFO,
    attributes: { message: LOGGER.EVENT.DROPBOX_HANDLE_ERROR_GET_FILE },
  });
  if (error.response.status !== STATUS_CODE.BAD_REQUEST) {
    if (error.response.status === STATUS_CODE.CONFLICT) {
      window.location.replace('/open/dropbox');
      return;
    }
    if (isElectron()) {
      electronDropboxServices.authenticate({ authorizeUrl: DROPBOX_AUTHORIZE_DOWNLOAD_API }).catch(() => {});
      return;
    }
    const windowLogout = window.open('https://www.dropbox.com/logout');
    windowLogout?.close();
    return;
  }

  if (isElectron()) {
    electronDropboxServices.authenticate({ authorizeUrl: DROPBOX_AUTHORIZE_DOWNLOAD_API }).catch(() => {});
    return;
  }

  window.open(DROPBOX_AUTHORIZE_DOWNLOAD_API, '_blank');
}

export function getSignatureUrl(key) {
  return key ? `${AXIOS_BASEURL}/user/getSignature?remoteId=${key}` : null;
}

export function getThumbnailUrl(key) {
  return key;
}

/**
 * @deprecated
 * FALLBACK METHOD - Do not use as primary method to get document
 * This method should only be used when can not get document from presigned URL
 */
export function getFileFromS3(document) {
  return Axios.axiosInstance
    .get(`${AXIOS_BASEURL}/document/getdocument?documentId=${document._id}`, {
      responseType: 'blob',
    })
    .then((response) => new File([new Blob([response.data])], document.name, { type: document.mimeType }));
}

export function getFileGoogleService(document) {
  return googleServices.getFileContent(document);
}

export function getFileOneDriveService(document) {
  return oneDriveServices.getFileContent({
    remoteId: document.remoteId,
    driveId: document.externalStorageAttributes.driveId,
    name: document.name,
    mimeType: document.mimeType,
  });
}

export function executeRequestToDrive(request) {
  return new Promise((resolve, reject) => {
    request.execute((resp) => {
      if (resp.code) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({
          type: 'googleDrive',
          code: resp.code,
        });
      }
      resolve(resp);
    });
  });
}

export function getFileUpload({ formData, files }) {
  let filesArray;
  if (files.constructor.name === 'File') {
    filesArray = Array.of(files);
  } else {
    filesArray = Array.from(files);
  }
  filesArray.forEach((file) => {
    formData.append('files', file);
  });
  return filesArray;
}

export function getFileType(document) {
  const { mimeType, type, name } = document;
  return fileUtils.getExtension(name) || mime.extension(mimeType) || mime.extension(type);
}

export function getFileFromUrl({ url, fileName, fileOptions = {}, abortSignal }) {
  return Axios.axiosInstance
    .get(url, {
      responseType: 'blob',
      signal: abortSignal,
    })
    .then((response) => new File([new Blob([response.data])], fileName, fileOptions));
}

export default {
  getFileFromS3,
  getFileDropboxService,
  getFileGoogleService,
  getDocument,
  getFileOptions,
  getFileUpload,
  getLinearizedDocumentFile,
  getSignatureUrl,
  getThumbnailUrl,
  handleErrorGetFileDropbox,
  executeRequestToDrive,
  getFileType,
  getFileData,
  getFileDataByPDFNet,
  getFileOneDriveService,
  getFileFromUrl,
  getFlattenedPdfDoc,
};
