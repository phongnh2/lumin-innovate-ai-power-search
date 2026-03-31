import React, { useCallback, useMemo, useRef, useState } from 'react';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { MAX_DOCUMENTS_SIZE } from '../../constants';
import { MultipleMergeContext } from '../../contexts/MultipleMerge.context';
import { MultipleMergeStep, UploadStatus } from '../../enum';
import { useDocumentsManipulation } from '../../hooks/useDocumentsManipulation';
import { useLoadDocument } from '../../hooks/useLoadDocument';
import { useMultipleMergeHandler } from '../../hooks/useMultipleMergeHandler';

type Props = {
  children: React.ReactNode;
  initialDocuments: IDocumentBase[];
  onFilesPicked: (files: File[]) => Promise<void>;
  onClose: () => void;
};

const MultipleMergeProvider = ({ children, initialDocuments, onFilesPicked: handleUploadLumin, onClose }: Props) => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);

  const getAbortController = useCallback(() => {
    if (abortControllerRef.current !== null) {
      return abortControllerRef.current;
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    return abortController;
  }, []);

  const resetAbortController = useCallback(() => {
    abortControllerRef.current = new AbortController();
  }, []);

  const { documents, setDocuments, deleteDocument, handleSortDocuments, handleUploadDocuments } =
    useDocumentsManipulation({
      initialDocuments,
      setIsLoadingDocument,
    });

  useLoadDocument({
    documents,
    getAbortController,
    setDocuments,
    setIsLoadingDocument,
  });

  const {
    currentStep,
    mergingProgress,
    setCurrentStep,
    handleClickConfirm,
    goToNextStep,
    setMergingProgress,
    saveDestination,
    openSaveToDriveModal,
    setSaveDestination,
    setOpenSaveToDriveModal,
    premiumModalContent,
    openedPremiumModal,
    openedPremiumModalHandlers,
    getResult,
  } = useMultipleMergeHandler({
    setIsLoadingDocument,
    getAbortController,
    resetAbortController,
    documents,
    handleUploadLumin,
    onClose,
    setDocuments,
  });

  const isExceedMaxDocumentsSize = useMemo(
    () => documents.reduce((acc, document) => acc + document.size, 0) > MAX_DOCUMENTS_SIZE,
    [documents]
  );

  const disabledMergeButton = useMemo(
    () =>
      currentStep === MultipleMergeStep.MERGING_DOCUMENTS ||
      isExceedMaxDocumentsSize ||
      documents.length <= 1 ||
      documents.some((document) => document.status === UploadStatus.FAILED) ||
      isLoadingDocument,
    [currentStep, documents, isExceedMaxDocumentsSize, isLoadingDocument]
  );

  const contextValues = useMemo(
    () => ({
      getAbortController,
      mergingProgress,
      currentStep,
      documents,
      saveDestination,
      isExceedMaxDocumentsSize,
      isLoadingDocument,
      openSaveToDriveModal,
      setSaveDestination,
      setOpenSaveToDriveModal,
      setCurrentStep,
      setDocuments,
      deleteDocument,
      handleClickConfirm,
      handleSortDocuments,
      handleUploadDocuments,
      goToNextStep,
      setMergingProgress,
      premiumModalContent,
      openedPremiumModal,
      openedPremiumModalHandlers,
      getResult,
      onClose,
      disabledMergeButton,
    }),
    [
      getAbortController,
      mergingProgress,
      currentStep,
      documents,
      saveDestination,
      isExceedMaxDocumentsSize,
      isLoadingDocument,
      openSaveToDriveModal,
      setSaveDestination,
      setOpenSaveToDriveModal,
      setCurrentStep,
      setDocuments,
      deleteDocument,
      handleClickConfirm,
      handleSortDocuments,
      handleUploadDocuments,
      goToNextStep,
      setMergingProgress,
      premiumModalContent,
      openedPremiumModal,
      openedPremiumModalHandlers,
      getResult,
      onClose,
      disabledMergeButton,
    ]
  );

  return <MultipleMergeContext.Provider value={contextValues}>{children}</MultipleMergeContext.Provider>;
};

export default MultipleMergeProvider;
