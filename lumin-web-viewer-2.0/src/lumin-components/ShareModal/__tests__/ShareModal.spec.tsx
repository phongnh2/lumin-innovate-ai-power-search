import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

// Mock MUI styles
jest.mock('@mui/styles', () => ({
  makeStyles: () => () => ({ paper: 'paper-class' }),
}));

// Mock lodash
jest.mock('lodash', () => ({
  capitalize: (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '',
}));

// Mock lumin-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  Button: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="kiwi-button" onClick={onClick} {...props}>{children}</button>
  ),
  Dialog: ({ children, opened, onClose }: { children: React.ReactNode; opened: boolean; onClose: () => void }) => (
    opened ? <div data-testid="dialog" onClick={onClose}>{children}</div> : null
  ),
  Text: ({ children }: { children: React.ReactNode }) => <span data-testid="text">{children}</span>,
  Divider: () => <hr data-testid="divider" />,
  Icomoon: ({ type }: { type: string }) => <span data-testid={`icon-${type}`} />,
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  Trans: ({ i18nKey }: { i18nKey: string }) => <span data-testid="trans">{i18nKey}</span>,
}));

// Mock react-router
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock components
jest.mock('lumin-components/AddMessage', () => ({
  __esModule: true,
  default: () => <div data-testid="add-message-component" />,
}));

jest.mock('lumin-components/AddShareMemberInput', () => ({
  __esModule: true,
  default: () => <div data-testid="add-share-member-input" />,
}));

jest.mock('lumin-components/BulkUpdateSharePermission', () => ({
  __esModule: true,
  default: () => <div data-testid="bulk-update-share-permission" />,
}));

jest.mock('lumin-components/ButtonMaterial', () => ({
  __esModule: true,
  default: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button data-testid="button-material" onClick={onClick}>{children}</button>
  ),
  ButtonColor: { TERTIARY: 'TERTIARY' },
}));

jest.mock('lumin-components/RequestAccessDocumentList', () => ({
  __esModule: true,
  default: {
    Personal: () => <div data-testid="request-access-personal" />,
  },
}));

jest.mock('lumin-components/RequestAccessSection', () => ({
  __esModule: true,
  default: ({ children }: { children: (props: unknown) => React.ReactNode }) => (
    <div data-testid="request-access-section">{children({})}</div>
  ),
}));

jest.mock('lumin-components/ShareModalRenderer', () => ({
  __esModule: true,
  default: ({ children }: { children: (props: Record<string, unknown>) => React.ReactNode }) => (
    <div data-testid="share-modal-renderer">
      {children({
        openShareSetting: jest.fn(),
        openBulkUpdate: jest.fn(),
        openFullRequestList: jest.fn(),
        openInviteSharedUser: jest.fn(),
        openShareInSlack: jest.fn(),
        shouldAutoFoucusOnInput: false,
      })}
    </div>
  ),
}));

jest.mock('lumin-components/ShareSettingModal', () => ({
  __esModule: true,
  default: () => <div data-testid="share-setting-modal" />,
}));

jest.mock('luminComponents/Dialog', () => ({
  LazyContentDialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    open ? <div data-testid="lazy-content-dialog">{children}</div> : null
  ),
}));

jest.mock('luminComponents/ModalFolder/components/ModalSkeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="modal-skeleton" />,
}));

jest.mock('features/CNC/CncComponents/InviteSharedUsersModal', () => ({
  __esModule: true,
  default: () => <div data-testid="invite-shared-users-modal" />,
}));

jest.mock('features/ShareInSlack', () => ({
  ShareInSlackModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="share-in-slack-modal">
      <button data-testid="close-slack-modal" onClick={() => onClose()}>Close</button>
    </div>
  ),
}));

jest.mock('features/ShareInSlack/reducer/ShareInSlack.reducer', () => ({
  shareInSlackSelectors: {
    getSelectedDestination: () => null,
    getSharedDocumentInfo: () => null,
    getIsSharing: () => false,
  },
}));

// Mock hooks
let mockIsEnableReskin = true;

jest.mock('hooks', () => ({
  useBulkSharingPermission: () => ({ canBulkUpdate: false, list: [], defaultValue: null }),
  useThemeMode: () => 'light',
  useGetTargetRequestAccess: () => null,
  useUrlSearchParams: () => ({ get: () => null }),
  useTranslation: () => ({ t: (key: string) => key }),
  useEnableWebReskin: () => ({ isEnableReskin: mockIsEnableReskin }),
}));

