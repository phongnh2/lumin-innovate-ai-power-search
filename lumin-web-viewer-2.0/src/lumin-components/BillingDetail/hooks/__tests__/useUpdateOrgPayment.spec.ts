import { renderHook } from '@testing-library/react';
import { BroadcastChannel } from 'broadcast-channel';

import useUpdateOrgPayment from '../useUpdateOrgPayment';
import actions from 'actions';

const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  batch: (fn: () => void) => fn(),
}));

jest.mock('actions', () => ({
  updateCurrentOrganization: jest.fn((data) => ({ type: 'UPDATE_CURRENT_ORG', data })),
  updateOrganizationInList: jest.fn((id, data) => ({ type: 'UPDATE_ORG_LIST', id, data })),
}));

jest.mock('broadcast-channel', () => ({
  BroadcastChannel: jest.fn().mockImplementation(() => ({
    postMessage: jest.fn(),
    close: jest.fn(),
  })),
}));

describe('useUpdateOrgPayment', () => {
  const mockOrganization = {
    _id: 'org-123',
    payment: {
      type: 'ORG_PRO',
      status: 'ACTIVE',
      subscriptionItems: [] as any,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns updateOrganizationPayment function', () => {
    const { result } = renderHook(() => useUpdateOrgPayment({ organization: mockOrganization as any }));

    expect(result.current.updateOrganizationPayment).toBeDefined();
    expect(typeof result.current.updateOrganizationPayment).toBe('function');
  });

  it('dispatches actions and broadcasts when updating payment', () => {
    const { result } = renderHook(() => useUpdateOrgPayment({ organization: mockOrganization as any }));

    const newPaymentData = {
      status: 'CANCELED',
    };

    result.current.updateOrganizationPayment(newPaymentData as any);

    expect(actions.updateCurrentOrganization).toHaveBeenCalledWith({
      payment: expect.objectContaining({
        type: 'ORG_PRO',
        status: 'CANCELED',
      }),
    });

    expect(actions.updateOrganizationInList).toHaveBeenCalledWith('org-123', {
      payment: expect.objectContaining({
        status: 'CANCELED',
      }),
      isPayment: true,
    });

    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  it('creates BroadcastChannel and posts message', () => {
    const { result } = renderHook(() => useUpdateOrgPayment({ organization: mockOrganization as any }));

    result.current.updateOrganizationPayment({ status: 'TRIALING' } as any);

    expect(BroadcastChannel).toHaveBeenCalled();
  });

  it('handles subscriptionItems override correctly', () => {
    const { result } = renderHook(() => useUpdateOrgPayment({ organization: mockOrganization as any }));

    const newSubscriptionItems = [{ productName: 'PDF', paymentStatus: 'ACTIVE' }];

    result.current.updateOrganizationPayment({
      subscriptionItems: newSubscriptionItems as any,
    } as any);

    expect(actions.updateCurrentOrganization).toHaveBeenCalledWith({
      payment: expect.objectContaining({
        subscriptionItems: newSubscriptionItems,
      }),
    });
  });

  it('merges payment data correctly', () => {
    const { result } = renderHook(() => useUpdateOrgPayment({ organization: mockOrganization as any }));

    result.current.updateOrganizationPayment({
      quantity: 10,
    } as any);

    expect(actions.updateCurrentOrganization).toHaveBeenCalledWith({
      payment: expect.objectContaining({
        type: 'ORG_PRO',
        status: 'ACTIVE',
        quantity: 10,
      }),
    });
  });
});
