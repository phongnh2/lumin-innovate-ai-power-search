import core from 'core';

import DetectedFieldPlaceholder from 'helpers/CustomAnnotation/DetectedFieldPlaceholder';

import { AUTO_DETECT_ALLOW_FIELD_TYPES, FormFieldDetection } from '../../constants/detectionField.constant';
import { IAutoDetectPredictionData } from '../../types/detectionField.type';
import { createDetectedFieldPlaceholders } from '../createDetectedFieldPlaceholders';

interface MockDetectedFieldPlaceholder {
  PageNumber: number;
  X: number;
  Y: number;
  Width: number;
  Height: number;
  CustomFieldType: string;
  CustomFieldId: string;
}

jest.mock('core', () => ({
  getAnnotationManager: jest.fn(),
}));

jest.mock('helpers/CustomAnnotation/DetectedFieldPlaceholder', () =>
  jest.fn().mockImplementation(() => ({
    PageNumber: 0,
    X: 0,
    Y: 0,
    Width: 0,
    Height: 0,
    CustomFieldType: '',
    CustomFieldId: '',
  }))
);

describe('createDetectedFieldPlaceholders', () => {
  let mockAnnotationManager: {
    addAnnotation: jest.Mock;
    redrawAnnotation: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockAnnotationManager = {
      addAnnotation: jest.fn(),
      redrawAnnotation: jest.fn(),
    };

    (core.getAnnotationManager as jest.Mock).mockReturnValue(mockAnnotationManager);
  });

  describe('when predictions is null or undefined', () => {
    it('should return empty array when predictions is null', () => {
      const result = createDetectedFieldPlaceholders(null as unknown as IAutoDetectPredictionData['predictions']);

      expect(result).toEqual([]);
      expect(core.getAnnotationManager).not.toHaveBeenCalled();
      expect(mockAnnotationManager.addAnnotation).not.toHaveBeenCalled();
    });

    it('should return empty array when predictions is undefined', () => {
      const result = createDetectedFieldPlaceholders(undefined as unknown as IAutoDetectPredictionData['predictions']);

      expect(result).toEqual([]);
      expect(core.getAnnotationManager).not.toHaveBeenCalled();
      expect(mockAnnotationManager.addAnnotation).not.toHaveBeenCalled();
    });
  });

  describe('when predictions is empty object', () => {
    it('should return empty array', () => {
      const predictions: IAutoDetectPredictionData['predictions'] = {};

      const result = createDetectedFieldPlaceholders(predictions);

      expect(result).toEqual([]);
      expect(mockAnnotationManager.addAnnotation).not.toHaveBeenCalled();
    });
  });

  describe('when predictions contain invalid field types', () => {
    it('should skip predictions with fieldType not in AUTO_DETECT_ALLOW_FIELD_TYPES', () => {
      const predictions: IAutoDetectPredictionData['predictions'] = {
        1: [
          {
            boundingRectangle: { x1: 10, y1: 20, x2: 50, y2: 60 },
            fieldType: FormFieldDetection.RADIO_BOX, // Not in AUTO_DETECT_ALLOW_FIELD_TYPES
            fieldId: 'field-1',
            isDeleted: false,
          },
        ],
      };

      const result = createDetectedFieldPlaceholders(predictions);

      expect(result).toEqual([1]);
      expect(mockAnnotationManager.addAnnotation).not.toHaveBeenCalled();
      expect(mockAnnotationManager.redrawAnnotation).not.toHaveBeenCalled();
    });
  });

  describe('when predictions contain deleted fields', () => {
    it('should skip predictions with isDeleted = true', () => {
      const predictions: IAutoDetectPredictionData['predictions'] = {
        1: [
          {
            boundingRectangle: { x1: 10, y1: 20, x2: 50, y2: 60 },
            fieldType: FormFieldDetection.TEXT_BOX,
            fieldId: 'field-1',
            isDeleted: true,
          },
        ],
      };

      const result = createDetectedFieldPlaceholders(predictions);

      expect(result).toEqual([1]);
      expect(mockAnnotationManager.addAnnotation).not.toHaveBeenCalled();
      expect(mockAnnotationManager.redrawAnnotation).not.toHaveBeenCalled();
    });
  });

  describe('when predictions contain valid fields', () => {
    it('should create placeholder for TEXT_BOX field type', () => {
      const predictions: IAutoDetectPredictionData['predictions'] = {
        1: [
          {
            boundingRectangle: { x1: 10, y1: 20, x2: 50, y2: 60 },
            fieldType: FormFieldDetection.TEXT_BOX,
            fieldId: 'field-1',
            isDeleted: false,
          },
        ],
      };

      const result = createDetectedFieldPlaceholders(predictions);

      expect(result).toEqual([1]);
      expect(DetectedFieldPlaceholder).toHaveBeenCalledTimes(1);
      expect(mockAnnotationManager.addAnnotation).toHaveBeenCalledTimes(1);
      expect(mockAnnotationManager.redrawAnnotation).toHaveBeenCalledTimes(1);

      const createdAnnotation = (DetectedFieldPlaceholder as jest.Mock).mock.results[0]
        .value as MockDetectedFieldPlaceholder;
      expect(createdAnnotation.PageNumber).toBe(1);
      expect(createdAnnotation.X).toBe(10);
      expect(createdAnnotation.Y).toBe(20);
      expect(createdAnnotation.Width).toBe(40); // x2 - x1 = 50 - 10
      expect(createdAnnotation.Height).toBe(40); // y2 - y1 = 60 - 20
      expect(createdAnnotation.CustomFieldType).toBe(FormFieldDetection.TEXT_BOX);
      expect(createdAnnotation.CustomFieldId).toBe('field-1');
    });

    it('should create placeholder for CHECK_BOX field type', () => {
      const predictions: IAutoDetectPredictionData['predictions'] = {
        2: [
          {
            boundingRectangle: { x1: 5, y1: 15, x2: 25, y2: 35 },
            fieldType: FormFieldDetection.CHECK_BOX,
            fieldId: 'field-2',
            isDeleted: false,
          },
        ],
      };

      const result = createDetectedFieldPlaceholders(predictions);

      expect(result).toEqual([2]);
      expect(DetectedFieldPlaceholder).toHaveBeenCalledTimes(1);
      expect(mockAnnotationManager.addAnnotation).toHaveBeenCalledTimes(1);
      expect(mockAnnotationManager.redrawAnnotation).toHaveBeenCalledTimes(1);

      const createdAnnotation = (DetectedFieldPlaceholder as jest.Mock).mock.results[0]
        .value as MockDetectedFieldPlaceholder;
      expect(createdAnnotation.PageNumber).toBe(2);
      expect(createdAnnotation.X).toBe(5);
      expect(createdAnnotation.Y).toBe(15);
      expect(createdAnnotation.Width).toBe(20); // x2 - x1 = 25 - 5
      expect(createdAnnotation.Height).toBe(20); // y2 - y1 = 35 - 15
      expect(createdAnnotation.CustomFieldType).toBe(FormFieldDetection.CHECK_BOX);
      expect(createdAnnotation.CustomFieldId).toBe('field-2');
    });

    it('should create placeholder for SIGNATURE field type', () => {
      const predictions: IAutoDetectPredictionData['predictions'] = {
        3: [
          {
            boundingRectangle: { x1: 100, y1: 200, x2: 300, y2: 400 },
            fieldType: FormFieldDetection.SIGNATURE,
            fieldId: 'field-3',
            isDeleted: false,
          },
        ],
      };

      const result = createDetectedFieldPlaceholders(predictions);

      expect(result).toEqual([3]);
      expect(DetectedFieldPlaceholder).toHaveBeenCalledTimes(1);
      expect(mockAnnotationManager.addAnnotation).toHaveBeenCalledTimes(1);
      expect(mockAnnotationManager.redrawAnnotation).toHaveBeenCalledTimes(1);

      const createdAnnotation = (DetectedFieldPlaceholder as jest.Mock).mock.results[0]
        .value as MockDetectedFieldPlaceholder;
      expect(createdAnnotation.PageNumber).toBe(3);
      expect(createdAnnotation.X).toBe(100);
      expect(createdAnnotation.Y).toBe(200);
      expect(createdAnnotation.Width).toBe(200); // x2 - x1 = 300 - 100
      expect(createdAnnotation.Height).toBe(200); // y2 - y1 = 400 - 200
      expect(createdAnnotation.CustomFieldType).toBe(FormFieldDetection.SIGNATURE);
      expect(createdAnnotation.CustomFieldId).toBe('field-3');
    });
  });

  describe('when predictions contain multiple pages', () => {
    it('should process all pages and return all page numbers', () => {
      const predictions: IAutoDetectPredictionData['predictions'] = {
        1: [
          {
            boundingRectangle: { x1: 10, y1: 20, x2: 50, y2: 60 },
            fieldType: FormFieldDetection.TEXT_BOX,
            fieldId: 'field-1',
            isDeleted: false,
          },
        ],
        2: [
          {
            boundingRectangle: { x1: 5, y1: 15, x2: 25, y2: 35 },
            fieldType: FormFieldDetection.CHECK_BOX,
            fieldId: 'field-2',
            isDeleted: false,
          },
        ],
        3: [
          {
            boundingRectangle: { x1: 100, y1: 200, x2: 300, y2: 400 },
            fieldType: FormFieldDetection.SIGNATURE,
            fieldId: 'field-3',
            isDeleted: false,
          },
        ],
      };

      const result = createDetectedFieldPlaceholders(predictions);

      expect(result).toEqual([1, 2, 3]);
      expect(DetectedFieldPlaceholder).toHaveBeenCalledTimes(3);
      expect(mockAnnotationManager.addAnnotation).toHaveBeenCalledTimes(3);
      expect(mockAnnotationManager.redrawAnnotation).toHaveBeenCalledTimes(3);
    });
  });

  describe('when predictions contain multiple fields per page', () => {
    it('should process all fields on the same page', () => {
      const predictions: IAutoDetectPredictionData['predictions'] = {
        1: [
          {
            boundingRectangle: { x1: 10, y1: 20, x2: 50, y2: 60 },
            fieldType: FormFieldDetection.TEXT_BOX,
            fieldId: 'field-1',
            isDeleted: false,
          },
          {
            boundingRectangle: { x1: 70, y1: 80, x2: 150, y2: 160 },
            fieldType: FormFieldDetection.CHECK_BOX,
            fieldId: 'field-2',
            isDeleted: false,
          },
          {
            boundingRectangle: { x1: 200, y1: 250, x2: 400, y2: 500 },
            fieldType: FormFieldDetection.SIGNATURE,
            fieldId: 'field-3',
            isDeleted: false,
          },
        ],
      };

      const result = createDetectedFieldPlaceholders(predictions);

      expect(result).toEqual([1]);
      expect(DetectedFieldPlaceholder).toHaveBeenCalledTimes(3);
      expect(mockAnnotationManager.addAnnotation).toHaveBeenCalledTimes(3);
      expect(mockAnnotationManager.redrawAnnotation).toHaveBeenCalledTimes(3);
    });
  });

  describe('when predictions contain mixed valid and invalid fields', () => {
    it('should only process valid fields and skip invalid ones', () => {
      const predictions: IAutoDetectPredictionData['predictions'] = {
        1: [
          {
            boundingRectangle: { x1: 10, y1: 20, x2: 50, y2: 60 },
            fieldType: FormFieldDetection.TEXT_BOX,
            fieldId: 'field-1',
            isDeleted: false,
          },
          {
            boundingRectangle: { x1: 70, y1: 80, x2: 150, y2: 160 },
            fieldType: FormFieldDetection.RADIO_BOX, // Invalid type
            fieldId: 'field-2',
            isDeleted: false,
          },
          {
            boundingRectangle: { x1: 200, y1: 250, x2: 400, y2: 500 },
            fieldType: FormFieldDetection.CHECK_BOX,
            fieldId: 'field-3',
            isDeleted: true, // Deleted
          },
          {
            boundingRectangle: { x1: 500, y1: 600, x2: 700, y2: 800 },
            fieldType: FormFieldDetection.SIGNATURE,
            fieldId: 'field-4',
            isDeleted: false,
          },
        ],
      };

      const result = createDetectedFieldPlaceholders(predictions);

      expect(result).toEqual([1]);
      // Should only create 2 annotations (field-1 and field-4)
      expect(DetectedFieldPlaceholder).toHaveBeenCalledTimes(2);
      expect(mockAnnotationManager.addAnnotation).toHaveBeenCalledTimes(2);
      expect(mockAnnotationManager.redrawAnnotation).toHaveBeenCalledTimes(2);

      const firstAnnotation = (DetectedFieldPlaceholder as jest.Mock).mock.results[0]
        .value as MockDetectedFieldPlaceholder;
      expect(firstAnnotation.CustomFieldId).toBe('field-1');

      const secondAnnotation = (DetectedFieldPlaceholder as jest.Mock).mock.results[1]
        .value as MockDetectedFieldPlaceholder;
      expect(secondAnnotation.CustomFieldId).toBe('field-4');
    });
  });

  describe('edge cases', () => {
    it('should handle zero-width bounding rectangle', () => {
      const predictions: IAutoDetectPredictionData['predictions'] = {
        1: [
          {
            boundingRectangle: { x1: 10, y1: 20, x2: 10, y2: 20 },
            fieldType: FormFieldDetection.TEXT_BOX,
            fieldId: 'field-1',
            isDeleted: false,
          },
        ],
      };

      const result = createDetectedFieldPlaceholders(predictions);

      expect(result).toEqual([1]);
      expect(DetectedFieldPlaceholder).toHaveBeenCalledTimes(1);
      const createdAnnotation = (DetectedFieldPlaceholder as jest.Mock).mock.results[0]
        .value as MockDetectedFieldPlaceholder;
      expect(createdAnnotation.Width).toBe(0);
      expect(createdAnnotation.Height).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const predictions: IAutoDetectPredictionData['predictions'] = {
        1: [
          {
            boundingRectangle: { x1: -10, y1: -20, x2: 10, y2: 20 },
            fieldType: FormFieldDetection.TEXT_BOX,
            fieldId: 'field-1',
            isDeleted: false,
          },
        ],
      };

      const result = createDetectedFieldPlaceholders(predictions);

      expect(result).toEqual([1]);
      expect(DetectedFieldPlaceholder).toHaveBeenCalledTimes(1);
      const createdAnnotation = (DetectedFieldPlaceholder as jest.Mock).mock.results[0]
        .value as MockDetectedFieldPlaceholder;
      expect(createdAnnotation.X).toBe(-10);
      expect(createdAnnotation.Y).toBe(-20);
      expect(createdAnnotation.Width).toBe(20);
      expect(createdAnnotation.Height).toBe(40);
    });

    it('should handle page number as string key correctly', () => {
      const predictions: IAutoDetectPredictionData['predictions'] = {
        '5': [
          {
            boundingRectangle: { x1: 10, y1: 20, x2: 50, y2: 60 },
            fieldType: FormFieldDetection.TEXT_BOX,
            fieldId: 'field-1',
            isDeleted: false,
          },
        ],
      };

      const result = createDetectedFieldPlaceholders(predictions);

      expect(result).toEqual([5]);
      expect(DetectedFieldPlaceholder).toHaveBeenCalledTimes(1);
      const createdAnnotation = (DetectedFieldPlaceholder as jest.Mock).mock.results[0]
        .value as MockDetectedFieldPlaceholder;
      expect(createdAnnotation.PageNumber).toBe(5);
    });
  });

  describe('verification of AUTO_DETECT_ALLOW_FIELD_TYPES usage', () => {
    it('should only process field types that are in AUTO_DETECT_ALLOW_FIELD_TYPES', () => {
      // Verify that all allowed types are tested
      expect(AUTO_DETECT_ALLOW_FIELD_TYPES).toContain(FormFieldDetection.TEXT_BOX);
      expect(AUTO_DETECT_ALLOW_FIELD_TYPES).toContain(FormFieldDetection.CHECK_BOX);
      expect(AUTO_DETECT_ALLOW_FIELD_TYPES).toContain(FormFieldDetection.SIGNATURE);
      expect(AUTO_DETECT_ALLOW_FIELD_TYPES).not.toContain(FormFieldDetection.RADIO_BOX);
    });
  });
});
