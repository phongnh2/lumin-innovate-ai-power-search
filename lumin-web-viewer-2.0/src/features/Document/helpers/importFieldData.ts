import core from 'core';

import importFieldValue from 'features/DocumentFormBuild/importFieldValue';

import { IFormField } from 'interfaces/document/document.interface';

const ensureFieldWidgets = (
  field: Core.Annotations.Forms.Field,
  fieldName: string,
  annotManager: Core.AnnotationManager
): void => {
  if (field.widgets.length === 0) {
    const widgets = annotManager
      .getAnnotationsList()
      .filter((annot) => annot instanceof window.Core.Annotations.WidgetAnnotation && annot.fieldName === fieldName);
    field.set({ widgets });
  }
};

const importFieldData = async (newField: IFormField, triggerFieldChanged = false): Promise<void> => {
  const { name, value, xfdf, isDeleted } = newField;

  if (isDeleted) {
    return;
  }

  const annotManager = core.getAnnotationManager();
  const fieldManager = annotManager.getFieldManager();

  if (xfdf) {
    const field = fieldManager.getField(name) as Core.Annotations.Forms.Field;
    ensureFieldWidgets(field, name, annotManager);
  }

  await importFieldValue(name, value);

  if (triggerFieldChanged) {
    const field = fieldManager.getField(name) as Core.Annotations.Forms.Field;
    if (field) {
      annotManager.trigger('fieldChanged', [field, value]);
    }
  }
};

export default importFieldData;
