import actions from 'actions';
import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import fireEvent from 'helpers/fireEvent';

export default (dispatch) => () => {
  const currentDisplayMode = core.getDisplayMode();
  const reduxDisplayMode = selectors.getDisplayMode(store.getState());

  dispatch(actions.closeElements(['annotationPopup', 'textPopup', 'contextMenuPopup']));

  if (currentDisplayMode !== reduxDisplayMode) {
    dispatch(actions.setDisplayMode(currentDisplayMode));
  }

  fireEvent('layoutModeChanged', [core.getDisplayModeObject()]);
};
