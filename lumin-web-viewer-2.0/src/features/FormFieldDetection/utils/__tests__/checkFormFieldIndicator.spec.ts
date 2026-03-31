import { checkFormFieldIndicator } from '../checkFormFieldIndicator';
import core from 'core';
import logger from 'helpers/logger';
import { hasFormFieldIndicator } from '../detectionValidator';

jest.mock('core', () => ({
  __esModule: true,
  default: {
    getDocument: jest.fn(),
    getTotalPages: jest.fn(),
  },
}));

jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: {
    logError: jest.fn(),
  },
}));

jest.mock('../detectionValidator', () => ({
  hasFormFieldIndicator: jest.fn(),
}));

// Store original Promise.any at module level
type PromiseAnyType = <T>(values: readonly T[] | readonly [T, ...T[]]) => Promise<T>;
const originalPromiseAny = (Promise as unknown as { any?: PromiseAnyType }).any;

describe('checkFormFieldIndicator', () => {
  const mockGetDocument = core.getDocument as jest.Mock;
  const mockGetTotalPages = core.getTotalPages as jest.Mock;
  const mockLogError = logger.logError as jest.Mock;
  const mockHasFormFieldIndicator = hasFormFieldIndicator as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogError.mockClear();
    // Ensure Promise.any is always available (restore if it was deleted)
    if (!('any' in Promise) && originalPromiseAny) {
      (Promise as unknown as { any: PromiseAnyType }).any = originalPromiseAny;
    }
  });

  describe('when Promise.any is available', () => {
    beforeEach(() => {
      // Ensure Promise.any is available
      if (!('any' in Promise)) {
        (Promise as unknown as { any: PromiseAnyType }).any = originalPromiseAny || (() => {
          throw new Error('Promise.any not available');
        });
      }
    });

    describe('verifyFirstPageWithKeyword - success cases', () => {
      it('should return true when first page contains form field indicator', async () => {
        mockGetTotalPages.mockReturnValue(3);
        const mockDoc = {
          loadPageText: jest.fn(),
        };
        mockGetDocument.mockReturnValue(mockDoc);

        // First page has indicator
        mockDoc.loadPageText.mockResolvedValueOnce('This is a form document');
        mockHasFormFieldIndicator.mockReturnValueOnce(true);

        const result = await checkFormFieldIndicator();

        expect(result).toBe(true);
        expect(mockDoc.loadPageText).toHaveBeenCalledWith(1);
        expect(mockHasFormFieldIndicator).toHaveBeenCalledWith('This is a form document');
      });

      it('should return true when second page contains form field indicator (first page does not)', async () => {
        mockGetTotalPages.mockReturnValue(3);
        const mockDoc = {
          loadPageText: jest.fn(),
        };
        mockGetDocument.mockReturnValue(mockDoc);

        // First page doesn't have indicator
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);

        // Second page has indicator
        mockDoc.loadPageText.mockResolvedValueOnce('This is a form');
        mockHasFormFieldIndicator.mockReturnValueOnce(true);

        const result = await checkFormFieldIndicator();

        expect(result).toBe(true);
        expect(mockDoc.loadPageText).toHaveBeenCalledWith(1);
        expect(mockDoc.loadPageText).toHaveBeenCalledWith(2);
      });

      it('should return true when any page contains form field indicator', async () => {
        mockGetTotalPages.mockReturnValue(5);
        const mockDoc = {
          loadPageText: jest.fn(),
        };
        mockGetDocument.mockReturnValue(mockDoc);

        // Pages 1-3 don't have indicator
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content 1');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content 2');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content 3');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);

        // Page 4 has indicator
        mockDoc.loadPageText.mockResolvedValueOnce('This is a form document');
        mockHasFormFieldIndicator.mockReturnValueOnce(true);

        const result = await checkFormFieldIndicator();

        expect(result).toBe(true);
      });
    });

    describe('verifyFirstPageWithKeyword - failure cases', () => {
      it('should return false when no pages contain form field indicator', async () => {
        mockGetTotalPages.mockReturnValue(3);
        const mockDoc = {
          loadPageText: jest.fn(),
        };
        mockGetDocument.mockReturnValue(mockDoc);

        // All pages don't have indicator
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content 1');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content 2');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content 3');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);

        const result = await checkFormFieldIndicator();

        expect(result).toBe(false);
        // Should not log error for AggregateError with boolean errors
        expect(mockLogError).not.toHaveBeenCalled();
      });

      it('should return false and log error when loadPageText throws non-AggregateError', async () => {
        mockGetTotalPages.mockReturnValue(2);
        const mockDoc = {
          loadPageText: jest.fn(),
        };
        mockGetDocument.mockReturnValue(mockDoc);

        const testError = new Error('Failed to load page');
        // First page throws error, second page doesn't have indicator
        mockDoc.loadPageText.mockRejectedValueOnce(testError);
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);

        const result = await checkFormFieldIndicator();

        expect(result).toBe(false);
        // Promise.any wraps the error in AggregateError
        expect(mockLogError).toHaveBeenCalledWith({
          error: expect.any(AggregateError),
          reason: 'Failed to get text content',
        });
        const loggedError = mockLogError.mock.calls[0][0].error as AggregateError;
        expect(loggedError.errors).toContain(testError);
      });

      it('should return false and log error when AggregateError contains non-boolean errors', async () => {
        mockGetTotalPages.mockReturnValue(2);
        const mockDoc = {
          loadPageText: jest.fn(),
        };
        mockGetDocument.mockReturnValue(mockDoc);

        const testError = new Error('Some error');
        // First page throws error, second page doesn't have indicator
        mockDoc.loadPageText.mockRejectedValueOnce(testError);
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);

        const result = await checkFormFieldIndicator();

        expect(result).toBe(false);
        // Promise.any wraps errors in AggregateError, and since it contains non-boolean errors, it should log
        expect(mockLogError).toHaveBeenCalledWith({
          error: expect.any(AggregateError),
          reason: 'Failed to get text content',
        });
        const loggedError = mockLogError.mock.calls[0][0].error as AggregateError;
        expect(loggedError.errors.some((err) => typeof err !== 'boolean')).toBe(true);
      });

      it('should return false without logging when AggregateError contains only boolean errors', async () => {
        mockGetTotalPages.mockReturnValue(2);
        const mockDoc = {
          loadPageText: jest.fn(),
        };
        mockGetDocument.mockReturnValue(mockDoc);

        // Both pages don't have indicator - Promise.any will reject with AggregateError containing [false, false]
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content 1');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content 2');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);

        const result = await checkFormFieldIndicator();

        expect(result).toBe(false);
        // When all promises reject with boolean values, Promise.any creates AggregateError with boolean errors
        // The code checks if all errors are booleans and doesn't log in that case
        expect(mockLogError).not.toHaveBeenCalled();
      });

      it('should handle mixed errors in AggregateError - log when non-boolean exists', async () => {
        mockGetTotalPages.mockReturnValue(2);
        const mockDoc = {
          loadPageText: jest.fn(),
        };
        mockGetDocument.mockReturnValue(mockDoc);

        const testError = new Error('Real error');
        // First page throws error, second page doesn't have indicator
        mockDoc.loadPageText.mockRejectedValueOnce(testError);
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);

        const result = await checkFormFieldIndicator();

        expect(result).toBe(false);
        // Promise.any wraps errors in AggregateError - since it contains non-boolean error, it should log
        expect(mockLogError).toHaveBeenCalledWith({
          error: expect.any(AggregateError),
          reason: 'Failed to get text content',
        });
        const loggedError = mockLogError.mock.calls[0][0].error as AggregateError;
        expect(loggedError.errors.some((err) => typeof err !== 'boolean')).toBe(true);
      });
    });
  });

  describe('when Promise.any is not available', () => {
    beforeEach(() => {
      // Remove Promise.any to simulate older environment
      delete (Promise as unknown as { any?: PromiseAnyType }).any;
    });

    describe('verifyKeyword - success cases', () => {
      it('should return true when any page contains form field indicator', async () => {
        mockGetTotalPages.mockReturnValue(3);
        const mockDoc = {
          loadPageText: jest.fn(),
        };
        mockGetDocument.mockReturnValue(mockDoc);

        // Page 1 doesn't have indicator
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);

        // Page 2 has indicator
        mockDoc.loadPageText.mockResolvedValueOnce('This is a form');
        mockHasFormFieldIndicator.mockReturnValueOnce(true);

        // Page 3 doesn't have indicator
        mockDoc.loadPageText.mockResolvedValueOnce('More content');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);

        const result = await checkFormFieldIndicator();

        expect(result).toBe(true);
        expect(mockDoc.loadPageText).toHaveBeenCalledTimes(3);
        expect(mockHasFormFieldIndicator).toHaveBeenCalledTimes(3);
      });

      it('should return true when first page contains form field indicator', async () => {
        mockGetTotalPages.mockReturnValue(2);
        const mockDoc = {
          loadPageText: jest.fn(),
        };
        mockGetDocument.mockReturnValue(mockDoc);

        // Page 1 has indicator
        mockDoc.loadPageText.mockResolvedValueOnce('This is a form document');
        mockHasFormFieldIndicator.mockReturnValueOnce(true);

        // Page 2 doesn't have indicator
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);

        const result = await checkFormFieldIndicator();

        expect(result).toBe(true);
      });

      it('should return true when last page contains form field indicator', async () => {
        mockGetTotalPages.mockReturnValue(3);
        const mockDoc = {
          loadPageText: jest.fn(),
        };
        mockGetDocument.mockReturnValue(mockDoc);

        // Pages 1-2 don't have indicator
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content 1');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content 2');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);

        // Page 3 has indicator
        mockDoc.loadPageText.mockResolvedValueOnce('This is a form');
        mockHasFormFieldIndicator.mockReturnValueOnce(true);

        const result = await checkFormFieldIndicator();

        expect(result).toBe(true);
      });
    });

    describe('verifyKeyword - failure cases', () => {
      it('should return false when no pages contain form field indicator', async () => {
        mockGetTotalPages.mockReturnValue(3);
        const mockDoc = {
          loadPageText: jest.fn(),
        };
        mockGetDocument.mockReturnValue(mockDoc);

        // All pages don't have indicator
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content 1');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content 2');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content 3');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);

        const result = await checkFormFieldIndicator();

        expect(result).toBe(false);
        expect(mockDoc.loadPageText).toHaveBeenCalledTimes(3);
        expect(mockHasFormFieldIndicator).toHaveBeenCalledTimes(3);
      });

      it('should return false and log error when loadPageText throws error', async () => {
        mockGetTotalPages.mockReturnValue(2);
        const mockDoc = {
          loadPageText: jest.fn(),
        };
        mockGetDocument.mockReturnValue(mockDoc);

        const testError = new Error('Failed to load page');
        // First page throws error, second page doesn't have indicator
        mockDoc.loadPageText.mockRejectedValueOnce(testError);
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);

        const result = await checkFormFieldIndicator();

        expect(result).toBe(false);
        expect(mockLogError).toHaveBeenCalledWith({
          error: testError,
          reason: 'Failed to get text content',
        });
      });

      it('should return false when some pages fail but none contain indicator', async () => {
        mockGetTotalPages.mockReturnValue(3);
        const mockDoc = {
          loadPageText: jest.fn(),
        };
        mockGetDocument.mockReturnValue(mockDoc);

        // Page 1 fails
        const testError = new Error('Failed to load page');
        mockDoc.loadPageText.mockRejectedValueOnce(testError);

        // Pages 2-3 don't have indicator
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content 2');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);
        mockDoc.loadPageText.mockResolvedValueOnce('Regular content 3');
        mockHasFormFieldIndicator.mockReturnValueOnce(false);

        const result = await checkFormFieldIndicator();

        expect(result).toBe(false);
        expect(mockLogError).toHaveBeenCalledWith({
          error: testError,
          reason: 'Failed to get text content',
        });
      });
    });
  });

  describe('edge cases', () => {

    it('should handle single page document', async () => {
      mockGetTotalPages.mockReturnValue(1);
      const mockDoc = {
        loadPageText: jest.fn(),
      };
      mockGetDocument.mockReturnValue(mockDoc);

      mockDoc.loadPageText.mockResolvedValueOnce('This is a form');
      mockHasFormFieldIndicator.mockReturnValueOnce(true);

      const result = await checkFormFieldIndicator();

      expect(result).toBe(true);
      expect(mockDoc.loadPageText).toHaveBeenCalledWith(1);
    });

    it('should handle empty document (0 pages)', async () => {
      mockGetTotalPages.mockReturnValue(0);
      const mockDoc = {
        loadPageText: jest.fn(),
      };
      mockGetDocument.mockReturnValue(mockDoc);

      const result = await checkFormFieldIndicator();

      expect(result).toBe(false);
      expect(mockDoc.loadPageText).not.toHaveBeenCalled();
      // Promise.any([]) rejects with AggregateError([])
      // Empty errors array means some() returns false, so condition is false and no logging
      expect(mockLogError).not.toHaveBeenCalled();
    });

    it('should handle error when getTotalPages throws', async () => {
      const testError = new Error('Failed to get total pages');
      mockGetTotalPages.mockImplementation(() => {
        throw testError;
      });

      const result = await checkFormFieldIndicator();

      expect(result).toBe(false);
      expect(mockLogError).toHaveBeenCalledWith({
        error: testError,
        reason: 'Failed to get text content',
      });
    });

    it('should handle error when getDocument throws', async () => {
      mockGetTotalPages.mockReturnValue(3);
      const testError = new Error('Failed to get document');
      mockGetDocument.mockImplementation(() => {
        throw testError;
      });

      const result = await checkFormFieldIndicator();

      expect(result).toBe(false);
      expect(mockLogError).toHaveBeenCalledWith({
        error: testError,
        reason: 'Failed to get text content',
      });
    });

    it('should handle large document with many pages', async () => {
      mockGetTotalPages.mockReturnValue(100);
      const mockDoc = {
        loadPageText: jest.fn(),
      };
      mockGetDocument.mockReturnValue(mockDoc);

      // First 50 pages don't have indicator
      for (let i = 1; i <= 50; i++) {
        mockDoc.loadPageText.mockResolvedValueOnce(`Page ${i} content`);
        mockHasFormFieldIndicator.mockReturnValueOnce(false);
      }

      // Page 51 has indicator
      mockDoc.loadPageText.mockResolvedValueOnce('This is a form');
      mockHasFormFieldIndicator.mockReturnValueOnce(true);

      const result = await checkFormFieldIndicator();

      expect(result).toBe(true);
    });
  });

  describe('error handling in checkFormFieldIndicator', () => {

    it('should return false when error is not an AggregateError', async () => {
      // This test covers the case where getTotalPages or getDocument throws a non-AggregateError
      const testError = new Error('Some error');
      mockGetTotalPages.mockImplementation(() => {
        throw testError;
      });

      const result = await checkFormFieldIndicator();

      expect(result).toBe(false);
      expect(mockLogError).toHaveBeenCalledWith({
        error: testError,
        reason: 'Failed to get text content',
      });
    });

    it('should return false when AggregateError has mixed boolean and non-boolean errors', async () => {
      mockGetTotalPages.mockReturnValue(2);
      const mockDoc = {
        loadPageText: jest.fn(),
      };
      mockGetDocument.mockReturnValue(mockDoc);

      // When Promise.any is used and one page throws error while others reject with false
      const testError = new Error('Some error');
      mockDoc.loadPageText.mockRejectedValueOnce(testError);
      mockDoc.loadPageText.mockResolvedValueOnce('Regular content');
      mockHasFormFieldIndicator.mockReturnValueOnce(false);

      const result = await checkFormFieldIndicator();

      expect(result).toBe(false);
      // Promise.any creates AggregateError with mixed errors (Error and boolean)
      expect(mockLogError).toHaveBeenCalledWith({
        error: expect.any(AggregateError),
        reason: 'Failed to get text content',
      });
      const loggedError = mockLogError.mock.calls[0][0].error as AggregateError;
      expect(loggedError.errors.some((err) => typeof err !== 'boolean')).toBe(true);
    });

    it('should return false when AggregateError has only boolean errors (no logging)', async () => {
      mockGetTotalPages.mockReturnValue(2);
      const mockDoc = {
        loadPageText: jest.fn(),
      };
      mockGetDocument.mockReturnValue(mockDoc);

      // Both pages don't have indicator - Promise.any rejects with AggregateError([false, false])
      mockDoc.loadPageText.mockResolvedValueOnce('Regular content 1');
      mockHasFormFieldIndicator.mockReturnValueOnce(false);
      mockDoc.loadPageText.mockResolvedValueOnce('Regular content 2');
      mockHasFormFieldIndicator.mockReturnValueOnce(false);

      const result = await checkFormFieldIndicator();

      expect(result).toBe(false);
      // All errors are booleans, so should not log
      expect(mockLogError).not.toHaveBeenCalled();
    });

    it('should return false when AggregateError has empty errors array', async () => {
      // When totalPages is 0, pagesArray is empty, Promise.any([]) rejects with AggregateError([])
      mockGetTotalPages.mockReturnValue(0);
      const mockDoc = {
        loadPageText: jest.fn(),
      };
      mockGetDocument.mockReturnValue(mockDoc);

      const result = await checkFormFieldIndicator();

      expect(result).toBe(false);
      // Empty array means some() returns false, so condition evaluates to false and no logging
      // The condition is: !(error instanceof AggregateError) || error.errors.some((err) => typeof err !== 'boolean')
      // For AggregateError([]): false || false = false, so no logging
      expect(mockLogError).not.toHaveBeenCalled();
    });
  });
});
