import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock hooks
const mockT = jest.fn((key) => key);

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: mockT }),
}));

// Mock services
const mockBulkUpdateSharingPermission = jest.fn();
jest.mock('services', () => ({
  documentServices: {
    bulkUpdateSharingPermission: (...args: unknown[]) => mockBulkUpdateSharingPermission(...args),
  },
}));

// Mock utils
const mockToastOpenUnknownErrorToast = jest.fn();
jest.mock('utils', () => ({
  toastUtils: {
    openUnknownErrorToast: (...args: unknown[]) => mockToastOpenUnknownErrorToast(...args),
  },
  getDocumentSharingPermission: () => ({
    spectator: { role: 'spectator', text: 'Viewer', icon: <span>eye</span> },
    viewer: { role: 'viewer', text: 'Commenter', icon: <span>comment</span> },
    editor: { role: 'editor', text: 'Editor', icon: <span>edit</span> },
    sharer: { role: 'sharer', text: 'Sharer', icon: <span>share</span> },
  }),
}));

const mockExtractGqlError = jest.fn();
jest.mock('utils/error', () => ({
  extractGqlError: (...args: unknown[]) => mockExtractGqlError(...args),
}));

jest.mock('utils/yup', () => ({
  object: () => ({ shape: () => ({}) }),
  string: () => ({ oneOf: () => ({ required: () => ({}) }) }),
  boolean: () => ({ required: () => ({}) }),
}));

jest.mock('helpers/logger', () => ({
  __esModule: true,
  default: { logError: jest.fn() },
}));

jest.mock('@socket', () => ({
  socket: { emit: jest.fn() },
}));

// Mock constants
jest.mock('constants/documentConstants', () => ({
  BULK_UPDATE_LIST_TITLE: { INVITED_LIST: 'invitedList', MEMBER_LIST: 'memberList' },
  DocumentRole: { SPECTATOR: 'spectator', VIEWER: 'viewer', EDITOR: 'editor', SHARER: 'sharer' },
}));

jest.mock('constants/lumin-common', () => ({
  LOGGER: { Service: { BULK_UPDATE_SHARE_PERMISSION: 'bulk-update' } },
  STATUS_CODE: { FORBIDDEN: 403 },
}));

jest.mock('constants/socketConstant', () => ({
  SOCKET_EMIT: { UPDATE_DOCUMENT: 'update', UPDATE_DOCUMENT_PRINCIPLE_LIST: 'principle' },
}));

jest.mock('@hookform/resolvers/yup', () => ({
  yupResolver: () => jest.fn(),
}));

const mockWatch = jest.fn().mockReturnValue([true, false]);
const mockHandleSubmit = jest.fn((fn) => () => fn({ permission: 'spectator', invitedList: true, memberList: false }));

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    formState: { isSubmitting: false, isValid: true },
    handleSubmit: mockHandleSubmit,
    watch: mockWatch,
  }),
  Controller: ({ render, name }: { render: (props: { field: { onChange: () => void; value: unknown } }) => React.ReactNode; name: string }) => {
    const mockField = { onChange: jest.fn(), value: name === 'permission' ? 'spectator' : true };
    return <>{render({ field: mockField })}</>;
  },
}));

// Mock lumin-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  Button: ({ children, onClick, disabled, loading }: React.PropsWithChildren<{ onClick?: () => void; disabled?: boolean; loading?: boolean }>) => (
    <button onClick={onClick} disabled={disabled} data-loading={loading}>{children}</button>
  ),
  Divider: () => <hr data-testid="divider" />,
  enqueueSnackbar: jest.fn(),
  Menu: ({ children, ComponentTarget }: React.PropsWithChildren<{ ComponentTarget: React.ReactNode }>) => (
    <div data-testid="menu">{ComponentTarget}{children}</div>
  ),
  MenuItem: ({ children, onClick }: React.PropsWithChildren<{ onClick?: () => void }>) => (
    <div data-testid="menu-item" onClick={onClick}>{children}</div>
  ),
  Paper: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
    <div data-testid="paper" className={className}>{children}</div>
  ),
  PlainTooltip: ({ children }: React.PropsWithChildren<object>) => <div data-testid="tooltip">{children}</div>,
  Text: ({ children }: React.PropsWithChildren<object>) => <span data-testid="text">{children}</span>,
}));

jest.mock('luminComponents/ShareModal/components/Title', () => ({
  __esModule: true,
  default: ({ title, onBack, showBackButton, backButtonProps }: { title: string; onBack?: () => void; showBackButton?: boolean; backButtonProps?: { disabled?: boolean } }) => (
    <div data-testid="title">
      {showBackButton && <button data-testid="back-button" onClick={onBack} disabled={backButtonProps?.disabled}>Back</button>}
      <span>{title}</span>
    </div>
  ),
}));

jest.mock('luminComponents/BulkUpdateSharePermission/components/BulkUpdateListItem', () => ({
  __esModule: true,
  default: ({ text, checked, onChange }: { text: string; checked: boolean; onChange: (checked: boolean) => void }) => (
    <div data-testid="bulk-update-list-item" data-checked={checked}>
      <span>{text}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </div>
  ),
}));

