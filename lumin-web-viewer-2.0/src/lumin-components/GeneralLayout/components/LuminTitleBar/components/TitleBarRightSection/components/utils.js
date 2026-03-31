import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';
import { socket } from 'src/socket';

import actions from 'actions';
import core from 'core';

import toastUtils from 'luminComponents/GeneralLayout/utils/toastUtils';

import { documentGraphServices } from 'services/graphServices';

import { OutlineStoreUtils } from 'features/Outline/utils/outlineStore.utils';

import { AUTO_SYNC_CHANGE_TYPE, AUTO_SYNC_STATUS } from 'constants/autoSyncConstant';
import { SHARE_TYPE } from 'constants/customConstant';
import { SHARE_LINK_TYPE, DOCUMENT_TYPE } from 'constants/documentConstants';
import { SOCKET_EMIT } from 'constants/socketConstant';

export const handleShowRestoreOriginalModal = ({ trackModalViewed, handleOpenModal }) => {
  trackModalViewed();
  handleOpenModal();
};

export const handleClosePreviewOriginalVersionMode = async ({
  action,
  isDriveStorage,
  currentDocumentRef,
  bookmarkIns,
  t,
  dispatch,
  failedMessageToast,
  handleCloseModal = (f) => f,
}) => {
  if (isDriveStorage && (!action || !action.includes(AUTO_SYNC_CHANGE_TYPE.RESTORE_ORIGINAL_VERSION))) {
    return;
  }
  const documentId = currentDocumentRef.current._id;
  try {
    await documentGraphServices.restoreOriginalVersion(documentId);
    core.disableReadOnlyMode();
    core
      .getAnnotationsList()
      .filter((annot) => annot instanceof window.Core.Annotations.WidgetAnnotation)
      .forEach((annot) => annot.styledInnerElement());
    dispatch(actions.closePreviewOriginalVersionMode());
    const newDocumentData = { ...currentDocumentRef.current, bookmarks: null, metadata: {} };
    dispatch(actions.setCurrentDocument(newDocumentData));
    await OutlineStoreUtils.initialOutlines({ currentDocument: newDocumentData });
    bookmarkIns.bookmarksUser = {};
    core.updateView();
    socket.emit(SOCKET_EMIT.CLEAR_ANNOTATION_AND_MANIPULATION_OF_DOCUMENT, documentId);
    dispatch(actions.closeModal());
    dispatch(actions.setToolbarValue(LEFT_SIDE_BAR_VALUES.POPULAR.value));
    handleCloseModal();
    const restoreSuccessToast = {
      title: t('viewer.restoreOriginalVersionModal.restoreSuccess'),
      top: 130,
    };
    toastUtils.success(restoreSuccessToast);
  } catch (err) {
    dispatch(actions.closeModal());
    handleCloseModal();
    const restoreFailedToast = {
      title: t(failedMessageToast),
      top: 130,
    };
    toastUtils.error(restoreFailedToast);
  }
};

export const getCurrentShareSetting = (currentDocument, sharedCount) => {
  if (!currentDocument) return SHARE_TYPE.PRIVATE;
  const {
    documentType,
    shareSetting: { linkType },
  } = currentDocument;

  if (linkType === SHARE_LINK_TYPE.ANYONE) {
    return SHARE_TYPE.PUBLIC;
  }

  switch (documentType) {
    case DOCUMENT_TYPE.PERSONAL: {
      if (sharedCount > 0) {
        return SHARE_TYPE.SPECIFIC_USER;
      }
      return SHARE_TYPE.PRIVATE;
    }

    case DOCUMENT_TYPE.ORGANIZATION: {
      return SHARE_TYPE.ORGANIZATION;
    }

    case DOCUMENT_TYPE.ORGANIZATION_TEAM: {
      return SHARE_TYPE.ORGANIZATION_TEAM;
    }

    default: {
      return SHARE_TYPE.PRIVATE;
    }
  }
};

export const getAutoSyncStatusInfo = ({ t, autoSyncStatus, detail = null }) => {
  switch (autoSyncStatus) {
    case AUTO_SYNC_STATUS.NOT_SYNCED:
      return {
        title: t('viewer.autoSync.fileNotSave'),
        content: t('viewer.autoSync.turnOn'),
        detail,
        iconContent: 'auto-sync-state-warning',
      };
    case AUTO_SYNC_STATUS.SYNCING:
      return {
        title: t('viewer.autoSync.saving'),
        content: t('viewer.autoSync.editBeingSaved'),
        detail,
        iconContent: 'syncing',
      };
    case AUTO_SYNC_STATUS.SAVED:
      return {
        title: t('viewer.autoSync.complete'),
        content: t('viewer.autoSync.saved'),
        detail,
        iconContent: 'auto-sync-success',
      };
    case AUTO_SYNC_STATUS.FAILED:
      return {
        title: t('common.fileNotSynced'),
        content: t('viewer.autoSync.troubles'),
        detail,
        iconContent: 'auto-sync-disable',
      };
    default:
      return null;
  }
};
