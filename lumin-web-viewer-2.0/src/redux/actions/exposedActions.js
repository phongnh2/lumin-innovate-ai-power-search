import core from 'core';

import fireEvent from 'helpers/fireEvent';
import isDataElementPanel from 'helpers/isDataElementPanel';
import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { TOOLS_TRIGGER_LOAD_DOCUMENT } from 'constants/dataElement';
import { getMinZoomLevel, getMaxZoomLevel } from 'constants/zoomFactors';

// viewer
export const enableAllElements = () => ({ type: 'ENABLE_ALL_ELEMENTS', payload: {} });
export const openElement = (dataElement, elementPayload) => (dispatch, getState) => {
  const state = getState();

  const isElementDisabled = state.viewer.disabledElements[dataElement]?.disabled;
  const isLeftPanelOpen = state.viewer.openElements.leftPanel;
  const isElementOpen = isDataElementPanel(dataElement, state)
    ? isLeftPanelOpen && state.viewer.activeLeftPanel === dataElement
    : state.viewer.openElements[dataElement];

  if (isElementDisabled || isElementOpen) {
    return;
  }

  if (TOOLS_TRIGGER_LOAD_DOCUMENT.includes(dataElement) && !ToolSwitchableChecker.isAnnotationLoaded()) {
    ToolSwitchableChecker.showWarningMessage();
    return;
  }

  if (isDataElementPanel(dataElement, state)) {
    if (!isLeftPanelOpen) {
      dispatch({ type: 'OPEN_ELEMENT', payload: { dataElement: 'leftPanel', ...elementPayload } });
      fireEvent('visibilityChanged', { element: 'leftPanel', isVisible: true });
    }
    // eslint-disable-next-line no-use-before-define
    dispatch(setActiveLeftPanel(dataElement));
  } else {
    dispatch({ type: 'OPEN_ELEMENT', payload: { dataElement, ...elementPayload } });
    fireEvent('visibilityChanged', { element: dataElement, isVisible: true });

    if (dataElement === 'leftPanel' && !isLeftPanelOpen) {
      fireEvent('visibilityChanged', { element: state.viewer.activeLeftPanel, isVisible: true });
    }
  }
};
export const openElements = (dataElements) => (dispatch) => {
  if (typeof dataElements === 'string') {
    dispatch(openElement(dataElements));
  } else {
    dataElements.forEach((dataElement) => {
      dispatch(openElement(dataElement));
    });
  }
};
export const closeElement = (dataElement) => (dispatch, getState) => {
  const state = getState();

  const isElementDisabled = state.viewer.disabledElements[dataElement]?.disabled;
  const isElementClosed = isDataElementPanel(dataElement, state)
    ? state.viewer.activeLeftPanel !== dataElement
    : !state.viewer.openElements[dataElement];

  if (isElementDisabled || isElementClosed) {
    return;
  }

  if (isDataElementPanel(dataElement, state) && state.viewer.openElements.leftPanel) {
    dispatch({ type: 'CLOSE_ELEMENT', payload: { dataElement: 'leftPanel' } });
    fireEvent('visibilityChanged', { element: 'leftPanel', isVisible: false });
  } else {
    dispatch({ type: 'CLOSE_ELEMENT', payload: { dataElement } });
    fireEvent('visibilityChanged', { element: dataElement, isVisible: false });

    if (dataElement === 'leftPanel' && state.viewer.openElements.leftPanel) {
      fireEvent('visibilityChanged', { element: state.viewer.activeLeftPanel, isVisible: false });
    }
  }
};
export const closeElements = (dataElements) => (dispatch) => {
  if (typeof dataElements === 'string') {
    dispatch(closeElement(dataElements));
  } else {
    dataElements.forEach((dataElement) => {
      dispatch(closeElement(dataElement));
    });
  }
};

export const toggleElement = (dataElement) => (dispatch, getState) => {
  const state = getState();

  if (state.viewer.disabledElements[dataElement]?.disabled) {
    return;
  }

  if (state.viewer.openElements[dataElement]) {
    dispatch(closeElement(dataElement));
  } else {
    dispatch(openElement(dataElement));
  }
};

