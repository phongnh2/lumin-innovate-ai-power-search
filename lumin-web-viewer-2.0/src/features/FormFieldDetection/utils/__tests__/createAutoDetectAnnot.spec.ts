import {
  handleAddCheckBoxAnnotation,
  handleAddTextAnnotation,
  handleAddSignatureAnnotation,
  handleAddAnnotation,
} from '../createAutoDetectAnnot';
import core from 'core';
import { store } from 'store';
import onLocationSelected from 'event-listeners/onLocationSelected';
import DetectedFieldPlaceholder from 'helpers/CustomAnnotation/DetectedFieldPlaceholder';
import logger from 'helpers/logger';
import { getParsedToolStyles } from 'helpers/setDefaultToolStyles';
import { getToolStyles } from 'features/Annotation/utils/getToolStyles';
import { FormFieldDetection } from '../../constants/detectionField.constant';
import { useAutoDetectionStore } from '../../hooks/useAutoDetectionStore';
import { TOOLS_NAME } from 'constants/toolsName';
import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { LOGGER } from 'constants/lumin-common';

jest.mock('core', () => ({
  __esModule: true,
  default: {
    getTool: jest.fn(),
  },
}));

jest.mock('store', () => ({
  store: {},
}));

const mockOnLocationSelectedReturn = jest.fn();
jest.mock('event-listeners/onLocationSelected', () => jest.fn(() => mockOnLocationSelectedReturn));

jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
  },
}));

jest.mock('helpers/setDefaultToolStyles', () => ({
  getParsedToolStyles: jest.fn(),
}));

jest.mock('features/Annotation/utils/getToolStyles', () => ({
  getToolStyles: jest.fn(),
}));

jest.mock('../../hooks/useAutoDetectionStore', () => ({
  useAutoDetectionStore: {
    getState: jest.fn(),
  },
}));

// Mock window.Core
const mockStampAnnotation = jest.fn();
const mockFreeTextAnnotation = jest.fn();
const mockSetAnnotImageData = jest.fn();
const mockSetContents = jest.fn();
const mockIconStampCreateTool = {
  setAnnotImageData: mockSetAnnotImageData,
};

beforeAll(() => {
  global.window = Object.create(window);
  (mockFreeTextAnnotation as any).Intent = {
    FreeText: 'FreeText',
  };
  global.window.Core = {
    Annotations: {
      StampAnnotation: mockStampAnnotation,
      FreeTextAnnotation: mockFreeTextAnnotation,
    },
    Tools: {
      SignatureCreateTool: jest.fn(),
    },
  } as any;
});

