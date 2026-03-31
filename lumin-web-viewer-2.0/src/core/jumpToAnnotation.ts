/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#jumpToAnnotationd__anchor
 */
export default (
  docViewer: Core.DocumentViewer,
  annotation: Core.Annotations.Annotation,
  options?: {
    horizontalOffset?: string;
    verticalOffset?: string;
    zoom?: string;
    fitToView?: boolean;
    isSmoothScroll?: boolean;
  }
): void => {
  docViewer.getAnnotationManager().jumpToAnnotation(annotation, options);
};
