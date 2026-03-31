import React from 'react';
import { render, screen } from '@testing-library/react';
import BillingDetailLoading from '../../BillingDetail/components/BillingDetailLoading/BillingDetailLoading';

jest.mock('lumin-ui/kiwi-ui', () => ({
  Skeleton: ({ width, height, radius, circle, mb }: any) => (
    <div
      data-testid="skeleton"
      data-width={width}
      data-height={height}
      data-radius={radius}
      data-circle={circle}
      data-mb={mb}
    />
  ),
  Divider: () => <div data-testid="divider" />,
}));

jest.mock('hooks', () => ({
  useMobileMatch: jest.fn(),
}));

const { useMobileMatch } = require('hooks');

describe('BillingDetailLoading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly in desktop mode', () => {
    useMobileMatch.mockReturnValue(false);

    render(<BillingDetailLoading />);

    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).not.toBeNull();
  });

  test('renders correctly in mobile mode', () => {
    useMobileMatch.mockReturnValue(true);

    render(<BillingDetailLoading />);

    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).not.toBeNull();
  });
});
