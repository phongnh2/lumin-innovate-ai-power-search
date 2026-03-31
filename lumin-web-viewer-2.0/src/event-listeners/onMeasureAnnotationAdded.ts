import core from 'core';

export default () => (annotation: Core.Annotations.Annotation) => {
  core.getAnnotationManager().selectAnnotation(annotation);
};
