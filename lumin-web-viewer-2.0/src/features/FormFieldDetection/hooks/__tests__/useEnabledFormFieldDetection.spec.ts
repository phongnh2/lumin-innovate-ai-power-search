import { renderHook } from '@testing-library/react';
import { useEnabledFormFieldDetection } from '../useEnabledFormFieldDetection';

jest.mock('hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

describe('useEnabledFormFieldDetection', () => {
  const mockUseGetCurrentUser = require('hooks/useGetCurrentUser').useGetCurrentUser;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return enabledFormFieldDetection as true when currentUser exists', () => {
    const mockUser = { _id: 'user-123', email: 'test@example.com' };
    mockUseGetCurrentUser.mockReturnValue(mockUser);

    const { result } = renderHook(() => useEnabledFormFieldDetection());

    expect(result.current.enabledFormFieldDetection).toBe(true);
    expect(mockUseGetCurrentUser).toHaveBeenCalled();
  });

  it('should return enabledFormFieldDetection as false when currentUser is null', () => {
    mockUseGetCurrentUser.mockReturnValue(null);

    const { result } = renderHook(() => useEnabledFormFieldDetection());

    expect(result.current.enabledFormFieldDetection).toBe(false);
    expect(mockUseGetCurrentUser).toHaveBeenCalled();
  });

  it('should return enabledFormFieldDetection as false when currentUser is undefined', () => {
    mockUseGetCurrentUser.mockReturnValue(undefined);

    const { result } = renderHook(() => useEnabledFormFieldDetection());

    expect(result.current.enabledFormFieldDetection).toBe(false);
    expect(mockUseGetCurrentUser).toHaveBeenCalled();
  });
});

