import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import ModalConfirmInformation from '../ModalConfirmInformation';
import * as hooks from 'hooks';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';

jest.mock('assets/images/informative-modal1.png', () => 'cover-image-1.png');
jest.mock('assets/images/informative-modal2.png', () => 'cover-image-2.png');
jest.mock('assets/reskin/images/illustration-magic.png', () => 'illustration-magic.png');
jest.mock('assets/reskin/images/illustration-paper-plane.png', () => 'illustration-paper-plane.png');

jest.mock('hooks', () => ({
  useTranslation: jest.fn(),
  useEnableWebReskin: jest.fn(),
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  Dialog: ({ children, opened, onClose }: any) =>
    opened ? (
      <div data-testid="kiwi-dialog" onClick={onClose}>
        {children}
      </div>
    ) : null,
  Text: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Icomoon: ({ type }: any) => <span data-testid={`icon-${type}`} />,
  Button: ({ children, onClick, variant }: any) => (
    <button data-testid={variant === 'outlined' ? 'cancel-button' : 'confirm-button'} onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock(
  'lumin-components/Dialog',
  () =>
    ({ children, open, onClose }: any) =>
      open ? (
        <div data-testid="legacy-dialog" onClick={onClose}>
          {children}
        </div>
      ) : null
);

jest.mock('luminComponents/ButtonMaterial', () => ({
  __esModule: true,
  default: ({ children, onClick, color }: any) => (
    <button data-testid={color === 'TERTIARY' ? 'legacy-cancel-button' : 'legacy-confirm-button'} onClick={onClick}>
      {children}
    </button>
  ),
  ButtonSize: {
    XL: 'xl',
  },
}));

jest.mock('luminComponents/ButtonMaterial/types/ButtonColor', () => ({
  ButtonColor: {
    TERTIARY: 'TERTIARY',
  },
}));

jest.mock('react-i18next', () => ({
  Trans: ({ i18nKey, values, components }: any) => (
    <span data-testid="trans-component">
      {i18nKey} - {values?.currencySymbol}
      {values?.creditBalance}
    </span>
  ),
}));

jest.mock('utils', () => ({
  numberUtils: {
    formatTwoDigitsDecimal: (value: string) => value,
  },
}));

jest.mock('utils/string', () => ({
  __esModule: true,
  default: {
    isIgnoreCaseEqual: (str1: string, str2: string) => {
      if (!str1 || !str2) return false;
      return str1.toLowerCase() === str2.toLowerCase();
    },
  },
}));

const mockTranslation = {
  t: (key: string) => key,
};

describe('ModalConfirmInformation', () => {
  const defaultProps = {
    userRole: ORGANIZATION_ROLES.BUSINESS_MANAGER,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    currencySymbol: '$',
    creditBalance: '100.00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (hooks.useTranslation as jest.Mock).mockReturnValue(mockTranslation);
  });

  describe('Reskin enabled', () => {
    beforeEach(() => {
      (hooks.useEnableWebReskin as jest.Mock).mockReturnValue({ isEnableReskin: true });
    });

    it('should render reskin modal for admin role', () => {
      render(<ModalConfirmInformation {...defaultProps} userRole={ORGANIZATION_ROLES.ORGANIZATION_ADMIN} />);

      expect(screen.getByTestId('kiwi-dialog')).toBeInTheDocument();
      expect(screen.getByText('modalConfirmInformation.titleHeaderForCA')).toBeInTheDocument();
      expect(screen.getByText('modalConfirmInformation.content.descriptionForCA')).toBeInTheDocument();
      expect(screen.getByAltText('illustration modal')).toHaveAttribute('src', 'illustration-paper-plane.png');
    });

    it('should render reskin modal for business manager role', () => {
      render(<ModalConfirmInformation {...defaultProps} />);

      expect(screen.getByTestId('kiwi-dialog')).toBeInTheDocument();
      expect(screen.getByText('modalConfirmInformation.titleHeaderForBM')).toBeInTheDocument();
      expect(screen.getByTestId('trans-component')).toBeInTheDocument();
      expect(screen.getByAltText('illustration modal')).toHaveAttribute('src', 'illustration-paper-plane.png');
    });

    it('should render all tools in reskin modal', () => {
      render(<ModalConfirmInformation {...defaultProps} />);

      expect(screen.getByText('modalConfirmInformation.content.tool1')).toBeInTheDocument();
      expect(screen.getByText('modalConfirmInformation.content.tool2')).toBeInTheDocument();
      expect(screen.getByText('modalConfirmInformation.content.tool3')).toBeInTheDocument();
      expect(screen.getByText('modalConfirmInformation.content.tool4')).toBeInTheDocument();
      expect(screen.getByText('modalConfirmInformation.content.note')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button clicked in reskin modal', () => {
      render(<ModalConfirmInformation {...defaultProps} />);

      fireEvent.click(screen.getByTestId('cancel-button'));
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(2);
    });

    it('should call onConfirm when confirm button clicked in reskin modal', () => {
      render(<ModalConfirmInformation {...defaultProps} />);

      fireEvent.click(screen.getByTestId('confirm-button'));
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('Reskin disabled', () => {
    beforeEach(() => {
      (hooks.useEnableWebReskin as jest.Mock).mockReturnValue({ isEnableReskin: false });
    });

    it('should render legacy modal for admin role', () => {
      render(<ModalConfirmInformation {...defaultProps} userRole={ORGANIZATION_ROLES.ORGANIZATION_ADMIN} />);

      expect(screen.getByTestId('legacy-dialog')).toBeInTheDocument();
      expect(screen.getByText('modalConfirmInformation.titleHeaderForCA')).toBeInTheDocument();
      expect(screen.getByText('modalConfirmInformation.content.descriptionForCA')).toBeInTheDocument();
      expect(screen.getByAltText('banner')).toBeInTheDocument();
    });

    it('should render legacy modal for business manager role', () => {
      render(<ModalConfirmInformation {...defaultProps} />);

      expect(screen.getByTestId('legacy-dialog')).toBeInTheDocument();
      expect(screen.getByText('modalConfirmInformation.titleHeaderForBM')).toBeInTheDocument();
      expect(screen.getByTestId('trans-component')).toBeInTheDocument();
    });

    it('should render all tools in legacy modal', () => {
      render(<ModalConfirmInformation {...defaultProps} />);

      expect(screen.getByText('modalConfirmInformation.content.tool1')).toBeInTheDocument();
      expect(screen.getByText('modalConfirmInformation.content.tool2')).toBeInTheDocument();
      expect(screen.getByText('modalConfirmInformation.content.tool3')).toBeInTheDocument();
      expect(screen.getByText('modalConfirmInformation.content.tool4')).toBeInTheDocument();
      expect(screen.getByText('modalConfirmInformation.content.note')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button clicked in legacy modal', () => {
      render(<ModalConfirmInformation {...defaultProps} />);

      fireEvent.click(screen.getByTestId('legacy-cancel-button'));
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(2);
    });

    it('should call onConfirm when confirm button clicked in legacy modal', () => {
      render(<ModalConfirmInformation {...defaultProps} />);

      fireEvent.click(screen.getByTestId('legacy-confirm-button'));
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });
  });
});
