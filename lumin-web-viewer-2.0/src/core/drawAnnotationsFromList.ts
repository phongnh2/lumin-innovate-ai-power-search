/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#drawAnnotationsFromList__anchor
 */
export default async (docViewer: Core.DocumentViewer, annotations: Core.Annotations.Annotation[]): Promise<void> =>
  (await docViewer.getAnnotationManager().drawAnnotationsFromList(annotations)) as unknown as void;
