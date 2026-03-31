import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import { SharingMode } from '../constants';

// Store the setOpenedPermissionModal callback to control it from tests
let capturedSetOpenedPermissionModal: ((value: boolean) => void) | null = null;

// Mock lumin-ui components
jest.mock('lumin-ui/kiwi-ui', () => ({
  Button: ({ children, onClick, disabled, loading, size, className }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    size?: string;
    className?: string;
  }) => (
    <button
      data-testid="share-button"
      onClick={onClick}
      disabled={disabled}
      data-loading={String(loading)}
      data-size={size}
    >
      {children}
    </button>
  ),
  Collapse: ({ children, in: isOpen }: { children: React.ReactNode; in: boolean }) => (
    isOpen ? <div data-testid="collapse-content">{children}</div> : null
  ),
  Modal: ({ opened, onClose, title, message, onConfirm, onCancel, confirmButtonProps, cancelButtonProps }: {
    opened: boolean;
    onClose: () => void;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmButtonProps?: { title: string };
    cancelButtonProps?: { title: string };
  }) => (
    opened ? (
      <div data-testid="permission-modal">
        <span data-testid="modal-title">{title}</span>
        <span data-testid="modal-message">{message}</span>
        <button data-testid="modal-confirm" onClick={onConfirm}>
          {confirmButtonProps?.title || 'Confirm'}
        </button>
        <button data-testid="modal-cancel" onClick={onCancel}>
          {cancelButtonProps?.title || 'Cancel'}
        </button>
        <button data-testid="modal-close" onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
}));

// Mock form components
jest.mock('../components/ShareInSlackForm/WorkspaceSelect', () => ({
  __esModule: true,
  default: () => <div data-testid="workspace-select">WorkspaceSelect</div>,
}));

jest.mock('../components/ShareInSlackForm/DestinationSelect', () => ({
  __esModule: true,
  default: () => <div data-testid="destination-select">DestinationSelect</div>,
}));

jest.mock('../components/ShareInSlackForm/SharingModeSelect', () => ({
  __esModule: true,
  default: () => <div data-testid="sharing-mode-select">SharingModeSelect</div>,
}));

jest.mock('../components/ShareInSlackForm/AccessLevelSelect', () => ({
  __esModule: true,
  default: () => <div data-testid="access-level-select">AccessLevelSelect</div>,
}));

jest.mock('../components/ShareInSlackForm/AddMessage', () => ({
  __esModule: true,
  default: ({ message, setMessage }: { message: string; setMessage: (msg: string) => void }) => (
    <input
      data-testid="add-message"
      value={message}
      onChange={(e) => setMessage(e.target.value)}
    />
  ),
}));

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock useHandleShareInSlack with configurable state
const mockHandleShare = jest.fn();
const mockHandleConfirmPermissionModal = jest.fn();
const mockHandleDismissPermissionModal = jest.fn();
let mockIsLoading = false;

jest.mock('../hooks/useHandleShareInSlack', () => ({
  __esModule: true,
  default: ({ setOpenedPermissionModal }: { setOpenedPermissionModal: (value: boolean) => void }) => {
    // Capture the setter so we can call it from tests
    capturedSetOpenedPermissionModal = setOpenedPermissionModal;
    return {
      handleShare: mockHandleShare,
      isLoading: mockIsLoading,
      handleConfirmPermissionModal: mockHandleConfirmPermissionModal,
      handleDismissPermissionModal: mockHandleDismissPermissionModal,
    };
  },
}));

import ShareInSlackForm from '../components/ShareInSlackForm/ShareInSlackForm';

const mockStore = configureMockStore([]);

// ============ FACTORIES ============
const createChannel = (id = 'channel-1', overrides = {}) => ({
  id,
  name: `Channel ${id}`,
  isPrivate: false,
  totalMembers: 10,
  isChannel: true,
  ...overrides,
});

const createRecipient = (id = 'recipient-1') => ({
  id,
  name: `Recipient ${id}`,
  displayName: `Display ${id}`,
  email: `${id}@example.com`,
  avatarUrl: `https://example.com/avatar-${id}.png`,
  isChannel: false,
});

const createStoreState = (overrides = {}) => ({
  shareInSlack: {
    teams: [],
    channels: [],
    recipients: [],
    selectedTeam: null,
    selectedDestination: null,
    sharingMode: SharingMode.ANYONE,
    accessLevel: 'EDITOR',
    isSharingQueueProcessing: false,
    sharedDocumentInfo: null,
    isSharing: false,
    ...overrides,
  },
});

describe('ShareInSlackForm', () => {
  let reduxStore: ReturnType<typeof mockStore>;
  let mockOnClose: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnClose = jest.fn();
    mockIsLoading = false;
    capturedSetOpenedPermissionModal = null;
    reduxStore = mockStore(createStoreState());
  });

  const renderComponent = (storeState = {}) => {
    reduxStore = mockStore(createStoreState(storeState));
    return render(
      <Provider store={reduxStore}>
        <ShareInSlackForm onClose={mockOnClose} />
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should render WorkspaceSelect', () => {
      renderComponent();
      expect(screen.getByTestId('workspace-select')).toBeInTheDocument();
    });

    it('should render DestinationSelect', () => {
      renderComponent();
      expect(screen.getByTestId('destination-select')).toBeInTheDocument();
    });

    it('should render share button', () => {
      renderComponent();
      expect(screen.getByTestId('share-button')).toBeInTheDocument();
      expect(screen.getByTestId('share-button')).toHaveTextContent('common.share');
    });
  });

  describe('Collapsed Content', () => {
    it('should not show collapsed content when no destination is selected', () => {
      renderComponent({ selectedDestination: null });
      expect(screen.queryByTestId('collapse-content')).not.toBeInTheDocument();
    });

    it('should show collapsed content when destination is selected', () => {
      renderComponent({ selectedDestination: createChannel() });
      expect(screen.getByTestId('collapse-content')).toBeInTheDocument();
    });

    it('should render SharingModeSelect in collapsed content', () => {
      renderComponent({ selectedDestination: createChannel() });
      expect(screen.getByTestId('sharing-mode-select')).toBeInTheDocument();
    });

    it('should render AccessLevelSelect in collapsed content', () => {
      renderComponent({ selectedDestination: createChannel() });
      expect(screen.getByTestId('access-level-select')).toBeInTheDocument();
    });

    it('should render AddMessage in collapsed content', () => {
      renderComponent({ selectedDestination: createChannel() });
      expect(screen.getByTestId('add-message')).toBeInTheDocument();
    });
  });

  describe('Share Button', () => {
    it('should be disabled when no destination is selected', () => {
      renderComponent({ selectedDestination: null });
      expect(screen.getByTestId('share-button')).toBeDisabled();
    });

    it('should be enabled when destination is selected', () => {
      renderComponent({ selectedDestination: createChannel() });
      expect(screen.getByTestId('share-button')).not.toBeDisabled();
    });

    it('should call handleShare when clicked', () => {
      renderComponent({ selectedDestination: createChannel() });
      
      fireEvent.click(screen.getByTestId('share-button'));
      
      expect(mockHandleShare).toHaveBeenCalledTimes(1);
    });

    it('should have correct size', () => {
      renderComponent();
      expect(screen.getByTestId('share-button')).toHaveAttribute('data-size', 'lg');
    });

    it('should show loading state when isLoading is true', () => {
      mockIsLoading = true;
      renderComponent({ selectedDestination: createChannel() });
      expect(screen.getByTestId('share-button')).toHaveAttribute('data-loading', 'true');
    });

    it('should not show loading state when isLoading is false', () => {
      mockIsLoading = false;
      renderComponent({ selectedDestination: createChannel() });
      expect(screen.getByTestId('share-button')).toHaveAttribute('data-loading', 'false');
    });
  });

  describe('Message Input', () => {
    it('should update message state when typing', () => {
      renderComponent({ selectedDestination: createChannel() });
      
      const input = screen.getByTestId('add-message');
      fireEvent.change(input, { target: { value: 'Hello team!' } });
      
      expect(input).toHaveValue('Hello team!');
    });
  });

  describe('Permission Modal', () => {
    it('should not show permission modal by default', () => {
      renderComponent({ selectedDestination: createChannel() });
      expect(screen.queryByTestId('permission-modal')).not.toBeInTheDocument();
    });

    it('should show permission modal when openedPermissionModal is set to true', () => {
      renderComponent({ selectedDestination: createChannel() });
      
      // Trigger modal open via the captured setter
      act(() => {
        capturedSetOpenedPermissionModal?.(true);
      });
      
      expect(screen.getByTestId('permission-modal')).toBeInTheDocument();
    });

    it('should display correct title in permission modal', () => {
      renderComponent({ selectedDestination: createChannel() });
      
      act(() => {
        capturedSetOpenedPermissionModal?.(true);
      });
      
      expect(screen.getByTestId('modal-title')).toHaveTextContent('shareInSlack.overwriteOrKeepThePermissions');
    });

    it('should display channel message when destination is channel', () => {
      renderComponent({ selectedDestination: createChannel() });
      
      act(() => {
        capturedSetOpenedPermissionModal?.(true);
      });
      
      expect(screen.getByTestId('modal-message')).toHaveTextContent('shareInSlack.someUsersAlreadyHaveDocumentPermissions');
    });

    it('should display recipient message when destination is not channel', () => {
      renderComponent({ selectedDestination: createRecipient() });
      
      act(() => {
        capturedSetOpenedPermissionModal?.(true);
      });
      
      expect(screen.getByTestId('modal-message')).toHaveTextContent('shareInSlack.thisUserAlreadyHasDocumentPermission');
    });

    it('should call handleConfirmPermissionModal when confirm is clicked', () => {
      renderComponent({ selectedDestination: createChannel() });
      
      act(() => {
        capturedSetOpenedPermissionModal?.(true);
      });
      
      fireEvent.click(screen.getByTestId('modal-confirm'));
      
      expect(mockHandleConfirmPermissionModal).toHaveBeenCalledTimes(1);
    });

    it('should call handleDismissPermissionModal when cancel is clicked', () => {
      renderComponent({ selectedDestination: createChannel() });
      
      act(() => {
        capturedSetOpenedPermissionModal?.(true);
      });
      
      fireEvent.click(screen.getByTestId('modal-cancel'));
      
      expect(mockHandleDismissPermissionModal).toHaveBeenCalledTimes(1);
    });

    it('should close modal when close button is clicked', () => {
      renderComponent({ selectedDestination: createChannel() });
      
      act(() => {
        capturedSetOpenedPermissionModal?.(true);
      });
      
      expect(screen.getByTestId('permission-modal')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('modal-close'));
      
      expect(screen.queryByTestId('permission-modal')).not.toBeInTheDocument();
    });

    it('should display confirm button with correct title', () => {
      renderComponent({ selectedDestination: createChannel() });
      
      act(() => {
        capturedSetOpenedPermissionModal?.(true);
      });
      
      expect(screen.getByTestId('modal-confirm')).toHaveTextContent('shareInSlack.keepTheCurrent');
    });

    it('should display cancel button with correct title', () => {
      renderComponent({ selectedDestination: createChannel() });
      
      act(() => {
        capturedSetOpenedPermissionModal?.(true);
      });
      
      expect(screen.getByTestId('modal-cancel')).toHaveTextContent('shareInSlack.overwritePermissions');
    });
  });

  describe('Destination Types', () => {
    it('should work with channel destination', () => {
      renderComponent({ selectedDestination: createChannel() });
      expect(screen.getByTestId('share-button')).not.toBeDisabled();
    });

    it('should work with recipient destination', () => {
      renderComponent({ selectedDestination: createRecipient() });
      expect(screen.getByTestId('share-button')).not.toBeDisabled();
    });

    it('should work with private channel destination', () => {
      renderComponent({ selectedDestination: createChannel('private', { isPrivate: true }) });
      expect(screen.getByTestId('share-button')).not.toBeDisabled();
    });
  });
});
