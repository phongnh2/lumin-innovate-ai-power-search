import actions from 'actions';
import core from 'core';

export default (dispatch) => () => {
  const canUndo = core.getAnnotationHistoryManager().canUndo();
  dispatch(actions.setCanUndo(canUndo));
  const canRedo = core.getAnnotationHistoryManager().canRedo();
  dispatch(actions.setCanRedo(canRedo));
};
