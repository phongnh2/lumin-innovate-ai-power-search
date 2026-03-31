import core from 'core';

// eslint-disable-next-line max-len
// helper function to get all the link annotations that are grouped with the passed in annotation
export default (annotation) =>
  core
    .getAnnotationManager()
    .getGroupAnnotations(annotation)
    .filter((groupedAnnotation) => groupedAnnotation instanceof window.Core.Annotations.Link);