describe('createAutoDetectAnnot', () => {
  const mockGetTool = core.getTool as jest.Mock;
  const mockOnLocationSelected = onLocationSelected as jest.Mock;
  const mockLogError = logger.logError as jest.Mock;
  const mockGetParsedToolStyles = getParsedToolStyles as jest.Mock;
  const mockGetToolStyles = getToolStyles as jest.Mock;
  const mockGetState = useAutoDetectionStore.getState as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetAnnotImageData.mockResolvedValue(undefined);
    mockSetContents.mockReturnValue(undefined);
    mockOnLocationSelectedReturn.mockResolvedValue(undefined);
    mockOnLocationSelected.mockReturnValue(mockOnLocationSelectedReturn);
    mockGetState.mockReturnValue({
      setAutoDetectAnnotationId: jest.fn(),
    });
  });

  describe('handleAddCheckBoxAnnotation', () => {
    it('should create and return a checkbox annotation', async () => {
      const mockCheckboxAnnot = {
        Subject: null as string | null,
        ToolName: null as string | null,
      };
      mockStampAnnotation.mockReturnValue(mockCheckboxAnnot);
      mockGetTool.mockReturnValue(mockIconStampCreateTool);

      const result = await handleAddCheckBoxAnnotation();

      expect(mockGetTool).toHaveBeenCalledWith(TOOLS_NAME.TICK_STAMP);
      expect(mockStampAnnotation).toHaveBeenCalledWith({
        Subject: AnnotationSubjectMapping.tickStamp,
        ToolName: TOOLS_NAME.TICK_STAMP,
      });
      expect(mockSetAnnotImageData).toHaveBeenCalledWith(mockCheckboxAnnot);
      expect(result).toEqual({
        annotation: mockCheckboxAnnot,
      });
    });

    it('should handle async setAnnotImageData correctly', async () => {
      const mockCheckboxAnnot = {
        Subject: null as string | null,
        ToolName: null as string | null,
      };
      mockStampAnnotation.mockReturnValue(mockCheckboxAnnot);
      mockGetTool.mockReturnValue(mockIconStampCreateTool);
      mockSetAnnotImageData.mockImplementation(() => Promise.resolve());

      const result = await handleAddCheckBoxAnnotation();

      expect(result.annotation).toBe(mockCheckboxAnnot);
    });
  });

  describe('handleAddTextAnnotation', () => {
    it('should create and return a text annotation when toolStyles exists', () => {
      const mockToolStyles = { fontSize: 12 };
      const mockParsedStyles = { fontSize: 12, color: 'black' };
      const mockTextboxAnnot = {
        setContents: mockSetContents,
      };

      mockGetToolStyles.mockReturnValue(mockToolStyles);
      mockGetParsedToolStyles.mockReturnValue(mockParsedStyles);
      mockFreeTextAnnotation.mockReturnValue(mockTextboxAnnot);

      const resultPromise = handleAddTextAnnotation();

      expect(mockGetToolStyles).toHaveBeenCalledWith(TOOLS_NAME.FREETEXT);
      expect(mockGetParsedToolStyles).toHaveBeenCalledWith(mockToolStyles);
      expect(mockFreeTextAnnotation).toHaveBeenCalledWith(
        window.Core.Annotations.FreeTextAnnotation.Intent.FreeText,
        mockParsedStyles
      );
      expect(mockSetContents).toHaveBeenCalledWith('');

      return resultPromise.then((result) => {
        expect(result).toEqual({
          annotation: mockTextboxAnnot,
        });
      });
    });

    it('should create and return a text annotation when toolStyles is null', () => {
      const mockTextboxAnnot = {
        setContents: mockSetContents,
      };

      mockGetToolStyles.mockReturnValue(null);
      mockFreeTextAnnotation.mockReturnValue(mockTextboxAnnot);

      const resultPromise = handleAddTextAnnotation();

      expect(mockGetToolStyles).toHaveBeenCalledWith(TOOLS_NAME.FREETEXT);
      expect(mockGetParsedToolStyles).not.toHaveBeenCalled();
      expect(mockFreeTextAnnotation).toHaveBeenCalledWith(
        window.Core.Annotations.FreeTextAnnotation.Intent.FreeText,
        null
      );
      expect(mockSetContents).toHaveBeenCalledWith('');

      return resultPromise.then((result) => {
        expect(result).toEqual({
          annotation: mockTextboxAnnot,
        });
      });
    });

    it('should create and return a text annotation when toolStyles is undefined', () => {
      const mockTextboxAnnot = {
        setContents: mockSetContents,
      };

      mockGetToolStyles.mockReturnValue(undefined);
      mockFreeTextAnnotation.mockReturnValue(mockTextboxAnnot);

      const resultPromise = handleAddTextAnnotation();

      expect(mockGetToolStyles).toHaveBeenCalledWith(TOOLS_NAME.FREETEXT);
      expect(mockGetParsedToolStyles).not.toHaveBeenCalled();
      expect(mockFreeTextAnnotation).toHaveBeenCalledWith(
        window.Core.Annotations.FreeTextAnnotation.Intent.FreeText,
        null
      );
      expect(mockSetContents).toHaveBeenCalledWith('');

      return resultPromise.then((result) => {
        expect(result).toEqual({
          annotation: mockTextboxAnnot,
        });
      });
    });
  });

  describe('handleAddSignatureAnnotation', () => {
    const mockAnnotation = {
      PageNumber: 1,
      X: 10,
      Y: 20,
      Width: 100,
      Height: 50,
      CustomFieldId: 'test-field-id',
    } as DetectedFieldPlaceholder;

    it('should handle signature annotation creation successfully', async () => {
      const mockSignatureTool = {
        location: null as Core.Tools.PageCoordinate | null,
      };
      const mockSetAutoDetectAnnotationId = jest.fn();
      mockGetTool.mockReturnValue(mockSignatureTool);
      mockGetState.mockReturnValue({
        setAutoDetectAnnotationId: mockSetAutoDetectAnnotationId,
      });
      mockOnLocationSelectedReturn.mockResolvedValue(undefined);
      mockOnLocationSelected.mockReturnValue(mockOnLocationSelectedReturn);

      const result = await handleAddSignatureAnnotation(mockAnnotation);

      expect(mockGetTool).toHaveBeenCalledWith(TOOLS_NAME.SIGNATURE);
      expect(mockSignatureTool.location).toEqual({
        pageNumber: 1,
        x: 60, // X + Width / 2 = 10 + 100 / 2 = 60
        y: 45, // Y + Height / 2 = 20 + 50 / 2 = 45
      });
      expect(mockOnLocationSelected).toHaveBeenCalledWith(store);
      expect(mockOnLocationSelectedReturn).toHaveBeenCalledWith(mockSignatureTool.location);
      expect(mockSetAutoDetectAnnotationId).toHaveBeenCalledWith({
        annotationId: 'test-field-id',
      });
      expect(mockLogError).not.toHaveBeenCalled();
      expect(result).toEqual({
        annotation: null,
      });
    });

    it('should handle error when onLocationSelected throws', async () => {
      const mockSignatureTool = {
        location: null as Core.Tools.PageCoordinate | null,
      };
      const mockError = new Error('Test error');
      const mockSetAutoDetectAnnotationId = jest.fn();
      mockGetTool.mockReturnValue(mockSignatureTool);
      mockGetState.mockReturnValue({
        setAutoDetectAnnotationId: mockSetAutoDetectAnnotationId,
      });
      mockOnLocationSelectedReturn.mockRejectedValue(mockError);

      const result = await handleAddSignatureAnnotation(mockAnnotation);

      expect(mockGetTool).toHaveBeenCalledWith(TOOLS_NAME.SIGNATURE);
      expect(mockSignatureTool.location).toEqual({
        pageNumber: 1,
        x: 60,
        y: 45,
      });
      expect(mockOnLocationSelected).toHaveBeenCalledWith(store);
      expect(mockOnLocationSelectedReturn).toHaveBeenCalledWith(mockSignatureTool.location);
      expect(mockLogError).toHaveBeenCalledWith({
        reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
        message: 'Error in trigger show signature popup',
        error: mockError,
      });
      expect(mockSetAutoDetectAnnotationId).toHaveBeenCalledWith({
        annotationId: 'test-field-id',
      });
      expect(result).toEqual({
        annotation: null,
      });
    });

    it('should calculate location correctly for different annotation positions', async () => {
      const mockAnnotation2 = {
        PageNumber: 2,
        X: 0,
        Y: 0,
        Width: 200,
        Height: 100,
        CustomFieldId: 'test-field-id-2',
      } as DetectedFieldPlaceholder;
      const mockSignatureTool: {
        location: Core.Tools.PageCoordinate | null;
      } = {
        location: null,
      };
      const mockSetAutoDetectAnnotationId = jest.fn();
      mockGetTool.mockReturnValue(mockSignatureTool);
      mockGetState.mockReturnValue({
        setAutoDetectAnnotationId: mockSetAutoDetectAnnotationId,
      });
      mockOnLocationSelectedReturn.mockResolvedValue(undefined);
      mockOnLocationSelected.mockReturnValue(mockOnLocationSelectedReturn);

      await handleAddSignatureAnnotation(mockAnnotation2);

      expect(mockSignatureTool.location).toEqual({
        pageNumber: 2,
        x: 100, // X + Width / 2 = 0 + 200 / 2 = 100
        y: 50, // Y + Height / 2 = 0 + 100 / 2 = 50
      });
    });
  });

  describe('handleAddAnnotation', () => {
    it('should handle CHECK_BOX type', async () => {
      const mockAnnotation = {
        CustomFieldType: FormFieldDetection.CHECK_BOX,
      } as DetectedFieldPlaceholder;
      const mockCheckboxAnnot = {
        Subject: null as string | null,
        ToolName: null as string | null,
      };
      mockStampAnnotation.mockReturnValue(mockCheckboxAnnot);
      mockGetTool.mockReturnValue(mockIconStampCreateTool);

      const result = await handleAddAnnotation(mockAnnotation);

      expect(result).toEqual({
        annotation: mockCheckboxAnnot,
      });
    });

    it('should handle TEXT_BOX type', async () => {
      const mockAnnotation = {
        CustomFieldType: FormFieldDetection.TEXT_BOX,
      } as DetectedFieldPlaceholder;
      const mockTextboxAnnot = {
        setContents: mockSetContents,
      };
      mockGetToolStyles.mockReturnValue(null);
      mockFreeTextAnnotation.mockReturnValue(mockTextboxAnnot);

      const result = await handleAddAnnotation(mockAnnotation);

      expect(result).toEqual({
        annotation: mockTextboxAnnot,
      });
    });

    it('should handle SIGNATURE type', async () => {
      const mockAnnotation = {
        CustomFieldType: FormFieldDetection.SIGNATURE,
        PageNumber: 1,
        X: 10,
        Y: 20,
        Width: 100,
        Height: 50,
        CustomFieldId: 'test-signature-id',
      } as DetectedFieldPlaceholder;
      const mockSignatureTool = {
        location: null as Core.Tools.PageCoordinate | null,
      };
      const mockSetAutoDetectAnnotationId = jest.fn();
      mockGetTool.mockReturnValue(mockSignatureTool);
      mockGetState.mockReturnValue({
        setAutoDetectAnnotationId: mockSetAutoDetectAnnotationId,
      });
      mockOnLocationSelectedReturn.mockResolvedValue(undefined);
      mockOnLocationSelected.mockReturnValue(mockOnLocationSelectedReturn);

      const result = await handleAddAnnotation(mockAnnotation);

      expect(result).toEqual({
        annotation: null,
      });
      expect(mockSetAutoDetectAnnotationId).toHaveBeenCalledWith({
        annotationId: 'test-signature-id',
      });
    });

    it('should handle default case (unknown type)', async () => {
      const mockAnnotation = {
        CustomFieldType: 'unknown_type' as any,
      } as DetectedFieldPlaceholder;

      const result = await handleAddAnnotation(mockAnnotation);

      expect(result).toBeNull();
      expect(mockGetTool).not.toHaveBeenCalled();
      expect(mockGetToolStyles).not.toHaveBeenCalled();
    });

    it('should handle RADIO_BOX type (default case)', async () => {
      const mockAnnotation = {
        CustomFieldType: FormFieldDetection.RADIO_BOX,
      } as DetectedFieldPlaceholder;

      const result = await handleAddAnnotation(mockAnnotation);

      expect(result).toBeNull();
    });

    it('should handle null CustomFieldType (default case)', async () => {
      const mockAnnotation = {
        CustomFieldType: null as any,
      } as DetectedFieldPlaceholder;

      const result = await handleAddAnnotation(mockAnnotation);

      expect(result).toBeNull();
    });

    it('should handle undefined CustomFieldType (default case)', async () => {
      const mockAnnotation = {
        CustomFieldType: undefined as any,
      } as DetectedFieldPlaceholder;

      const result = await handleAddAnnotation(mockAnnotation);

      expect(result).toBeNull();
    });
  });
});