export const setActiveHeaderGroup = (headerGroup) => ({ type: 'SET_ACTIVE_HEADER_GROUP', payload: { headerGroup } });
export const setActiveLeftPanel = (dataElement) => (dispatch, getState) => {
  const state = getState();

  if (isDataElementPanel(dataElement, state)) {
    if (state.viewer.activeLeftPanel !== dataElement) {
      dispatch({ type: 'CLOSE_ELEMENT', payload: { dataElement: state.viewer.activeLeftPanel } });
      fireEvent('visibilityChanged', { element: state.viewer.activeLeftPanel, isVisible: false });
      dispatch({ type: 'SET_ACTIVE_LEFT_PANEL', payload: { dataElement } });
      fireEvent('visibilityChanged', { element: dataElement, isVisible: true });
    }
  } else {
    if (dataElement === '') {
      dispatch({ type: 'SET_ACTIVE_LEFT_PANEL', payload: { dataElement } });
      return;
    }
    const panelDataElements = [
      ...state.viewer.customPanels.map(({ panel }) => panel.dataElement),
      'thumbnailsPanel',
      'outlinesPanel',
      'notesPanel',
      'layersPanel',
      'bookmarksPanel',
    ].join(', ');
    console.warn(
      `${dataElement} is not recognized by the left panel. Please use one of the following options: ${panelDataElements}`
    );
  }
};
export const setSortStrategy = (sortStrategy) => ({ type: 'SET_SORT_STRATEGY', payload: { sortStrategy } });
export const setSortNotesBy = (sortStrategy) => {
  console.warn('setSortNotesBy is deprecated, please use setSortStrategy instead');

  return setSortStrategy(sortStrategy);
};
export const setShowNotesOption = (showNotesOption) => ({
  type: 'SET_SHOW_NOTES_OPTION',
  payload: { showNotesOption },
});

export const setNoteDateFormat = (noteDateFormat) => ({ type: 'SET_NOTE_DATE_FORMAT', payload: { noteDateFormat } });
export const setCustomPanel = (newPanel) => ({ type: 'SET_CUSTOM_PANEL', payload: { newPanel } });
export const setPageLabels = (pageLabels) => (dispatch) => {
  if (pageLabels.length !== core.getTotalPages()) {
    console.warn('Number of page labels do not match with the total pages.');
    return;
  }
  dispatch({ type: 'SET_PAGE_LABELS', payload: { pageLabels: pageLabels.map(String) } });
};
export const setSelectedPageThumbnails = (selectedThumbnailPageIndexes = []) => ({
  type: 'SET_SELECTED_THUMBNAIL_PAGE_INDEXES',
  payload: { selectedThumbnailPageIndexes },
});
export const setSwipeOrientation = (swipeOrientation) => ({
  type: 'SET_SWIPE_ORIENTATION',
  payload: { swipeOrientation },
});
export const showWarningMessage = (options) => (dispatch) => {
  dispatch({ type: 'SET_WARNING_MESSAGE', payload: options });
  dispatch(openElement('warningModal'));
};
export const showErrorMessage = (message) => (dispatch) => {
  dispatch({ type: 'SET_ERROR_MESSAGE', payload: { message } });
  dispatch(openElement('errorModal'));
};
export const setCustomNoteFilter = (filterFunc) => ({
  type: 'SET_CUSTOM_NOTE_FILTER',
  payload: { customNoteFilter: filterFunc },
});
export const setZoomList = (zoomList) => (dispatch) => {
  const minZoomLevel = getMinZoomLevel();
  const maxZoomLevel = getMaxZoomLevel();
  const filteredZoomList = zoomList.filter((zoom) => zoom >= minZoomLevel && zoom <= maxZoomLevel);

  if (filteredZoomList.length !== zoomList.length) {
    const outOfRangeZooms = zoomList.filter((zoom) => !filteredZoomList.includes(zoom));
    console.warn(`
      ${outOfRangeZooms.join(', ')} are not allowed zoom levels in the UI.
      Valid zoom levels should be in the range of ${minZoomLevel}-${maxZoomLevel}.
      You can use setMinZoomLevel or setMaxZoomLevel APIs to change the range.
      See https://www.pdftron.com/documentation/web/guides/ui/apis for more information.
    `);
  }

  dispatch({ type: 'SET_ZOOM_LIST', payload: { zoomList: filteredZoomList } });
};
export const useEmbeddedPrint = (useEmbeddedPrint = true) => ({
  type: 'USE_EMBEDDED_PRINT',
  payload: { useEmbeddedPrint },
});
export const setMaxSignaturesCount = (maxSignaturesCount) => ({
  type: 'SET_MAX_SIGNATURES_COUNT',
  payload: { maxSignaturesCount },
});
export const setIsSavingSignature = (isSavingSignature) => ({
  type: 'SET_IS_SAVING_SIGNATURE',
  payload: { isSavingSignature },
});
export const setUserData = (userData) => ({
  type: 'SET_USER_DATA',
  payload: { userData },
});
export const setCustomMeasurementOverlay = (customMeasurementOverlay) => ({
  type: 'SET_CUSTOM_MEASUREMENT_OVERLAY',
  payload: { customMeasurementOverlay },
});
export const setSelectedTab = (id, dataElement) => ({
  type: 'SET_SELECTED_TAB',
  payload: { id, dataElement },
});
export const setCustomElementOverrides = (dataElement, overrides) => ({
  type: 'SET_CUSTOM_ELEMENT_OVERRIDES',
  payload: { dataElement, overrides },
});
export const setSearchResults = (searchResults) => ({
  type: 'SET_SEARCH_RESULTS',
  payload: searchResults,
});
export const setActiveResult = (activeResult) => ({
  type: 'SET_ACTIVE_RESULT',
  payload: { activeResult },
});
export const setActiveResultIndex = (index) => ({
  type: 'SET_ACTIVE_RESULT_INDEX',
  payload: { index },
});
export const setAnnotationContentOverlayHandler = (annotationContentOverlayHandler) => ({
  type: 'SET_ANNOTATION_CONTENT_OVERLAY_HANDLER',
  payload: { annotationContentOverlayHandler },
});
export const setCommentBoxPosition = (originLocation) => ({
  type: 'SET_COMMENT_LOCATION',
  payload: { originLocation },
});
export const setSelectedComment = (selectedCommentId) => ({
  type: 'SET_SELECTED_COMMENT',
  payload: { selectedCommentId },
});
export const setAnnotationsLoaded = (annotationsLoaded) => ({
  type: 'SET_ANNOTATIONS_LOADED',
  payload: {
    annotationsLoaded,
  },
});
export const setDocumentNotFound = () => ({
  type: 'SET_DOCUMENT_NOT_FOUND',
});
export const resetDocumentNotFound = () => ({
  type: 'RESET_DOCUMENT_NOT_FOUND',
});
export const setAutoSyncStatus = (autoSyncStatus) => ({
  type: 'SET_AUTO_SYNC_STATUS',
  payload: { autoSyncStatus },
});

