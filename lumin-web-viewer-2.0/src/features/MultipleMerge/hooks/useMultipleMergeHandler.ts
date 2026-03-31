import { saveAs } from 'file-saver';
import produce from 'immer';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { MERGE_MODAL_EVENT_PARAMS } from '@new-ui/components/ToolProperties/components/MergePanel/constants';

import actions from 'actions';

import useSessionInternalStorageChecker from 'luminComponents/HeaderLumin/hooks/useSessionInternalStorageChecker';

import { useGetFolderType, useTranslation } from 'hooks';

import { isIE } from 'helpers/device';
import logger from 'helpers/logger';

import { eventTracking, toastUtils } from 'utils';
import documentEvent from 'utils/Factory/EventCollection/DocumentEventCollection';
import modalEvent from 'utils/Factory/EventCollection/ModalEventCollection';
import fileUtil from 'utils/file';

import DataElements from 'constants/dataElement';
import { general } from 'constants/documentType';
import UserEventConstants from 'constants/eventConstants';
import { LOGGER, STORAGE_TYPE } from 'constants/lumin-common';

import { useValidateDocuments } from './useValidateDocuments';
import { getNextStep, MULTIPLE_MERGE_SOURCE } from '../constants';
import { MergeHandler } from '../core/merge';
import { MultipleMergeStep, MultipleMergeStepType, SaveDestination, SaveDestinationType, UploadStatus } from '../enum';
import { MergeDocumentType } from '../types';

