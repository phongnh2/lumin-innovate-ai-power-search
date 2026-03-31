import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import defaultTool from 'constants/defaultTool';

export default ({ dispatch, getState }) =>
  (annotation) => {
    const state = getState();
    const isNotesPanelDisabled = selectors.isElementDisabled(state, 'notesPanel');
    const isLeftPanelOpen = selectors.isElementOpen(state, 'leftPanel');
    const isSearchPanelOpen = selectors.isElementOpen(state, 'searchPanel');
    core.setToolMode(defaultTool);

    if (isSearchPanelOpen) {
      dispatch(actions.closeElements(['searchPanel', 'searchOverlay']));
    }

    if (isNotesPanelDisabled) {
      return;
    }
    if (isLeftPanelOpen) {
      core.selectAnnotation(annotation);
      dispatch(actions.triggerNoteEditing());
    } else {
      // dispatch(actions.openElement('notesPanel'));
      // wait for the left panel to fully open
      core.selectAnnotation(annotation);
      setTimeout(() => {
        document.body.style.pointerEvents = '';
        dispatch(actions.triggerNoteEditing());
      }, 300);
    }
  };
