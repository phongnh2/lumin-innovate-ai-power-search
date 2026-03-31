import core from 'core';

export function findFreetextAnnotations(text: string, pages: number[]): Core.Annotations.FreeTextAnnotation[] {
  return core
    .getAnnotationsList()
    .filter(
      (annot) =>
        annot instanceof window.Core.Annotations.FreeTextAnnotation &&
        annot.getContents().includes(text) &&
        pages.includes(annot.PageNumber)
    ) as Core.Annotations.FreeTextAnnotation[];
}

export function handleUpdateTextForFreetext(freetexts: Core.Annotations.FreeTextAnnotation[], oldText: string, newText: string) {
  freetexts.forEach((annot) => {
    const oldContent = annot.getContents();
    const newContent = oldContent.replaceAll(oldText, newText);
    annot.setContents(newContent);
    core.getAnnotationManager().trigger('annotationChanged', [[annot], 'modify', {}]);
  });
}