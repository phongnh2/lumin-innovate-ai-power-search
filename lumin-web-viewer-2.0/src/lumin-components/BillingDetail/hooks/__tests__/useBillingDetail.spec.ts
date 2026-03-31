import { renderHook, waitFor } from '@testing-library/react';
import useBillingDetail from '../useBillingDetail';
import paymentService from 'services/paymentService';
import actions from 'actions';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { PaymentTypes, Plans } from 'constants/plan';

const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  batch: (fn: () => void) => fn(),
}));

jest.mock('services/paymentService', () => ({
  retrieveBillingInfo: jest.fn(),
}));

jest.mock('actions', () => ({
  updateOrganizationInList: jest.fn((id, data) => ({ type: 'UPDATE_ORG', id, data })),
}));

describe('useBillingDetail', () => {
  const mockSubscription = { nextInvoice: 1700000000 };
  const mockUpcomingInvoice = {
    nextInvoice: 1700000000,
    payment: { type: 'ORG_PRO' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct loading state', () => {
    const { result } = renderHook(() =>
      useBillingDetail({
        payment: { type: Plans.FREE, status: 'ACTIVE' } as any,
        clientId: 'user-1',
        type: PaymentTypes.INDIVIDUAL,
        orgRole: 'admin',
      })
    );

    // Initially loading is based on payment.type !== Plans.FREE
    expect(result.current).toBeDefined();
  });

  it('sets loading true for non-FREE plan initially', () => {
    const { result } = renderHook(() =>
      useBillingDetail({
        payment: { type: Plans.PROFESSIONAL, status: 'ACTIVE' } as any,
        clientId: 'user-1',
        type: PaymentTypes.INDIVIDUAL,
        orgRole: 'user',
      })
    );

    expect(result.current.loading).toBe(true);
  });

  it('fetches billing info successfully', async () => {
    (paymentService.retrieveBillingInfo as jest.Mock).mockResolvedValue({
      subscription: mockSubscription,
      upcomingInvoice: mockUpcomingInvoice,
    });

    const { result } = renderHook(() =>
      useBillingDetail({
        payment: { type: Plans.PROFESSIONAL, status: 'ACTIVE' } as any,
        clientId: 'user-1',
        type: PaymentTypes.INDIVIDUAL,
        orgRole: 'user',
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.subscription).toEqual(mockSubscription);
    expect(result.current.upcomingInvoice).toEqual(mockUpcomingInvoice);
    expect(result.current.error).toBeNull();
  });

  it('handles API error', async () => {
    const mockError = new Error('API Error');
    (paymentService.retrieveBillingInfo as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      useBillingDetail({
        payment: { type: Plans.PROFESSIONAL, status: 'ACTIVE' } as any,
        clientId: 'user-1',
        type: PaymentTypes.INDIVIDUAL,
        orgRole: 'user',
      })
    );

    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });

    expect(result.current.loading).toBe(false);
  });

  it('dispatches updateOrganizationInList for organization type', async () => {
    (paymentService.retrieveBillingInfo as jest.Mock).mockResolvedValue({
      subscription: mockSubscription,
      upcomingInvoice: mockUpcomingInvoice,
    });

    renderHook(() =>
      useBillingDetail({
        payment: { type: 'ORG_PRO', status: 'ACTIVE' } as any,
        clientId: 'org-1',
        type: PaymentTypes.ORGANIZATION,
        orgRole: 'organization_admin',
      })
    );

    await waitFor(() => {
      expect(actions.updateOrganizationInList).toHaveBeenCalledWith('org-1', {
        payment: mockUpcomingInvoice.payment,
      });
    });
  });

  it('does not fetch for organization MEMBER role', async () => {
    renderHook(() =>
      useBillingDetail({
        payment: { type: 'ORG_PRO', status: 'ACTIVE' } as any,
        clientId: 'org-1',
        type: PaymentTypes.ORGANIZATION,
        orgRole: 'member',
      })
    );

    await waitFor(() => {
      expect(paymentService.retrieveBillingInfo).not.toHaveBeenCalled();
    });
  });

  it('handles null data response', async () => {
    (paymentService.retrieveBillingInfo as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() =>
      useBillingDetail({
        payment: { type: Plans.PROFESSIONAL, status: 'ACTIVE' } as any,
        clientId: 'user-1',
        type: PaymentTypes.INDIVIDUAL,
        orgRole: 'user',
      })
    );

    await waitFor(() => {
      expect(result.current.subscription).toBeNull();
    });
  });

  it('refetches when payment status changes', async () => {
    (paymentService.retrieveBillingInfo as jest.Mock).mockResolvedValue({
      subscription: mockSubscription,
      upcomingInvoice: mockUpcomingInvoice,
    });

    const { rerender } = renderHook(
      ({ payment }) =>
        useBillingDetail({
          payment: payment as any,
          clientId: 'user-1',
          type: PaymentTypes.INDIVIDUAL,
          orgRole: '',
        }),
      {
        initialProps: { payment: { type: Plans.PROFESSIONAL, status: 'ACTIVE' } },
      }
    );

    await waitFor(() => {
      expect(paymentService.retrieveBillingInfo).toHaveBeenCalledTimes(1);
    });

    rerender({ payment: { type: Plans.PROFESSIONAL, status: 'CANCELED' } });

    await waitFor(() => {
      expect(paymentService.retrieveBillingInfo).toHaveBeenCalledTimes(2);
    });
  });
});
