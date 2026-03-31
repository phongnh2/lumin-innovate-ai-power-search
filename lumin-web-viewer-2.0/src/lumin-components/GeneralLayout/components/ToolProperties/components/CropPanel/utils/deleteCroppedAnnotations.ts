import core from 'core';

export const deleteCroppedAnnotations = (annotations: Core.Annotations.Annotation[]) => {
  core.deleteAnnotations(annotations, { force: true });

  annotations.forEach((annotation) => {
    core.deleteAnnotations(annotation.getReplies(), { force: true });
  });
};
