import { AnyAction } from 'redux';

import actions from 'actions';
import { store } from 'store';

import { waitForEditBoxAvailable, startContentEditMode } from 'utils/setupEditBoxesListener';

import { DataElements } from 'constants/dataElement';

const { dispatch } = store;

export const openEditPdfMode = () => {
  dispatch(actions.openElement(DataElements.LOADING_MODAL) as AnyAction);
  waitForEditBoxAvailable(
    () => {
      dispatch(actions.closeElement(DataElements.LOADING_MODAL) as AnyAction);
    },
    { once: true }
  );
  startContentEditMode();
  dispatch(actions.setIsInContentEditMode(true) as AnyAction);
};
