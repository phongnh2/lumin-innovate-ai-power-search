import { CoreEvent } from './eventType';

const getEventToObjectMap = (
  docViewer: Core.DocumentViewer
): Record<CoreEvent, Core.DocumentViewer | Core.AnnotationManager | Core.EditBoxManager | Core.ContentEditManager> => {
  const annotManager = docViewer.getAnnotationManager();
  const editBoxManager = annotManager.getEditBoxManager();
  const contentEditManager = docViewer.getContentEditManager();
  return {
    annotationsLoaded: docViewer,
    changePage: docViewer,
    click: docViewer,
    dblClick: docViewer,
    displayPageLocation: docViewer,
    keyDown: docViewer,
    keyUp: docViewer,
    mouseEnter: docViewer,
    mouseLeave: docViewer,
    mouseLeftDown: docViewer,
    mouseLeftUp: docViewer,
    mouseMove: docViewer,
    mouseRightDown: docViewer,
    mouseRightUp: docViewer,
    pageComplete: docViewer,
    searchInProgress: docViewer,
    textSelected: docViewer,
    beginRendering: docViewer,
    finishedRendering: docViewer,
    beforeDocumentLoaded: docViewer,
    displayModeUpdated: docViewer,
    documentLoaded: docViewer,
    documentUnloaded: docViewer,
    fitModeUpdated: docViewer,
    rotationUpdated: docViewer,
    toolUpdated: docViewer,
    toolModeUpdated: docViewer,
    zoomUpdated: docViewer,
    pageNumberUpdated: docViewer,
    pagesUpdated: docViewer,
    annotationSelected: annotManager,
    annotationChanged: annotManager,
    annotationsDrawn: annotManager,
    annotationDeselected: annotManager,
    updateAnnotationPermission: annotManager,
    addReply: annotManager,
    deleteReply: annotManager,
    annotationHidden: annotManager,
    annotationDoubleClicked: annotManager,
    annotationFiltered: annotManager,
    annotationToggled: annotManager,
    fieldChanged: annotManager,
    notify: annotManager,
    setNoteText: annotManager,
    fileAttachmentDataAvailable: annotManager,
    editorFocus: editBoxManager,
    editorBlur: editBoxManager,
    editorTextChanged: editBoxManager,
    editorSelectionChanged: editBoxManager,
    contentEditModeStarted: contentEditManager,
    contentEditModeEnded: contentEditManager,
    contentEditSelectionChange: contentEditManager,
    contentBoxEditEnded: contentEditManager,
    contentBoxEditStarted: contentEditManager,
    contentEditDocumentDigitallySigned: contentEditManager,
    contentEditPasswordRequired: contentEditManager,
  };
};

export const addEventListener = (
  docViewer: Core.DocumentViewer,
  event: CoreEvent,
  eventListener: (...params: unknown[]) => unknown,
  options?: { once: boolean }
): void => {
  const eventToObjectMap = getEventToObjectMap(docViewer);
  const object = eventToObjectMap[event];

  object.addEventListener(event, eventListener, options);
};

export const removeEventListener = (
  docViewer: Core.DocumentViewer,
  event: CoreEvent,
  eventListener: (...params: unknown[]) => unknown
): void => {
  const eventToObjectMap = getEventToObjectMap(docViewer);
  const object = eventToObjectMap[event];

  object.removeEventListener(event, eventListener);
};
