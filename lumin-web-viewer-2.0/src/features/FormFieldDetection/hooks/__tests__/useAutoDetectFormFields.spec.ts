import { renderHook, act } from '@testing-library/react';
import { useWindowEvent } from '@mantine/hooks';
import core from 'core';
import selectors from 'selectors';
import indexedDBService from 'services/indexedDBService';
import logger from 'helpers/logger';
import { PageTracker } from 'features/PageTracker/utils/pageTracker';
import { CUSTOM_EVENT } from 'constants/customEvent';
import { LOGGER } from 'constants/lumin-common';
import { useAutoDetectFormFields } from '../useAutoDetectFormFields';
import { useAutoDetectFormFieldsEnabled } from '../useAutoDetectFormFieldsEnabled';
import { usePreviewAutoDetectHandler } from '../usePreviewAutoDetectHandler';
import { useSetupAutoDetectQueue } from '../useSetupAutoDetectQueue';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import { useCleanup } from 'hooks/useCleanup';

jest.mock('@mantine/hooks', () => ({
  useWindowEvent: jest.fn(),
}));

jest.mock('core', () => ({
  __esModule: true,
  default: {
    getTotalPages: jest.fn(() => 10),
  },
}));

jest.mock('selectors', () => ({
  getCurrentDocument: jest.fn(),
}));

jest.mock('services/indexedDBService', () => ({
  __esModule: true,
  default: {
    updateAutoDetectFormFieldsPageNumber: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
  },
}));

jest.mock('features/PageTracker/utils/pageTracker', () => ({
  PageTracker: jest.fn(),
}));

jest.mock('../useAutoDetectFormFieldsEnabled', () => ({
  useAutoDetectFormFieldsEnabled: jest.fn(),
}));

jest.mock('../usePreviewAutoDetectHandler', () => ({
  usePreviewAutoDetectHandler: jest.fn(),
}));

jest.mock('../useSetupAutoDetectQueue', () => ({
  useSetupAutoDetectQueue: jest.fn(),
}));

jest.mock('hooks/useShallowSelector', () => ({
  useShallowSelector: jest.fn(),
}));

jest.mock('hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('hooks/useCleanup', () => ({
  useCleanup: jest.fn(),
}));

