import rafSchd from 'raf-schd';

import * as eventListeners from 'src/event-listeners';

import core from 'core';
import selectors from 'selectors';

import { store } from '../redux/store';

const { dispatch, getState } = store;
const shapeToolsName = selectors.getToolNamesByGroup(getState(), 'shapeTools');

const onBeforeDocumentLoaded = eventListeners.onBeforeDocumentLoaded(dispatch);
const onDisplayModeUpdated = eventListeners.onDisplayModeUpdated(dispatch);
const onDocumentLoaded = eventListeners.onDocumentLoaded(store);
const onDocumentUnloaded = eventListeners.onDocumentUnloaded(dispatch);
const onFitModeUpdated = eventListeners.onFitModeUpdated(dispatch);
const onRotationUpdated = eventListeners.onRotationUpdated(dispatch);
const onToolUpdated = eventListeners.onToolUpdated(dispatch);
const onToolModeUpdated = eventListeners.onToolModeUpdated(store);
const onZoomUpdated = eventListeners.onZoomUpdated(store);
const onPageNumberUpdated = eventListeners.onPageNumberUpdated(dispatch);
const onUpdateAnnotationPermission = eventListeners.onUpdateAnnotationPermission(store);
const onAnnotationChanged = eventListeners.onAnnotationChanged(dispatch);
const onAnnotationSelected = eventListeners.onAnnotationSelected();
const onAnnotationsLoaded = eventListeners.onAnnotationsLoaded(dispatch);
const onStampAnnotationAdded = eventListeners.onStampAnnotationAdded(dispatch);
const onSignatureAnnotationAdded = eventListeners.onSignatureAnnotationAdded(store);
const onStickyAnnotationAdded = eventListeners.onStickyAnnotationAdded(store);
const onKeyDown = eventListeners.onKeyDown(store);
const onFullScreenChange = eventListeners.onFullScreenChange(store);
const onPagesUpdated = eventListeners.onPagesUpdated(dispatch);
const onLocationSelected = eventListeners.onLocationSelected(store);
const onRubberStampAnnotationAdded = eventListeners.onRubberStampAnnotationAdded(store);
const onPageComplete = eventListeners.onPageComplete(store);
// const onFileAttachmentAnnotationAdded = eventListeners.onFileAttachmentAnnotationAdded(dispatch);
// const onFileAttachmentDataAvailable = eventListeners.onFileAttachmentDataAvailable(dispatch);
// const onHistoryChanged = eventListeners.onHistoryChanged(dispatch, store);
const onPaste = eventListeners.onPaste(store);
const onCopy = eventListeners.onCopy(store);
const onAnnotationDoubleClicked = eventListeners.onAnnotationDoubleClicked();
const onDateFreeTextAnnotationAdded = eventListeners.onDateFreeTextAnnotationAdded();
const onShapeAnnotationAdded = eventListeners.onShapeAnnotationAdded();
const onErasingAnnotation = eventListeners.onErasingAnnotation();
const onClickOutsideViewer = eventListeners.onClickOutsideViewer(store);
const onDocumentReady = eventListeners.onDocumentReady(dispatch);
const onIconStampAdded = eventListeners.onIconStampAdded();
const onMeasureAnnotationAdded = eventListeners.onMeasureAnnotationAdded();
const onEditorTextChanged = rafSchd(eventListeners.onEditorTextChanged());

