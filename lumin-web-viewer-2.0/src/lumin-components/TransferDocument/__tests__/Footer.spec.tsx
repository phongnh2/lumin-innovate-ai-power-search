import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mutable mock state
const mockContextState = {
  destination: { _id: 'dest-123', type: 'ORGANIZATION' },
  context: { submit: 'modalMove.move', isCopyModal: false },
  isProcessing: false,
  selectedTarget: { _id: 'org-123', name: 'Test Org' },
  errorName: '',
  disableTarget: 'disable-123',
  documents: [{ belongsTo: { workspaceId: 'workspace-123' } }],
  personalData: { _id: 'user-123', isOldProfessional: false },
  isPersonalTargetSelected: false,
};

const mockOnClose = jest.fn();
const mockOnSubmit = jest.fn();
let mockIsEnableReskin = false;

jest.mock('luminComponents/TransferDocument/hooks', () => ({
  useTransferDocumentContext: () => ({
    getter: mockContextState,
    setter: { onClose: mockOnClose },
    onSubmit: mockOnSubmit,
  }),
}));

jest.mock('hooks', () => ({
  useEnableWebReskin: () => ({ isEnableReskin: mockIsEnableReskin }),
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  Button: ({ children, onClick, disabled, loading, variant, size }: React.PropsWithChildren<{ onClick?: () => void; disabled?: boolean; loading?: boolean; variant?: string; size?: string }>) => {
    const React = require('react');
    return React.createElement('button', {
      onClick: onClick,
      disabled: disabled,
      'data-loading': loading,
      'data-variant': variant,
      'data-size': size,
    }, children);
  },
  PlainTooltip: ({ children, content }: React.PropsWithChildren<{ content: string }>) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'plain-tooltip', 'data-content': content }, children);
  },
}));

jest.mock('lumin-components/ButtonMaterial/types/ButtonColor', () => ({
  ButtonColor: { TERTIARY: 'tertiary' },
}));

jest.mock('luminComponents/ButtonMaterial', () => ({
  ButtonSize: { SM: 'sm', MD: 'md' },
}));

jest.mock('luminComponents/TransferDocument/interfaces/TransferDocument.interface', () => ({
  DestinationLocation: {
    FOLDER: 'FOLDER',
    ORGANIZATION: 'ORGANIZATION',
    PERSONAL: 'PERSONAL',
    ORGANIZATION_TEAM: 'ORGANIZATION_TEAM',
  },
}));

jest.mock('luminComponents/TransferDocument/components/Footer/Footer.styled', () => ({
  FooterContainer: ({ children }: React.PropsWithChildren<object>) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'footer-container' }, children);
  },
  FooterContainerReskin: ({ children }: React.PropsWithChildren<object>) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'footer-container-reskin' }, children);
  },
  Button: ({ children, onClick, disabled, loading, color }: React.PropsWithChildren<{ onClick?: () => void; disabled?: boolean; loading?: boolean; color?: string }>) => {
    const React = require('react');
    return React.createElement('button', {
      onClick: onClick,
      disabled: disabled,
      'data-loading': loading,
      'data-color': color,
    }, children);
  },
}));

// Import after mocks
import Footer from 'luminComponents/TransferDocument/components/Footer';

