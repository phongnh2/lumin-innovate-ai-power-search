import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import getCurrentRole from 'helpers/getCurrentRole';

import { checkFormFieldIndicator } from 'features/FormFieldDetection/utils/checkFormFieldIndicator';
import { isValidDocumentSize } from 'features/FormFieldDetection/utils/detectionValidator';

import { DOCUMENT_ROLES } from 'constants/lumin-common';

import { AnnotationChangedAction } from 'interfaces/annotation/annotation.interface';

export const useCheckFormFieldIndicatorInContent = () => {
  const [isContainFormFieldIndicator, setIsContainFormFieldIndicator] = useState(false);
  const [shouldCheckTextContent, setShouldCheckTextContent] = useState(false);

  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const isInContentEditMode = useSelector(selectors.isInContentEditMode);
  const totalPages = useSelector(selectors.getTotalPages);

  const currentRole = getCurrentRole(currentDocument);
  const canEditDocument = [DOCUMENT_ROLES.EDITOR, DOCUMENT_ROLES.SHARER, DOCUMENT_ROLES.OWNER].includes(currentRole);

  const checkFormFieldIndicatorInContent = useCallback(async () => {
    let hasIndicator = false;
    if (canEditDocument && isValidDocumentSize(totalPages)) {
      hasIndicator = await checkFormFieldIndicator();
    }

    setIsContainFormFieldIndicator(hasIndicator);
  }, [canEditDocument, totalPages]);

  useEffect(() => {
    if (!isInContentEditMode && shouldCheckTextContent) {
      checkFormFieldIndicatorInContent().catch(() => {});
      setShouldCheckTextContent(false);
    }
  }, [isInContentEditMode, shouldCheckTextContent, checkFormFieldIndicatorInContent]);

  useEffect(() => {
    const onDocumentViewerLoaded = () => {
      setShouldCheckTextContent(true);
    };

    const onTextContentUpdated = () => {
      setShouldCheckTextContent(true);
    };

    const onAnnotationChanged = (annotations: Core.Annotations.Annotation[], action: AnnotationChangedAction) => {
      if (annotations[0]?.isContentEditPlaceholder() && action === AnnotationChangedAction.DELETE) {
        setShouldCheckTextContent(true);
      }
    };

    core.docViewer.addEventListener('documentViewerLoaded', onDocumentViewerLoaded);
    core.addEventListener('annotationChanged', onAnnotationChanged);
    Core.ContentEdit.addEventListener('textContentUpdated', onTextContentUpdated);

    return () => {
      core.docViewer.removeEventListener('documentViewerLoaded', onDocumentViewerLoaded);
      core.removeEventListener('annotationChanged', onAnnotationChanged);
      Core.ContentEdit.removeEventListener('textContentUpdated', onTextContentUpdated);
    };
  }, []);

  return {
    isContainFormFieldIndicator,
  };
};
