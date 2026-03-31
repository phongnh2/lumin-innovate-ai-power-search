/* eslint-disable max-len */
import { isAndroid } from 'helpers/device';

// viewer
export const isElementDisabled = (state, dataElement) =>
  state.viewer.disabledElements[dataElement] && state.viewer.disabledElements[dataElement].disabled;
export const isFeatureDisabled = (state, feature) => state.viewer.disabledFeatures[feature];
export const isElementOpen = (state, dataElement) => {
  if (state.viewer.disabledElements[dataElement]) {
    return state.viewer.openElements[dataElement] && !state.viewer.disabledElements[dataElement].disabled;
  }

  return state.viewer.openElements[dataElement];
};

export const allButtonsInGroupDisabled = (state, toolGroup) => {
  // eslint-disable-next-line no-use-before-define
  const toolButtonObjects = getToolButtonObjects(state);
  const dataElements = Object.values(toolButtonObjects)
    .filter(({ group }) => group === toolGroup)
    .map(({ dataElement }) => dataElement);

  return dataElements.every((dataElement) => isElementDisabled(state, dataElement));
};

export const getToolButtonObjects = (state) => state.viewer.toolButtonObjects;
export const getToolButtonObject = (state, toolName) => state.viewer.toolButtonObjects[toolName];
export const getActiveHeaderItems = (state) => state.viewer.headers[state.viewer.activeHeaderGroup];
export const getDisabledElementPriority = (state, dataElement) => state.viewer.disabledElements[dataElement] && state.viewer.disabledElements[dataElement].priority;
export const getToolButtonDataElements = (state, toolNames) => toolNames.map((toolName) => state.viewer.toolButtonObjects[toolName]?.dataElement);
export const getToolButtonDataElement = (state, toolName) => state.viewer.toolButtonObjects[toolName]?.dataElement;
export const getToolNamesByGroup = (state, toolGroup) => Object.keys(state.viewer.toolButtonObjects).filter((name) => state.viewer.toolButtonObjects[name].group === toolGroup);
export const getToolNameByDataElement = (state, dataElement) => Object.keys(state.viewer.toolButtonObjects)
  .find((name) => state.viewer.toolButtonObjects[name].dataElement === dataElement);
export const getActiveToolName = (state) => state.viewer.activeToolName;
export const getActiveToolStyles = (state) => state.viewer.activeToolStyles;
export const getActiveLeftPanel = (state) => state.viewer.activeLeftPanel;
export const getActiveToolGroup = (state) => state.viewer.activeToolGroup;
export const getLeftPanelWidth = (state) => state.viewer.leftPanelWidth;
export const getNotePopupId = (state) => state.viewer.notePopupId;
export const getFitMode = (state) => state.viewer.fitMode;
export const getZoom = (state) => state.viewer.zoom;
export const getDisplayMode = (state) => state.viewer.displayMode;
export const getCurrentPage = (state) => state.viewer.currentPage;
export const getSortStrategy = (state) => state.viewer.sortStrategy;
export const getShowNotesOption = (state) => state.viewer.showNotesOption;

export const getRotation = (state) => state.viewer.rotation;
export const getNoteDateFormat = (state) => state.viewer.noteDateFormat;
export const isFullScreen = (state) => state.viewer.isFullScreen;
export const isInPresenterMode = (state) => state.viewer.presenterMode.isInPresenterMode;
export const presenterModeRestoreState = (state) => state.viewer.presenterMode.restoreState;
export const doesDocumentAutoLoad = (state) => state.viewer.doesAutoLoad;
export const isDocumentLoaded = (state) => state.viewer.isDocumentLoaded;
export const isDocumentReadOnly = (state) => state.viewer.isReadOnly;
export const getCustomPanels = (state) => state.viewer.customPanels;
export const getPageLabels = (state) => state.viewer.pageLabels;
export const getSelectedThumbnailPageIndexes = (state) => state.viewer.selectedThumbnailPageIndexes;
export const getDisabledCustomPanelTabs = (state) => state.viewer.customPanels.reduce((disabledTabs, { tab }) => {
  if (state.viewer.disabledElements[tab.dataElement]?.disabled) {
    disabledTabs.push(tab.dataElement);
  }
  return disabledTabs;
}, []);
export const isEmbedPrintSupported = (state) => !isAndroid && state.viewer.useEmbeddedPrint;

