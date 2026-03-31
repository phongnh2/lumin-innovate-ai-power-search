import core from 'core';

import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import { ANNOTATION_ACTION } from 'constants/documentConstants';

export default () => (annotations, action) => {
  const annotManager = core.getAnnotationManager();
  if (action === ANNOTATION_ACTION.SELECTED) {
    const formFieldAnnotations = annotations.filter(
      (annot) => annot instanceof window.Core.Annotations.WidgetAnnotation
    );
    if (!core.getFormFieldCreationManager().isInFormFieldCreationMode()) {
      core.getAnnotationManager().deselectAnnotations(formFieldAnnotations);
    }
    annotManager.setRotationOptions({ isEnabled: annotations.length < 2 });

    annotations.forEach((annotation) => {
      if (annotation.editor?.shouldDeselect) {
        core.deselectAnnotation(annotation);
        annotation.editor.shouldDeselect = false;
      }
    });

    if (!ToolSwitchableChecker.isAnnotationLoaded()) {
      core.getAnnotationManager().deselectAnnotations(annotations);
      ToolSwitchableChecker.showWarningMessage();
    }
  }
};
