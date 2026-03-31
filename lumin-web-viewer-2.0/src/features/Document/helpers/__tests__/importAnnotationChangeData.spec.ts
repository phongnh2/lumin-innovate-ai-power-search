import core from 'core';
import getRichTextCSSStyle from 'helpers/getRichTextCSSStyle';
import { CUSTOM_DATA_REORDER_ANNOTATION, CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import { processImportedAnnotation, processImportedAnnotations } from '../importAnnotationChangeData';

jest.mock('core', () => ({
  getAnnotationManager: jest.fn(),
  getTotalPages: jest.fn(),
}));

jest.mock('helpers/getRichTextCSSStyle', () => jest.fn());

describe('importAnnotationChangeData', () => {
  let mockAnnotManager: any;
  let mockFieldManager: any;

  beforeAll(() => {
    // Setup window.Core mock
    global.window.Core = {
      Annotations: {
        WidgetFlags: {
          READ_ONLY: 'READ_ONLY',
        },
        FreeTextAnnotation: class MockFreeTextAnnotation {},
        EllipseAnnotation: class MockEllipseAnnotation {},
        StampAnnotation: class MockStampAnnotation {},
        SignatureWidgetAnnotation: class MockSignatureWidgetAnnotation {},
        WidgetAnnotation: class MockWidgetAnnotation {},
        Forms: {
          Field: class MockField {},
        },
      },
    } as any;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockFieldManager = {
      getField: jest.fn(),
    };

    mockAnnotManager = {
      getAnnotationById: jest.fn(),
      getFieldManager: jest.fn().mockReturnValue(mockFieldManager),
      bringToBack: jest.fn(),
      bringToFront: jest.fn(),
    };

    (core.getAnnotationManager as jest.Mock).mockReturnValue(mockAnnotManager);
    (core.getTotalPages as jest.Mock).mockReturnValue(10);
  });

  const createMockAnnotation = (Type: any, props: any = {}) => {
    const annotation = new Type();
    Object.assign(annotation, {
      Id: 'annot-1',
      PageNumber: 1,
      getCustomData: jest.fn(),
      setCustomData: jest.fn(),
      getRect: jest.fn().mockReturnValue({ intersects: jest.fn().mockReturnValue(false) }),
      getContents: jest.fn().mockReturnValue(''),
      getRichTextStyle: jest.fn().mockReturnValue(null),
      setRichTextStyle: jest.fn(),
      disableRotationControl: jest.fn(),
      ...props,
    });
    return annotation;
  };

  describe('handleWidgetAssociation', () => {
    it('should associate widget when WIDGET_ID custom data exists', () => {
      const annotation = createMockAnnotation(window.Core.Annotations.StampAnnotation, {
        Id: 'sig-1',
      });
      const widgetId = 'widget-1';
      const fieldName = 'Signature1';

      (annotation.getCustomData as jest.Mock).mockImplementation((key) => {
        if (key === CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key) return widgetId;
        return null;
      });

      const mockField = {
        name: fieldName,
        flags: {
          get: jest.fn().mockReturnValue(false),
          set: jest.fn(),
        },
      };

      const mockWidget = createMockAnnotation(window.Core.Annotations.SignatureWidgetAnnotation, {
        Id: widgetId,
        getField: jest.fn().mockReturnValue(mockField),
        setAssociatedSignatureAnnotation: jest.fn(),
        styledInnerElement: jest.fn(),
      });

      mockAnnotManager.getAnnotationById.mockImplementation((id: string) => {
        if (id === 'sig-1') return annotation;
        if (id === widgetId) return mockWidget;
        return null;
      });

      processImportedAnnotation({ annotation, pageWillBeDeleted: -1 });

      expect(mockAnnotManager.getAnnotationById).toHaveBeenCalledWith(widgetId);
      expect(mockWidget.setAssociatedSignatureAnnotation).toHaveBeenCalledWith(annotation);
      expect(mockWidget.styledInnerElement).toHaveBeenCalled();
      expect(annotation.setCustomData).toHaveBeenCalledWith(CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.key, fieldName);
    });

    it('should handle read-only flag when associating widget', () => {
      const annotation = createMockAnnotation(window.Core.Annotations.StampAnnotation, { Id: 'sig-1' });
      const widgetId = 'widget-1';

      (annotation.getCustomData as jest.Mock).mockImplementation((key) => {
        if (key === CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key) return widgetId;
        return null;
      });

      const mockField = {
        name: 'Sig1',
        flags: {
          get: jest.fn().mockReturnValue(true), // Is ReadOnly
          set: jest.fn(),
        },
      };

      const mockWidget = createMockAnnotation(window.Core.Annotations.SignatureWidgetAnnotation, {
        Id: widgetId,
        getField: jest.fn().mockReturnValue(mockField),
        setAssociatedSignatureAnnotation: jest.fn(),
        styledInnerElement: jest.fn(),
      });

      mockAnnotManager.getAnnotationById.mockReturnValueOnce(annotation).mockReturnValueOnce(mockWidget);

      processImportedAnnotation({ annotation, pageWillBeDeleted: -1 });

      // Should toggle read-only off then on
      expect(mockField.flags.set).toHaveBeenCalledWith(window.Core.Annotations.WidgetFlags.READ_ONLY, false);
      expect(mockField.flags.set).toHaveBeenCalledWith(window.Core.Annotations.WidgetFlags.READ_ONLY, true);
    });

    it('should find associated widget by field name and intersection if WIDGET_ID is missing', () => {
      const annotation = createMockAnnotation(window.Core.Annotations.StampAnnotation, {
        Id: 'sig-1',
        PageNumber: 1,
      });
      const fieldName = 'Signature1';
      const widgetId = 'widget-1';

      (annotation.getCustomData as jest.Mock).mockImplementation((key) => {
        if (key === CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.key) return fieldName;
        return null;
      });

      const mockRect = { intersects: jest.fn().mockReturnValue(true) };
      (annotation.getRect as jest.Mock).mockReturnValue(mockRect);

      const mockWidget = createMockAnnotation(window.Core.Annotations.SignatureWidgetAnnotation, {
        Id: widgetId,
        PageNumber: 1,
        getRect: jest.fn().mockReturnValue({ intersects: jest.fn().mockReturnValue(true) }),
        getField: jest.fn(),
        setAssociatedSignatureAnnotation: jest.fn(),
        styledInnerElement: jest.fn(),
      });

      const mockField = {
        name: fieldName,
        widgets: [mockWidget],
        flags: { get: jest.fn(), set: jest.fn() },
      };
      mockWidget.getField.mockReturnValue(mockField);
      mockFieldManager.getField.mockReturnValue(mockField);

      processImportedAnnotation({ annotation, pageWillBeDeleted: -1 });

      expect(mockFieldManager.getField).toHaveBeenCalledWith(fieldName);
      expect(annotation.setCustomData).toHaveBeenCalledWith(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key, widgetId);
      expect(mockWidget.setAssociatedSignatureAnnotation).toHaveBeenCalledWith(annotation);
    });

    it('should do nothing if field name exists but no matching widget found', () => {
      const annotation = createMockAnnotation(window.Core.Annotations.StampAnnotation);
      (annotation.getCustomData as jest.Mock).mockImplementation((key) => {
        if (key === CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key) return null;
        if (key === CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.key) return 'SomeField';
        return null;
      });

      mockFieldManager.getField.mockReturnValue({ widgets: [] });

      processImportedAnnotation({ annotation, pageWillBeDeleted: -1 });

      expect(annotation.setCustomData).not.toHaveBeenCalled();
    });
  });

  describe('adjustPageNumberForDeletedPage', () => {
    it('should decrement page number if page is after deleted page', () => {
      const annotation = createMockAnnotation(window.Core.Annotations.StampAnnotation, {
        PageNumber: 5,
      });

      processImportedAnnotation({ annotation, pageWillBeDeleted: 3 });

      expect(annotation.PageNumber).toBe(4);
    });

    it('should not change page number if page is before deleted page', () => {
      const annotation = createMockAnnotation(window.Core.Annotations.StampAnnotation, {
        PageNumber: 2,
      });

      processImportedAnnotation({ annotation, pageWillBeDeleted: 3 });

      expect(annotation.PageNumber).toBe(2);
    });

    it('should not change page number if pageWillBeDeleted is -1', () => {
      const annotation = createMockAnnotation(window.Core.Annotations.StampAnnotation, {
        PageNumber: 5,
      });

      processImportedAnnotation({ annotation, pageWillBeDeleted: -1 });

      expect(annotation.PageNumber).toBe(5);
    });
  });

  describe('handleReorderType', () => {
    it('should bring to back when reorder type is "back"', () => {
      const annotation = createMockAnnotation(window.Core.Annotations.StampAnnotation);
      (annotation.getCustomData as jest.Mock).mockImplementation((key) => {
        if (key === CUSTOM_DATA_REORDER_ANNOTATION.REORDER_TYPE.key) {
          return CUSTOM_DATA_REORDER_ANNOTATION.REORDER_TYPE.back;
        }
      });

      processImportedAnnotation({ annotation, pageWillBeDeleted: -1 });

      expect(mockAnnotManager.bringToBack).toHaveBeenCalledWith(annotation);
      expect(annotation.setCustomData).toHaveBeenCalledWith(CUSTOM_DATA_REORDER_ANNOTATION.REORDER_TYPE.key, '');
    });

    it('should bring to front when reorder type is "front" (or any other value)', () => {
      const annotation = createMockAnnotation(window.Core.Annotations.StampAnnotation);
      (annotation.getCustomData as jest.Mock).mockImplementation((key) => {
        if (key === CUSTOM_DATA_REORDER_ANNOTATION.REORDER_TYPE.key) {
          return CUSTOM_DATA_REORDER_ANNOTATION.REORDER_TYPE.front;
        }
      });

      processImportedAnnotation({ annotation, pageWillBeDeleted: -1 });

      expect(mockAnnotManager.bringToFront).toHaveBeenCalledWith(annotation);
      expect(annotation.setCustomData).toHaveBeenCalledWith(CUSTOM_DATA_REORDER_ANNOTATION.REORDER_TYPE.key, '');
    });

    it('should do nothing if reorder type is missing', () => {
      const annotation = createMockAnnotation(window.Core.Annotations.StampAnnotation);
      (annotation.getCustomData as jest.Mock).mockReturnValue(null);

      processImportedAnnotation({ annotation, pageWillBeDeleted: -1 });

      expect(mockAnnotManager.bringToBack).not.toHaveBeenCalled();
      expect(mockAnnotManager.bringToFront).not.toHaveBeenCalled();
    });
  });

  describe('handleFreeTextStyling', () => {
    it('should set rich text style for FreeTextAnnotation if style available', () => {
      const annotation = createMockAnnotation(window.Core.Annotations.FreeTextAnnotation);
      const mockRichTextStyle = 'color: red;';

      annotation.getRichTextStyle.mockReturnValue([{ some: 'style' }]);
      annotation.getContents.mockReturnValue('text');
      (getRichTextCSSStyle as jest.Mock).mockReturnValue(mockRichTextStyle);

      processImportedAnnotation({ annotation, pageWillBeDeleted: -1 });

      expect(annotation.setRichTextStyle).toHaveBeenCalledWith(mockRichTextStyle);
      expect(annotation.IsModified).toBe(false);
    });

    it('should not set rich text style for non-FreeTextAnnotation', () => {
      const annotation = createMockAnnotation(window.Core.Annotations.StampAnnotation);

      processImportedAnnotation({ annotation, pageWillBeDeleted: -1 });

      expect(getRichTextCSSStyle).not.toHaveBeenCalled();
      expect(annotation.setRichTextStyle).not.toHaveBeenCalled();
    });
  });

  describe('handleEllipseRotationControl', () => {
    it('should disable rotation control for EllipseAnnotation', () => {
      const annotation = createMockAnnotation(window.Core.Annotations.EllipseAnnotation);

      processImportedAnnotation({ annotation, pageWillBeDeleted: -1 });

      expect(annotation.disableRotationControl).toHaveBeenCalled();
    });

    it('should not disable rotation control for other annotations', () => {
      const annotation = createMockAnnotation(window.Core.Annotations.StampAnnotation);

      processImportedAnnotation({ annotation, pageWillBeDeleted: -1 });

      expect(annotation.disableRotationControl).not.toHaveBeenCalled();
    });
  });

  describe('processImportedAnnotations', () => {
    it('should process multiple annotations', () => {
      const annot1 = createMockAnnotation(window.Core.Annotations.StampAnnotation);
      const annot2 = createMockAnnotation(window.Core.Annotations.EllipseAnnotation);
      const annotations = [annot1, annot2];

      processImportedAnnotations(annotations, -1);

      // Verify some side effects to ensure processing happened
      expect(annot1.getCustomData).toHaveBeenCalled();
      expect(annot2.disableRotationControl).toHaveBeenCalled();
    });
  });
});

