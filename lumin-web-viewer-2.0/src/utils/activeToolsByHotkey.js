import i18next from 'i18next';

import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { getToolChecker } from 'helpers/getToolPopper';
import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';

import DataElements from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';
import { TOOLS_NAME } from 'constants/toolsName';

import { store } from '../redux/store';

export default async ({ toolElement, subToolElement, subTool }) => {
  const state = store.getState();
  const tabDataElement = getTabElementToSwitch(state, toolElement);
  if (tabDataElement) {
    waitingForSwitchToolbar({
      toolElement,
      subToolElement,
      subTool,
      tabDataElement,
    });
    return;
  }

  activeToolsByHotkey({ toolElement, subToolElement, subTool });
};

function getTabElementToSwitch(state, toolElement) {
  const toolbarValue = selectors.toolbarValue(state);

  const isTextOrStampTool = [DataElements.TEXT_TOOL_GROUP_BUTTON, DataElements.STAMP_TOOL_BUTTON].includes(toolElement);
  const isSignatureTool = toolElement === DataElements.SIGNATURE_TOOL_BUTTON;

  const isNotAnnotationTab = LEFT_SIDE_BAR_VALUES.ANNOTATION.value !== toolbarValue;
  const isNotPopularTab = LEFT_SIDE_BAR_VALUES.POPULAR.value !== toolbarValue;
  const isNotSignTab = LEFT_SIDE_BAR_VALUES.FILL_AND_SIGN.value !== toolbarValue;

  if (isTextOrStampTool && isNotAnnotationTab) {
    return LEFT_SIDE_BAR_VALUES.ANNOTATION.dataElement;
  }
  if (isSignatureTool && isNotSignTab && isNotPopularTab) {
    return LEFT_SIDE_BAR_VALUES.POPULAR.dataElement;
  }
  if (!isTextOrStampTool && !isSignatureTool && isNotPopularTab && isNotAnnotationTab) {
    return LEFT_SIDE_BAR_VALUES.POPULAR.dataElement;
  }
  return '';
}

function activeToolsByHotkey({ toolElement, subToolElement, subTool }) {
  const state = store.getState();
  const hasEnableSubTool = core.getToolMode().name === subTool;
  const toolButton = document.querySelector(`[data-element=${toolElement}]`);
  if (toolButton) {
    toolButton.click();
  }

  if (state.viewer.disabledElements[toolElement]?.disabled) {
    return;
  }

  if (
    subToolElement &&
    state.viewer.disabledElements[subToolElement] &&
    state.viewer.disabledElements[subToolElement].disabled
  )
    return;

  if (subTool && subTool !== TOOLS_NAME.SIGNATURE) {
    const currentDocument = selectors.getCurrentDocument(state);
    const currentUser = selectors.getCurrentUser(state);
    const toolChecker = getToolChecker({
      toolName: subTool,
      currentDocument,
      currentUser,
      translator: i18next.t,
    });
    const toggleSubTool = () => {
      if (hasEnableSubTool) {
        core.setToolMode(defaultTool);
      } else if (toolChecker.isToolAvailable) {
        store.dispatch(actions.setActiveToolGroup(selectors.getToolButtonObjects(state)[subTool].group));
        core.setToolMode(subTool);
      }
    };

    const shouldPreventEvent = promptUserChangeToolMode({ callback: toggleSubTool });
    if (!shouldPreventEvent) {
      toggleSubTool();
    }
  }
}

async function waitingForSwitchToolbar({ toolElement, subToolElement, subTool, tabDataElement }) {
  const callback = (_, observer) => {
    if (document.querySelector(`[data-element=${toolElement}]`)) {
      observer.disconnect();
      activeToolsByHotkey({ toolElement, subToolElement, subTool });
    }
  };

  const observerOptions = {
    childList: true,
    subtree: true,
  };

  const observer = new MutationObserver(callback);
  observer.observe(document.getElementById('ToolbarInner'), observerOptions);
  const tab = document.querySelector(`[data-element=${tabDataElement}]`);
  tab.click();
}
