import { AnyAction } from 'redux';

import actions from 'actions';
import core from 'core';
import { store } from 'store';

type WaitForEditBoxOptions = {
  once?: boolean;
};

export const startContentEditMode = () => {
  const { dispatch } = store;
  core.getContentEditManager().startContentEditMode();
  dispatch(actions.setIsWaitingForEditBoxes(true) as AnyAction);
};

export const waitForEditBoxAvailable = (callback: () => void, options: WaitForEditBoxOptions = { once: false }) => {
  const { dispatch } = store;
  const { once } = options;

  const onEditBoxAvailable = () => {
    dispatch(actions.setIsWaitingForEditBoxes(false) as AnyAction);
    callback();
  };

  window.Core.ContentEdit.addEventListener('editBoxesAvailable', onEditBoxAvailable, { once });
};
