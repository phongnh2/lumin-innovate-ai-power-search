import React from 'react';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { render as customRender } from 'features/CNC/utils/testUtil';

import { mockOrganization } from '../../__mocks__/mockOrganization';

import ReactivateModalWrapper from '../ReactivateModalWrapper';

import '@testing-library/jest-dom';

jest.mock('features/CNC/hooks', () => ({
  useOpenReactivateModal: jest.fn(),
}));

jest.mock('utils/lazyWithRetry', () => ({
  lazyWithRetry: jest.fn((importFn) => {
    importFn();
    return function MockReactivateModal() {
      return <div data-testid="reactivate-modal">ReactivateModal</div>;
    };
  }),
}));

jest.mock('i18next', () => ({
  __esModule: true,
  default: {
    t: jest.fn((key, options) => key),
    use: jest.fn().mockReturnThis(),
    init: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    services: {
      pluralResolver: {
        getSuffix: jest.fn(() => ''),
      },
    },
  },
}));

jest.mock('helpers/i18n', () => ({
  __esModule: true,
  default: {
    t: jest.fn((key, options) => key),
    use: jest.fn().mockReturnThis(),
    init: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    services: {
      pluralResolver: {
        getSuffix: jest.fn(() => ''),
      },
    },
  },
}));

const mockUseOpenReactivateModal = {
  open: true,
  onClose: jest.fn(),
};

const renderComponent = (props = {}) => {
  const defaultProps = {
    organization: mockOrganization,
    ...props,
  };

  return customRender(
    <MemoryRouter>
      <ReactivateModalWrapper {...defaultProps} />
    </MemoryRouter>
  );
};

describe('ReactivateModalWrapper', () => {
  const { useOpenReactivateModal } = require('features/CNC/hooks');

  beforeEach(() => {
    useOpenReactivateModal.mockReturnValue(mockUseOpenReactivateModal);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render ReactivateModal when open is true', () => {
    useOpenReactivateModal.mockReturnValue({
      ...mockUseOpenReactivateModal,
      open: true,
    });

    renderComponent();

    expect(screen.getByTestId('reactivate-modal')).toBeInTheDocument();
  });

  it('should not render ReactivateModal when open is false', () => {
    useOpenReactivateModal.mockReturnValue({
      ...mockUseOpenReactivateModal,
      open: false,
    });

    renderComponent();

    expect(screen.queryByTestId('reactivate-modal')).not.toBeInTheDocument();
  });
});
