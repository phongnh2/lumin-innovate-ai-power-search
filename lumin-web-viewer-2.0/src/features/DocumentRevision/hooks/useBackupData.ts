import { debounce } from 'lodash';
import { useEffect, useRef } from 'react';

import { useSyncOnContentChange } from '@new-ui/components/LuminLeftSideBar/hooks/useSyncOnContentChange';

import core from 'core';
import selectors from 'selectors';

import { useCleanup, useLatestRef } from 'hooks';
import { useShallowSelector } from 'hooks/useShallowSelector';

import logger from 'helpers/logger';
import { cancelIdleCallback, IdleCallbackId, requestIdleCallback } from 'helpers/requestIdleCallback';

import { useSyncDocumentChecker } from 'features/Document/hooks/useSyncDocumentChecker';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { LOGGER } from 'constants/lumin-common';

import { AnnotationChangedAction } from 'interfaces/annotation/annotation.interface';

import { useBackupAnnotations } from './useBackupAnnotations';
import { useEnabledRevision } from './useEnabledRevision';
import { DocumentBackupManager } from '../utils/documentBackupManager';

export const useBackupData = () => {
  const { backupAnnotations } = useBackupAnnotations();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { _id: documentId } = currentDocument || {};
  const documentIdRef = useLatestRef(documentId);
  const [syncOnContentChange] = useSyncOnContentChange();
  const backupHandlerRef = useRef<DocumentBackupManager>(null);
  const { enabledForLuminStorage } = useEnabledRevision();
  const { canSyncOnAnnotationChange, canSync, canSyncFormFieldChange } = useSyncDocumentChecker();
  const backupIdleCallbackRef = useRef<IdleCallbackId | null>(null);

  useCleanup(() => {
    DocumentBackupManager.clearInstance();
    if (backupIdleCallbackRef.current) {
      cancelIdleCallback(backupIdleCallbackRef.current);
    }
  }, [documentId]);

  useEffect(() => {
    const backupManipulationCallback = () => {
      backupIdleCallbackRef.current = requestIdleCallback(syncOnContentChange);
      return Promise.resolve();
    };
    const createBackupAnnotStrategies = () => {
      try {
        if (!enabledForLuminStorage) {
          return;
        }
        backupHandlerRef.current = DocumentBackupManager.getInstance({
          backupAnnotationCallback: backupAnnotations,
          backupManipulationCallback,
        });
      } catch (error: unknown) {
        logger.logError({
          reason: LOGGER.Service.BACK_UP_DOCUMENT_ERROR,
          error,
        });
      }
    };

    core.docViewer.addEventListener('documentViewerLoaded', createBackupAnnotStrategies);

    return () => {
      core.docViewer.removeEventListener('documentViewerLoaded', createBackupAnnotStrategies);
    };
  }, [backupAnnotations, syncOnContentChange, enabledForLuminStorage]);

  useEffect(() => {
    const debouncedBackup = debounce(() => {
      if (backupHandlerRef.current) {
        backupHandlerRef.current.triggerAnnotationEvent();
      }
    });
    const onAnnotationChanged = (
      annotation: Core.Annotations.Annotation[],
      action: AnnotationChangedAction,
      objectInfo: Core.AnnotationManager.AnnotationChangedInfoObject
    ) => {
      const { imported } = objectInfo;
      if (
        !documentIdRef.current ||
        !canSyncOnAnnotationChange(imported) ||
        !backupHandlerRef.current ||
        !enabledForLuminStorage
      ) {
        return;
      }
      debouncedBackup();
    };

    const onFieldChanged = () => {
      if (!documentIdRef.current || !backupHandlerRef.current || !enabledForLuminStorage || !canSyncFormFieldChange) {
        return;
      }
      debouncedBackup();
    };

    core.addEventListener('annotationChanged', onAnnotationChanged);
    core.addEventListener('fieldChanged', onFieldChanged);

    return () => {
      core.removeEventListener('annotationChanged', onAnnotationChanged);
      core.removeEventListener('fieldChanged', onFieldChanged);
      debouncedBackup.cancel();
    };
  }, [enabledForLuminStorage, canSyncOnAnnotationChange, canSyncFormFieldChange]);

  useEffect(() => {
    const debouncedBackup = debounce(() => {
      if (backupHandlerRef.current) {
        backupHandlerRef.current.triggerManipulationEvent();
      }
    });

    const onManipulationChanged = () => {
      if (!documentIdRef.current || !backupHandlerRef.current || !enabledForLuminStorage || !canSync) {
        return;
      }

      debouncedBackup();
    };

    window.addEventListener(CUSTOM_EVENT.MANIPULATION_CHANGED, onManipulationChanged);

    return () => {
      window.removeEventListener(CUSTOM_EVENT.MANIPULATION_CHANGED, onManipulationChanged);
      debouncedBackup.cancel();
    };
  }, [enabledForLuminStorage, canSync]);

  useEffect(() => {
    backupHandlerRef.current?.restartTimer();

    if (!canSync) {
      backupHandlerRef.current?.stopTimer();
    }
  }, [canSync]);

  useCleanup(() => {
    backupHandlerRef.current?.cleanup();
  }, [enabledForLuminStorage]);
};
