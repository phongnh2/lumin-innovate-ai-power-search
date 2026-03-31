import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock lumin-ui/kiwi-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  IconButton: ({ onClick, activated, ...props }: any) =>
    require('react').createElement('button', { 'data-testid': 'icon-button', 'data-activated': String(activated), onClick, ...props }),
  Divider: () => require('react').createElement('hr', { 'data-testid': 'divider' }),
  MenuItem: ({ children, onClick, leftIconProps }: any) =>
    require('react').createElement('div', { 'data-testid': 'menu-item', onClick }, children),
}));

// Mock ScrollableMenu
jest.mock('luminComponents/ReskinLayout/components/ScrollableMenu', () => ({
  ScrollableMenu: ({ children, ComponentTarget, opened, onChange }: any) =>
    require('react').createElement('div', { 'data-testid': 'scrollable-menu' },
      require('react').createElement('div', { 'data-testid': 'menu-target', onClick: () => onChange?.(!opened) }, ComponentTarget),
      opened && require('react').createElement('div', { 'data-testid': 'menu-content' }, children)
    ),
}));

// Mock hooks
jest.mock('hooks', () => ({
  useDesktopMatch: () => true,
  useGetCurrentOrganization: () => ({ teams: [{ _id: 'team-1' }] }),
  useGetCurrentUser: () => ({ _id: 'user-123' }),
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock FolderPermissions
jest.mock('utils/Factory/FolderPermissions', () => ({
  FolderPermissions: jest.fn().mockImplementation(() => ({
    hasPermission: jest.fn().mockReturnValue(true),
  })),
}));

// Mock utils
jest.mock('utils/Factory/EventCollection/constants/DocumentActionsEvent', () => ({
  ObjectType: { FOLDER: 'folder' },
  QuickAction: { MORE_ACTIONS: 'more_actions' },
}));
jest.mock('utils/Factory/EventCollection/DocActionsEventCollection', () => ({
  __esModule: true,
  default: { quickActions: jest.fn().mockResolvedValue({}) },
}));

// Mock constants
jest.mock('constants/folderConstant', () => ({
  FolderAction: { INFO: 'info', EDIT: 'edit', STAR: 'star', REMOVE: 'remove' },
  FolderLocationType: { ORGANIZATION_TEAM: 'organization_team' },
  FolderLocationTypeMapping: { personal: 'personal', organization: 'organization', organization_team: 'team' },
  FolderPermission: { EDIT: 'edit', DELETE: 'delete' },
}));

// Mock styles
jest.mock('../FolderMoreActionsButton.module.scss', () => ({ dropdown: 'dropdown' }));

import FolderMoreActionsButton from '../FolderMoreActionsButton';

describe('FolderMoreActionsButton', () => {
  const mockActions = {
    open: jest.fn(),
    viewInfo: jest.fn(),
    rename: jest.fn(),
    markFavorite: jest.fn(),
    remove: jest.fn(),
  };

  const defaultProps = {
    folder: {
      _id: 'folder-123',
      name: 'Test Folder',
      listUserStar: ['user-123'],
      belongsTo: { type: 'personal', location: { _id: 'loc-1' } },
    } as any,
    containerScrollRef: { current: document.createElement('div') } as any,
    onToggle: jest.fn(),
    actions: mockActions,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders icon button', () => {
    render(<FolderMoreActionsButton {...defaultProps} />);
    expect(screen.getByTestId('icon-button')).toBeInTheDocument();
  });

  it('renders scrollable menu', () => {
    render(<FolderMoreActionsButton {...defaultProps} />);
    expect(screen.getByTestId('scrollable-menu')).toBeInTheDocument();
  });

  it('opens menu on click', () => {
    render(<FolderMoreActionsButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    expect(screen.getByTestId('menu-content')).toBeInTheDocument();
  });

  it('calls onToggle when menu opens', () => {
    render(<FolderMoreActionsButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    expect(defaultProps.onToggle).toHaveBeenCalledWith(true);
  });

  it('renders menu items when menu is open', () => {
    render(<FolderMoreActionsButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    expect(screen.getAllByTestId('menu-item').length).toBeGreaterThan(0);
  });

  it('calls viewInfo action when info item is clicked', () => {
    render(<FolderMoreActionsButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    const infoItem = screen.getByText('common.folderInfo');
    fireEvent.click(infoItem);
    expect(mockActions.viewInfo).toHaveBeenCalled();
  });

  it('calls rename action when edit item is clicked', () => {
    render(<FolderMoreActionsButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    const editItem = screen.getByText('common.rename');
    fireEvent.click(editItem);
    expect(mockActions.rename).toHaveBeenCalled();
  });

  it('shows unstar text when folder is starred', () => {
    render(<FolderMoreActionsButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    expect(screen.getByText('common.unstar')).toBeInTheDocument();
  });

  it('shows star text when folder is not starred', () => {
    const props = { ...defaultProps, folder: { ...defaultProps.folder, listUserStar: [] } };
    render(<FolderMoreActionsButton {...props} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    expect(screen.getByText('common.star')).toBeInTheDocument();
  });

  it('renders custom children as target', () => {
    render(<FolderMoreActionsButton {...defaultProps}><span data-testid="custom-target">Custom</span></FolderMoreActionsButton>);
    expect(screen.getByTestId('custom-target')).toBeInTheDocument();
  });

  it('renders dividers', () => {
    render(<FolderMoreActionsButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    expect(screen.getAllByTestId('divider').length).toBeGreaterThan(0);
  });

  it('closes menu after item click', () => {
    render(<FolderMoreActionsButton {...defaultProps} />);
    fireEvent.click(screen.getByTestId('menu-target'));
    const infoItem = screen.getByText('common.folderInfo');
    fireEvent.click(infoItem);
    expect(defaultProps.onToggle).toHaveBeenCalledWith(false);
  });
});

