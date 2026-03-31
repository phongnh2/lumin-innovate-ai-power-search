import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import selectors from 'selectors';
import useShallowSelector from 'hooks/useShallowSelector';
import { useEnabledFormFieldDetection } from '../useEnabledFormFieldDetection';
import { isValidDocumentSize } from '../../utils/detectionValidator';
import { useIsValidDocumentForFormFieldDetection } from '../useIsValidDocumentForFormFieldDetection';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('hooks/useShallowSelector', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../useEnabledFormFieldDetection', () => ({
  useEnabledFormFieldDetection: jest.fn(),
}));

jest.mock('../../utils/detectionValidator', () => ({
  isValidDocumentSize: jest.fn(),
}));

describe('useIsValidDocumentForFormFieldDetection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useEnabledFormFieldDetection as jest.Mock).mockReturnValue({ enabledFormFieldDetection: true });
    (isValidDocumentSize as jest.Mock).mockReturnValue(true);
    (useSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectors.isOffline) return false;
      if (selector === selectors.getTotalPages) return 10;
      return null;
    });
  });

  it('should return true when all conditions are met', () => {
    (useShallowSelector as unknown as jest.Mock).mockReturnValue({ isSystemFile: false });
    
    const { result } = renderHook(() => useIsValidDocumentForFormFieldDetection());
    expect(result.current.isValidDocumentForFormFieldDetection).toBe(true);
  });

  it('should return false if document is a local system file', () => {
    (useShallowSelector as unknown as jest.Mock).mockReturnValue({ isSystemFile: true });
    
    const { result } = renderHook(() => useIsValidDocumentForFormFieldDetection());
    expect(result.current.isValidDocumentForFormFieldDetection).toBe(false);
  });
});