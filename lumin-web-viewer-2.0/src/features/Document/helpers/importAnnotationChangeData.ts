import core from 'core';

import getRichTextCSSStyle from 'helpers/getRichTextCSSStyle';

import { CUSTOM_DATA_REORDER_ANNOTATION, CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';

interface IProcessAnnotationParams {
  annotation: Core.Annotations.Annotation;
  pageWillBeDeleted: number;
}

/**
 * Sets the associated signature annotation for a widget field
 */
const setAssociatedSignatureForWidget = (
  widget: Core.Annotations.SignatureWidgetAnnotation,
  signatureAnnotation: Core.Annotations.StampAnnotation,
  field: Core.Annotations.Forms.Field
): void => {
  const isReadOnly = field.flags.get(window.Core.Annotations.WidgetFlags.READ_ONLY);

  if (isReadOnly) {
    field.flags.set(window.Core.Annotations.WidgetFlags.READ_ONLY, false);
  }

  widget.setAssociatedSignatureAnnotation(signatureAnnotation);

  if (isReadOnly) {
    field.flags.set(window.Core.Annotations.WidgetFlags.READ_ONLY, true);
  }

  (
    widget as unknown as Core.Annotations.SignatureWidgetAnnotation & { styledInnerElement: () => void }
  ).styledInnerElement();
};

const handleWidgetAssociation = (annotation: Core.Annotations.Annotation): void => {
  const annotManager = core.getAnnotationManager();
  const associatedWidgetId = annotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key);
  const fieldName =
    annotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.key) ||
    annotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.alternativeKey);

  if (associatedWidgetId) {
    const associatedSignature = annotManager.getAnnotationById(annotation.Id);
    const associatedWidget = annotManager.getAnnotationById(
      associatedWidgetId
    ) as Core.Annotations.SignatureWidgetAnnotation;
    const field = associatedWidget.getField();

    setAssociatedSignatureForWidget(associatedWidget, associatedSignature as Core.Annotations.StampAnnotation, field);
    associatedSignature.setCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.key, field.name);
    associatedSignature.setCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.alternativeKey, field.name);
    return;
  }

  if (fieldName && !associatedWidgetId) {
    const field = core.getAnnotationManager().getFieldManager().getField(fieldName) as Core.Annotations.Forms.Field;
    const associatedWidget = field?.widgets?.find(
      (widget: Core.Annotations.WidgetAnnotation) =>
        widget.PageNumber === annotation.PageNumber && widget.getRect().intersects(annotation.getRect())
    ) as Core.Annotations.SignatureWidgetAnnotation | undefined;

    if (associatedWidget) {
      annotation.setCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key, associatedWidget.Id);
      annotation.setCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.key, field.name);
      setAssociatedSignatureForWidget(associatedWidget, annotation as Core.Annotations.StampAnnotation, field);
    }
  }
};

const handleReorderType = (annotation: Core.Annotations.Annotation): void => {
  const annotManager = core.getAnnotationManager();
  const reorderType = annotation.getCustomData(CUSTOM_DATA_REORDER_ANNOTATION.REORDER_TYPE.key);

  if (reorderType) {
    if (reorderType === CUSTOM_DATA_REORDER_ANNOTATION.REORDER_TYPE.back) {
      annotManager.bringToBack(annotation);
    } else {
      annotManager.bringToFront(annotation);
    }
    annotation.setCustomData(CUSTOM_DATA_REORDER_ANNOTATION.REORDER_TYPE.key, '');
  }
};

const handleFreeTextStyling = (annotation: Core.Annotations.Annotation): void => {
  if (annotation instanceof window.Core.Annotations.FreeTextAnnotation) {
    const defaultStyle = annotation.getRichTextStyle()?.[0];
    const richTextStyle = getRichTextCSSStyle(annotation.getContents(), defaultStyle);

    if (richTextStyle) {
      annotation.setRichTextStyle(richTextStyle);
      annotation.IsModified = false;
    }
  }
};

const handleEllipseRotationControl = (annotation: Core.Annotations.Annotation): void => {
  if (annotation instanceof window.Core.Annotations.EllipseAnnotation) {
    annotation.disableRotationControl();
  }
};

const adjustPageNumberForDeletedPage = (annotation: Core.Annotations.Annotation, pageWillBeDeleted: number): void => {
  const pageNumber = annotation.PageNumber;
  const totalPages = core.getTotalPages();

  if (pageWillBeDeleted !== -1 && pageNumber !== totalPages && pageWillBeDeleted < pageNumber) {
    annotation.PageNumber -= 1;
  }
};

export const processImportedAnnotation = ({
  annotation,
  pageWillBeDeleted,
}: IProcessAnnotationParams): Core.Annotations.Annotation => {
  handleWidgetAssociation(annotation);
  adjustPageNumberForDeletedPage(annotation, pageWillBeDeleted);
  handleReorderType(annotation);
  handleFreeTextStyling(annotation);
  handleEllipseRotationControl(annotation);

  return annotation;
};

/**
 * Processes multiple annotations after import from XFDF
 */
export const processImportedAnnotations = (
  annotations: Core.Annotations.Annotation[],
  pageWillBeDeleted: number
): Core.Annotations.Annotation[] =>
  annotations.map((annotation) =>
    processImportedAnnotation({
      annotation,
      pageWillBeDeleted,
    })
  );
