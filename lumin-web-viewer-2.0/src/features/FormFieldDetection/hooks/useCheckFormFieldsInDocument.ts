import { useEffect, useState } from 'react';

import core from 'core';

import { useLatestRef } from 'hooks/useLatestRef';

import { AnnotationChangedAction } from 'interfaces/annotation/annotation.interface';

import { hasFormFields } from '../utils/detectionValidator';

export const useCheckFormFieldsInDocument = () => {
  const [hasFormFieldsInDocument, setHasFormFieldsInDocument] = useState(false);
  const hasFormFieldsInDocumentRef = useLatestRef(hasFormFieldsInDocument);

  useEffect(() => {
    const onAnnotationChanged = (annotations: Core.Annotations.Annotation[], action: AnnotationChangedAction) => {
      if (!hasFormFieldsInDocumentRef.current || action === AnnotationChangedAction.DELETE) {
        setHasFormFieldsInDocument(hasFormFields());
      }
    };

    core.addEventListener('annotationChanged', onAnnotationChanged);

    return () => {
      core.removeEventListener('annotationChanged', onAnnotationChanged);
    };
  }, []);

  return { hasFormFieldsInDocument };
};
