export default (docViewer: Core.DocumentViewer, annotations: Core.Annotations.Annotation[]): void =>
  docViewer.getAnnotationManager().ungroupAnnotations(annotations);
