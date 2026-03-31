import get from 'lodash/get';

import core from 'core';

import DetectedFieldPlaceholder from 'helpers/CustomAnnotation/DetectedFieldPlaceholder';

import { CUSTOM_ANNOTATION } from 'constants/documentConstants';

const getAnnotationsFromEventArgs = (args: unknown[][]): Core.Annotations.Annotation[] =>
  get(args, '0.0', []) as Core.Annotations.Annotation[];

const detectedFieldPlaceholderFilterCallback = (annot: Core.Annotations.Annotation) =>
  annot.Subject === CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.subject;

const getAnnotationsExceptDetectedFieldPlaceholders = (
  annotations: Core.Annotations.Annotation[]
): Core.Annotations.Annotation[] => annotations.filter((annot) => !detectedFieldPlaceholderFilterCallback(annot));

export function autoDetectFormFieldsConfig({ annotManager }: { annotManager: Core.AnnotationManager }) {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originalCoreTrigger = annotManager.trigger;
  annotManager.trigger = function trigger(eventName: string, ...args: unknown[][]) {
    let shouldBlockEvent = false;
    if (eventName === core.Events.ANNOTATION_CHANGED) {
      const annotations = getAnnotationsFromEventArgs(args);
      if (annotations.length) {
        const filteredAnnotations = getAnnotationsExceptDetectedFieldPlaceholders(annotations);
        args[0][0] = filteredAnnotations;
        shouldBlockEvent = !filteredAnnotations.length;
      }
    }

    if (shouldBlockEvent) {
      return null;
    }

    return originalCoreTrigger.call(this, eventName, ...args) as unknown as void;
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originalGetAnnotationsList = annotManager.getAnnotationsList;
  annotManager.getAnnotationsList = function getAnnotationsList(this: Core.AnnotationManager) {
    const annotations = originalGetAnnotationsList.call(this) as Core.Annotations.Annotation[];
    return getAnnotationsExceptDetectedFieldPlaceholders(annotations);
  };

  annotManager.getDetectedFieldPlaceholderAnnotations = function getDetectedFieldPlaceholderAnnotations(
    this: Core.AnnotationManager
  ) {
    const annotations = originalGetAnnotationsList.call(this) as Core.Annotations.Annotation[];
    return annotations.filter(detectedFieldPlaceholderFilterCallback);
  };

  DetectedFieldPlaceholder.prototype.elementName = CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.name;
  annotManager.registerAnnotationType(DetectedFieldPlaceholder.prototype.elementName, DetectedFieldPlaceholder);
}
