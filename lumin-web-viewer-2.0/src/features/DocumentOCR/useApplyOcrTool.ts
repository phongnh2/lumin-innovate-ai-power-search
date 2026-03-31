/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-await-in-loop */
import pLimit from 'p-limit';
import { useRef } from 'react';
import { useDispatch, batch } from 'react-redux';
import { AnyAction } from 'redux';

import { enqueueSnackbar } from '@libs/snackbar';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { useAutoSync } from 'hooks/useAutoSync';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import documentServices from 'services/documentServices';
import indexedDBService from 'services/indexedDBService';

import { isSyncableFile } from 'helpers/autoSync';
import exportAnnotations from 'helpers/exportAnnotations';
import fireEvent from 'helpers/fireEvent';
import logger from 'helpers/logger';

import { eventTracking } from 'utils/recordUtil';

import annotationLoadObserver from 'features/Annotation/utils/annotationLoadObserver';
import { increaseExploredFeatureUsage } from 'features/EnableToolFromQueryParams/apis/increaseExploredFeatureUsage';
import { PdfAction } from 'features/EnableToolFromQueryParams/constants';
import { ExploredFeatureKeys } from 'features/EnableToolFromQueryParams/constants/exploredFeatureKeys';
import { useCheckExploringFeature } from 'features/EnableToolFromQueryParams/hooks/useExploringFeature';
import { OutlineCoreUtils } from 'features/Outline/utils/outlineCore.utils';

import { AUTO_SYNC_CHANGE_TYPE } from 'constants/autoSyncConstant';
import { DataElements } from 'constants/dataElement';
import { documentStorage } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { LOGGER } from 'constants/lumin-common';
import { ENV } from 'constants/urls';

import { OCR_TIMEOUT } from './constants';
import useShowUnvailableModal from './useShowModal';
import { isValidToApplyOCR, mergeFile, syncFileToS3AfterOCR } from './utils';
import { socket } from '../../socket';

type OcrResultDataType = {
  preSignedUrl?: string;
  errorMessage?: string;
  position: number;
};
const limitPromise = pLimit(1);

