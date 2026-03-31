import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock hooks
jest.mock('hooks', () => ({
  useEnableWebReskin: () => ({ isEnableReskin: false }),
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  Trans: ({ i18nKey, values, children }: { i18nKey: string; values?: object; children?: React.ReactNode }) => {
    const React = require('react');
    return React.createElement('span', { 'data-testid': `trans-${i18nKey}` }, i18nKey);
  },
}));

// Mock assets
jest.mock('assets/lumin-svgs/icons-sematic-notify.svg', () => 'notify.svg');

// Mock lumin-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  Modal: ({ children, opened, title, onConfirm, onCancel, isProcessing }: React.PropsWithChildren<{
    opened: boolean; title: string; onConfirm: () => void; onCancel: () => void; isProcessing: boolean;
  }>) => {
    const React = require('react');
    if (!opened) return null;
    return React.createElement('div', { 'data-testid': 'kiwi-modal' },
      React.createElement('div', { 'data-testid': 'modal-title' }, title),
      React.createElement('div', { 'data-testid': 'modal-content' }, children),
      React.createElement('button', { 'data-testid': 'modal-confirm', onClick: onConfirm, disabled: isProcessing }, 'Confirm'),
      React.createElement('button', { 'data-testid': 'modal-cancel', onClick: onCancel }, 'Cancel')
    );
  },
  Checkbox: ({ onChange }: { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    const React = require('react');
    return React.createElement('input', { type: 'checkbox', 'data-testid': 'checkbox', onChange: onChange });
  },
  Text: ({ children }: React.PropsWithChildren<object>) => {
    const React = require('react');
    return React.createElement('span', { 'data-testid': 'text' }, children);
  },
}));

// Mock Dialog
jest.mock('lumin-components/Dialog', () => ({
  __esModule: true,
  default: ({ children, open, onClose }: React.PropsWithChildren<{ open: boolean; onClose: () => void }>) => {
    const React = require('react');
    if (!open) return null;
    return React.createElement('div', { 'data-testid': 'dialog' },
      React.createElement('button', { 'data-testid': 'dialog-close', onClick: onClose }, 'Close'),
      children
    );
  },
}));

// Mock styled-components
jest.mock('styled-components', () => ({
  ThemeProvider: ({ children }: React.PropsWithChildren<object>) => children,
}));

jest.mock('../components/MoveDocumentConfirmModal/MoveDocumentConfirmModal.styled', () => ({
  theme: { light: {} },
  Paper: ({ children }: React.PropsWithChildren<object>) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'paper' }, children);
  },
  Container: ({ children }: React.PropsWithChildren<object>) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'container' }, children);
  },
  Image: ({ src, alt }: { src: string; alt: string }) => {
    const React = require('react');
    return React.createElement('img', { 'data-testid': 'image', src: src, alt: alt });
  },
  Title: ({ children }: React.PropsWithChildren<object>) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'title' }, children);
  },
  Content: ({ children }: React.PropsWithChildren<object>) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'content' }, children);
  },
  ButtonContainer: ({ children }: React.PropsWithChildren<object>) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'button-container' }, children);
  },
  Button: ({ children, onClick, disabled, loading, className }: React.PropsWithChildren<{
    onClick: () => void; disabled?: boolean; loading?: boolean; className?: string;
  }>) => {
    const React = require('react');
    return React.createElement('button', {
      'data-testid': `button-${className}`,
      onClick: onClick,
      disabled: disabled,
      'data-loading': loading,
    }, children);
  },
  NotifyWrapper: ({ children }: React.PropsWithChildren<object>) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'notify-wrapper' }, children);
  },
  FormControlLabel: ({ label, control }: { label: React.ReactNode; control: React.ReactNode }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'form-control-label' }, label, control);
  },
  CheckBox: (props: any) => {
    const React = require('react');
    return React.createElement('input', { type: 'checkbox', 'data-testid': 'styled-checkbox', ...props });
  },
  Notify: ({ children }: React.PropsWithChildren<object>) => {
    const React = require('react');
    return React.createElement('span', { 'data-testid': 'notify' }, children);
  },
}));

jest.mock('../components/MoveDocumentConfirmModal/MoveDocumentConfirmModal.module.scss', () => ({
  targetText: 'targetText',
  notifyWrapper: 'notifyWrapper',
}));

