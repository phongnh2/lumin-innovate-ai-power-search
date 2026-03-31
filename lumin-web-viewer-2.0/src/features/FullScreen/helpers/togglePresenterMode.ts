import { debounce } from 'lodash';
import { batch } from 'react-redux';
import { AnyAction } from 'redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import { isComment } from 'luminComponents/CommentPanel/helper';

import logger from 'helpers/logger';
import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';

import { quickSearchSelectors, setIsOpenQuickSearch } from 'features/QuickSearch/slices';

import { DataElements } from 'constants/dataElement';
import { PageToolViewMode } from 'constants/documentConstants';
import fitMode from 'constants/fitMode';

import { exitFullScreen, isInFullScreen, requestFullScreen } from './fullScreenAPI';
import { fullScreenActions } from '../slice';

const { dispatch } = store;

const handlePageEditMode = (): void => {
  const state = store.getState();
  const isPageEditMode = selectors.isPageEditMode(state);

  if (!isPageEditMode) {
    return;
  }

  dispatch(actions.changePageEditDisplayMode(PageToolViewMode.LIST) as AnyAction);
};

const prepareAnnotationsForPresenterMode = (): void => {
  core.deselectAllAnnotations();
  core.getAnnotationsList().forEach((annotation) => {
    annotation.Listable = false;

    if (isComment(annotation) && !annotation.Hidden) {
      annotation.Hidden = true;
      annotation.TemporaryHidden = true;
    }
  });
  core.enableReadOnlyMode();
};

const onZoomUpdated = () => {
  dispatch(fullScreenActions.setDefaultZoom(core.getZoom()));
};

const ZOOM_UPDATE_DEBOUNCE = 1000;

const configureViewSettings = (): void => {
  /**
   * This is a workaround to ensure that the zoom is updated before the full screen is requested
   * because the setDisplayMode also triggers the zoomUpdated event
   */
  core.addEventListener('zoomUpdated', debounce(onZoomUpdated, ZOOM_UPDATE_DEBOUNCE), { once: true });
  core.setDisplayMode(core.CoreControls.DisplayModes.Single);
  core.setFitMode(fitMode.FitPage);
};

const configurePresenterModeView = (): void => {
  const state = store.getState();
  const pageEditDisplayMode = selectors.pageEditDisplayMode(state);
  dispatch(
    actions.enterPresenterMode({
      viewControlDisplayMode: core.getDisplayMode(),
      pageEditDisplayMode,
    }) as AnyAction
  );
  handlePageEditMode();
  prepareAnnotationsForPresenterMode();
  configureViewSettings();
};

const toggleFullScreen = () => {
  const state = store.getState();
  const isFullScreen = selectors.isFullScreen(state);

  if (isInFullScreen() && !isFullScreen) {
    exitFullScreen(document).catch((error) => {
      logger.logError({
        message: 'Failed to exit full screen',
        error: error as Error,
      });
    });
    return;
  }

  requestFullScreen(document.documentElement)
    .then(configurePresenterModeView)
    .catch((error) => {
      dispatch(actions.exitPresenterMode() as AnyAction);
      logger.logError({
        message: 'Failed to request full screen',
        error: error as Error,
      });
    });
};

const triggerFullScreenMode = () => {
  const state = store.getState();
  const isInContentEditMode = selectors.isInContentEditMode(state);
  if (isInContentEditMode) {
    batch(() => {
      dispatch(actions.setIsToolPropertiesOpen(false) as AnyAction);
      dispatch(actions.setToolPropertiesValue(TOOL_PROPERTIES_VALUE.DEFAULT) as AnyAction);
      dispatch(actions.setToolbarValue(LEFT_SIDE_BAR_VALUES.POPULAR.value) as AnyAction);
    });
  }

  toggleFullScreen();
};

export const togglePresenterMode = () => {
  const state = store.getState();
  const isPreviewOriginalVersionMode = selectors.isPreviewOriginalVersionMode(state);
  const isModalOpen = selectors.isElementOpen(state, DataElements.VIEWER_LOADING_MODAL);
  const isOpenQuickSearch = quickSearchSelectors.isOpenQuickSearch(state);

  if (isPreviewOriginalVersionMode || isModalOpen) {
    return;
  }

  if (isOpenQuickSearch) {
    dispatch(setIsOpenQuickSearch(false));
  }

  const shouldPreventEvent =
    toggleFormFieldCreationMode(null, { callback: triggerFullScreenMode }) ||
    promptUserChangeToolMode({
      triggerWhenConfirm: triggerFullScreenMode,
      triggerWhenCancel: () => {
        triggerFullScreenMode();
        dispatch(actions.openElement(DataElements.LOADING_MODAL) as AnyAction);
      },
    });
  if (shouldPreventEvent) {
    return;
  }

  triggerFullScreenMode();
};
