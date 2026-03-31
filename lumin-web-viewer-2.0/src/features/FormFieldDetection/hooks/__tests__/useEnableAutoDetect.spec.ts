import { renderHook } from '@testing-library/react';

import { FeatureFlags } from 'constants/featureFlagsConstant';
import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

import { useEnableAutoDetect } from '../useEnableAutoDetect';

// Mock the dependency hook
jest.mock('hooks/growthBook/useGetFeatureIsOn', () => ({
  useGetFeatureIsOn: jest.fn(),
}));

describe('useEnableAutoDetect', () => {
  const mockUseGetFeatureIsOn = require('hooks/growthBook/useGetFeatureIsOn')
    .useGetFeatureIsOn as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return enabled: true when feature flag is on', () => {
    mockUseGetFeatureIsOn.mockReturnValue({
      isOn: true,
      loading: false,
    });

    const { result } = renderHook(() => useEnableAutoDetect());

    expect(result.current.enabled).toBe(true);
    expect(mockUseGetFeatureIsOn).toHaveBeenCalledWith({
      key: FeatureFlags.AUTO_DETECT_FORM_FIELDS,
      attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
    });
  });

  it('should return enabled: false when feature flag is off', () => {
    mockUseGetFeatureIsOn.mockReturnValue({
      isOn: false,
      loading: false,
    });

    const { result } = renderHook(() => useEnableAutoDetect());

    expect(result.current.enabled).toBe(false);
    expect(mockUseGetFeatureIsOn).toHaveBeenCalledWith({
      key: FeatureFlags.AUTO_DETECT_FORM_FIELDS,
      attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ID,
    });
  });
});