// Mock utils
jest.mock('utils/file', () => ({
  __esModule: true,
  default: {
    getShortFilename: (name: string) => name?.substring(0, 20) || '',
  },
}));

// Mock constants
jest.mock('constants/styles', () => ({
  ModalSize: { MDX: 600 },
}));

jest.mock('constants/UrlSearchParam', () => ({
  UrlSearchParam: { REQUESTER_ID: 'requesterId' },
}));

// Mock child components
jest.mock('../components/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer" />,
}));

jest.mock('../components/FullRequestList', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="full-request-list">{children}</div>,
}));

jest.mock('../components/MemberList', () => ({
  __esModule: true,
  default: () => <div data-testid="member-list" />,
}));

jest.mock('../components/ShareLinkSection', () => ({
  __esModule: true,
  default: () => <div data-testid="share-link-section" />,
}));

jest.mock('../components/Title', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <div data-testid="title" data-has-permission={String(props.hasPermission)}>
      Title
    </div>
  ),
}));

// Mock styled components
jest.mock('../ShareModal.styled', () => ({
  TopBlockContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="top-block-container">{children}</div>,
  TopBlockContainerReskin: ({ children }: { children: React.ReactNode }) => <div data-testid="top-block-container-reskin">{children}</div>,
  BottomBlockContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="bottom-block-container">{children}</div>,
  BottomBlockContainerReskin: ({ children }: { children: React.ReactNode }) => <div data-testid="bottom-block-container-reskin">{children}</div>,
  SubTitle: ({ children }: { children: React.ReactNode }) => <p data-testid="subtitle">{children}</p>,
  TopBlockFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="top-block-footer">{children}</div>,
  DoneButton: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button data-testid="done-button" onClick={onClick}>{children}</button>
  ),
}));

// Mock styles
jest.mock('../ShareModal.module.scss', () => ({
  subTitle: 'subTitle',
  bulkBtn: 'bulkBtn',
  backButtonInFullRequestList: 'backButtonInFullRequestList',
}));

// Mock core module
jest.mock('core', () => ({
  __esModule: true,
  default: {},
  disableElements: jest.fn(),
  disableFeatures: jest.fn(),
  enableElements: jest.fn(),
  enableFeatures: jest.fn(),
}));

// Mock features/DocumentActionPermission
jest.mock('features/DocumentActionPermission', () => ({
  DocumentActionPermissionSetting: () => null,
  useUpdateDocumentActionPermissionSettings: () => ({ updateDocumentActionPermissionSettings: jest.fn() }),
  useEnableDocumentActionPermission: () => ({ enableEditDocumentActionPermission: false }),
  getPrincipleOptionKey: () => 'default',
  PERMISSION_ROLES: {},
}));

// Mock socket
jest.mock('@socket', () => ({
  socket: { emit: jest.fn() },
}));

