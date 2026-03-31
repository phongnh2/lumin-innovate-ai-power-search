import pick from 'lodash/pick';
import { v4 as uuid } from 'uuid';

import core from 'core';

import logger from 'helpers/logger';
import { setAnnotationModified } from 'helpers/toggleFormFieldCreationMode';

import { eventTracking } from 'utils';

import { TOOLS_NAME_TO_EVENT_TRACKING_NAME_MAPPER } from 'features/FormFieldDetection/constants/mapper';

import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import UserEventConstants from 'constants/eventConstants';
import { getFieldNameMapping, FORM_FIELD_TYPE, AI_AUTO_ADDED, WIDGET_TYPE } from 'constants/formBuildTool';
import { LOGGER } from 'constants/lumin-common';
import { TOOLS_NAME } from 'constants/toolsName';

// Define a type for our widget constructors
type WidgetConstructor = new (field: Core.Annotations.Forms.Field, widget: WidgetAnnotationType) => Core.Annotations.WidgetAnnotation;

const mapField = {
  [TOOLS_NAME.TEXT_FIELD]: {
    constructor: window.Core.Annotations.TextWidgetAnnotation as unknown as WidgetConstructor,
    type: WIDGET_TYPE.TEXT,
    key: FORM_FIELD_TYPE.TEXT,
  },
  [TOOLS_NAME.CHECK_BOX]: {
    constructor: window.Core.Annotations.CheckButtonWidgetAnnotation as unknown as WidgetConstructor,
    type: WIDGET_TYPE.BUTTON,
    key: FORM_FIELD_TYPE.CHECKBOX,
  },
  [TOOLS_NAME.SIGNATURE_FIELD]: {
    constructor: window.Core.Annotations.SignatureWidgetAnnotation as unknown as WidgetConstructor,
    type: WIDGET_TYPE.SIGNATURE,
    key: FORM_FIELD_TYPE.SIGNATURE,
  },
  [TOOLS_NAME.RADIO]: {
    constructor: window.Core.Annotations.RadioButtonWidgetAnnotation as unknown as WidgetConstructor,
    type: WIDGET_TYPE.BUTTON,
    key: FORM_FIELD_TYPE.RADIO,
  },
  [TOOLS_NAME.LIST_BOX_FIELD]: {
    constructor: window.Core.Annotations.ListWidgetAnnotation as unknown as WidgetConstructor,
    type: WIDGET_TYPE.BUTTON,
    key: FORM_FIELD_TYPE.LIST_BOX,
  },
  [TOOLS_NAME.COMBO_BOX_FIELD]: {
    constructor: window.Core.Annotations.ChoiceWidgetAnnotation as unknown as WidgetConstructor,
    type: WIDGET_TYPE.BUTTON,
    key: FORM_FIELD_TYPE.COMBO_BOX,
  },
} as const;

type WidgetAnnotationType = Core.Annotations.WidgetAnnotation & {
  originalDimension?: { Width: number; Height: number };
};

function processOldWidget(widget: WidgetAnnotationType, newWidget: WidgetAnnotationType) {
  if (widget instanceof window.Core.Annotations.CheckButtonWidgetAnnotation && widget.originalDimension) {
    newWidget.Width = widget.originalDimension.Width;
    newWidget.Height = widget.originalDimension.Height;
  }

  if (widget instanceof window.Core.Annotations.CheckButtonWidgetAnnotation && widget.originalDimension) {
    newWidget.Width = widget.originalDimension.Width;
    newWidget.Height = widget.originalDimension.Height;
  }

  if (widget instanceof window.Core.Annotations.DatePickerWidgetAnnotation) {
    const actions = newWidget.actions as Record<string, unknown[]>;
    Object.keys(actions).forEach((triggerKey) => {
      actions[triggerKey] = [];
    });
  }
  if (widget instanceof window.Core.Annotations.SignatureWidgetAnnotation) {
    const signature = widget.getAssociatedSignatureAnnotation();
    if (signature) {
      signature.deleteCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key);
      core.deleteAnnotations([signature], { imported: true, force: true, source: 'changeFormFieldType' });
    }
  }
}

