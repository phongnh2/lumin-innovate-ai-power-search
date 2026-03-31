import { useDispatch, useSelector } from 'react-redux';

import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';
import { ToolName } from 'core/type';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';

import { startContentEditMode } from 'utils/setupEditBoxesListener';

import { TOOLS_NAME } from 'constants/toolsName';

export const useToggleSelectionTools = () => {
  const dispatch = useDispatch();
  const isPageEditMode = useSelector(selectors.isPageEditMode);
  const isInContentEditMode = useSelector(selectors.isInContentEditMode);

  const onClick = (toolName: ToolName) => {
    const shouldStopEvent =
      toggleFormFieldCreationMode() ||
      (!isInContentEditMode && promptUserChangeToolMode({ toolName: toolName as string }));
    if (shouldStopEvent) {
      return;
    }
    if (isPageEditMode) {
      dispatch(actions.setToolbarValue(LEFT_SIDE_BAR_VALUES.POPULAR.value));
      return;
    }
    core.setToolMode(toolName);

    /*
        TEMPORARY FIX LMV-4779: Will be removed when we upgrade core as newer version will automatically
        remain content edit mode when switch to pan tool
      */
    if (toolName === (TOOLS_NAME.PAN as ToolName) && isInContentEditMode) {
      startContentEditMode();
    }
    /* END */
  };

  return {
    onClick,
  };
};
