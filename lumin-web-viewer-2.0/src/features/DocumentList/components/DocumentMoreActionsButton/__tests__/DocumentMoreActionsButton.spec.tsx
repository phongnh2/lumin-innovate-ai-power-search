import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock lumin-ui/kiwi-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  IconButton: ({ onClick, activated, icon, ...props }: any) =>
    require('react').createElement('button', { 'data-testid': 'icon-button', 'data-activated': String(activated), onClick, ...props }),
  Divider: () => require('react').createElement('hr', { 'data-testid': 'divider' }),
  MenuItem: ({ children, onClick, leftIconProps, rightSection, disabled }: any) =>
    require('react').createElement('div', { 'data-testid': 'menu-item', onClick, 'data-disabled': String(disabled) }, children),
  Switch: ({ checked, disabled }: any) =>
    require('react').createElement('input', { type: 'checkbox', 'data-testid': 'switch', checked, disabled, readOnly: true }),
  PlainTooltip: ({ children, content }: any) =>
    require('react').createElement('span', { 'data-testid': 'tooltip', 'data-content': content }, children),
}));

// Mock react-redux
jest.mock('react-redux', () => ({ useSelector: () => false }));

// Mock selectors
jest.mock('selectors', () => ({ isSourceDownloading: jest.fn() }));

// Mock DocumentListContext
jest.mock('luminComponents/DocumentList/Context', () => ({
  DocumentListContext: require('react').createContext({
    externalDocumentExistenceGuard: jest.fn((doc, cb) => cb()),
    onHandleDocumentOvertimeLimit: jest.fn(),
  }),
}));

// Mock ScrollableMenu
jest.mock('luminComponents/ReskinLayout/components/ScrollableMenu', () => ({
  ScrollableMenu: ({ children, ComponentTarget, opened, onChange }: any) =>
    require('react').createElement('div', { 'data-testid': 'scrollable-menu' },
      require('react').createElement('div', { 'data-testid': 'menu-target', onClick: () => onChange?.(!opened) }, ComponentTarget),
      opened && require('react').createElement('div', { 'data-testid': 'menu-content' }, children)
    ),
}));

// Mock withDocumentItemAuthorization HOC
jest.mock('HOC/withDocumentItemAuthorization', () => ({
  __esModule: true,
  default: (Component: any) => Component,
}));

