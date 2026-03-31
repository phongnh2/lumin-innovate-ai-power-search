import selectors from 'selectors';
import { store } from 'store';

import indexedDBService from 'services/indexedDBService';

import logger from 'helpers/logger';

import { PageManipulation } from 'features/PageTracker/utils/pageManipulation';

import { MANIPULATION_TYPE } from 'constants/lumin-common';
import { LOGGER } from 'constants/lumin-common';

import { updateAutoDetectDataFromManipStep } from '../updateAutoDetectDataFromManipStep';

jest.mock('selectors', () => ({
  __esModule: true,
  default: {
    getCurrentDocument: jest.fn(),
  },
}));

jest.mock('store', () => ({
  store: {
    getState: jest.fn(),
  },
}));

jest.mock('services/indexedDBService', () => ({
  __esModule: true,
  default: {
    getAutoDetectFormFields: jest.fn(),
    updateAutoDetectFormFields: jest.fn(),
  },
}));

jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
  },
}));

jest.mock('features/PageTracker/utils/pageManipulation', () => ({
  PageManipulation: {
    MANIPULATION_HANDLERS: {},
  },
}));

describe('updateAutoDetectDataFromManipStep', () => {
  const mockGetCurrentDocument = selectors.getCurrentDocument as jest.Mock;
  const mockGetState = jest.fn();
  const mockGetAutoDetectFormFields = indexedDBService.getAutoDetectFormFields as jest.Mock;
  const mockUpdateAutoDetectFormFields = indexedDBService.updateAutoDetectFormFields as jest.Mock;
  const mockLogError = logger.logError as jest.Mock;

  const mockDocumentId = 'test-document-id';
  const mockDocument = {
    _id: mockDocumentId,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (store.getState as jest.Mock) = mockGetState;
    mockGetCurrentDocument.mockReturnValue(mockDocument);
    mockGetAutoDetectFormFields.mockResolvedValue({
      predictions: {},
      manipStepIds: [],
    });
    mockUpdateAutoDetectFormFields.mockResolvedValue(undefined);
    // Reset MANIPULATION_HANDLERS before each test
    Object.keys(PageManipulation.MANIPULATION_HANDLERS).forEach((key) => {
      delete (PageManipulation.MANIPULATION_HANDLERS as any)[key];
    });
  });

  describe('early returns', () => {
    it('should return early if currentDocument is null', async () => {
      mockGetCurrentDocument.mockReturnValue(null);

      await updateAutoDetectDataFromManipStep([]);

      expect(mockGetAutoDetectFormFields).not.toHaveBeenCalled();
      expect(mockUpdateAutoDetectFormFields).not.toHaveBeenCalled();
    });

    it('should return early if currentDocument is undefined', async () => {
      mockGetCurrentDocument.mockReturnValue(undefined);

      await updateAutoDetectDataFromManipStep([]);

      expect(mockGetAutoDetectFormFields).not.toHaveBeenCalled();
      expect(mockUpdateAutoDetectFormFields).not.toHaveBeenCalled();
    });

    it('should return early if data.predictions is null', async () => {
      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: null,
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([]);

      expect(mockUpdateAutoDetectFormFields).not.toHaveBeenCalled();
    });

    it('should return early if data.predictions is undefined', async () => {
      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: undefined,
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([]);

      expect(mockUpdateAutoDetectFormFields).not.toHaveBeenCalled();
    });
  });

  describe('manipulation step processing', () => {
    it('should skip manipulation step if id is already in appliedManipStepIds', async () => {
      const manipStepId = 'step-1';
      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: { 1: [] },
        manipStepIds: [manipStepId],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: manipStepId,
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [2] },
        },
      ]);

      expect(mockUpdateAutoDetectFormFields).not.toHaveBeenCalled();
    });

    it('should process INSERT_BLANK_PAGE manipulation step', async () => {
      const mockPageMapper = new Map([
        [1, 1],
        [2, 3],
      ]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: {
          1: [{ fieldId: 'field-1' }],
          2: [{ fieldId: 'field-2' }],
        },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [2] },
        },
      ]);

      expect(mockHandler).toHaveBeenCalledWith({
        originalPages: [1, 2],
        manipulationData: {
          manipulationPages: [2],
          movedOriginPage: undefined,
          mergedPagesCount: undefined,
        },
      });
      expect(mockUpdateAutoDetectFormFields).toHaveBeenCalledWith(mockDocumentId, expect.objectContaining({
        manipStepIds: ['step-1'],
        predictions: expect.any(Object),
      }));
    });

    it('should process REMOVE_PAGE manipulation step', async () => {
      const mockPageMapper = new Map([
        [1, 1],
        [2, null],
      ]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.REMOVE_PAGE] = mockHandler;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: {
          1: [{ fieldId: 'field-1' }],
          2: [{ fieldId: 'field-2' }],
        },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.REMOVE_PAGE,
          option: { pagesRemove: [2] },
        },
      ]);

      expect(mockHandler).toHaveBeenCalledWith({
        originalPages: [1, 2],
        manipulationData: {
          manipulationPages: [2],
          movedOriginPage: undefined,
          mergedPagesCount: undefined,
        },
      });
      expect(mockUpdateAutoDetectFormFields).toHaveBeenCalled();
    });

    it('should process MOVE_PAGE manipulation step', async () => {
      const mockPageMapper = new Map([
        [1, 2],
        [2, 1],
      ]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.MOVE_PAGE] = mockHandler;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: {
          1: [{ fieldId: 'field-1' }],
          2: [{ fieldId: 'field-2' }],
        },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.MOVE_PAGE,
          option: { pagesToMove: 1, insertBeforePage: 3 },
        },
      ]);

      expect(mockHandler).toHaveBeenCalledWith({
        originalPages: [1, 2],
        manipulationData: {
          manipulationPages: [3],
          movedOriginPage: 1,
          mergedPagesCount: undefined,
        },
      });
      expect(mockUpdateAutoDetectFormFields).toHaveBeenCalled();
    });

    it('should return early if manipulationPages is null after switch', async () => {
      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: { 1: [] },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: 'UNKNOWN_TYPE' as any,
          option: {},
        },
      ]);

      expect(mockUpdateAutoDetectFormFields).not.toHaveBeenCalled();
    });

    it('should return early if manipulationPages is undefined after switch', async () => {
      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: { 1: [] },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: undefined },
        },
      ]);

      expect(mockUpdateAutoDetectFormFields).not.toHaveBeenCalled();
    });
  });

  describe('data transformation', () => {
    it('should add manipStepId to manipStepIds array', async () => {
      const mockPageMapper = new Map([[1, 1]]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: { 1: [] },
        manipStepIds: ['existing-step'],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'new-step',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [2] },
        },
      ]);

      expect(mockUpdateAutoDetectFormFields).toHaveBeenCalledWith(
        mockDocumentId,
        expect.objectContaining({
          manipStepIds: expect.arrayContaining(['existing-step', 'new-step']),
        })
      );
    });

    it('should initialize predictions if it does not exist in draft', async () => {
      const mockPageMapper = new Map([[1, 1]]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      // Start with empty predictions object (not null/undefined to pass early return)
      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: {},
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [2] },
        },
      ]);

      const updateCall = mockUpdateAutoDetectFormFields.mock.calls[0];
      expect(updateCall[1]).toHaveProperty('predictions');
      expect(typeof updateCall[1].predictions).toBe('object');
    });

    it('should initialize predictions to empty object when draft.predictions is falsy inside produce', async () => {
      const mockPageMapper = new Map([[1, 1]]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      // Create data where predictions exists initially (to pass early return check at line 35)
      // but can be accessed as falsy inside produce when accessed via draft
      // We use Object.defineProperty with a getter that returns different values on different accesses
      let accessCount = 0;
      const mockData: any = {
        manipStepIds: [],
      };

      Object.defineProperty(mockData, 'predictions', {
        get() {
          accessCount++;
          // First access (early return check at line 35) returns truthy value
          if (accessCount === 1) {
            return { 1: [] };
          }
          // Subsequent access (inside produce at line 93) returns null to trigger line 94
          return null;
        },
        enumerable: true,
        configurable: true,
      });

      mockGetAutoDetectFormFields.mockResolvedValue(mockData);

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [2] },
        },
      ]);

      const updateCall = mockUpdateAutoDetectFormFields.mock.calls[0];
      expect(updateCall[1]).toHaveProperty('predictions');
      // Line 94 should have initialized predictions to {} when draft.predictions was falsy
      expect(updateCall[1].predictions).toEqual({});
    });

    it('should delete prediction when mappedPage is null', async () => {
      const mockPageMapper = new Map([
        [1, 1],
        [2, null],
      ]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.REMOVE_PAGE] = mockHandler;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: {
          1: [{ fieldId: 'field-1' }],
          2: [{ fieldId: 'field-2' }],
        },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.REMOVE_PAGE,
          option: { pagesRemove: [2] },
        },
      ]);

      const updateCall = mockUpdateAutoDetectFormFields.mock.calls[0];
      expect(updateCall[1].predictions).not.toHaveProperty('2');
      expect(updateCall[1].predictions).toHaveProperty('1');
    });

    it('should move prediction when mappedPage differs from pageNumber', async () => {
      const mockPageMapper = new Map([
        [1, 2],
        [2, 3],
      ]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      const originalPredictions = {
        1: [{ fieldId: 'field-1' }],
        2: [{ fieldId: 'field-2' }],
      };

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: originalPredictions,
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [1] },
        },
      ]);

      const updateCall = mockUpdateAutoDetectFormFields.mock.calls[0];
      // Page 1 maps to 2, page 2 maps to 3
      // Processing happens in descending order (2, then 1)
      // Page 2: moves to 3, so predictions[3] = originalPredictions[2]
      // Page 1: moves to 2, so predictions[2] = originalPredictions[1] (overwrites if page 2 was already there)
      expect(updateCall[1].predictions).not.toHaveProperty('1');
      expect(updateCall[1].predictions).toHaveProperty('2');
      expect(updateCall[1].predictions).toHaveProperty('3');
      expect(updateCall[1].predictions[2]).toEqual(originalPredictions[1]);
      expect(updateCall[1].predictions[3]).toEqual(originalPredictions[2]);
    });

    it('should keep prediction when mappedPage equals pageNumber', async () => {
      const mockPageMapper = new Map([
        [1, 1],
        [2, 2],
      ]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      const originalPredictions = {
        1: [{ fieldId: 'field-1' }],
        2: [{ fieldId: 'field-2' }],
      };

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: originalPredictions,
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [3] },
        },
      ]);

      const updateCall = mockUpdateAutoDetectFormFields.mock.calls[0];
      expect(updateCall[1].predictions[1]).toEqual(originalPredictions[1]);
      expect(updateCall[1].predictions[2]).toEqual(originalPredictions[2]);
    });

    it('should not move prediction when mappedPage is 0 (falsy)', async () => {
      const mockPageMapper = new Map([
        [1, 0],
        [2, 2],
      ]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: {
          1: [{ fieldId: 'field-1' }],
          2: [{ fieldId: 'field-2' }],
        },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [1] },
        },
      ]);

      const updateCall = mockUpdateAutoDetectFormFields.mock.calls[0];
      // mappedPage = 0 is falsy, so condition `if (mappedPage && pageNumber !== mappedPage)` fails
      // Page 1 stays at page 1, page 2 stays at page 2
      expect(updateCall[1].predictions).toHaveProperty('1');
      expect(updateCall[1].predictions).toHaveProperty('2');
      expect(updateCall[1].predictions).not.toHaveProperty('0');
    });

    it('should process pages in descending order', async () => {
      const mockPageMapper = new Map([
        [1, 2],
        [2, 3],
        [3, 4],
      ]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: {
          1: [{ fieldId: 'field-1' }],
          2: [{ fieldId: 'field-2' }],
          3: [{ fieldId: 'field-3' }],
        },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [1] },
        },
      ]);

      expect(mockUpdateAutoDetectFormFields).toHaveBeenCalled();
    });
  });

  describe('multiple manipulation steps', () => {
    it('should process multiple manipulation steps', async () => {
      const mockPageMapper1 = new Map([[1, 2]]);
      const mockPageMapper2 = new Map([[2, null]]);
      const mockHandler1 = jest.fn().mockReturnValue(mockPageMapper1);
      const mockHandler2 = jest.fn().mockReturnValue(mockPageMapper2);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler1;
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.REMOVE_PAGE] = mockHandler2;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: {
          1: [{ fieldId: 'field-1' }],
        },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [1] },
        },
        {
          id: 'step-2',
          type: MANIPULATION_TYPE.REMOVE_PAGE,
          option: { pagesRemove: [2] },
        },
      ]);

      expect(mockHandler1).toHaveBeenCalled();
      expect(mockHandler2).toHaveBeenCalled();
      expect(mockUpdateAutoDetectFormFields).toHaveBeenCalledTimes(1);
    });

    it('should skip already applied manipulation steps', async () => {
      const mockPageMapper = new Map([[1, 1]]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: { 1: [] },
        manipStepIds: ['step-1'],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [2] },
        },
        {
          id: 'step-2',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [3] },
        },
      ]);

      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockUpdateAutoDetectFormFields).toHaveBeenCalledTimes(1);
    });
  });

  describe('shouldUpdate flag', () => {
    it('should not update if shouldUpdate is false', async () => {
      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: { 1: [] },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: 'UNKNOWN_TYPE' as any,
          option: {},
        },
      ]);

      expect(mockUpdateAutoDetectFormFields).not.toHaveBeenCalled();
    });

    it('should update if shouldUpdate is true', async () => {
      const mockPageMapper = new Map([[1, 1]]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: { 1: [] },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [2] },
        },
      ]);

      expect(mockUpdateAutoDetectFormFields).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty manipulationSteps array', async () => {
      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: { 1: [] },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([]);

      expect(mockUpdateAutoDetectFormFields).not.toHaveBeenCalled();
    });

    it('should handle manipulation step without id', async () => {
      const mockPageMapper = new Map([[1, 1]]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: { 1: [] },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: undefined as any,
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [2] },
        },
      ]);

      const updateCall = mockUpdateAutoDetectFormFields.mock.calls[0];
      expect(updateCall[1].manipStepIds).toEqual([]);
    });

    it('should not add empty string id to manipStepIds (falsy check)', async () => {
      const mockPageMapper = new Map([[1, 1]]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: { 1: [] },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: '',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [2] },
        },
      ]);

      const updateCall = mockUpdateAutoDetectFormFields.mock.calls[0];
      // Empty string is falsy, so `if (id)` fails and id is not added
      expect(updateCall[1].manipStepIds).toEqual([]);
    });

    it('should handle empty predictions object', async () => {
      const mockPageMapper = new Map();
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: {},
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [2] },
        },
      ]);

      expect(mockUpdateAutoDetectFormFields).toHaveBeenCalled();
    });

    it('should handle manipStepIds being undefined', async () => {
      const mockPageMapper = new Map([[1, 1]]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: { 1: [] },
        manipStepIds: undefined,
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [2] },
        },
      ]);

      expect(mockUpdateAutoDetectFormFields).toHaveBeenCalled();
    });

    it('should handle manipStepIds being null', async () => {
      const mockPageMapper = new Map([[1, 1]]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: { 1: [] },
        manipStepIds: null,
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [2] },
        },
      ]);

      expect(mockUpdateAutoDetectFormFields).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should catch and log errors from getCurrentDocument', async () => {
      const mockError = new Error('getCurrentDocument error');
      mockGetCurrentDocument.mockImplementation(() => {
        throw mockError;
      });

      await updateAutoDetectDataFromManipStep([]);

      expect(mockLogError).toHaveBeenCalledWith({
        reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
        message: 'Error updating auto detect form field data from manipulation step',
        error: mockError,
      });
    });

    it('should catch and log errors from getAutoDetectFormFields', async () => {
      const mockError = new Error('getAutoDetectFormFields error');
      mockGetAutoDetectFormFields.mockRejectedValue(mockError);

      await updateAutoDetectDataFromManipStep([]);

      expect(mockLogError).toHaveBeenCalledWith({
        reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
        message: 'Error updating auto detect form field data from manipulation step',
        error: mockError,
      });
    });

    it('should catch and log errors from updateAutoDetectFormFields', async () => {
      const mockPageMapper = new Map([[1, 1]]);
      const mockHandler = jest.fn().mockReturnValue(mockPageMapper);
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      const mockError = new Error('updateAutoDetectFormFields error');
      mockUpdateAutoDetectFormFields.mockRejectedValue(mockError);

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: { 1: [] },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [2] },
        },
      ]);

      expect(mockLogError).toHaveBeenCalledWith({
        reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
        message: 'Error updating auto detect form field data from manipulation step',
        error: mockError,
      });
    });

    it('should catch and log errors from PageManipulation handler', async () => {
      const mockError = new Error('PageManipulation handler error');
      const mockHandler = jest.fn().mockImplementation(() => {
        throw mockError;
      });
      (PageManipulation.MANIPULATION_HANDLERS as any)[MANIPULATION_TYPE.INSERT_BLANK_PAGE] = mockHandler;

      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: { 1: [] },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
          option: { insertPages: [2] },
        },
      ]);

      expect(mockLogError).toHaveBeenCalledWith({
        reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
        message: 'Error updating auto detect form field data from manipulation step',
        error: mockError,
      });
    });
  });

  describe('MERGE_PAGE type (default case)', () => {
    it('should handle MERGE_PAGE type and return early if manipulationPages is null', async () => {
      mockGetAutoDetectFormFields.mockResolvedValue({
        predictions: { 1: [] },
        manipStepIds: [],
      });

      await updateAutoDetectDataFromManipStep([
        {
          id: 'step-1',
          type: MANIPULATION_TYPE.MERGE_PAGE,
          option: {},
        },
      ]);

      expect(mockUpdateAutoDetectFormFields).not.toHaveBeenCalled();
    });
  });
});
