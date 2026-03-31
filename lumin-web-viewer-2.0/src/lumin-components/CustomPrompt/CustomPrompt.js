import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { useBlocker, matchPath } from 'react-router';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { useAutoSync, useLatestRef, useTranslation } from 'hooks';

import { pageContentUpdatedListener } from 'helpers/pageContentUpdatedListener';

import { onCancelSaveEditText, onConfirmSaveEditedText } from 'utils/editPDF';

import { useSyncAnnotationsStore } from 'features/Annotation/hooks/useSyncAnnotationsStore';

import { AUTO_SYNC_CHANGE_TYPE } from 'constants/autoSyncConstant';
import DataElements from 'constants/dataElement';
import { LANGUAGES } from 'constants/language';
import { ModalTypes, STORAGE_TYPE } from 'constants/lumin-common';

import useCheckPromptCondition from './useCheckPromptCondition';

function CustomPrompt() {
  const { t } = useTranslation();
  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
  const { shouldPrompWhenUnloadWindowRef, trackModalRef, shouldBlock, hasChangeToSync } =
    useCheckPromptCondition(currentDocument);
  const isInContentEditMode = useSelector(selectors.isInContentEditMode);
  const abortController = useSyncAnnotationsStore((state) => state.abortController);

  const dispatch = useDispatch();
  const blocker = useBlocker(shouldBlock);
  const blockerRef = useLatestRef(blocker);

  useAutoSync({
    onSyncSuccess: ({ action }) => {
      if (action.includes(AUTO_SYNC_CHANGE_TYPE.EDIT_PDF) && blockerRef.current.state === 'blocked') {
        blockerRef.current.proceed();
      }
    },
    onFailed: (action) => {
      if (action.includes(AUTO_SYNC_CHANGE_TYPE.EDIT_PDF) && blockerRef.current.state === 'blocked') {
        blockerRef.current.reset();
      }
    },
  });

  const getSyncWarningModalMessage = () => {
    if (currentDocument.isSystemFile) {
      return t('viewer.leaveLuminModal.message');
    }
    return (
      <Trans i18nKey="viewer.modalLeaveWithoutSyncing.message"/>
    );
  };

  const getCustomPromptModalSetting = (navigateBlocker) => {
    if (isInContentEditMode) {
      core.deselectAllAnnotations();
      return {
        type: ModalTypes.WARNING,
        title: t('modal.leavingEditMode'),
        message: <p>{t('modal.savedYourEdit')}</p>,
        confirmButtonTitle: t('action.save'),
        cancelButtonTitle: t('action.discardChanges'),
        closeOnConfirm: false,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        onCancel: async () => {
          trackModalRef.current.trackModalDismiss();
          await onCancelSaveEditText({ forceReload: false });
          abortController?.abort();
          navigateBlocker.proceed();
        },
        onConfirm: async () => {
          trackModalRef.current.trackModalConfirmation();
          dispatch(actions.updateModalProperties({ isProcessing: true }));
          await onConfirmSaveEditedText({
            isExitFromViewerWithoutChange: !hasChangeToSync,
            preventRefetchDocument: true,
            asyncStorageSync: false,
          });
          if (currentDocument.service !== STORAGE_TYPE.GOOGLE || !hasChangeToSync) {
            navigateBlocker.proceed();
          }
        },
      };
    }

    return {
      type: ModalTypes.WARNING,
      title: t(currentDocument.isSystemFile ? 'viewer.leaveLuminModal.title' : 'viewer.modalLeaveWithoutSyncing.title'),
      message: getSyncWarningModalMessage(),
      confirmButtonTitle: t('viewer.modalLeaveWithoutSyncing.confirmButton'),
      cancelButtonTitle: t('common.leave'),
      size: 'medium',
      onCancel: () => {
        if (isInContentEditMode) {
          core.getContentEditManager().endContentEditMode();
        }
        abortController?.abort();
        navigateBlocker.proceed();
        trackModalRef.current.trackModalDismiss();
      },
      onConfirm: () => {
        trackModalRef.current.trackModalConfirmation();
        navigateBlocker.reset();
      },
    };
  };

  const handleShowCustomPrompt = async (navigateBlocker) => {
    const modalSetting = getCustomPromptModalSetting(navigateBlocker);

    if (pageContentUpdatedListener.isProcessingUpdateContent()) {
      dispatch(actions.openElement(DataElements.LOADING_MODAL));
      await pageContentUpdatedListener.waitForUpdateContent();
      dispatch(actions.closeElement(DataElements.LOADING_MODAL));
    }
    dispatch(actions.openViewerModal(modalSetting));

    trackModalRef.current.trackModalViewed();
  };

  React.useEffect(() => {
    if (blocker.state === 'blocked') {
      const pathNameRegex = new RegExp(`^/(${Object.values(LANGUAGES).join('|')})/`);
      const pathName = blocker.location.pathname.replace(pathNameRegex, '/');
      const match = matchPath({ path: `viewer/${currentDocument._id}`, end: false }, pathName);
      const templateMatch = matchPath({ path: `template/${currentDocument._id}`, end: false }, pathName);
      if (!match && !templateMatch) {
        handleShowCustomPrompt(blocker);
      }
    }
  }, [blocker]);

  useEffect(() => {
    const onWindowBeforeUnload = (e) => {
      if (!window.forceOut && shouldPrompWhenUnloadWindowRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', onWindowBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onWindowBeforeUnload);
    };
  }, []);

  return undefined;
}

CustomPrompt.propTypes = {
  isShowPromptUserInViewer: PropTypes.bool,
  forceReload: PropTypes.bool,
};

CustomPrompt.defaultProps = {
  isShowPromptUserInViewer: false,
  forceReload: false,
};

export default CustomPrompt;
