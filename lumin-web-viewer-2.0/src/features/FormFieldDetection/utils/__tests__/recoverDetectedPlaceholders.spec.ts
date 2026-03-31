import indexedDBService from 'services/indexedDBService';

import { CUSTOM_DATA_AUTO_DETECTION } from 'constants/customDataConstant';
import { AnnotationSubjectMapping } from 'constants/documentConstants';

import { createDetectedFieldPlaceholders } from '../createDetectedFieldPlaceholders';
import { recoverDetectedPlaceholders } from '../recoverDetectedPlaceholders';

jest.mock('services/indexedDBService');
jest.mock('../createDetectedFieldPlaceholders', () => ({
  createDetectedFieldPlaceholders: jest.fn(),
}));

// Mock window.Core to prevent errors from DetectedFieldPlaceholder import
beforeAll(() => {
  global.window = Object.create(window);
  global.window.Core = {
    Annotations: {
      CustomAnnotation: class MockCustomAnnotation {},
    },
  } as any;
});

describe('recoverDetectedPlaceholders', () => {
  const mockDocumentId = 'test-document-id';

  const createMockAnnotation = (
    subject: string,
    pageNumber: number,
    autoDetectionAnnotationId?: string
  ): Core.Annotations.Annotation & { setCustomData: jest.Mock } => {
    const mockSetCustomData = jest.fn();
    const annotation = {
      Subject: subject,
      PageNumber: pageNumber,
      getCustomData: jest.fn((key: string) => {
        if (key === CUSTOM_DATA_AUTO_DETECTION.AUTO_DETECTION_ANNOTATION_ID.key) {
          return autoDetectionAnnotationId;
        }
        return undefined;
      }),
      setCustomData: mockSetCustomData,
    } as unknown as Core.Annotations.Annotation & { setCustomData: jest.Mock };

    return annotation;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when annotations array is empty', () => {
    it('should return early without calling indexedDBService', async () => {
      await recoverDetectedPlaceholders({
        annotations: [],
        documentId: mockDocumentId,
      });

      expect(indexedDBService.recoverDetectedPlaceholders).not.toHaveBeenCalled();
      expect(createDetectedFieldPlaceholders).not.toHaveBeenCalled();
    });
  });

  describe('when annotations do not match allowed subjects', () => {
    it('should return early when annotations have different subjects', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.highlight, 1),
        createMockAnnotation(AnnotationSubjectMapping.rectangle, 2),
        createMockAnnotation(AnnotationSubjectMapping.stickyNote, 3),
      ];

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
      });

      expect(indexedDBService.recoverDetectedPlaceholders).not.toHaveBeenCalled();
      expect(createDetectedFieldPlaceholders).not.toHaveBeenCalled();
    });
  });

  describe('when annotations match allowed subjects but have no autoDetectionAnnotationId', () => {
    it('should return early when signature annotation has no autoDetectionAnnotationId', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.signature, 1),
      ];

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
      });

      expect(indexedDBService.recoverDetectedPlaceholders).not.toHaveBeenCalled();
      expect(createDetectedFieldPlaceholders).not.toHaveBeenCalled();
    });

    it('should return early when freetext annotation has no autoDetectionAnnotationId', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.freetext, 1),
      ];

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
      });

      expect(indexedDBService.recoverDetectedPlaceholders).not.toHaveBeenCalled();
      expect(createDetectedFieldPlaceholders).not.toHaveBeenCalled();
    });

    it('should return early when tickStamp annotation has no autoDetectionAnnotationId', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.tickStamp, 1),
      ];

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
      });

      expect(indexedDBService.recoverDetectedPlaceholders).not.toHaveBeenCalled();
      expect(createDetectedFieldPlaceholders).not.toHaveBeenCalled();
    });
  });

  describe('when shouldAddDetectedPlaceholder is false (default)', () => {
    it('should set custom data to empty string for signature annotation', async () => {
      const annotation = createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'annotation-id-1');
      const annotations = [annotation];

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: {},
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
        shouldAddDetectedPlaceholder: false,
      });

      expect(annotation.setCustomData).toHaveBeenCalledWith(
        CUSTOM_DATA_AUTO_DETECTION.AUTO_DETECTION_ANNOTATION_ID.key,
        ''
      );
    });

    it('should set custom data to empty string for freetext annotation', async () => {
      const annotation = createMockAnnotation(AnnotationSubjectMapping.freetext, 1, 'annotation-id-1');
      const annotations = [annotation];

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: {},
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
        shouldAddDetectedPlaceholder: false,
      });

      expect(annotation.setCustomData).toHaveBeenCalledWith(
        CUSTOM_DATA_AUTO_DETECTION.AUTO_DETECTION_ANNOTATION_ID.key,
        ''
      );
    });

    it('should set custom data to empty string for tickStamp annotation', async () => {
      const annotation = createMockAnnotation(AnnotationSubjectMapping.tickStamp, 1, 'annotation-id-1');
      const annotations = [annotation];

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: {},
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
        shouldAddDetectedPlaceholder: false,
      });

      expect(annotation.setCustomData).toHaveBeenCalledWith(
        CUSTOM_DATA_AUTO_DETECTION.AUTO_DETECTION_ANNOTATION_ID.key,
        ''
      );
    });

    it('should not set custom data when shouldAddDetectedPlaceholder is true', async () => {
      const annotation = createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'annotation-id-1');
      const annotations = [annotation];

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: {},
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
        shouldAddDetectedPlaceholder: true,
      });

      expect(annotation.setCustomData).not.toHaveBeenCalled();
    });
  });

  describe('when recoverableDetectedPlaceholders map is populated', () => {
    it('should call indexedDBService.recoverDetectedPlaceholders with correct parameters', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'annotation-id-1'),
      ];

      const expectedMap = new Map([[1, ['annotation-id-1']]]);

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: {},
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
      });

      expect(indexedDBService.recoverDetectedPlaceholders).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        recoverableDetectedPlaceholders: expectedMap,
        shouldAddDetectedPlaceholder: false,
      });
    });

    it('should handle multiple annotations on the same page', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'annotation-id-1'),
        createMockAnnotation(AnnotationSubjectMapping.freetext, 1, 'annotation-id-2'),
        createMockAnnotation(AnnotationSubjectMapping.tickStamp, 1, 'annotation-id-3'),
      ];

      const expectedMap = new Map([[1, ['annotation-id-1', 'annotation-id-2', 'annotation-id-3']]]);

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: {},
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
      });

      expect(indexedDBService.recoverDetectedPlaceholders).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        recoverableDetectedPlaceholders: expectedMap,
        shouldAddDetectedPlaceholder: false,
      });
    });

    it('should handle annotations on different pages', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'annotation-id-1'),
        createMockAnnotation(AnnotationSubjectMapping.freetext, 2, 'annotation-id-2'),
        createMockAnnotation(AnnotationSubjectMapping.tickStamp, 3, 'annotation-id-3'),
      ];

      const expectedMap = new Map([
        [1, ['annotation-id-1']],
        [2, ['annotation-id-2']],
        [3, ['annotation-id-3']],
      ]);

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: {},
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
      });

      expect(indexedDBService.recoverDetectedPlaceholders).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        recoverableDetectedPlaceholders: expectedMap,
        shouldAddDetectedPlaceholder: false,
      });
    });

    it('should handle mixed annotations (allowed and not allowed)', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.highlight, 1), // Not allowed
        createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'annotation-id-1'), // Allowed
        createMockAnnotation(AnnotationSubjectMapping.rectangle, 2), // Not allowed
        createMockAnnotation(AnnotationSubjectMapping.freetext, 2, 'annotation-id-2'), // Allowed
      ];

      const expectedMap = new Map([
        [1, ['annotation-id-1']],
        [2, ['annotation-id-2']],
      ]);

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: {},
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
      });

      expect(indexedDBService.recoverDetectedPlaceholders).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        recoverableDetectedPlaceholders: expectedMap,
        shouldAddDetectedPlaceholder: false,
      });
    });
  });

  describe('when indexedDBService returns no predictions', () => {
    it('should return early when predictions is null', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'annotation-id-1'),
      ];

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: null,
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
      });

      expect(createDetectedFieldPlaceholders).not.toHaveBeenCalled();
    });

    it('should return early when predictions is undefined', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'annotation-id-1'),
      ];

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: undefined,
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
      });

      expect(createDetectedFieldPlaceholders).not.toHaveBeenCalled();
    });

    it('should return early when predictions is false', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'annotation-id-1'),
      ];

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: false as any,
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
      });

      expect(createDetectedFieldPlaceholders).not.toHaveBeenCalled();
    });
  });

  describe('when shouldAddDetectedPlaceholder is true and predictions exist', () => {
    it('should call createDetectedFieldPlaceholders when predictions object has keys', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'annotation-id-1'),
      ];

      const mockPredictions = {
        1: [
          {
            boundingRectangle: { x1: 10, y1: 20, x2: 50, y2: 60 },
            fieldType: 'text',
            fieldId: 'field-1',
          },
        ],
      };

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: mockPredictions,
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
        shouldAddDetectedPlaceholder: true,
      });

      expect(createDetectedFieldPlaceholders).toHaveBeenCalledWith(mockPredictions);
    });

    it('should not call createDetectedFieldPlaceholders when predictions object is empty', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'annotation-id-1'),
      ];

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: {},
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
        shouldAddDetectedPlaceholder: true,
      });

      expect(createDetectedFieldPlaceholders).not.toHaveBeenCalled();
    });

    it('should not call createDetectedFieldPlaceholders when shouldAddDetectedPlaceholder is false', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'annotation-id-1'),
      ];

      const mockPredictions = {
        1: [
          {
            boundingRectangle: { x1: 10, y1: 20, x2: 50, y2: 60 },
            fieldType: 'text',
            fieldId: 'field-1',
          },
        ],
      };

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: mockPredictions,
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
        shouldAddDetectedPlaceholder: false,
      });

      expect(createDetectedFieldPlaceholders).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle annotation with empty string autoDetectionAnnotationId', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.signature, 1, ''),
      ];

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
      });

      expect(indexedDBService.recoverDetectedPlaceholders).not.toHaveBeenCalled();
    });

    it('should handle annotation with zero page number', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.signature, 0, 'annotation-id-1'),
      ];

      const expectedMap = new Map([[0, ['annotation-id-1']]]);

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: {},
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
      });

      expect(indexedDBService.recoverDetectedPlaceholders).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        recoverableDetectedPlaceholders: expectedMap,
        shouldAddDetectedPlaceholder: false,
      });
    });

    it('should handle multiple annotations with same autoDetectionAnnotationId on same page', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'same-id'),
        createMockAnnotation(AnnotationSubjectMapping.freetext, 1, 'same-id'),
      ];

      const expectedMap = new Map([[1, ['same-id', 'same-id']]]);

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: {},
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
      });

      expect(indexedDBService.recoverDetectedPlaceholders).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        recoverableDetectedPlaceholders: expectedMap,
        shouldAddDetectedPlaceholder: false,
      });
    });

    it('should handle shouldAddDetectedPlaceholder parameter correctly when not provided', async () => {
      const annotations = [
        createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'annotation-id-1'),
      ];

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: {},
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
        // shouldAddDetectedPlaceholder not provided, should default to false
      });

      expect(indexedDBService.recoverDetectedPlaceholders).toHaveBeenCalledWith({
        documentId: mockDocumentId,
        recoverableDetectedPlaceholders: expect.any(Map),
        shouldAddDetectedPlaceholder: false,
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete flow: annotations -> indexedDB -> createDetectedFieldPlaceholders', async () => {
      const annotation1 = createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'annotation-id-1');
      const annotation2 = createMockAnnotation(AnnotationSubjectMapping.freetext, 2, 'annotation-id-2');
      const annotations = [annotation1, annotation2];

      const mockPredictions = {
        1: [
          {
            boundingRectangle: { x1: 10, y1: 20, x2: 50, y2: 60 },
            fieldType: 'text',
            fieldId: 'field-1',
          },
        ],
        2: [
          {
            boundingRectangle: { x1: 5, y1: 15, x2: 25, y2: 35 },
            fieldType: 'checkbox',
            fieldId: 'field-2',
          },
        ],
      };

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: mockPredictions,
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
        shouldAddDetectedPlaceholder: true,
      });

      expect(annotation1.setCustomData).not.toHaveBeenCalled();
      expect(annotation2.setCustomData).not.toHaveBeenCalled();
      expect(indexedDBService.recoverDetectedPlaceholders).toHaveBeenCalledTimes(1);
      expect(createDetectedFieldPlaceholders).toHaveBeenCalledWith(mockPredictions);
    });

    it('should handle scenario where indexedDB returns predictions but shouldAddDetectedPlaceholder is false', async () => {
      const annotation = createMockAnnotation(AnnotationSubjectMapping.signature, 1, 'annotation-id-1');
      const annotations = [annotation];

      const mockPredictions = {
        1: [
          {
            boundingRectangle: { x1: 10, y1: 20, x2: 50, y2: 60 },
            fieldType: 'text',
            fieldId: 'field-1',
          },
        ],
      };

      (indexedDBService.recoverDetectedPlaceholders as jest.Mock).mockResolvedValue({
        predictions: mockPredictions,
      });

      await recoverDetectedPlaceholders({
        annotations,
        documentId: mockDocumentId,
        shouldAddDetectedPlaceholder: false,
      });

      expect(annotation.setCustomData).toHaveBeenCalledTimes(1);
      expect(indexedDBService.recoverDetectedPlaceholders).toHaveBeenCalledTimes(1);
      expect(createDetectedFieldPlaceholders).not.toHaveBeenCalled();
    });
  });
});