jest.mock('features/DocumentActionPermission', () => ({
  DocumentActionPermissionSetting: ({ selectedRolesPermission }: { selectedRolesPermission: string }) => (
    <div data-testid="doc-action-permission">{selectedRolesPermission}</div>
  ),
  useUpdateDocumentActionPermissionSettings: () => ({ updateDocumentActionPermissionSettings: jest.fn() }),
  getPrincipleOptionKey: () => 'default-key',
  PERMISSION_ROLES: { 'default-key': { value: [] } },
}));

jest.mock('luminComponents/BulkUpdateSharePermission/BulkUpdateSharePermission.module.scss', () => ({
  container: 'container',
  bulkUpdateListContainer: 'bulkUpdateListContainer',
  bulkUpdateTitle: 'bulkUpdateTitle',
  bulkUpdateListWrapper: 'bulkUpdateListWrapper',
  permissionContainerWrapper: 'permissionContainerWrapper',
  permissionContainer: 'permissionContainer',
  iconWrapper: 'iconWrapper',
  footerWrapper: 'footerWrapper',
}));

import BulkUpdateSharePermission from 'luminComponents/BulkUpdateSharePermission/BulkUpdateSharePermission';

describe('BulkUpdateSharePermission', () => {
  const defaultProps = {
    documentId: 'doc-123',
    defaultValue: null,
    bulkUpdateList: [
      { value: 'invitedList', text: 'Invited List' },
      { value: 'memberList', text: 'Member List' },
    ],
    onCancel: jest.fn(),
    onCompleted: jest.fn(),
    openPermissionDeniedModal: jest.fn(),
    canBulkUpdate: true,
    principleList: [],
    enableEditDocumentActionPermission: false,
    currentDocument: { capabilities: {} },
    updateDocument: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockBulkUpdateSharingPermission.mockResolvedValue({});
    mockExtractGqlError.mockReturnValue({ statusCode: 500 });
    mockWatch.mockReturnValue([true, false]);
  });

  it('should render Paper container', () => {
    render(<BulkUpdateSharePermission {...defaultProps} />);
    expect(screen.getByTestId('paper')).toBeInTheDocument();
  });

  it('should render Title with back button', () => {
    render(<BulkUpdateSharePermission {...defaultProps} />);
    expect(screen.getByTestId('title')).toBeInTheDocument();
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
  });

  it('should render bulk update list items when canBulkUpdate is true', () => {
    render(<BulkUpdateSharePermission {...defaultProps} />);
    expect(screen.getAllByTestId('bulk-update-list-item')).toHaveLength(2);
  });

  it('should not render bulk update list when canBulkUpdate is false', () => {
    render(<BulkUpdateSharePermission {...defaultProps} canBulkUpdate={false} />);
    expect(screen.queryByTestId('bulk-update-list-item')).not.toBeInTheDocument();
  });

  it('should render DocumentActionPermissionSetting when enableEditDocumentActionPermission is true', () => {
    render(<BulkUpdateSharePermission {...defaultProps} enableEditDocumentActionPermission />);
    expect(screen.getByTestId('doc-action-permission')).toBeInTheDocument();
  });

  it('should call onCancel when back button clicked', () => {
    render(<BulkUpdateSharePermission {...defaultProps} />);
    fireEvent.click(screen.getByTestId('back-button'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button clicked', () => {
    render(<BulkUpdateSharePermission {...defaultProps} />);
    fireEvent.click(screen.getByText('common.cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('should call bulkUpdateSharingPermission on submit', async () => {
    render(<BulkUpdateSharePermission {...defaultProps} />);
    await act(async () => {
      fireEvent.click(screen.getByText('common.update'));
    });
    await waitFor(() => expect(mockBulkUpdateSharingPermission).toHaveBeenCalled());
  });

  it('should call openPermissionDeniedModal on FORBIDDEN error', async () => {
    mockBulkUpdateSharingPermission.mockRejectedValue(new Error('Forbidden'));
    mockExtractGqlError.mockReturnValue({ statusCode: 403 });

    render(<BulkUpdateSharePermission {...defaultProps} />);
    await act(async () => {
      fireEvent.click(screen.getByText('common.update'));
    });
    await waitFor(() => expect(defaultProps.openPermissionDeniedModal).toHaveBeenCalled());
  });

  it('should show unknown error toast on other errors', async () => {
    mockBulkUpdateSharingPermission.mockRejectedValue(new Error('Error'));
    mockExtractGqlError.mockReturnValue({ statusCode: 500 });

    render(<BulkUpdateSharePermission {...defaultProps} />);
    await act(async () => {
      fireEvent.click(screen.getByText('common.update'));
    });
    await waitFor(() => expect(mockToastOpenUnknownErrorToast).toHaveBeenCalled());
  });

  it('should disable submit when no list selected', () => {
    mockWatch.mockReturnValue([false, false]);
    render(<BulkUpdateSharePermission {...defaultProps} />);
    expect(screen.getByText('common.update')).toBeDisabled();
  });

  it('should render menu for permission selection', () => {
    render(<BulkUpdateSharePermission {...defaultProps} />);
    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });

  it('should show saveChanges button when enableEditDocumentActionPermission is true', () => {
    render(<BulkUpdateSharePermission {...defaultProps} enableEditDocumentActionPermission />);
    expect(screen.getByText('common.saveChanges')).toBeInTheDocument();
  });
});