export const setInitialWidgetXfdf = (initialWidgetXfdf) => ({
  type: 'SET_INITIAL_WIDGET_XFDF',
  payload: { initialWidgetXfdf },
});

export const setCommentPanelLayoutState = (state) => ({
  type: 'SET_COMMENT_PANEL_LAYOUT_STATE',
  payload: { state },
});

export const setSelectedSignature = (signature) => ({
  type: 'SET_SELECTED_SIGNATURE',
  payload: { signature },
});

export const setPlacingMultipleSignatures = (isPlacingMultipleSignatures) => ({
  type: 'SET_PLACING_MULTIPLE_SIGNATURES',
  payload: { isPlacingMultipleSignatures },
});

export const setPlacingMultipleRubberStamp = (isPlacingMultipleRubberStamp) => ({
  type: 'SET_PLACING_MULTIPLE_RUBBER_STAMP',
  payload: { isPlacingMultipleRubberStamp },
});

export const setMinimizeBananaSign = (isMinimizeBananaSign) => ({
  type: 'SET_MINIMIZE_BANANA_SIGN',
  payload: isMinimizeBananaSign,
});

export const setForceReload = (forceReload) => ({
  type: 'SET_FORCE_RELOAD',
  payload: { forceReload },
});

export const setDiscardContentEdit = (discardContentEdit) => ({
  type: 'SET_DISCARD_CONTENT_EDIT',
  payload: { discardContentEdit },
});

export const setUploadDocVisible = (payload) => ({
  type: 'SET_UPLOAD_DOC_VISIBLE',
  payload,
});

export const setSignatureWidgetSelected = (signatureWidgetSelected) => ({
  type: 'SET_SIGNATURE_WIDGET_SELECTED',
  payload: { signatureWidgetSelected },
});

export const setHasAppliedRedaction = (hasAppliedRedaction) => ({
  type: 'SET_HAS_APPLIED_REDACTION',
  payload: { hasAppliedRedaction },
});

export const openPreviewOriginalVersionMode = () => ({
  type: 'OPEN_PREVIEW_ORIGINAL_VERSION_MODE',
});

