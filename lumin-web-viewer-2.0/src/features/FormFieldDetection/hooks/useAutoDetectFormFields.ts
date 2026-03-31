import { useWindowEvent } from '@mantine/hooks';
import get from 'lodash/get';
import { useEffect, useRef } from 'react';

import core from 'core';
import selectors from 'selectors';

import { useCleanup } from 'hooks/useCleanup';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useShallowSelector } from 'hooks/useShallowSelector';

import indexedDBService from 'services/indexedDBService';

import logger from 'helpers/logger';

import { CollabManipChangedParams, ManipChangedParams } from 'features/PageTracker/types/pageTracker.type';
import { PageTracker } from 'features/PageTracker/utils/pageTracker';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { LOGGER } from 'constants/lumin-common';

import { useAutoDetectFormFieldsEnabled } from './useAutoDetectFormFieldsEnabled';
import { usePreviewAutoDetectHandler } from './usePreviewAutoDetectHandler';
import { useSetupAutoDetectQueue } from './useSetupAutoDetectQueue';

export const useAutoDetectFormFields = () => {
  const pageTrackerRef = useRef<PageTracker | null>(null);
  const { canUseAutoDetectFormFields, shouldAutoDetectFormFields, isViewerLoaded } = useAutoDetectFormFieldsEnabled();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const documentId = get(currentDocument, '_id', '');
  const currentUser = useGetCurrentUser();
  const isExceeded = get(currentUser, 'toolQuota.autoDetection.isExceeded', false);
  usePreviewAutoDetectHandler({ canUseAutoDetectFormFields, documentId });
  const { autoDetectQueueRef, hasLoadedDataFromIndexedDB } = useSetupAutoDetectQueue({
    isViewerLoaded,
    documentId,
    pageTrackerRef,
  });

  useWindowEvent(CUSTOM_EVENT.PAGE_TRACKER_MANIPULATION_CHANGED, (event: CustomEvent<ManipChangedParams>) => {
    pageTrackerRef.current?.onManipulationChanged(event.detail);
  });

  useWindowEvent(CUSTOM_EVENT.PAGE_TRACKER_COLLAB_MANIP_CHANGED, (event: CustomEvent<CollabManipChangedParams>) => {
    pageTrackerRef.current?.onCollabManipChanged(event.detail);
  });

  useEffect(() => {
    if (!pageTrackerRef.current) {
      pageTrackerRef.current = new PageTracker({
        onManipulationChangedHandler: async (data) => {
          try {
            const pageMapper = autoDetectQueueRef.current?.getPageMapper(data);
            if (autoDetectQueueRef.current) {
              autoDetectQueueRef.current.setProcessedPages = Array.from(pageMapper.values());
            }

            await indexedDBService.updateAutoDetectFormFieldsPageNumber({
              documentId,
              pageMapper,
              manipulationId: data.manipulationId,
            });
          } catch (error) {
            logger.logError({
              reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
              message: 'Error when update auto detect form fields page number from manipulation changed',
              error: error as Error,
            });
          }
        },
      });
    }
  }, [isViewerLoaded, documentId]);

  useEffect(() => {
    if (!hasLoadedDataFromIndexedDB || !shouldAutoDetectFormFields || !autoDetectQueueRef.current || isExceeded) {
      return;
    }

    try {
      const totalPages = core.getTotalPages();
      autoDetectQueueRef.current.setTotalPages = totalPages;
      autoDetectQueueRef.current.handleTypeToolActivation();
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
        message: 'Error when trigger auto detect form fields',
        error: error as Error,
      });
    }
  }, [shouldAutoDetectFormFields, hasLoadedDataFromIndexedDB, isExceeded]);

  useCleanup(() => {
    pageTrackerRef.current = null;
  }, []);
};
