import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import getAnnotationByPageCoordinates from 'helpers/getAnnotationByPageCoordinates';

import TOOLS_NAME from 'constants/toolsName';

async function handleDropSignature(store, e) {
  const { getState, dispatch } = store;
  const state = getState();
  const currentTool = core.getToolMode();
  const isPlacingMultipleSignatures = selectors.isPlacingMultipleSignatures(state);
  const documentWrapper = core.getViewerElement();
  const isDroppedInViewer = documentWrapper.contains(e.target);

  if (isPlacingMultipleSignatures) {
    return;
  }
  const signatureAnnotation = await currentTool.getFullSignatureAnnotation();
  if (!signatureAnnotation) {
    return;
  }
  if (!isDroppedInViewer) {
    dispatch(actions.setSignatureWidgetSelected(null));
    core.getTool(TOOLS_NAME.SIGNATURE).hidePreview();
    core.setToolMode(currentTool);
    return;
  }
  const { pageNumber, x, y } = core.getViewerCoordinatesFromMouseEvent(e);
  currentTool.location = { pageNumber, x, y };
  const annotByCoordinates = getAnnotationByPageCoordinates({ pageNumber, x, y });
  const params = [currentTool.location];
  const firstChild = annotByCoordinates?.innerElement?.firstChild;
  if (annotByCoordinates instanceof window.Core.Annotations.SignatureWidgetAnnotation && firstChild) {
    firstChild.click();
    params.push(annotByCoordinates);
  }
  currentTool.trigger('locationSelected', params);
}

async function handleDropRubberStamp(store, e) {
  const { getState } = store;
  const state = getState();
  const currentTool = core.getToolMode();
  const isPlacingMultipleRubberStamp = selectors.isPlacingMultipleRubberStamp(state);
  const documentWrapper = core.getViewerElement();
  const isDroppedInViewer = documentWrapper.contains(e.target);

  if (isPlacingMultipleRubberStamp) {
    return;
  }

  if (!isDroppedInViewer) {
    core.getTool(TOOLS_NAME.RUBBER_STAMP).hidePreview();
    core.setToolMode(currentTool);
    return;
  }
  const location = core.getViewerCoordinatesFromMouseEvent(e);
  if (!location) {
    return;
  }
  const { pageNumber, x, y } = location;

  currentTool.location = { pageNumber, x, y };

  currentTool.addStamp();
}

export default (store) => async (e) => {
  const { getState } = store;
  const state = getState();
  const openElements = selectors.getOpenElements(state);
  const selectedSignature = selectors.getSelectedDisplaySignature(state);
  if (
    core.getToolMode()?.name === TOOLS_NAME.SIGNATURE &&
    !openElements.signatureModal &&
    !openElements.signatureOverlay &&
    selectedSignature
  ) {
    await handleDropSignature(store, e);
  }

  if (core.getToolMode()?.name === TOOLS_NAME.RUBBER_STAMP) {
    await handleDropRubberStamp(store, e);
  }
};
