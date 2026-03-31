import { renderHook, act } from '@testing-library/react';
import { useSelector } from 'react-redux';
import selectors from 'selectors';
import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';
import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import { useDocumentViewerLoaded } from 'hooks/useDocumentViewerLoaded';
import { useContentCheckerContext } from 'features/ContentChecker/hooks/useContentCheckerContext';
import { readAloudSelectors } from 'features/ReadAloud/slices';
import { useIsValidDocumentForFormFieldDetection } from '../useIsValidDocumentForFormFieldDetection';
import { useCheckFormFieldsInDocument } from '../useCheckFormFieldsInDocument';
import { formFieldDetectionSelectors } from '../../slice';
import { useShouldShowFormFieldDetectionBanner } from '../useShouldShowFormFieldDetectionBanner';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('hooks/useDocumentViewerLoaded', () => ({
  useDocumentViewerLoaded: jest.fn(),
}));

jest.mock('features/ContentChecker/hooks/useContentCheckerContext', () => ({
  useContentCheckerContext: jest.fn(),
}));

jest.mock('../useIsValidDocumentForFormFieldDetection', () => ({
  useIsValidDocumentForFormFieldDetection: jest.fn(),
}));

jest.mock('../useCheckFormFieldsInDocument', () => ({
  useCheckFormFieldsInDocument: jest.fn(),
}));

describe('useShouldShowFormFieldDetectionBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useDocumentViewerLoaded as jest.Mock).mockReturnValue({ loaded: true });
    (useIsValidDocumentForFormFieldDetection as jest.Mock).mockReturnValue({ isValidDocumentForFormFieldDetection: true });
    (useContentCheckerContext as jest.Mock).mockReturnValue({ isContainFormFieldIndicator: true });
    (useCheckFormFieldsInDocument as jest.Mock).mockReturnValue({ hasFormFieldsInDocument: false });
    
    (useSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectors.toolbarValue) return LEFT_SIDE_BAR_VALUES.FILL_AND_SIGN.value;
      if (selector === selectors.toolPropertiesValue) return TOOL_PROPERTIES_VALUE.FORM_BUILD;
      if (selector === selectors.isPreviewOriginalVersionMode) return false;
      if (selector === readAloudSelectors.isInReadAloudMode) return false;
      if (selector === formFieldDetectionSelectors.hasEnteredFormFieldDetection) return false;
      return null;
    });
  });

  it('should return true for shouldShowFormFieldDetectionBanner when all conditions match', () => {
    const { result } = renderHook(() => useShouldShowFormFieldDetectionBanner());
    expect(result.current.shouldShowFormFieldDetectionBanner).toBe(true);
  });

  it('should return false if document is not loaded', () => {
    (useDocumentViewerLoaded as jest.Mock).mockReturnValue({ loaded: false });
    const { result } = renderHook(() => useShouldShowFormFieldDetectionBanner());
    expect(result.current.shouldShowFormFieldDetectionBanner).toBe(false);
  });

  describe('shouldReopenViewerBanner', () => {
    it('should return true when not in FillAndSignTab, hasCloseViewerBanner is false, and hasCloseFormFieldDetectionBanner is true', () => {
      (useSelector as jest.Mock).mockImplementation((selector) => {
        if (selector === selectors.toolbarValue) return 'other-tab-value'; // Not FILL_AND_SIGN
        if (selector === selectors.toolPropertiesValue) return TOOL_PROPERTIES_VALUE.FORM_BUILD;
        if (selector === selectors.isPreviewOriginalVersionMode) return false;
        if (selector === readAloudSelectors.isInReadAloudMode) return false;
        if (selector === formFieldDetectionSelectors.hasEnteredFormFieldDetection) return false;
        return null;
      });

      const { result } = renderHook(() => useShouldShowFormFieldDetectionBanner());
      
      act(() => {
        result.current.setHasCloseFormFieldDetectionBanner(true);
      });

      expect(result.current.shouldReopenViewerBanner).toBe(true);
    });

    it('should return false when isInFillAndSignTab is true', () => {
      (useSelector as jest.Mock).mockImplementation((selector) => {
        if (selector === selectors.toolbarValue) return LEFT_SIDE_BAR_VALUES.FILL_AND_SIGN.value;
        if (selector === selectors.toolPropertiesValue) return TOOL_PROPERTIES_VALUE.FORM_BUILD;
        if (selector === selectors.isPreviewOriginalVersionMode) return false;
        if (selector === readAloudSelectors.isInReadAloudMode) return false;
        if (selector === formFieldDetectionSelectors.hasEnteredFormFieldDetection) return false;
        return null;
      });

      const { result } = renderHook(() => useShouldShowFormFieldDetectionBanner());
      
      act(() => {
        result.current.setHasCloseFormFieldDetectionBanner(true);
      });

      expect(result.current.shouldReopenViewerBanner).toBe(false);
    });

    it('should return false when hasCloseViewerBanner is true', () => {
      (useSelector as jest.Mock).mockImplementation((selector) => {
        if (selector === selectors.toolbarValue) return 'other-tab-value'; // Not FILL_AND_SIGN
        if (selector === selectors.toolPropertiesValue) return TOOL_PROPERTIES_VALUE.FORM_BUILD;
        if (selector === selectors.isPreviewOriginalVersionMode) return false;
        if (selector === readAloudSelectors.isInReadAloudMode) return false;
        if (selector === formFieldDetectionSelectors.hasEnteredFormFieldDetection) return false;
        return null;
      });

      const { result } = renderHook(() => useShouldShowFormFieldDetectionBanner());
      
      act(() => {
        result.current.setHasCloseViewerBanner(true);
        result.current.setHasCloseFormFieldDetectionBanner(true);
      });

      expect(result.current.shouldReopenViewerBanner).toBe(false);
    });

    it('should return false when hasCloseFormFieldDetectionBanner is false', () => {
      (useSelector as jest.Mock).mockImplementation((selector) => {
        if (selector === selectors.toolbarValue) return 'other-tab-value'; // Not FILL_AND_SIGN
        if (selector === selectors.toolPropertiesValue) return TOOL_PROPERTIES_VALUE.FORM_BUILD;
        if (selector === selectors.isPreviewOriginalVersionMode) return false;
        if (selector === readAloudSelectors.isInReadAloudMode) return false;
        if (selector === formFieldDetectionSelectors.hasEnteredFormFieldDetection) return false;
        return null;
      });

      const { result } = renderHook(() => useShouldShowFormFieldDetectionBanner());
      
      // hasCloseFormFieldDetectionBanner defaults to false, so no need to set it
      expect(result.current.shouldReopenViewerBanner).toBe(false);
    });
  });
});