/* eslint-disable no-use-before-define */
import core from 'core';

import { setAnnotationModified } from 'helpers/toggleFormFieldCreationMode';

import { ANNOTATION_STYLE } from 'constants/documentConstants';
import { getLastIndexByFormType, FORM_FIELD_TYPE, CURSOR_MARGIN } from 'constants/formBuildTool';
import toolsName from 'constants/toolsName';

export default ({
  type, fieldData, mouseLocation, isAnnotationSelected, annotation
}) => {
  const finalLocation = { ...mouseLocation, x: mouseLocation.x + CURSOR_MARGIN, y: mouseLocation.y + CURSOR_MARGIN };
  const annotationManager = core.getAnnotationManager();
  const fieldManager = annotationManager.getFieldManager();
  const formFieldCreationManager = core.getFormFieldCreationManager();
  const fieldLabels = formFieldCreationManager.getFieldLabels();

  if (isAnnotationSelected || isClickOutsidePage(finalLocation)) return;

  const field = getField(type, fieldData, fieldManager);
  fieldManager.addField(field);

  setDimensionForPlaceholder({ widgetAnnot: annotation, fieldData, mouseLocation: finalLocation });
  setPropertyForPlaceholder(type, annotation);
  annotation.setCustomData(fieldLabels.FIELD_NAME, field.name);
  annotationManager.addAnnotation(annotation);
  setAnnotationModified(true);
  core.getTool(annotation.ToolName).trigger('annotationAdded', [annotation]);
};

const getField = (type, fieldData, fieldManager) => {
  const flags = new window.Core.Annotations.WidgetFlags();
  if (type === FORM_FIELD_TYPE.RADIO) {
    flags.set(window.Core.Annotations.WidgetFlags.RADIO, true);
    flags.set(window.Core.Annotations.WidgetFlags.NO_TOGGLE_TO_OFF, true);
  }
  const lastIndex = getLastIndexByFormType({ formType: type });
  const font = new window.Core.Annotations.Font({ name: 'Helvetica' });

  const fieldName = `${fieldData.CUSTOM_NAME} ${fieldData.GET_INDEX(lastIndex)}`;
  const oldField = fieldManager.getField(fieldName);

  if (oldField && oldField instanceof window.Core.Annotations.Forms.Field) {
    return oldField;
  }

  const newField = new window.Core.Annotations.Forms.Field(fieldName, {
    type: fieldData.TYPE,
    flags,
    font,
    value: fieldData.DEFAULT_VALUE,
  });
  fieldManager.addField(newField);
  return newField;
};

const setDimensionForPlaceholder = ({ widgetAnnot, fieldData, mouseLocation }) => {
  const builder = new core.CoreControls.Math.TransformationBuilder();

  const pageRotation = core.getCompleteRotation(mouseLocation.pageNumber) * 90;
  widgetAnnot.Width = fieldData.DEFAULT_WIDTH;
  widgetAnnot.Height = fieldData.DEFAULT_HEIGHT;
  widgetAnnot.Author = core.getCurrentUser();
  const rect = widgetAnnot.getRect();
  const topLeftPoint = rect.getTopLeft();
  const transform = builder.translate(-topLeftPoint.getX(), -topLeftPoint.getY())
    .rotate(-pageRotation)
    .translate(topLeftPoint.getX(), topLeftPoint.getY())
    .getFinalTransform();
  rect.transform(transform);
  widgetAnnot.setRect(rect);
};

const isClickOutsidePage = (mouseLocation) => {
  const { x, y, pageNumber } = mouseLocation;

  const { height, width } = core.getPageInfo(pageNumber);
  return x < 0 || y < 0 || x > width || y > height;
};

function setPropertyForPlaceholder(type, placeholderAnnotation) {

  switch (type) {
    case FORM_FIELD_TYPE.RADIO: {
      placeholderAnnotation.MaintainAspectRatio = true;
      break;
    }
    case FORM_FIELD_TYPE.CHECKBOX: {
      placeholderAnnotation.MaintainAspectRatio = true;
      break;
    }
    case FORM_FIELD_TYPE.TEXT: {
      const currentStyle = core.getTool(toolsName.TEXT_FIELD).defaults;
      Object.assign(placeholderAnnotation, {
        [ANNOTATION_STYLE.FONT_SIZE]: currentStyle.FontSize,
        [ANNOTATION_STYLE.STROKE_THICKNESS]: currentStyle.StrokeThickness,
        [ANNOTATION_STYLE.STROKE_COLOR]: currentStyle.StrokeColor,
        [ANNOTATION_STYLE.FILL_COLOR]: currentStyle.FillColor,
        [ANNOTATION_STYLE.TEXT_COLOR]: currentStyle.TextColor,
      });
      break;
    }
    default:
      break;
  }
}
