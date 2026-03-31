import core from 'core';
import selectors from 'selectors';

import defaultTool from 'constants/defaultTool';
import toolsName from 'constants/toolsName';

export default (store) => (e) => {
  const state = store.getState();
  const openElements = selectors.getOpenElements(state);
  const isAnnotationsLoaded = selectors.getAnnotationsLoaded(state);
  const viewer = core.getViewerElement();
  const isClickOutsideViewer = viewer && !viewer.contains(e.target);

  const toolName = core.getToolMode()?.name;
  // if isAnnotationsLoaded is true, all annotations are creating will be deleted
  // if annotations are being created are free text or date stamp, the core cannot get content of the quill from the annotation
  // so we need these lines to avoid the error
  const isUsingTextAnnotation = [toolsName.FREETEXT, toolsName.DATE_FREE_TEXT].includes(toolName);
  if (!isAnnotationsLoaded && isUsingTextAnnotation) {
    core.getTool(toolName).disableAutoFocusOnCreate();
  }

  if (
    isClickOutsideViewer &&
    toolName === toolsName.SIGNATURE &&
    !openElements.signatureModal &&
    !openElements.signatureOverlay
  ) {
    core.setToolMode(defaultTool);
  }
};