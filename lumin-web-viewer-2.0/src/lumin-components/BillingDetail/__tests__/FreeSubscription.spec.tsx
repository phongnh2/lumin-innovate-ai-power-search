import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { KiwiProvider } from 'lumin-ui/kiwi-ui';

import FreeSubscription from '../components/SubscriptionDetail/FreeSubscription';
import actions from 'actions';

const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(),
}));

const mockUseSelector = require('react-redux').useSelector as jest.Mock;

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (s: string) => s }),
  useAvailablePersonalWorkspace: () => false,
  useMobileMatch: () => false,
}));

jest.mock('hooks/useTrackingBillingEventName', () => ({
  useTrackingBillingEventName: () => ({
    getTrackStartTrialEventName: () => 'start_trial',
    getTrackGoPremiumEventName: () => 'go_premium',
  }),
}));

jest.mock('utils/payment', () => {
  return {
    PaymentUrlSerializer: class {
      of() {
        return this;
      }
      period() {
        return this;
      }
      trial() {
        return this;
      }
      returnUrlParam() {
        return this;
      }
      plan() {
        return this;
      }
      get() {
        return '/mock-url';
      }
    },
    PaymentHelpers: {
      evaluateTrialPlan: () => 'pro',
    },
  };
});

jest.mock('utils', () => ({
  commonUtils: {
    formatTitleCaseByLocale: (s: string) => s,
  },
}));

jest.mock('actions', () => ({
  resetOrganization: jest.fn(() => ({ type: 'RESET_ORG' })),
}));

describe('FreeSubscription', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderUI = (organization: any) => {
    return render(
      <MantineProvider>
        <KiwiProvider>
          <BrowserRouter>
            <FreeSubscription organization={organization} />
          </BrowserRouter>
        </KiwiProvider>
      </MantineProvider>
    );
  };

  test('renders Start Free Trial when canStartTrial = true', () => {
    mockUseSelector.mockImplementation(() => ({ data: { url: 'abc' } }));

    const org = {
      _id: '1',
      url: 'xyz',
      payment: { trialInfo: { canStartTrial: true } },
    };

    renderUI(org);

    expect(screen.getByText('settingBilling.startFreeTrial')).toBeInTheDocument();
  });

  test('dispatches resetOrganization when clicking button if url differs', () => {
    mockUseSelector.mockImplementation(() => ({ data: { url: 'aaa' } }));

    const org = {
      _id: '1',
      url: 'bbb',
      payment: { trialInfo: { canStartTrial: false } },
    };

    renderUI(org);

    fireEvent.click(screen.getByRole('button'));

    expect(mockDispatch).toHaveBeenCalledWith(actions.resetOrganization());
  });

  test('does NOT dispatch resetOrganization when url is same', () => {
    mockUseSelector.mockImplementation(() => ({ data: { url: 'same' } }));

    const org = {
      _id: '1',
      url: 'same',
      payment: { trialInfo: { canStartTrial: false } },
    };

    renderUI(org);

    fireEvent.click(screen.getByRole('button'));

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
