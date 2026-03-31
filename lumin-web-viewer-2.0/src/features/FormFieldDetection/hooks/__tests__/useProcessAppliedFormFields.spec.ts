import { renderHook, act } from '@testing-library/react';
import { documentServices } from 'services';
import logger from 'helpers/logger';
import { v4 } from 'uuid';
import { useFormFieldDetectionStore } from '../useFormFieldDetectionStore';
import { useProcessAppliedFormFields } from '../useProcessAppliedFormFields';
import { TOOLS_NAME } from 'constants/toolsName';
import { FORM_FIELD_TYPE } from 'constants/formBuildTool';
import { FormFieldDetection } from 'features/FormFieldDetection/constants/detectionField.constant';

jest.mock('services', () => ({
  documentServices: {
    processAppliedFormFields: jest.fn().mockResolvedValue({ statusCode: 200 }),
  },
  loggerServices: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('services/loggerServices', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn().mockResolvedValue(undefined),
    logInfo: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../useFormFieldDetectionStore', () => ({
  useFormFieldDetectionStore: jest.fn(),
}));

const mockUseShallow = jest.fn((fn: any) => fn);
jest.mock('zustand/react/shallow', () => ({
  useShallow: (fn: any) => mockUseShallow(fn),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'generated-uuid-123'),
}));

