import core from 'core';

export default function updateAnnotationAppearances() {
  const annotManager = core.getAnnotationManager();
  const annots = annotManager.getAnnotationsList();

  /**
   * Fix appearances for existing radio buttons to use annotation ID instead of "Yes"
   * This prevents all radio buttons in a row from being selected together
   */
  const radioButtonAnnotations = annots.filter(
    (annot) => annot instanceof window.Core.Annotations.RadioButtonWidgetAnnotation
  );
  radioButtonAnnotations.forEach((annot) => {
    annot.fieldFlags.set(window.Core.Annotations.WidgetFlags.NO_TOGGLE_TO_OFF, false);
    annot.set({
      appearances: {
        [annot.Id]: {},
        Off: {},
      },
    } as Core.Annotations.WidgetAnnotation);
  });

  /**
   * Fix missing appearances for existing checkbox annotations
   * This ensures checkbox annotations have proper appearances to prevent "Unknown appearance: Off" error
   * Only set default appearances if appearances are missing or empty
   * Use annotation ID as the appearance key to let checkboxes with the same field name but different export values work independently
   */
  const checkBoxAnnotations = annots.filter(
    (annot) => annot instanceof window.Core.Annotations.CheckButtonWidgetAnnotation
  );
  checkBoxAnnotations.forEach((annot) => {
    const existingAppearances = annot.appearances as Record<string, unknown> | undefined;
    const hasValidAppearances = existingAppearances && Object.keys(existingAppearances).length > 0;
    if (!hasValidAppearances) {
      annot.set({
        appearances: {
          [annot.Id]: {},
          Off: {},
        },
      } as Core.Annotations.WidgetAnnotation);
    }
  });
}
