import { batch } from 'react-redux';

import { LEFT_SIDE_BAR } from '@new-ui/components/LuminLeftSideBar/constants';
import { toolbarActions, toolbarSelectors } from '@new-ui/components/LuminToolbar/slices';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { ToolsDispatcher } from 'helpers/EventDispatcher';
import getAnnotationByPageCoordinates from 'helpers/getAnnotationByPageCoordinates';
import getAnnotationCenterPoint from 'helpers/getAnnotationCenterPoint';

import signatureUtils from 'utils/signature';

import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import { CUSTOM_EVENT } from 'constants/customEvent';
import DATA_ELEMENTS from 'constants/dataElement';
import { TOOLS_NAME } from 'constants/toolsName';

export default (store) => async (pageCoordinates, signatureWidget) => {
  const { getState, dispatch } = store;
  const state = getState();
  const toolbarValue = selectors.toolbarValue(state);
  const isToolbarPopoverVisible = toolbarSelectors.isToolbarPopoverVisible(state);
  const isSignatureToolExist = [LEFT_SIDE_BAR.POPULAR, LEFT_SIDE_BAR.FILL_AND_SIGN].includes(toolbarValue);

  const signatureTool = core.getTool(TOOLS_NAME.SIGNATURE);
  const signatureAnnotation = await signatureTool.getFullSignatureAnnotation();
  if (signatureAnnotation) {
    const annot = getAnnotationByPageCoordinates(pageCoordinates);
    if (annot instanceof window.Core.Annotations.SignatureWidgetAnnotation && !signatureWidget) {
      return;
    }
    if (signatureWidget) {
      signatureAnnotation.setCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key, signatureWidget.Id);
      signatureTool.location = getAnnotationCenterPoint(signatureWidget);
    }
    signatureTool.addSignature();
  } else {
    const currentUser = selectors.getCurrentUser(getState());
    const totalSignatures = currentUser ? signatureUtils.getNumberOfSignatures(currentUser) : 0;
    signatureTool.widget = signatureWidget;

    batch(() => {
      if (signatureWidget) {
        if (state.viewer.isPlacingMultipleSignatures) {
          dispatch(actions.setPlacingMultipleSignatures(false));
        }
        dispatch(actions.setSignatureWidgetSelected(signatureWidget));
      }
      if (totalSignatures) {
        if (!isSignatureToolExist) {
          initializeSignaturePopover(dispatch);
        } else {
          openExistingSignaturePopover({ dispatch, isToolbarPopoverVisible });
        }
      } else {
        openSignatureModal(dispatch);
      }
    });
  }
};

function openExistingSignaturePopover({ dispatch, isToolbarPopoverVisible }) {
  if (isToolbarPopoverVisible) {
    openSignatureListWithToolbarPopover(dispatch);
    return;
  }
  openSignaturePopover();
}

function initializeSignaturePopover(dispatch) {
  switchToPopularTab();
  window.addEventListener(
    CUSTOM_EVENT.TOOLBAR_RIGHT_SECTION_LOADED,
    (data) => onToolbarRightSectionLoaded(data, dispatch),
    { once: true }
  );
}

function openSignatureListWithToolbarPopover(dispatch) {
  dispatch(toolbarActions.setShouldOpenSignatureListPopover(true));
  dispatch(actions.openElement(DATA_ELEMENTS.TOOLBAR_POPOVER));
}

function onToolbarRightSectionLoaded(data, dispatch) {
  const { isToolbarPopoverVisible } = data.detail;
  if (isToolbarPopoverVisible) {
    openSignatureListWithToolbarPopover(dispatch);
    return;
  }
  const signatureButton = document.querySelector(`[data-element=${DATA_ELEMENTS.SIGNATURE_TOOL_BUTTON}]`);
  if (signatureButton) {
    signatureButton.click();
  }
}

function switchToPopularTab() {
  const popularTab = document.querySelector(`[data-element=${DATA_ELEMENTS.POPULAR_TAB}]`);
  popularTab.click();
}

function openSignatureModal(dispatch) {
  dispatch(actions.openElement(DATA_ELEMENTS.SIGNATURE_MODAL));
}

function openSignaturePopover() {
  ToolsDispatcher.openTool().dispatcher(TOOLS_NAME.SIGNATURE);
}
