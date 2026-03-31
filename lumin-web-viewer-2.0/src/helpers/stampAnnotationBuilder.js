import { t } from 'i18next';
import { enqueueSnackbar } from 'lumin-ui/kiwi-ui';

import { store } from 'src/redux/store';
import { socket } from 'src/socket';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { cachingFileHandler } from 'HOC/OfflineStorageHOC';

import documentServices from 'services/documentServices';
import { documentGraphServices } from 'services/graphServices';

import fireEvent from 'helpers/fireEvent';
import logger from 'helpers/logger';

import compressImage, { convertDimensionToPixels } from 'utils/compressImage';
import errorExtract from 'utils/error';
import fileUtil from 'utils/file';
import { retryOnUnavailableService } from 'utils/retryGraphQL';

import { CUSTOM_DATA_STAMP_ANNOTATION } from 'constants/customDataConstant';
import { ANNOTATION_ACTION, AnnotationSubjectMapping } from 'constants/documentConstants';
import { DefaultErrorCode } from 'constants/errorCode';
import { MAX_IMAGE_SIZE_IN_BYTES } from 'constants/fileSize';
import { LOGGER, ModalTypes } from 'constants/lumin-common';
import { SOCKET_EMIT } from 'constants/socketConstant';

export const maxImageSize = (sizeLimit) => sizeLimit / (1024 * 1024);

const getImageDimension = (blob) =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = function () {
      URL.revokeObjectURL(url);
      resolve({ width: this.width, height: this.height });
    };

    img.onerror = function () {
      URL.revokeObjectURL(url);
      enqueueSnackbar({
        message: t('viewer.signatureModal.failedToUploadImageDescription'),
        variant: 'error',
      });
      logger.logError({
        reason: LOGGER.Service.PDFTRON,
        error: new Error('Failed to load image'),
      });
    };

    img.src = url;
  });

export default class StampAnnotationBuilder {
  constructor(file) {
    this.file = file;
    this.currentPage = core.getCurrentPage();
    this.height = 0;
    this.width = 0;
    const { pageWidth, pageHeight } = this.getPageSized();
    this.pageWidth = pageWidth;
    this.pageHeight = pageHeight;

    this.pageRotation = core.getCompleteRotation(this.currentPage) * 90;
    this.isPageLandscape = this.pageRotation === 90 || this.pageRotation === 270;
  }

  getPageSized = () => {
    const { width, height } = core.getPageInfo(this.currentPage);
    const isTemporaryLandscape = [1, 3].includes(core.getRotation(this.currentPage));
    return isTemporaryLandscape
      ? {
          pageHeight: width,
          pageWidth: height,
        }
      : {
          pageHeight: height,
          pageWidth: width,
        };
  };

  createImageAnnotation = async () => {
    this.annotation = new window.Core.Annotations.StampAnnotation();
    this.annotation.MaintainAspectRatio = true;
    this.annotation.PageNumber = this.currentPage;
    this.annotation.Rotation = this.pageRotation;
    this.annotation.Author = core.getCurrentUser();
    await this.setAnnotationSize();
    this.setAnnotationPosition();
  };

  setAnnotationSize = async () => {
    const { height, width } = await getImageDimension(this.file);
    const annotationSize = this.getAnnotationSize({
      imageHeight: height,
      imageWidth: width,
    });
    this.annotation.Width = this.isPageLandscape ? annotationSize.height : annotationSize.width;
    this.annotation.Height = this.isPageLandscape ? annotationSize.width : annotationSize.height;
  };

  getAnnotationSize = ({ imageWidth, imageHeight }) => {
    const imageRatio = imageHeight / imageWidth;
    const height = Math.min(imageHeight, this.pageHeight);
    const width = Math.min(imageWidth, this.pageWidth);

    if (imageRatio > 1) {
      return {
        height,
        width: height / imageRatio,
      };
    }
    return {
      width,
      height: width * imageRatio,
    };
  };

  getPosition = () =>
    this.isPageLandscape
      ? {
          X: (this.pageHeight - this.annotation.Width) / 2,
          Y: (this.pageWidth - this.annotation.Height) / 2,
        }
      : {
          X: (this.pageWidth - this.annotation.Width) / 2,
          Y: (this.pageHeight - this.annotation.Height) / 2,
        };

  setAnnotationPosition = () => {
    const annotationPosition = this.getPosition();
    this.annotation.X = annotationPosition.X;
    this.annotation.Y = annotationPosition.Y;
  };

  getCompressFile = () => {
    const maximumImageDimension = convertDimensionToPixels({
      height: this.annotation.Height,
      width: this.annotation.Width,
    });
    return compressImage(this.file, {
      mimeType: 'jpeg',
      maxWidth: maximumImageDimension.pageWidth,
      maxHeight: maximumImageDimension.pageHeight,
    });
  };

  getAnnotationCommand = async () => {
    const annotXfdf = await core.exportAnnotations({ annotList: [this.annotation] });
    const parser = new DOMParser();
    const rootElement = parser.parseFromString(annotXfdf, 'text/xml');
    const xfdfElement = rootElement.querySelector('xfdf');
    const parentAnnots = rootElement.querySelector('annots');
    xfdfElement.innerHTML = '';
    return `<?xml version="1.0" encoding="UTF-8" ?>\n<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">\n<fields />\n<modify />\n<add>${parentAnnots.innerHTML}</add>\n<delete />\n</xfdf>`;
  };

