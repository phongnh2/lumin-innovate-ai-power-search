export default (docViewer: Core.DocumentViewer, e: MouseEvent): Core.Annotations.Annotation =>
  docViewer.getAnnotationManager().getAnnotationByMouseEvent(e);
