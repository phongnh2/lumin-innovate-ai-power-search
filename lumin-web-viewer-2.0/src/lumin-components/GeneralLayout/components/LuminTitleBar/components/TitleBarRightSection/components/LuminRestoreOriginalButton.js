import PropTypes from 'prop-types';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import Modal from '@new-ui/general-components/Modal';

import actions from 'actions';
import selectors from 'selectors';

import Bookmarks from 'screens/Viewer/bookmarks';

import {
  handleShowRestoreOriginalModal,
  handleClosePreviewOriginalVersionMode,
} from 'lumin-components/GeneralLayout/components/LuminTitleBar/components/TitleBarRightSection/components/utils';
import ToolButtonPopper from 'lumin-components/ToolButtonPopper';
import toastUtils from 'luminComponents/GeneralLayout/utils/toastUtils';

import { useTranslation, useTrackingModalEvent, useAutoSync } from 'hooks';

import { ModalName } from 'utils/Factory/EventCollection/ModalEventCollection';

import { AUTO_SYNC_CHANGE_TYPE } from 'constants/autoSyncConstant';
import { TOOLS_TRIGGER_CLOSE_RESTORE_ORIGINAL } from 'constants/dataElement';
import { DOCUMENT_RESTORE_ORIGINAL_PERMISSION, documentStorage } from 'constants/documentConstants';
import ToolsName from 'constants/toolsName';

import RestoreOriginalModalContent from './RestoreOriginalModalContent';
import * as Styled from '../TitleBarRightSection.styled';

const LuminRestoreOriginalButton = (props) => {
  const { isLoadingDocument } = props;
  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
  const currentDocumentRef = useRef(currentDocument);
  const isOffline = useSelector(selectors.isOffline);
  const { trackModalConfirmation, trackModalDismiss, trackModalViewed } = useTrackingModalEvent({
    modalName: ModalName.RESTORE_ORIGINAL_VERSION,
  });
  const dispatch = useDispatch();
  const [openPopper, setOpenPopper] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setIsLoading] = useState(false);

  const { t } = useTranslation();
  const bookmarkIns = new Bookmarks();
  const isDriveStorage = currentDocument.service === documentStorage.google;
  const failedMessageToast = 'viewer.restoreOriginalVersionModal.restoreFail';
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const startLoading = () => {
    setIsLoading(true);
  };
  const endLoading = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    currentDocumentRef.current = currentDocument;
  }, [currentDocument]);

  const closePreviewOriginalVersionMode = useCallback(handleClosePreviewOriginalVersionMode, []);

  const { handleSyncFile } = useAutoSync({
    onSyncSuccess: ({ action }) => {
      const _handleCloseModal = () => {
        handleCloseModal();
        endLoading();
      };
      closePreviewOriginalVersionMode({
        action,
        isDriveStorage,
        currentDocumentRef,
        bookmarkIns,
        t,
        dispatch,
        failedMessageToast,
        handleCloseModal: _handleCloseModal,
      });
    },
    onError: (action) => {
      if (!action || !action.includes(AUTO_SYNC_CHANGE_TYPE.RESTORE_ORIGINAL_VERSION)) {
        return;
      }
      const restoreFailedToast = {
        message: t(failedMessageToast),
        top: 130,
      };
      endLoading();
      toastUtils.error(restoreFailedToast);
    },
  });

  const togglePopper = () => {
    setOpenPopper((open) => !open);
  };

  const closePopper = () => {
    setOpenPopper(false);
  };

  const handleRestoreOriginalVersion = async () => {
    trackModalConfirmation();
    startLoading();
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
      })
    );
    if (currentDocument.service === documentStorage.google) {
      await handleSyncFile(`${AUTO_SYNC_CHANGE_TYPE.RESTORE_ORIGINAL_VERSION}:${currentDocument._id}`);
    } else {
      await closePreviewOriginalVersionMode({
        isDriveStorage,
        currentDocumentRef,
        bookmarkIns,
        t,
        dispatch,
        failedMessageToast,
        handleCloseModal,
      });
    }
  };

  const handleClick = () => {
    if (currentDocument.backupInfo.restoreOriginalPermission !== DOCUMENT_RESTORE_ORIGINAL_PERMISSION.RESTORE) {
      togglePopper();
      dispatch(actions.closeElements(TOOLS_TRIGGER_CLOSE_RESTORE_ORIGINAL));
      return;
    }
    handleShowRestoreOriginalModal({
      trackModalDismiss,
      trackModalViewed,
      t,
      currentDocument,
      dispatch,
      handleRestoreOriginalVersion,
      isDriveStorage,
      handleOpenModal,
    });
  };

  const getOtherModalProps = () => {
    if (loading) {
      return { footerVariant: null, footer: null, size: 'small' };
    }
    return { footerVariant: 'variant3', size: 'medium' };
  };

  const onCloseModal = () => {
    trackModalDismiss();
    handleCloseModal();
  };

  return (
    <>
      <ToolButtonPopper openPopper={openPopper} closePopper={closePopper} toolName={ToolsName.RESTORE_ORIGINAL}>
        <Styled.OriginalButton
          size="md"
          variant="tonal"
          onClick={handleClick}
          disabled={isLoadingDocument || isOffline}
        >
          {t('viewer.restoreOriginalVersionModal.restoreButton')}
        </Styled.OriginalButton>
      </ToolButtonPopper>

      <Modal
        open={isModalOpen}
        onPrimaryClick={handleRestoreOriginalVersion}
        onClose={onCloseModal}
        onSecondaryClick={onCloseModal}
        primaryText={t('viewer.restoreOriginalVersionModal.confirm')}
        secondaryText={t('action.cancel')}
        {...getOtherModalProps()}
      >
        <RestoreOriginalModalContent loading={loading} />
      </Modal>
    </>
  );
};

LuminRestoreOriginalButton.propTypes = {
  isLoadingDocument: PropTypes.bool.isRequired,
};

export default LuminRestoreOriginalButton;
