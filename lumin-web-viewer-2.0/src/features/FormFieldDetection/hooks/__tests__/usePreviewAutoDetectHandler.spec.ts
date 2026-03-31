import { renderHook, act } from '@testing-library/react';
import rafSchd from 'raf-schd';
import core from 'core';
import { useLatestRef } from 'hooks/useLatestRef';
import { useAddAnnotationFromDetectedPlaceholder } from '../useAddAnnotationFromDetectedPlaceholder';
import { usePreviewAutoDetectHandler } from '../usePreviewAutoDetectHandler';
import { CUSTOM_ANNOTATION } from 'constants/documentConstants';
import { CURSOR_TYPE_MAPPER, FormFieldDetection } from '../../constants/detectionField.constant';
import DetectedFieldPlaceholder from 'helpers/CustomAnnotation/DetectedFieldPlaceholder';

jest.mock('raf-schd', () => {
  return jest.fn((fn) => fn);
});

jest.mock('core', () => ({
  __esModule: true,
  default: {
    docViewer: {
      getViewerElement: jest.fn(),
    },
    getViewerElement: jest.fn(),
    getAnnotationManager: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
}));

// Mock useLatestRef to track state changes properly
jest.mock('hooks/useLatestRef', () => {
  const React = require('react');
  return {
    useLatestRef: jest.fn((val) => {
      const ref = React.useRef(val);
      React.useEffect(() => {
        ref.current = val;
      }, [val]);
      return ref;
    }),
  };
});

jest.mock('../useAddAnnotationFromDetectedPlaceholder', () => ({
  useAddAnnotationFromDetectedPlaceholder: jest.fn(),
}));

describe('usePreviewAutoDetectHandler', () => {
  const mockViewerElement = {
    style: { cursor: '' },
    contains: jest.fn(() => true),
  } as unknown as HTMLElement;

  const mockAnnotManager = {
    getAnnotationByMouseEvent: jest.fn(),
    redrawAnnotation: jest.fn(),
  };

  let mouseMoveHandler: (event: MouseEvent) => void;

  // Setup window.Core mock
  beforeAll(() => {
    (window as any).Core = {
      Annotations: {
        CustomAnnotation: class CustomAnnotation {},
      },
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockViewerElement.style.cursor = '';
    (core.docViewer.getViewerElement as jest.Mock).mockReturnValue(mockViewerElement);
    (core.getViewerElement as jest.Mock).mockReturnValue(mockViewerElement);
    (core.getAnnotationManager as jest.Mock).mockReturnValue(mockAnnotManager);
    (core.addEventListener as jest.Mock).mockImplementation((eventName: string, handler: any) => {
      if (eventName === 'mouseMove') {
        mouseMoveHandler = handler;
      }
    });
    (rafSchd as jest.Mock).mockImplementation((fn) => fn);
    (mockViewerElement.contains as jest.Mock).mockReturnValue(true);
  });

  describe('mouseMove event handler', () => {
    it('should set annotation when hovering over a detected field placeholder', () => {
      const mockPlaceholder = {
        Id: 'placeholder-1',
        CustomFieldId: 'field-1',
        CustomFieldType: FormFieldDetection.TEXT_BOX,
        CustomIsHoveringPlaceholder: false,
        Subject: CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.subject,
      } as DetectedFieldPlaceholder;

      // Make it an instance of CustomAnnotation
      Object.setPrototypeOf(mockPlaceholder, (window as any).Core.Annotations.CustomAnnotation.prototype);

      const mockMouseEvent = {
        target: document.createElement('div'),
      } as MouseEvent;

      (mockAnnotManager.getAnnotationByMouseEvent as jest.Mock).mockReturnValue(mockPlaceholder);

      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      expect(mockPlaceholder.CustomIsHoveringPlaceholder).toBe(true);
      expect(mockAnnotManager.redrawAnnotation).toHaveBeenCalledWith(mockPlaceholder);
    });

    it('should not set annotation when canUseAutoDetectFormFields is false', () => {
      const mockPlaceholder = {
        Id: 'placeholder-1',
        CustomFieldId: 'field-1',
        CustomFieldType: FormFieldDetection.TEXT_BOX,
        Subject: CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.subject,
      } as DetectedFieldPlaceholder;

      Object.setPrototypeOf(mockPlaceholder, (window as any).Core.Annotations.CustomAnnotation.prototype);

      const mockMouseEvent = {
        target: document.createElement('div'),
      } as MouseEvent;

      (mockAnnotManager.getAnnotationByMouseEvent as jest.Mock).mockReturnValue(mockPlaceholder);

      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: false,
          documentId: 'doc-123',
        })
      );

      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      expect(mockAnnotManager.redrawAnnotation).not.toHaveBeenCalled();
    });

    it('should clear annotation when no placeholder is detected', () => {
      const mockCurrentAnnotation = {
        Id: 'placeholder-1',
        CustomFieldId: 'field-1',
        CustomIsHoveringPlaceholder: true,
      } as DetectedFieldPlaceholder;

      const mockMouseEvent = {
        target: document.createElement('div'),
      } as MouseEvent;

      // First set an annotation by returning a placeholder, then return null
      let callCount = 0;
      (mockAnnotManager.getAnnotationByMouseEvent as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          const placeholder = {
            Id: 'placeholder-1',
            CustomFieldId: 'field-1',
            CustomFieldType: FormFieldDetection.TEXT_BOX,
            Subject: CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.subject,
          } as DetectedFieldPlaceholder;
          Object.setPrototypeOf(placeholder, (window as any).Core.Annotations.CustomAnnotation.prototype);
          return placeholder;
        }
        return null;
      });

      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      // First mouse move - sets annotation
      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      // Second mouse move - clears annotation
      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      expect(mockAnnotManager.redrawAnnotation).toHaveBeenCalled();
    });

    it('should clear annotation when annotation is not a CustomAnnotation', () => {
      const mockRegularAnnotation = {
        Id: 'regular-1',
      } as any;

      const mockMouseEvent = {
        target: document.createElement('div'),
      } as MouseEvent;

      (mockAnnotManager.getAnnotationByMouseEvent as jest.Mock).mockReturnValue(mockRegularAnnotation);

      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      // Should not redraw because annotation is not a CustomAnnotation
      expect(mockAnnotManager.redrawAnnotation).not.toHaveBeenCalled();
    });

    it('should clear annotation when annotation Subject is not DETECTED_FIELD_PLACEHOLDER', () => {
      const mockCustomAnnotation = {
        Id: 'custom-1',
        Subject: 'OtherSubject',
      } as any;

      Object.setPrototypeOf(mockCustomAnnotation, (window as any).Core.Annotations.CustomAnnotation.prototype);

      const mockMouseEvent = {
        target: document.createElement('div'),
      } as MouseEvent;

      (mockAnnotManager.getAnnotationByMouseEvent as jest.Mock).mockReturnValue(mockCustomAnnotation);

      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      expect(mockAnnotManager.redrawAnnotation).not.toHaveBeenCalled();
    });

    it('should clear annotation when target is not contained in viewElement', () => {
      const mockPlaceholder = {
        Id: 'placeholder-1',
        CustomFieldId: 'field-1',
        Subject: CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.subject,
      } as DetectedFieldPlaceholder;

      Object.setPrototypeOf(mockPlaceholder, (window as any).Core.Annotations.CustomAnnotation.prototype);

      const mockMouseEvent = {
        target: document.createElement('div'),
      } as MouseEvent;

      (mockAnnotManager.getAnnotationByMouseEvent as jest.Mock).mockReturnValue(mockPlaceholder);
      (mockViewerElement.contains as jest.Mock).mockReturnValue(false);

      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      expect(mockAnnotManager.redrawAnnotation).not.toHaveBeenCalled();
    });

    it('should update annotation when hovering over a different placeholder', () => {
      const mockCurrentPlaceholder = {
        Id: 'placeholder-1',
        CustomFieldId: 'field-1',
        CustomFieldType: FormFieldDetection.TEXT_BOX,
        CustomIsHoveringPlaceholder: true,
        Subject: CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.subject,
      } as DetectedFieldPlaceholder;

      const mockNewPlaceholder = {
        Id: 'placeholder-2',
        CustomFieldId: 'field-2',
        CustomFieldType: FormFieldDetection.TEXT_BOX,
        CustomIsHoveringPlaceholder: false,
        Subject: CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.subject,
      } as DetectedFieldPlaceholder;

      Object.setPrototypeOf(mockCurrentPlaceholder, (window as any).Core.Annotations.CustomAnnotation.prototype);
      Object.setPrototypeOf(mockNewPlaceholder, (window as any).Core.Annotations.CustomAnnotation.prototype);

      const mockMouseEvent = {
        target: document.createElement('div'),
      } as MouseEvent;

      // First return current placeholder, then new placeholder
      let callCount = 0;
      (mockAnnotManager.getAnnotationByMouseEvent as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return mockCurrentPlaceholder;
        }
        return mockNewPlaceholder;
      });

      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      // First mouse move - sets current annotation
      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      // Second mouse move - switches to new annotation
      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      expect(mockCurrentPlaceholder.CustomIsHoveringPlaceholder).toBe(false);
      expect(mockNewPlaceholder.CustomIsHoveringPlaceholder).toBe(true);
      expect(mockAnnotManager.redrawAnnotation).toHaveBeenCalled();
    });

    it('should not update annotation when hovering over the same placeholder', () => {
      const mockPlaceholder = {
        Id: 'placeholder-1',
        CustomFieldId: 'field-1',
        CustomFieldType: FormFieldDetection.TEXT_BOX,
        CustomIsHoveringPlaceholder: false,
        Subject: CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.subject,
      } as DetectedFieldPlaceholder;

      Object.setPrototypeOf(mockPlaceholder, (window as any).Core.Annotations.CustomAnnotation.prototype);

      const mockMouseEvent = {
        target: document.createElement('div'),
      } as MouseEvent;

      (mockAnnotManager.getAnnotationByMouseEvent as jest.Mock).mockReturnValue(mockPlaceholder);

      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      // First mouse move - sets annotation
      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      const firstRedrawCount = mockAnnotManager.redrawAnnotation.mock.calls.length;

      // Second mouse move - same annotation, should not update
      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      // Should not have additional redraw calls since it's the same annotation
      expect(mockAnnotManager.redrawAnnotation.mock.calls.length).toBe(firstRedrawCount);
    });

    it('should use rafSchd to throttle mouseMove handler', () => {
      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      expect(rafSchd).toHaveBeenCalled();
      expect(core.addEventListener).toHaveBeenCalledWith('mouseMove', expect.any(Function));
    });

    it('should cleanup event listener on unmount', () => {
      const { unmount } = renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      unmount();

      expect(core.removeEventListener).toHaveBeenCalledWith('mouseMove', expect.any(Function));
    });
  });

  describe('cursor change effect', () => {
    it('should set cursor to default when annotation is null', () => {
      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      expect(mockViewerElement.style.cursor).toBe('default');
    });

    it('should set cursor based on annotation field type for TEXT_BOX', () => {
      const mockPlaceholder = {
        Id: 'placeholder-1',
        CustomFieldId: 'field-1',
        CustomFieldType: FormFieldDetection.TEXT_BOX,
        Subject: CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.subject,
      } as DetectedFieldPlaceholder;

      Object.setPrototypeOf(mockPlaceholder, (window as any).Core.Annotations.CustomAnnotation.prototype);

      const mockMouseEvent = {
        target: document.createElement('div'),
      } as MouseEvent;

      (mockAnnotManager.getAnnotationByMouseEvent as jest.Mock).mockReturnValue(mockPlaceholder);

      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      expect(mockViewerElement.style.cursor).toBe(CURSOR_TYPE_MAPPER[FormFieldDetection.TEXT_BOX]);
    });

    it('should set cursor based on annotation field type for CHECK_BOX', () => {
      const mockPlaceholder = {
        Id: 'placeholder-1',
        CustomFieldId: 'field-1',
        CustomFieldType: FormFieldDetection.CHECK_BOX,
        Subject: CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.subject,
      } as DetectedFieldPlaceholder;

      Object.setPrototypeOf(mockPlaceholder, (window as any).Core.Annotations.CustomAnnotation.prototype);

      const mockMouseEvent = {
        target: document.createElement('div'),
      } as MouseEvent;

      (mockAnnotManager.getAnnotationByMouseEvent as jest.Mock).mockReturnValue(mockPlaceholder);

      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      expect(mockViewerElement.style.cursor).toBe(CURSOR_TYPE_MAPPER[FormFieldDetection.CHECK_BOX]);
    });

    it('should set cursor based on annotation field type for SIGNATURE', () => {
      const mockPlaceholder = {
        Id: 'placeholder-1',
        CustomFieldId: 'field-1',
        CustomFieldType: FormFieldDetection.SIGNATURE,
        Subject: CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.subject,
      } as DetectedFieldPlaceholder;

      Object.setPrototypeOf(mockPlaceholder, (window as any).Core.Annotations.CustomAnnotation.prototype);

      const mockMouseEvent = {
        target: document.createElement('div'),
      } as MouseEvent;

      (mockAnnotManager.getAnnotationByMouseEvent as jest.Mock).mockReturnValue(mockPlaceholder);

      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      expect(mockViewerElement.style.cursor).toBe(CURSOR_TYPE_MAPPER[FormFieldDetection.SIGNATURE]);
    });

    it('should not change cursor when canUseAutoDetectFormFields is false', () => {
      const mockPlaceholder = {
        Id: 'placeholder-1',
        CustomFieldId: 'field-1',
        CustomFieldType: FormFieldDetection.TEXT_BOX,
        Subject: CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.subject,
      } as DetectedFieldPlaceholder;

      Object.setPrototypeOf(mockPlaceholder, (window as any).Core.Annotations.CustomAnnotation.prototype);

      const mockMouseEvent = {
        target: document.createElement('div'),
      } as MouseEvent;

      (mockAnnotManager.getAnnotationByMouseEvent as jest.Mock).mockReturnValue(mockPlaceholder);

      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: false,
          documentId: 'doc-123',
        })
      );

      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      // Cursor should remain default
      expect(mockViewerElement.style.cursor).toBe('default');
    });

    it('should not change cursor when viewerElement is null', () => {
      (core.docViewer.getViewerElement as jest.Mock).mockReturnValue(null);

      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      // Should not throw error
      expect(core.docViewer.getViewerElement).toHaveBeenCalled();
    });

    it('should not change cursor when cursorType is not found in mapper', () => {
      const mockPlaceholder = {
        Id: 'placeholder-1',
        CustomFieldId: 'field-1',
        CustomFieldType: 'unknown_type',
        Subject: CUSTOM_ANNOTATION.DETECTED_FIELD_PLACEHOLDER.subject,
      } as DetectedFieldPlaceholder;

      Object.setPrototypeOf(mockPlaceholder, (window as any).Core.Annotations.CustomAnnotation.prototype);

      const mockMouseEvent = {
        target: document.createElement('div'),
      } as MouseEvent;

      (mockAnnotManager.getAnnotationByMouseEvent as jest.Mock).mockReturnValue(mockPlaceholder);

      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      act(() => {
        mouseMoveHandler(mockMouseEvent);
      });

      // Cursor should remain default when type is not found
      expect(mockViewerElement.style.cursor).toBe('default');
    });
  });

  describe('useAddAnnotationFromDetectedPlaceholder integration', () => {
    it('should call useAddAnnotationFromDetectedPlaceholder with correct parameters', () => {
      renderHook(() =>
        usePreviewAutoDetectHandler({
          canUseAutoDetectFormFields: true,
          documentId: 'doc-123',
        })
      );

      expect(useAddAnnotationFromDetectedPlaceholder).toHaveBeenCalledWith({
        annotationRef: expect.any(Object),
        setAnnotation: expect.any(Function),
        documentId: 'doc-123',
      });
    });
  });
});
