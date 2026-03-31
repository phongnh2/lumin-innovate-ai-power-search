import indexedDBService from 'services/indexedDBService';

import { CUSTOM_DATA_AUTO_DETECTION } from 'constants/customDataConstant';
import { AnnotationSubjectMapping } from 'constants/documentConstants';

import { createDetectedFieldPlaceholders } from './createDetectedFieldPlaceholders';

export const recoverDetectedPlaceholders = async ({
  annotations,
  documentId,
  shouldAddDetectedPlaceholder = false,
}: {
  annotations: Core.Annotations.Annotation[];
  documentId: string;
  shouldAddDetectedPlaceholder?: boolean;
}) => {
  const recoverableDetectedPlaceholders: Map<number, string[]> = new Map();
  annotations.forEach((annotation) => {
    if (
      [
        AnnotationSubjectMapping.signature,
        AnnotationSubjectMapping.freetext,
        AnnotationSubjectMapping.tickStamp,
      ].includes(annotation.Subject)
    ) {
      const autoDetectionAnnotationId = annotation.getCustomData(
        CUSTOM_DATA_AUTO_DETECTION.AUTO_DETECTION_ANNOTATION_ID.key
      );
      if (!shouldAddDetectedPlaceholder) {
        annotation.setCustomData(CUSTOM_DATA_AUTO_DETECTION.AUTO_DETECTION_ANNOTATION_ID.key, '');
      }

      if (autoDetectionAnnotationId) {
        recoverableDetectedPlaceholders.set(annotation.PageNumber, [
          ...(recoverableDetectedPlaceholders.get(annotation.PageNumber) || []),
          autoDetectionAnnotationId,
        ]);
      }
    }
  });

  if (!recoverableDetectedPlaceholders.size) {
    return;
  }

  const recoveredDetectedPlaceholders = await indexedDBService.recoverDetectedPlaceholders({
    documentId,
    recoverableDetectedPlaceholders,
    shouldAddDetectedPlaceholder,
  });

  if (!recoveredDetectedPlaceholders.predictions) {
    return;
  }

  if (shouldAddDetectedPlaceholder && Object.keys(recoveredDetectedPlaceholders.predictions).length) {
    createDetectedFieldPlaceholders(recoveredDetectedPlaceholders.predictions);
  }
};
