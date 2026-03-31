// Mock dependencies
const mockGetIsDialogOpen = jest.fn();

jest.mock('selectors', () => ({
  __esModule: true,
  default: {
    getIsDialogOpen: (state: any) => mockGetIsDialogOpen(state),
  },
}));

jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

jest.mock('constants/localStorageKey', () => ({
  LocalStorageKey: {
    DISABLE_PWA_DOWNLOAD: 'disablePwaDownload',
  },
}));

jest.mock('constants/lumin-common', () => ({
  ModalTypes: {
    ERROR: 'ERROR',
  },
}));

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockLocalStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockLocalStorage[key];
    },
  },
  writable: true,
});

import * as customActions from '../customActions';

describe('customActions', () => {
  let dispatch: jest.Mock;
  let getState: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = jest.fn();
    getState = jest.fn();
    // Clear localStorage mock
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
  });

  describe('addUploadingFiles', () => {
    it('should dispatch ADD_UPLOADING_FILES', () => {
      const files = [{ name: 'file1.pdf' }];
      customActions.addUploadingFiles(files)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'ADD_UPLOADING_FILES',
        payload: { files },
      });
    });
  });

  describe('removeUploadingFiles', () => {
    it('should dispatch REMOVE_UPLOADING_FILES', () => {
      const groupIds = ['group-1', 'group-2'];
      customActions.removeUploadingFiles(groupIds)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_UPLOADING_FILES',
        payload: { groupIds },
      });
    });
  });

  describe('resetUploadingState', () => {
    it('should dispatch REMOVE_ALL_UPLOADING', () => {
      customActions.resetUploadingState()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_ALL_UPLOADING',
      });
    });
  });

  describe('updateUploadingFile', () => {
    it('should dispatch UPDATE_UPLOADING_FILE with all params', () => {
      const params = {
        groupId: 'group-123',
        fileData: { name: 'file.pdf' },
        thumbnail: 'thumb-url',
        status: 'uploading',
        progress: 50,
        cancelToken: 'token',
        documentId: 'doc-123',
        errorMessage: null,
        errorCode: null,
        organization: { id: 'org-1' },
        document: { id: 'doc-1' },
      };
      customActions.updateUploadingFile(params)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_UPLOADING_FILE',
        payload: params,
      });
    });
  });

  describe('retryUploadFile', () => {
    it('should dispatch RETRY_UPLOADING_FILE', () => {
      customActions.retryUploadFile('group-123')(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'RETRY_UPLOADING_FILE',
        payload: { groupId: 'group-123' },
      });
    });
  });

  describe('cancelUploadFile', () => {
    it('should dispatch CANCEL_UPLOADING_FILE', () => {
      customActions.cancelUploadFile('group-123')(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'CANCEL_UPLOADING_FILE',
        payload: { groupId: 'group-123' },
      });
    });
  });

  describe('cancelAllUploadingFiles', () => {
    it('should dispatch CANCEL_ALL_UPLOADING_FILES', () => {
      customActions.cancelAllUploadingFiles()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'CANCEL_ALL_UPLOADING_FILES',
        payload: {},
      });
    });
  });

  describe('openModal', () => {
    it('should dispatch OPEN_MODAL with default values', () => {
      customActions.openModal({ type: 'confirm', title: 'Test' })(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'OPEN_MODAL',
        payload: {
          type: 'confirm',
          title: 'Test',
          closeOnConfirm: true,
          isProcessing: false,
        },
      });
    });

    it('should dispatch OPEN_MODAL with custom values', () => {
      customActions.openModal({ type: 'confirm', closeOnConfirm: false, isProcessing: true })(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'OPEN_MODAL',
        payload: {
          type: 'confirm',
          closeOnConfirm: false,
          isProcessing: true,
        },
      });
    });
  });

  describe('openViewerModal', () => {
    it('should dispatch OPEN_MODAL with showOnlyInViewer true', () => {
      customActions.openViewerModal({ type: 'viewer-modal' })(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'OPEN_MODAL',
        payload: {
          type: 'viewer-modal',
          closeOnConfirm: true,
          isProcessing: false,
          showOnlyInViewer: true,
        },
      });
    });
  });

  describe('closeModal', () => {
    it('should dispatch CLOSE_MODAL', () => {
      customActions.closeModal()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'CLOSE_MODAL',
      });
    });
  });

  describe('updateModalProperties', () => {
    it('should dispatch UPDATE_MODAL_PROPERTIES', () => {
      const settings = { isProcessing: true };
      customActions.updateModalProperties(settings)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_MODAL_PROPERTIES',
        payload: settings,
      });
    });
  });

  describe('Page Edit Mode actions', () => {
    it('openPageEditMode should dispatch OPEN_PAGE_EDIT_MODE', () => {
      customActions.openPageEditMode()(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: 'OPEN_PAGE_EDIT_MODE' });
    });

    it('closePageEditMode should dispatch CLOSE_PAGE_EDIT_MODE', () => {
      customActions.closePageEditMode()(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: 'CLOSE_PAGE_EDIT_MODE' });
    });

    it('changePageEditDisplayMode should dispatch CHANGE_PAGE_EDIT_DISPLAY_MODE', () => {
      customActions.changePageEditDisplayMode('grid')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'CHANGE_PAGE_EDIT_DISPLAY_MODE',
        payload: { displayMode: 'grid' },
      });
    });

    it('setActiveEditMode should dispatch SET_ACTIVE_EDIT_MODE', () => {
      customActions.setActiveEditMode()(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: 'SET_ACTIVE_EDIT_MODE' });
    });

    it('setDeactiveEditMode should dispatch SET_DEACTIVE_EDIT_MODE', () => {
      customActions.setDeactiveEditMode()(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: 'SET_DEACTIVE_EDIT_MODE' });
    });
  });

  describe('Thumbnail actions', () => {
    it('updateThumbs should dispatch UPDATE_THUMBS', () => {
      const thumbs = [{ id: 'thumb-1' }];
      customActions.updateThumbs(thumbs)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_THUMBS',
        payload: { thumbs, newlyPagesAdded: [] },
      });
    });

    it('updateThumbs should dispatch UPDATE_THUMBS with newlyPagesAdded', () => {
      const thumbs = [{ id: 'thumb-1' }];
      const newlyPagesAdded = [1, 2];
      customActions.updateThumbs(thumbs, newlyPagesAdded)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_THUMBS',
        payload: { thumbs, newlyPagesAdded },
      });
    });

    it('deleteThumbs should dispatch DELETE_THUMBS', () => {
      customActions.deleteThumbs(5)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'DELETE_THUMBS',
        payload: { position: 5 },
      });
    });

    it('deleteMultipleThumbnails should dispatch DELETE_MULTIPLE_THUMBS', () => {
      customActions.deleteMultipleThumbnails([1, 2, 3])(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'DELETE_MULTIPLE_THUMBS',
        payload: { positions: [1, 2, 3] },
      });
    });

    it('disableThumb should dispatch DISABLE_THUMB', () => {
      customActions.disableThumb(3)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'DISABLE_THUMB',
        payload: { position: 3 },
      });
    });

    it('enableThumb should dispatch ENABLE_THUMB', () => {
      customActions.enableThumb(3)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'ENABLE_THUMB',
        payload: { position: 3 },
      });
    });

    it('addThumbs should dispatch ADD_THUMBS', () => {
      const thumbs = [{ id: 'thumb-1' }];
      customActions.addThumbs(thumbs, 2)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'ADD_THUMBS',
        payload: { thumbs, position: 2 },
      });
    });

    it('insertBlankThumbnails should dispatch INSERT_BLANK_THUMBS', () => {
      const blankThumbnails = [{ blank: true }];
      customActions.insertBlankThumbnails({ blankThumbnails, from: 0 })(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'INSERT_BLANK_THUMBS',
        payload: { blankThumbnails, from: 0 },
      });
    });

    it('setNewlyPagesAdded should dispatch SET_NEWLY_PAGES_ADDED', () => {
      customActions.setNewlyPagesAdded([1, 2])(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_NEWLY_PAGES_ADDED',
        payload: { newlyPagesAdded: [1, 2] },
      });
    });
  });

  describe('Filter actions', () => {
    it('setOwnedFilter should dispatch SET_OWNED_FILTER', () => {
      customActions.setOwnedFilter('mine')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_OWNED_FILTER',
        payload: { ownedFilter: 'mine' },
      });
    });

    it('setLastModifiedFilter should dispatch SET_LAST_MODIFIED_FILTER', () => {
      customActions.setLastModifiedFilter('week')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_LAST_MODIFIED_FILTER',
        payload: { lastModifiedFilter: 'week' },
      });
    });
  });

  describe('Theme actions', () => {
    it('setThemeMode should dispatch SET_THEME_MODE and save to localStorage', () => {
      customActions.setThemeMode('dark')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_THEME_MODE',
        payload: { themeMode: 'dark' },
      });
      expect(window.localStorage.getItem('themeMode')).toBe('dark');
    });
  });

  describe('Display actions', () => {
    it('setIsShowTopBar should dispatch SET_IS_SHOW_TOP_BAR', () => {
      customActions.setIsShowTopBar(false)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_IS_SHOW_TOP_BAR',
        payload: { isShowTopBar: false },
      });
    });

    it('setIsShowToolbarTablet should dispatch SET_IS_SHOW_TOOLBAR_TABLET', () => {
      customActions.setIsShowToolbarTablet(true)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_IS_SHOW_TOOLBAR_TABLET',
        payload: { isShowToolbarTablet: true },
      });
    });

    it('setIsShowBannerAds should dispatch SET_IS_SHOW_BANNER_ADS', () => {
      customActions.setIsShowBannerAds(false)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_IS_SHOW_BANNER_ADS',
        payload: { isShowBannerAds: false },
      });
    });

    it('setIsShowTopViewerBanner should dispatch SET_IS_SHOW_TOP_VIEWER_BANNER', () => {
      customActions.setIsShowTopViewerBanner(true)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_IS_SHOW_TOP_VIEWER_BANNER',
        payload: { isShowTopViewerBanner: true },
      });
    });
  });

  describe('Signature actions', () => {
    it('setUserSignatures should dispatch SET_USER_SIGNATURES', () => {
      const signatures = [{ id: 'sig-1' }];
      customActions.setUserSignatures(signatures)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_USER_SIGNATURES',
        payload: { userSignatures: signatures },
      });
    });

    it('addSignatures should dispatch ADD_USER_SIGNATURES', () => {
      const newSignatures = [{ id: 'sig-2' }];
      customActions.addSignatures(newSignatures)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'ADD_USER_SIGNATURES',
        payload: { newSignatures },
      });
    });

    it('deleteUserRemoteSignature should dispatch DELETE_USER_REMOTE_SIGNATURE', () => {
      customActions.deleteUserRemoteSignature('remote-123')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'DELETE_USER_REMOTE_SIGNATURE',
        payload: { remoteId: 'remote-123' },
      });
    });

    it('updateUserSignatures should dispatch UPDATE_USER_SIGNATURES', () => {
      const updatedSignatures = [{ id: 'sig-1', updated: true }];
      customActions.updateUserSignatures(updatedSignatures)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_USER_SIGNATURES',
        payload: { updatedSignatures },
      });
    });

    it('updateSignatureById should dispatch UPDATE_SIGNATURE_BY_ID', () => {
      customActions.updateSignatureById('sig-1', { name: 'Updated' })(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_SIGNATURE_BY_ID',
        payload: { id: 'sig-1', signature: { name: 'Updated' } },
      });
    });

    it('reorderSignature should dispatch REORDER_USER_SIGNATURES', () => {
      customActions.reorderSignature(0, 2)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'REORDER_USER_SIGNATURES',
        payload: { fromIndex: 0, toIndex: 2 },
      });
    });

    it('setSignatureStatus should dispatch SET_USER_SIGNATURE_STATUS', () => {
      customActions.setSignatureStatus('loading')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_USER_SIGNATURE_STATUS',
        payload: { status: 'loading' },
      });
    });
  });

  describe('Dialog actions', () => {
    it('openDialog should dispatch OPEN_DIALOG', () => {
      customActions.openDialog()(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: 'OPEN_DIALOG' });
    });

    it('closeDialog should dispatch CLOSE_DIALOG', () => {
      customActions.closeDialog()(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: 'CLOSE_DIALOG' });
    });

    it('updateDialogStatus should dispatch when status changes', () => {
      mockGetIsDialogOpen.mockReturnValue(false);
      customActions.updateDialogStatus(true)(dispatch, getState);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_DIALOG_STATUS',
        payload: { isOpen: true },
      });
    });

    it('updateDialogStatus should not dispatch when status is same', () => {
      mockGetIsDialogOpen.mockReturnValue(true);
      customActions.updateDialogStatus(true)(dispatch, getState);
      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('PWA Banner actions', () => {
    it('disablePwaDownloadBanner should dispatch and set localStorage', () => {
      customActions.disablePwaDownloadBanner()(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: 'DISABLE_PWA_DOWNLOAD_BANNER' });
      expect(window.localStorage.getItem('disablePwaDownload')).toBe('true');
    });

    it('enablePwaDownloadBanner should dispatch and remove localStorage', () => {
      window.localStorage.setItem('disablePwaDownload', 'true');
      customActions.enablePwaDownloadBanner()(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: 'ENABLE_PWA_DOWNLOAD_BANNER' });
      expect(window.localStorage.getItem('disablePwaDownload')).toBeNull();
    });
  });

  describe('Event tracking actions', () => {
    it('updateEventTrackingQueue should dispatch UPDATE_EVENT_TRACKING_QUEUE', () => {
      const event = { name: 'click', data: {} };
      customActions.updateEventTrackingQueue(event)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_EVENT_TRACKING_QUEUE',
        payload: { event },
      });
    });

    it('resetEventTrackingQueue should dispatch RESET_EVENT_TRACKING_QUEUE', () => {
      customActions.resetEventTrackingQueue()(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: 'RESET_EVENT_TRACKING_QUEUE' });
    });
  });

  describe('Grid view actions', () => {
    it('scrollToPageInGridViewMode should dispatch SCROLL_TO_PAGE_GRID_VIEW_MODE', () => {
      customActions.scrollToPageInGridViewMode({ page: 5 })(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SCROLL_TO_PAGE_GRID_VIEW_MODE',
        payload: { gridViewMode: { page: 5 } },
      });
    });

    it('resetGridViewMode should dispatch RESET_GRID_VIEW_MODE', () => {
      customActions.resetGridViewMode()(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: 'RESET_GRID_VIEW_MODE' });
    });
  });

  describe('Content editing actions', () => {
    it('setCurrentContentBeingEdited should return action', () => {
      const result = customActions.setCurrentContentBeingEdited({ content: 'test', annotation: {} });
      expect(result).toEqual({
        type: 'SET_CURRENT_CONTENT_BEING_EDITED',
        payload: { content: 'test', annotation: {} },
      });
    });

    it('clearCurrentContentBeingEdited should return action', () => {
      const result = customActions.clearCurrentContentBeingEdited();
      expect(result).toEqual({
        type: 'CLEAR_CURRENT_CONTENT_BEING_EDITED',
        payload: {},
      });
    });

    it('updateCurrentContentBeingEdited should return action', () => {
      const result = customActions.updateCurrentContentBeingEdited('updated content');
      expect(result).toEqual({
        type: 'UPDATE_CURRENT_CONTENT_BEING_EDITED',
        payload: { content: 'updated content' },
      });
    });
  });

  describe('Tool modal actions', () => {
    it('openToolModalByType should return action', () => {
      const result = customActions.openToolModalByType('signature');
      expect(result).toEqual({
        type: 'OPEN_TOOL_MODAL_BY_TYPE',
        payload: 'signature',
      });
    });

    it('closeToolModal should return action', () => {
      const result = customActions.closeToolModal();
      expect(result).toEqual({ type: 'CLOSE_TOOL_MODAL_BY_TYPE' });
    });
  });

  describe('Banner actions', () => {
    it('setShowBanner should dispatch SET_SHOW_BANNER', () => {
      customActions.setShowBanner('trial', true)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_SHOW_BANNER',
        payload: { bannerName: 'trial', isShow: true },
      });
    });

    it('setShowIntegrateLuminSignModal should dispatch SET_SHOW_INTEGRATE_LUMIN_SIGN_MODAL', () => {
      customActions.setShowIntegrateLuminSignModal('connect', true)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_SHOW_INTEGRATE_LUMIN_SIGN_MODAL',
        payload: { modalName: 'connect', isShow: true },
      });
    });

    it('setShowIntegrateLuminSignModal should default isShow to false', () => {
      customActions.setShowIntegrateLuminSignModal('connect')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_SHOW_INTEGRATE_LUMIN_SIGN_MODAL',
        payload: { modalName: 'connect', isShow: false },
      });
    });
  });

  describe('Other actions', () => {
    it('setCareTaker should dispatch SET_CARE_TAKER', () => {
      customActions.setCareTaker({ undo: [], redo: [] })(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_CARE_TAKER',
        payload: { careTaker: { undo: [], redo: [] } },
      });
    });

    it('setPurchaseState should dispatch SET_PURCHASE_STATE', () => {
      customActions.setPurchaseState(true)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_PURCHASE_STATE',
        payload: { isPurchasing: true },
      });
    });

    it('setBillingWarning should dispatch SET_BILLING_WARNING', () => {
      customActions.setBillingWarning('client-123', { warning: true })(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_BILLING_WARNING',
        payload: { clientId: 'client-123', data: { warning: true } },
      });
    });

    it('deleteBillingBanner should dispatch DELETE_BILLING_BANNER', () => {
      customActions.deleteBillingBanner('client-123', 'trial')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'DELETE_BILLING_BANNER',
        payload: { clientId: 'client-123', bannerType: 'trial' },
      });
    });

    it('loadAWSPinpointSuccess should dispatch LOAD_AWS_PINPOINT_SUCCESS', () => {
      customActions.loadAWSPinpointSuccess()(dispatch);
      expect(dispatch).toHaveBeenCalledWith({ type: 'LOAD_AWS_PINPOINT_SUCCESS' });
    });

    it('setDisplayQRCodeDialog should dispatch SET_DISPLAY_QR_CODE_DIALOG', () => {
      customActions.setDisplayQRCodeDialog(true)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_DISPLAY_QR_CODE_DIALOG',
        payload: { shouldDisplay: true },
      });
    });

    it('setToolAutoEnabled should dispatch SET_TOOL_AUTO_ENABLED', () => {
      customActions.setToolAutoEnabled('pen')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_TOOL_AUTO_ENABLED',
        payload: { toolId: 'pen' },
      });
    });

    it('setToolAutoEnabled should use empty string as default', () => {
      customActions.setToolAutoEnabled()(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_TOOL_AUTO_ENABLED',
        payload: { toolId: '' },
      });
    });

    it('setForceReloadVersion should dispatch FORCE_RELOAD_VERSION', () => {
      customActions.setForceReloadVersion('1.0.0')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'FORCE_RELOAD_VERSION',
        payload: { forceReloadVersion: '1.0.0' },
      });
    });

    it('setCanModifyDriveContent should dispatch SET_CAN_MODIFY_DRIVE_CONTENT', () => {
      customActions.setCanModifyDriveContent(true)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_CAN_MODIFY_DRIVE_CONTENT',
        payload: { canModifyDriveContent: true },
      });
    });

    it('setDisplayIntroduceAGBanner should dispatch SET_DISPLAY_INTRODUCE_AG_BANNER', () => {
      customActions.setDisplayIntroduceAGBanner(true)(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_DISPLAY_INTRODUCE_AG_BANNER',
        payload: { isShow: true },
      });
    });

    it('setBackDropMessage should dispatch SET_BACK_DROP_MESSAGE', () => {
      customActions.setBackDropMessage('Loading...', { timeout: 3000 })(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_BACK_DROP_MESSAGE',
        payload: { message: 'Loading...', configs: { timeout: 3000 } },
      });
    });

    it('setBackDropMessage should use empty configs as default', () => {
      customActions.setBackDropMessage('Loading...')(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_BACK_DROP_MESSAGE',
        payload: { message: 'Loading...', configs: {} },
      });
    });

    it('setIsWaitingForEditBoxes should return action', () => {
      const result = customActions.setIsWaitingForEditBoxes(true);
      expect(result).toEqual({
        type: 'SET_IS_WAITING_FOR_EDIT_BOXES',
        payload: { isWaitingForEditBoxes: true },
      });
    });

    it('setShouldShowInviteCollaboratorsModal should return action', () => {
      const result = customActions.setShouldShowInviteCollaboratorsModal(true);
      expect(result).toEqual({
        type: 'SET_SHOULD_SHOW_INVITE_COLLABORATORS_MODAL',
        payload: { shouldShowInviteCollaboratorsModal: true },
      });
    });

    it('setShowTrialModal should return action', () => {
      const result = customActions.setShowTrialModal(true);
      expect(result).toEqual({
        type: 'SET_SHOW_TRIAL_MODAL',
        payload: { showTrialModal: true },
      });
    });
  });
});

