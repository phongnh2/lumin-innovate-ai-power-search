import { WIDGET_TYPE, FORM_FIELD_TYPE } from 'constants/formBuildTool';

const getFormFieldType = (field: Core.Annotations.Forms.Field): string => {
  switch (field.type) {
    case WIDGET_TYPE.TEXT: {
      return FORM_FIELD_TYPE.TEXT;
    }
    case WIDGET_TYPE.BUTTON: {
      if (field.flags.get(Core.Annotations.WidgetFlags.RADIO)) {
        return FORM_FIELD_TYPE.RADIO;
      }
      return FORM_FIELD_TYPE.CHECKBOX;
    }
    case WIDGET_TYPE.SIGNATURE: {
      return FORM_FIELD_TYPE.SIGNATURE;
    }
    default:
      return '';
  }
};

export default getFormFieldType;