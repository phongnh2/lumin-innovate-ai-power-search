/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-promise-reject-errors */
/// <reference path="./file.d.ts" />

import mime from 'mime-types';
import v4 from 'uuid/v4';

import actions from 'actions';
import core from 'core';

import { CustomErrorCode } from 'constants/customErrorCode';
import { office, general, images } from 'constants/documentType';
import { ERROR_MESSAGE_TYPE } from 'constants/messages';
import { supportedClientOnlyExtensions } from 'constants/supportedFiles';

import file from './file';
import { passwordHandlers } from '../helpers/passwordHandlers';
import { store } from '../redux/store';

function isOffice(type) {
  const OfficeCases = [office.DOC, office.DOCX, office.XLS, office.XLSX, office.PPT, office.PPTX];
  return OfficeCases.includes(type);
}

function getExtension(fileName = '') {
  const extension = fileName.split('.').pop().toLowerCase();
  if (supportedClientOnlyExtensions.includes(extension)) {
    return extension;
  }
  return '';
}

function getFilenameWithoutExtension(filename) {
  if (!filename) {
    return '';
  }

  const fileNameWithoutExtension = filename.lastIndexOf('.') === -1;
  const fileNamewithOnlyExtension = filename.lastIndexOf('.') === 0;
  const extension = getExtension(filename);
  if (fileNameWithoutExtension || fileNamewithOnlyExtension || extension === '') {
    return filename;
  }

  return filename.slice(0, filename.lastIndexOf('.'));
}

function getShortFilename(filename) {
  if (!filename) {
    return null;
  }
  if (filename.length < 20) {
    return filename;
  }
  const start = filename.slice(0, 10);
  const end = filename.slice(filename.lastIndexOf('.') - 5);
  return `${start}...${end}`;
}

function convertExtensionToPdf(fileName) {
  let newName = fileName;
  const extension = getExtension(fileName);
  if (extension !== 'pdf') {
    newName = `${getFilenameWithoutExtension(fileName)}.pdf`;
  }

  return newName;
}

function removeMultiSpacing(fileName) {
  const name = getFilenameWithoutExtension(fileName).trim();
  const extension = getExtension(fileName);
  return `${name}.${extension}`;
}

function getThumbnailWithFile(uploadFile, password) {
  return new Promise(async (resolve, reject) => {
    try {
      const objectURL = URL.createObjectURL(uploadFile);
      const docIns = await file.getDocumentInstanceWithFile(objectURL, uploadFile, store.dispatch, password);
      const canvas = await file.getThumbnailWithDocument(docIns, { thumbSize: 2500 });
      URL.revokeObjectURL(objectURL);
      resolve(canvas);
    } catch (error) {
      reject(error);
    }
  });
}

function getDocumentInstanceWithFile(objectUrl, uploadFile, dispatch, password) {
  return new Promise(async (resolve, reject) => {
    await core.waitForSetupCore();
    const ext = uploadFile.name.split('.').slice(-1)[0];
    const backendType = await core.CoreControls.getDefaultBackendType();
    let attempt = -1;
    let transportPromise;
    if (uploadFile.type && !isOffice(uploadFile.type)) {
      transportPromise = core.CoreControls.initPDFWorkerTransports(backendType, {}, process.env.PDFTRON_LICENSE_KEY);
    };

    const defaultPasswordHandler = (fn) => {
      attempt++;
      passwordHandlers.setCheckFn(fn);
      passwordHandlers.setCancelFn(() => reject({ message: ERROR_MESSAGE_TYPE.PDF_CANCEL_PASSWORD }));
      dispatch(actions.setPasswordAttempts(attempt));
      dispatch(actions.openElement('passwordModal'));
    };

    const options = {
      l: process.env.PDFTRON_LICENSE_KEY,
      workerTransportPromise: transportPromise,
      extension: ext,
      password: password || defaultPasswordHandler,
      loadAsPDF: true,
      useDownloader: false,
    };
    try {
      const docIns = await core.CoreControls.createDocument(objectUrl, options);
      dispatch(actions.closeElement('passwordModal'));
      dispatch(actions.setPasswordMessage(''));
      resolve(docIns);
    } catch (error) {
      reject(error);
    }
  });
}

async function getUnlockedPDFInstance({ objectUrl, uploadFile, dispatch, passwordModalMessage = '' }) {
  dispatch(actions.setPasswordMessage(passwordModalMessage));
  const docIns = await file.getDocumentInstanceWithFile(objectUrl, uploadFile, dispatch);
  const doc = await docIns.getPDFDoc();
  await doc.initSecurityHandler();
  await doc.removeSecurity();
  return docIns;
}