  addUrlImageToDocument = async (currentDocument) => {
    const annotManager = core.getAnnotationManager();
    try {
      await this.createImageAnnotation();
      await this.showLoadingPlaceholder(annotManager);
      const compressedImage = await this.getCompressFile();
      const { remoteId, putSignedUrl, getSignedUrl } = await retryOnUnavailableService(() =>
        documentGraphServices.getPresignedUrlForDocumentImage({
          documentId: currentDocument._id,
          mimeType: compressedImage.type,
        })
      );
      if (compressedImage?.size > MAX_IMAGE_SIZE_IN_BYTES) {
        enqueueSnackbar({
          message: t('viewer.signatureModal.sizeLimitDescription', {
            size: maxImageSize(MAX_IMAGE_SIZE_IN_BYTES),
          }),
          variant: 'error',
        });
        this.unlockAnnotation();
        annotManager.deleteAnnotation(this.annotation, { imported: true });
        return;
      }
      await documentServices.putFileToS3ByPresignedUrl({ presignedUrl: putSignedUrl, file: compressedImage });
      if (currentDocument.isOfflineValid) {
        cachingFileHandler.updateDocumentImageUrlById(currentDocument._id, { remoteId, signedUrl: getSignedUrl });
      }
      delete this.annotation.showPlaceholder;
      await this.annotation.setImageData(getSignedUrl);
      core.getDocument().isUsingPresignedUrlForImage = true;
      this.annotation.setCustomData(CUSTOM_DATA_STAMP_ANNOTATION.REMOTE_ID.key, remoteId);
      this.unlockAnnotation();
      this.emitData(currentDocument, remoteId);
      core.getAnnotationManager().redrawAnnotation(this.annotation);
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.PDFTRON,
        error,
      });
      this.unlockAnnotation();
      annotManager.deleteAnnotation(this.annotation, { imported: true });
      this.showErrorModal(currentDocument, error);
    }
  };

  addBase64ImageToDocument = async () => {
    await this.createImageAnnotation();
    const annotManager = core.getAnnotationManager();

    const compressedImage = await this.getCompressFile();

    if (compressedImage?.size > MAX_IMAGE_SIZE_IN_BYTES) {
      enqueueSnackbar({
        message: t('viewer.signatureModal.sizeLimitDescription', {
          size: maxImageSize(MAX_IMAGE_SIZE_IN_BYTES),
        }),
        variant: 'error',
      });
      return;
    }
    const base64Data = await fileUtil.fileReaderAsync(compressedImage);
    await this.annotation.setImageData(base64Data);
    annotManager.addAnnotation(this.annotation);
    annotManager.drawAnnotationsFromList([this.annotation]);
  };

  async showLoadingPlaceholder(annotManager) {
    this.annotation.Locked = true;
    this.annotation.LockedContent = true;
    await this.annotation.setImageData('/assets/images/loading-placeholder.svg');
    this.annotation.showPlaceholder = true;
    annotManager.addAnnotation(this.annotation, { imported: true });
    annotManager.drawAnnotationsFromList([this.annotation]);
  }

  showErrorModal(currentDocument, error) {
    const { code } = errorExtract.extractGqlError(error);
    if (code === DefaultErrorCode.UNAUTHORIZED) {
      fireEvent('sessionExpired');
      return;
    }
    if (code === DefaultErrorCode.TOO_MANY_REQUESTS) {
      enqueueSnackbar({
        message: t('errorMessage.documentUploadRateLimit'),
        variant: 'error',
      });
      return;
    }
    const modalSettings = {
      type: ModalTypes.ERROR,
      title: t('viewer.uploadImageErrorModal.title'),
      message: t('viewer.uploadImageErrorModal.description'),
      confirmButtonTitle: t('common.retry'),
      cancelButtonTitle: t('common.cancel'),
      footerVariant: 'variant3',
      onCancel: () => {},
      onConfirm: () => {
        store.dispatch(actions.closeModal());
        return this.addUrlImageToDocument(currentDocument);
      },
    };
    store.dispatch(actions.openViewerModal(modalSettings));
  }

  unlockAnnotation() {
    this.annotation.Locked = false;
    this.annotation.LockedContent = false;
  }

  async emitData(currentDocument, remoteId) {
    const xfdf = await this.getAnnotationCommand();
    const reduxState = store.getState();
    const currentUser = selectors.getCurrentUser(reduxState);
    const careTaker = selectors.getCareTaker(reduxState);
    const xfdfData = {
      annotationAction: ANNOTATION_ACTION.ADD,
      annotationType: AnnotationSubjectMapping.stamp,
      email: currentUser.email,
      roomId: currentDocument._id,
      xfdf,
      annotationId: this.annotation.Id,
      imageRemoteId: remoteId,
      shouldCreateEvent: false,
      pageIndex: this.annotation.PageNumber,
    };
    socket.emit(SOCKET_EMIT.ANNOTATION_CHANGE, xfdfData);
    careTaker.backupAnnotation({
      annotations: [this.annotation],
      action: ANNOTATION_ACTION.ADD,
      mapXfdf: xfdf,
      currentDocument,
      currentUser,
    });
  }
}
