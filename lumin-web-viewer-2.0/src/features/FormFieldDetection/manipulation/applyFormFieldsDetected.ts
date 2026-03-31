import { v4 } from 'uuid';

import core from 'core';

import { eventTracking } from 'utils/recordUtil';

import { ANNOTATION_STYLE, AnnotationSubjectMapping } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import {
  AI_AUTO_ADDED,
  NEW_FORM_FIELD_IN_SESSION,
  getFieldNameMapping,
  TRN_ANNOT_LISTABLE,
  MAINTAIN_ASPECT_RATIO,
  FIELD_ID,
  FIELD_SESSION_ID,
} from 'constants/formBuildTool';

import { FormFieldDetection } from '../constants/detectionField.constant';
import { FORM_FIELD_DETECTION_TO_TYPE_MAPPER, TOOLS_NAME_TO_EVENT_TRACKING_NAME_MAPPER } from '../constants/mapper';
import { IFormFieldDetectionPrediction } from '../types/detectionField.type';
import { getTextFormFieldProperties } from '../utils/textFormField';

const createFormField = ({ name, options }: { name: string; options: object }) =>
  new window.Core.Annotations.Forms.Field(name, options);

const drawFormFieldWidget = async ({
  sessionId,
  field,
  widgetAnnot,
  prediction,
  annotationStyles,
}: {
  sessionId: string;
  field: Core.Annotations.Forms.Field;
  widgetAnnot: Core.Annotations.Annotation & { FontSize?: string };
  prediction: IFormFieldDetectionPrediction;
  annotationStyles?: Record<string, unknown> & { FontSize?: string };
}): Promise<Core.Annotations.Annotation> => {
  const { pageNumber, boundingRectangle } = prediction;
  const annotManager = core.getAnnotationManager();

  widgetAnnot.PageNumber = pageNumber;
  widgetAnnot.Author = core.getCurrentUser();
  widgetAnnot.Subject = AnnotationSubjectMapping.widget;
  widgetAnnot.X = boundingRectangle.x1;
  widgetAnnot.Y = boundingRectangle.y1;
  widgetAnnot.Width = boundingRectangle.x2 - boundingRectangle.x1;
  widgetAnnot.Height = boundingRectangle.y2 - boundingRectangle.y1;
  widgetAnnot.setCustomData(AI_AUTO_ADDED, 'true');
  widgetAnnot.setCustomData(NEW_FORM_FIELD_IN_SESSION, 'true');
  widgetAnnot.setCustomData(FIELD_ID, prediction.fieldId);
  widgetAnnot.setCustomData(FIELD_SESSION_ID, sessionId);
  widgetAnnot.setCustomData(TRN_ANNOT_LISTABLE, 'true');
  widgetAnnot.setCustomData(FIELD_ID, prediction.fieldId);
  if (annotationStyles?.FontSize) {
    widgetAnnot.FontSize = annotationStyles.FontSize;
  }

  if (prediction.fieldType === FormFieldDetection.CHECK_BOX) {
    widgetAnnot.setCustomData(MAINTAIN_ASPECT_RATIO, 'true');
  }

  annotManager.getFieldManager().addField(field);
  annotManager.addAnnotation(widgetAnnot);

  if (annotationStyles) {
    annotManager.setAnnotationStyles(widgetAnnot, annotationStyles);
  }

  await annotManager.drawAnnotationsFromList([widgetAnnot]);
  return widgetAnnot;
};

const applyFormField = async ({
  sessionId,
  prediction,
}: {
  sessionId: string;
  prediction: IFormFieldDetectionPrediction;
}): Promise<Core.Annotations.Annotation> => {
  if (prediction.fieldType === FormFieldDetection.RADIO_BOX) {
    return null;
  }

  const fieldMapping = getFieldNameMapping(FORM_FIELD_DETECTION_TO_TYPE_MAPPER[prediction.fieldType]);
  if (!fieldMapping) {
    return null;
  }

  const { isMultiline, fontSize } = getTextFormFieldProperties(prediction);
  const flags = new window.Core.Annotations.WidgetFlags({});
  if (isMultiline) {
    flags.set(window.Core.Annotations.WidgetFlags.MULTILINE, isMultiline);
  }

  const defaultColor = new window.Core.Annotations.Color(0, 0, 0, 0);
  const annotationStyles = {
    [ANNOTATION_STYLE.FILL_COLOR]: defaultColor,
    [ANNOTATION_STYLE.STROKE_COLOR]: defaultColor,
    ...(fontSize ? { [ANNOTATION_STYLE.FONT_SIZE]: `${fontSize}pt` } : {}),
  };

  const field = createFormField({
    name: `${fieldMapping.CUSTOM_NAME} ${v4()}`,
    options: {
      type: fieldMapping.TYPE,
      flags,
    },
  });
  const widgetAnnot = fieldMapping.ANNOTATION(field, fieldMapping.OPTION);
  return drawFormFieldWidget({
    sessionId,
    field,
    widgetAnnot,
    prediction,
    annotationStyles,
  });
};

const applyFormFieldsDetected = async ({
  sessionId,
  predictions,
}: {
  sessionId: string;
  predictions: IFormFieldDetectionPrediction[];
}) => {
  const trackingTypes = await Promise.all(
    predictions.map(async (prediction) => {
      const widgetAnnot = await applyFormField({ sessionId, prediction });
      if (!widgetAnnot) {
        return null;
      }

      return TOOLS_NAME_TO_EVENT_TRACKING_NAME_MAPPER[widgetAnnot.ToolName];
    })
  );

  const eventData = trackingTypes.reduce((acc, currentType) => {
    if (!currentType) {
      return acc;
    }

    return {
      ...acc,
      [currentType]: (acc[currentType] ?? 0) + 1,
    };
  }, {} as Record<string, number>);

  Object.entries(eventData).forEach(([key, value]) => {
    eventTracking(UserEventConstants.EventType.ADD_FORM_BUILDER_ELEMENT, {
      type: key,
      aiAutoAdded: true,
      total: value,
    }).catch(() => { });
  });
};

export { applyFormFieldsDetected };
