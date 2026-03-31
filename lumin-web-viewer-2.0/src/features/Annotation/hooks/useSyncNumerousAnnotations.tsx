import { isEmpty } from 'lodash';
import get from 'lodash/get';
import throttle from 'lodash/throttle';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useShallow } from 'zustand/react/shallow';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { useCleanup } from 'hooks/useCleanup';
import { useLatestRef } from 'hooks/useLatestRef';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { isAutoSync } from 'helpers/autoSync';
import fireEvent from 'helpers/fireEvent';
import getCurrentRole from 'helpers/getCurrentRole';
import logger from 'helpers/logger';

import { executeWithCancellation } from 'utils/executeWithCancellation';
import { syncFileToS3 } from 'utils/syncFileToS3';

import { useSyncDocumentChecker } from 'features/Document/hooks/useSyncDocumentChecker';
import { documentSyncSelectors } from 'features/Document/slices';
import { removeSignedUrlSignature } from 'features/Signature/utils';

import { documentStorage } from 'constants/documentConstants';
import { general } from 'constants/documentType';
import { DOCUMENT_ROLES, LOGGER, OPERATION_CANCELED_MESSAGE, STORAGE_TYPE } from 'constants/lumin-common';
import { ModalKeys } from 'constants/modal-keys';

import { AnnotationChangedAction } from 'interfaces/annotation/annotation.interface';

import { useFetchingAnnotationsStore } from './useFetchingAnnotationsStore';
import { useSyncAnnotationsStore } from './useSyncAnnotationsStore';
import useSyncThirdParty from './useSyncThirdParty';
import styles from '../components/ForceSyncModal/ForceSyncModal.module.scss';
import { SYNC_DOCUMENT_THROTTLE_TIME } from '../constants/forceSync';
import { SyncThirdPartySource } from '../constants/syncThirdPartySource.enum';
import { ForceSyncDocumentManager } from '../utils/forceSyncDocumentManager';

