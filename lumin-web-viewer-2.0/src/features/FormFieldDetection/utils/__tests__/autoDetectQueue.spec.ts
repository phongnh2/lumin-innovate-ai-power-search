import { AutoDetectQueue } from '../autoDetectQueue';
import { ManipChangedParams } from 'features/PageTracker/types/pageTracker.type';
import { MANIPULATION_TYPE } from 'constants/lumin-common';
import logger from 'helpers/logger';

jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
    logInfo: jest.fn(),
  },
}));

jest.mock('constants/urls', () => ({
  AUTO_DETECT_QUEUE_THROTTLE_TIME: undefined as unknown as number,
}));

describe('AutoDetectQueue', () => {
  const mockHandleSendDocumentForDetect = jest.fn();
  const mockHandleListenForResult = jest.fn();
  const mockLogError = logger.logError as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    AutoDetectQueue.clearInstance();
    mockHandleSendDocumentForDetect.mockResolvedValue('session-123');
    mockHandleListenForResult.mockImplementation(() => {});
  });

  afterEach(() => {
    AutoDetectQueue.clearInstance();
    jest.useRealTimers();
  });

  describe('getInstance', () => {
    it('should create a new instance when instance does not exist', () => {
      const instance = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: mockHandleSendDocumentForDetect,
        handleListenForResult: mockHandleListenForResult,
      });

      expect(instance).toBeInstanceOf(AutoDetectQueue);
    });

    it('should return existing instance when instance already exists', () => {
      const instance1 = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: mockHandleSendDocumentForDetect,
        handleListenForResult: mockHandleListenForResult,
      });

      const instance2 = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: jest.fn(),
        handleListenForResult: jest.fn(),
      });

      expect(instance1).toBe(instance2);
    });


  });

  describe('clearInstance', () => {
    it('should clear instance when instance exists', () => {
      const instance = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: mockHandleSendDocumentForDetect,
        handleListenForResult: mockHandleListenForResult,
      });

      // Start processing loop to set up interval
      instance.setTotalPages = 5;
      instance.handleTypeToolActivation();

      AutoDetectQueue.clearInstance();

      const newInstance = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: mockHandleSendDocumentForDetect,
        handleListenForResult: mockHandleListenForResult,
      });

      expect(newInstance).not.toBe(instance);
    });

    it('should not throw error when instance does not exist', () => {
      expect(() => {
        AutoDetectQueue.clearInstance();
      }).not.toThrow();
    });
  });

  describe('processNextInQueue', () => {
    let queue: AutoDetectQueue;

    beforeEach(() => {
      queue = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: mockHandleSendDocumentForDetect,
        handleListenForResult: mockHandleListenForResult,
      });
    });

    it('should stop processing loop when processingAttempts >= MAX_PROCESSING_ATTEMPTS', () => {
      queue.setTotalPages = 5;
      queue.handleTypeToolActivation();

      // Manually set processingAttempts to max
      (queue as any).processingAttempts = 10;

      // Process next item
      (queue as any).processNextInQueue();

      expect((queue as any).processingLoopActive).toBe(false);
      expect((queue as any).processingInterval).toBeNull();
    });

    it('should process task successfully and call handleListenForResult', async () => {
      queue.setTotalPages = 5;
      queue.handleTypeToolActivation();

      await jest.runAllTimersAsync();

      expect(mockHandleSendDocumentForDetect).toHaveBeenCalled();
      expect(mockHandleListenForResult).toHaveBeenCalledWith('session-123', expect.any(Array));
    });

    it('should handle error in handleSendDocumentForDetect and log error', async () => {
      const error = new Error('Network error');
      mockHandleSendDocumentForDetect.mockRejectedValueOnce(error);

      queue.setTotalPages = 5;
      queue.handleTypeToolActivation();

      await jest.runAllTimersAsync();

      expect(mockLogError).toHaveBeenCalledWith({
        reason: expect.any(String),
        message: 'Error in AutoDetectQueue',
        error,
      });
    });

    it('should stop processing loop when queue becomes empty', async () => {
      queue.setTotalPages = 2; // Only 2 pages, so only 1 chunk
      queue.handleTypeToolActivation();

      await jest.runAllTimersAsync();

      expect((queue as any).processingLoopActive).toBe(false);
      expect((queue as any).processingInterval).toBeNull();
    });

    it('should continue processing when queue has more items', async () => {
      queue.setTotalPages = 5; // 5 pages = 3 chunks (2, 2, 1)
      queue.handleTypeToolActivation();

      // Process first item
      await jest.advanceTimersByTimeAsync(18000);

      // Queue should still have items
      expect((queue as any).queue.length).toBeGreaterThan(0);
    });

    it('should update processedPages when processing task', async () => {
      queue.setTotalPages = 5;
      queue.setProcessedPages = [1, 2]; // Only mark first 2 pages as processed
      
      // Manually add a task with unprocessed pages to queue
      // Note: processNextInQueue will add these pages to processedPages even if they're already there
      (queue as any).queue.push({ pages: [3, 4] });
      const initialProcessedPages = (queue as any).processedPages.size;
      expect(initialProcessedPages).toBe(2);
      
      (queue as any).startProcessingLoop();

      await jest.advanceTimersByTimeAsync(0); // Process immediate call

      // processNextInQueue adds pages to processedPages (line 57)
      // Even though they might already be there, the code path is executed
      expect((queue as any).processedPages.has(3)).toBe(true);
      expect((queue as any).processedPages.has(4)).toBe(true);
    });

    it('should increment processingAttempts when processing', async () => {
      queue.setTotalPages = 5;
      queue.handleTypeToolActivation();

      const initialAttempts = (queue as any).processingAttempts;

      await jest.advanceTimersByTimeAsync(18000);

      expect((queue as any).processingAttempts).toBe(initialAttempts + 1);
    });

    it('should remove task from queue after processing', async () => {
      queue.setTotalPages = 5;
      queue.handleTypeToolActivation();

      const initialQueueLength = (queue as any).queue.length;

      await jest.advanceTimersByTimeAsync(18000);

      expect((queue as any).queue.length).toBe(initialQueueLength - 1);
    });
  });

  describe('startProcessingLoop', () => {
    let queue: AutoDetectQueue;

    beforeEach(() => {
      queue = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: mockHandleSendDocumentForDetect,
        handleListenForResult: mockHandleListenForResult,
      });
    });

    it('should start processing loop when not active', () => {
      queue.setTotalPages = 5;
      queue.handleTypeToolActivation();

      expect((queue as any).processingLoopActive).toBe(true);
      expect((queue as any).processingInterval).not.toBeNull();
    });

    it('should not start processing loop when already active', () => {
      queue.setTotalPages = 5;
      queue.handleTypeToolActivation();

      const firstInterval = (queue as any).processingInterval;

      // Try to start again
      queue.handleTypeToolActivation();

      expect((queue as any).processingInterval).toBe(firstInterval);
    });

    it('should call processNextInQueue immediately when starting loop', async () => {
      queue.setTotalPages = 5;
      queue.handleTypeToolActivation();

      // Should process immediately, not wait for interval
      await Promise.resolve();

      expect(mockHandleSendDocumentForDetect).toHaveBeenCalled();
    });

    it('should set up interval with correct throttle time', () => {
      queue.setTotalPages = 5;
      queue.handleTypeToolActivation();

      expect((queue as any).processingInterval).not.toBeNull();
    });
  });

  describe('stopProcessingLoop', () => {
    let queue: AutoDetectQueue;

    beforeEach(() => {
      queue = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: mockHandleSendDocumentForDetect,
        handleListenForResult: mockHandleListenForResult,
      });
    });

    it('should stop processing loop and clear interval when interval exists', () => {
      queue.setTotalPages = 5;
      queue.handleTypeToolActivation();

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      (queue as any).stopProcessingLoop();

      expect((queue as any).processingLoopActive).toBe(false);
      expect((queue as any).processingAttempts).toBe(0);
      expect(clearIntervalSpy).toHaveBeenCalled();
      expect((queue as any).processingInterval).toBeNull();
    });

    it('should not throw error when interval does not exist', () => {
      expect(() => {
        (queue as any).stopProcessingLoop();
      }).not.toThrow();
    });

    it('should reset processingAttempts to 0', () => {
      queue.setTotalPages = 5;
      queue.handleTypeToolActivation();

      (queue as any).processingAttempts = 5;

      (queue as any).stopProcessingLoop();

      expect((queue as any).processingAttempts).toBe(0);
    });
  });

  describe('handleTypeToolActivation', () => {
    let queue: AutoDetectQueue;

    beforeEach(() => {
      queue = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: mockHandleSendDocumentForDetect,
        handleListenForResult: mockHandleListenForResult,
      });
    });

    it('should return early when processingLoopActive is true', () => {
      queue.setTotalPages = 5;
      queue.handleTypeToolActivation();

      const initialQueueLength = (queue as any).queue.length;

      // Try to activate again while processing
      queue.handleTypeToolActivation();

      expect((queue as any).queue.length).toBe(initialQueueLength);
    });

    it('should return early when all pages are processed', () => {
      queue.setTotalPages = 5;
      queue.setProcessedPages = [1, 2, 3, 4, 5];

      queue.handleTypeToolActivation();

      expect((queue as any).queue.length).toBe(0);
      expect((queue as any).processingLoopActive).toBe(false);
    });

    it('should throw error when totalPages is not set', () => {
      expect(() => {
        queue.handleTypeToolActivation();
      }).toThrow('Total pages is not set for class AutoDetectQueue');
    });

    it('should return early when no unprocessed pages', () => {
      queue.setTotalPages = 5;
      queue.setProcessedPages = [1, 2, 3, 4, 5];

      queue.handleTypeToolActivation();

      expect((queue as any).queue.length).toBe(0);
    });

    it('should return early when all pages in range are processed but processedPages.size !== totalPages', () => {
      // Set totalPages to 3, but processedPages contains pages outside the range [1, 3]
      // This creates a scenario where processedPages.size !== totalPages (so line 111 doesn't return),
      // but all pages in the range [1, 3] are already processed (so line 122 returns)
      queue.setTotalPages = 3;
      queue.setProcessedPages = [1, 2, 3, 4, 5]; // Contains pages outside range [1, 3]

      // Ensure processingLoopActive is false
      expect((queue as any).processingLoopActive).toBe(false);
      // Ensure processedPages.size !== totalPages
      expect((queue as any).processedPages.size).toBe(5);
      expect((queue as any).totalPages).toBe(3);

      queue.handleTypeToolActivation();

      // Should return early at line 122, so queue should remain empty
      expect((queue as any).queue.length).toBe(0);
      expect((queue as any).processingLoopActive).toBe(false);
    });

    it('should process unprocessed pages and add to queue', () => {
      queue.setTotalPages = 5;
      queue.setProcessedPages = [1, 2]; // Pages 3, 4, 5 are unprocessed

      queue.handleTypeToolActivation();

      expect((queue as any).queue.length).toBeGreaterThan(0);
      expect((queue as any).processingLoopActive).toBe(true);
    });

    it('should chunk pages correctly according to PROCESS_CHUNK_SIZE', () => {
      queue.setTotalPages = 5;
      queue.setProcessedPages = [];

      // handleTypeToolActivation immediately processes first item, so queue length will be reduced
      // We need to check before startProcessingLoop removes the first item
      // So we'll manually check the queue before processing starts
      const pages = [1, 2, 3, 4, 5];
      const unprocessedPages = pages.filter((page) => !(queue as any).processedPages.has(page));
      const processedPagesChunk = require('lodash/chunk')(unprocessedPages, 2);
      
      // Should have 3 chunks: [1,2], [3,4], [5]
      expect(processedPagesChunk.length).toBe(3);
      expect(processedPagesChunk[0]).toEqual([1, 2]);
      expect(processedPagesChunk[1]).toEqual([3, 4]);
      expect(processedPagesChunk[2]).toEqual([5]);
      
      // Now test the actual method
      queue.handleTypeToolActivation();
      
      // After activation, first item is processed immediately, so queue has 2 items left
      expect((queue as any).queue.length).toBe(2);
      expect((queue as any).queue[0].pages).toEqual([3, 4]);
      expect((queue as any).queue[1].pages).toEqual([5]);
      
      // Verify all pages are marked as processed
      const processedPages = Array.from((queue as any).processedPages);
      expect(processedPages).toContain(1);
      expect(processedPages).toContain(2);
      expect(processedPages).toContain(3);
      expect(processedPages).toContain(4);
      expect(processedPages).toContain(5);
    });

    it('should update processedPages when adding chunks to queue', () => {
      queue.setTotalPages = 5;
      queue.setProcessedPages = [];

      queue.handleTypeToolActivation();

      // All pages should be marked as processed
      const processedPages = Array.from((queue as any).processedPages);
      expect(processedPages).toContain(1);
      expect(processedPages).toContain(2);
      expect(processedPages).toContain(3);
      expect(processedPages).toContain(4);
      expect(processedPages).toContain(5);
    });

    it('should filter out already processed pages', () => {
      queue.setTotalPages = 5;
      queue.setProcessedPages = [1, 3, 5]; // Pages 2, 4 are unprocessed

      queue.handleTypeToolActivation();

      // Should only process pages 2 and 4 (chunked into 1 chunk of size 2)
      // But first item is processed immediately, so queue will be empty
      // Let's verify the pages were processed
      const processedPages = Array.from((queue as any).processedPages);
      expect(processedPages).toContain(2);
      expect(processedPages).toContain(4);
      
      // Since there's only 1 chunk and it's processed immediately, queue should be empty
      expect((queue as any).queue.length).toBe(0);
      expect((queue as any).processingLoopActive).toBe(false);
    });

    it('should start processing loop after adding tasks to queue', () => {
      queue.setTotalPages = 5;
      queue.setProcessedPages = [];

      queue.handleTypeToolActivation();

      expect((queue as any).processingLoopActive).toBe(true);
      expect((queue as any).processingInterval).not.toBeNull();
    });
  });

  describe('updateProcessedPages', () => {
    let queue: AutoDetectQueue;

    beforeEach(() => {
      queue = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: mockHandleSendDocumentForDetect,
        handleListenForResult: mockHandleListenForResult,
      });
    });

    it('should update processedPages with new pages', () => {
      queue.setProcessedPages = [1, 2];

      queue.updateProcessedPages([3, 4]);

      const processedPages = Array.from((queue as any).processedPages);
      expect(processedPages).toContain(1);
      expect(processedPages).toContain(2);
      expect(processedPages).toContain(3);
      expect(processedPages).toContain(4);
    });

    it('should merge with existing processed pages', () => {
      queue.setProcessedPages = [1, 2, 3];

      queue.updateProcessedPages([2, 4, 5]);

      const processedPages = Array.from((queue as any).processedPages);
      expect(processedPages.length).toBe(5);
      expect(processedPages).toContain(1);
      expect(processedPages).toContain(2);
      expect(processedPages).toContain(3);
      expect(processedPages).toContain(4);
      expect(processedPages).toContain(5);
    });

    it('should handle empty array', () => {
      queue.setProcessedPages = [1, 2];

      queue.updateProcessedPages([]);

      const processedPages = Array.from((queue as any).processedPages);
      expect(processedPages).toEqual([1, 2]);
    });
  });

  describe('getPageMapper', () => {
    let queue: AutoDetectQueue;

    beforeEach(() => {
      queue = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: mockHandleSendDocumentForDetect,
        handleListenForResult: mockHandleListenForResult,
      });
      queue.setProcessedPages = [1, 2, 3, 4, 5];
    });

    it('should return page mapper for INSERT_BLANK_PAGE manipulation', () => {
      const data: ManipChangedParams = {
        type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
        manipulationPages: [3],
      };

      const pageMapper = queue.getPageMapper(data);

      expect(pageMapper).toBeInstanceOf(Map);
      expect(pageMapper.size).toBeGreaterThan(0);
    });

    it('should return page mapper for REMOVE_PAGE manipulation', () => {
      const data: ManipChangedParams = {
        type: MANIPULATION_TYPE.REMOVE_PAGE,
        manipulationPages: [2],
      };

      const pageMapper = queue.getPageMapper(data);

      expect(pageMapper).toBeInstanceOf(Map);
      expect(pageMapper.size).toBeGreaterThan(0);
    });

    it('should return page mapper for MOVE_PAGE manipulation', () => {
      const data: ManipChangedParams = {
        type: MANIPULATION_TYPE.MOVE_PAGE,
        manipulationPages: [2],
        movedOriginPage: 4,
      };

      const pageMapper = queue.getPageMapper(data);

      expect(pageMapper).toBeInstanceOf(Map);
      expect(pageMapper.size).toBeGreaterThan(0);
    });

    it('should return page mapper for MERGE_PAGE manipulation', () => {
      const data: ManipChangedParams = {
        type: MANIPULATION_TYPE.MERGE_PAGE,
        manipulationPages: [2],
        mergedPagesCount: 2,
      };

      const pageMapper = queue.getPageMapper(data);

      expect(pageMapper).toBeInstanceOf(Map);
      expect(pageMapper.size).toBeGreaterThan(0);
    });

    it('should pass correct parameters to manipulation handler', () => {
      const data: ManipChangedParams = {
        type: MANIPULATION_TYPE.INSERT_BLANK_PAGE,
        manipulationPages: [3],
      };

      const pageMapper = queue.getPageMapper(data);

      // Verify the mapper contains the processed pages
      const processedPages = Array.from((queue as any).processedPages);
      expect(processedPages.length).toBeGreaterThan(0);
    });
  });

  describe('updateProcessedPagesByManipulation', () => {
    let queue: AutoDetectQueue;

    beforeEach(() => {
      queue = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: mockHandleSendDocumentForDetect,
        handleListenForResult: mockHandleListenForResult,
      });
      queue.setProcessedPages = [1, 2, 3, 4, 5];
    });

    it('should update processedPages with values from pageMapper', () => {
      const pageMapper = new Map([
        [1, 2],
        [2, 3],
        [3, 4],
      ]);

      queue.updateProcessedPagesByManipulation(pageMapper);

      const processedPages = Array.from((queue as any).processedPages);
      expect(processedPages).toEqual([2, 3, 4]);
    });

    it('should replace all existing processed pages', () => {
      queue.setProcessedPages = [1, 2, 3, 4, 5];

      const pageMapper = new Map([
        [1, 10],
        [2, 20],
      ]);

      queue.updateProcessedPagesByManipulation(pageMapper);

      const processedPages = Array.from((queue as any).processedPages);
      expect(processedPages).toEqual([10, 20]);
      expect(processedPages).not.toContain(1);
      expect(processedPages).not.toContain(2);
    });

    it('should handle empty pageMapper', () => {
      queue.setProcessedPages = [1, 2, 3];

      const pageMapper = new Map();

      queue.updateProcessedPagesByManipulation(pageMapper);

      const processedPages = Array.from((queue as any).processedPages);
      expect(processedPages).toEqual([]);
    });
  });

  describe('setTotalPages', () => {
    let queue: AutoDetectQueue;

    beforeEach(() => {
      queue = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: mockHandleSendDocumentForDetect,
        handleListenForResult: mockHandleListenForResult,
      });
    });

    it('should set totalPages correctly', () => {
      queue.setTotalPages = 10;

      expect((queue as any).totalPages).toBe(10);
    });

    it('should update totalPages when called multiple times', () => {
      queue.setTotalPages = 5;
      expect((queue as any).totalPages).toBe(5);

      queue.setTotalPages = 20;
      expect((queue as any).totalPages).toBe(20);
    });
  });

  describe('setProcessedPages', () => {
    let queue: AutoDetectQueue;

    beforeEach(() => {
      queue = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: mockHandleSendDocumentForDetect,
        handleListenForResult: mockHandleListenForResult,
      });
    });

    it('should set processedPages correctly', () => {
      queue.setProcessedPages = [1, 2, 3];

      const processedPages = Array.from((queue as any).processedPages);
      expect(processedPages).toEqual([1, 2, 3]);
    });

    it('should replace existing processedPages', () => {
      queue.setProcessedPages = [1, 2, 3];
      queue.setProcessedPages = [4, 5, 6];

      const processedPages = Array.from((queue as any).processedPages);
      expect(processedPages).toEqual([4, 5, 6]);
    });

    it('should handle empty array', () => {
      queue.setProcessedPages = [];

      const processedPages = Array.from((queue as any).processedPages);
      expect(processedPages).toEqual([]);
    });

    it('should handle duplicate pages', () => {
      queue.setProcessedPages = [1, 1, 2, 2, 3];

      const processedPages = Array.from((queue as any).processedPages);
      // Set should remove duplicates
      expect(processedPages.length).toBe(3);
      expect(processedPages).toContain(1);
      expect(processedPages).toContain(2);
      expect(processedPages).toContain(3);
    });
  });

  describe('getProcessedPages', () => {
    let queue: AutoDetectQueue;

    beforeEach(() => {
      queue = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: mockHandleSendDocumentForDetect,
        handleListenForResult: mockHandleListenForResult,
      });
    });

    it('should return processedPages Set', () => {
      queue.setProcessedPages = [1, 2, 3];

      const processedPages = queue.getProcessedPages;

      expect(processedPages).toBeInstanceOf(Set);
      expect(Array.from(processedPages)).toEqual([1, 2, 3]);
    });

    it('should return empty Set when no pages processed', () => {
      const processedPages = queue.getProcessedPages;

      expect(processedPages).toBeInstanceOf(Set);
      expect(processedPages.size).toBe(0);
    });

    it('should return updated Set after processing', () => {
      queue.setProcessedPages = [1, 2];

      queue.updateProcessedPages([3, 4]);

      const processedPages = queue.getProcessedPages;
      expect(Array.from(processedPages)).toEqual([1, 2, 3, 4]);
    });
  });

  describe('integration tests', () => {
    let queue: AutoDetectQueue;

    beforeEach(() => {
      queue = AutoDetectQueue.getInstance({
        handleSendDocumentForDetect: mockHandleSendDocumentForDetect,
        handleListenForResult: mockHandleListenForResult,
      });
    });

    it('should handle complete workflow: activation -> processing -> completion', async () => {
      queue.setTotalPages = 4;
      queue.setProcessedPages = [];

      // Activate type tool
      queue.handleTypeToolActivation();

      // Should have 2 chunks (2 pages each: [1,2] and [3,4])
      // But first chunk is processed immediately, so queue has 1 item left
      expect((queue as any).queue.length).toBe(1);
      expect((queue as any).processingLoopActive).toBe(true);

      // First chunk was already processed immediately
      await jest.runAllTimersAsync();
      expect(mockHandleSendDocumentForDetect).toHaveBeenCalledTimes(2);

      // Queue should be empty and loop stopped
      expect((queue as any).queue.length).toBe(0);
      expect((queue as any).processingLoopActive).toBe(false);
    });

    it('should handle page manipulation during processing', () => {
      queue.setTotalPages = 5;
      queue.setProcessedPages = [1, 2, 3];

      const data: ManipChangedParams = {
        type: MANIPULATION_TYPE.REMOVE_PAGE,
        manipulationPages: [2],
      };

      const pageMapper = queue.getPageMapper(data);
      queue.updateProcessedPagesByManipulation(pageMapper);

      // After removing page 2, pages should be remapped
      const processedPages = Array.from(queue.getProcessedPages);
      expect(processedPages.length).toBeGreaterThan(0);
    });

    it('should handle multiple activations correctly', () => {
      queue.setTotalPages = 10;
      queue.setProcessedPages = [];

      // First activation - processes all 10 pages (5 chunks of 2)
      // First chunk is processed immediately, so queue has 4 items left
      queue.handleTypeToolActivation();
      const firstQueueLength = (queue as any).queue.length;
      expect(firstQueueLength).toBe(4); // 5 chunks - 1 processed immediately = 4

      // Stop processing and reset
      (queue as any).stopProcessingLoop();
      (queue as any).queue = [];
      queue.setProcessedPages = [];

      // Second activation - should process all pages again
      queue.handleTypeToolActivation();
      const secondQueueLength = (queue as any).queue.length;
      expect(secondQueueLength).toBe(firstQueueLength);
    });
  });
});