// Mock hooks
jest.mock('hooks', () => ({
  useDesktopMatch: () => true,
  useGetCurrentUser: () => ({ _id: 'user-123' }),
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock helpers
jest.mock('helpers/pwa', () => ({ canEnableOffline: () => true }));

// Mock utils
jest.mock('utils/Factory/EventCollection/constants/ButtonEvent', () => ({
  ButtonName: { COPY_LINK: 'copy_link', MAKE_OFFLINE_FILE_IN_DOCLIST: 'make_offline', MAKE_OFFLINE_FILE_UNAVAILABLE_IN_DOCLIST: 'unmake_offline' },
}));
jest.mock('utils/Factory/EventCollection/constants/DocumentActionsEvent', () => ({
  DocumentDropdownAction: { FILE_INFO: 'file_info', OPEN: 'open', COPY_DOC: 'copy_doc', RENAME: 'rename', COPY_LINK: 'copy_link', SHARE: 'share', STAR: 'star', MOVE: 'move', MAKE_OFFLINE: 'make_offline', DELETE: 'delete' },
  ObjectType: { DOC: 'doc' },
  QuickAction: { MORE_ACTIONS: 'more_actions' },
}));
jest.mock('utils/Factory/EventCollection/DocActionsEventCollection', () => ({
  __esModule: true,
  default: { documentDropdown: jest.fn().mockResolvedValue({}), quickActions: jest.fn().mockResolvedValue({}) },
}));

// Mock constants
jest.mock('constants/documentConstants', () => ({
  DOCUMENT_OFFLINE_STATUS: { AVAILABLE: 'available', DOWNLOADING: 'downloading' },
  DOCUMENT_TYPE: { ORGANIZATION: 'organization', ORGANIZATION_TEAM: 'organization_team' },
  DocumentActions: { View: 'view', Open: 'open', MakeACopy: 'makeACopy', Rename: 'rename', CopyLink: 'copyLink', Share: 'share', MarkFavorite: 'markFavorite', Move: 'move', MakeOffline: 'makeOffline', Remove: 'remove' },
}));
jest.mock('constants/documentType', () => ({ general: { PDF: 'application/pdf' } }));
jest.mock('constants/lumin-common', () => ({
  DOCUMENT_ROLES: { OWNER: 'owner' },
  STORAGE_TYPE: { SYSTEM: 'system', ONEDRIVE: 'oneDrive' },
  THIRD_PARTY_DOCUMENT_SERVICES: ['google', 'dropbox'],
}));

// Mock styles
jest.mock('../DocumentMoreActionsButton.module.scss', () => ({ dropdown: 'dropdown' }));

import DocumentMoreActionsButton from '../DocumentMoreActionsButton';

describe('DocumentMoreActionsButton', () => {
  const mockActions = {
    viewInfo: jest.fn(),
    open: jest.fn(),
    makeACopy: jest.fn(),
    rename: jest.fn(),
    copyLink: jest.fn(),
    share: jest.fn(),
    markFavorite: jest.fn(),
    move: jest.fn(),
    makeOffline: jest.fn(),
    remove: jest.fn(),
  };

  const defaultProps = {
    document: {
      _id: 'doc-123',
      name: 'test.pdf',
      service: 's3',
      mimeType: 'application/pdf',
      listUserStar: ['user-123'],
      roleOfDocument: 'owner',
      documentType: 'personal',
      offlineStatus: null,
      isOverTimeLimit: false,
    } as any,
    containerScrollRef: { current: document.createElement('div') } as any,
    withAuthorize: jest.fn().mockReturnValue(true),
    checkCapabilitiesDocumentPermission: jest.fn().mockReturnValue(true),
    onToggle: jest.fn(),
    actions: mockActions,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders icon button', () => {
    render(<DocumentMoreActionsButton {...defaultProps} />);
    expect(screen.getByTestId('icon-button')).toBeInTheDocument();
  });

  it('renders scrollable menu', () => {
    render(<DocumentMoreActionsButton {...defaultProps} />);
    expect(screen.getByTestId('scrollable-menu')).toBeInTheDocument();
  });

  it('opens menu on click', () => {
    render(<DocumentMoreActionsButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    expect(screen.getByTestId('menu-content')).toBeInTheDocument();
  });

  it('calls onToggle when menu opens', () => {
    render(<DocumentMoreActionsButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    expect(defaultProps.onToggle).toHaveBeenCalledWith(true);
  });

  it('renders menu items when menu is open', () => {
    render(<DocumentMoreActionsButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    expect(screen.getAllByTestId('menu-item').length).toBeGreaterThan(0);
  });

  it('calls action when menu item is clicked', () => {
    render(<DocumentMoreActionsButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    const menuItems = screen.getAllByTestId('menu-item');
    fireEvent.click(menuItems[0]);
    expect(mockActions.viewInfo).toHaveBeenCalled();
  });

  it('shows star text when document is starred', () => {
    render(<DocumentMoreActionsButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    expect(screen.getByText('common.unstar')).toBeInTheDocument();
  });

  it('shows unstar text when document is not starred', () => {
    const props = { ...defaultProps, document: { ...defaultProps.document, listUserStar: [] } };
    render(<DocumentMoreActionsButton {...props} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    expect(screen.getByText('common.star')).toBeInTheDocument();
  });

  it('shows delete text for owner documents', () => {
    render(<DocumentMoreActionsButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    expect(screen.getByText('common.delete')).toBeInTheDocument();
  });

  it('shows remove text for non-owner documents', () => {
    const props = { ...defaultProps, document: { ...defaultProps.document, roleOfDocument: 'viewer', service: 'google' } };
    render(<DocumentMoreActionsButton {...props} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    expect(screen.getByText('common.remove')).toBeInTheDocument();
  });

  it('hides system file specific menu items for system files', () => {
    const props = { ...defaultProps, document: { ...defaultProps.document, service: 'system' } };
    render(<DocumentMoreActionsButton {...props} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    // System files should not show MakeACopy, Rename, Share, etc.
    const menuItems = screen.getAllByTestId('menu-item');
    expect(menuItems.length).toBeLessThan(10);
  });

  it('respects withAuthorize for menu items', () => {
    const props = { ...defaultProps, withAuthorize: jest.fn().mockReturnValue(false) };
    render(<DocumentMoreActionsButton {...props} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    // No menu items should render when not authorized
    expect(screen.queryAllByTestId('menu-item').length).toBe(0);
  });
});