function getThumbnailWithDocument(docInstance, { thumbSize = 150 }) {
  const pageInfo = docInstance.getPageInfo(1);
  return new Promise((resolve, reject) => {
    docInstance.loadCanvas({
      pageNumber: 1,
      zoom: thumbSize / Math.max(pageInfo.width, pageInfo.height),
      drawComplete: async (canvas) => {
        if (!canvas) {
          reject('Cannot get the canvas');
        }
        if (!(canvas instanceof Image)) {
          resolve(canvas);
        }
        try {
          const newCanvas = await file.getCanvasFromUrl(canvas.src);
          resolve(newCanvas);
        } catch (err) {
          reject(err);
        }
      },
    });
  });
}

function getLinearPDFWithDocument(document, { fileMetadata }) {
  return new Promise(async (resolve, reject) => {
    const { xfdfString } = await document.extractXFDF();
    const options = { xfdfString };
    if (fileMetadata.type === general.PDF) {
      options.flags = core.CoreControls.SaveOptions.LINEARIZED;
    }
    document
      .getFileData(options)
      .then((data) => {
        const name = fileMetadata?.name ?? document.getFileName();
        const arr = new Uint8Array(data);
        resolve(
          new File([arr], name, {
            type: general.PDF,
          })
        );
      })
      .catch((error) => reject(error));
  });
}

function convertThumnailCanvasToFile(thumbnailCanvas, name = v4()) {
  return new Promise((resolve, reject) => {
    try {
      thumbnailCanvas.toBlob(
        (blob) => {
          if (!blob) {
            reject('Cannot get blob');
          }
          const fileName = getFilenameWithoutExtension(name);
          const newFile = new File([blob], `${fileName}.jpg`, { type: 'image/jpeg' });
          resolve(newFile);
        },
        'image/png',
        1
      );
    } catch (error) {
      const errorInstant = new Error(error);
      errorInstant.name = CustomErrorCode.Document.CANNOT_GET_BLOB;
      reject(errorInstant);
    }
  });
}

function getCanvasFromUrl(imageUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageUrl;
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = image.width || 10;
      canvas.height = image.height || 10;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);

      resolve(canvas);
    };
    image.onerror = function (err) {
      reject(err);
    };
  });
}

function convertFileToBuffer(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const bytes = new Uint8Array(arrayBuffer);
      resolve(bytes);
    };
  });
}

function dataURLtoFile(datUrl, filename) {
  if (!datUrl) {
    return '';
  }
  const arr = datUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

function fileReaderAsync(fileUploaded) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileUploaded);
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (e) => {
      reject(e);
    };
  });
}
function dataURItoBlob(dataURI) {
  // https://gist.github.com/fupslot/5015897?permalink_comment_id=1580216#gistcomment-1580216
  const byteString = atob(dataURI.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  Array.from(byteString).forEach((_, index) => {
    ia[index] = byteString.charCodeAt(index);
  });

  return new Blob([ab]);
}

async function downloadFileFromUrl(url, fileName = '') {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 200);
}

// https://www.dropbox.com/developers/reference/json-encoding
function getHttpSafeHeaderJson(json) {
  /* eslint-disable sonarjs/no-nested-template-literals */
  return JSON.stringify(json).replace(
    /[\u007f-\uffff]/g,
    (c) => `\\u${`000${c.charCodeAt(0).toString(16)}`.slice(-4)}`
  );
}

function getFileSizeLimit(sizeLimit) {
  return sizeLimit / (1024 * 1024);
}

function isImage(file) {
  return Object.values(images).includes(file.type);
}

const getMimeTypeFromSignedUrl = (src) => {
  const { pathname } = new URL(src);
  const fileName = pathname.split('/').pop();
  return mime.lookup(fileName);
};

function convertFileNameToDownload(fileName, downloadType = 'pdf') {
  return `${getFilenameWithoutExtension(fileName)}.${downloadType}`;
}

export const fileUtils = {
  removeMultiSpacing,
  getExtension,
  getFilenameWithoutExtension,
  getShortFilename,
  convertExtensionToPdf,
  getThumbnailWithFile,
  convertThumnailCanvasToFile,
  getThumbnailWithDocument,
  getCanvasFromUrl,
  convertFileToBuffer,
  getDocumentInstanceWithFile,
  getLinearPDFWithDocument,
  fileReaderAsync,
  downloadFileFromUrl,
  dataURLtoFile,
  isOffice,
  getHttpSafeHeaderJson,
  dataURItoBlob,
  getFileSizeLimit,
  isImage,
  getUnlockedPDFInstance,
  getMimeTypeFromSignedUrl,
  convertFileNameToDownload,
};

export default fileUtils;
