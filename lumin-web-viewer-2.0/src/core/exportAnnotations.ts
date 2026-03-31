/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#exportAnnotations__anchor
 */
export default (
  docViewer: Core.DocumentViewer,
  options?: {
    annotList?: Core.Annotations.Annotation[];
    widgets?: boolean;
    links?: boolean;
    fields?: boolean;
    useDisplayAuthor?: boolean;
    generateInlineAppearances?: boolean;
  }
): Promise<string> => docViewer.getAnnotationManager().exportAnnotations(options);
