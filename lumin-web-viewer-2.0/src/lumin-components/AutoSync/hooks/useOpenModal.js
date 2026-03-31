import React from 'react';
import { Trans } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { enqueueSnackbar } from '@libs/snackbar';

import actions from 'actions';
import selectors from 'selectors';

import { useTrackingModalEvent } from 'hooks/useTrackingModalEvent';
import { useTranslation } from 'hooks/useTranslation';

import { toggleAutoSync } from 'helpers/autoSync';

import { ModalName } from 'utils/Factory/EventCollection/ModalEventCollection';

import { AUTO_SYNC_ERROR } from 'constants/autoSyncConstant';
import { DataElements } from 'constants/dataElement';
import { ModalTypes } from 'constants/lumin-common';

export default function useOpenModal() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const currentDocument = useSelector(selectors.getCurrentDocument);

  const trackFileTooLargeModal = useTrackingModalEvent({
    modalName: ModalName.SYNC_PAGE_TOOLS_CHANGES,
  });

  const showErrorModal = (result) => {
    const errorMessage = result.message || t('viewer.autoSync.syncFailedTurnedOff');
    let message = <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{errorMessage}</div>;
    let modalSetting = {
      type: ModalTypes.ERROR,
      isFullWidthButton: true,
      message,
      confirmButtonTitle: t('common.gotIt'),
      onConfirm: () => {},
    };
    switch (result.reason) {
      case AUTO_SYNC_ERROR.NOT_FOUND: {
        dispatch(actions.setDocumentNotFound());
        break;
      }
      case AUTO_SYNC_ERROR.NO_PERMISSION: {
        message = <Trans i18nKey="viewer.errorInsufficientFilePermissions" components={{ b: <span /> }} />;
        modalSetting = {
          ...modalSetting,
          message,
          cancelButtonTitle: '',
          footerVariant: 'variant2',
          size: 'small',
          title: t('viewer.autoSync.unableSync'),
        };
        dispatch(actions.openViewerModal(modalSetting));
        break;
      }
      case AUTO_SYNC_ERROR.CANCEL_SYNC_REQUEST: {
        return;
      }
      default:
        enqueueSnackbar({
          title: t('errorMessage.unknownError'),
          message: errorMessage,
          variant: 'error',
          preventDuplicate: true,
        });
        break;
    }
    dispatch(actions.updateCurrentDocument({ enableGoogleSync: false }));
    toggleAutoSync(currentDocument._id, false);
  };

  const showForceSyncModal = (sync) => {
    const modalSetting = {
      type: ModalTypes.WARNING,
      title: t('viewer.fileTooLargeModal.title'),
      message: t('viewer.fileTooLargeModal.message'),
      onConfirm: () => {
        trackFileTooLargeModal.trackModalConfirmation();
        sync();
        dispatch(actions.openElement(DataElements.LOADING_MODAL));
      },
      onCancel: () => {
        trackFileTooLargeModal.trackModalDismiss();
        dispatch(actions.setForceReload(true));
      },
      confirmButtonTitle: t('action.sync'),
      cancelButtonTitle: t('action.discardChanges'),
    };
    dispatch(actions.closeElements(DataElements.LOADING_MODAL));
    trackFileTooLargeModal.trackModalViewed();
    dispatch(actions.openViewerModal(modalSetting));
  };

  return {
    showErrorModal,
    showForceSyncModal,
  };
}
