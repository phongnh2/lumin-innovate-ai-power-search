import { v4 } from 'uuid';
import core from 'core';
import { eventTracking } from 'utils/recordUtil';
import { ANNOTATION_STYLE, AnnotationSubjectMapping } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import {
  AI_AUTO_ADDED,
  NEW_FORM_FIELD_IN_SESSION,
  getFieldNameMapping,
  TRN_ANNOT_LISTABLE,
  MAINTAIN_ASPECT_RATIO,
  FIELD_ID,
  FIELD_SESSION_ID,
  FORM_FIELD_TYPE,
} from 'constants/formBuildTool';
import { FormFieldDetection } from '../../constants/detectionField.constant';
import { FORM_FIELD_DETECTION_TO_TYPE_MAPPER, TOOLS_NAME_TO_EVENT_TRACKING_NAME_MAPPER } from '../../constants/mapper';
import { IFormFieldDetectionPrediction } from '../../types/detectionField.type';
import { getTextFormFieldProperties } from '../../utils/textFormField';
import { applyFormFieldsDetected } from '../applyFormFieldsDetected';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

jest.mock('core', () => ({
  getAnnotationManager: jest.fn(),
  getCurrentUser: jest.fn(() => 'test-user'),
}));

jest.mock('utils/recordUtil', () => ({
  eventTracking: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('constants/documentConstants', () => ({
  ANNOTATION_STYLE: {
    FILL_COLOR: 'FillColor',
    STROKE_COLOR: 'StrokeColor',
    FONT_SIZE: 'FontSize',
  },
  AnnotationSubjectMapping: {
    widget: 'Widget',
  },
}));

jest.mock('constants/formBuildTool', () => {
  const actual = jest.requireActual('constants/formBuildTool');
  return {
    ...actual,
    getFieldNameMapping: jest.fn(),
  };
});

jest.mock('../../constants/mapper', () => ({
  FORM_FIELD_DETECTION_TO_TYPE_MAPPER: {
    'text_box': 'TextFormField',
    'check_box': 'CheckBoxFormField',
    'signature': 'SignatureFormField',
    'radio_box': 'RadioButtonFormField',
  },
  TOOLS_NAME_TO_EVENT_TRACKING_NAME_MAPPER: {
    'TextFormFieldCreateTool': 'text',
    'CheckBoxFormFieldCreateTool': 'checkBox',
    'SignatureFormFieldCreateTool': 'signature',
    'RadioButtonFormFieldCreateTool': 'radioButton',
  },
}));

jest.mock('../../utils/textFormField', () => ({
  getTextFormFieldProperties: jest.fn(),
}));

// Mock window.Core before importing the module
const mockWidgetAnnotation = class {
  PageNumber: number = 0;
  X: number = 0;
  Y: number = 0;
  Width: number = 0;
  Height: number = 0;
  Author: string = '';
  Subject: string = '';
  ToolName: string = '';
  FontSize?: string;
  setCustomData = jest.fn();
};

const mockField = class {
  widgets: any[] = [];
  constructor(public name: string, public options: any) {}
};

const mockWidgetFlags = class {
  constructor(public flags: any) {}
  set = jest.fn();
};

const mockColor = class {
  constructor(public r: number, public g: number, public b: number, public a: number) {}
};

const mockTextWidgetAnnotation = class extends mockWidgetAnnotation {
  ToolName = 'TextFormFieldCreateTool';
  constructor(field: any, options: any) {
    super();
  }
};

const mockCheckButtonWidgetAnnotation = class extends mockWidgetAnnotation {
  ToolName = 'CheckBoxFormFieldCreateTool';
  constructor(field: any, options: any) {
    super();
  }
};

const mockSignatureWidgetAnnotation = class extends mockWidgetAnnotation {
  ToolName = 'SignatureFormFieldCreateTool';
  constructor(field: any, options: any) {
    super();
  }
};

const mockRadioButtonWidgetAnnotation = class extends mockWidgetAnnotation {
  ToolName = 'RadioButtonFormFieldCreateTool';
  constructor(field: any, options: any) {
    super();
  }
};

(window as any).Core = {
  Annotations: {
    Forms: {
      Field: mockField,
    },
    WidgetFlags: mockWidgetFlags,
    Color: mockColor,
    TextWidgetAnnotation: mockTextWidgetAnnotation,
    CheckButtonWidgetAnnotation: mockCheckButtonWidgetAnnotation,
    SignatureWidgetAnnotation: mockSignatureWidgetAnnotation,
    RadioButtonWidgetAnnotation: mockRadioButtonWidgetAnnotation,
  },
};

describe('applyFormFieldsDetected', () => {
  let mockAnnotationManager: any;
  let mockFieldManager: any;
  let mockDrawAnnotationsFromList: jest.Mock;
  let mockSetAnnotationStyles: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDrawAnnotationsFromList = jest.fn().mockResolvedValue(undefined);
    mockSetAnnotationStyles = jest.fn();

    mockFieldManager = {
      addField: jest.fn(),
    };

    mockAnnotationManager = {
      getFieldManager: jest.fn(() => mockFieldManager),
      addAnnotation: jest.fn(),
      drawAnnotationsFromList: mockDrawAnnotationsFromList,
      setAnnotationStyles: mockSetAnnotationStyles,
    };

    (core.getAnnotationManager as jest.Mock).mockReturnValue(mockAnnotationManager);
    (core.getCurrentUser as jest.Mock).mockReturnValue('test-user');
    (getTextFormFieldProperties as jest.Mock).mockReturnValue({
      isMultiline: false,
      fontSize: 0,
    });
  });

  describe('applyFormField', () => {
    it('should return null for RADIO_BOX field type', async () => {
      const prediction: IFormFieldDetectionPrediction = {
        pageNumber: 1,
        boundingRectangle: { x1: 10, y1: 20, x2: 100, y2: 40 },
        fieldType: FormFieldDetection.RADIO_BOX,
        fieldId: 'field-1',
      };

      const result = await applyFormFieldsDetected({
        sessionId: 'session-1',
        predictions: [prediction],
      });

      expect(mockAnnotationManager.addAnnotation).not.toHaveBeenCalled();
      expect(eventTracking).not.toHaveBeenCalled();
    });

    it('should return null when fieldMapping is not found', async () => {
      (getFieldNameMapping as jest.Mock).mockReturnValue(null);

      const prediction: IFormFieldDetectionPrediction = {
        pageNumber: 1,
        boundingRectangle: { x1: 10, y1: 20, x2: 100, y2: 40 },
        fieldType: FormFieldDetection.TEXT_BOX,
        fieldId: 'field-1',
      };

      await applyFormFieldsDetected({
        sessionId: 'session-1',
        predictions: [prediction],
      });

      expect(mockAnnotationManager.addAnnotation).not.toHaveBeenCalled();
      expect(eventTracking).not.toHaveBeenCalled();
    });

    it('should create and draw TEXT_BOX form field', async () => {
      const mockFieldMapping = {
        CUSTOM_NAME: 'Text',
        TYPE: 'Tx',
        ANNOTATION: jest.fn((field, option) => new mockTextWidgetAnnotation(field, option)),
        OPTION: {},
      };

      (getFieldNameMapping as jest.Mock).mockReturnValue(mockFieldMapping);
      (getTextFormFieldProperties as jest.Mock).mockReturnValue({
        isMultiline: false,
        fontSize: 12,
      });

      const prediction: IFormFieldDetectionPrediction = {
        pageNumber: 1,
        boundingRectangle: { x1: 10, y1: 20, x2: 100, y2: 40 },
        fieldType: FormFieldDetection.TEXT_BOX,
        fieldId: 'field-1',
      };

      await applyFormFieldsDetected({
        sessionId: 'session-1',
        predictions: [prediction],
      });

      expect(mockFieldManager.addField).toHaveBeenCalledTimes(1);
      expect(mockAnnotationManager.addAnnotation).toHaveBeenCalledTimes(1);
      expect(mockDrawAnnotationsFromList).toHaveBeenCalledTimes(1);
      expect(mockSetAnnotationStyles).toHaveBeenCalledTimes(1);

      const addedAnnotation = mockAnnotationManager.addAnnotation.mock.calls[0][0];
      expect(addedAnnotation.PageNumber).toBe(1);
      expect(addedAnnotation.X).toBe(10);
      expect(addedAnnotation.Y).toBe(20);
      expect(addedAnnotation.Width).toBe(90);
      expect(addedAnnotation.Height).toBe(20);
      expect(addedAnnotation.Author).toBe('test-user');
      expect(addedAnnotation.Subject).toBe(AnnotationSubjectMapping.widget);
      expect(addedAnnotation.setCustomData).toHaveBeenCalledWith(AI_AUTO_ADDED, 'true');
      expect(addedAnnotation.setCustomData).toHaveBeenCalledWith(NEW_FORM_FIELD_IN_SESSION, 'true');
      expect(addedAnnotation.setCustomData).toHaveBeenCalledWith(FIELD_ID, 'field-1');
      expect(addedAnnotation.setCustomData).toHaveBeenCalledWith(FIELD_SESSION_ID, 'session-1');
      expect(addedAnnotation.setCustomData).toHaveBeenCalledWith(TRN_ANNOT_LISTABLE, 'true');

      expect(eventTracking).toHaveBeenCalledWith(
        UserEventConstants.EventType.ADD_FORM_BUILDER_ELEMENT,
        {
          type: 'text',
          aiAutoAdded: true,
          total: 1,
        }
      );
    });

    it('should create and draw CHECK_BOX form field with MAINTAIN_ASPECT_RATIO', async () => {
      const mockFieldMapping = {
        CUSTOM_NAME: 'Checkbox',
        TYPE: 'Btn',
        ANNOTATION: jest.fn((field, option) => new mockCheckButtonWidgetAnnotation(field, option)),
        OPTION: {
          appearance: 'Off',
          appearances: { Off: {}, Yes: {} },
          captions: { Normal: '' },
        },
      };

      (getFieldNameMapping as jest.Mock).mockReturnValue(mockFieldMapping);
      (getTextFormFieldProperties as jest.Mock).mockReturnValue({
        isMultiline: false,
        fontSize: 0,
      });

      const prediction: IFormFieldDetectionPrediction = {
        pageNumber: 2,
        boundingRectangle: { x1: 50, y1: 60, x2: 70, y2: 80 },
        fieldType: FormFieldDetection.CHECK_BOX,
        fieldId: 'field-2',
      };

      await applyFormFieldsDetected({
        sessionId: 'session-1',
        predictions: [prediction],
      });

      const addedAnnotation = mockAnnotationManager.addAnnotation.mock.calls[0][0];
      expect(addedAnnotation.setCustomData).toHaveBeenCalledWith(MAINTAIN_ASPECT_RATIO, 'true');
      expect(eventTracking).toHaveBeenCalledWith(
        UserEventConstants.EventType.ADD_FORM_BUILDER_ELEMENT,
        {
          type: 'checkBox',
          aiAutoAdded: true,
          total: 1,
        }
      );
    });

    it('should create and draw SIGNATURE form field', async () => {
      const mockFieldMapping = {
        CUSTOM_NAME: 'Signature',
        TYPE: 'Sig',
        ANNOTATION: jest.fn((field, option) => new mockSignatureWidgetAnnotation(field, option)),
        OPTION: {},
      };

      (getFieldNameMapping as jest.Mock).mockReturnValue(mockFieldMapping);
      (getTextFormFieldProperties as jest.Mock).mockReturnValue({
        isMultiline: false,
        fontSize: 0,
      });

      const prediction: IFormFieldDetectionPrediction = {
        pageNumber: 3,
        boundingRectangle: { x1: 100, y1: 200, x2: 200, y2: 250 },
        fieldType: FormFieldDetection.SIGNATURE,
        fieldId: 'field-3',
      };

      await applyFormFieldsDetected({
        sessionId: 'session-1',
        predictions: [prediction],
      });

      expect(eventTracking).toHaveBeenCalledWith(
        UserEventConstants.EventType.ADD_FORM_BUILDER_ELEMENT,
        {
          type: 'signature',
          aiAutoAdded: true,
          total: 1,
        }
      );
    });

    it('should handle multiline text field with flags', async () => {
      const mockFieldMapping = {
        CUSTOM_NAME: 'Text',
        TYPE: 'Tx',
        ANNOTATION: jest.fn((field, option) => new mockTextWidgetAnnotation(field, option)),
        OPTION: {},
      };

      (getFieldNameMapping as jest.Mock).mockReturnValue(mockFieldMapping);
      (getTextFormFieldProperties as jest.Mock).mockReturnValue({
        isMultiline: true,
        fontSize: 14,
      });

      const prediction: IFormFieldDetectionPrediction = {
        pageNumber: 1,
        boundingRectangle: { x1: 10, y1: 20, x2: 100, y2: 60 },
        fieldType: FormFieldDetection.TEXT_BOX,
        fieldId: 'field-1',
        fieldFlags: 4096, // IS_MULTILINE flag
      };

      await applyFormFieldsDetected({
        sessionId: 'session-1',
        predictions: [prediction],
      });

      const createdField = mockFieldManager.addField.mock.calls[0][0];
      expect(createdField.options.flags.set).toHaveBeenCalled();
    });

    it('should apply FontSize from annotationStyles when provided', async () => {
      const mockFieldMapping = {
        CUSTOM_NAME: 'Text',
        TYPE: 'Tx',
        ANNOTATION: jest.fn((field, option) => {
          const annot = new mockTextWidgetAnnotation(field, option);
          annot.FontSize = undefined;
          return annot;
        }),
        OPTION: {},
      };

      (getFieldNameMapping as jest.Mock).mockReturnValue(mockFieldMapping);
      (getTextFormFieldProperties as jest.Mock).mockReturnValue({
        isMultiline: false,
        fontSize: 16,
      });

      const prediction: IFormFieldDetectionPrediction = {
        pageNumber: 1,
        boundingRectangle: { x1: 10, y1: 20, x2: 100, y2: 40 },
        fieldType: FormFieldDetection.TEXT_BOX,
        fieldId: 'field-1',
      };

      await applyFormFieldsDetected({
        sessionId: 'session-1',
        predictions: [prediction],
      });

      expect(mockSetAnnotationStyles).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          [ANNOTATION_STYLE.FONT_SIZE]: '16pt',
        })
      );
    });

    it('should not apply FontSize when fontSize is 0', async () => {
      const mockFieldMapping = {
        CUSTOM_NAME: 'Text',
        TYPE: 'Tx',
        ANNOTATION: jest.fn((field, option) => new mockTextWidgetAnnotation(field, option)),
        OPTION: {},
      };

      (getFieldNameMapping as jest.Mock).mockReturnValue(mockFieldMapping);
      (getTextFormFieldProperties as jest.Mock).mockReturnValue({
        isMultiline: false,
        fontSize: 0,
      });

      const prediction: IFormFieldDetectionPrediction = {
        pageNumber: 1,
        boundingRectangle: { x1: 10, y1: 20, x2: 100, y2: 40 },
        fieldType: FormFieldDetection.TEXT_BOX,
        fieldId: 'field-1',
      };

      await applyFormFieldsDetected({
        sessionId: 'session-1',
        predictions: [prediction],
      });

      expect(mockSetAnnotationStyles).toHaveBeenCalledWith(
        expect.any(Object),
        expect.not.objectContaining({
          [ANNOTATION_STYLE.FONT_SIZE]: expect.anything(),
        })
      );
    });
  });

  describe('applyFormFieldsDetected - multiple predictions', () => {
    it('should process multiple predictions and group tracking events', async () => {
      const mockTextFieldMapping = {
        CUSTOM_NAME: 'Text',
        TYPE: 'Tx',
        ANNOTATION: jest.fn((field, option) => new mockTextWidgetAnnotation(field, option)),
        OPTION: {},
      };

      const mockCheckboxFieldMapping = {
        CUSTOM_NAME: 'Checkbox',
        TYPE: 'Btn',
        ANNOTATION: jest.fn((field, option) => new mockCheckButtonWidgetAnnotation(field, option)),
        OPTION: {
          appearance: 'Off',
          appearances: { Off: {}, Yes: {} },
          captions: { Normal: '' },
        },
      };

      (getFieldNameMapping as jest.Mock).mockImplementation((type) => {
        if (type === FORM_FIELD_TYPE.TEXT) return mockTextFieldMapping;
        if (type === FORM_FIELD_TYPE.CHECKBOX) return mockCheckboxFieldMapping;
        return null;
      });

      (getTextFormFieldProperties as jest.Mock).mockReturnValue({
        isMultiline: false,
        fontSize: 0,
      });

      const predictions: IFormFieldDetectionPrediction[] = [
        {
          pageNumber: 1,
          boundingRectangle: { x1: 10, y1: 20, x2: 100, y2: 40 },
          fieldType: FormFieldDetection.TEXT_BOX,
          fieldId: 'field-1',
        },
        {
          pageNumber: 1,
          boundingRectangle: { x1: 110, y1: 20, x2: 200, y2: 40 },
          fieldType: FormFieldDetection.TEXT_BOX,
          fieldId: 'field-2',
        },
        {
          pageNumber: 2,
          boundingRectangle: { x1: 50, y1: 60, x2: 70, y2: 80 },
          fieldType: FormFieldDetection.CHECK_BOX,
          fieldId: 'field-3',
        },
        {
          pageNumber: 3,
          boundingRectangle: { x1: 100, y1: 200, x2: 200, y2: 250 },
          fieldType: FormFieldDetection.RADIO_BOX,
          fieldId: 'field-4',
        },
      ];

      await applyFormFieldsDetected({
        sessionId: 'session-1',
        predictions,
      });

      expect(mockAnnotationManager.addAnnotation).toHaveBeenCalledTimes(3); // 2 text + 1 checkbox, radio is skipped
      expect(eventTracking).toHaveBeenCalledTimes(2);
      expect(eventTracking).toHaveBeenCalledWith(
        UserEventConstants.EventType.ADD_FORM_BUILDER_ELEMENT,
        {
          type: 'text',
          aiAutoAdded: true,
          total: 2,
        }
      );
      expect(eventTracking).toHaveBeenCalledWith(
        UserEventConstants.EventType.ADD_FORM_BUILDER_ELEMENT,
        {
          type: 'checkBox',
          aiAutoAdded: true,
          total: 1,
        }
      );
    });

    it('should handle empty predictions array', async () => {
      await applyFormFieldsDetected({
        sessionId: 'session-1',
        predictions: [],
      });

      expect(mockAnnotationManager.addAnnotation).not.toHaveBeenCalled();
      expect(eventTracking).not.toHaveBeenCalled();
    });

    it('should filter out null results from failed predictions', async () => {
      (getFieldNameMapping as jest.Mock).mockReturnValue(null);

      const predictions: IFormFieldDetectionPrediction[] = [
        {
          pageNumber: 1,
          boundingRectangle: { x1: 10, y1: 20, x2: 100, y2: 40 },
          fieldType: FormFieldDetection.TEXT_BOX,
          fieldId: 'field-1',
        },
        {
          pageNumber: 2,
          boundingRectangle: { x1: 50, y1: 60, x2: 70, y2: 80 },
          fieldType: FormFieldDetection.RADIO_BOX,
          fieldId: 'field-2',
        },
      ];

      await applyFormFieldsDetected({
        sessionId: 'session-1',
        predictions,
      });

      expect(mockAnnotationManager.addAnnotation).not.toHaveBeenCalled();
      expect(eventTracking).not.toHaveBeenCalled();
    });

    it('should handle eventTracking errors gracefully', async () => {
      const mockFieldMapping = {
        CUSTOM_NAME: 'Text',
        TYPE: 'Tx',
        ANNOTATION: jest.fn((field, option) => new mockTextWidgetAnnotation(field, option)),
        OPTION: {},
      };

      (getFieldNameMapping as jest.Mock).mockReturnValue(mockFieldMapping);
      (getTextFormFieldProperties as jest.Mock).mockReturnValue({
        isMultiline: false,
        fontSize: 0,
      });

      (eventTracking as jest.Mock).mockRejectedValue(new Error('Tracking error'));

      const prediction: IFormFieldDetectionPrediction = {
        pageNumber: 1,
        boundingRectangle: { x1: 10, y1: 20, x2: 100, y2: 40 },
        fieldType: FormFieldDetection.TEXT_BOX,
        fieldId: 'field-1',
      };

      // Should not throw
      await expect(
        applyFormFieldsDetected({
          sessionId: 'session-1',
          predictions: [prediction],
        })
      ).resolves.not.toThrow();

      expect(mockAnnotationManager.addAnnotation).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle annotationStyles with FontSize property', async () => {
      const mockFieldMapping = {
        CUSTOM_NAME: 'Text',
        TYPE: 'Tx',
        ANNOTATION: jest.fn((field, option) => {
          const annot = new mockTextWidgetAnnotation(field, option);
          annot.FontSize = '12pt';
          return annot;
        }),
        OPTION: {},
      };

      (getFieldNameMapping as jest.Mock).mockReturnValue(mockFieldMapping);
      (getTextFormFieldProperties as jest.Mock).mockReturnValue({
        isMultiline: false,
        fontSize: 0,
      });

      const prediction: IFormFieldDetectionPrediction = {
        pageNumber: 1,
        boundingRectangle: { x1: 10, y1: 20, x2: 100, y2: 40 },
        fieldType: FormFieldDetection.TEXT_BOX,
        fieldId: 'field-1',
      };

      await applyFormFieldsDetected({
        sessionId: 'session-1',
        predictions: [prediction],
      });

      const addedAnnotation = mockAnnotationManager.addAnnotation.mock.calls[0][0];
      expect(addedAnnotation.FontSize).toBe('12pt');
    });

    it('should set correct custom data values', async () => {
      const mockFieldMapping = {
        CUSTOM_NAME: 'Text',
        TYPE: 'Tx',
        ANNOTATION: jest.fn((field, option) => new mockTextWidgetAnnotation(field, option)),
        OPTION: {},
      };

      (getFieldNameMapping as jest.Mock).mockReturnValue(mockFieldMapping);
      (getTextFormFieldProperties as jest.Mock).mockReturnValue({
        isMultiline: false,
        fontSize: 0,
      });

      const prediction: IFormFieldDetectionPrediction = {
        pageNumber: 5,
        boundingRectangle: { x1: 15, y1: 25, x2: 105, y2: 45 },
        fieldType: FormFieldDetection.TEXT_BOX,
        fieldId: 'field-123',
      };

      await applyFormFieldsDetected({
        sessionId: 'session-abc',
        predictions: [prediction],
      });

      const addedAnnotation = mockAnnotationManager.addAnnotation.mock.calls[0][0];
      expect(addedAnnotation.setCustomData).toHaveBeenCalledWith(FIELD_ID, 'field-123');
      expect(addedAnnotation.setCustomData).toHaveBeenCalledWith(FIELD_SESSION_ID, 'session-abc');
      // FIELD_ID is set twice in the code (line 52 and 55)
      expect(addedAnnotation.setCustomData).toHaveBeenCalledTimes(6);
    });

    it('should create field with correct name format', async () => {
      const mockFieldMapping = {
        CUSTOM_NAME: 'Text',
        TYPE: 'Tx',
        ANNOTATION: jest.fn((field, option) => new mockTextWidgetAnnotation(field, option)),
        OPTION: {},
      };

      (getFieldNameMapping as jest.Mock).mockReturnValue(mockFieldMapping);
      (getTextFormFieldProperties as jest.Mock).mockReturnValue({
        isMultiline: false,
        fontSize: 0,
      });

      const prediction: IFormFieldDetectionPrediction = {
        pageNumber: 1,
        boundingRectangle: { x1: 10, y1: 20, x2: 100, y2: 40 },
        fieldType: FormFieldDetection.TEXT_BOX,
        fieldId: 'field-1',
      };

      await applyFormFieldsDetected({
        sessionId: 'session-1',
        predictions: [prediction],
      });

      const createdField = mockFieldManager.addField.mock.calls[0][0];
      expect(createdField.name).toBe('Text mock-uuid-123');
      expect(v4).toHaveBeenCalled();
    });
  });
});

