import rafSchd from 'raf-schd';
import { AnyAction, Dispatch } from 'redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import { fullScreenSelectors } from 'features/FullScreen/slice';

const throttleSetCurrentPage = rafSchd((dispatch: Dispatch, pageNumber: number) => {
  dispatch(actions.setCurrentPage(pageNumber) as AnyAction);
});

export default (dispatch: Dispatch) => (pageNumber: number) => {
  const state = store.getState();
  const isInPresenterMode = selectors.isInPresenterMode(state);
  const presentationFitMode = fullScreenSelectors.presentationFitMode(state);
  if (isInPresenterMode) {
    core.setFitMode(presentationFitMode);
  }
  throttleSetCurrentPage(dispatch, pageNumber);
};
