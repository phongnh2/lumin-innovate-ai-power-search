import core from 'core';

export function updateNameForDuplicatedField(formFieldAnnotation: Core.Annotations.Annotation, name: string) {
  const annotManager = core.getAnnotationManager();
  const formFieldCreationManager = core.getFormFieldCreationManager();
  const fieldLabels = formFieldCreationManager.getFieldLabels() as unknown as Record<string, string>;
  const fieldManager = annotManager.getFieldManager();
  const field = fieldManager.getField(
    formFieldAnnotation.getCustomData(fieldLabels.FIELD_NAME)
  ) as Core.Annotations.Forms.Field;
  if (!field) {
    return;
  }
  const isRadioField = field.flags.get(window.Core.Annotations.WidgetFlags.RADIO);
  const currentWidget = field.widgets.find(
    (widget) => widget.Id === formFieldAnnotation.getCustomData(fieldLabels.WIDGET_ID)
  );
  if (
    currentWidget &&
    !isRadioField &&
    field.widgets?.some((widget) => widget.Id !== formFieldAnnotation.getCustomData(fieldLabels.WIDGET_ID))
  ) {
    const newField = new window.Core.Annotations.Forms.Field(name, {
      type: field.type,
      flags: field.flags,
      font: field.font,
      value: field.value as string,
      fieldManager,
      widgets: [currentWidget],
    });

    fieldManager.addField(newField);
    formFieldAnnotation.setCustomData(fieldLabels.FIELD_NAME, name);
    currentWidget.setField(newField);
  }
}
