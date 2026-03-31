/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#applyRedactions__anchor
 * If the redaction annotations overlap with other annotations, it calls deleteAnnotations on the other annotations.
 * See deleteAnnotations.js for any events that are trigger by delete annotations
 */
export default async (
  docViewer: Core.DocumentViewer,
  annotations: Core.Annotations.Annotation[]
): Promise<string | Core.AnnotationManager.RedactionInfo[]> =>
  docViewer.getAnnotationManager().applyRedactions(annotations);