export const useMultipleMergeHandler = ({
  documents,
  handleUploadLumin,
  onClose,
  setIsLoadingDocument,
  getAbortController,
  setDocuments,
  resetAbortController,
}: {
  documents: MergeDocumentType[];
  handleUploadLumin: (files: File[]) => Promise<void>;
  onClose: () => void;
  setIsLoadingDocument: Dispatch<SetStateAction<boolean>>;
  getAbortController: () => AbortController;
  setDocuments: Dispatch<SetStateAction<MergeDocumentType[]>>;
  resetAbortController: () => void;
}) => {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState<MultipleMergeStepType>(MultipleMergeStep.SELECT_DOCUMENTS);
  const [mergingProgress, setMergingProgress] = useState(0);
  const [saveDestination, setSaveDestination] = useState<SaveDestinationType>(SaveDestination.COMPUTER);
  const [mergeHandler, setMergeHandler] = useState<MergeHandler>(undefined);
  const [openSaveToDriveModal, setOpenSaveToDriveModal] = useState(false);
  const { t } = useTranslation();
  const currentFolderType = useGetFolderType();

  const { handleInternalStoragePermission } = useSessionInternalStorageChecker();
  const { shouldBlockMergeProcess, premiumModalContent, openedPremiumModal, openedPremiumModalHandlers } =
    useValidateDocuments({ getAbortController });

  const goToNextStep = useCallback((step: MultipleMergeStepType) => {
    const nextStep = getNextStep(step);
    if (!nextStep) {
      return;
    }

    setCurrentStep(nextStep);
  }, []);

  const getResult = useCallback(async () => {
    if (!mergeHandler) {
      throw new Error('Merge handler is not initialized');
    }

    const pdfDoc = mergeHandler.getResult();
    const arr = await pdfDoc.saveMemoryBuffer(window.Core.PDFNet.SDFDoc.SaveOptions.e_linearized);
    const fileName = fileUtil.convertExtensionToPdf(
      `${fileUtil.getFilenameWithoutExtension(documents[0].name)}_merged`
    );
    let file;
    if (isIE) {
      file = new Blob([arr], { type: general.PDF });
    } else {
      file = new File([arr], fileName, {
        type: general.PDF,
      });
    }
    return { file, name: fileName };
  }, [documents, mergeHandler]);

  const handleSaveDocument = useCallback(async () => {
    try {
      const { file, name } = await getResult();
      const documentType = fileUtil.getExtension(name);

      switch (saveDestination) {
        case SaveDestination.COMPUTER: {
          saveAs(file, name);
          onClose();
          documentEvent.downloadDocumentSuccess({ fileType: documentType, savedLocation: 'device' }).catch(() => {});
          break;
        }
        case SaveDestination.LUMIN: {
          onClose();
          await handleUploadLumin([file as File]);
          documentEvent.downloadDocumentSuccess({ fileType: documentType, savedLocation: 'lumin' }).catch(() => {});
          break;
        }
        case SaveDestination.GOOGLE_DRIVE: {
          handleInternalStoragePermission({
            hasPermissionCallback: () => setOpenSaveToDriveModal(true),
            storageType: STORAGE_TYPE.GOOGLE,
          }).catch(() => {});
          break;
        }
        default:
          break;
      }
    } catch (error) {
      toastUtils.error({
        message: t('multipleMerge.mergeFailedToast'),
      });
      logger.logError({
        reason: LOGGER.Service.MULTIPLE_MERGE,
        error: new Error('Failed to save document', { cause: error }),
      });
    }
  }, [saveDestination, handleInternalStoragePermission, getResult, t]);

  const processMerge = useCallback(
    async (handler: MergeHandler) => {
      try {
        await handler.handle();
        eventTracking(UserEventConstants.EventType.DOCUMENT_MERGED, {
          LuminFileId: '',
          otherFileSource: handler.getOtherFileSource(),
          mergedFrom: MULTIPLE_MERGE_SOURCE[currentFolderType],
        }).catch(() => {});
      } catch (error) {
        const processedPdfDoc = handler.getProcessedPdfDoc();
        if (Object.keys(processedPdfDoc).length) {
          setDocuments(
            produce(documents, (draft) => {
              Object.entries(processedPdfDoc).forEach(([processedId, { pdfDoc, status, metadata }]) => {
                const index = draft.findIndex(({ _id }) => _id === processedId);
                if (index === -1) {
                  return;
                }

                draft[index] = {
                  ...draft[index],
                  ...(metadata && { metadata }),
                  ...(pdfDoc && { pdfDoc }),
                  ...(status === UploadStatus.FAILED && { status }),
                };
              });
            })
          );
        }
        resetAbortController();
        setCurrentStep(MultipleMergeStep.SELECT_DOCUMENTS);
        setMergeHandler(undefined);
        toastUtils.error({
          message: t('multipleMerge.mergeFailedToast'),
        });
        logger.logError({
          reason: LOGGER.Service.MULTIPLE_MERGE,
          error: new Error('Failed to merge documents', { cause: error }),
        });
      }
    },
    [currentFolderType, documents, resetAbortController, setDocuments, t]
  );

  const setupMergeHandler = useCallback(() => {
    const handler = new MergeHandler();
    handler.setItems(
      documents.map(({ _id, buffer, name, pdfDoc, source, remoteId }) => ({
        id: _id,
        buffer,
        name,
        pdfDoc,
        source,
        remoteId,
      }))
    );
    handler.setOnMergeItemComplete(() => setMergingProgress((prev) => prev + 1));
    handler.setOnMergeComplete(() => {
      goToNextStep(MultipleMergeStep.MERGING_DOCUMENTS);
    });
    handler.setOnError((error) => {
      logger.logError({
        reason: LOGGER.Service.MULTIPLE_MERGE,
        error: new Error(error.message, { cause: error }),
      });
    });
    handler.setAbortSignal(getAbortController().signal);
    handler.setOnSetupPasswordHandler(({ attempt, name }) => {
      dispatch(actions.openElement(DataElements.PASSWORD_MODAL));
      dispatch(actions.setPasswordProtectedDocumentName(name));
      dispatch(actions.setPasswordAttempts(attempt));
    });
    handler.setOnLoadDocumentComplete(() => {
      dispatch(actions.closeElement(DataElements.PASSWORD_MODAL));
      dispatch(actions.setPasswordProtectedDocumentName(''));
    });
    handler.setOnCancelPassword(() => {
      getAbortController().abort('User cancel password');
    });
    return handler;
  }, [dispatch, documents, getAbortController, goToNextStep]);

  const handleMergeDocuments = useCallback(async () => {
    dispatch(actions.closeModal());
    modalEvent.modalConfirmation(MERGE_MODAL_EVENT_PARAMS).catch(() => {});
    goToNextStep(currentStep);
    try {
      setIsLoadingDocument(true);
      const shouldBlock = await shouldBlockMergeProcess();
      if (shouldBlock) {
        setCurrentStep(MultipleMergeStep.SELECT_DOCUMENTS);
        return;
      }

      const handler = setupMergeHandler();
      setMergeHandler(handler);
      await processMerge(handler);
    } catch (error) {
      logger.logError({ error: error as Error, message: LOGGER.Service.MULTIPLE_MERGE });
    } finally {
      setIsLoadingDocument(false);
    }
  }, [
    currentStep,
    dispatch,
    goToNextStep,
    processMerge,
    setIsLoadingDocument,
    setupMergeHandler,
    shouldBlockMergeProcess,
  ]);

  const handleClickConfirm = useCallback(async () => {
    switch (currentStep) {
      case MultipleMergeStep.SELECT_DOCUMENTS: {
        handleMergeDocuments().catch(() => {});
        break;
      }
      case MultipleMergeStep.MERGING_DOCUMENTS: {
        break;
      }
      case MultipleMergeStep.SAVE_DOCUMENT: {
        await handleSaveDocument();
        break;
      }
      default:
        break;
    }
  }, [currentStep, handleMergeDocuments, handleSaveDocument]);

  return {
    currentStep,
    mergingProgress,
    saveDestination,
    openSaveToDriveModal,
    setCurrentStep,
    setSaveDestination,
    setOpenSaveToDriveModal,
    handleClickConfirm,
    goToNextStep,
    setMergingProgress,
    premiumModalContent,
    openedPremiumModal,
    openedPremiumModalHandlers,
    getResult,
  };
};