export const useSyncNumerousAnnotations = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isDocumentLoaded = useSelector(selectors.isDocumentLoaded);
  const canModifyDriveContent = useSelector(selectors.canModifyDriveContent);
  const { annotations: luminAnnots } = useFetchingAnnotationsStore();
  const forceSyncDocumentManagerRef = useRef<ForceSyncDocumentManager>(null);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const documentId = get(currentDocument, '_id', '');
  const documentService = get(currentDocument, 'service', '');
  const documentMimeType = get(currentDocument, 'mimeType', '');
  const isGoogleAutoSyncEnabled =
    !isEmpty(currentDocument) && isAutoSync(currentDocument) && currentDocument?.enableGoogleSync;
  const isPdfFile = documentMimeType === general.PDF;
  const currentRole = getCurrentRole(currentDocument);
  const canEditDocument = [DOCUMENT_ROLES.EDITOR, DOCUMENT_ROLES.SHARER, DOCUMENT_ROLES.OWNER].includes(currentRole);
  const hasShownSyncModal = useRef(false);
  const hasRunAutomaticCheck = useRef(false);
  const {
    abortController,
    setIsSyncing,
    resetAbortController,
    isSyncing: isSyncingAnnotations,
  } = useSyncAnnotationsStore(
    useShallow((state) => ({
      abortController: state.abortController,
      setIsSyncing: state.setIsSyncing,
      resetAbortController: state.resetAbortController,
      isSyncing: state.isSyncing,
    }))
  );
  const isSyncing = useSelector(documentSyncSelectors.isSyncing);
  const isSyncingAnnotationsRef = useLatestRef(isSyncingAnnotations);
  const totalAnnotsRef = useRef(0);

  const { canSyncOnAnnotationChange, canSync } = useSyncDocumentChecker();

  const { handleSyncThirdParty } = useSyncThirdParty({ source: SyncThirdPartySource.FORCE_SYNC });

  const logForceSyncDocument = useCallback(() => {
    logger.logInfo({
      reason: LOGGER.Service.FORCE_SYNC_DOCUMENT,
      attributes: {
        documentService,
        totalAnnots: totalAnnotsRef.current || 0,
      },
    });
    totalAnnotsRef.current = 0;
  }, [documentService]);

  const syncToS3 = useCallback(async () => {
    try {
      setIsSyncing(true);
      totalAnnotsRef.current = forceSyncDocumentManagerRef.current?.getTotalAnnots();
      await executeWithCancellation({
        callback: syncFileToS3,
        signal: abortController?.signal,
      })({ signal: abortController?.signal });
      if (abortController?.signal?.aborted) {
        return;
      }
      if (await ForceSyncDocumentManager.shouldForceSyncEncryptedDocument()) {
        await removeSignedUrlSignature({ currentDocument }, { signal: abortController?.signal });
      }
      if (abortController?.signal?.aborted) {
        return;
      }
      forceSyncDocumentManagerRef.current?.prepareNextSync();
      fireEvent('refetchDocument');
    } catch (error) {
      if (error instanceof Error && error.message === OPERATION_CANCELED_MESSAGE) {
        return;
      }

      logger.logError({
        reason: LOGGER.Service.FORCE_SYNC_DOCUMENT_ERROR,
        error: error as Error,
      });
    } finally {
      logForceSyncDocument();
      setIsSyncing(false);
    }
  }, [abortController, setIsSyncing, logForceSyncDocument]);

  const openSyncNumerousAnnotationsModal = useCallback(() => {
    core.deselectAllAnnotations();
    dispatch(
      actions.openViewerModal({
        key: ModalKeys.FORCE_SYNC_DOCUMENT,
        closeOnConfirm: false,
        title: t('viewer.sync.forceSync.title'),
        message: (
          <div className={styles.description}>
            {t('viewer.sync.forceSync.description', {
              count: ForceSyncDocumentManager.getForceSyncAnnotationsThreshold(),
            })}
          </div>
        ),
        confirmButtonTitle: t('action.syncNow'),
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        PaperProps: {
          style: {
            padding: 'var(--kiwi-spacing-3)',
          },
        },
        onConfirm: async () => {
          setIsSyncing(true);
          dispatch(
            actions.updateModalProperties({
              isProcessing: true,
            })
          );
          try {
            hasShownSyncModal.current = true;
            totalAnnotsRef.current = forceSyncDocumentManagerRef.current?.getTotalAnnots();
            await executeWithCancellation({
              callback: handleSyncThirdParty,
              signal: abortController?.signal,
            })({ signal: abortController?.signal });
            if (await ForceSyncDocumentManager.shouldForceSyncEncryptedDocument()) {
              await removeSignedUrlSignature({ currentDocument }, { signal: abortController?.signal });
            }
            forceSyncDocumentManagerRef.current?.prepareNextSync();
          } catch (error) {
            if (error instanceof Error && error.message === OPERATION_CANCELED_MESSAGE) {
              return;
            }

            logger.logError({
              reason: LOGGER.Service.FORCE_SYNC_DOCUMENT_ERROR,
              error: error as Error,
            });
          } finally {
            logForceSyncDocument();
            setIsSyncing(false);
            if (!isGoogleAutoSyncEnabled) {
              dispatch(
                actions.updateModalProperties({
                  open: false,
                  isProcessing: false,
                })
              );
            }
          }
        },
        onCancel: () => {
          hasShownSyncModal.current = true;
          dispatch(
            actions.updateModalProperties({
              open: false,
            })
          );
        },
      })
    );
  }, [dispatch, handleSyncThirdParty, t, abortController, setIsSyncing, logForceSyncDocument, isGoogleAutoSyncEnabled]);

  const handleSyncDocument = useCallback(async () => {
    switch (documentService) {
      case STORAGE_TYPE.S3: {
        await syncToS3();
        break;
      }
      case STORAGE_TYPE.ONEDRIVE:
      case STORAGE_TYPE.GOOGLE: {
        if (!canModifyDriveContent) {
          break;
        }
      }
      // eslint-disable-next-line no-fallthrough
      case STORAGE_TYPE.DROPBOX:
      default: {
        openSyncNumerousAnnotationsModal();
      }
    }
  }, [documentService, syncToS3, canModifyDriveContent, openSyncNumerousAnnotationsModal]);

  const throttledSyncDocument = useMemo(
    () => throttle(handleSyncDocument, SYNC_DOCUMENT_THROTTLE_TIME, { leading: false }),
    [handleSyncDocument]
  );

  const checkDocumentSyncable = useCallback(
    () => isDocumentLoaded && forceSyncDocumentManagerRef.current && canEditDocument && documentId,
    [isDocumentLoaded, canEditDocument, documentId]
  );

  useEffect(() => {
    const onAnnotationChanged = async (
      changedAnnotations: Core.Annotations.Annotation[],
      action: AnnotationChangedAction,
      objectInfo: Core.AnnotationManager.AnnotationChangedInfoObject
    ) => {
      const { imported } = objectInfo;
      if (
        isSyncingAnnotationsRef.current ||
        isSyncing ||
        !canSyncOnAnnotationChange(imported) ||
        !checkDocumentSyncable() ||
        isGoogleAutoSyncEnabled ||
        (documentService !== documentStorage.s3 && !isPdfFile)
      ) {
        return;
      }

      forceSyncDocumentManagerRef.current.addModifiedAnnotations(changedAnnotations);
      const forceSync = forceSyncDocumentManagerRef.current.checkAnnotationsChangedForceSync();
      if (forceSync) {
        await throttledSyncDocument();
      }
    };

    core.addEventListener('annotationChanged', onAnnotationChanged);

    return () => {
      core.removeEventListener('annotationChanged', onAnnotationChanged);
    };
  }, [
    throttledSyncDocument,
    checkDocumentSyncable,
    isGoogleAutoSyncEnabled,
    isSyncing,
    canSyncOnAnnotationChange,
    isPdfFile,
    documentService,
    isSyncingAnnotationsRef,
  ]);

  useEffect(() => {
    if (abortController?.signal?.aborted) {
      resetAbortController();
    }

    if (!canSync) {
      abortController?.abort();
    }
  }, [canSync, resetAbortController, abortController]);

  useEffect(() => {
    const syncDocumentAutomatically = async () => {
      if (
        isSyncingAnnotationsRef.current ||
        hasRunAutomaticCheck.current ||
        hasShownSyncModal.current ||
        isSyncing ||
        !checkDocumentSyncable() ||
        ([documentStorage.onedrive, documentStorage.google].includes(documentService) && !canModifyDriveContent) ||
        (documentService !== documentStorage.s3 && !isPdfFile)
      ) {
        return;
      }

      hasRunAutomaticCheck.current = true;
      forceSyncDocumentManagerRef.current.totalUnsyncedAnnots = luminAnnots.length;
      const forceSync = await forceSyncDocumentManagerRef.current.checkAutomaticallyForceSync();
      if (forceSync) {
        await throttledSyncDocument();
      }
    };

    syncDocumentAutomatically().catch(() => {});
  }, [
    luminAnnots.length,
    throttledSyncDocument,
    checkDocumentSyncable,
    isSyncing,
    canModifyDriveContent,
    isPdfFile,
    documentService,
    isSyncingAnnotationsRef,
  ]);

  useEffect(() => {
    if (isDocumentLoaded && !forceSyncDocumentManagerRef.current) {
      forceSyncDocumentManagerRef.current = ForceSyncDocumentManager.getInstance();
      resetAbortController();
    }
  }, [isDocumentLoaded, resetAbortController]);

  useCleanup(() => {
    ForceSyncDocumentManager.clearInstance();
    forceSyncDocumentManagerRef.current = null;
    throttledSyncDocument.cancel();
  }, [documentId]);
};
