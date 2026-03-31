import { renderHook } from '@testing-library/react';


import { PaymentStatus } from 'constants/plan.enum';

import { mockOrganization } from 'features/CNC/CncComponents/__mocks__/mockOrganization';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { useGetCustomerSupportModalFlag } from '../useGetCustomerSupportModalFlag';
import { useShowContactCustomerSupportModal } from "features/CNC/hooks";

// Mock the dependencies
jest.mock('../useGetCustomerSupportModalFlag');
jest.mock('../../constants/customConstant', () => ({
  NUMBER_INVITE_TO_SHOWN_CUSTOMER_SUPPORT_MODAL: 5,
}));

const mockUseGetCustomerSupportModalFlag = useGetCustomerSupportModalFlag as jest.MockedFunction<
  typeof useGetCustomerSupportModalFlag
>;

describe('useShowContactCustomerSupportModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when feature flag is disabled', () => {
    mockUseGetCustomerSupportModalFlag.mockReturnValue({
      enabled: false,
    });

    const { result } = renderHook(() =>
      useShowContactCustomerSupportModal({
        organization: mockOrganization,
        numberInvited: 10,
      })
    );

    expect(result.current.shouldOpenContactCustomerSupportModal).toBe(false);
  });

  describe('when feature flag is enabled', () => {
    beforeEach(() => {
      mockUseGetCustomerSupportModalFlag.mockReturnValue({
        enabled: true,
      });
    });

    describe('when organization is trialing', () => {
      it('should return true when numberInvited meets the threshold', () => {
        const { result } = renderHook(() =>
          useShowContactCustomerSupportModal({
            organization: mockOrganization,
            numberInvited: 5,
          })
        );

        expect(result.current.shouldOpenContactCustomerSupportModal).toBe(true);
      });

      it('should return true when numberInvited exceeds the threshold', () => {
        const { result } = renderHook(() =>
          useShowContactCustomerSupportModal({
            organization: mockOrganization,
            numberInvited: 10,
          })
        );

        expect(result.current.shouldOpenContactCustomerSupportModal).toBe(true);
      });

      it('should return false when numberInvited is below the threshold', () => {
        const { result } = renderHook(() =>
          useShowContactCustomerSupportModal({
            organization: mockOrganization,
            numberInvited: 3,
          })
        );

        expect(result.current.shouldOpenContactCustomerSupportModal).toBe(false);
      });

      it('should return false when numberInvited is 0', () => {
        const { result } = renderHook(() =>
          useShowContactCustomerSupportModal({
            organization: mockOrganization,
            numberInvited: 0,
          })
        );

        expect(result.current.shouldOpenContactCustomerSupportModal).toBe(false);
      });
    });

    describe('when organization is not trialing', () => {
      const nonTrialingOrganization: IOrganization = {
        ...mockOrganization,
        payment: {
          ...mockOrganization.payment,
          status: PaymentStatus.ACTIVE,
        },
      } as IOrganization;

      it('should return false even when numberInvited meets the threshold', () => {
        const { result } = renderHook(() =>
          useShowContactCustomerSupportModal({
            organization: nonTrialingOrganization,
            numberInvited: 5,
          })
        );

        expect(result.current.shouldOpenContactCustomerSupportModal).toBe(false);
      });

      it('should return false even when numberInvited exceeds the threshold', () => {
        const { result } = renderHook(() =>
          useShowContactCustomerSupportModal({
            organization: nonTrialingOrganization,
            numberInvited: 10,
          })
        );

        expect(result.current.shouldOpenContactCustomerSupportModal).toBe(false);
      });
    });

    describe('when organization has CANCELED payment status', () => {
      const canceledOrganization: IOrganization = {
        ...mockOrganization,
        payment: {
          ...mockOrganization.payment,
          status: PaymentStatus.CANCELED,
        },
      } as IOrganization;

      it('should return false even when numberInvited meets the threshold', () => {
        const { result } = renderHook(() =>
          useShowContactCustomerSupportModal({
            organization: canceledOrganization,
            numberInvited: 5,
          })
        );

        expect(result.current.shouldOpenContactCustomerSupportModal).toBe(false);
      });
    });

    describe('when organization payment is undefined', () => {
      const organizationWithoutPayment: IOrganization = {
        ...mockOrganization,
        payment: undefined,
      } as IOrganization;

      it('should return false even when numberInvited meets the threshold', () => {
        const { result } = renderHook(() =>
          useShowContactCustomerSupportModal({
            organization: organizationWithoutPayment,
            numberInvited: 5,
          })
        );

        expect(result.current.shouldOpenContactCustomerSupportModal).toBe(false);
      });
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      mockUseGetCustomerSupportModalFlag.mockReturnValue({
        enabled: true,
      });
    });

    it('should handle negative numberInvited values', () => {
      const { result } = renderHook(() =>
        useShowContactCustomerSupportModal({
          organization: mockOrganization,
          numberInvited: -1,
        })
      );

      expect(result.current.shouldOpenContactCustomerSupportModal).toBe(false);
    });

    it('should handle undefined numberInvited (defaults to 0)', () => {
      const { result } = renderHook(() =>
        useShowContactCustomerSupportModal({
          organization: mockOrganization,
          numberInvited: 0,
        })
      );

      expect(result.current.shouldOpenContactCustomerSupportModal).toBe(false);
    });

    it('should handle organization with null payment', () => {
      const organizationWithNullPayment: IOrganization = {
        ...mockOrganization,
        payment: null,
      } as IOrganization;

      const { result } = renderHook(() =>
        useShowContactCustomerSupportModal({
          organization: organizationWithNullPayment,
          numberInvited: 5,
        })
      );

      expect(result.current.shouldOpenContactCustomerSupportModal).toBe(false);
    });
  });
});
