import { useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import v4 from 'uuid/v4';

import core from 'core';

import { isSyncableFile } from 'helpers/autoSync';

import { AUTO_SYNC_CHANGE_TYPE } from 'constants/autoSyncConstant';
import { ANNOTATION_CHANGE_SOURCE } from 'constants/documentConstants';

const AUTO_SYNC_DEBOUNCE = 3000;

export default function useAnnotationChanged({ currentDocument, setQueue, handleSyncFile, isPageEditModeRef }) {
  const handleSyncFileDebounce = useDebouncedCallback((actionId) => {
    handleSyncFile(actionId);
  }, AUTO_SYNC_DEBOUNCE);

  const setSync = useCallback((annotations, _, data) => {
    let isRedactionAnnotation = false;
    let isContentEditPlaceholder = false;
    if (annotations?.length) {
      isRedactionAnnotation = annotations.some((annot) => annot instanceof window.Core.Annotations.RedactionAnnotation);
      isContentEditPlaceholder = annotations.some((annot) => annot.isContentEditPlaceholder());
    }
    const isInFormFieldCreationMode = core.getFormFieldCreationManager().isInFormFieldCreationMode();
    const isInContentEditMode = core.getContentEditManager().isInContentEditMode();
    const isRedactionApplied = data?.source === ANNOTATION_CHANGE_SOURCE.REDACTION_APPLIED;
    const isAddRedactionAnnotationMode = isRedactionAnnotation && !isRedactionApplied;
    if (
      data?.imported ||
      isInFormFieldCreationMode ||
      isInContentEditMode ||
      isAddRedactionAnnotationMode ||
      isRedactionApplied ||
      isContentEditPlaceholder ||
      isPageEditModeRef.current
    ) {
      return;
    }
    const id = v4();
    const actionId = `${AUTO_SYNC_CHANGE_TYPE.ANNOTATION_CHANGE}:${id}`;
    setQueue((queue) => [...queue, actionId]);
    handleSyncFileDebounce(actionId);
  }, []);

  useEffect(() => {
    const fieldChanged = () => setSync();
    if (isSyncableFile(currentDocument)) {
      core.getAnnotationManager().addEventListener('annotationUpdated', setSync);
      core.addEventListener('annotationChanged', setSync);
      core.getAnnotationManager().addEventListener('fieldChanged', fieldChanged);
      core.getAnnotationManager().addEventListener('formBuilderChanged', fieldChanged);
    }
    return () => {
      if (isSyncableFile(currentDocument)) {
        core.getAnnotationManager().removeEventListener('annotationUpdated', setSync);
        core.removeEventListener('annotationChanged', setSync);
        core.getAnnotationManager().removeEventListener('fieldChanged', fieldChanged);
        core.getAnnotationManager().removeEventListener('formBuilderChanged', fieldChanged);
      }
      handleSyncFileDebounce.cancel();
    };
  }, [currentDocument?.mimeType, setSync]);
}
