import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { DestinationLocation } from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import documentServices from 'services/documentServices';

import fileUtil from 'utils/file';
import { getLinearizedDocumentFile } from 'utils/getFileService';

import { documentSyncActions } from 'features/Document/slices';

import { ModalTypes } from 'constants/lumin-common';
import { Routers } from 'constants/Routers';

export const useConflictVersionHandler = () => {
  const dispatch = useDispatch();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { t } = useTranslation();
  const reloadCallbackRef = useRef<() => void>(null);
  const backDropMessage = useSelector(selectors.getBackDropMessage);

  const openCopiedDocument = (documentId: string) => {
    window.open(`${Routers.VIEWER}/${documentId}`, '_blank');
    reloadCallbackRef.current();
  };

  const handleSaveACopy = useCallback(async () => {
    if (!currentDocument) {
      return;
    }
    const copiedFile = await getLinearizedDocumentFile(currentDocument.name);
    const copyToFolder = currentDocument.belongsTo.type === DestinationLocation.FOLDER;
    let copiedDocumentId = null;
    const newDocumentName = `Copy of ${fileUtil.getFilenameWithoutExtension(currentDocument.name)}`;
    if (copyToFolder) {
      const { _id } = await documentServices.duplicateDocumentToFolder({
        documentId: currentDocument._id,
        documentName: newDocumentName,
        folderId: currentDocument.folderId,
        notifyUpload: false,
        file: copiedFile,
      });
      copiedDocumentId = _id;
    }
    const destinationId =
      currentDocument.belongsTo.type === DestinationLocation.PERSONAL
        ? currentDocument.belongsTo.workspaceId
        : currentDocument.belongsTo.location._id;
    const destinationType = currentDocument.belongsTo.type;
    const { _id } = await documentServices.duplicateDocument({
      documentId: currentDocument._id,
      documentName: newDocumentName,
      destinationId,
      destinationType,
      notifyUpload: false,
      file: copiedFile,
    });
    copiedDocumentId = _id;

    dispatch(
      actions.updateModalProperties({
        isProcessing: false,
        title: t('viewer.googleDriveDocumentModal.copiedSuccessModal.title'),
        message: t('viewer.googleDriveDocumentModal.copiedSuccessModal.message'),
        onCancel: () => reloadCallbackRef.current(),
        onConfirm: () => openCopiedDocument(copiedDocumentId),
        cancelButtonTitle: t('viewer.googleDriveDocumentModal.copiedSuccessModal.cancelButtonTitle'),
        confirmButtonTitle: t('viewer.googleDriveDocumentModal.copiedSuccessModal.confirmButtonTitle'),
        closeOnConfirm: true,
        footerVariant: 'variant3',
      })
    );
  }, [
    currentDocument?._id,
    currentDocument?.belongsTo?.location?._id,
    currentDocument?.belongsTo?.type,
    currentDocument?.belongsTo?.workspaceId,
    currentDocument?.folderId,
    currentDocument?.name,
    dispatch,
    t,
  ]);

  const { mutateAsync: duplicateDocument, isLoading: isCopying } = useMutation({
    mutationKey: ['duplicateDocument', currentDocument?._id],
    mutationFn: handleSaveACopy,
  });

  const onDiscardChanges = () => {
    reloadCallbackRef.current();
    dispatch(actions.closeModal());
  };

  const getModalProps = () => ({
    type: ModalTypes.WARNING,
    title: t('viewer.googleDriveDocumentOutdated'),
    message: t('viewer.googleDriveDocumentOutdatedMessage'),
    cancelButtonTitle: t('action.discardChanges'),
    confirmButtonTitle: t('common.saveACopy'),
    disableBackdropClick: true,
    disableEscapeKeyDown: true,
    onCancel: onDiscardChanges,
    onConfirm: () => duplicateDocument(),
    footerVariant: 'variant2',
    closeOnConfirm: false,
  });

  const onUpdatedTextContentByRemoteId = ({
    increaseVersion,
    status,
    documentId: documentIdParam,
    reloadCallback,
  }: {
    increaseVersion: boolean;
    status: string;
    documentId: string;
    reloadCallback: () => void;
  }) => {
    reloadCallbackRef.current = reloadCallback;
    const { _id: documentId } = currentDocument || {};
    const displayWarningModal = documentIdParam !== documentId && increaseVersion;
    /**
     * Handles notifications when a document has been updated on Google Drive.
     * This event is triggered when another user uploads a new version of the same
     * Google Drive document (identified by remoteId), but not when changes are made
     * to the current document instance (different documentId).
     * When this happens, we notify the user that their version is outdated and
     * prompt them to reload to get the latest version or copy to a new document.
     */
    if (!displayWarningModal) {
      if (backDropMessage && !status) {
        dispatch(actions.setBackDropMessage(null));
        dispatch(documentSyncActions.reset());
      }
      return;
    }
    if (status === 'syncing') {
      dispatch(actions.setBackDropMessage(t('viewer.documentIsUpdating')));
      dispatch(documentSyncActions.setIsSyncing({ isSyncing: true, increaseVersion: true }));
      return;
    }
    dispatch(actions.setBackDropMessage(null));
    dispatch(documentSyncActions.reset());
    dispatch(actions.openViewerModal(getModalProps()));
  };

  useEffect(() => {
    if (isCopying) {
      dispatch(
        actions.updateModalProperties({
          isProcessing: true,
        })
      );
    }
  }, [dispatch, isCopying]);

  return {
    onUpdatedTextContentByRemoteId,
    isCopying,
    duplicateDocument,
  };
};