export const closePreviewOriginalVersionMode = () => ({
  type: 'CLOSE_PREVIEW_ORIGINAL_VERSION_MODE',
});

export const setIsInContentEditMode = (isInContentEditMode) => ({
  type: 'SET_IS_IN_CONTENT_EDIT_MODE',
  payload: { isInContentEditMode },
});

export const setIsLoadingDocument = (isLoadingDocument) => ({
  type: 'SET_IS_LOADING_DOCUMENT',
  payload: { isLoadingDocument },
});

export const setIsDocumentLoaded = (isDocumentLoaded) => ({
  type: 'SET_IS_DOCUMENT_LOADED',
  payload: { isDocumentLoaded },
});

export const setInternalAnnotationIds = (internalAnnotationIds) => ({
  type: 'SET_INTERNAL_ANNOTATION_IDS',
  payload: { internalAnnotationIds },
});

export const setupViewerLoadingModal = (payload) => ({
  type: 'SETUP_VIEWER_LOADING_MODAL',
  payload,
});

export const steppingViewerLoadingModal = (currentStep) => ({
  type: 'STEPPING_VIEWER_LOADING_MODAL',
  payload: { currentStep },
});

export const resetViewerLoadingModal = () => ({
  type: 'RESET_VIEWER_LOADING_MODAL',
});

export const setShouldShowOCRBanner = (shouldShowOCRBanner) => ({
  type: 'SET_SHOW_OCR_BANNER',
  payload: { shouldShowOCRBanner },
});

export const setRubberStamps = (rubberStamps) => ({
  type: 'SET_RUBBER_STAMPS',
  payload: { rubberStamps },
});

export const setRubberStampSkip = (skip) => ({
  type: 'SET_RUBBER_STAMPS_SKIP',
  payload: { skip },
});

export const setShouldFetchRubberStampOnInit = (shouldFetchOnInit) => ({
  type: 'SET_RUBBER_STAMPS_SHOULD_FETCH_ON_INIT',
  payload: { shouldFetchOnInit },
});

export const overrideWholeRubberStampList = (rubberStamps) => ({
  type: 'OVERRIDE_WHOLE_RUBBER_STAMP_LIST',
  payload: { rubberStamps },
});

export const setIsConvertingBase64ToSignedUrl = (isConvertingBase64ToSignedUrl) => ({
  type: 'SET_IS_CONVERTING_BASE64_TO_SIGNED_URL',
  payload: { isConvertingBase64ToSignedUrl },
});

export const setDownloadType = (downloadType) => ({
  type: 'SET_DOWNLOAD_TYPE',
  payload: { downloadType },
});

export const setIsDocumentReady = (isDocumentReady) => ({
  type: 'SET_IS_DOCUMENT_READY',
  payload: {
    isDocumentReady,
  },
});

export const setOutlineEvent = (outlineEvent) => ({
  type: 'SET_OUTLINE_EVENT',
  payload: {
    outlineEvent,
  },
});

export const setIsLoadingDocumentOutlines = (isLoadingGetDocumentOutlines) => ({
  type: 'SET_LOADING_DOCUMENT_OUTLINES',
  payload: {
    isLoadingGetDocumentOutlines,
  },
});

export const setIsSummarizing = (isSummarizing) => ({
  type: 'SET_IS_SUMMARIZING',
  payload: {
    isSummarizing,
  },
});

export const setIsRegeneratingSummary = (isRegeneratingSummary) => ({
  type: 'SET_IS_REGENERATING_SUMMARY',
  payload: {
    isRegeneratingSummary,
  },
});

export const setCurrentSummaryDocVersion = (currentSummaryDocVersion) => ({
  type: 'SET_CURRENT_SUMMARY_DOC_VERSION',
  payload: {
    currentSummaryDocVersion,
  },
});

export const setOpenedElementData = (dataElement, openedElementData) => ({
  type: 'SET_OPENED_ELEMENT_DATA',
  payload: {
    dataElement,
    openedElementData,
  },
});

export const setIsEmbeddedJavascript = (isEnableEmbeddedJavascript) => ({
  type: 'SET_ENABLE_EMBEDDED_JAVASCRIPT',
  payload: {
    isEnableEmbeddedJavascript,
  }
});

export const setFlattenPdf = (flattenPdf) => ({
  type: 'SET_FLATTEN_PDF',
  payload: { flattenPdf },
});