const useApplyOcrTool = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { showUnavailableModal, showPromptModal, openLoadingModal } = useShowUnvailableModal();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const isSyncDriveRef = useRef(false);
  const isExploringFeature = useCheckExploringFeature({ pdfAction: PdfAction.OCR });

  const closeLoadingModal = () => {
    batch(() => {
      dispatch(actions.closeElement(DataElements.VIEWER_LOADING_MODAL) as AnyAction);
      dispatch(actions.resetViewerLoadingModal() as AnyAction);
      dispatch(actions.setShouldShowOCRBanner(false) as AnyAction);
    });
  };
  const { sync } = useAutoSync({
    onSyncSuccess: ({ action }) => {
      if (!action || !action.includes(AUTO_SYNC_CHANGE_TYPE.OCR) || !isSyncDriveRef.current) {
        return;
      }
      eventTracking(UserEventConstants.EventType.OCR_DOCUMENT, {
        LuminFileId: currentDocument._id,
      }).catch(() => {});
      closeLoadingModal();
      isSyncDriveRef.current = false;
    },
    onError: (action) => {
      if (!action || !action.includes(AUTO_SYNC_CHANGE_TYPE.OCR) || !isSyncDriveRef.current) {
        return;
      }
      isSyncDriveRef.current = false;
      closeLoadingModal();
    },
  });

  const splitFileAndUploadToS3 = async (totalPages: number, pdfDoc: Core.PDFNet.PDFDoc) => {
    const quantity = 20;
    const totalParts = Math.ceil(totalPages / quantity);
    const { key, listSignedUrls } = await documentServices.getSignedUrlForOCR({
      documentId: currentDocument._id,
      totalParts,
    });

    socket.emit('ocr', { fileName: key });

    let part = 1;
    let progress = 1;
    while (progress <= totalPages) {
      const numberPages = Math.min(quantity, totalPages - progress + 1);
      const buffer = await core.runWithCleanup(async () => {
        const tempPDFDoc = await window.Core.PDFNet.PDFDoc.create();
        await tempPDFDoc.insertPages(
          0,
          pdfDoc,
          progress,
          progress + numberPages - 1,
          window.Core.PDFNet.PDFDoc.InsertFlag.e_none
        );
        return tempPDFDoc.saveMemoryBuffer(window.Core.PDFNet.SDFDoc.SaveOptions.e_remove_unused);
      });
      progress += numberPages;
      const url = listSignedUrls.shift();

      await documentServices.uploadFileToS3({
        file: new Blob([buffer]),
        presignedUrl: url,
        headers: {
          'x-amz-meta-position': part.toString(),
          'x-amz-meta-env': ENV,
        },
      });
      part += 1;
    }
    return totalParts;
  };

  const cleanup = (timeoutId: NodeJS.Timeout, listPdfDoc: Array<{ pdfDoc: Core.PDFNet.PDFDoc; position: number }>) => {
    socket.removeListener({
      message: 'ocr',
    });
    listPdfDoc.forEach((pdfDoc) => pdfDoc.pdfDoc.destroy());
    clearTimeout(timeoutId);
  };

  const handleSuccess = async (
    listPdfDoc: Array<{ pdfDoc: Core.PDFNet.PDFDoc; position: number }>,
    resultPDFDoc: Core.PDFNet.PDFDoc,
    xfdf: string
  ) => {
    await mergeFile(listPdfDoc, resultPDFDoc, xfdf);
    const ocrBuffer = await resultPDFDoc.saveMemoryBuffer(window.Core.PDFNet.SDFDoc.SaveOptions.e_linearized);
    await OutlineCoreUtils.importOutlinesToDoc({ pdfDoc: resultPDFDoc });
    annotationLoadObserver.setAnnotations([]);
    await core.loadDocument(resultPDFDoc);
    enqueueSnackbar({
      title: t('viewer.ocr.toastTitle'),
      message: t('viewer.ocr.toastMessage'),
      variant: 'success',
    });
    if (currentDocument.service === documentStorage.s3) {
      await syncFileToS3AfterOCR(ocrBuffer, currentDocument);
      eventTracking(UserEventConstants.EventType.OCR_DOCUMENT, {
        LuminFileId: currentDocument._id,
      }).catch(() => {});
      fireEvent('refetchDocument');
    }
    if (isSyncableFile(currentDocument)) {
      sync(AUTO_SYNC_CHANGE_TYPE.OCR);
      isSyncDriveRef.current = true;
    }
    if (isExploringFeature) {
      await increaseExploredFeatureUsage({ key: ExploredFeatureKeys.OCR });
    }
  };

  const process = async (params: { totalPart: number; xfdf: string }) => {
    const { totalPart, xfdf } = params;
    const listPdfDoc: Array<{ pdfDoc: Core.PDFNet.PDFDoc; position: number }> = [];
    const resultPDFDoc = await window.Core.PDFNet.PDFDoc.create();

    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        cleanup(timeoutId, listPdfDoc);
        reject(new Error('OCR timeout'));
      }, OCR_TIMEOUT);
      let progress = 0;
      const handleResult = async (data: OcrResultDataType) => {
        try {
          const { preSignedUrl, position } = data;
          const chunkPdfDoc = await window.Core.PDFNet.PDFDoc.createFromURL(preSignedUrl);
          listPdfDoc.push({
            pdfDoc: chunkPdfDoc,
            position,
          });
          progress += await chunkPdfDoc.getPageCount();
          dispatch(actions.steppingViewerLoadingModal(progress) as AnyAction);
          if (listPdfDoc.length === totalPart) {
            await handleSuccess(listPdfDoc, resultPDFDoc, xfdf);
            cleanup(timeoutId, listPdfDoc);
            resolve(1);
          }
        } catch (error) {
          cleanup(timeoutId, listPdfDoc);
          reject(error);
        }
      };
      socket.on('ocr', (data: OcrResultDataType) => limitPromise(handleResult, data));
    });
  };

  const processOCR = async (): Promise<void> => {
    try {
      const totalPages = core.getTotalPages();
      openLoadingModal(totalPages);
      const xfdf = await exportAnnotations();
      const arrayBuffer = await core.getDocument().getFileData({ flags: window.Core.SaveOptions.INCREMENTAL });
      const pdfDoc = await window.Core.PDFNet.PDFDoc.createFromBuffer(arrayBuffer);
      const totalPart = await splitFileAndUploadToS3(totalPages, pdfDoc);
      await process({ totalPart, xfdf });
    } catch (e) {
      logger.logError({
        reason: LOGGER.Service.APPLY_OCR_DOCUMENT_ERROR,
        error: e as Error,
      });
      enqueueSnackbar({
        message: t('common.somethingWentWrong'),
        variant: 'error',
      });
      batch(() => {
        dispatch(actions.closeElement(DataElements.VIEWER_LOADING_MODAL) as AnyAction);
        dispatch(actions.resetViewerLoadingModal() as AnyAction);
      });
    } finally {
      if (currentDocument.service === documentStorage.s3) {
        closeLoadingModal();
      }
    }
  };

  const startProcess = async () => {
    const isPreventShowingModal = await indexedDBService.getProfileDataByKey<boolean>('preventShowOCRModal');
    if (!isPreventShowingModal) {
      showPromptModal(processOCR);
    } else {
      await processOCR();
    }
  };

  return (): Promise<void> => {
    if (isValidToApplyOCR(currentDocument)) {
      return startProcess();
    }
    showUnavailableModal();
  };
};

export default useApplyOcrTool;
