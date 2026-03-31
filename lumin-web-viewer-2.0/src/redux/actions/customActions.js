/// <reference path="./customActions.d.ts" />
import { t } from 'i18next';

import selectors from 'selectors';

import { LocalStorageKey } from 'constants/localStorageKey';
import { ModalTypes } from 'constants/lumin-common';

export const addUploadingFiles = (files) => (dispatch) => {
  dispatch({
    type: 'ADD_UPLOADING_FILES',
    payload: { files },
  });
};

export const removeUploadingFiles = (groupIds) => (dispatch) => {
  dispatch({ type: 'REMOVE_UPLOADING_FILES', payload: { groupIds } });
};

export const resetUploadingState = () => (dispatch) => {
  dispatch({ type: 'REMOVE_ALL_UPLOADING' });
};

export const updateUploadingFile =
  ({
    groupId,
    fileData,
    thumbnail,
    status,
    progress,
    cancelToken,
    documentId,
    errorMessage,
    errorCode,
    organization,
    document,
  }) =>
  (dispatch) => {
    dispatch({
      type: 'UPDATE_UPLOADING_FILE',
      payload: {
        groupId,
        fileData,
        thumbnail,
        status,
        progress,
        cancelToken,
        documentId,
        errorMessage,
        errorCode,
        organization,
        document,
      },
    });
  };

export const retryUploadFile = (groupId) => (dispatch) => {
  dispatch({
    type: 'RETRY_UPLOADING_FILE',
    payload: {
      groupId,
    },
  });
};

export const cancelUploadFile = (groupId) => (dispatch) => {
  dispatch({
    type: 'CANCEL_UPLOADING_FILE',
    payload: {
      groupId,
    },
  });
};

export const cancelAllUploadingFiles = () => (dispatch) => {
  dispatch({
    type: 'CANCEL_ALL_UPLOADING_FILES',
    payload: {},
  });
};

export const openModal =
  ({ closeOnConfirm = true, isProcessing = false, ...other }) =>
  (dispatch) => {
    dispatch({
      type: 'OPEN_MODAL',
      payload: {
        ...other,
        closeOnConfirm,
        isProcessing,
      },
    });
  };
export const openViewerModal =
  ({ closeOnConfirm = true, isProcessing = false, ...other }) =>
  (dispatch) => {
    dispatch({
      type: 'OPEN_MODAL',
      payload: {
        ...other,
        closeOnConfirm,
        isProcessing,
        showOnlyInViewer: true,
      },
    });
  };

export const closeModal = () => (dispatch) => {
  dispatch({
    type: 'CLOSE_MODAL',
  });
};

export const updateModalProperties = (modalSettings) => (dispatch) => {
  dispatch({
    type: 'UPDATE_MODAL_PROPERTIES',
    payload: modalSettings,
  });
};

export const openPageEditMode = () => (dispatch) => {
  dispatch({
    type: 'OPEN_PAGE_EDIT_MODE',
  });
};

export const closePageEditMode = () => (dispatch) => {
  dispatch({
    type: 'CLOSE_PAGE_EDIT_MODE',
  });
};

export const changePageEditDisplayMode = (displayMode) => (dispatch) => {
  dispatch({
    type: 'CHANGE_PAGE_EDIT_DISPLAY_MODE',
    payload: {
      displayMode,
    },
  });
};

export const setActiveEditMode = () => (dispatch) => {
  dispatch({
    type: 'SET_ACTIVE_EDIT_MODE',
  });
};

export const setDeactiveEditMode = () => (dispatch) => {
  dispatch({
    type: 'SET_DEACTIVE_EDIT_MODE',
  });
};

export const updateThumbs =
  (thumbs, newlyPagesAdded = []) =>
  (dispatch) => {
    dispatch({
      type: 'UPDATE_THUMBS',
      payload: {
        thumbs,
        newlyPagesAdded,
      },
    });
  };

/**
 * @description Delete the thumbnail at the given position
 * @param {number} position - The position of the thumbnail to delete
 * @returns {Function} - The dispatch function
 * Please note that this action is only using for delete single page, the function name will be changed in the future
 */
export const deleteThumbs = (position) => (dispatch) => {
  dispatch({
    type: 'DELETE_THUMBS',
    payload: {
      position,
    },
  });
};

/**
 * @description Delete multiple thumbnails at the given positions
 * @param {number[]} positions - The positions of the thumbnails to delete
 * @returns {Function} - The dispatch function
 */
export const deleteMultipleThumbnails = (positions) => (dispatch) => {
  dispatch({
    type: 'DELETE_MULTIPLE_THUMBS',
    payload: {
      positions,
    },
  });
};

export const disableThumb = (position) => (dispatch) => {
  dispatch({
    type: 'DISABLE_THUMB',
    payload: {
      position,
    },
  });
};

export const enableThumb = (position) => (dispatch) => {
  dispatch({
    type: 'ENABLE_THUMB',
    payload: {
      position,
    },
  });
};

export const addThumbs = (thumbs, position) => (dispatch) => {
  dispatch({
    type: 'ADD_THUMBS',
    payload: {
      thumbs,
      position,
    },
  });
};

