/* eslint-disable no-await-in-loop */
import { t } from 'i18next';
import chunk from 'lodash/chunk';
import remove from 'lodash/remove';
import pLimit from 'p-limit';

import { store } from 'src/redux/store';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { cachingFileHandler, commandHandler } from 'HOC/OfflineStorageHOC';

import { documentServices } from 'services';
import { documentGraphServices } from 'services/graphServices';
import { socketService } from 'services/socketServices';

import logger from 'helpers/logger';

import { file as fileUtils, toastUtils } from 'utils';
import errorExtract from 'utils/error';
import { BASE64_IMAGE_REGEX } from 'utils/regex';
import { retryOnUnavailableService } from 'utils/retryGraphQL';
import { completeSaveOperation, startSaveOperation } from 'utils/saveOperationUtils';

import { CUSTOM_DATA_STAMP_ANNOTATION } from 'constants/customDataConstant';
import { ANNOTATION_ACTION } from 'constants/documentConstants';
import { DefaultErrorCode } from 'constants/errorCode';
import { ModalTypes, LOGGER } from 'constants/lumin-common';
import { SAVE_OPERATION_TYPES, SAVE_OPERATION_STATUS } from 'constants/saveOperationConstants';

import fireEvent from './fireEvent';

const MAX_CONCURRENT_PROMISES = 10;

const limitPromise = pLimit(MAX_CONCURRENT_PROMISES);
const CHUNK_SIZE = 30;
const { getState, dispatch } = store;

const annotationIdSet = new Set();

const convertXfdfToAnnotationCommand = (xfdf) => {
  const parser = new DOMParser();
  const rootElement = parser.parseFromString(xfdf, 'text/xml');
  const xfdfElement = rootElement.querySelector('xfdf');
  const parentAnnots = rootElement.querySelector('annots');
  xfdfElement.innerHTML = '';
  return `<?xml version="1.0" encoding="UTF-8" ?>\n<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">\n<fields />\n<add />\n<modify>${parentAnnots.innerHTML}</modify>\n<delete />\n</xfdf>`;
};

const convertBase64ToSignedUrl = async (annotation) => {
  annotation.isConvertingSignedUrl = true;
  annotation.NoDelete = true;
  const base64Data = await annotation.getImageData();
  const state = getState();
  const currentDocument = selectors.getCurrentDocument(state);
  const currentUser = selectors.getCurrentUser(state);
  const careTaker = selectors.getCareTaker(state);
  const annotManager = core.getAnnotationManager();
  if (!BASE64_IMAGE_REGEX.test(base64Data)) {
    annotManager.deleteAnnotation(annotation);
    return;
  }
  annotationIdSet.add(annotation.Id);
  dispatch(actions.setIsConvertingBase64ToSignedUrl(true));
  const operationId = startSaveOperation(dispatch, SAVE_OPERATION_TYPES.BASE64_CONVERT, {
    annotationId: annotation.Id,
    documentId: currentDocument._id,
  });

  try {
    const file = fileUtils.dataURLtoFile(base64Data.replaceAll('%0A', ''), annotation.Id);
    const { remoteId, putSignedUrl, getSignedUrl } = await retryOnUnavailableService(() =>
      documentGraphServices.getPresignedUrlForDocumentImage({
        documentId: currentDocument._id,
        mimeType: file.type,
      })
    );
    await documentServices.putFileToS3ByPresignedUrl({ presignedUrl: putSignedUrl, file });
    if (currentDocument.isOfflineValid) {
      cachingFileHandler.updateDocumentImageUrlById(currentDocument._id, { remoteId, signedUrl: getSignedUrl });
    }
    await setSignedUrlForAnnotation(annotation, getSignedUrl, remoteId);

    const xfdf = await emitAnnotationData(annotation, currentUser, currentDocument, remoteId);

    updateUndoRedoStack(careTaker, annotation, xfdf, currentDocument);
    annotManager.redrawAnnotation(annotation);
    annotationIdSet.delete(annotation.Id);
  } catch (error) {
    const { code } = errorExtract.extractGqlError(error);
    if (code === DefaultErrorCode.UNAUTHORIZED) {
      fireEvent('sessionExpired');
      return;
    }
    if (code === DefaultErrorCode.TOO_MANY_REQUESTS) {
      toastUtils.error({
        message: t('errorMessage.documentUploadRateLimit'),
      });
      annotation.NoDelete = false;
      annotationIdSet.delete(annotation.Id);
      if (annotationIdSet.size === 0) {
        dispatch(actions.setIsConvertingBase64ToSignedUrl(false));
      }
      annotManager.deleteAnnotation(annotation);
      return;
    }
    logger.logError({
      reason: LOGGER.Service.CONVERT_BASE64_IMAGE_ERROR,
      error,
    });
    const modalSettings = {
      type: ModalTypes.ERROR,
      title: t('viewer.uploadImageErrorModal.title'),
      message: t('viewer.uploadImageErrorModal.description'),
      confirmButtonTitle: t('common.retry'),
      cancelButtonTitle: t('common.cancel'),
      footerVariant: 'variant3',
      onCancel: () => {
        annotation.NoDelete = false;
        annotationIdSet.delete(annotation.Id);
        if (annotationIdSet.size === 0) {
          dispatch(actions.setIsConvertingBase64ToSignedUrl(false));
        }
        annotManager.deleteAnnotation(annotation);
      },
      onConfirm: async () => {
        dispatch(actions.closeModal());
        delete annotation.showPlaceholder;
        await annotation.setImageData(base64Data);
        annotation.IsModified = false;
        annotation.NoDelete = false;
        return convertBase64ToSignedUrl(annotation);
      },
    };
    dispatch(actions.openViewerModal(modalSettings));
  } finally {
    if (annotationIdSet.size === 0) {
      dispatch(actions.setIsConvertingBase64ToSignedUrl(false));
    }
    completeSaveOperation(dispatch, operationId, {
      status: SAVE_OPERATION_STATUS.SUCCESS,
    });
  }
};
export default convertBase64ToSignedUrl;

