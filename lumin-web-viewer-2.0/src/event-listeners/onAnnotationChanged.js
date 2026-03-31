import core from 'core';

import DetectedFieldPlaceholder from 'helpers/CustomAnnotation/DetectedFieldPlaceholder';
import setDimensionCustomDataForAnnotation from 'helpers/setDimensionCustomDataForAnnotation';
import transformAnnotationDimension from 'helpers/transformAnnotationDimension';

import { updateAnnotationAvatarSourceOnAdded } from 'features/Annotation/utils/updateAnnotationAvatarSourceOnAdded';

import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import { ANNOTATION_ACTION, AnnotationSubjectMapping } from 'constants/documentConstants';

export default () =>
  (annotations, action, { imported, source } = {}) => {
    if (annotations.some((annot) => annot instanceof DetectedFieldPlaceholder)) {
      return;
    }
    switch (action) {
      case ANNOTATION_ACTION.ADD: {
        if (!imported) {
          updateAnnotationAvatarSourceOnAdded(annotations);
        }
        const listEditContentPlaceholder = annotations.filter((annot) => annot.isContentEditPlaceholder());
        if (listEditContentPlaceholder.length > 0 && !core.getContentEditManager().isInContentEditMode()) {
          core.deleteAnnotations(listEditContentPlaceholder, { imported: true });
        }
        if (
          annotations.some((annot) => annot instanceof window.Core.Annotations.SignatureWidgetAnnotation) &&
          core.getContentEditManager().isInContentEditMode()
        ) {
          core.getAnnotationsList().forEach((annot) => {
            if (annot.ModifiedByContentEditMode) {
              delete annot.ModifiedByContentEditMode;
              annot.NoDelete = false;
            }
          });
        }
        setDimensionCustomDataForAnnotation(annotations);
        break;
      }
      case ANNOTATION_ACTION.MODIFY: {
        if (!imported) {
          transformAnnotationDimension(annotations);
        }
        break;
      }
      case ANNOTATION_ACTION.DELETE: {
        if (!imported) {
          const signatureAnnots = annotations.filter((annot) => annot.Subject === AnnotationSubjectMapping.signature);
          signatureAnnots.forEach((signature) => {
            const widgetId = signature.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key);
            const widget = core.getAnnotationManager().getAnnotationById(widgetId);
            if (widget) {
              widget.setAssociatedSignatureAnnotation(null);
              widget.styledInnerElement();
            }
          });
        }
        if (source === 'contentEditTool') {
          const signatureWidgets = annotations.filter(
            (widget) => widget instanceof window.Core.Annotations.SignatureWidgetAnnotation
          );
          signatureWidgets.forEach((widget) => {
            const signature = widget.getAssociatedSignatureAnnotation();
            if (signature) {
              signature.NoDelete = true;
              signature.ModifiedByContentEditMode = true;
            }
          });
        }
        break;
      }
      default:
        break;
    }
  };