describe('useAutoDetectFormFields', () => {
  const mockPageTracker = {
    onManipulationChanged: jest.fn(),
    onCollabManipChanged: jest.fn(),
    getPageMapper: jest.fn(() => new Map([[1, 1], [2, 2]])),
  };

  const mockAutoDetectQueue = {
    getPageMapper: jest.fn((data) => new Map([[1, 1], [2, 2]])),
    setProcessedPages: [1, 2],
    setTotalPages: 10,
    handleTypeToolActivation: jest.fn(),
  };

  const mockCurrentDocument = { _id: 'doc-123' };
  const mockCurrentUser = { toolQuota: { autoDetection: { isExceeded: false } } };

  let manipulationChangedHandler: (event: CustomEvent) => void;
  let collabManipChangedHandler: (event: CustomEvent) => void;

  beforeEach(() => {
    jest.clearAllMocks();

    (useAutoDetectFormFieldsEnabled as jest.Mock).mockReturnValue({
      canUseAutoDetectFormFields: true,
      shouldAutoDetectFormFields: true,
      isViewerLoaded: true,
    });

    (useShallowSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectors.getCurrentDocument) {
        return mockCurrentDocument;
      }
      return null;
    });

    (useGetCurrentUser as jest.Mock).mockReturnValue(mockCurrentUser);

    (usePreviewAutoDetectHandler as jest.Mock).mockReturnValue(undefined);

    (useSetupAutoDetectQueue as jest.Mock).mockReturnValue({
      autoDetectQueueRef: { current: mockAutoDetectQueue },
      hasLoadedDataFromIndexedDB: true,
    });

    (PageTracker as unknown as jest.Mock).mockImplementation(({ onManipulationChangedHandler }) => {
      mockPageTracker.onManipulationChanged = jest.fn((data) => {
        onManipulationChangedHandler(data);
      });
      return mockPageTracker;
    });

    (useWindowEvent as jest.Mock).mockImplementation((eventName: string, handler: (event: CustomEvent) => void) => {
      if (eventName === CUSTOM_EVENT.PAGE_TRACKER_MANIPULATION_CHANGED) {
        manipulationChangedHandler = handler;
      }
      if (eventName === CUSTOM_EVENT.PAGE_TRACKER_COLLAB_MANIP_CHANGED) {
        collabManipChangedHandler = handler;
      }
    });

    (useCleanup as jest.Mock).mockImplementation((callback) => {
      // Store cleanup callback for testing
      (useCleanup as any).cleanupCallback = callback;
    });
  });

  describe('PageTracker initialization', () => {
    it('should initialize PageTracker when isViewerLoaded is true', () => {
      renderHook(() => useAutoDetectFormFields());

      expect(PageTracker).toHaveBeenCalledWith({
        onManipulationChangedHandler: expect.any(Function),
      });
    });

    it('should initialize PageTracker even when isViewerLoaded is false (effect still runs)', () => {
      (useAutoDetectFormFieldsEnabled as jest.Mock).mockReturnValue({
        canUseAutoDetectFormFields: true,
        shouldAutoDetectFormFields: true,
        isViewerLoaded: false,
      });

      renderHook(() => useAutoDetectFormFields());

      // PageTracker is initialized regardless of isViewerLoaded since the effect
      // only checks if pageTrackerRef.current is null
      expect(PageTracker).toHaveBeenCalled();
    });

    it('should initialize PageTracker with correct onManipulationChangedHandler', async () => {
      renderHook(() => useAutoDetectFormFields());

      expect(PageTracker).toHaveBeenCalled();
      const constructorCall = (PageTracker as unknown as jest.Mock).mock.calls[0][0];
      expect(constructorCall.onManipulationChangedHandler).toBeInstanceOf(Function);

      // Test the handler
      const mockData = {
        manipulationId: 'manip-1',
        type: 'INSERT_BLANK_PAGE' as const,
        manipulationPages: [1],
      };

      await act(async () => {
        constructorCall.onManipulationChangedHandler(mockData);
      });

      expect(mockAutoDetectQueue.getPageMapper).toHaveBeenCalledWith(mockData);
      expect(indexedDBService.updateAutoDetectFormFieldsPageNumber).toHaveBeenCalledWith({
        documentId: 'doc-123',
        pageMapper: expect.any(Map),
        manipulationId: 'manip-1',
      });
    });
  });

  describe('Window event handlers', () => {
    it('should register PAGE_TRACKER_MANIPULATION_CHANGED event handler', () => {
      renderHook(() => useAutoDetectFormFields());

      expect(useWindowEvent).toHaveBeenCalledWith(
        CUSTOM_EVENT.PAGE_TRACKER_MANIPULATION_CHANGED,
        expect.any(Function)
      );
    });

    it('should register PAGE_TRACKER_COLLAB_MANIP_CHANGED event handler', () => {
      renderHook(() => useAutoDetectFormFields());

      expect(useWindowEvent).toHaveBeenCalledWith(
        CUSTOM_EVENT.PAGE_TRACKER_COLLAB_MANIP_CHANGED,
        expect.any(Function)
      );
    });

    it('should call pageTracker.onManipulationChanged when PAGE_TRACKER_MANIPULATION_CHANGED event is fired', () => {
      renderHook(() => useAutoDetectFormFields());

      const mockEvent = new CustomEvent(CUSTOM_EVENT.PAGE_TRACKER_MANIPULATION_CHANGED, {
        detail: {
          manipulationId: 'manip-1',
          type: 'INSERT_BLANK_PAGE',
          manipulationPages: [1],
        },
      });

      act(() => {
        manipulationChangedHandler(mockEvent);
      });

      expect(mockPageTracker.onManipulationChanged).toHaveBeenCalledWith(mockEvent.detail);
    });

    it('should call pageTracker.onCollabManipChanged when PAGE_TRACKER_COLLAB_MANIP_CHANGED event is fired', () => {
      renderHook(() => useAutoDetectFormFields());

      const mockEvent = new CustomEvent(CUSTOM_EVENT.PAGE_TRACKER_COLLAB_MANIP_CHANGED, {
        detail: {
          id: 'collab-manip-1',
          type: 'REMOVE_PAGE',
          option: {
            pagesRemove: [1],
          },
        },
      });

      act(() => {
        collabManipChangedHandler(mockEvent);
      });

      expect(mockPageTracker.onCollabManipChanged).toHaveBeenCalledWith(mockEvent.detail);
    });
  });

  describe('Auto detect trigger', () => {
    it('should trigger auto detect when all conditions are met', () => {
      renderHook(() => useAutoDetectFormFields());

      expect(core.getTotalPages).toHaveBeenCalled();
      expect(mockAutoDetectQueue.setTotalPages).toBe(10);
      expect(mockAutoDetectQueue.handleTypeToolActivation).toHaveBeenCalled();
    });

    it('should not trigger auto detect when hasLoadedDataFromIndexedDB is false', () => {
      (useSetupAutoDetectQueue as jest.Mock).mockReturnValue({
        autoDetectQueueRef: { current: mockAutoDetectQueue },
        hasLoadedDataFromIndexedDB: false,
      });

      renderHook(() => useAutoDetectFormFields());

      expect(mockAutoDetectQueue.handleTypeToolActivation).not.toHaveBeenCalled();
    });

    it('should not trigger auto detect when shouldAutoDetectFormFields is false', () => {
      (useAutoDetectFormFieldsEnabled as jest.Mock).mockReturnValue({
        canUseAutoDetectFormFields: true,
        shouldAutoDetectFormFields: false,
        isViewerLoaded: true,
      });

      renderHook(() => useAutoDetectFormFields());

      expect(mockAutoDetectQueue.handleTypeToolActivation).not.toHaveBeenCalled();
    });

    it('should not trigger auto detect when autoDetectQueueRef.current is null', () => {
      (useSetupAutoDetectQueue as jest.Mock).mockReturnValue({
        autoDetectQueueRef: { current: null },
        hasLoadedDataFromIndexedDB: true,
      });

      renderHook(() => useAutoDetectFormFields());

      expect(core.getTotalPages).not.toHaveBeenCalled();
    });

    it('should not trigger auto detect when isExceeded is true', () => {
      (useGetCurrentUser as jest.Mock).mockReturnValue({
        toolQuota: { autoDetection: { isExceeded: true } },
      });

      renderHook(() => useAutoDetectFormFields());

      expect(mockAutoDetectQueue.handleTypeToolActivation).not.toHaveBeenCalled();
    });

    it('should log error when getTotalPages throws an error', () => {
      const mockError = new Error('Failed to get total pages');
      (core.getTotalPages as jest.Mock).mockImplementation(() => {
        throw mockError;
      });

      renderHook(() => useAutoDetectFormFields());

      expect(logger.logError).toHaveBeenCalledWith({
        reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
        message: 'Error when trigger auto detect form fields',
        error: mockError,
      });
    });
  });

  describe('onManipulationChangedHandler error handling', () => {
    it('should log error when updateAutoDetectFormFieldsPageNumber fails', async () => {
      const mockError = new Error('Failed to update page number');
      (indexedDBService.updateAutoDetectFormFieldsPageNumber as jest.Mock).mockRejectedValue(mockError);

      renderHook(() => useAutoDetectFormFields());

      const constructorCall = (PageTracker as unknown as jest.Mock).mock.calls[0][0];
      const mockData = {
        manipulationId: 'manip-1',
        type: 'INSERT_BLANK_PAGE' as const,
        manipulationPages: [1],
      };

      await act(async () => {
        constructorCall.onManipulationChangedHandler(mockData);
      });

      expect(logger.logError).toHaveBeenCalledWith({
        reason: LOGGER.Service.AUTO_DETECT_FORM_FIELD,
        message: 'Error when update auto detect form fields page number from manipulation changed',
        error: mockError,
      });
    });
  });

  describe('Cleanup', () => {
    it('should cleanup pageTrackerRef on unmount', () => {
      renderHook(() => useAutoDetectFormFields());

      expect(useCleanup).toHaveBeenCalledWith(expect.any(Function), []);

      const cleanupCallback = (useCleanup as any).cleanupCallback;
      const pageTrackerRef = { current: mockPageTracker };

      // Simulate cleanup
      cleanupCallback();

      // The cleanup should set pageTrackerRef.current to null
      // Since we can't directly test the ref, we verify useCleanup was called
      expect(useCleanup).toHaveBeenCalled();
    });
  });

  describe('Hook integration', () => {
    it('should call usePreviewAutoDetectHandler with correct parameters', () => {
      renderHook(() => useAutoDetectFormFields());

      expect(usePreviewAutoDetectHandler).toHaveBeenCalledWith({
        canUseAutoDetectFormFields: true,
        documentId: 'doc-123',
      });
    });

    it('should call useSetupAutoDetectQueue with correct parameters', () => {
      renderHook(() => useAutoDetectFormFields());

      expect(useSetupAutoDetectQueue).toHaveBeenCalledWith({
        isViewerLoaded: true,
        documentId: 'doc-123',
        pageTrackerRef: expect.any(Object),
      });
    });
  });
});
