import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import TempBillingSkeleton from '../TempBillingSkeleton';
import * as hooks from 'hooks';

jest.mock('hooks', () => ({
  useEnableWebReskin: jest.fn(),
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  Skeleton: ({ width, height, radius, color }: any) => (
    <div data-testid="kiwi-skeleton" data-width={width} data-height={height} data-radius={radius} data-color={color} />
  ),
}));

jest.mock('lumin-components/Shared/Skeleton', () => ({ width, height, gap }: any) => (
  <div data-testid="legacy-skeleton" data-width={width} data-height={height} data-gap={JSON.stringify(gap)} />
));

describe('TempBillingSkeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Reskin enabled', () => {
    beforeEach(() => {
      (hooks.useEnableWebReskin as jest.Mock).mockReturnValue({ isEnableReskin: true });
    });

    it('should render kiwi skeletons with correct props', () => {
      render(<TempBillingSkeleton />);

      const skeletons = screen.getAllByTestId('kiwi-skeleton');
      expect(skeletons).toHaveLength(3);

      expect(skeletons[0]).toHaveAttribute('data-width', '100');
      expect(skeletons[0]).toHaveAttribute('data-height', '12');
      expect(skeletons[1]).toHaveAttribute('data-width', '202');
      expect(skeletons[1]).toHaveAttribute('data-height', '20');
      expect(skeletons[2]).toHaveAttribute('data-width', '134');
      expect(skeletons[2]).toHaveAttribute('data-height', '12');
    });
  });

  describe('Reskin disabled', () => {
    beforeEach(() => {
      (hooks.useEnableWebReskin as jest.Mock).mockReturnValue({ isEnableReskin: false });
    });

    it('should render legacy skeletons with correct props', () => {
      render(<TempBillingSkeleton />);

      const skeletons = screen.getAllByTestId('legacy-skeleton');
      expect(skeletons).toHaveLength(3);

      expect(skeletons[0]).toHaveAttribute('data-width', '30%');
      expect(skeletons[1]).toHaveAttribute('data-width', '60%');
      expect(skeletons[1]).toHaveAttribute('data-gap', JSON.stringify({ top: 16, bottom: 16 }));
      expect(skeletons[2]).toHaveAttribute('data-width', '40%');
    });
  });
});
