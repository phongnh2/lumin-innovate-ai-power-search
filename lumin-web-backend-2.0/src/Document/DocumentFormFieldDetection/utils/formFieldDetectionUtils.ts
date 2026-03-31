/* eslint-disable camelcase */

import * as mime from 'mime-types';
import { v4 } from 'uuid';

import { DocumentMimeType } from 'Document/document.enum';
import { FormFieldDetection } from 'graphql.schema';

import {
  IFormFieldDetectionMessage, IFormFieldDetectionPrediction, IFormFieldDetectionPredictionMessage, IFormFieldDetectionResult,
} from '../documentFormFieldDetection.interface';

export class FormFieldDetectionUtils {
  static generateObjectKeyAndSessionId = ({
    documentId,
    mimeType,
    prefixEnv,
    fieldType,
  }: {
    documentId: string;
    mimeType: DocumentMimeType;
    prefixEnv: string;
    fieldType: FormFieldDetection;
  }): {
    key: string;
    sessionId: string;
  } => {
    const sessionId = v4();
    const defaultExtension = mime.extension(mimeType);
    return {
      key: `form-field-detection/${prefixEnv}/${fieldType}/${sessionId}-${documentId}.${defaultExtension}`,
      sessionId,
    };
  };

  static transformPredictionMessage = ({
    page_idx,
    bbox,
    field_type,
    score,
    field_flags,
  }: IFormFieldDetectionPredictionMessage): IFormFieldDetectionPrediction => {
    const [x1, y1, x2, y2] = bbox;
    return {
      pageNumber: parseInt(page_idx, 10) + 1,
      boundingRectangle: {
        x1,
        y1,
        x2,
        y2,
      },
      fieldType: field_type as FormFieldDetection,
      score,
      fieldId: v4(),
      fieldFlags: field_flags,
    };
  };

  static transformFormFieldDetectionMessage = (
    formFieldDetectionMessage: IFormFieldDetectionMessage,
  ): IFormFieldDetectionResult => {
    const {
      document_id: documentId,
      predictions,
      status: { code, error_code: errorCode, message },
      session_id,
    } = formFieldDetectionMessage;
    const formFieldPredictions = predictions.map(
      this.transformPredictionMessage,
    );
    return {
      documentId,
      predictions: formFieldPredictions,
      status: {
        code,
        errorCode,
        message,
      },
      sessionId: session_id,
    };
  };
}
