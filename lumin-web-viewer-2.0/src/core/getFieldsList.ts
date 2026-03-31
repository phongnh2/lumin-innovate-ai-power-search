export default (docViewer: Core.DocumentViewer): Core.Annotations.Forms.Field[] =>
  docViewer.getAnnotationManager().getFieldManager().getFields();
