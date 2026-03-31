// @ts-expect-error: need to pass annotations to getNumberOfGroups api
export default (docViewer: Core.DocumentViewer, annotations: Core.Annotations.Annotation[]): number => docViewer.getAnnotationManager().getNumberOfGroups(annotations);