const onKeyUp = eventListeners.onKeyUp(store);
export const addEventHandlers = (enableKeyboardEvent = false) => {
  if (enableKeyboardEvent) {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return;
  }
  core.addEventListener('beforeDocumentLoaded', onBeforeDocumentLoaded);
  core.addEventListener('displayModeUpdated', onDisplayModeUpdated);
  core.addEventListener('documentLoaded', onDocumentLoaded);
  core.addEventListener('documentUnloaded', onDocumentUnloaded);
  core.addEventListener('fitModeUpdated', onFitModeUpdated);
  core.addEventListener('rotationUpdated', onRotationUpdated);
  core.addEventListener('toolUpdated', onToolUpdated);
  core.addEventListener('toolModeUpdated', onToolModeUpdated);
  core.addEventListener('zoomUpdated', onZoomUpdated);
  core.addEventListener('pageNumberUpdated', onPageNumberUpdated);
  core.addEventListener('pagesUpdated', onPagesUpdated);
  core.addEventListener('updateAnnotationPermission', onUpdateAnnotationPermission);
  core.addEventListener('annotationChanged', onAnnotationChanged);
  core.addEventListener('annotationSelected', onAnnotationSelected);
  core.addEventListener('annotationsLoaded', onAnnotationsLoaded);
  // core.addEventListener('historyChanged', onHistoryChanged);
  core.addEventListener('pageComplete', onPageComplete);
  core.addEventListener('annotationDoubleClicked', onAnnotationDoubleClicked);
  core.addEventListener('editorTextChanged', onEditorTextChanged);
  // core.addEventListener('fileAttachmentDataAvailable', onFileAttachmentDataAvailable);
  core.docViewer.addEventListener('documentReady', onDocumentReady);
  core.getTool('AnnotationCreateStamp').addEventListener('annotationAdded', onStampAnnotationAdded);
  core.getTool('AnnotationCreateSticky').addEventListener('annotationAdded', onStickyAnnotationAdded);
  core.getTool('AnnotationCreateSignature').addEventListener('locationSelected', onLocationSelected);
  core.getTool('AnnotationCreateSignature').addEventListener('annotationAdded', onSignatureAnnotationAdded);
  core.getTool('AnnotationCreateDateFreeText').addEventListener('annotationAdded', onDateFreeTextAnnotationAdded);
  core.getTool('AnnotationCreateRedaction').addEventListener('annotationAdded', onShapeAnnotationAdded);
  core.getTool('AnnotationEraserTool').addEventListener('erasingAnnotation', onErasingAnnotation);
  ['AnnotationCreateDotStamp', 'AnnotationCreateTickStamp', 'AnnotationCreateCrossStamp'].forEach((toolName) => {
    core.getTool(toolName).addEventListener('locationSelected', core.getTool(toolName).addIconStamp);
    core.getTool(toolName).addEventListener('annotationAdded', onIconStampAdded);
  });
  [
    'AnnotationCreateDistanceMeasurement',
    'AnnotationCreateArcMeasurement',
    'AnnotationCreatePerimeterMeasurement',
    'AnnotationCreateAreaMeasurement',
    'AnnotationCreateEllipseMeasurement',
    'AnnotationCreateRectangularAreaMeasurement',
  ].forEach((toolName) => {
    core.getTool(toolName).addEventListener('annotationAdded', onMeasureAnnotationAdded);
  });
  shapeToolsName.forEach((toolName) => {
    core.getTool(toolName).addEventListener('annotationAdded', onShapeAnnotationAdded);
  });

  core.getTool('AnnotationCreateRubberStamp').addEventListener('annotationAdded', onRubberStampAnnotationAdded);
  core
    .getFormFieldCreationManager()
    .addEventListener('formFieldCreationModeStarted', eventListeners.onFormFieldCreationModeStarted);
  core
    .getFormFieldCreationManager()
    .addEventListener('formFieldCreationModeEnded', eventListeners.onFormFieldCreationModeEnded);
  // core.getTool('AnnotationCreateFileAttachment').on('annotationAdded', onFileAttachmentAnnotationAdded);
  // hotkeysManager.initialize(store);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  document.addEventListener('fullscreenchange', onFullScreenChange);
  document.addEventListener('mozfullscreenchange', onFullScreenChange);
  document.addEventListener('webkitfullscreenchange', onFullScreenChange);
  document.addEventListener('MSFullscreenChange', onFullScreenChange);
  document.addEventListener('paste', onPaste);
  document.addEventListener('copy', onCopy);
  document.addEventListener('mousedown', onClickOutsideViewer);
  document.addEventListener('touchstart', onClickOutsideViewer);
};