export const convertMultipleBase64ToSignedUrl = async (annotations) => {
  const state = getState();
  const currentDocument = selectors.getCurrentDocument(state);
  const currentUser = selectors.getCurrentUser(state);
  const careTaker = selectors.getCareTaker(state);
  const { dispatch } = store;
  const annotManager = core.getAnnotationManager();
  const chunks = chunk(annotations, CHUNK_SIZE);
  let batchOperationId;

  // TODO: refactor this code to use requestIdleCallback to avoid blocking the main thread and using queue to handle the request
  // eslint-disable-next-line no-restricted-syntax
  for (const annots of chunks) {
    const { imageFiles, validAnnotations } = await transformListAnnotations(annots, annotManager);

    dispatch(actions.setIsConvertingBase64ToSignedUrl(true));
    batchOperationId = startSaveOperation(dispatch, SAVE_OPERATION_TYPES.BASE64_CONVERT, {
      batchSize: annots.length,
      documentId: currentDocument._id,
    });
    if (!imageFiles.length) {
      return;
    }
    const listPresignedUrls = await retryOnUnavailableService(() =>
      documentGraphServices.getPresignedUrlForMultipleDocumentImages(
        currentDocument._id,
        imageFiles.map((file) => file.type)
      )
    );
    await Promise.allSettled(
      listPresignedUrls.map(({ remoteId, putSignedUrl, getSignedUrl }, index) =>
        limitPromise(async () => {
          try {
            await documentServices.putFileToS3ByPresignedUrl({ presignedUrl: putSignedUrl, file: imageFiles[index] });
            if (currentDocument.isOfflineValid) {
              cachingFileHandler.updateDocumentImageUrlById(currentDocument._id, { remoteId, signedUrl: getSignedUrl });
            }
            setSignedUrlForAnnotation(validAnnotations[index], getSignedUrl, remoteId);
            const xfdf = await emitAnnotationData(validAnnotations[index], currentUser, currentDocument, remoteId);
            updateUndoRedoStack(careTaker, validAnnotations[index], xfdf, currentDocument);
            annotManager.redrawAnnotation(validAnnotations[index]);
            annotationIdSet.delete(validAnnotations[index].Id);
          } catch (error) {
            logger.logError({
              reason: LOGGER.Service.CONVERT_BASE64_IMAGE_ERROR,
              error,
            });
          }
        })
      )
    );
  }

  if (annotationIdSet.size === 0) {
    dispatch(actions.setIsConvertingBase64ToSignedUrl(false));
  }
  completeSaveOperation(dispatch, batchOperationId, {
    status: SAVE_OPERATION_STATUS.SUCCESS,
  });
};

async function transformListAnnotations(annotations, annotManager) {
  const validAnnotations = [];
  const imageFiles = [];

  await Promise.all(
    annotations.map(async (annot) => {
      const base64Data = await annot.getImageData();
      if (!BASE64_IMAGE_REGEX.test(base64Data)) {
        annotManager.deleteAnnotation(annot);
      } else {
        const file = fileUtils.dataURLtoFile(base64Data.replaceAll('%0A', ''), annot.Id);

        imageFiles.push(file);
        annot.isConvertingSignedUrl = true;
        annot.NoDelete = true;
        annotManager.redrawAnnotation(annot);
        annotationIdSet.add(annot.Id);
        validAnnotations.push(annot);
      }
    })
  );
  return { imageFiles, validAnnotations };
}

function updateUndoRedoStack(careTaker, annotation, xfdf, currentDocument) {
  remove(careTaker.initialStack, { annotationId: annotation.Id });
  careTaker.initialStack.push({ annotationId: annotation.Id, xfdf });
  commandHandler.insertTempAction(currentDocument._id, [
    {
      type: 'annotation',
      xfdf,
    },
  ]);
}

async function emitAnnotationData(annotation, currentUser, currentDocument, remoteId) {
  const annotXfdf = await core.exportAnnotations({ annotList: [annotation] });
  const xfdf = convertXfdfToAnnotationCommand(annotXfdf);
  const xfdfData = {
    annotationAction: ANNOTATION_ACTION.MODIFY,
    annotationType: annotation.Subject,
    email: currentUser.email,
    roomId: currentDocument._id,
    xfdf,
    annotationId: annotation.Id,
    shouldCreateEvent: false,
    imageRemoteId: remoteId,
    pageIndex: annotation.PageNumber,
  };
  socketService.annotationChange(xfdfData);
  return xfdf;
}

async function setSignedUrlForAnnotation(annotation, getSignedUrl, remoteId) {
  await annotation.setImageData(getSignedUrl);
  annotation.setCustomData(CUSTOM_DATA_STAMP_ANNOTATION.REMOTE_ID.key, remoteId);
  annotation.IsModified = false;
  annotation.NoDelete = false;
  delete annotation.isConvertingSignedUrl;
  core.getDocument().isUsingPresignedUrlForImage = true;
}
