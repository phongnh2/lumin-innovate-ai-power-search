import produce from 'immer';
import range from 'lodash/range';
import pLimit from 'p-limit';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';

import { getExtractedData } from '@new-ui/components/ToolProperties/components/SplitExtractPanel/hooks/useExtractPages';

import actions from 'actions';
import core from 'core';

import { useCleanup } from 'hooks/useCleanup';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import documentServices from 'services/documentServices';
import indexedDBService from 'services/indexedDBService';

import exportAnnotations from 'helpers/exportAnnotations';
import logger from 'helpers/logger';

import errorExtract from 'utils/error';

import { socket } from '@socket';

import { FormFieldDetection, TriggerAction } from 'features/FormFieldDetection/constants/detectionField.constant';
import { PageTracker } from 'features/PageTracker/utils/pageTracker';

import { DefaultErrorCode } from 'constants/errorCode';
import { LOGGER } from 'constants/lumin-common';
import { SOCKET_ON } from 'constants/socketConstant';

import { IUser } from 'interfaces/user/user.interface';

import { IAutoDetectPredictionData, IFormFieldDetectionResult } from '../types/detectionField.type';
import { AutoDetectQueue } from '../utils/autoDetectQueue';
import { createDetectedFieldPlaceholders } from '../utils/createDetectedFieldPlaceholders';
import { uploadFileToS3ForDetection } from '../utils/uploadFileToS3ForDetection';

const limitPromise = pLimit(1);

export const useSetupAutoDetectQueue = ({
  isViewerLoaded,
  documentId,
  pageTrackerRef,
}: {
  isViewerLoaded: boolean;
  documentId: string;
  pageTrackerRef: RefObject<PageTracker | null>;
}) => {
  const dispatch = useDispatch();
  const currentUser = useGetCurrentUser();
  const autoDetectQueueRef = useRef<AutoDetectQueue | null>(null);
  const activeListenerRef = useRef<Set<string>>(new Set());
  const [hasLoadedDataFromIndexedDB, setHasLoadedDataFromIndexedDB] = useState(false);

  const fetchAutoDetectFormFields = useCallback(
    async (pages: number[] = []) => {
      try {
        const data = await indexedDBService.getAutoDetectFormFields(documentId, pages);
        if (!data.predictions) {
          return;
        }

        const processedPages = createDetectedFieldPlaceholders(data.predictions);
        if (!pages.length) {
          autoDetectQueueRef.current.setProcessedPages = processedPages;
        }
      } catch (error) {
        logger.logError({
          reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
          message: 'Error in fetchAutoDetectFormFields',
          error: error as Error,
        });
      } finally {
        setHasLoadedDataFromIndexedDB(true);
      }
    },
    [documentId]
  );

  useEffect(() => {
    if (!isViewerLoaded || !documentId) {
      return;
    }

    const handleExtractPages = async (pages: number[]) => {
      const annotationManager = core.getAnnotationManager();
      const annotList = annotationManager
        .getAnnotationsList()
        .filter((annot: Core.Annotations.Annotation) => pages.includes(annot.PageNumber));
      const xfdfString = await exportAnnotations({
        annotList,
        widgets: true,
        fields: true,
      });
      const data = await getExtractedData(pages, xfdfString);
      return new Uint8Array(data);
    };

    const handleSendDocumentForDetect = async (pages: number[]) => {
      try {
        const [fileBuffer, { presignedUrl, sessionId, usage, blockTime, isExceeded }] = await Promise.all([
          handleExtractPages(pages),
          documentServices.createPresignedFormFieldDetectionUrl(
            {
              documentId,
              triggerAction: TriggerAction.AUTOMATIC,
              pages: range(1, pages.length + 1),
            },
            { signal: null }
          ),
        ]);
        const newUser = produce(currentUser, (draft) => {
          draft.toolQuota = {
            autoDetection: {
              usage,
              blockTime,
              isExceeded,
            },
          };
        });
        dispatch(actions.updateCurrentUser(newUser) as AnyAction);
        await uploadFileToS3ForDetection({
          presignedUrl,
          fileBuffer,
          documentName: sessionId,
          options: {
            signal: null,
          },
        });
        return sessionId;
      } catch (error) {
        const { code, metadata } = errorExtract.extractGqlError(error) as {
          code: string;
          metadata: IUser['toolQuota']['autoDetection'];
        };
        if (code === DefaultErrorCode.TOO_MANY_REQUESTS && metadata) {
          const newUser = produce(currentUser, (draft) => {
            draft.toolQuota = {
              autoDetection: metadata,
            };
          });
          dispatch(actions.updateCurrentUser(newUser) as AnyAction);
        }
        logger.logError({
          reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
          message: 'Error when send document for detect',
          error: error as Error,
        });
        return null;
      }
    };

    const onAutoDetectFormFieldCompleted = async ({
      data,
      pages,
      socketMessage,
    }: {
      data: IFormFieldDetectionResult;
      pages: number[];
      socketMessage: string;
    }) => {
      try {
        const { status, predictions } = data;
        if (status.errorCode || !predictions.length) {
          throw new Error('Can not detect form fields');
        }

        const predictionData: IAutoDetectPredictionData['predictions'] = {};
        predictions.forEach((prediction) => {
          const { pageNumber, ...rest } = prediction;
          // TODO: We will handle signature field in card https://lumin.atlassian.net/browse/LMV-6527
          if (rest.fieldType === FormFieldDetection.SIGNATURE) {
            return;
          }

          const page = pages[pageNumber - 1];
          const pageMapper = pageTrackerRef.current?.getMappedPage(page);
          if (!Number.isFinite(pageMapper)) {
            return;
          }

          if (!predictionData[pageMapper]) {
            predictionData[pageMapper] = [];
          }
          predictionData[pageMapper].push(rest);
        });
        pages.forEach((page) => {
          const pageNumber = pageTrackerRef.current?.getMappedPage(page);
          if (!predictionData[pageNumber]?.length && Number.isFinite(pageNumber)) {
            predictionData[pageNumber] = [];
          }

          pageTrackerRef.current?.untrackPage(page);
        });

        await indexedDBService.saveAutoDetectFormFields(documentId, predictionData);
        await fetchAutoDetectFormFields(Object.keys(predictionData).map(Number));
        activeListenerRef.current.delete(socketMessage);
      } catch (error) {
        logger.logError({
          reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
          message: 'Error in onAutoDetectFormFieldCompleted',
          error: error as Error,
        });
      }
    };

    const handleListenForResult = (sessionId: string, pages: number[]) => {
      const socketMessage = `${SOCKET_ON.FORM_FIELD_DETECTION_COMPLETED}-${sessionId}`;
      pages.forEach((page) => {
        pageTrackerRef.current?.trackPage(page);
      });
      activeListenerRef.current.add(socketMessage);
      socket.once(socketMessage, (data: IFormFieldDetectionResult) =>
        limitPromise(onAutoDetectFormFieldCompleted, { data, pages, socketMessage })
      );
    };

    if (!autoDetectQueueRef.current) {
      autoDetectQueueRef.current = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect,
        handleListenForResult,
      });
    }

    fetchAutoDetectFormFields().catch(() => {});
  }, [isViewerLoaded, documentId, fetchAutoDetectFormFields, dispatch]);

  useCleanup(() => {
    AutoDetectQueue.clearInstance();
    autoDetectQueueRef.current = null;
    activeListenerRef.current.forEach((socketMessage) => {
      socket.removeListener({ message: socketMessage });
    });
    activeListenerRef.current.clear();
  }, []);

  return {
    autoDetectQueueRef,
    hasLoadedDataFromIndexedDB,
  };
};
