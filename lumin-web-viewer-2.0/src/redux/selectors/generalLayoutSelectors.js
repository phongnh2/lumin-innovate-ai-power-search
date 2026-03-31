/// <reference path="./generalLayoutSelectors.d.ts" />

import { isPageEditMode, isPreviewOriginalVersionMode, isInContentEditMode } from 'selectors/exposedSelectors';

import { LayoutElements } from 'lumin-components/GeneralLayout/constants';

export const isToolPropertiesOpen = (state) => state.generalLayout.isToolPropertiesOpen;

export const toolPropertiesValue = (state) => state.generalLayout.toolPropertiesValue;

export const rightPanelValue = (state) => state.generalLayout.rightPanelValue;

export const isDefaultMode = (state) =>
  !isToolPropertiesOpen(state) &&
  !isPageEditMode(state) &&
  !isInContentEditMode(state) &&
  !isPreviewOriginalVersionMode(state);

export const toolbarValue = (state) => state.generalLayout.toolbarValue;

export const leftPanelValue = (state) => state.generalLayout.leftPanelValue;

export const isOpenSearchOverlay = (state) => state.generalLayout.isOpenSearchOverlay;

export const isCommentPanelOpen = (state) => state.generalLayout.isCommentPanelOpen;

export const isChatbotPanelOpen = (state) => rightPanelValue(state) === LayoutElements.CHATBOT;

export const isSearchPanelOpen = (state) => rightPanelValue(state) === LayoutElements.SEARCH;

export const isLeftPanelOpen = (state) => state.generalLayout.isLeftPanelOpen && isDefaultMode(state);

export const isRightPanelOpen = (state) => {
  if (isChatbotPanelOpen(state)) {
    return state.generalLayout.isRightPanelOpen && !isPreviewOriginalVersionMode(state);
  }
  return state.generalLayout.isRightPanelOpen && isDefaultMode(state);
};

export const isInFocusMode = (state) => state.generalLayout.isInFocusMode;
