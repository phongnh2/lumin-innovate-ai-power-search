/// <reference path='./internalActions.d.ts' />
/* eslint-disable no-use-before-define */
import selectors from 'selectors';

import { isIOS, isAndroid } from 'helpers/device';
import getFilteredDataElements from 'helpers/getFilteredDataElements';

import { AnimationBanner } from 'constants/banner';
import { LocalStorageKey } from 'constants/localStorageKey';

export const resetViewer = () => ({
  type: 'RESET_VIEWER',
});

// viewer
export const disableElement = (dataElement, priority) => (dispatch, getState) => {
  if (dataElement === 'leftPanel') {
    dispatch(disableElements(['leftPanel', 'leftPanelButton'], priority));
  } else if (dataElement === 'stylePopup') {
    dispatch(disableElements(['toolStylePopup', 'annotationStylePopup'], priority));
  } else {
    const currentPriority = selectors.getDisabledElementPriority(getState(), dataElement);
    if (!currentPriority || priority >= currentPriority) {
      dispatch({ type: 'DISABLE_ELEMENT', payload: { dataElement, priority } });
    }
  }
};
export const disableElements = (dataElements, priority) => (dispatch, getState) => {
  const filteredDataElements = getFilteredDataElements(getState(), dataElements, priority);
  dispatch({ type: 'DISABLE_ELEMENTS', payload: { dataElements: filteredDataElements, priority } });
};
export const enableElement = (dataElement, priority) => (dispatch, getState) => {
  if (dataElement === 'leftPanel') {
    dispatch(enableElements(['leftPanel', 'leftPanelButton'], priority));
  } else if (dataElement === 'stylePopup') {
    dispatch(enableElements(['toolStylePopup', 'annotationStylePopup'], priority));
  } else {
    const currentPriority = selectors.getDisabledElementPriority(getState(), dataElement);
    if (!currentPriority || priority >= currentPriority) {
      dispatch({ type: 'ENABLE_ELEMENT', payload: { dataElement, priority } });
    }
  }
};
export const enableElements = (dataElements, priority) => (dispatch, getState) => {
  const filteredDataElements = getFilteredDataElements(getState(), dataElements, priority);

  dispatch({ type: 'ENABLE_ELEMENTS', payload: { dataElements: filteredDataElements, priority } });
};
export const setThumbnailMerging = (useThumbnailMerging = true) => ({
  type: 'SET_THUMBNAIL_MERGING',
  payload: { useThumbnailMerging },
});

export const setThumbnailReordering = (useThumbnailReordering = true) => ({
  type: 'SET_THUMBNAIL_REORDERING',
  payload: { useThumbnailReordering },
});