describe('Footer', () => {
  const resetMockState = () => {
    mockContextState.destination = { _id: 'dest-123', type: 'ORGANIZATION' };
    mockContextState.context = { submit: 'modalMove.move', isCopyModal: false };
    mockContextState.isProcessing = false;
    mockContextState.selectedTarget = { _id: 'org-123', name: 'Test Org' };
    mockContextState.errorName = '';
    mockContextState.disableTarget = 'disable-123';
    mockContextState.documents = [{ belongsTo: { workspaceId: 'workspace-123' } }];
    mockContextState.personalData = { _id: 'user-123', isOldProfessional: false };
    mockContextState.isPersonalTargetSelected = false;
    mockIsEnableReskin = false;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetMockState();
  });

  describe('Non-Reskin Mode', () => {
    it('should render footer container', () => {
      render(<Footer />);
      expect(screen.getByTestId('footer-container')).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(<Footer />);
      expect(screen.getByText('modalMove.cancel')).toBeInTheDocument();
    });

    it('should render submit button with correct text', () => {
      render(<Footer />);
      expect(screen.getByText('modalMove.move')).toBeInTheDocument();
    });

    it('should call onClose when cancel button clicked', () => {
      render(<Footer />);
      fireEvent.click(screen.getByText('modalMove.cancel'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onSubmit when submit button clicked', () => {
      render(<Footer />);
      fireEvent.click(screen.getByText('modalMove.move'));
      expect(mockOnSubmit).toHaveBeenCalledWith({ target: mockContextState.selectedTarget });
    });

    it('should disable submit button when errorName exists', () => {
      mockContextState.errorName = 'Some error';
      render(<Footer />);
      const submitBtn = screen.getByText('modalMove.move');
      expect(submitBtn).toBeDisabled();
    });

    it('should disable submit button when destination._id is empty', () => {
      mockContextState.destination = { _id: '', type: 'ORGANIZATION' };
      render(<Footer />);
      const submitBtn = screen.getByText('modalMove.move');
      expect(submitBtn).toBeDisabled();
    });

    it('should show loading state when isProcessing is true', () => {
      mockContextState.isProcessing = true;
      render(<Footer />);
      const submitBtn = screen.getByText('modalMove.move');
      expect(submitBtn).toHaveAttribute('data-loading', 'true');
    });
  });

  describe('Reskin Mode', () => {
    beforeEach(() => {
      mockIsEnableReskin = true;
    });

    it('should render reskin footer container', () => {
      render(<Footer />);
      expect(screen.getByTestId('footer-container-reskin')).toBeInTheDocument();
    });

    it('should render cancel button in reskin mode', () => {
      render(<Footer />);
      expect(screen.getByText('modalMove.cancel')).toBeInTheDocument();
    });

    it('should render submit button in reskin mode', () => {
      render(<Footer />);
      expect(screen.getByText('modalMove.move')).toBeInTheDocument();
    });

    it('should call onClose when cancel button clicked in reskin mode', () => {
      render(<Footer />);
      fireEvent.click(screen.getByText('modalMove.cancel'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onSubmit when submit button clicked in reskin mode', () => {
      render(<Footer />);
      fireEvent.click(screen.getByText('modalMove.move'));
      expect(mockOnSubmit).toHaveBeenCalledWith({ target: mockContextState.selectedTarget });
    });

    it('should disable cancel button when isProcessing is true', () => {
      mockContextState.isProcessing = true;
      render(<Footer />);
      const cancelBtn = screen.getByText('modalMove.cancel');
      expect(cancelBtn).toBeDisabled();
    });

    it('should show PlainTooltip wrapper', () => {
      render(<Footer />);
      expect(screen.getByTestId('plain-tooltip')).toBeInTheDocument();
    });

    it('should show tooltip with file already here message for single file', () => {
      // Set up condition for fileAlreadyInThisPlace to be true
      mockContextState.destination = { _id: 'disable-123', type: 'ORGANIZATION' };
      mockContextState.disableTarget = 'disable-123';
      mockContextState.documents = [{ belongsTo: { workspaceId: 'workspace-123' } }];
      
      render(<Footer />);
      expect(screen.getByTestId('plain-tooltip')).toHaveAttribute('data-content', 'modalMove.tooltipFileIsAlreadyHere');
    });

    it('should show tooltip with files already here message for multiple files', () => {
      mockContextState.destination = { _id: 'disable-123', type: 'ORGANIZATION' };
      mockContextState.disableTarget = 'disable-123';
      mockContextState.documents = [
        { belongsTo: { workspaceId: 'workspace-123' } },
        { belongsTo: { workspaceId: 'workspace-123' } },
      ];
      
      render(<Footer />);
      expect(screen.getByTestId('plain-tooltip')).toHaveAttribute('data-content', 'modalMove.tooltipFilesAreAlreadyHere');
    });
  });

  describe('fileAlreadyInThisPlace logic', () => {
    beforeEach(() => {
      mockIsEnableReskin = true;
    });

    it('should return true when destination matches disableTarget and not personal', () => {
      mockContextState.destination = { _id: 'disable-123', type: 'ORGANIZATION' };
      mockContextState.disableTarget = 'disable-123';
      
      render(<Footer />);
      const tooltip = screen.getByTestId('plain-tooltip');
      expect(tooltip.getAttribute('data-content')).toBe('modalMove.tooltipFileIsAlreadyHere');
    });

    it('should return false when destination does not match disableTarget', () => {
      mockContextState.destination = { _id: 'different-123', type: 'ORGANIZATION' };
      mockContextState.disableTarget = 'disable-123';
      
      render(<Footer />);
      const tooltip = screen.getByTestId('plain-tooltip');
      expect(tooltip.getAttribute('data-content')).toBe('');
    });

    it('should return false when destination type is PERSONAL', () => {
      mockContextState.destination = { _id: 'disable-123', type: 'PERSONAL' };
      mockContextState.disableTarget = 'disable-123';
      
      render(<Footer />);
      // When type is PERSONAL, fileAlreadyInThisPlace should be false
      const tooltip = screen.getByTestId('plain-tooltip');
      expect(tooltip.getAttribute('data-content')).toBe('');
    });

    it('should handle isBelongsToMyDocuments when isOldProfessional is false', () => {
      mockContextState.personalData = { _id: 'user-123', isOldProfessional: false };
      mockContextState.destination = { _id: 'user-123', type: 'PERSONAL' };
      mockContextState.disableTarget = 'user-123';
      mockContextState.documents = [{ belongsTo: { workspaceId: 'workspace-123' } }];
      mockContextState.isPersonalTargetSelected = false;
      
      render(<Footer />);
      const tooltip = screen.getByTestId('plain-tooltip');
      // isOldProfessional=false means isBelongsToMyDocuments=true
      // disableTarget matches personalData._id
      expect(tooltip.getAttribute('data-content')).toBe('modalMove.tooltipFileIsAlreadyHere');
    });

    it('should handle isBelongsToMyDocuments when isOldProfessional is true and isPersonalTargetSelected matches workspaceId', () => {
      mockContextState.personalData = { _id: 'user-123', isOldProfessional: true };
      mockContextState.destination = { _id: 'user-123', type: 'PERSONAL' };
      mockContextState.disableTarget = 'user-123';
      mockContextState.documents = [{ belongsTo: { workspaceId: 'workspace-123' } }];
      mockContextState.isPersonalTargetSelected = true; // true !== Boolean('workspace-123') which is true, so false
      
      render(<Footer />);
      // isOldProfessional=true and isPersonalTargetSelected=true, workspaceId exists
      // isPersonalTargetSelected !== Boolean(workspaceId) => true !== true => false
      // So isBelongsToMyDocuments = false
    });

    it('should handle isBelongsToMyDocuments when isOldProfessional is true and isPersonalTargetSelected is false', () => {
      mockContextState.personalData = { _id: 'user-123', isOldProfessional: true };
      mockContextState.destination = { _id: 'user-123', type: 'PERSONAL' };
      mockContextState.disableTarget = 'user-123';
      mockContextState.documents = [{ belongsTo: { workspaceId: 'workspace-123' } }];
      mockContextState.isPersonalTargetSelected = false; // false !== true => true
      
      render(<Footer />);
      // isPersonalTargetSelected !== Boolean(workspaceId) => false !== true => true
      // So isBelongsToMyDocuments = true
    });

    it('should check destination._id equals workspaceId with PERSONAL type', () => {
      mockContextState.personalData = { _id: 'user-123', isOldProfessional: false };
      mockContextState.destination = { _id: 'workspace-123', type: 'PERSONAL' };
      mockContextState.disableTarget = 'user-123';
      mockContextState.documents = [{ belongsTo: { workspaceId: 'workspace-123' } }];
      
      render(<Footer />);
      const tooltip = screen.getByTestId('plain-tooltip');
      // destination._id === workspaceId && destination.type === PERSONAL
      expect(tooltip.getAttribute('data-content')).toBe('modalMove.tooltipFileIsAlreadyHere');
    });

    it('should check destination._id equals personalData._id', () => {
      mockContextState.personalData = { _id: 'user-123', isOldProfessional: false };
      mockContextState.destination = { _id: 'user-123', type: 'FOLDER' };
      mockContextState.disableTarget = 'user-123';
      mockContextState.documents = [{ belongsTo: { workspaceId: 'workspace-123' } }];
      
      render(<Footer />);
      const tooltip = screen.getByTestId('plain-tooltip');
      // destination._id === personalData._id (doesn't need PERSONAL type for this check)
      expect(tooltip.getAttribute('data-content')).toBe('modalMove.tooltipFileIsAlreadyHere');
    });

    it('should handle workspaceId being null/undefined', () => {
      mockContextState.personalData = { _id: 'user-123', isOldProfessional: false };
      mockContextState.destination = { _id: 'user-123', type: 'PERSONAL' };
      mockContextState.disableTarget = 'user-123';
      mockContextState.documents = [{ belongsTo: { workspaceId: null } }];
      
      render(<Footer />);
      const tooltip = screen.getByTestId('plain-tooltip');
      expect(tooltip.getAttribute('data-content')).toBe('modalMove.tooltipFileIsAlreadyHere');
    });
  });

  describe('Button States', () => {
    it('should render both buttons', () => {
      render(<Footer />);
      expect(screen.getByText('modalMove.cancel')).toBeInTheDocument();
      expect(screen.getByText('modalMove.move')).toBeInTheDocument();
    });
  });

  describe('Submit button disabled conditions in reskin mode', () => {
    beforeEach(() => {
      mockIsEnableReskin = true;
    });

    it('should disable submit when errorName is present', () => {
      mockContextState.errorName = 'Error message';
      render(<Footer />);
      const buttons = screen.getAllByRole('button');
      const submitBtn = buttons.find(btn => btn.textContent === 'modalMove.move');
      expect(submitBtn).toBeDisabled();
    });

    it('should disable submit when destination._id is empty', () => {
      mockContextState.destination = { _id: '', type: 'ORGANIZATION' };
      render(<Footer />);
      const buttons = screen.getAllByRole('button');
      const submitBtn = buttons.find(btn => btn.textContent === 'modalMove.move');
      expect(submitBtn).toBeDisabled();
    });

    it('should disable submit when fileAlreadyInThisPlace is true', () => {
      mockContextState.destination = { _id: 'disable-123', type: 'ORGANIZATION' };
      mockContextState.disableTarget = 'disable-123';
      render(<Footer />);
      const buttons = screen.getAllByRole('button');
      const submitBtn = buttons.find(btn => btn.textContent === 'modalMove.move');
      expect(submitBtn).toBeDisabled();
    });

    it('should enable submit when all conditions are met', () => {
      mockContextState.errorName = '';
      mockContextState.destination = { _id: 'valid-dest', type: 'ORGANIZATION' };
      mockContextState.disableTarget = 'different-target';
      render(<Footer />);
      const buttons = screen.getAllByRole('button');
      const submitBtn = buttons.find(btn => btn.textContent === 'modalMove.move');
      expect(submitBtn).not.toBeDisabled();
    });
  });

  describe('Context submit text', () => {
    it('should display context.submit text from context', () => {
      mockContextState.context = { submit: 'modalCopy.copy', isCopyModal: true };
      render(<Footer />);
      expect(screen.getByText('modalCopy.copy')).toBeInTheDocument();
    });
  });
});
