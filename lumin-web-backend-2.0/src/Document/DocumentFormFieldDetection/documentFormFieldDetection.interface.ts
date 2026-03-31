import { FormFieldDetection } from 'graphql.schema';

import { DetectionErrorCodes } from './documentFormFieldDetection.enum';

export interface IStatusMessage {
  code: number;
  error_code: DetectionErrorCodes;
  message: string;
}

export interface IFormFieldDetectionPredictionMessage {
  page_idx: string;
  bbox: number[];
  score: number;
  field_type: string;
  field_flags: number;
}

export interface IFormFieldDetectionMessage {
  document_id: string;
  predictions: IFormFieldDetectionPredictionMessage[];
  status: IStatusMessage;
  session_id: string;
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
  fieldType: FormFieldDetection;
  score: number;
  fieldId: string;
  fieldFlags: number;
}

export interface IStatus {
  code?: number;
  errorCode?: string;
  message?: string;
}

export interface IFormFieldDetectionResult {
  documentId: string;
  predictions: IFormFieldDetectionPrediction[];
  status: IStatus;
  sessionId: string;
}

export interface IFormFieldDetectionFailMessage {
  documentId: string;
  errorMessage: string;
  sessionId: string;
}

export interface IAppliedFormFieldData {
  bbox: number[];
  field_type: string;
  field_id: string;
  page_idx: string;
  score: number;
}

export interface IAppliedFormFieldData {
  bbox: number[];
  field_type: string;
  field_id: string;
  page_idx: string;
  score: number;
}
