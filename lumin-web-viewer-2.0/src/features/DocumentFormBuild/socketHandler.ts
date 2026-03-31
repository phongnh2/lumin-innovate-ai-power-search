import core from 'core';

import importFieldValue from './importFieldValue';

type InputData = {
  fieldName: string;
  updatedData: {
    xfdf: string;
    name: string;
    value: string;
    isDeleted: boolean;
  };
};
export const onFormFieldChanged = async ({
  fieldName,
  updatedData: { xfdf, name, value, isDeleted },
}: InputData): Promise<void> => {
  const annotManager = core.getAnnotationManager();
  const fieldManager = annotManager.getFieldManager();
  const field = fieldManager.getField(fieldName) as Core.Annotations.Forms.Field;
  if (isDeleted) {
    const { widgets } = field;
    annotManager.deleteAnnotations(widgets, { imported: true });
    return;
  }
  if (xfdf) {
    let mapWidgets: Map<string, Core.Annotations.WidgetAnnotation> | undefined;
    if (field) {
      mapWidgets = new Map(field.widgets.map((widget) => [widget.Id, widget]));
    }
    const annots = (await annotManager.importAnnotations(xfdf)) as Core.Annotations.WidgetAnnotation[];
    if (mapWidgets) {
      annots.forEach((annot) => {
        if (mapWidgets.has(annot.Id)) {
          mapWidgets.delete(annot.Id);
        }
        if (annot instanceof Core.Annotations.SignatureWidgetAnnotation) {
          (annot.flags as Core.Annotations.WidgetFlags & { clear: () => void }).clear();
        }
      });
      if (mapWidgets.size > 0) {
        annotManager.deleteAnnotations(Array.from(mapWidgets.values()), { imported: true });
      }
    }
  }
  await importFieldValue(name, value);
};