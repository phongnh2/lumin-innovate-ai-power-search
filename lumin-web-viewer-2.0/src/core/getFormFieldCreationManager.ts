import getAnnotationManager from './getAnnotationManager';

export default (docViewer: Core.DocumentViewer): Core.FormFieldCreationManager => {
  const annotManager = getAnnotationManager(docViewer);
  return annotManager.getFormFieldCreationManager();
};