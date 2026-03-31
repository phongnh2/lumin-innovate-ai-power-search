import { batch } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import { isInFullScreen } from 'features/FullScreen/helpers/fullScreenAPI';

import { PageToolViewMode } from 'constants/documentConstants';

export default ({ dispatch }: { dispatch: Dispatch }) =>
  () => {
    const state = store.getState();
    const isPageEditMode = selectors.isPageEditMode(state);
    const presenterModeRestoreState = selectors.presenterModeRestoreState(state);

    if (!isInFullScreen()) {
      core.getAnnotationsList().forEach((annotation) => {
        annotation.Listable = true;
        if (annotation.TemporaryHidden) {
          annotation.Hidden = false;
          annotation.TemporaryHidden = false;
        }
      });
      if (!isPageEditMode) {
        core.disableReadOnlyMode();
      }

      if (presenterModeRestoreState?.viewControlDisplayMode in core.CoreControls.DisplayModes) {
        core.setDisplayMode(presenterModeRestoreState.viewControlDisplayMode);
      }

      batch(() => {
        if (Object.values(PageToolViewMode).includes(presenterModeRestoreState?.pageEditDisplayMode)) {
          dispatch(actions.changePageEditDisplayMode(presenterModeRestoreState.pageEditDisplayMode) as AnyAction);
        }

        dispatch(actions.exitPresenterMode() as AnyAction);
      });
    }
  };
