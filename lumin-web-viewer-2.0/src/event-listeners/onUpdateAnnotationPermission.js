import core from 'core';
import actions from 'actions';
import defaultTool from 'constants/defaultTool';
import { PRIORITY_ONE } from 'constants/actionPriority';

export default (store) => () => {
  const { dispatch } = store;
  const isReadOnly = core.isReadOnlyModeEnabled();
  const elements = [
    'annotationPopup',
    'toolsButton',
    'linkButton',
  ];

  if (isReadOnly) {
    core.disableTools(store);
    dispatch(actions.disableElements(elements, PRIORITY_ONE));
    core.setToolMode(defaultTool);
  } else {
    core.enableTools(store);
    dispatch(actions.enableElements(elements, PRIORITY_ONE));
  }

  dispatch(actions.setReadOnly(core.isReadOnlyModeEnabled()));
  dispatch(actions.setAdminUser(core.isUserAdmin()));
  dispatch(actions.setUserName(core.getCurrentUser()));
  core.drawAnnotationsFromList(core.getSelectedAnnotations());
};