export const removeEventHandlers = (disableKeyboardEvent = false) => {
  if (disableKeyboardEvent) {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    return;
  }
  core.removeEventListener('beforeDocumentLoaded', onBeforeDocumentLoaded);
  core.removeEventListener('displayModeUpdated', onDisplayModeUpdated);
  core.removeEventListener('documentLoaded', onDocumentLoaded);
  core.removeEventListener('documentUnloaded', onDocumentUnloaded);
  core.removeEventListener('fitModeUpdated', onFitModeUpdated);
  core.removeEventListener('rotationUpdated', onRotationUpdated);
  core.removeEventListener('toolUpdated', onToolUpdated);
  core.removeEventListener('toolModeUpdated', onToolModeUpdated);
  core.removeEventListener('zoomUpdated', onZoomUpdated);
  core.removeEventListener('pageNumberUpdated', onPageNumberUpdated);
  core.removeEventListener('pagesUpdated', onPagesUpdated);
  core.removeEventListener('updateAnnotationPermission', onUpdateAnnotationPermission);
  core.removeEventListener('annotationChanged', onAnnotationChanged);
  core.removeEventListener('annotationSelected', onAnnotationSelected);
  core.removeEventListener('annotationsLoaded', onAnnotationsLoaded);
  core.removeEventListener('pageComplete', onPageComplete);
  core.removeEventListener('annotationDoubleClicked', onAnnotationDoubleClicked);
  core.removeEventListener('editorTextChanged', onEditorTextChanged);
  // core.removeEventListener('fileAttachmentDataAvailable', onFileAttachmentDataAvailable);
  core.docViewer.removeEventListener('documentReady', onDocumentReady);
  core.getTool('AnnotationCreateStamp').removeEventListener('annotationAdded', onStampAnnotationAdded);
  core.getTool('AnnotationCreateSticky').removeEventListener('annotationAdded', onStickyAnnotationAdded);
  core.getTool('AnnotationCreateSignature').removeEventListener('locationSelected', onLocationSelected);
  core.getTool('AnnotationCreateDateFreeText').removeEventListener('annotationAdded', onDateFreeTextAnnotationAdded);
  core.getTool('AnnotationCreateRedaction').removeEventListener('annotationAdded', onShapeAnnotationAdded);
  core.getTool('AnnotationEraserTool').removeEventListener('erasingAnnotation', onErasingAnnotation);
  shapeToolsName.forEach((toolName) => {
    core.getTool(toolName).removeEventListener('annotationAdded', onShapeAnnotationAdded);
  });
  ['AnnotationCreateDotStamp', 'AnnotationCreateTickStamp', 'AnnotationCreateCrossStamp'].forEach((toolName) => {
    core.getTool(toolName).removeEventListener('locationSelected', core.getTool(toolName).addIconStamp);
    core.getTool(toolName).removeEventListener('annotationAdded', onIconStampAdded);
  });
  [
    'AnnotationCreateDistanceMeasurement',
    'AnnotationCreateArcMeasurement',
    'AnnotationCreatePerimeterMeasurement',
    'AnnotationCreateAreaMeasurement',
    'AnnotationCreateEllipseMeasurement',
    'AnnotationCreateRectangularAreaMeasurement',
  ].forEach((toolName) => {
    core.getTool(toolName).removeEventListener('annotationAdded', onMeasureAnnotationAdded);
  });

  core.getTool('AnnotationCreateRubberStamp').removeEventListener('annotationAdded', onRubberStampAnnotationAdded);
  core
    .getFormFieldCreationManager()
    .removeEventListener('formFieldCreationModeStarted', eventListeners.onFormFieldCreationModeStarted);
  core
    .getFormFieldCreationManager()
    .removeEventListener('formFieldCreationModeEnded', eventListeners.onFormFieldCreationModeEnded);
  // core.getTool('AnnotationCreateFileAttachment').off('annotationAdded', onFileAttachmentAnnotationAdded);
  // hotkeysManager.off();
  document.removeEventListener('fullscreenchange', onFullScreenChange);
  document.removeEventListener('mozfullscreenchange', onFullScreenChange);
  document.removeEventListener('webkitfullscreenchange', onFullScreenChange);
  document.removeEventListener('MSFullscreenChange', onFullScreenChange);
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('keyup', onKeyUp);
  document.removeEventListener('paste', onPaste);
  document.removeEventListener('copy', onCopy);
  document.removeEventListener('mousedown', onClickOutsideViewer);
  document.removeEventListener('touchstart', onClickOutsideViewer);
  onZoomUpdated.cancel();
  onFitModeUpdated.cancel();
};

export default {
  addEventHandlers,
  removeEventHandlers,
};
