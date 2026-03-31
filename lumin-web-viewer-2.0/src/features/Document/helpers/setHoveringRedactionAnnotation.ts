import core from 'core';

import setHoverableRedaction from 'helpers/setHoverableRedaction';

import { AnnotationSubjectMapping } from 'constants/documentConstants';

export default (value: boolean): void => {
  const annotationManager = core.getAnnotationManager();
  const redactionAnnotations = annotationManager
    .getAnnotationsList()
    ?.filter((annotation) => annotation.Subject === AnnotationSubjectMapping.redact);
  setHoverableRedaction(redactionAnnotations, value);
};