export const insertBlankThumbnails =
  ({ blankThumbnails, from }) =>
  (dispatch) => {
    dispatch({
      type: 'INSERT_BLANK_THUMBS',
      payload: {
        blankThumbnails,
        from,
      },
    });
  };

export const setNewlyPagesAdded = (newlyPagesAdded) => (dispatch) => {
  dispatch({
    type: 'SET_NEWLY_PAGES_ADDED',
    payload: {
      newlyPagesAdded,
    },
  });
};

export const setCareTaker = (careTaker) => (dispatch) => {
  dispatch({
    type: 'SET_CARE_TAKER',
    payload: {
      careTaker,
    },
  });
};

export const setPurchaseState = (isPurchasing) => (dispatch) => {
  dispatch({
    type: 'SET_PURCHASE_STATE',
    payload: {
      isPurchasing,
    },
  });
};

export const setOwnedFilter = (ownedFilter) => (dispatch) => {
  dispatch({
    type: 'SET_OWNED_FILTER',
    payload: {
      ownedFilter,
    },
  });
};

export const setThemeMode = (themeMode) => (dispatch) => {
  dispatch({
    type: 'SET_THEME_MODE',
    payload: {
      themeMode,
    },
  });
  window.localStorage.setItem('themeMode', themeMode);
};

export const setLastModifiedFilter = (lastModifiedFilter) => (dispatch) => {
  dispatch({
    type: 'SET_LAST_MODIFIED_FILTER',
    payload: {
      lastModifiedFilter,
    },
  });
};

export const setIsShowTopBar = (isShowTopBar) => (dispatch) => {
  dispatch({
    type: 'SET_IS_SHOW_TOP_BAR',
    payload: {
      isShowTopBar,
    },
  });
};

export const setIsShowToolbarTablet = (isShowToolbarTablet) => (dispatch) => {
  dispatch({
    type: 'SET_IS_SHOW_TOOLBAR_TABLET',
    payload: {
      isShowToolbarTablet,
    },
  });
};

export const setIsShowBannerAds = (isShowBannerAds) => (dispatch) => {
  dispatch({
    type: 'SET_IS_SHOW_BANNER_ADS',
    payload: {
      isShowBannerAds,
    },
  });
};

export const setIsShowTopViewerBanner = (isShowTopViewerBanner) => (dispatch) => {
  dispatch({
    type: 'SET_IS_SHOW_TOP_VIEWER_BANNER',
    payload: {
      isShowTopViewerBanner,
    },
  });
};

export const setUserSignatures = (userSignatures) => (dispatch) => {
  dispatch({
    type: 'SET_USER_SIGNATURES',
    payload: {
      userSignatures,
    },
  });
};

export const addSignatures = (newSignatures) => (dispatch) => {
  dispatch({
    type: 'ADD_USER_SIGNATURES',
    payload: {
      newSignatures,
    },
  });
};

export const deleteUserRemoteSignature = (signatureRemoteId) => (dispatch) => {
  dispatch({
    type: 'DELETE_USER_REMOTE_SIGNATURE',
    payload: {
      remoteId: signatureRemoteId,
    },
  });
};

export const updateUserSignatures = (updatedSignatures) => (dispatch) => {
  dispatch({
    type: 'UPDATE_USER_SIGNATURES',
    payload: {
      updatedSignatures,
    },
  });
};

export const updateSignatureById = (id, signature) => (dispatch) => {
  dispatch({
    type: 'UPDATE_SIGNATURE_BY_ID',
    payload: {
      signature,
      id,
    },
  });
};

export const reorderSignature = (fromIndex, toIndex) => (dispatch) => {
  dispatch({
    type: 'REORDER_USER_SIGNATURES',
    payload: {
      fromIndex,
      toIndex,
    },
  });
};

export const setSignatureStatus = (status) => (dispatch) => {
  dispatch({
    type: 'SET_USER_SIGNATURE_STATUS',
    payload: {
      status,
    },
  });
};

export const openErrorModal = () => (dispatch) => {
  dispatch({
    type: 'OPEN_MODAL',
    payload: {
      type: ModalTypes.ERROR,
      title: t('common.fail'),
      message: t('memberPage.addMemberModal.messageInviteFailed'),
      cancelButtonTitle: t('common.cancel'),
      onCancel: () => {},
      confirmButtonTitle: t('common.reloadNow'),
      onConfirm: () => window.location.reload(),
      className: 'MaterialDialog__custom',
    },
  });
};

export const setBillingWarning = (clientId, data) => (dispatch) => {
  dispatch({
    type: 'SET_BILLING_WARNING',
    payload: {
      clientId,
      data,
    },
  });
};
export const deleteBillingBanner = (clientId, bannerType) => (dispatch) => {
  dispatch({
    type: 'DELETE_BILLING_BANNER',
    payload: {
      clientId,
      bannerType,
    },
  });
};

export const openDialog = () => (dispatch) => {
  dispatch({
    type: 'OPEN_DIALOG',
  });
};

export const closeDialog = () => (dispatch) => {
  dispatch({
    type: 'CLOSE_DIALOG',
  });
};

