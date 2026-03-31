import { store } from 'src/redux/store';

import actions from 'actions';
import core from 'core';

import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';

export default async (xfdf) => {
  const { dispatch } = store;
  const annotManager = core.getAnnotationManager();
  const fieldManager = annotManager.getFieldManager();
  const formFieldCreationManager = core.getFormFieldCreationManager();

  const annotList = core.getAnnotationsList();
  const widgetAnnotations = annotList
    .filter((annot) => annot instanceof window.Core.Annotations.WidgetAnnotation);

  if (formFieldCreationManager.isInFormFieldCreationMode()) {
    dispatch(actions.setInitialWidgetXfdf(xfdf));
  }
  const signatureWidgetAnnotations = widgetAnnotations.filter(
    (annot) => annot instanceof window.Core.Annotations.SignatureWidgetAnnotation
  );
  signatureWidgetAnnotations.forEach((associatedWidget) => {
    const field = associatedWidget.getField();
    associatedWidget.flags.clear();
    field.flags.set(window.Core.Annotations.WidgetFlags.READ_ONLY, false);
  });
  const associatedSignatures = signatureWidgetAnnotations
    .map((annot) => annot.getAssociatedSignatureAnnotation())
    .filter(Boolean);
  /*
    We need to delete associated signatures manually with imported option.
    If we don't do this, when we delete widgets, it will delete signature without imported option.
  */
  annotManager.deleteAnnotations(associatedSignatures, { imported: true });
  fieldManager.getFields().forEach((field) => field.flags.clear());
  annotManager.deleteAnnotations(widgetAnnotations, { imported: true });
  const importedAnnots = await annotManager.importAnnotations(xfdf, {
    replace: window.Core.Annotations.WidgetAnnotation,
  });
  /*
    Need to add associated signture to Viewer again
    because when we delete signature widget it will delete associated annot
  */
  if (associatedSignatures.length) {
    associatedSignatures.forEach((annotation) => {
      const associatedWidgetId = annotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key);
      const associatedWidget = annotManager.getAnnotationById(associatedWidgetId);
      const field = associatedWidget.getField();
      const isReadOnly = field.flags.get(window.Core.Annotations.WidgetFlags.READ_ONLY);
      if (isReadOnly) {
        field.flags.set(window.Core.Annotations.WidgetFlags.READ_ONLY, false);
      }
      annotManager.addAnnotation(annotation, { imported: true });
      associatedWidget.setAssociatedSignatureAnnotation(annotation);
      if (isReadOnly) {
        field.flags.set(window.Core.Annotations.WidgetFlags.READ_ONLY, true);
      }
    });
    annotManager.drawAnnotationsFromList(associatedSignatures);
  }
  return importedAnnots;
};
