import core from 'core';

import documentServices from 'services/documentServices';

import fileUtil from 'utils/file';

import { CUSTOM_DATA_STAMP_ANNOTATION, CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { images } from 'constants/documentType';
import { DEFAULT_SIGNATURE_MAXIMUM_DIMENSION } from 'constants/signatureConstant';

import { IDocumentBase } from 'interfaces/document/document.interface';

const CANVAS_MULTIPLIER_FACTOR = 2;

export const imageCanvasMultiplier = window.Core.getCanvasMultiplier() * CANVAS_MULTIPLIER_FACTOR;

export const defaultMaxDimension = DEFAULT_SIGNATURE_MAXIMUM_DIMENSION * imageCanvasMultiplier;

export const getCanvasSize = ({
  imageWidth,
  imageHeight,
  pageWidth = defaultMaxDimension,
  pageHeight = defaultMaxDimension,
}: {
  imageWidth: number;
  imageHeight: number;
  pageWidth?: number;
  pageHeight?: number;
}) => {
  const imageRatio = imageHeight / imageWidth;
  const height = Math.min(imageHeight, pageHeight);
  const width = Math.min(imageWidth, pageWidth);

  if (imageRatio > 1) {
    return {
      height,
      width: height / imageRatio,
    };
  }
  return {
    width,
    height: width * imageRatio,
  };
};

export function convertSignatureToBase64(annotation: Core.Annotations.StampAnnotation & { image: HTMLImageElement }) {
  annotation.deleteCustomData(CUSTOM_DATA_STAMP_ANNOTATION.REMOTE_ID.key);
  const canvas = document.createElement('canvas');
  const { width, height } = getCanvasSize({
    imageWidth: annotation.image.width,
    imageHeight: annotation.image.height,
    pageWidth: annotation.Width * imageCanvasMultiplier,
    pageHeight: annotation.Height * imageCanvasMultiplier,
  });
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.drawImage(annotation.image, 0, 0, annotation.image.width, annotation.image.height, 0, 0, width, height);
  const mimeType = fileUtil.getMimeTypeFromSignedUrl(annotation.image.src);
  const base64Data = canvas.toDataURL(mimeType === images.JPEG ? mimeType : images.PNG);
  annotation.setImageData(base64Data);
}

export const removeSignedUrlSignature = async (
  {
    currentDocument,
  }: {
    currentDocument: IDocumentBase;
  },
  config?: {
    signal: AbortSignal;
  }
) => {
  const stampAnnotations = core
    .getAnnotationsList()
    .filter(
      (annotation) =>
        annotation.Subject === AnnotationSubjectMapping.signature &&
        annotation instanceof window.Core.Annotations.StampAnnotation &&
        !!annotation.getCustomData(CUSTOM_DATA_STAMP_ANNOTATION.REMOTE_ID.key)
    );
  if (!stampAnnotations.length) {
    return;
  }
  const signatureRemoteIds = stampAnnotations.map((annotation) =>
    annotation.getCustomData(CUSTOM_DATA_STAMP_ANNOTATION.REMOTE_ID.key)
  );
  await documentServices.deleteSignedUrlImage(
    { currentDocument, remoteIds: signatureRemoteIds },
    { signal: config?.signal }
  );
  if (config?.signal?.aborted) {
    return;
  }
  stampAnnotations.forEach((annotation: Core.Annotations.StampAnnotation & { image: HTMLImageElement }) => {
    if (config?.signal?.aborted) {
      return;
    }
    convertSignatureToBase64(annotation);
  });
};

export const getAssociatedSignatures = (annotations: Core.Annotations.Annotation[]) =>
  annotations.filter((annotation) => {
    if (![AnnotationSubjectMapping.signature, AnnotationSubjectMapping.stamp].includes(annotation.Subject)) {
      return false;
    }
    const widgetId = annotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key);
    const fieldName = annotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.key);
    const alternativefieldName = annotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.alternativeKey);
    if (widgetId) {
      const widget = core.getAnnotationManager().getAnnotationById(widgetId) as Core.Annotations.WidgetAnnotation & {
        fieldName: string;
      };
      if (widget) {
        // Need to set those custom data for mobile app
        annotation.setCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.key, widget.fieldName);
        annotation.setCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.alternativeKey, widget.fieldName);
        return true;
      }
    }
    if (!widgetId && (fieldName || alternativefieldName)) {
      const fieldManager = core.getAnnotationManager().getFieldManager();
      const field = fieldManager.getField(fieldName) as Core.Annotations.Forms.Field;
      if (field) {
        const findedWidget = field.widgets.find(
          (widget) => widget.PageNumber === annotation.PageNumber && widget.getRect().intersects(annotation.getRect())
        );
        if (findedWidget) {
          annotation.setCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key, findedWidget.Id);
          annotation.setCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.key, findedWidget.fieldName);
          return true;
        }
      }
    }
    return false;
  });
