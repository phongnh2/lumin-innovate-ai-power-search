import { renderHook, act } from '@testing-library/react';
import { useWindowEvent } from '@mantine/hooks';
import core from 'core';
import indexedDBService from 'services/indexedDBService';
import logger from 'helpers/logger';
import { handleAddAnnotation } from '../../utils/createAutoDetectAnnot';
import { FormFieldDetection } from '../../constants/detectionField.constant';
import { CUSTOM_DATA_AUTO_DETECTION } from 'constants/customDataConstant';
import { ANNOTATION_ACTION, AnnotationSubjectMapping } from 'constants/documentConstants';
import { LOGGER } from 'constants/lumin-common';
import { useAddAnnotationFromDetectedPlaceholder } from '../useAddAnnotationFromDetectedPlaceholder';
import DetectedFieldPlaceholder from 'helpers/CustomAnnotation/DetectedFieldPlaceholder';

const mockAnnotManager = {
  addAnnotation: jest.fn(),
  deleteAnnotations: jest.fn(),
  redrawAnnotation: jest.fn(),
  selectAnnotations: jest.fn(),
};

const mockGetDetectedFieldPlaceholderAnnotations = jest.fn();

jest.mock('@mantine/hooks', () => ({
  useWindowEvent: jest.fn(),
}));

jest.mock('core', () => ({
  __esModule: true,
  default: {
    getAnnotationManager: jest.fn(() => mockAnnotManager),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getDetectedFieldPlaceholderAnnotations: jest.fn(() => mockGetDetectedFieldPlaceholderAnnotations()),
  },
}));

jest.mock('services/indexedDBService', () => ({
  __esModule: true,
  default: {
    removeFieldsFromAutoDetectFormFields: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
  },
}));

jest.mock('../../utils/createAutoDetectAnnot', () => ({
  handleAddAnnotation: jest.fn(),
}));

