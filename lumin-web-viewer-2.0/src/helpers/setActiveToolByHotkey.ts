import { AnyAction } from 'redux';

import { LEFT_SIDE_BAR } from '@new-ui/components/LuminLeftSideBar/constants';
import { leftSideBarActions, leftSideBarSelectors } from '@new-ui/components/LuminLeftSideBar/slices';
import { toolbarActions, toolbarSelectors } from '@new-ui/components/LuminToolbar/slices';

import actions from 'actions';
import selectors from 'selectors';
import { store } from 'store';

import activeToolsByHotkey from 'utils/activeToolsByHotkey';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { DataElements } from 'constants/dataElement';
import { hotkeyToolMap, numericCodeOfTools } from 'constants/toolsHotkey';
import { TOOLS_NAME } from 'constants/toolsName';

interface ActiveToolByHotkeyProps {
  actualKey: string;
  numericCode: number;
}

const openSignatureToolbarPopover = (shouldOpen: boolean) => {
  if (shouldOpen) {
    store.dispatch(toolbarActions.setShouldOpenSignatureListPopover(true));
    store.dispatch(actions.openElement(DataElements.TOOLBAR_POPOVER) as AnyAction);
  }
};

const handleSignatureToolActivation = () => {
  const state = store.getState();
  const toolbarValue = selectors.toolbarValue(state);
  const isToolbarPopoverOpened = selectors.isElementOpen(state, DataElements.TOOLBAR_POPOVER);
  const isLeftSidebarPopoverOpened = leftSideBarSelectors.isLeftSidebarPopoverOpened(state);
  const isToolbarPopoverVisible = toolbarSelectors.isToolbarPopoverVisible(state);
  const isSignatureToolExist = [LEFT_SIDE_BAR.POPULAR, LEFT_SIDE_BAR.FILL_AND_SIGN].includes(toolbarValue);

  if (isLeftSidebarPopoverOpened) {
    store.dispatch(leftSideBarActions.setIsLeftSidebarPopoverOpened(false));
  }

  const signatureToolButton: HTMLButtonElement = document.querySelector(
    `[data-element=${DataElements.SIGNATURE_TOOL_BUTTON}]`
  );
  if (isToolbarPopoverOpened && signatureToolButton) {
    signatureToolButton.click();
    return;
  }

  if (isSignatureToolExist) {
    openSignatureToolbarPopover(isToolbarPopoverVisible);
  } else {
    window.addEventListener(
      CUSTOM_EVENT.TOOLBAR_RIGHT_SECTION_LOADED,
      (data: CustomEvent<{ isToolbarPopoverVisible: boolean }>) =>
        openSignatureToolbarPopover(data.detail.isToolbarPopoverVisible),
      { once: true }
    );
  }
};

const setActiveToolByHotkey = async (props: ActiveToolByHotkeyProps) => {
  const { actualKey, numericCode } = props;
  const state = store.getState();
  const isOpenLoadingModal = selectors.isElementOpen(state, DataElements.VIEWER_LOADING_MODAL);
  const isPreviewOriginalVersionMode = selectors.isPreviewOriginalVersionMode(state);
  if (isOpenLoadingModal || isPreviewOriginalVersionMode) {
    return;
  }

  const key = actualKey.toLowerCase() || numericCodeOfTools[numericCode];
  const toolConfig = hotkeyToolMap[key];

  if (key && toolConfig) {
    if (toolConfig.subTool === TOOLS_NAME.SIGNATURE) {
      handleSignatureToolActivation();
    }
    await activeToolsByHotkey(toolConfig);
  }
};

export default setActiveToolByHotkey;
