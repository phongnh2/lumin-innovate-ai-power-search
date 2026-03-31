/**
 * https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#setAnnotationCanvasTransform__anchor
 * @see https://www.pdftron.com/api/web/CoreControls.AnnotationManager.html#setAnnotationCanvasTransform__anchor
 */
export default (
  docViewer: Core.DocumentViewer,
  annotCanvasContext: CanvasRenderingContext2D,
  zoom: number,
  rotation: Core.PageRotation
): void => {
  docViewer.getAnnotationManager().setAnnotationCanvasTransform(annotCanvasContext, zoom, rotation);
};
