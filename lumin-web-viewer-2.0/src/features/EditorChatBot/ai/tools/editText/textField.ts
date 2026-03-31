import core from 'core';

export function findTextFields(text: string, pages: number[]): Core.Annotations.TextWidgetAnnotation[] {
  return core
    .getAnnotationsList()
    .filter(
      (annot) =>
        annot instanceof window.Core.Annotations.TextWidgetAnnotation &&
        (annot.getField().getValue() as string).includes(text) &&
        pages.includes(annot.PageNumber)
    ) as Core.Annotations.TextWidgetAnnotation[];
}

export function handleUpdateTextForFormField(
  textWidgets: Core.Annotations.TextWidgetAnnotation[],
  oldText: string,
  newText: string
) {
  textWidgets.forEach((annot) => {
    const oldContent = annot.getField().getValue() as string;
    const newContent = oldContent.replaceAll(oldText, newText);
    annot.getField().setValue(newContent);
  });
}