export const setThumbnailMultiselect = (useThumbnailMultiselect = true) => ({
  type: 'SET_THUMBNAIL_MULTISELECT',
  payload: { useThumbnailMultiselect },
});
export const setIsMultipleViewerMerging = (isMultipleViewerMerging = false) => ({
  type: 'SET_MULTI_VIEWER_MERGING',
  payload: { isMultipleViewerMerging },
});
export const setAllowPageNavigation = (allowPageNavigation = true) => ({
  type: 'SET_ALLOW_PAGE_NAVIGATION',
  payload: { allowPageNavigation },
});
export const setActiveToolNameAndStyle = (toolObject) => (dispatch, getState) => {
  const state = getState();
  let name;

  if (isIOS || isAndroid) {
    name = toolObject.name;
  } else {
    // on desktop, auto switch between AnnotationEdit and TextSelect is true when you hover on text
    // we do this to prevent this action from spamming the console
    name = (toolObject.name === 'TextSelect') ? 'AnnotationEdit' : toolObject.name;
  }

  if (state.viewer.activeToolName === name) {
    return;
  }
  dispatch({
    type: 'SET_ACTIVE_TOOL_NAME_AND_STYLES',
    payload: { toolName: name, toolStyles: toolObject.defaults || {} },
  });
};
export const setActiveToolStyles = (toolStyles = {}) => ({ type: 'SET_ACTIVE_TOOL_STYLES', payload: { toolStyles } });
export const setActiveToolGroup = (toolGroup) => (dispatch, getState) => {
  const currentActiveToolGroup = selectors.getActiveToolGroup(getState());

  if (currentActiveToolGroup === toolGroup) {
    return;
  }

  dispatch({
    type: 'SET_ACTIVE_TOOL_GROUP',
    payload: { toolGroup },
  });
};
export const setNotePopupId = (id) => ({ type: 'SET_NOTE_POPUP_ID', payload: { id } });
export const triggerNoteEditing = () => ({
  type: 'SET_NOTE_EDITING',
  payload: { isNoteEditing: true },
});
export const finishNoteEditing = () => ({
  type: 'SET_NOTE_EDITING',
  payload: { isNoteEditing: false },
});
export const setNoteEditingAnnotationId = (id) => ({
  type: 'SET_NOTE_EDITING_ANNOTATION_ID',
  payload: { noteEditingAnnotationId: id },
});
export const setFitMode = (fitMode) => ({ type: 'SET_FIT_MODE', payload: { fitMode } });
export const setZoom = (zoom) => ({ type: 'SET_ZOOM', payload: { zoom } });
export const setRotation = (rotation) => ({ type: 'SET_ROTATION', payload: { rotation } });
export const setDisplayMode = (displayMode) => ({ type: 'SET_DISPLAY_MODE', payload: { displayMode } });
export const setCurrentPage = (currentPage) => ({ type: 'SET_CURRENT_PAGE', payload: { currentPage } });
export const setFullScreen = (isFullScreen) => ({ type: 'SET_FULL_SCREEN', payload: { isFullScreen } });
export const enterPresenterMode = (restoreState) => ({
  type: 'ENTER_PRESENTER_MODE',
  payload: { restoreState: { ...restoreState } },
});
export const exitPresenterMode = () => ({ type: 'EXIT_PRESENTER_MODE', payload: {} });
export const setReadOnly = (isReadOnly) => ({ type: 'SET_READ_ONLY', payload: { isReadOnly } });
export const registerTool = (tool) => ({ type: 'REGISTER_TOOL', payload: { ...tool } });
export const unregisterTool = (toolName) => ({ type: 'UNREGISTER_TOOL', payload: { toolName } });
export const setPopupItems = (dataElement, items) => ({
  type: 'SET_POPUP_ITEMS',
  payload: {
    dataElement,
    items,
  },
});
export const setColorPalette = (colorMapKey, colorPalette) => ({
  type: 'SET_COLOR_PALETTE',
  payload: { colorMapKey, colorPalette },
});
export const setActivePalette = (colorMapKey, colorPalette) => ({
  type: 'SET_ACTIVE_PALETTE',
  payload: { colorMapKey, colorPalette },
});
export const setIconColor = (colorMapKey, color) => ({
  type: 'SET_ICON_COLOR',
  payload: { colorMapKey, color },
});
export const setColorMap = (colorMap) => ({
  type: 'SET_COLOR_MAP',
  payload: { colorMap },
});
export const setLeftPanelWidth = (width) => ({
  type: 'SET_LEFT_PANEL_WIDTH',
  payload: { width },
});
export const disableReplyForAnnotations = (func) => ({
  type: 'SET_REPLY_DISABLED_FUNC',
  payload: { func },
});

export const setMouseWheelZoom = (enableMouseWheelZoom = true) => ({
  type: 'SET_MOUSE_WHEEL_ZOOM',
  payload: { enableMouseWheelZoom },
});
// document
export const setTotalPages = (totalPages) => ({ type: 'SET_TOTAL_PAGES', payload: { totalPages } });
export const setOutlines = (outlines) => ({ type: 'SET_OUTLINES', payload: { outlines } });
export const setBookmarks = (bookmarks) => ({ type: 'SET_BOOKMARKS', payload: { bookmarks } });
export const setPasswordAttempts = (attempt) => ({ type: 'SET_PASSWORD_ATTEMPTS', payload: { attempt } });
export const setPasswordMessage = (message) => ({ type: 'SET_PASSWORD_MESSAGE', payload: { message } });
export const setPasswordModalSource = (source) => ({ type: 'SET_PASSWORD_MODAL_SOURCE', payload: { source } });
export const setPasswordProtectedDocumentName = (name) => ({
  type: 'SET_PASSWORD_PROTECTED_DOCUMENT_NAME',
  payload: { name },
});
export const setPrintQuality = (quality) => ({ type: 'SET_PRINT_QUALITY', payload: { quality } });
export const setLoadingProgress = (percent) => ({
  type: 'SET_LOADING_PROGRESS',
  payload: { progress: percent },
});
export const resetLoadingProgress = () => ({
  type: 'SET_LOADING_PROGRESS',
  payload: { progress: 0 },
});
export const resetDocument = () => ({
  type: 'RESET_DOCUMENT',
});

