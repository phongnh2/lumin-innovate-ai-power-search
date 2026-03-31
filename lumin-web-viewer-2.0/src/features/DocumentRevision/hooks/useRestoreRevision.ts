import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { batch, useDispatch, useSelector } from 'react-redux';

import { enqueueSnackbar } from '@libs/snackbar';
import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import useSessionInternalStorageChecker from 'luminComponents/HeaderLumin/hooks/useSessionInternalStorageChecker';

import { useShallowSelector } from 'hooks/useShallowSelector';

import { socketService } from 'services/socketServices';

import { eventTracking } from 'utils/recordUtil';

import { OutlineStoreUtils } from 'features/Outline/utils/outlineStore.utils';

import { documentStorage } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { ErrorCode } from 'constants/lumin-common';
import { SOCKET_EMIT } from 'constants/socketConstant';

import { useDocumentVersioningContext } from './useDocumentVersioningContext';
import { LoadDocumentResult, useLoadDocumentVersion } from './useLoadDocumentVersion';
import { useOpenExpiredVersionModal } from './useOpenExpiredVersionModal';
import { socket } from '../../../socket';
import { IDocumentRevision } from '../interface';

export function useRestoreRevision({ documentRevisions }: { documentRevisions: IDocumentRevision[] }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const isLoadingDocument = useSelector(selectors.isLoadingDocument);

  const { handleInternalStoragePermission } = useSessionInternalStorageChecker();
  const { loadDocumentVersion } = useLoadDocumentVersion();
  const { revisionService, activeVersion, passwordToRestoreRef } = useDocumentVersioningContext();
  const { openExpiredVersionModal } = useOpenExpiredVersionModal();

  const [isLoadingRestore, setIsLoadingRestore] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);

  const [restoringRevision, setRestoringRevision] = useState<IDocumentRevision>({} as IDocumentRevision);

  const handleCloseModal = () => setIsModalOpen(false);

  const handleCloseRevisionMode = () => {
    core.disableReadOnlyMode();
    core
      .getAnnotationsList()
      .filter((annot) => annot instanceof window.Core.Annotations.WidgetAnnotation)
      .forEach((annot: Core.Annotations.WidgetAnnotation & { styledInnerElement: () => void }) =>
        annot.styledInnerElement()
      );
    dispatch(actions.closePreviewOriginalVersionMode());
    dispatch(actions.closeModal());
    dispatch(actions.setToolbarValue(LEFT_SIDE_BAR_VALUES.POPULAR.value));
    handleCloseModal();
    core.updateView();
    setIsLoadingRestore(false);
    enqueueSnackbar({
      variant: 'success',
      message: t('viewer.restoreOriginalVersionModal.restoreSuccess'),
    });
  };

  const restoreByRevision = async ({ password }: { password?: string }): Promise<void> => {
    try {
      if (currentDocument.service === documentStorage.s3) {
        socketService.modifyDocumentContent(currentDocument._id, { status: 'preparing', increaseVersion: true });
      }
      const { error, success } = await revisionService.restore({
        versionId: restoringRevision._id,
        handleInternalStoragePermission,
        currentDocument,
        password,
      });
      if (!success) {
        if (error === ErrorCode.Common.NOT_FOUND) {
          openExpiredVersionModal();
        }
        setIsLoadingRestore(false);
        handleCloseModal();
        return;
      }
      await OutlineStoreUtils.initialOutlines({ currentDocument });
      handleCloseRevisionMode();
      eventTracking(UserEventConstants.EventType.DOCUMENT_RESTORED, { source: currentDocument.service }) as unknown;
      batch(() => {
        dispatch(actions.setIsToolPropertiesOpen(false));
        dispatch(actions.setToolPropertiesValue(TOOL_PROPERTIES_VALUE.DEFAULT));
      });
      socket.emit(SOCKET_EMIT.CLEAR_ANNOTATION_AND_MANIPULATION_OF_DOCUMENT, currentDocument._id);
      socket.emit(SOCKET_EMIT.RESTORE_DOCUMENT, currentDocument);
    } catch (error: unknown) {
      socketService.modifyDocumentContent(currentDocument._id, { status: 'failed', increaseVersion: true });
      revisionService.loggerError({ error });
    }
  };

  const onClickRestore = ({ revisionId }: { revisionId: string }) => {
    if (!isLoadingDocument) {
      setRestoringRevision(documentRevisions.filter((el: IDocumentRevision) => el._id === revisionId)[0]);
      handleOpenModal();
    }
  };

  const onConfirmRestore = async () => {
    if (activeVersion !== restoringRevision._id) {
      handleCloseModal();
      const { status } = await loadDocumentVersion(restoringRevision);
      if (status === LoadDocumentResult.Failed) {
        return;
      }
    }
    handleOpenModal();
    setIsLoadingRestore(true);
    restoreByRevision({
      password: passwordToRestoreRef.current,
    }).catch(() => {});
  };

  return {
    onClickRestore,
    onConfirmRestore,
    handleCloseModal,
    restoringRevision,
    isModalOpen,
    isLoadingRestore,
  };
}