export const getColorMap = (state) => state.viewer.colorMap;
export const getOpenElements = (state) => state.viewer.openElements;
export const getCurrentPalette = (state, colorMapKey) => state.viewer.colorMap[colorMapKey] && state.viewer.colorMap[colorMapKey].currentPalette;
export const getIconColor = (state, colorMapKey) => state.viewer.colorMap[colorMapKey] && state.viewer.colorMap[colorMapKey].iconColor;
export const getCustomNoteFilter = (state) => state.viewer.customNoteFilter;
export const getIsReplyDisabled = (state) => state.viewer.isReplyDisabledFunc;
export const getZoomList = (state) => state.viewer.zoomList;
export const getMeasurementUnits = (state) => state.viewer.measurementUnits;
export const getIsNoteEditing = (state) => state.viewer.isNoteEditing;
export const getNoteEditingAnnotationId = (state) => state.viewer.noteEditingAnnotationId;
export const getMaxSignaturesCount = (state) => state.viewer.maxSignaturesCount;
export const isSavingSignature = (state) => state.viewer.isSavingSignature;
export const getUserData = (state) => state.viewer.userData;
export const getIsMentionEnabled = (state) => !!state.viewer.userData;
export const getSignatureFonts = (state) => state.viewer.signatureFonts;

export const getSelectedTab = (state, id) => state.viewer.tab[id];

export const getCustomElementOverrides = (state, dataElement) => state.viewer.customElementOverrides[dataElement];

export const getPopupItems = (state, popupDataElement) => state.viewer[popupDataElement] || [];

export const getIsThumbnailMergingEnabled = (state) => state.viewer.isThumbnailMerging;

export const getIsThumbnailReorderingEnabled = (state) => state.viewer.isThumbnailReordering;

export const getIsThumbnailMultiselectEnabled = (state) => state.viewer.isThumbnailMultiselect;

export const getIsMultipleViewerMerging = (state) => state.viewer.isMultipleViewerMerging;

export const getAllowPageNavigation = (state) => state.viewer.allowPageNavigation;

export const getCustomMeasurementOverlay = (state) => state.viewer.customMeasurementOverlay;
export const getAnnotationContentOverlayHandler = (state) => state.viewer.annotationContentOverlayHandler;
export const getUserSignatures = (state) => state.user.userSignatures;
export const getUserSignatureStatus = (state) => state.viewer.signatureStatus;
export const getSelectedDisplaySignature = (state) => state.viewer.selectedSignature;
export const isPlacingMultipleSignatures = (state) => state.viewer.isPlacingMultipleSignatures;
export const isPlacingMultipleRubberStamp = (state) => state.viewer.isPlacingMultipleRubberStamp;
export const signatureWidgetSelected = (state) => state.viewer.signatureWidgetSelected;
export const hasAppliedRedaction = (state) => state.viewer.hasAppliedRedaction;
export const isInContentEditMode = (state) => state.viewer.isInContentEditMode;

export const getCommentPos = (state, id) => {
  const { top } = state.viewer.commentPlacement.idealPlacement[id] ?? {};
  return top;
};
export const getIdealPlacement = (state) => state.viewer.commentPlacement.idealPlacement;
export const getAnnotationsLoaded = (state) => state.viewer.annotationsLoaded;
// warning message
export const getWarningMessage = (state) => (state.viewer.warning && state.viewer.warning.message) || '';
export const getWarningTitle = (state) => (state.viewer.warning && state.viewer.warning.title) || '';
export const getWarningConfirmEvent = (state) => state.viewer.warning && state.viewer.warning.onConfirm;
export const getWarningConfirmBtnText = (state) => state.viewer.warning && state.viewer.warning.confirmBtnText;
export const getWarningCancelEvent = (state) => state.viewer.warning && state.viewer.warning.onCancel;

export const isAccessibleMode = (state) => state.viewer.isAccessibleMode;

// error message
export const getErrorMessage = (state) => state.viewer.errorMessage || '';

// document
export const getPasswordAttempts = (state) => state.document.passwordAttempts;
export const getPasswordMessage = (state) => state.document.passwordMessage;
export const getPasswordModalSource = (state) => state.document.passwordModalSource;
export const getPasswordProtectedDocumentName = (state) => state.document.passwordProtectedDocumentName;
export const getPrintQuality = (state) => state.document.printQuality;
export const getTotalPages = (state) => state.document.totalPages;
export const getOutlines = (state) => state.document.outlines;
export const getBookmarks = (state) => state.document.bookmarks;
export const getLayers = (state) => state.document.layers;
export const getLoadingProgress = (state) => (state.document.documentLoadingProgress + state.document.workerLoadingProgress) / 2;
export const getLoadingProgressValue = (state) => state.document.loadingProgress;
export const getUploadProgress = (state) => state.document.uploadProgress;
export const isUploading = (state) => state.document.isUploading;