// user
export const setUserName = (userName) => ({ type: 'SET_USER_NAME', payload: { userName } });
export const setAdminUser = (isAdminUser) => ({ type: 'SET_ADMIN_USER', payload: { isAdminUser } });

// search
export const searchText = (searchValue, options) => ({ type: 'SEARCH_TEXT', payload: { searchValue, options } });
export const searchTextFull = (searchValue, options) => ({
  type: 'SEARCH_TEXT_FULL',
  payload: { searchValue, options },
});
export const addSearchListener = (func) => ({ type: 'ADD_SEARCH_LISTENER', payload: { func } });
export const removeSearchListener = (func) => ({ type: 'REMOVE_SEARCH_LISTENER', payload: { func } });
export const setSearchValue = (value) => ({ type: 'SET_SEARCH_VALUE', payload: { value } });
export const addResult = (result) => ({ type: 'ADD_RESULT', payload: { result } });
export const addResults = (results) => ({ type: 'ADD_RESULTS', payload: { results } });
export const setCaseSensitive = (isCaseSensitive) => ({ type: 'SET_CASE_SENSITIVE', payload: { isCaseSensitive } });
export const setWholeWord = (isWholeWord) => ({ type: 'SET_WHOLE_WORD', payload: { isWholeWord } });
export const setWildcard = (isWildcard) => ({
  type: 'SET_WILD_CARD',
  payload: { isWildcard },
});
export const setIsSearching = (isSearching) => ({ type: 'SET_IS_SEARCHING', payload: { isSearching } });
export const setNoResult = (noResult) => ({ type: 'SET_NO_RESULT', payload: { noResult } });
export const setSearchError = (errorMessage) => ({
  type: 'SET_SEARCH_ERROR',
  payload: { errorMessage },
});
export const resetSearch = () => ({ type: 'RESET_SEARCH', payload: {} });
export const setIsProgrammaticSearch = (isProgrammaticSearch) => ({
  type: 'SET_IS_PROG_SEARCH',
  payload: { isProgrammaticSearch },
});
export const setIsProgrammaticSearchFull = (isProgrammaticSearchFull) => ({
  type: 'SET_IS_PROG_SEARCH_FULL',
  payload: { isProgrammaticSearchFull },
});
export const setNoteTransformFunction = (noteTransformFunction) => ({
  type: 'SET_NOTE_TRANSFORM_FUNCTION',
  payload: { noteTransformFunction },
});
export const setDeactiveHeaderItem = (headerItemsArr) => (dispatch, getState) => {
  const state = getState();
  const headerItems = selectors.getActiveHeaderItems(state).filter((item) => !headerItemsArr.includes(item));
  dispatch({
    type: 'SET_HEADER_ITEMS',
    payload: {
      header: state.viewer.activeHeaderGroup,
      headerItems,
    },
  });
};

export const setUsingRichtext = () => ({
  type: 'SET_IS_USING_RICHTEXT',
  payload: { isUsingRichText: true },
});

export const setUnusedRichtext = () => ({
  type: 'SET_IS_USING_RICHTEXT',
  payload: { isUsingRichText: false },
});

export const setEditPdfVersion = (editPdfVersion) => ({
  type: 'SET_EDIT_PDF_VERSION',
  payload: { editPdfVersion },
});
export const setShouldShowRating = (shouldShowRating) => (dispatch, getState) => {
  if (shouldShowRating === AnimationBanner.HIDE) {
    dispatch({
      type: 'SET_SHOULD_SHOW_RATING',
      payload: {
        shouldShowRating: AnimationBanner.HIDE
      }
    });

    return;
  }

  const state = getState();
  const currentUser = selectors.getCurrentUser(state);
  const isRated = !!currentUser?.metadata?.ratedApp;

  const shouldShowRatingModal =
    !JSON.parse(localStorage.getItem(LocalStorageKey.SHOWED_RATING_APP)) && !isRated;

  if (!shouldShowRatingModal) {
    return;
  }

  localStorage.setItem(LocalStorageKey.SHOWED_RATING_APP, true);
  dispatch({
    type: 'SET_SHOULD_SHOW_RATING',
    payload: {
      shouldShowRating: AnimationBanner.SHOW
    },
  });

};
