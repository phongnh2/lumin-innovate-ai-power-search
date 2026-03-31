import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';

const setAssociatedSignatureAnnotation = ({ annotation, signatureWidgets }) => {
  const associateWidgetAnnotation = signatureWidgets.find(
    (annot) => annot.Id === annotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key)
  );
  if (associateWidgetAnnotation) {
    /*
      The signature widget cannot call setAssociatedSignatureAnnotation successfully if it is having READ_ONLY flag.
      Therefore, we need turn off that flag before calling setAssociatedSignatureAnnotation API
    */
    const field = associateWidgetAnnotation.getField();
    const isReadOnly = field.flags.get(window.Core.Annotations.WidgetFlags.READ_ONLY);
    if (isReadOnly) {
      field.flags.set(window.Core.Annotations.WidgetFlags.READ_ONLY, false);
    }
    associateWidgetAnnotation.setAssociatedSignatureAnnotation(annotation);
    if (isReadOnly) {
      field.flags.set(window.Core.Annotations.WidgetFlags.READ_ONLY, true);
    }
  }
};

export default setAssociatedSignatureAnnotation;
