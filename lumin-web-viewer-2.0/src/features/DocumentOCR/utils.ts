/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import orderBy from 'lodash/orderBy';

import core from 'core';

import { Handler, storageHandler } from 'HOC/OfflineStorageHOC';

import documentServices from 'services/documentServices';
import indexedDBService from 'services/indexedDBService';
import { socketService } from 'services/socketServices';

import setAssociatedSignatureAnnotation from 'helpers/setAssociatedSignatureAnnotation';

import { handleTrackTimeDocumentSaving } from 'utils/calculateTimeTracking';
import modalEvent from 'utils/Factory/EventCollection/ModalEventCollection';
import fileUtils from 'utils/file';

import { documentCacheBase, getCacheKey } from 'features/DocumentCaching';

import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import { AnnotationSubjectMapping } from 'constants/documentConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { maxOCRFileSize, maxOCRPages } from './constants';

export const isValidToApplyOCR = (currentDocument: IDocumentBase): boolean => {
  const totalPages = core.getTotalPages();
  const isValidFileSize = currentDocument.size < maxOCRFileSize;
  const isValidTotalPages = totalPages < maxOCRPages;

  return isValidFileSize && isValidTotalPages;
};

export const mergeFile = async (
  listPdfDoc: { pdfDoc: Core.PDFNet.PDFDoc; position: number }[],
  resultPDFDoc: Core.PDFNet.PDFDoc,
  xfdf: string
) => {
  let cursor = 1;
  const sortedList = orderBy(listPdfDoc, ['position'], ['asc']);
  for (const { pdfDoc: tempDoc } of sortedList) {
    const pages = await tempDoc.getPageCount();
    await resultPDFDoc.insertPages(cursor, tempDoc, 1, pages, window.Core.PDFNet.PDFDoc.InsertFlag.e_none);
    cursor += pages;
  }
  await resultPDFDoc.mergeXFDFString(xfdf);
};

export const updateForOfflineMode = async (currentDocument: IDocumentBase, ocrFile: File) => {
  const isOfflineEnabled = Handler.isOfflineEnabled && currentDocument.isOfflineValid;
  if (isOfflineEnabled) {
    const response = new Response(ocrFile);
    await storageHandler.deleteFile(currentDocument.signedUrl);
    await storageHandler.putCustomFile(currentDocument.signedUrl, response);
  }
};

export const updateCache = async (currentDocument: IDocumentBase, data: { etag: string }, ocrFile: File) => {
  await documentCacheBase.updateCache({
    key: getCacheKey(currentDocument._id),
    etag: data.etag,
    file: ocrFile,
    shouldCount: false,
  });
};

export const setAssociateSignatureToWidget = () => {
  const annots = core.getAnnotationsList();
  const associatedSignatures = annots.filter(
    (annotation) =>
      annotation.Subject === AnnotationSubjectMapping.signature &&
      annotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key)
  );
  if (associatedSignatures.length) {
    const signatureWidgets = annots.filter(
      (annot) => annot instanceof window.Core.Annotations.SignatureWidgetAnnotation
    );
    associatedSignatures.forEach((annot) => setAssociatedSignatureAnnotation({ annotation: annot, signatureWidgets }));
  }
  annots
    .filter((annot) => annot instanceof window.Core.Annotations.WidgetAnnotation)
    .forEach((annot: Core.Annotations.WidgetAnnotation & { styledInnerElement: () => void }) =>
      annot.styledInnerElement()
    );
};

export const onCheckboxValue = (
  checkboxValue: boolean,
  modalEventData: { modalName: string; modalPurpose: string }
) => {
  if (checkboxValue) {
    modalEvent.modalHidden(modalEventData);
    indexedDBService.putProfileDataByKey<boolean>('preventShowOCRModal', true);
  }
};

export const syncFileToS3AfterOCR = async (ocrBuffer: Uint8Array, currentDocument: IDocumentBase) => {
  const documentSyncOptions = {
    increaseVersion: true,
    isAppliedOCR: true,
  };
  try {
    socketService.modifyDocumentContent(currentDocument._id, {
      status: 'preparing',
      ...documentSyncOptions,
    });
    const ocrFile = new File([ocrBuffer], currentDocument.name, { type: currentDocument.mimeType });
    const documentInstance = core.getDocument();
    const thumbnailCanvas = await fileUtils.getThumbnailWithDocument(documentInstance, {
      thumbSize: 0,
    });
    const thumbnail = await fileUtils.convertThumnailCanvasToFile(thumbnailCanvas);
    const { data: etagData } = await handleTrackTimeDocumentSaving(
      documentServices.overrideDocumentToS3({
        file: ocrFile,
        remoteId: currentDocument.remoteId,
        documentId: currentDocument._id,
        thumbnail,
        thumbnailRemoteId: currentDocument.thumbnailRemoteId,
        ...documentSyncOptions,
      }),
      currentDocument.service
    );

    setAssociateSignatureToWidget();

    await Promise.all([
      updateForOfflineMode(currentDocument, ocrFile),
      updateCache(currentDocument, etagData, ocrFile),
    ]);
  } catch (error) {
    socketService.modifyDocumentContent(currentDocument._id, { status: 'failed', ...documentSyncOptions });
    throw error;
  }
};
