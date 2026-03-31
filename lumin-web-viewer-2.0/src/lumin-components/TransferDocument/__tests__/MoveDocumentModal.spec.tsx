import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock selectors inline
jest.mock('react-redux', () => ({
  useSelector: jest.fn().mockImplementation((selector: unknown) => {
    const selectorStr = String(selector);
    const mockUser = { _id: 'user-123', name: 'Test User' };
    const mockOrgListData = [
      {
        organization: {
          _id: 'org-123',
          name: 'Test Org',
          teams: [{ _id: 'team-123', name: 'Test Team' }],
        },
      },
    ];
    if (selectorStr.includes('getCurrentUser')) {
      return mockUser;
    }
    // Return object with data array that matches OrganizationList interface
    return { data: mockOrgListData, loading: false };
  }),
  shallowEqual: jest.fn(),
}));

jest.mock('selectors', () => ({
  getCurrentUser: jest.fn(),
  getOrganizationList: jest.fn(),
}));

jest.mock('lumin-components/TransferDocument', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const React = require('react');
    const handleClose = () => {
      if (typeof props.onClose === 'function') {
        props.onClose();
      }
    };
    const handleSubmit = () => {
      if (typeof props.onSubmit === 'function') {
        props.onSubmit({ target: { _id: 'org-123' } });
      }
    };
    const handleSetDest = () => {
      if (typeof props.setDestination === 'function') {
        props.setDestination({ _id: 'dest-123', type: 'ORGANIZATION' });
      }
    };
    return React.createElement('div', { 'data-testid': 'transfer-document', 'data-context': props.context },
      React.createElement('button', { 'data-testid': 'close-btn', onClick: handleClose }, 'Close'),
      React.createElement('button', { 'data-testid': 'submit-btn', onClick: handleSubmit }, 'Submit'),
      React.createElement('button', { 'data-testid': 'set-destination-btn', onClick: handleSetDest }, 'Set Destination')
    );
  },
}));

jest.mock('luminComponents/TransferDocument/helpers/destinationHelper', () => ({
  getOwnerId: jest.fn().mockReturnValue('owner-123'),
}));

jest.mock('luminComponents/TransferDocument/hooks/useMoveDocuments', () => ({
  useMoveDocuments: () => ({
    moveDocuments: jest.fn(),
  }),
}));

jest.mock('luminComponents/TransferDocument/interfaces/TransferDocument.interface', () => ({
  DestinationLocation: {
    FOLDER: 'FOLDER',
    ORGANIZATION: 'ORGANIZATION',
    PERSONAL: 'PERSONAL',
    ORGANIZATION_TEAM: 'ORGANIZATION_TEAM',
  },
  ModalContext: {
    COPY: 'COPY',
    MOVE: 'MOVE',
  },
}));

jest.mock('constants/documentConstants', () => ({
  DOCUMENT_TYPE: {
    PERSONAL: 'PERSONAL',
    ORGANIZATION: 'ORGANIZATION',
    ORGANIZATION_TEAM: 'ORGANIZATION_TEAM',
  },
}));

jest.mock('luminComponents/TransferDocument/components/MoveDocumentConfirmModal', () => ({
  __esModule: true,
  default: ({ visible, onClose, handleMoveDocuments, isMoving }: {
    visible: boolean;
    onClose: () => void;
    handleMoveDocuments: () => void;
    isMoving: boolean;
  }) => {
    const React = require('react');
    if (!visible) return null;
    return React.createElement('div', { 'data-testid': 'confirm-modal', 'data-is-moving': isMoving },
      React.createElement('button', { 'data-testid': 'confirm-close', onClick: onClose }, 'Close Confirm'),
      React.createElement('button', { 'data-testid': 'confirm-move', onClick: handleMoveDocuments }, 'Confirm Move')
    );
  },
}));

// Import after mocks
import MoveDocumentModal from 'luminComponents/TransferDocument/components/MoveDocumentModal/MoveDocumentModal';

describe('MoveDocumentModal', () => {
  const mockDocuments = [
    {
      _id: 'doc-123',
      name: 'test-document.pdf',
      clientId: 'client-123',
      folderId: null,
      belongsTo: {
        type: 'PERSONAL',
        location: { _id: 'user-123' },
        workspaceId: null,
      },
    },
  ];

  const defaultProps = {
    documents: mockDocuments as any,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render TransferDocument', () => {
      render(<MoveDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('transfer-document')).toBeInTheDocument();
    });

    it('should pass MOVE context to TransferDocument', () => {
      render(<MoveDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('transfer-document')).toHaveAttribute('data-context', 'MOVE');
    });

    it('should not render confirm modal initially', () => {
      render(<MoveDocumentModal {...defaultProps} />);
      expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
    });
  });

  describe('Close functionality', () => {
    it('should call onClose when close button clicked', () => {
      render(<MoveDocumentModal {...defaultProps} />);
      const closeBtn = screen.getByTestId('close-btn');
      fireEvent.click(closeBtn);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Document Types', () => {
    it('should handle personal documents', () => {
      render(<MoveDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('transfer-document')).toBeInTheDocument();
    });

    it('should handle organization documents', () => {
      const orgDocs = [
        {
          ...mockDocuments[0],
          belongsTo: {
            type: 'ORGANIZATION',
            location: { _id: 'org-123' },
          },
        },
      ];
      render(<MoveDocumentModal {...defaultProps} documents={orgDocs as any} />);
      expect(screen.getByTestId('transfer-document')).toBeInTheDocument();
    });

    it('should handle team documents', () => {
      const teamDocs = [
        {
          ...mockDocuments[0],
          belongsTo: {
            type: 'ORGANIZATION_TEAM',
            location: { _id: 'team-123' },
          },
        },
      ];
      render(<MoveDocumentModal {...defaultProps} documents={teamDocs as any} />);
      expect(screen.getByTestId('transfer-document')).toBeInTheDocument();
    });
  });
});