function createNewWidget(type: keyof typeof mapField, field: Core.Annotations.Forms.Field, widget: WidgetAnnotationType) {
  const newWidget = new mapField[type].constructor(field, widget) as WidgetAnnotationType;
  newWidget.originalDimension = pick(widget, ['Width', 'Height']);
  newWidget.Listable = true;
  newWidget.Id = widget.Id;
  newWidget.PageNumber = widget.PageNumber;
  switch (true) {
    case newWidget instanceof window.Core.Annotations.TextWidgetAnnotation:
      newWidget.MaintainAspectRatio = false;
      break;
    case newWidget instanceof window.Core.Annotations.SignatureWidgetAnnotation:
      newWidget.backgroundColor = new window.Core.Annotations.Color(0, 0, 0, 0);
      newWidget.MaintainAspectRatio = false;
      /* eslint-disable @typescript-eslint/ban-ts-comment */
      // @ts-ignore
      newWidget.set({
        appearance: '_DEFAULT',
        appearances: {
          _DEFAULT: {
            Normal: {
              offset: {
                x: 100,
                y: 100,
              },
            },
          },
        },
      });
      newWidget.refresh();
      break;
    case newWidget instanceof window.Core.Annotations.CheckButtonWidgetAnnotation: {
      const minDimension = Math.min(newWidget.Width, newWidget.Height);
      newWidget.backgroundColor = new window.Core.Annotations.Color(0, 0, 0, 0);
      newWidget.Width = minDimension;
      newWidget.Height = minDimension;
      newWidget.MaintainAspectRatio = true;
      /* eslint-disable @typescript-eslint/ban-ts-comment */
      // @ts-ignore
      newWidget.set({
        appearances: {
          Off: {},
          Yes: {},
        },
        appearance: 'Off',
        border: {
          color: new window.Core.Annotations.Color(0, 0, 0, 0),
          style: 'solid',
          width: 1,
        },
      });
      newWidget.refresh();
      break;
    }
    case newWidget instanceof window.Core.Annotations.RadioButtonWidgetAnnotation: {
      throw new Error('Radio button is not supported');
    }
    default:
      break;
  }
  return newWidget;
}

/**
 * Handles the creation and processing of new widgets
 */
function processWidgets(
  widget: WidgetAnnotationType,
  targetField: Core.Annotations.Forms.Field,
  type: keyof typeof mapField
): WidgetAnnotationType {
  const newWidget = createNewWidget(type, targetField, widget);
  processOldWidget(widget, newWidget);
  return newWidget;
}

function handleCommonOperations(
  oldWidget: WidgetAnnotationType,
  newWidget: WidgetAnnotationType,
  field: Core.Annotations.Forms.Field
) {
  const fieldManager = core.getAnnotationManager().getFieldManager();
  core.deleteAnnotations([oldWidget], {
    imported: true,
    force: true,
    source: 'changeFormFieldType',
  });

  core.addAnnotations([newWidget], {
    imported: true,
    source: 'changeFormFieldType',
  });

  field.refreshAppearances();

  fieldManager.addField(field);

  core.selectAnnotation(newWidget);
}

export const changeFormFieldType = (annotation: Core.Annotations.WidgetAnnotation, type: keyof typeof mapField) => {
  try {
    const field = annotation.getField();

    const { widgets } = field;
    const hasSameFieldWidgets = widgets.some((widget) => widget.Id !== annotation.Id);
    const prevToolname = annotation.ToolName;
    const isDatePickerFormField = annotation instanceof window.Core.Annotations.DatePickerWidgetAnnotation;
    const currentFieldType = isDatePickerFormField
      ? 'datePicker'
      : TOOLS_NAME_TO_EVENT_TRACKING_NAME_MAPPER[prevToolname];

    if (hasSameFieldWidgets) {
      const newField = new window.Core.Annotations.Forms.Field(`${field.name} ${uuid()}`, {
        type: mapField[type].type,
        value: getFieldNameMapping(mapField[type].key).DEFAULT_VALUE,
      });

      field.set({ widgets: field.widgets.filter((widget) => widget.Id !== annotation.Id) });

      const newWidget = processWidgets(annotation, newField, type);
      newField.set({ widgets: [newWidget] });

      handleCommonOperations(annotation, newWidget, newField);

      // Additional operations specific to this case
      field.refreshAppearances();
    } else {
      const newWidget = processWidgets(annotation, field, type);

      field.set({
        widgets: [newWidget],
        type: mapField[type].type,
        value: getFieldNameMapping(mapField[type].key).DEFAULT_VALUE,
        ...(isDatePickerFormField && { actions: {} }),
      });

      handleCommonOperations(annotation, newWidget, field);
    }

    eventTracking(UserEventConstants.EventType.CHANGE_TYPE_FORM_BUILDER_ELEMENT, {
      aiAutoAdded: annotation.getCustomData(AI_AUTO_ADDED) === 'true',
      currentFieldType,
      newFieldType: TOOLS_NAME_TO_EVENT_TRACKING_NAME_MAPPER[type],
    }).catch(() => {});
    setAnnotationModified(true);
  } catch (error: unknown) {
    logger.logError({
      error,
      reason: LOGGER.Service.CHANGE_FORM_FIELD_TYPE,
    });
  }
};