jest.mock('constants/documentConstants', () => ({
  DOCUMENT_TYPE: {
    ORGANIZATION: 'ORGANIZATION',
    ORGANIZATION_TEAM: 'ORGANIZATION_TEAM',
    FOLDER: 'FOLDER',
  },
}));

jest.mock('constants/lumin-common', () => ({
  THEME_MODE: { LIGHT: 'light', DARK: 'dark' },
}));

jest.mock('constants/organizationConstants', () => ({
  MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION: 100,
}));

jest.mock('luminComponents/TransferDocument/interfaces/TransferDocument.interface', () => ({
  DestinationLocation: {
    FOLDER: 'FOLDER',
    ORGANIZATION: 'ORGANIZATION',
    PERSONAL: 'PERSONAL',
    ORGANIZATION_TEAM: 'ORGANIZATION_TEAM',
  },
}));

// Import after mocks
import MoveDocumentConfirmModal from 'luminComponents/TransferDocument/components/MoveDocumentConfirmModal';

// Mutable mock state
const mockState = {
  isEnableReskin: false,
};

jest.mock('hooks', () => ({
  useEnableWebReskin: () => ({ isEnableReskin: mockState.isEnableReskin }),
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('MoveDocumentConfirmModal', () => {
  const mockDocuments = [{ _id: 'doc-1', name: 'Test Document 1' }];
  const mockMultiDocuments = [{ _id: 'doc-1', name: 'Doc 1' }, { _id: 'doc-2', name: 'Doc 2' }];

  const mockTeamDestination = {
    _id: 'dest-123',
    name: 'Test Team',
    type: 'ORGANIZATION_TEAM',
    belongsTo: { _id: 'org-123', name: 'Test Org', type: 'ORGANIZATION' },
  };

  const mockOrgDestination = {
    _id: 'org-123',
    name: 'Test Org',
    type: 'ORGANIZATION',
    belongsTo: { _id: 'org-123', name: 'Test Org', type: 'ORGANIZATION' },
  };

  const mockFolderDestination = {
    _id: 'folder-123',
    name: 'Test Folder',
    type: 'FOLDER',
    belongsTo: { _id: 'org-123', name: 'Test Org', type: 'ORGANIZATION' },
  };

  const mockPersonalFolderDestination = {
    _id: 'folder-123',
    name: 'Personal Folder',
    type: 'FOLDER',
    belongsTo: { _id: 'user-123', name: 'My Documents', type: 'PERSONAL' },
  };

  const mockSelectedTarget = { _id: 'org-123', name: 'Test Org', totalActiveMember: 5 };
  const mockHighMemberTarget = { _id: 'org-123', name: 'Test Org', totalActiveMember: 150 };
  const mockSingleMemberTarget = { _id: 'org-123', name: 'Test Org', totalActiveMember: 1 };

  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    isMoving: false,
    handleMoveDocuments: jest.fn().mockResolvedValue(undefined),
    destination: mockTeamDestination,
    documents: mockDocuments as any,
    selectedTarget: mockSelectedTarget as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockState.isEnableReskin = false;
  });

  describe('Non-reskin Rendering', () => {
    it('renders dialog when visible', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} />);
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('does not render when not visible', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} visible={false} />);
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('renders confirmation title', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} />);
      expect(screen.getByTestId('title')).toHaveTextContent('modalMove.confirmation');
    });

    it('renders cancel button', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} />);
      expect(screen.getByTestId('button-secondary')).toHaveTextContent('common.cancel');
    });

    it('renders move button', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} />);
      expect(screen.getByTestId('button-primary')).toHaveTextContent('common.move');
    });

    it('renders image', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} />);
      expect(screen.getByTestId('image')).toBeInTheDocument();
    });
  });

  describe('Non-reskin Interactions', () => {
    it('calls onClose when cancel button clicked', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('button-secondary'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls handleMoveDocuments when move button clicked', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('button-primary'));
      expect(defaultProps.handleMoveDocuments).toHaveBeenCalledWith({ isNotify: false });
    });

    it('disables cancel button when moving', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} isMoving={true} />);
      expect(screen.getByTestId('button-secondary')).toBeDisabled();
    });

    it('shows moving text when moving', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} isMoving={true} />);
      expect(screen.getByTestId('button-primary')).toHaveTextContent('common.moving');
    });

    it('sets loading state on primary button', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} isMoving={true} />);
      expect(screen.getByTestId('button-primary')).toHaveAttribute('data-loading', 'true');
    });
  });

  describe('Content for Team Destination', () => {
    it('renders ownership transfer message', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} />);
      expect(screen.getByTestId('trans-modalMove.ownershipTransferredToSpace')).toBeInTheDocument();
    });

    it('renders access message for single document', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} />);
      expect(screen.getByTestId('trans-modalMove.loseAccessDocument')).toBeInTheDocument();
    });

    it('renders access message for multiple documents', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} documents={mockMultiDocuments as any} />);
      expect(screen.getByTestId('trans-modalMove.loseAccessDocuments')).toBeInTheDocument();
    });
  });

  describe('Content for Organization Destination', () => {
    it('renders notify wrapper for org with multiple members', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} destination={mockOrgDestination} />);
      expect(screen.getByTestId('notify-wrapper')).toBeInTheDocument();
    });

    it('renders notifyEveryone for low member count', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} destination={mockOrgDestination} />);
      expect(screen.getByTestId('trans-modalMove.notifyEveryone')).toBeInTheDocument();
    });

    it('renders notifyAdministrators for high member count', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} destination={mockOrgDestination} selectedTarget={mockHighMemberTarget as any} />);
      expect(screen.getByTestId('trans-modalMove.notifyAdministrators')).toBeInTheDocument();
    });

    it('does not render notify for single member org', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} destination={mockOrgDestination} selectedTarget={mockSingleMemberTarget as any} />);
      expect(screen.queryByTestId('notify-wrapper')).not.toBeInTheDocument();
    });

    it('allows setting notify checkbox', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} destination={mockOrgDestination} />);
      const checkbox = screen.getByTestId('styled-checkbox');
      fireEvent.change(checkbox, { target: { checked: true } });
    });

    it('renders styled checkbox for notify', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} destination={mockOrgDestination} />);
      expect(screen.getByTestId('styled-checkbox')).toBeInTheDocument();
    });
  });

  describe('Content for Folder Destination', () => {
    it('renders for folder in org', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} destination={mockFolderDestination} />);
      expect(screen.getByTestId('trans-modalMove.ownershipTransferredToSpace')).toBeInTheDocument();
    });

    it('renders default content for personal folder', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} destination={mockPersonalFolderDestination} />);
      expect(screen.getByTestId('trans-modalMove.loseAccessDocument')).toBeInTheDocument();
    });
  });

  describe('Reskin Mode', () => {
    beforeEach(() => { mockState.isEnableReskin = true; });

    it('renders kiwi modal', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} />);
      expect(screen.getByTestId('kiwi-modal')).toBeInTheDocument();
    });

    it('renders modal title', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} />);
      expect(screen.getByTestId('modal-title')).toHaveTextContent('modalMove.confirmation');
    });

    it('renders text wrapper', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} />);
      expect(screen.getByTestId('text')).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button clicked', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('modal-confirm'));
      expect(defaultProps.handleMoveDocuments).toHaveBeenCalledWith({ isNotify: false });
    });

    it('calls onCancel when cancel button clicked', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('modal-cancel'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('renders checkbox for org destination with members', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} destination={mockOrgDestination} />);
      expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    });

    it('renders checkbox for notify in reskin org destination', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} destination={mockOrgDestination} />);
      expect(screen.getByTestId('checkbox')).toBeInTheDocument();
    });

    it('renders notifyAdministrators in reskin for high members', () => {
      render(<MoveDocumentConfirmModal {...defaultProps} destination={mockOrgDestination} selectedTarget={mockHighMemberTarget as any} />);
      expect(screen.getByTestId('trans-modalMove.notifyAdministrators')).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('has default prop values', () => {
      expect(MoveDocumentConfirmModal.defaultProps).toBeDefined();
      expect(MoveDocumentConfirmModal.defaultProps.visible).toBe(false);
      expect(typeof MoveDocumentConfirmModal.defaultProps.onClose).toBe('function');
      expect(typeof MoveDocumentConfirmModal.defaultProps.handleMoveDocuments).toBe('function');
    });
  });
});

