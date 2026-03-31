import { WIDGET_PROPERTIES } from 'constants/notificationWidget';
import { NOTIFICATION_WIDGET_TYPE } from 'constants/notificationWidgetType';

export const getTranslatedWidgetContent = (widgetType, property, translator = () => {}, isSubContent = false) => {
  if (
    !Object.values(NOTIFICATION_WIDGET_TYPE).includes(widgetType) ||
    !Object.values(WIDGET_PROPERTIES).includes(property)
  ) {
    return '';
  }
  if (isSubContent) {
    return translator(`widget.widgetType.${widgetType}.subContent.${property}`);
  }
  return translator(`widget.widgetType.${widgetType}.${property}`);
};

export const getSubActionTitle = (widgetType, translator = () => {}) => {
  if (!Object.values(NOTIFICATION_WIDGET_TYPE).includes(widgetType)) {
    return '';
  }
  return translator(`widget.widgetType.${widgetType}.subAction`);
};

export default {
  getTranslatedWidgetContent,
  getSubActionTitle,
};
