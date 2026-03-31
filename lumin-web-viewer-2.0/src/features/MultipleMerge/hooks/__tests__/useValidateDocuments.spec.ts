import { renderHook, act, waitFor } from '@testing-library/react';

import { Plans, PRICING_VERSION } from 'constants/plan';

import { useValidateDocuments } from '../useValidateDocuments';

// Mock dependencies
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: jest.fn(),
}));

jest.mock('hooks', () => ({
  useGetCurrentUser: jest.fn(),
  useTranslation: jest.fn(() => ({ t: jest.fn((key: string) => key) })),
  useGetFolderType: jest.fn(),
}));

jest.mock('hooks/useShallowSelector', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('services', () => ({
  organizationServices: {
    checkOrganizationDocStack: jest.fn(),
  },
}));

jest.mock('utils/getHitDocStackModalContent', () => ({
  getHitDocStackModalContent: jest.fn(),
}));

jest.mock('utils/getPremiumModalContent', () => ({
  getPremiumModalContent: jest.fn(),
}));

jest.mock('actions', () => ({
  __esModule: true,
  default: {
    openModal: jest.fn(),
  },
}));

describe('useValidateDocuments', () => {
  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();
  const mockGetAbortController = jest.fn(() => new AbortController());

  const defaultUser = {
    payment: {
      priceVersion: PRICING_VERSION.V3,
      type: Plans.ORG_PRO,
    },
  };

  const defaultOrganization = {
    _id: 'org-123',
    payment: {
      type: Plans.ORG_PRO,
      trialInfo: {
        canUseProTrial: false,
        canUseBusinessTrial: false,
        canStartTrial: false,
      },
    },
    userRole: 'admin',
    userPermissions: {
      canUseMultipleMerge: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const { useDispatch } = require('react-redux');
    useDispatch.mockReturnValue(mockDispatch);

    const { useNavigate } = require('react-router');
    useNavigate.mockReturnValue(mockNavigate);

    const { useGetCurrentUser } = require('hooks');
    useGetCurrentUser.mockReturnValue(defaultUser);

    const useShallowSelector = require('hooks/useShallowSelector').default;
    useShallowSelector.mockReturnValue({ data: defaultOrganization });

    const { organizationServices } = require('services');
    organizationServices.checkOrganizationDocStack.mockResolvedValue({ isOverDocStack: false });

    const { getPremiumModalContent } = require('utils/getPremiumModalContent');
    getPremiumModalContent.mockReturnValue({ title: 'Premium Modal', content: 'Content' });

    const { getHitDocStackModalContent } = require('utils/getHitDocStackModalContent');
    getHitDocStackModalContent.mockReturnValue({ title: 'Doc Stack Modal', content: 'Content' });
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      expect(result.current.openedPremiumModal).toBe(false);
      expect(result.current.premiumModalContent).toBeNull();
      expect(typeof result.current.shouldBlockMergeProcess).toBe('function');
      expect(result.current.openedPremiumModalHandlers).toBeDefined();
    });

    it('should provide openedPremiumModalHandlers with open, close, toggle', () => {
      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      expect(typeof result.current.openedPremiumModalHandlers.open).toBe('function');
      expect(typeof result.current.openedPremiumModalHandlers.close).toBe('function');
      expect(typeof result.current.openedPremiumModalHandlers.toggle).toBe('function');
    });
  });

  describe('shouldBlockMergeProcess', () => {
    it('should return false when user has all permissions and not over doc stack', async () => {
      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      let shouldBlock: boolean;
      await act(async () => {
        shouldBlock = await result.current.shouldBlockMergeProcess();
      });

      expect(shouldBlock).toBe(false);
    });

    it('should return true and open premium modal when premiumModalContent is already set', async () => {
      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      // First call to trigger setting premiumModalContent
      const useShallowSelector = require('hooks/useShallowSelector').default;
      useShallowSelector.mockReturnValue({
        data: {
          ...defaultOrganization,
          userPermissions: { canUseMultipleMerge: false },
        },
      });

      const { result: result2 } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      await act(async () => {
        await result2.current.shouldBlockMergeProcess();
      });

      // premiumModalContent should now be set, calling again should open modal
      await act(async () => {
        const shouldBlock = await result2.current.shouldBlockMergeProcess();
        expect(shouldBlock).toBe(true);
      });
    });

    it('should return true when user cannot use multiple merge', async () => {
      const useShallowSelector = require('hooks/useShallowSelector').default;
      useShallowSelector.mockReturnValue({
        data: {
          ...defaultOrganization,
          userPermissions: { canUseMultipleMerge: false },
        },
      });

      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      let shouldBlock: boolean;
      await act(async () => {
        shouldBlock = await result.current.shouldBlockMergeProcess();
      });

      expect(shouldBlock).toBe(true);
    });

    it('should return true and show hit doc stack modal when organization is over doc stack', async () => {
      const { organizationServices } = require('services');
      organizationServices.checkOrganizationDocStack.mockResolvedValue({ isOverDocStack: true });

      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      let shouldBlock: boolean;
      await act(async () => {
        shouldBlock = await result.current.shouldBlockMergeProcess();
      });

      expect(shouldBlock).toBe(true);
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should return false when organization id is empty', async () => {
      const useShallowSelector = require('hooks/useShallowSelector').default;
      useShallowSelector.mockReturnValue({
        data: {
          ...defaultOrganization,
          _id: '',
        },
      });

      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      let shouldBlock: boolean;
      await act(async () => {
        shouldBlock = await result.current.shouldBlockMergeProcess();
      });

      expect(shouldBlock).toBe(false);
    });

    it('should call checkOrganizationDocStack with correct parameters', async () => {
      const { organizationServices } = require('services');

      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      await act(async () => {
        await result.current.shouldBlockMergeProcess();
      });

      expect(organizationServices.checkOrganizationDocStack).toHaveBeenCalledWith('org-123', {
        signal: expect.any(AbortSignal),
      });
    });

    it('should use abort signal from getAbortController', async () => {
      const mockAbortController = new AbortController();
      const customGetAbortController = jest.fn(() => mockAbortController);
      const { organizationServices } = require('services');

      const { result } = renderHook(() => useValidateDocuments({ getAbortController: customGetAbortController }));

      await act(async () => {
        await result.current.shouldBlockMergeProcess();
      });

      expect(customGetAbortController).toHaveBeenCalled();
      expect(organizationServices.checkOrganizationDocStack).toHaveBeenCalledWith('org-123', {
        signal: mockAbortController.signal,
      });
    });
  });

  describe('validatePremiumFeature', () => {
    it('should call getPremiumModalContent with correct parameters for old plan', async () => {
      const { useGetCurrentUser } = require('hooks');
      useGetCurrentUser.mockReturnValue({
        payment: {
          priceVersion: PRICING_VERSION.V2,
          type: Plans.ORG_PRO,
        },
      });

      const useShallowSelector = require('hooks/useShallowSelector').default;
      useShallowSelector.mockReturnValue({
        data: {
          ...defaultOrganization,
          userPermissions: { canUseMultipleMerge: false },
        },
      });

      const { getPremiumModalContent } = require('utils/getPremiumModalContent');

      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      await act(async () => {
        await result.current.shouldBlockMergeProcess();
      });

      expect(getPremiumModalContent).toHaveBeenCalledWith(
        expect.objectContaining({
          isOldPlan: true,
          orgId: 'org-123',
        })
      );
    });

    it('should call getPremiumModalContent with correct parameters for FREE plan', async () => {
      const { useGetCurrentUser } = require('hooks');
      useGetCurrentUser.mockReturnValue({
        payment: {
          priceVersion: PRICING_VERSION.V3,
          type: Plans.FREE,
        },
      });

      const useShallowSelector = require('hooks/useShallowSelector').default;
      useShallowSelector.mockReturnValue({
        data: {
          ...defaultOrganization,
          userPermissions: { canUseMultipleMerge: false },
        },
      });

      const { getPremiumModalContent } = require('utils/getPremiumModalContent');

      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      await act(async () => {
        await result.current.shouldBlockMergeProcess();
      });

      expect(getPremiumModalContent).toHaveBeenCalledWith(
        expect.objectContaining({
          isOldPlan: false,
        })
      );
    });
  });

  describe('validateHitDocStack', () => {
    it('should call getHitDocStackModalContent with correct parameters', async () => {
      const { organizationServices } = require('services');
      organizationServices.checkOrganizationDocStack.mockResolvedValue({ isOverDocStack: true });

      const { getHitDocStackModalContent } = require('utils/getHitDocStackModalContent');

      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      await act(async () => {
        await result.current.shouldBlockMergeProcess();
      });

      expect(getHitDocStackModalContent).toHaveBeenCalledWith(
        expect.objectContaining({
          orgId: 'org-123',
          userRole: 'admin',
        })
      );
    });

    it('should dispatch openModal action when hit doc stack', async () => {
      const { organizationServices } = require('services');
      organizationServices.checkOrganizationDocStack.mockResolvedValue({ isOverDocStack: true });
      const actions = require('actions').default;

      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      await act(async () => {
        await result.current.shouldBlockMergeProcess();
      });

      expect(actions.openModal).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('openedPremiumModalHandlers', () => {
    it('should toggle openedPremiumModal state', async () => {
      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      expect(result.current.openedPremiumModal).toBe(false);

      act(() => {
        result.current.openedPremiumModalHandlers.open();
      });

      await waitFor(() => {
        expect(result.current.openedPremiumModal).toBe(true);
      });

      act(() => {
        result.current.openedPremiumModalHandlers.close();
      });

      await waitFor(() => {
        expect(result.current.openedPremiumModal).toBe(false);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle missing trialInfo gracefully', async () => {
      const useShallowSelector = require('hooks/useShallowSelector').default;
      useShallowSelector.mockReturnValue({
        data: {
          ...defaultOrganization,
          payment: {
            type: Plans.ORG_PRO,
          },
        },
      });

      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      await act(async () => {
        const shouldBlock = await result.current.shouldBlockMergeProcess();
        expect(typeof shouldBlock).toBe('boolean');
      });
    });

    it('should handle missing userPermissions gracefully', async () => {
      const useShallowSelector = require('hooks/useShallowSelector').default;
      useShallowSelector.mockReturnValue({
        data: {
          ...defaultOrganization,
          userPermissions: undefined,
        },
      });

      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      let shouldBlock: boolean;
      await act(async () => {
        shouldBlock = await result.current.shouldBlockMergeProcess();
      });

      expect(shouldBlock).toBe(true);
    });

    it('should handle undefined currentOrganization data by using default value', async () => {
      const useShallowSelector = require('hooks/useShallowSelector').default;
      useShallowSelector.mockReturnValue({
        data: undefined,
      });

      const { result } = renderHook(() => useValidateDocuments({ getAbortController: mockGetAbortController }));

      // When data is undefined, the hook uses the default value { payment: {} }
      // This means userPermissions?.canUseMultipleMerge will be falsy
      let shouldBlock: boolean;
      await act(async () => {
        shouldBlock = await result.current.shouldBlockMergeProcess();
      });

      expect(shouldBlock).toBe(true);
    });
  });
});