describe('useProcessAppliedFormFields', () => {
  const mockRemoveAllData = jest.fn();
  const mockPredictionData = {
    'session-1': [{ fieldId: 'p1' }]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useFormFieldDetectionStore as unknown as jest.Mock).mockReturnValue({
      predictionData: mockPredictionData,
      removeAllData: mockRemoveAllData,
    });
    (v4 as jest.Mock).mockReturnValue('generated-uuid-123');
    mockUseShallow.mockImplementation((fn: any) => fn);
  });

  it('should process applied fields in chunks and call service', async () => {
    const mockAnnotation = {
      ToolName: TOOLS_NAME.TEXT_FIELD,
      getX: () => 0, getY: () => 0, getWidth: () => 10, getHeight: () => 10,
      getPageNumber: () => 1,
      getCustomData: (key: string) => {
        if (key === 'fieldSessionId') return 'session-1';
        if (key === 'fieldId') return 'field-1';
        return null;
      },
    };

    const { result } = renderHook(() => useProcessAppliedFormFields());
    
    await act(async () => {
      await result.current.handleProcessAppliedFormFields({
        documentId: 'doc-1',
        appliedFormFields: [mockAnnotation as any],
      });
    });

    expect(documentServices.processAppliedFormFields).toHaveBeenCalled();
    expect(mockRemoveAllData).toHaveBeenCalled();
  });

  it('should return early when predictionData is empty', async () => {
    (useFormFieldDetectionStore as unknown as jest.Mock).mockReturnValue({
      predictionData: {},
      removeAllData: mockRemoveAllData,
    });

    const mockAnnotation = {
      ToolName: TOOLS_NAME.TEXT_FIELD,
      getX: () => 0, getY: () => 0, getWidth: () => 10, getHeight: () => 10,
      getPageNumber: () => 1,
      getCustomData: () => 'session-1',
    };

    const { result } = renderHook(() => useProcessAppliedFormFields());
    
    await act(async () => {
      await result.current.handleProcessAppliedFormFields({
        documentId: 'doc-1',
        appliedFormFields: [mockAnnotation as any],
      });
    });

    expect(documentServices.processAppliedFormFields).not.toHaveBeenCalled();
    expect(mockRemoveAllData).toHaveBeenCalled();
  });

  it('should return early when appliedFormFields is empty', async () => {
    const { result } = renderHook(() => useProcessAppliedFormFields());
    
    await act(async () => {
      await result.current.handleProcessAppliedFormFields({
        documentId: 'doc-1',
        appliedFormFields: [],
      });
    });

    expect(documentServices.processAppliedFormFields).not.toHaveBeenCalled();
    expect(mockRemoveAllData).toHaveBeenCalled();
  });

  it('should calculate bounding rectangle and push to appliedFormFieldsData (lines 53-60)', async () => {
    const mockAnnotation = {
      ToolName: TOOLS_NAME.TEXT_FIELD,
      getX: () => 100,
      getY: () => 200,
      getWidth: () => 50,
      getHeight: () => 30,
      getPageNumber: () => 2,
      getCustomData: (key: string) => {
        if (key === 'fieldSessionId') return 'session-1';
        if (key === 'fieldId') return 'custom-field-id';
        return null;
      },
    };

    const { result } = renderHook(() => useProcessAppliedFormFields());
    
    await act(async () => {
      await result.current.handleProcessAppliedFormFields({
        documentId: 'doc-1',
        appliedFormFields: [mockAnnotation as any],
      });
    });

    expect(documentServices.processAppliedFormFields).toHaveBeenCalledWith({
      documentId: 'doc-1',
      predictionFieldDataList: [
        {
          sessionId: 'session-1',
          appliedFormFields: [
            {
              boundingRectangle: { x1: 100, y1: 200, x2: 150, y2: 230 },
              fieldType: FormFieldDetection.TEXT_BOX,
              fieldId: 'custom-field-id',
              pageNumber: 2,
            },
          ],
          predictions: [{ fieldId: 'p1' }],
        },
      ],
    });
  });

  it('should generate fieldId using v4 when not provided in customData (line 57)', async () => {
    const mockAnnotation = {
      ToolName: TOOLS_NAME.CHECK_BOX,
      getX: () => 0,
      getY: () => 0,
      getWidth: () => 10,
      getHeight: () => 10,
      getPageNumber: () => 1,
      getCustomData: (key: string) => {
        if (key === 'fieldSessionId') return 'session-1';
        if (key === 'fieldId') return null; // No fieldId provided
        return null;
      },
    };

    const { result } = renderHook(() => useProcessAppliedFormFields());
    
    await act(async () => {
      await result.current.handleProcessAppliedFormFields({
        documentId: 'doc-1',
        appliedFormFields: [mockAnnotation as any],
      });
    });

    expect(v4).toHaveBeenCalled();
    expect(documentServices.processAppliedFormFields).toHaveBeenCalledWith({
      documentId: 'doc-1',
      predictionFieldDataList: [
        {
          sessionId: 'session-1',
          appliedFormFields: [
            expect.objectContaining({
              fieldId: 'generated-uuid-123',
            }),
          ],
          predictions: [{ fieldId: 'p1' }],
        },
      ],
    });
  });

  it('should push to predictionFieldDataList when both value and appliedFormFieldsData exist (line 75)', async () => {
    const mockPredictionDataWithMultipleSessions = {
      'session-1': [{ fieldId: 'p1' }],
      'session-2': [{ fieldId: 'p2' }],
    };

    (useFormFieldDetectionStore as unknown as jest.Mock).mockReturnValue({
      predictionData: mockPredictionDataWithMultipleSessions,
      removeAllData: mockRemoveAllData,
    });

    const mockAnnotation1 = {
      ToolName: TOOLS_NAME.TEXT_FIELD,
      getX: () => 0,
      getY: () => 0,
      getWidth: () => 10,
      getHeight: () => 10,
      getPageNumber: () => 1,
      getCustomData: (key: string) => {
        if (key === 'fieldSessionId') return 'session-1';
        if (key === 'fieldId') return 'field-1';
        return null;
      },
    };

    const mockAnnotation2 = {
      ToolName: TOOLS_NAME.SIGNATURE_FIELD,
      getX: () => 20,
      getY: () => 20,
      getWidth: () => 15,
      getHeight: () => 15,
      getPageNumber: () => 2,
      getCustomData: (key: string) => {
        if (key === 'fieldSessionId') return 'session-2';
        if (key === 'fieldId') return 'field-2';
        return null;
      },
    };

    const { result } = renderHook(() => useProcessAppliedFormFields());
    
    await act(async () => {
      await result.current.handleProcessAppliedFormFields({
        documentId: 'doc-1',
        appliedFormFields: [mockAnnotation1 as any, mockAnnotation2 as any],
      });
    });

    expect(documentServices.processAppliedFormFields).toHaveBeenCalledWith({
      documentId: 'doc-1',
      predictionFieldDataList: [
        {
          sessionId: 'session-1',
          appliedFormFields: [
            expect.objectContaining({
              fieldId: 'field-1',
            }),
          ],
          predictions: [{ fieldId: 'p1' }],
        },
        {
          sessionId: 'session-2',
          appliedFormFields: [
            expect.objectContaining({
              fieldId: 'field-2',
            }),
          ],
          predictions: [{ fieldId: 'p2' }],
        },
      ],
    });
  });

  it('should handle error and log it (line 91)', async () => {
    const mockError = new Error('Processing failed');
    
    // Make a field method throw an error to trigger the catch block
    const mockAnnotation = {
      ToolName: TOOLS_NAME.TEXT_FIELD,
      getX: () => {
        throw mockError;
      },
      getY: () => 0,
      getWidth: () => 10,
      getHeight: () => 10,
      getPageNumber: () => 1,
      getCustomData: (key: string) => {
        if (key === 'fieldSessionId') return 'session-1';
        if (key === 'fieldId') return 'field-1';
        return null;
      },
    };

    const { result } = renderHook(() => useProcessAppliedFormFields());
    
    await act(async () => {
      await result.current.handleProcessAppliedFormFields({
        documentId: 'doc-1',
        appliedFormFields: [mockAnnotation as any],
      });
    });

    expect(logger.logError).toHaveBeenCalledWith({
      message: 'Failed to processAppliedFormFields',
      error: mockError,
    });
    expect(mockRemoveAllData).toHaveBeenCalled();
  });

  it('should use FORM_FIELD_TYPE_TO_DETECTION_TYPE_MAPPER when ToolName is not in TOOLS_NAME_TO_DETECTION_TYPE_MAPPER', async () => {
    const mockAnnotation = {
      ToolName: 'UnknownTool',
      getX: () => 0,
      getY: () => 0,
      getWidth: () => 10,
      getHeight: () => 10,
      getPageNumber: () => 1,
      getCustomData: (key: string) => {
        if (key === 'fieldSessionId') return 'session-1';
        if (key === 'fieldId') return 'field-1';
        if (key === 'trn-form-field-type') return FORM_FIELD_TYPE.TEXT;
        return null;
      },
    };

    const { result } = renderHook(() => useProcessAppliedFormFields());
    
    await act(async () => {
      await result.current.handleProcessAppliedFormFields({
        documentId: 'doc-1',
        appliedFormFields: [mockAnnotation as any],
      });
    });

    expect(documentServices.processAppliedFormFields).toHaveBeenCalledWith({
      documentId: 'doc-1',
      predictionFieldDataList: [
        {
          sessionId: 'session-1',
          appliedFormFields: [
            expect.objectContaining({
              fieldType: FormFieldDetection.TEXT_BOX,
            }),
          ],
          predictions: [{ fieldId: 'p1' }],
        },
      ],
    });
  });

  it('should skip fields without fieldType or sessionId in predictionData', async () => {
    const mockAnnotation1 = {
      ToolName: TOOLS_NAME.TEXT_FIELD,
      getX: () => 0,
      getY: () => 0,
      getWidth: () => 10,
      getHeight: () => 10,
      getPageNumber: () => 1,
      getCustomData: (key: string) => {
        if (key === 'fieldSessionId') return 'session-1';
        if (key === 'fieldId') return 'field-1';
        return null;
      },
    };

    const mockAnnotation2 = {
      ToolName: 'UnknownTool',
      getX: () => 0,
      getY: () => 0,
      getWidth: () => 10,
      getHeight: () => 10,
      getPageNumber: () => 1,
      getCustomData: (key: string) => {
        if (key === 'fieldSessionId') return 'session-nonexistent';
        if (key === 'fieldId') return 'field-2';
        return null;
      },
    };

    const { result } = renderHook(() => useProcessAppliedFormFields());
    
    await act(async () => {
      await result.current.handleProcessAppliedFormFields({
        documentId: 'doc-1',
        appliedFormFields: [mockAnnotation1 as any, mockAnnotation2 as any],
      });
    });

    // Only session-1 should be processed
    expect(documentServices.processAppliedFormFields).toHaveBeenCalledWith({
      documentId: 'doc-1',
      predictionFieldDataList: [
        {
          sessionId: 'session-1',
          appliedFormFields: [
            expect.objectContaining({
              fieldId: 'field-1',
            }),
          ],
          predictions: [{ fieldId: 'p1' }],
        },
      ],
    });
  });

  it('should access predictionData from state via selector (line 18)', () => {
    const mockState = {
      predictionData: mockPredictionData,
      removeAllData: mockRemoveAllData,
    };

    // Mock useFormFieldDetectionStore to accept a selector function
    (useFormFieldDetectionStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(mockState);
      }
      return {
        predictionData: mockPredictionData,
        removeAllData: mockRemoveAllData,
      };
    });

    const { result } = renderHook(() => useProcessAppliedFormFields());

    // Verify that useShallow was called with a selector function
    expect(mockUseShallow).toHaveBeenCalled();
    const selectorFn = mockUseShallow.mock.calls[0][0];
    expect(selectorFn).toBeInstanceOf(Function);

    // Verify that the selector accesses state.predictionData (line 18)
    const selectedData = selectorFn(mockState);
    expect(selectedData).toHaveProperty('predictionData');
    expect(selectedData.predictionData).toEqual(mockPredictionData);
  });

  it('should skip session when predictionData value is empty (line 72)', async () => {
    const mockPredictionDataWithEmptyValue: Record<string, any[]> = {
      'session-1': [{ fieldId: 'p1' }],
      'session-2': [], // Empty array
    };

    (useFormFieldDetectionStore as unknown as jest.Mock).mockReturnValue({
      predictionData: mockPredictionDataWithEmptyValue,
      removeAllData: mockRemoveAllData,
    });

    const mockAnnotation = {
      ToolName: TOOLS_NAME.TEXT_FIELD,
      getX: () => 0,
      getY: () => 0,
      getWidth: () => 10,
      getHeight: () => 10,
      getPageNumber: () => 1,
      getCustomData: (key: string) => {
        if (key === 'fieldSessionId') return 'session-1';
        if (key === 'fieldId') return 'field-1';
        return null;
      },
    };

    const { result } = renderHook(() => useProcessAppliedFormFields());

    await act(async () => {
      await result.current.handleProcessAppliedFormFields({
        documentId: 'doc-1',
        appliedFormFields: [mockAnnotation as any],
      });
    });

    // session-2 should be skipped because its value is empty
    expect(documentServices.processAppliedFormFields).toHaveBeenCalledWith({
      documentId: 'doc-1',
      predictionFieldDataList: [
        {
          sessionId: 'session-1',
          appliedFormFields: [
            expect.objectContaining({
              fieldId: 'field-1',
            }),
          ],
          predictions: [{ fieldId: 'p1' }],
        },
      ],
    });
  });

  it('should skip session when appliedFormFieldsData is empty for that session (line 72)', async () => {
    const mockPredictionDataWithMultipleSessions = {
      'session-1': [{ fieldId: 'p1' }],
      'session-2': [{ fieldId: 'p2' }], // Has prediction data but no applied fields
    };

    (useFormFieldDetectionStore as unknown as jest.Mock).mockReturnValue({
      predictionData: mockPredictionDataWithMultipleSessions,
      removeAllData: mockRemoveAllData,
    });

    // Only create annotation for session-1, not session-2
    const mockAnnotation = {
      ToolName: TOOLS_NAME.TEXT_FIELD,
      getX: () => 0,
      getY: () => 0,
      getWidth: () => 10,
      getHeight: () => 10,
      getPageNumber: () => 1,
      getCustomData: (key: string) => {
        if (key === 'fieldSessionId') return 'session-1';
        if (key === 'fieldId') return 'field-1';
        return null;
      },
    };

    const { result } = renderHook(() => useProcessAppliedFormFields());

    await act(async () => {
      await result.current.handleProcessAppliedFormFields({
        documentId: 'doc-1',
        appliedFormFields: [mockAnnotation as any],
      });
    });

    // session-2 should be skipped because appliedFormFieldsData['session-2'] is empty
    expect(documentServices.processAppliedFormFields).toHaveBeenCalledWith({
      documentId: 'doc-1',
      predictionFieldDataList: [
        {
          sessionId: 'session-1',
          appliedFormFields: [
            expect.objectContaining({
              fieldId: 'field-1',
            }),
          ],
          predictions: [{ fieldId: 'p1' }],
        },
      ],
    });
  });

  it('should handle error thrown during processing and log it (line 91)', async () => {
    const mockError = new Error('Unexpected error during processing');
    
    // Make getCustomData throw an error to trigger the catch block
    const mockAnnotation = {
      ToolName: TOOLS_NAME.TEXT_FIELD,
      getX: () => 0,
      getY: () => 0,
      getWidth: () => 10,
      getHeight: () => 10,
      getPageNumber: () => 1,
      getCustomData: (key: string) => {
        if (key === 'fieldSessionId') {
          throw mockError;
        }
        if (key === 'fieldId') return 'field-1';
        return null;
      },
    };

    const { result } = renderHook(() => useProcessAppliedFormFields());

    await act(async () => {
      await result.current.handleProcessAppliedFormFields({
        documentId: 'doc-1',
        appliedFormFields: [mockAnnotation as any],
      });
    });

    // Verify error is logged (line 91)
    expect(logger.logError).toHaveBeenCalledWith({
      message: 'Failed to processAppliedFormFields',
      error: mockError,
    });
    expect(mockRemoveAllData).toHaveBeenCalled();
  });
});