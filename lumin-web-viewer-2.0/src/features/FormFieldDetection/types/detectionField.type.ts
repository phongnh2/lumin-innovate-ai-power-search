import { FormFieldDetection, TriggerAction } from '../constants/detectionField.constant';

export type FormFieldDetectionType = typeof FormFieldDetection[keyof typeof FormFieldDetection];

export type TriggerActionType = typeof TriggerAction[keyof typeof TriggerAction];

export interface IStatus {
  code: number;
  errorCode?: string;
  message?: string;
}

export interface IBoundingRectangle {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface IFormFieldDetectionPrediction {
  pageNumber: number;
  boundingRectangle: IBoundingRectangle;
  fieldType: FormFieldDetectionType;
  score?: number;
  fieldId: string;
  fieldFlags?: number;
  isDeleted?: boolean;
}

export interface IFormFieldDetectionResult {
  documentId: string;
  predictions: IFormFieldDetectionPrediction[];
  status: IStatus;
}

export type PredictionFieldsDataType = {
  sessionId: string;
  appliedFormFields: IFormFieldDetectionPrediction[];
  predictions: IFormFieldDetectionPrediction[];
};

export type IAutoDetectPredictionData = {
  manipStepIds: string[];
  predictions: Record<number, Omit<IFormFieldDetectionPrediction, 'pageNumber'>[]>;
};