// user
export const getUserName = (state) => state.user.name;

// advanced
export const getAdvanced = (state) => state.advanced;
export const getServerUrl = (state) => state.advanced.serverUrl;

// search
export const getSearchListeners = (state) => state.search.listeners;
export const getSearchValue = (state) => state.search.value;
export const getActiveResult = (state) => state.search.activeResult;
export const getActiveResultIndex = (state) => state.search.activeResultIndex;
export const getResults = (state) => state.search.results;
export const isCaseSensitive = (state) => state.search.isCaseSensitive;
export const isWholeWord = (state) => state.search.isWholeWord;
export const isWildcard = (state) => state.search.isWildcard;
export const isSearchUp = (state) => state.search.isSearchUp;
export const isAmbientString = (state) => state.search.isAmbientString;
export const isRegex = (state) => state.search.isRegex;
export const isSearching = (state) => state.search.isSearching;
export const isNoResult = (state) => state.search.noResult;
export const getSearchErrorMessage = (state) => state.search.errorMessage;
export const isProgrammaticSearch = (state) => state.search.isProgrammaticSearch;
export const isProgrammaticSearchFull = (state) => state.search.isProgrammaticSearchFull;

export const getNoteTransformFunction = (state) => state.viewer.noteTransformFunction;
// --------------------------------- Dev by Lumin --------------------------------
// modal selectors
export const getModalData = (state) => state.modal;
export const getCurrentUser = (state) => state.auth.currentUser;
export const getToastData = (state) => state.toast;
export const getCurrentDocument = (state) => state.auth.currentDocument;

export const isPageEditMode = (state) => state.viewer.isPageEditMode;
export const isPreviewOriginalVersionMode = (state) => state.viewer.isPreviewOriginalVersionMode;
export const pageEditDisplayMode = (state) => state.viewer.pageEditMode.displayMode;
export const getIsActiveEditMode = (state) => state.viewer.isActiveEditMode;
export const isOpenModalData = (state) => state.modal?.open;
export const getIsDialogOpen = (state) => state.dialog?.open;
export const isNotFoundDocument = (state) => state.viewer.isNotFoundDocument;
export const getAutoSyncStatus = (state) => state.viewer.autoSyncStatus;

export const getInitialWidgetXfdf = (state) => state.viewer.initialWidgetXfdf;
export const getCommentPanelLayoutState = (state) => state.viewer.commentPanelLayoutState;
export const getMinimizeBananaSign = (state) => state.viewer.isMinimizeBananaSign;

export const isForceReload = (state) => state.viewer.forceReload;
export const getUploadDocVisible = (state) => state.viewer.uploadDocVisible;
export const getLanguage = (state) => state.auth.language;
export const isUsingRichText = (state) => state.viewer.isUsingRichText;
export const getEditPdfVersion = (state) => state.viewer.editPdfVersion;
export const isLoadingDocument = (state) => state.viewer.isLoadingDocument;
export const getInternalAnnotationIds = (state) => state.viewer.internalAnnotationIds;

export const totalSteps = (state) => state.viewer.mergeLoadingModalData.totalSteps;
export const currentStep = (state) => state.viewer.mergeLoadingModalData.currentStep;
export const isConvertingBase64ToSignedUrl = (state) => state.viewer.isConvertingBase64ToSignedUrl;
export const viewerLoadingModalData = (state) => state.viewer.viewerLoadingModalData;
export const shouldShowOCRBanner = (state) => state.viewer.shouldShowOCRBanner;

export const rubberStamps = (state) => state.viewer.rubberStamp.rubberStamps;
export const rubberStampsLength = (state) => state.viewer.rubberStamp.rubberStamps.length;
export const rubberStampsTotal = (state) => state.viewer.rubberStamp.total;
export const rubberStampsSkip = (state) => state.viewer.rubberStamp.skip;
export const shouldFetchOnInit = (state) => state.viewer.rubberStamp.shouldFetchOnInit;
export const shouldFetchMoreRubberStamps = (state) =>
  state.viewer.rubberStamp.rubberStamps.length !== state.viewer.rubberStamp.total;
export const getDownloadType = (state) => state.viewer.downloadType;

export const getIsDocumentReady = (state) => state.viewer.isDocumentReady;

export const getIsCompletedGettingUserData = (state) => state.auth.isCompletedGettingUserData;

export const getOpenedElementData = (state, dataElement) => state.viewer.openedElementData[dataElement] || {};

export const isEnableEmbeddedJavascript = (state) => state.viewer.isEnableEmbeddedJavascript;

export const isFlattenPdf = (state) => state.viewer.flattenPdf;
