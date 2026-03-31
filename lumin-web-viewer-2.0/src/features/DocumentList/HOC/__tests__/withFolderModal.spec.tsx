import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock InfoModal
jest.mock('luminComponents/InfoModal', () => ({
  __esModule: true,
  default: ({ open, modalType, currentTarget, closeDialog }: any) => {
    const React = require('react');
    if (!open) return null;
    return React.createElement('div', { 'data-testid': 'info-modal' },
      React.createElement('span', { 'data-testid': 'modal-type' }, modalType),
      React.createElement('span', { 'data-testid': 'folder-name' }, currentTarget?.name),
      React.createElement('button', { 'data-testid': 'close-info-modal', onClick: closeDialog }, 'Close')
    );
  },
}));

// Mock ModalFolder
jest.mock('luminComponents/ModalFolder', () => ({
  __esModule: true,
  default: {
    Edit: ({ folder, type, onClose }: any) => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'edit-folder-modal' },
        React.createElement('span', { 'data-testid': 'folder-name' }, folder?.name),
        React.createElement('span', { 'data-testid': 'folder-type' }, type),
        React.createElement('button', { 'data-testid': 'close-edit-modal', onClick: onClose }, 'Close')
      );
    },
  },
}));

// Mock constants
jest.mock('constants/folderConstant', () => ({
  FolderAction: {
    INFO: 'info',
    EDIT: 'edit',
    CREATE: 'create',
  },
  FolderLocationTypeMapping: {
    PERSONAL: 'personal',
    ORGANIZATION: 'organization',
    ORGANIZATION_TEAM: 'team',
  },
}));

jest.mock('constants/lumin-common', () => ({
  INFO_MODAL_TYPE: {
    FOLDER: 'folder',
    DOCUMENT: 'document',
  },
}));

// Import after mocks
import withFolderModal, { FolderSettingModalType } from '../withFolderModal';
import { FolderAction } from 'constants/folderConstant';

// Mock component to receive openFolderModal
const MockComponent = ({ openFolderModal }: { openFolderModal: React.Dispatch<React.SetStateAction<FolderSettingModalType>> }) => (
  <div data-testid="wrapped-component">
    <button
      data-testid="open-info"
      onClick={() => openFolderModal({
        mode: FolderAction.INFO,
        folder: { _id: 'folder-1', name: 'Test Folder', belongsTo: { type: 'PERSONAL' } } as any,
      })}
    >
      View Info
    </button>
    <button
      data-testid="open-edit"
      onClick={() => openFolderModal({
        mode: FolderAction.EDIT,
        folder: { _id: 'folder-2', name: 'Edit Folder', belongsTo: { type: 'ORGANIZATION' } } as any,
      })}
    >
      Edit Folder
    </button>
    <button
      data-testid="open-edit-team"
      onClick={() => openFolderModal({
        mode: FolderAction.EDIT,
        folder: { _id: 'folder-3', name: 'Team Folder', belongsTo: { type: 'ORGANIZATION_TEAM' } } as any,
      })}
    >
      Edit Team Folder
    </button>
    <button
      data-testid="open-invalid"
      onClick={() => openFolderModal({
        mode: 'INVALID_MODE' as any,
        folder: { _id: 'folder-4', name: 'Invalid', belongsTo: { type: 'PERSONAL' } } as any,
      })}
    >
      Invalid Mode
    </button>
    <button
      data-testid="open-null-folder"
      onClick={() => openFolderModal({
        mode: FolderAction.INFO,
        folder: null as any,
      })}
    >
      Null Folder
    </button>
  </div>
);

const WrappedComponent = withFolderModal(MockComponent);

describe('withFolderModal HOC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders wrapped component', () => {
      render(<WrappedComponent />);
      expect(screen.getByTestId('wrapped-component')).toBeInTheDocument();
    });

    it('passes openFolderModal to wrapped component', () => {
      render(<WrappedComponent />);
      expect(screen.getByTestId('open-info')).toBeInTheDocument();
    });

    it('does not render any modal initially', () => {
      render(<WrappedComponent />);
      expect(screen.queryByTestId('info-modal')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-folder-modal')).not.toBeInTheDocument();
    });
  });

  describe('Info Modal', () => {
    it('opens info modal when FolderAction.INFO is triggered', () => {
      render(<WrappedComponent />);
      fireEvent.click(screen.getByTestId('open-info'));
      expect(screen.getByTestId('info-modal')).toBeInTheDocument();
    });

    it('displays correct folder name in info modal', () => {
      render(<WrappedComponent />);
      fireEvent.click(screen.getByTestId('open-info'));
      expect(screen.getByTestId('folder-name')).toHaveTextContent('Test Folder');
    });

    it('displays correct modal type', () => {
      render(<WrappedComponent />);
      fireEvent.click(screen.getByTestId('open-info'));
      expect(screen.getByTestId('modal-type')).toHaveTextContent('folder');
    });

    it('closes info modal when closeDialog is called', async () => {
      render(<WrappedComponent />);
      fireEvent.click(screen.getByTestId('open-info'));
      expect(screen.getByTestId('info-modal')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('close-info-modal'));
      await waitFor(() => {
        expect(screen.queryByTestId('info-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edit Modal', () => {
    it('opens edit modal when FolderAction.EDIT is triggered', () => {
      render(<WrappedComponent />);
      fireEvent.click(screen.getByTestId('open-edit'));
      expect(screen.getByTestId('edit-folder-modal')).toBeInTheDocument();
    });

    it('displays correct folder name in edit modal', () => {
      render(<WrappedComponent />);
      fireEvent.click(screen.getByTestId('open-edit'));
      expect(screen.getByTestId('folder-name')).toHaveTextContent('Edit Folder');
    });

    it('displays correct folder type for organization folder', () => {
      render(<WrappedComponent />);
      fireEvent.click(screen.getByTestId('open-edit'));
      expect(screen.getByTestId('folder-type')).toHaveTextContent('organization');
    });

    it('displays correct folder type for team folder', () => {
      render(<WrappedComponent />);
      fireEvent.click(screen.getByTestId('open-edit-team'));
      expect(screen.getByTestId('folder-type')).toHaveTextContent('team');
    });

    it('closes edit modal when onClose is called', async () => {
      render(<WrappedComponent />);
      fireEvent.click(screen.getByTestId('open-edit'));
      expect(screen.getByTestId('edit-folder-modal')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('close-edit-modal'));
      await waitFor(() => {
        expect(screen.queryByTestId('edit-folder-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Default Case', () => {
    it('returns null for invalid mode', () => {
      render(<WrappedComponent />);
      fireEvent.click(screen.getByTestId('open-invalid'));
      expect(screen.queryByTestId('info-modal')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-folder-modal')).not.toBeInTheDocument();
    });
  });

  describe('Null Folder', () => {
    it('returns null when folder is null', () => {
      render(<WrappedComponent />);
      fireEvent.click(screen.getByTestId('open-null-folder'));
      expect(screen.queryByTestId('info-modal')).not.toBeInTheDocument();
    });
  });

  describe('Modal Switching', () => {
    it('switches from info to edit modal', async () => {
      render(<WrappedComponent />);
      
      // Open info modal
      fireEvent.click(screen.getByTestId('open-info'));
      expect(screen.getByTestId('info-modal')).toBeInTheDocument();
      
      // Switch to edit modal
      fireEvent.click(screen.getByTestId('open-edit'));
      await waitFor(() => {
        expect(screen.queryByTestId('info-modal')).not.toBeInTheDocument();
        expect(screen.getByTestId('edit-folder-modal')).toBeInTheDocument();
      });
    });
  });
});

