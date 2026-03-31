import debounce from 'lodash/debounce';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { LocalStorageKey } from 'constants/localStorageKey';
import { TOOLS_NAME } from 'constants/toolsName';

const ZOOM_UPDATE_DEBOUNCE_TIME = 300;

export default (store) => debounce((zoom) => {
  const { dispatch, getState } = store;
  dispatch(actions.setZoom(zoom));
  if (selectors.getAnnotationsLoaded(getState())) {
    localStorage.setItem(LocalStorageKey.VIEWER_ZOOMING_LEVEL, zoom.toFixed(2));
  }
  const tool = core.getToolMode();
  if ([TOOLS_NAME.RUBBER_STAMP, TOOLS_NAME.SIGNATURE].includes(tool.name)) {
    tool.hidePreview();
    tool.showPreview();
  }
}, ZOOM_UPDATE_DEBOUNCE_TIME);