// Mock @libs/axios
jest.mock('@libs/axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

// Mock context
jest.mock('../ShareModalContext', () => {
  const React = require('react');
  return {
    ShareModalContext: React.createContext({}),
  };
});

import ShareModal from '../ShareModal';
import { ShareModalContext } from '../ShareModalContext';

const mockStore = configureMockStore([]);

describe('ShareModal', () => {
  const mockCloseShareModal = jest.fn();
  const mockSetShareMessage = jest.fn();
  const mockHandleDoneClick = jest.fn();
  const mockSetShowDiscardModal = jest.fn();
  const mockResetTagsState = jest.fn();

  const defaultContextValue = {
    hasPermission: true,
    hasSlackPermission: true,
    closeShareModal: mockCloseShareModal,
    shareMessage: false,
    handleChangeShareMessage: jest.fn(),
    message: '',
    members: [],
    userTags: [],
    setShareMessage: mockSetShareMessage,
    handleAddUserTag: jest.fn(),
    pendingUserList: [],
    handleAddPendingUserTag: jest.fn(),
    handleChangeUserTagPermission: jest.fn(),
    currentDocument: { _id: 'doc-123', name: 'test.pdf', shareSetting: {} },
    handleError: jest.fn(),
    handleRemoveUserTag: jest.fn(),
    refetchDocument: jest.fn(),
    updateDocument: jest.fn(),
    isLuminStorageDocument: true,
    isShareLinkOpen: false,
    handleDoneClick: mockHandleDoneClick,
    isTransfering: false,
    onAfterBulkUpdate: jest.fn(),
    userRole: 'OWNER',
    handleTransferFileByCheckLuminStorage: jest.fn(),
    getSharees: jest.fn(),
    requestAccessList: { total: 0, requesters: [], hasNextPage: false, loading: false },
    fetchMoreRequestAccess: jest.fn(),
    openHitDocStackModal: jest.fn(),
    setDiscardModalType: jest.fn(),
    openShareModal: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsEnableReskin = true;
  });

  const renderComponent = (contextOverrides = {}, props = {}) => {
    const store = mockStore({});
    const contextValue = { ...defaultContextValue, ...contextOverrides };
    
    return render(
      <Provider store={store}>
        <ShareModalContext.Provider value={contextValue}>
          <ShareModal 
            orgOfDoc={{ _id: 'org-123' }}
            setShowDiscardModal={mockSetShowDiscardModal}
            resetTagsState={mockResetTagsState}
            {...props}
          />
        </ShareModalContext.Provider>
      </Provider>
    );
  };

  describe('Rendering', () => {
    it('should return null when openShareModal is false', () => {
      const { container } = renderComponent({ openShareModal: false });
      expect(container).toBeEmptyDOMElement();
    });

    it('should render when openShareModal is true', () => {
      renderComponent({ openShareModal: true });
      expect(screen.getByTestId('share-modal-renderer')).toBeInTheDocument();
    });
  });

  describe('Reskin Version', () => {
    beforeEach(() => {
      mockIsEnableReskin = true;
    });

    it('should render Dialog for reskin version', () => {
      renderComponent();
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('should render TopBlockContainerReskin', () => {
      renderComponent();
      expect(screen.getByTestId('top-block-container-reskin')).toBeInTheDocument();
    });

    it('should render Title component', () => {
      renderComponent();
      expect(screen.getByTestId('title')).toBeInTheDocument();
    });

    it('should render MemberList when not in shareMessage mode', () => {
      renderComponent({ shareMessage: false });
      expect(screen.getByTestId('member-list')).toBeInTheDocument();
    });

    it('should render BottomBlockContainerReskin when not in shareMessage mode', () => {
      renderComponent({ shareMessage: false });
      expect(screen.getByTestId('bottom-block-container-reskin')).toBeInTheDocument();
    });

    it('should render ShareLinkSection', () => {
      renderComponent({ shareMessage: false });
      expect(screen.getByTestId('share-link-section')).toBeInTheDocument();
    });
  });

  describe('Non-Reskin Version', () => {
    beforeEach(() => {
      mockIsEnableReskin = false;
    });

    it('should render LazyContentDialog for non-reskin version', () => {
      renderComponent();
      expect(screen.getByTestId('lazy-content-dialog')).toBeInTheDocument();
    });

    it('should render TopBlockContainer', () => {
      renderComponent();
      expect(screen.getByTestId('top-block-container')).toBeInTheDocument();
    });
  });

  describe('Share Message Mode', () => {
    it('should render AddMessageComponent when shareMessage is true', () => {
      renderComponent({ shareMessage: true });
      expect(screen.getByTestId('add-message-component')).toBeInTheDocument();
    });

    it('should render Footer when shareMessage is true', () => {
      renderComponent({ shareMessage: true });
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('hasPermission', () => {
    it('should pass hasPermission to Title component', () => {
      renderComponent({ hasPermission: true });
      expect(screen.getByTestId('title')).toHaveAttribute('data-has-permission', 'true');
    });

    it('should render AddShareMemberInput when hasPermission is true', () => {
      renderComponent({ hasPermission: true });
      expect(screen.getByTestId('add-share-member-input')).toBeInTheDocument();
    });
  });

  describe('Non-Lumin Storage Document', () => {
    it('should render SubTitle when not Lumin storage document', () => {
      mockIsEnableReskin = true;
      renderComponent({ isLuminStorageDocument: false });
      expect(screen.getByTestId('trans')).toBeInTheDocument();
    });
  });

  describe('Request Access Section', () => {
    it('should render RequestAccessSection', () => {
      renderComponent();
      expect(screen.getByTestId('request-access-section')).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('should use default empty object for orgOfDoc', () => {
      const store = mockStore({});
      const { container } = render(
        <Provider store={store}>
          <ShareModalContext.Provider value={defaultContextValue}>
            <ShareModal />
          </ShareModalContext.Provider>
        </Provider>
      );
      expect(container).not.toBeEmptyDOMElement();
    });
  });
});

