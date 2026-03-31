import { isEmpty } from 'lodash';
import { useCallback } from 'react';
import { v4 } from 'uuid';
import { useShallow } from 'zustand/react/shallow';

import { documentServices } from 'services';

import logger from 'helpers/logger';

import { FIELD_ID, FIELD_SESSION_ID, TRN_FORM_FIELD_TYPE } from 'constants/formBuildTool';

import { useFormFieldDetectionStore } from './useFormFieldDetectionStore';
import { FORM_FIELD_TYPE_TO_DETECTION_TYPE_MAPPER, TOOLS_NAME_TO_DETECTION_TYPE_MAPPER } from '../constants/mapper';
import { IFormFieldDetectionPrediction, PredictionFieldsDataType } from '../types/detectionField.type';

export const useProcessAppliedFormFields = () => {
  const { predictionData, removeAllData } = useFormFieldDetectionStore(
    useShallow((state) => ({
      predictionData: state.predictionData,
      removeAllData: state.removeAllData,
    }))
  );

  const handleProcessAppliedFormFields = useCallback(
    async ({
      documentId,
      appliedFormFields = [],
    }: {
      documentId: string;
      appliedFormFields: Core.Annotations.Annotation[];
    }) => {
      try {
        if (isEmpty(predictionData) || appliedFormFields.length === 0) {
          return;
        }
        const chunkSize = 50;
        const processingPromise: Promise<{
          statusCode: number;
          message: string;
        }>[] = [];
        for (let i = 0; i < appliedFormFields.length; i += chunkSize) {
          const chunk = appliedFormFields.slice(i, i + chunkSize);
          const appliedFormFieldsData: Record<string, IFormFieldDetectionPrediction[]> = {};
          chunk.forEach((field) => {
            const fieldType =
              TOOLS_NAME_TO_DETECTION_TYPE_MAPPER[field.ToolName] ||
              FORM_FIELD_TYPE_TO_DETECTION_TYPE_MAPPER[field.getCustomData(TRN_FORM_FIELD_TYPE)];
            const sessionId = field.getCustomData(FIELD_SESSION_ID as string);
            if (!fieldType || !predictionData[sessionId]) {
              return;
            }

            const x1 = field.getX();
            const y1 = field.getY();
            const x2 = field.getWidth() + x1;
            const y2 = field.getHeight() + y1;
            const fieldId = field.getCustomData(FIELD_ID as string) || v4();

            appliedFormFieldsData[sessionId] = appliedFormFieldsData[sessionId] || [];
            appliedFormFieldsData[sessionId].push({
              boundingRectangle: { x1, y1, x2, y2 },
              fieldType,
              fieldId,
              pageNumber: field.getPageNumber(),
            });
          });

          const predictionFieldDataList: PredictionFieldsDataType[] = [];

          Object.entries(predictionData).forEach(([key, value]) => {
            if (isEmpty(value) || isEmpty(appliedFormFieldsData[key])) {
              return;
            }

            predictionFieldDataList.push({
              sessionId: key,
              appliedFormFields: appliedFormFieldsData[key],
              predictions: value,
            });
          });

          processingPromise.push(
            documentServices.processAppliedFormFields({
              documentId,
              predictionFieldDataList,
            })
          );
        }
        await Promise.allSettled(processingPromise);
      } catch (error) {
        logger.logError({
          message: 'Failed to processAppliedFormFields',
          error: error as Error,
        });
      } finally {
        removeAllData();
      }
    },
    [predictionData, removeAllData]
  );

  return { handleProcessAppliedFormFields };
};
