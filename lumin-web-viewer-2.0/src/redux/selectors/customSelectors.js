import isMobileOrTablet from 'helpers/isMobileOrTablet';

export const getModalData = (state) => state.modal;
export const getCurrentUser = (state) => state.auth.currentUser;
export const hasGapiLoaded = (state) => state.auth.gapiLoaded;
export const hasPinpointLoaded = (state) => state.eventTracking.pinpointLoaded;
export const getToastData = (state) => state.toast;
export const getCurrentDocument = (state) => state.auth.currentDocument;
export const getIsFetchingCurrentDocument = (state) => state.auth.isFetchingCurrentDocument;
export const getCurrentOwnedFilter = (state) => state.auth.ownedFilter;
export const getCurrentLastModifiedFilter = (state) => state.auth.lastModifiedFilter;
export const getThumbs = (state) => state.document.lumin_thumbs;
export const getCareTaker = (state) => state.document.lumin_careTaker;
export const getPurchaseState = (state) => state.payment.isPurchasing;
export const getThemeMode = (state) => state.viewer.themeMode;
export const getIsShowTopBar = (state) => state.viewer.isShowTopBar;
export const getIsShowToolbarTablet = (state) => state.viewer.isShowToolbarTablet;
export const getIsShowBannerAds = (state) => state.viewer.isShowBannerAds;
export const getIsShowTopViewerBanner = (state) => state.viewer.isShowTopViewerBanner;
export const getDeletePassword = (state) => state.auth.deletePassword;
export const getDisabledElementFromList = (state, dataElements) => {
  const disabledElements = {};
  dataElements.forEach(
    (dataElement) =>
      (disabledElements[dataElement] =
        state.viewer.disabledElements[dataElement] && state.viewer.disabledElements[dataElement].disabled)
  );
  return disabledElements;
};
export const isOffline = (state) => state.auth.isOffline;
export const isSourceDownloading = (state) => state.auth.isSourceDownloading;
export const getDocumentList = (state) => state.documentList;
export const getCurrentAppScope = (state) => state.auth.currentAppScope;
export const getSubMenuType = (state) => state.auth.subMenuType;
export const getDocumentLoading = (state, folder) => state.documentList[folder].loading;
export const getOrganizationTeams = (state) =>
  state.auth.userTeams.filter((team) => team.belongsTo?.type === 'organization');
export const getURL = (state) => state.report.urlsArray;
export const getBillingWarning = (state) => state.payment.billingWarning;
export const getRenewAttemptList = (state) => state.payment.renewAttempts;
export const getNewlyPagesAdded = (state) => state.document.newlyPagesAdded;
export const getAllNewlyPagesAdded = (state) => state.document.allNewlyPagesAdded;
export const isDisabledPwaDownloadBanner = (state) => isMobileOrTablet() || state.user.disablePwaDownload;
export const getEventTrackingQueue = (state) => state.eventTracking.queue;
export const isScrollToPageInGridViewMode = (state) => state.viewer.gridViewMode.isScroll;
export const getPageToScrollInGridViewMode = (state) => state.viewer.gridViewMode.pageToScroll;
export const getCurrentContentBeingEdited = (state) => state.viewer.currentContentBeingEdited;
export const getOfflineDocumentListUrl = (state) => state.auth.currentUser.lastDocumentListUrl;
export const getLocationCurrency = (state) => state.auth.locationCurrency;
export const isAuthenticating = (state) => state.auth.isAuthenticating;
export const getOpenToolModal = (state) => state.viewer.modalToolType;
export const getShowedBanner = (state, bannerName) => state.banner?.[bannerName] || false;
export const shouldShowRating = (state) => state.viewer.shouldShowRating;
export const getWrongIpStatus = (state) => state.auth.wrongIpStatus;
export const getMembershipOfOrg = (state) => state.auth.membershipOfOrg;
export const getIsOpenIntegrateModal = (state) => state.viewer.integrateModal.isOpenIntegrateModal;
export const getIsOpenSignModal = (state) => state.viewer.integrateModal.isOpenSignModal;
export const getShowLoadingDocumentWarn = (state) => state.viewer.showLoadingDocumentWarn;
export const getOpenQRCode = (state) => state.viewer.isOpenQRCode;
export const getToolAutoEnabled = (state) => state.viewer.toolAutoEnabled;
export const hasUserLocationLoaded = (state) => state.auth.userLocationLoaded;
export const getForceReloadVersion = (state) => state.custom.forceReloadVersion;
export const getUserSignPayment = (state) => state.auth.userSignPayment;
export const canModifyDriveContent = (state) => state.document.canModifyDriveContent;
export const getOutlineEvent = (state) => state.viewer.activeOutlineEvent;
export const getIsLoadingDocumentOutlines = (state) => state.viewer.isLoadingGetDocumentOutlines;
export const hasGTMLoaded = (state) => state.auth.gtmLoaded;
export const getIsSummarizing = (state) => state.viewer.isSummarizing;
export const getIsRegeneratingSummary = (state) => state.viewer.isRegeneratingSummary;
export const getCurrentSummaryDocVersion = (state) => state.viewer.currentSummaryDocVersion;
export const getFoundDocumentScrolling = (state, folderType) => state.documentList[folderType].foundDocumentScrolling;
export const getDocumentCapabilities = (state) => state.auth.currentDocument?.capabilities || {};
export const getBackDropMessage = (state) => state.viewer.backDropMessage;
export const getBackDropConfigs = (state) => state.viewer.backDropConfigs;
export const isModalOpen = (state) => state.modal?.open || false;
export const getActionCountDocStack = (state) =>
  state.auth.currentDocument?.actionCountDocStack || state.organization.actionCountDocStack;
export const getIsShowIntroduceAGBanner = (state) => state.user.isShowIntroduceAGBanner;
export const isWaitingForEditBoxes = (state) => state.viewer.isWaitingForEditBoxes;
export const getShouldShowInviteCollaboratorsModal = (state) => state.viewer.shouldShowInviteCollaboratorsModal;
export const getShowTrialModal = (state) => state.viewer.showTrialModal;
export const getError = (state) => state.custom.error;
