/* eslint-disable class-methods-use-this */
import Axios from '@libs/axios';

import documentServices from 'services/documentServices';
import dropboxServices from 'services/dropboxServices';
import googleServices from 'services/googleServices';

import logger from 'helpers/logger';

import { file as fileUtils } from 'utils';

import { documentStorage, UploadDocFormField } from 'constants/documentConstants';
import { MAXIMUM_FILE_SIZE, LOGGER, MAX_DOCUMENT_SIZE } from 'constants/lumin-common';

import { store } from '../redux/store';

class UploadService {
  TEMPLATE_HANDLER = 'upload_template_handler';

  DOCUMENT_HANDLER = 'upload_document_handler';

  dispatch = store.dispatch;

  uploadHandler = {};

  registerHandler(name, handler) {
    this.uploadHandler[name] = handler;
  }

  removeHandler(name) {
    delete this.uploadHandler[name];
  }

  getUploadHandler(name) {
    return this.uploadHandler[name] || this.uploadHandler[this.DOCUMENT_HANDLER];
  }

  async linearPdfFromFiles(fileUpload, { unlockPassword = false, passwordModalMessage = '' } = {}) {
    const objectUrl = URL.createObjectURL(fileUpload);
    const documentInstance = unlockPassword ?
      await fileUtils.getUnlockedPDFInstance({
        objectUrl,
        uploadFile: fileUpload,
        dispatch: this.dispatch,
        passwordModalMessage,
      })
      : await fileUtils.getDocumentInstanceWithFile(objectUrl, fileUpload, this.dispatch);
    try {
      const linearizedFile = await fileUtils.getLinearPDFWithDocument(documentInstance, {
        fileMetadata: fileUpload,
      });
      return {
        linearizedFile,
        documentInstance,
      };
    } catch (e) {
      logger.logError({
        reason: LOGGER.Service.UPLOAD_DOCUMENT,
        error: e,
      });
      const name = fileUpload.name ?? documentInstance.getFileName();
      const file = new File([fileUpload], name, { type: fileUpload.type });
      return {
        linearizedFile: file,
        documentInstance,
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async getThumbnailDocument(docInstance) {
    const thumbnailCanvas = await fileUtils.getThumbnailWithDocument(docInstance, { thumbSize: 2500 });

    return fileUtils.convertThumnailCanvasToFile(thumbnailCanvas, docInstance.getFilename());
  }

  async loadThumbnailBase64(file, handler) {
    if (!file) {
      return handler('');
    }
    const reader = new FileReader();
    reader.onload = () => handler(reader.result);
    reader.onerror = () => handler('');
    if (file instanceof Blob) {
      reader.readAsDataURL(file);
    } else {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        const canvas = document.createElement('CANVAS');
        const ctx = canvas.getContext('2d');
        canvas.height = img.naturalHeight;
        canvas.width = img.naturalWidth;
        ctx.drawImage(img, 0, 0);
        handler(canvas.toDataURL());
      };
      img.src = file;
    }
  }

  checkUploadBySize(fileSize, isPremiumPlan) {
    const fileSizeMB = fileSize / 1024 / 1024;
    const overSize = fileSizeMB > MAX_DOCUMENT_SIZE;
    if (overSize) {
      return {
        allowedUpload: false,
        maxSizeAllow: MAX_DOCUMENT_SIZE,
      };
    }
    if (isPremiumPlan) {
      return {
        allowedUpload: fileSizeMB <= MAXIMUM_FILE_SIZE.PREMIUM_PLAN,
        maxSizeAllow: MAXIMUM_FILE_SIZE.PREMIUM_PLAN,
      };
    }
    return {
      allowedUpload: fileSizeMB <= MAXIMUM_FILE_SIZE.FREE_PLAN,
      maxSizeAllow: MAXIMUM_FILE_SIZE.FREE_PLAN,
    };
  }

  async getFileSize({ remoteId, service, size }) {
    switch (service) {
      case documentStorage.dropbox: {
        const fileInfo = await dropboxServices.getFileMetaData(remoteId);
        return fileInfo.data.size;
      }
      case documentStorage.google: {
        const fileInfo = await googleServices.getFileInfo(remoteId, '*', 'getFileSize');
        return fileInfo.size;
      }
      // case documentStorage.onedrive: {
      // handler later
      // }
      default:
        return size;
    }
  }

  handleUploadDocumentToPersonal = async (personalData) => {
    const { file, thumbnail, folderId, clientId } = personalData;
    const {
      thumbnail: thumbnailPresignedData,
      document: documentPresignedData,
      encodedUploadData,
    } = await documentServices.uploadDocumentWithThumbnailToS3({
      file,
      thumbnail,
    });
    const postParams = {
      ...(thumbnailPresignedData && { [UploadDocFormField.THUMBNAIL_REMOTE_ID]: thumbnailPresignedData.fields.key }),
      [UploadDocFormField.FOLDER_ID]: folderId,
      [UploadDocFormField.FILE_REMOTE_ID]: documentPresignedData.fields.key,
      [UploadDocFormField.CLIENT_ID]: clientId,
      [UploadDocFormField.FILE_NAME]: file.name,
      [UploadDocFormField.UPLOAD_DATA]: encodedUploadData,
    };
    logger.logInfo({
      message: LOGGER.EVENT.FILE_UPLOADED,
      reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
    });
    const response = await Axios.axiosInstance.post('/document/v2/upload', postParams);

    return response.data;
  };

  async getDocumentInstanceFromFile(fileUpload) {
    const objectURL = URL.createObjectURL(fileUpload);
    const documentInstance = await fileUtils.getDocumentInstanceWithFile(objectURL, fileUpload, this.dispatch);
    return {
      documentInstance,
      objectURL,
    };
  }
}

const uploadService = new UploadService();

export default uploadService;