describe('useAddAnnotationFromDetectedPlaceholder', () => {
  const mockPlaceholder = {
    X: 10,
    Y: 20,
    Width: 100,
    Height: 50,
    PageNumber: 1,
    CustomFieldId: 'field-123',
    CustomFieldType: FormFieldDetection.TEXT_BOX,
    CustomIsHoveringPlaceholder: true,
  } as DetectedFieldPlaceholder;

  const annotationRef = {
    current: mockPlaceholder,
  } as React.RefObject<DetectedFieldPlaceholder>;

  const setAnnotation = jest.fn();
  const documentId = 'doc-123';

  let clickHandler: (event: PointerEvent) => void | Promise<void>;
  let annotationChangedHandler: (
    annotations: Core.Annotations.Annotation[],
    action: any,
    objectInfo: any
  ) => void | Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDetectedFieldPlaceholderAnnotations.mockReturnValue([]);

    (useWindowEvent as jest.Mock).mockImplementation((eventName: string, handler: (event: PointerEvent) => void) => {
      if (eventName === 'click') {
        clickHandler = handler;
      }
    });

    (core.addEventListener as jest.Mock).mockImplementation((eventName: string, handler: any) => {
      if (eventName === 'annotationChanged') {
        annotationChangedHandler = handler;
      }
    });
  });

  describe('useWindowEvent click handler', () => {
    it('should create and add a new annotation when clicked with valid conditions', async () => {
      const mockNewAnnot = {
        setCustomData: jest.fn(),
        PageNumber: 0,
        X: 0,
        Y: 0,
        Width: 0,
        Height: 0,
      };

      (handleAddAnnotation as jest.Mock).mockResolvedValue({
        annotation: mockNewAnnot,
      });

      const mockEvent = {
        isTrusted: true,
      } as PointerEvent;

      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await clickHandler(mockEvent);
      });

      // Assert properties were copied
      expect(mockNewAnnot.X).toBe(mockPlaceholder.X);
      expect(mockNewAnnot.Y).toBe(mockPlaceholder.Y);
      expect(mockNewAnnot.Width).toBe(mockPlaceholder.Width);
      expect(mockNewAnnot.Height).toBe(mockPlaceholder.Height);
      expect(mockNewAnnot.PageNumber).toBe(mockPlaceholder.PageNumber);

      // Assert setCustomData was called
      expect(mockNewAnnot.setCustomData).toHaveBeenCalledWith(
        CUSTOM_DATA_AUTO_DETECTION.AUTO_DETECTION_ANNOTATION_ID.key,
        mockPlaceholder.CustomFieldId
      );

      // Assert manager calls
      expect(mockAnnotManager.addAnnotation).toHaveBeenCalledWith(mockNewAnnot, { autoFocus: true });
      expect(mockAnnotManager.deleteAnnotations).toHaveBeenCalledWith([mockPlaceholder]);
      expect(mockAnnotManager.redrawAnnotation).toHaveBeenCalledWith(mockNewAnnot);

      // Assert DB call
      expect(indexedDBService.removeFieldsFromAutoDetectFormFields).toHaveBeenCalledWith({
        documentId,
        deletedFields: [{ fieldId: mockPlaceholder.CustomFieldId, pageNumber: mockPlaceholder.PageNumber }],
      });

      // Assert setAnnotation was called with null
      expect(setAnnotation).toHaveBeenCalledWith(null);
    });

    it('should handle checkboxes specifically by selecting them', async () => {
      const checkboxPlaceholder = {
        ...mockPlaceholder,
        CustomFieldType: FormFieldDetection.CHECK_BOX,
      };
      const checkboxRef = { current: checkboxPlaceholder } as React.RefObject<DetectedFieldPlaceholder>;
      const mockNewAnnot = {
        setCustomData: jest.fn(),
        X: 0,
        Y: 0,
        Width: 0,
        Height: 0,
        PageNumber: 1,
      };

      (handleAddAnnotation as jest.Mock).mockResolvedValue({ annotation: mockNewAnnot });

      const mockEvent = {
        isTrusted: true,
      } as PointerEvent;

      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef: checkboxRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await clickHandler(mockEvent);
      });

      expect(mockAnnotManager.selectAnnotations).toHaveBeenCalledWith([mockNewAnnot]);
      expect(mockAnnotManager.redrawAnnotation).toHaveBeenCalledWith(mockNewAnnot);
    });

    it('should return early when event is not trusted', async () => {
      const mockEvent = {
        isTrusted: false,
      } as PointerEvent;

      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await clickHandler(mockEvent);
      });

      expect(handleAddAnnotation).not.toHaveBeenCalled();
      expect(mockAnnotManager.addAnnotation).not.toHaveBeenCalled();
    });

    it('should return early when annotationRef.current is null', async () => {
      const nullRef = { current: null } as React.RefObject<DetectedFieldPlaceholder>;
      const mockEvent = {
        isTrusted: true,
      } as PointerEvent;

      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef: nullRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await clickHandler(mockEvent);
      });

      expect(handleAddAnnotation).not.toHaveBeenCalled();
      expect(mockAnnotManager.addAnnotation).not.toHaveBeenCalled();
    });

    it('should return early when CustomIsHoveringPlaceholder is false', async () => {
      const notHoveringPlaceholder = {
        ...mockPlaceholder,
        CustomIsHoveringPlaceholder: false,
      };
      const notHoveringRef = { current: notHoveringPlaceholder } as React.RefObject<DetectedFieldPlaceholder>;
      const mockEvent = {
        isTrusted: true,
      } as PointerEvent;

      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef: notHoveringRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await clickHandler(mockEvent);
      });

      expect(handleAddAnnotation).not.toHaveBeenCalled();
      expect(mockAnnotManager.addAnnotation).not.toHaveBeenCalled();
    });

    it('should return early when handleAddAnnotation returns null annotation', async () => {
      (handleAddAnnotation as jest.Mock).mockResolvedValue({ annotation: null });

      const mockEvent = {
        isTrusted: true,
      } as PointerEvent;

      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await clickHandler(mockEvent);
      });

      expect(handleAddAnnotation).toHaveBeenCalledWith(mockPlaceholder);
      expect(mockAnnotManager.addAnnotation).not.toHaveBeenCalled();
    });

    it('should return early when handleAddAnnotation returns undefined annotation', async () => {
      (handleAddAnnotation as jest.Mock).mockResolvedValue({ annotation: undefined });

      const mockEvent = {
        isTrusted: true,
      } as PointerEvent;

      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await clickHandler(mockEvent);
      });

      expect(handleAddAnnotation).toHaveBeenCalled();
      expect(mockAnnotManager.addAnnotation).not.toHaveBeenCalled();
    });

    it('should not redraw annotation for non-TEXT_BOX and non-CHECK_BOX types', async () => {
      const signaturePlaceholder = {
        ...mockPlaceholder,
        CustomFieldType: FormFieldDetection.SIGNATURE,
      };
      const signatureRef = { current: signaturePlaceholder } as React.RefObject<DetectedFieldPlaceholder>;
      const mockNewAnnot = {
        setCustomData: jest.fn(),
        X: 0,
        Y: 0,
        Width: 0,
        Height: 0,
        PageNumber: 1,
      };

      (handleAddAnnotation as jest.Mock).mockResolvedValue({ annotation: mockNewAnnot });

      const mockEvent = {
        isTrusted: true,
      } as PointerEvent;

      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef: signatureRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await clickHandler(mockEvent);
      });

      expect(mockAnnotManager.redrawAnnotation).not.toHaveBeenCalled();
    });

    it('should handle errors and log them when click handler fails', async () => {
      const mockError = new Error('Test error');
      (handleAddAnnotation as jest.Mock).mockRejectedValue(mockError);

      const mockEvent = {
        isTrusted: true,
      } as PointerEvent;

      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await clickHandler(mockEvent);
      });

      expect(logger.logError).toHaveBeenCalledWith({
        reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
        message: 'Error in useAddAnnotationFromDetectedPlaceholder',
        error: mockError,
      });
    });
  });

  describe('useEffect annotationChanged handler', () => {
    it('should remove detected placeholder when signature annotation is added', async () => {
      const mockSignatureAnnotation = {
        Subject: AnnotationSubjectMapping.signature,
        PageNumber: 1,
        getCustomData: jest.fn((key: string) => {
          if (key === CUSTOM_DATA_AUTO_DETECTION.AUTO_DETECTION_ANNOTATION_ID.key) {
            return 'field-123';
          }
          return null;
        }),
      };

      const mockAssociatedPlaceholder = {
        CustomFieldId: 'field-123',
      } as DetectedFieldPlaceholder;

      mockGetDetectedFieldPlaceholderAnnotations.mockReturnValue([mockAssociatedPlaceholder]);

      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await annotationChangedHandler(
          [mockSignatureAnnotation as any],
          ANNOTATION_ACTION.ADD,
          { imported: false }
        );
      });

      expect(indexedDBService.removeFieldsFromAutoDetectFormFields).toHaveBeenCalledWith({
        documentId,
        deletedFields: [{ fieldId: 'field-123', pageNumber: 1 }],
      });

      expect(mockAnnotManager.deleteAnnotations).toHaveBeenCalledWith([mockAssociatedPlaceholder]);
    });

    it('should return early when annotations length is not 1', async () => {
      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await annotationChangedHandler([], ANNOTATION_ACTION.ADD, { imported: false });
      });

      expect(indexedDBService.removeFieldsFromAutoDetectFormFields).not.toHaveBeenCalled();
    });

    it('should return early when action is not ADD', async () => {
      const mockAnnotation = {
        Subject: AnnotationSubjectMapping.signature,
        PageNumber: 1,
        getCustomData: jest.fn(),
      };

      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await annotationChangedHandler([mockAnnotation as any], ANNOTATION_ACTION.MODIFY, { imported: false });
      });

      expect(indexedDBService.removeFieldsFromAutoDetectFormFields).not.toHaveBeenCalled();
    });

    it('should return early when Subject is not signature', async () => {
      const mockAnnotation = {
        Subject: 'Other',
        PageNumber: 1,
        getCustomData: jest.fn(),
      };

      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await annotationChangedHandler([mockAnnotation as any], ANNOTATION_ACTION.ADD, { imported: false });
      });

      expect(indexedDBService.removeFieldsFromAutoDetectFormFields).not.toHaveBeenCalled();
    });

    it('should return early when annotation is imported', async () => {
      const mockSignatureAnnotation = {
        Subject: AnnotationSubjectMapping.signature,
        PageNumber: 1,
        getCustomData: jest.fn(),
      };

      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await annotationChangedHandler([mockSignatureAnnotation as any], ANNOTATION_ACTION.ADD, { imported: true });
      });

      expect(indexedDBService.removeFieldsFromAutoDetectFormFields).not.toHaveBeenCalled();
    });

    it('should return early when autoDetectionAnnotationId is not found', async () => {
      const mockSignatureAnnotation = {
        Subject: AnnotationSubjectMapping.signature,
        PageNumber: 1,
        getCustomData: jest.fn(() => null),
      };

      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await annotationChangedHandler([mockSignatureAnnotation as any], ANNOTATION_ACTION.ADD, { imported: false });
      });

      expect(indexedDBService.removeFieldsFromAutoDetectFormFields).not.toHaveBeenCalled();
    });

    it('should handle errors and log them when annotationChanged handler fails', async () => {
      const mockError = new Error('Annotation changed error');
      const mockSignatureAnnotation = {
        Subject: AnnotationSubjectMapping.signature,
        PageNumber: 1,
        getCustomData: jest.fn(() => {
          throw mockError;
        }),
      };

      renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef,
          setAnnotation,
          documentId,
        })
      );

      await act(async () => {
        await annotationChangedHandler([mockSignatureAnnotation as any], ANNOTATION_ACTION.ADD, { imported: false });
      });

      expect(logger.logError).toHaveBeenCalledWith({
        reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
        message: 'Error when handle remove detected signature field',
        error: mockError,
      });
    });

    it('should setup and cleanup event listeners', () => {
      const { unmount } = renderHook(() =>
        useAddAnnotationFromDetectedPlaceholder({
          annotationRef,
          setAnnotation,
          documentId,
        })
      );

      expect(core.addEventListener).toHaveBeenCalledWith('annotationChanged', expect.any(Function));

      unmount();

      expect(core.removeEventListener).toHaveBeenCalledWith('annotationChanged', expect.any(Function));
    });
  });
});