export const updateDialogStatus = (isOpen) => (dispatch, getState) => {
  const state = getState();
  const isDialogOpen = selectors.getIsDialogOpen(state);
  if (isOpen === isDialogOpen) {
    return;
  }
  dispatch({
    type: 'UPDATE_DIALOG_STATUS',
    payload: { isOpen },
  });
};

export const disablePwaDownloadBanner = () => (dispatch) => {
  dispatch({
    type: 'DISABLE_PWA_DOWNLOAD_BANNER',
  });
  localStorage.setItem(LocalStorageKey.DISABLE_PWA_DOWNLOAD, 'true');
};

export const enablePwaDownloadBanner = () => (dispatch) => {
  dispatch({
    type: 'ENABLE_PWA_DOWNLOAD_BANNER',
  });
  localStorage.removeItem(LocalStorageKey.DISABLE_PWA_DOWNLOAD);
};

export const updateEventTrackingQueue = (event) => (dispatch) => {
  dispatch({
    type: 'UPDATE_EVENT_TRACKING_QUEUE',
    payload: { event },
  });
};

export const resetEventTrackingQueue = () => (dispatch) => {
  dispatch({
    type: 'RESET_EVENT_TRACKING_QUEUE',
  });
};

export const scrollToPageInGridViewMode = (gridViewMode) => (dispatch) => {
  dispatch({
    type: 'SCROLL_TO_PAGE_GRID_VIEW_MODE',
    payload: {
      gridViewMode,
    },
  });
};

export const resetGridViewMode = () => (dispatch) => {
  dispatch({
    type: 'RESET_GRID_VIEW_MODE',
  });
};

export const loadAWSPinpointSuccess = () => (dispatch) =>
  dispatch({
    type: 'LOAD_AWS_PINPOINT_SUCCESS',
  });

export const setCurrentContentBeingEdited = ({ content, annotation }) => ({
  type: 'SET_CURRENT_CONTENT_BEING_EDITED',
  payload: { content, annotation },
});

export const clearCurrentContentBeingEdited = () => ({
  type: 'CLEAR_CURRENT_CONTENT_BEING_EDITED',
  payload: {},
});

export const updateCurrentContentBeingEdited = (content) => ({
  type: 'UPDATE_CURRENT_CONTENT_BEING_EDITED',
  payload: { content },
});

export const openToolModalByType = (modalType) => ({
  type: 'OPEN_TOOL_MODAL_BY_TYPE',
  payload: modalType,
});

export const closeToolModal = () => ({
  type: 'CLOSE_TOOL_MODAL_BY_TYPE',
});

export const setShowBanner = (bannerName, isShow) => (dispatch) => {
  dispatch({
    type: 'SET_SHOW_BANNER',
    payload: { bannerName, isShow },
  });
};

export const setShowIntegrateLuminSignModal =
  (modalName, isShow = false) =>
  (dispatch) => {
    dispatch({
      type: 'SET_SHOW_INTEGRATE_LUMIN_SIGN_MODAL',
      payload: { modalName, isShow },
    });
  };

export const setDisplayQRCodeDialog = (shouldDisplay) => (dispatch) => {
  dispatch({
    type: 'SET_DISPLAY_QR_CODE_DIALOG',
    payload: {
      shouldDisplay,
    },
  });
};

export const setToolAutoEnabled =
  (toolId = '') =>
  (dispatch) => {
    dispatch({
      type: 'SET_TOOL_AUTO_ENABLED',
      payload: { toolId },
    });
  };

export const setForceReloadVersion = (forceReloadVersion) => (dispatch) => {
  dispatch({ type: 'FORCE_RELOAD_VERSION', payload: { forceReloadVersion } });
};

export const setCanModifyDriveContent = (canModifyDriveContent) => (dispatch) => {
  dispatch({
    type: 'SET_CAN_MODIFY_DRIVE_CONTENT',
    payload: { canModifyDriveContent },
  });
};

export const setDisplayIntroduceAGBanner = (isShow) => (dispatch) => {
  dispatch({
    type: 'SET_DISPLAY_INTRODUCE_AG_BANNER',
    payload: { isShow },
  });
};

export const setBackDropMessage =
  (message, configs = {}) =>
  (dispatch) => {
    dispatch({
      type: 'SET_BACK_DROP_MESSAGE',
      payload: { message, configs },
    });
  };

export const setIsWaitingForEditBoxes = (isWaitingForEditBoxes) => ({
  type: 'SET_IS_WAITING_FOR_EDIT_BOXES',
  payload: { isWaitingForEditBoxes },
});

export const setShouldShowInviteCollaboratorsModal = (shouldShowInviteCollaboratorsModal) => ({
  type: 'SET_SHOULD_SHOW_INVITE_COLLABORATORS_MODAL',
  payload: { shouldShowInviteCollaboratorsModal },
});

export const setShowTrialModal = (showTrialModal) => ({
  type: 'SET_SHOW_TRIAL_MODAL',
  payload: { showTrialModal },
});

export const setError = (error) => ({
  type: 'SET_ERROR',
  payload: { error },
});
