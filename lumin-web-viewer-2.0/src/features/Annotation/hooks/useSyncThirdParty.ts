import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 } from 'uuid';

import { enqueueSnackbar } from '@libs/snackbar';

import actions from 'actions';
import selectors from 'selectors';

import { useAutoSync } from 'hooks/useAutoSync';
import useDocumentTools, { CallbackResult } from 'hooks/useDocumentTools';
import { useLatestRef } from 'hooks/useLatestRef';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTrackingDocumentSync } from 'hooks/useTrackingDocumentSync';
import { useTranslation } from 'hooks/useTranslation';

import userServices from 'services/userServices';

import logger from 'helpers/logger';

import { checkAndDispatchQuotaExceeded } from 'utils/checkQuotaExternalStorage';
import { executeWithCancellation } from 'utils/executeWithCancellation';
import { getLinearizedDocumentFile } from 'utils/getFileService';
import { eventTracking } from 'utils/recordUtil';

import {
  documentUploadExternalActions,
  documentUploadExternalSelectors,
  SYNC_STATUS,
} from 'features/DocumentUploadExternal/slices';
import useSyncFileToExternalStorage from 'features/DocumentUploadExternal/useSyncFileToExternalStorage';
import { featureStoragePolicy } from 'features/FeatureConfigs';
import { useSyncedQueueContext } from 'features/FileSync';

import { AUTO_SYNC_CHANGE_TYPE } from 'constants/autoSyncConstant';
import { DocumentStorage } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import { HUBSPOT_CONTACT_PROPERTIES } from 'constants/hubspotContactProperties';
import { LOGGER, OPERATION_CANCELED_MESSAGE, STORAGE_TYPE, STORAGE_TYPE_DESC } from 'constants/lumin-common';
import { ModalKeys } from 'constants/modal-keys';

import { SyncThirdPartySource } from '../constants/syncThirdPartySource.enum';
import { SyncThirdPartySourceType } from '../types/syncThirdPartySource.type';

const useSyncThirdParty = ({ source }: { source?: SyncThirdPartySourceType } = {}) => {
  const dispatch = useDispatch();
  const { handleDocStackForSyncExternalFile } = useDocumentTools();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const latestDocumentRef = useLatestRef(currentDocument);
  const { key: modalKey } = useShallowSelector(selectors.getModalData);
  const isForceSyncModalOpen = modalKey === ModalKeys.FORCE_SYNC_DOCUMENT;
  const syncFile = useSyncFileToExternalStorage(
    latestDocumentRef.current?.service as typeof featureStoragePolicy.externalStorages[number]
  );
  const { handleTrackDocumentSync } = useTrackingDocumentSync();
  const { t } = useTranslation();
  const syncStatus = useSelector(documentUploadExternalSelectors.syncStatus);
  const syncStatusRef = useLatestRef(syncStatus);
  const { setQueue } = useSyncedQueueContext();

  const closeForceSyncModal = () => {
    if (isForceSyncModalOpen) {
      dispatch(
        actions.updateModalProperties({
          open: false,
          isProcessing: false,
        })
      );
    }
  };
  const { sync } = useAutoSync({
    onSyncSuccess: ({ hasBackupToS3: syncToS3, action }) => {
      if (source === SyncThirdPartySource.FORCE_SYNC) {
        closeForceSyncModal();
      }
      if (!syncToS3 && !action.includes(AUTO_SYNC_CHANGE_TYPE.ANNOTATION_CHANGE)) {
        enqueueSnackbar({
          message: t('viewer.header.yourFileHasBeenSyncedTo', { destinationStorage: DocumentStorage.GOOGLE }),
          variant: 'success',
          preventDuplicate: true,
        });
      }
    },
    onError: () => {
      if (source === SyncThirdPartySource.FORCE_SYNC) {
        closeForceSyncModal();
      }
    },
  });

  const handleInstantSync = useCallback(
    async ({ signal }: { signal?: AbortSignal } = {}) => {
      if (!latestDocumentRef.current) {
        return {
          result: CallbackResult.Failed,
        };
      }

      dispatch(documentUploadExternalActions.setIsSyncing());
      eventTracking(UserEventConstants.EventType.INSTANT_SYNC_CLICK, {
        source: latestDocumentRef.current.service,
      }).catch(() => {});
      const { successMsg } = await syncFile({
        currentDocument: latestDocumentRef.current,
        shouldShowRatingModal: true,
        isOverride: true,
        newDocumentName: latestDocumentRef.current.name,
        signal,
      });

      if (!successMsg) {
        dispatch(documentUploadExternalActions.resetSyncStatus());
        return {
          result: CallbackResult.Failed,
        };
      }

      if (signal?.aborted) {
        return {
          result: CallbackResult.Failed,
        };
      }
      enqueueSnackbar({
        message: t('viewer.header.yourFileHasBeenSyncedTo', {
          destinationStorage:
            STORAGE_TYPE_DESC[
              latestDocumentRef.current?.service as typeof featureStoragePolicy.externalStorages[number]
            ],
        }),
        preventDuplicate: true,
        variant: 'success',
      });
      dispatch(documentUploadExternalActions.setIsSaved());
      userServices.saveHubspotProperties({ key: HUBSPOT_CONTACT_PROPERTIES.SYNC_DOCUMENT, value: 'true' }) as unknown;
      handleTrackDocumentSync();

      return {
        result: CallbackResult.Success,
      };
    },
    [dispatch, t]
  );

  const handleSyncThirdParty: ({ signal }?: { signal?: AbortSignal }) => Promise<void> = useCallback(
    async ({ signal } = {}) => {
      const file = await getLinearizedDocumentFile(latestDocumentRef.current?.name);
      if (checkAndDispatchQuotaExceeded(file, latestDocumentRef.current)) {
        return;
      }

      if (syncStatusRef.current === SYNC_STATUS.SAVED) {
        return Promise.resolve();
      }

      if (latestDocumentRef.current?.service === STORAGE_TYPE.GOOGLE) {
        const id = v4();
        const actionId = `${AUTO_SYNC_CHANGE_TYPE.ANNOTATION_CHANGE}:${id}`;
        setQueue((queue) => [...queue, actionId]);
        return handleDocStackForSyncExternalFile({
          callback: () => sync(actionId, { forceSync: source === SyncThirdPartySource.FORCE_SYNC }),
          storage: latestDocumentRef.current?.service,
          signal,
        });
      }

      return handleDocStackForSyncExternalFile({
        callback: async () => {
          try {
            return await executeWithCancellation({
              callback: handleInstantSync,
              signal,
            })({ signal });
          } catch (error) {
            if (error instanceof Error && error.message === OPERATION_CANCELED_MESSAGE) {
              return {
                result: CallbackResult.Failed,
              };
            }

            logger.logError({
              reason: LOGGER.Service.FORCE_SYNC_DOCUMENT_ERROR,
              error: error as Error,
            });
          }
        },
        storage: latestDocumentRef.current?.service,
        signal,
      });
    },
    [handleInstantSync, source]
  );

  return {
    handleSyncThirdParty,
  };
};

export default useSyncThirdParty;
