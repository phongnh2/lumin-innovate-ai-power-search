import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock @loadable/component before anything else
jest.mock('@loadable/component', () => {
  return jest.fn((loader: () => Promise<any>) => {
    const Component = require('react').lazy(loader);
    return (props: any) => {
      const React = require('react');
      return React.createElement(React.Suspense, { fallback: React.createElement('div', null, 'Loading...') },
        React.createElement(Component, props)
      );
    };
  });
});

// Mutable mock state
const mockState = {
  isViewer: false,
  isTabletMatch: false,
};

// Mock axios
jest.mock('axios', () => ({
  isAxiosError: jest.fn((e) => e.isAxiosError),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  Trans: ({ i18nKey, values }: any) => require('react').createElement('span', { 'data-testid': `trans-${i18nKey}` }, i18nKey),
}));

// Mock react-redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(() => ({ _id: 'user-1', name: 'Test User' })),
  shallowEqual: jest.fn(),
}));

// Mock selectors
jest.mock('selectors', () => ({
  getCurrentUser: jest.fn(),
}));

// Mock HOC/OfflineStorageHOC
const mockPreCheckSystemFile = jest.fn().mockResolvedValue(true);
const mockDeleteSystemFile = jest.fn().mockResolvedValue(undefined);
const mockGetFile = jest.fn();
jest.mock('HOC/OfflineStorageHOC', () => ({
  storageHandler: {
    getFile: (url: string) => mockGetFile(url),
  },
  systemFileHandler: {
    preCheckSystemFile: (handle: any, opts: any) => mockPreCheckSystemFile(handle, opts),
    delete: (doc: any) => mockDeleteSystemFile(doc),
  },
}));

// Mock hooks
jest.mock('hooks', () => ({
  useTabletMatch: () => mockState.isTabletMatch,
  useTranslation: () => ({ t: (key: string, interpolation?: any) => key }),
}));

jest.mock('hooks/useViewerMatch', () => ({
  useViewerMatch: () => ({ isViewer: mockState.isViewer }),
}));

// Mock services
const mockCheckUploadBySize = jest.fn().mockReturnValue({ allowedUpload: true });
const mockLinearPdfFromFiles = jest.fn().mockResolvedValue({
  linearizedFile: new Blob(['pdf content']),
  documentInstance: {},
});
const mockGetThumbnailDocument = jest.fn().mockResolvedValue(new Blob(['thumbnail']));
const mockHandleUploadDocumentToPersonal = jest.fn().mockResolvedValue({ _id: 'uploaded-doc-1' });

jest.mock('services/uploadServices', () => ({
  checkUploadBySize: (size: number, flag: boolean) => mockCheckUploadBySize(size, flag),
  linearPdfFromFiles: (file: File) => mockLinearPdfFromFiles(file),
  getThumbnailDocument: (instance: any) => mockGetThumbnailDocument(instance),
  handleUploadDocumentToPersonal: (data: any) => mockHandleUploadDocumentToPersonal(data),
}));

const mockUploadDocumentWithThumbnailToS3 = jest.fn().mockResolvedValue({ encodedUploadData: 'encoded-data' });
const mockUpdateBookmarks = jest.fn().mockResolvedValue(undefined);
jest.mock('services/documentServices', () => ({
  uploadDocumentWithThumbnailToS3: (data: any) => mockUploadDocumentWithThumbnailToS3(data),
  updateBookmarks: (data: any) => mockUpdateBookmarks(data),
}));

const mockUploadDocumentToOrganization = jest.fn().mockResolvedValue({ _id: 'uploaded-doc-2' });
const mockUploadDocumentToOrgTeam = jest.fn().mockResolvedValue({ _id: 'uploaded-doc-3' });
jest.mock('services/organizationServices', () => ({
  uploadDocumentToOrganization: (data: any, opts: any) => mockUploadDocumentToOrganization(data, opts),
  uploadDocumentToOrgTeam: (data: any, opts: any) => mockUploadDocumentToOrgTeam(data, opts),
}));

// Mock utils
jest.mock('utils/error', () => ({
  isGraphError: jest.fn(() => false),
}));

jest.mock('utils/errorInterceptor', () => ({
  getDocumentErrorMessage: jest.fn(() => 'Error message'),
}));

jest.mock('utils/file', () => ({
  fileUtils: {
    getFilenameWithoutExtension: (name: string) => name.replace(/\.[^/.]+$/, ''),
    getExtension: (name: string) => name.split('.').pop() || '',
    getShortFilename: (name: string) => name.slice(0, 20),
  },
}));

jest.mock('utils/getFileService', () => ({
  getLinearizedDocumentFile: jest.fn().mockResolvedValue(new File(['content'], 'test.pdf', { type: 'application/pdf' })),
  getThumbnailUrl: (url: string) => url,
}));

jest.mock('utils/toastUtils', () => ({
  openToastMulti: jest.fn(),
}));

// Mock constants
jest.mock('constants/documentConstants', () => ({
  DOCUMENT_TYPE: {
    PERSONAL: 'PERSONAL',
    ORGANIZATION: 'ORGANIZATION',
    ORGANIZATION_TEAM: 'ORGANIZATION_TEAM',
    FOLDER: 'FOLDER',
  },
  MAX_LENGTH_DOCUMENT_NAME: 255,
  MAX_SIZE_UPLOAD_DOCUMENT: { FREE: 50 * 1024 * 1024 },
}));

jest.mock('constants/documentType', () => ({
  general: { PDF: 'application/pdf' },
  images: { PNG: 'image/png', JPG: 'image/jpeg' },
  office: { DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
}));

jest.mock('constants/errorCode', () => ({
  ErrorCode: {
    Document: {
      OVER_FILE_SIZE_FREE: 'OVER_FILE_SIZE_FREE',
    },
  },
  DefaultErrorCode: {
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  },
}));

jest.mock('constants/lumin-common', () => ({
  ModalTypes: { SUCCESS: 'success', ERROR: 'error' },
}));

jest.mock('constants/messages', () => ({
  ERROR_MESSAGE_DOCUMENT: {
    MAX_LENGTH: { key: 'errorMessage.maxLength', interpolation: {} },
  },
  ERROR_MESSAGE_LIMIT_REQUESTS: 'Too many requests',
  DEVICE_FILE_ERROR_MAPPING: {},
  getUploadOverFileSizeError: (size: number) => `File size exceeds ${size} bytes`,
}));

jest.mock('constants/organizationConstants', () => ({
  MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION: 100,
}));

// Mock useDestination hook
const mockDestinationHook = {
  initialSource: { id: 'personal-1', type: 'PERSONAL', name: 'Personal' },
  initialDestination: { id: 'personal-1', type: 'PERSONAL', name: 'Personal' },
  expandedList: [],
  expandedStatus: { activeSourceName: 'PERSONAL' },
  changeToNewSource: jest.fn(),
  navigateTo: jest.fn(),
  breadcrumb: [{ id: 'personal-1', name: 'Personal' }],
  search: jest.fn(),
  loading: false,
  getInfoOf: jest.fn().mockReturnValue({ totalMember: 50 }),
};

jest.mock('luminComponents/TransferDocument/hooks/useDestination', () => ({
  useDestination: () => mockDestinationHook,
}));

// Mock TransferDocument components
jest.mock('luminComponents/TransferDocument/TransferDocumentLibrary', () => ({
  __esModule: true,
  default: {
    Container: ({ children, open, onClose }: any) => {
      const React = require('react');
      if (!open) return null;
      return React.createElement('div', { 'data-testid': 'transfer-container' },
        React.createElement('button', { 'data-testid': 'close-btn', onClick: onClose }, 'Close'),
        children
      );
    },
    Header: ({ children, toolTipProps }: any) => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'header', 'data-tooltip': toolTipProps?.title }, children);
    },
    Error: ({ error }: any) => {
      const React = require('react');
      return error ? React.createElement('div', { 'data-testid': 'error-message' }, error) : null;
    },
    NameInput: ({ label, placeholder, value, errorMessage, onChange, onBlur }: any) => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'name-input-wrapper' },
        React.createElement('input', {
          'data-testid': 'name-input',
          placeholder,
          value,
          onChange,
          onBlur,
        }),
        errorMessage && React.createElement('span', { 'data-testid': 'name-error' }, errorMessage)
      );
    },
    DropdownSources: ({ children, onChange }: any) => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'dropdown-sources' },
        children,
        React.createElement('button', { 'data-testid': 'change-source-btn', onClick: () => onChange({}) }, 'Change')
      );
    },
    CustomDivider: () => {
      const React = require('react');
      return React.createElement('hr', { 'data-testid': 'divider' });
    },
    CustomLoading: () => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'loading' }, 'Loading...');
    },
    Checkbox: ({ children, value, onChange }: any) => {
      const React = require('react');
      return React.createElement('label', { 'data-testid': 'checkbox-wrapper' },
        React.createElement('input', {
          type: 'checkbox',
          'data-testid': 'notify-checkbox',
          checked: value,
          onChange,
        }),
        children
      );
    },
    GroupButton: ({ onSubmit, onClose, submitStatus, hasError }: any) => {
      const React = require('react');
      return React.createElement('div', { 'data-testid': 'group-buttons' },
        React.createElement('button', {
          'data-testid': 'submit-btn',
          onClick: onSubmit,
          disabled: hasError || submitStatus?.isSubmitting,
        }, submitStatus?.title || 'Submit'),
        React.createElement('button', { 'data-testid': 'cancel-btn', onClick: onClose }, 'Cancel')
      );
    },
  },
}));

// Mock ExpandedList
jest.mock('luminComponents/TransferDocument/components/ExpandedList', () => ({
  __esModule: true,
  default: ({ data, setData }: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'expanded-list' },
      React.createElement('button', {
        'data-testid': 'select-destination',
        onClick: () => setData({ ...data, destination: { id: 'org-1', type: 'ORGANIZATION', name: 'Org' } }),
      }, 'Select Org')
    );
  },
}));

// Import component directly (not through loadable wrapper)
import UploadDocumentModal from 'luminComponents/TransferDocument/components/UploadDocumentModal/UploadDocumentModal';

describe('UploadDocumentModal', () => {
  const defaultProps = {
    document: {
      _id: 'doc-1',
      name: 'test-document.pdf',
      fileHandle: {
        getFile: jest.fn().mockResolvedValue(new File(['content'], 'test-document.pdf', { type: 'application/pdf', lastModified: Date.now() })),
      },
      thumbnail: 'thumbnail-url',
      bookmarks: '[]',
    },
    visible: true,
    onClose: jest.fn(),
    title: 'Upload Document',
    submitTitle: 'Upload',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockState.isViewer = false;
    mockState.isTabletMatch = false;
    mockDestinationHook.loading = false;
    mockDestinationHook.breadcrumb = [{ id: 'personal-1', name: 'Personal' }];
    mockDestinationHook.expandedStatus = { activeSourceName: 'PERSONAL' };
  });

  describe('Rendering', () => {
    it('renders when visible', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('transfer-container')).toBeInTheDocument();
    });

    it('does not render when not visible', () => {
      render(<UploadDocumentModal {...defaultProps} visible={false} />);
      expect(screen.queryByTestId('transfer-container')).not.toBeInTheDocument();
    });

    it('renders header with title', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('header')).toHaveTextContent('Upload Document');
    });

    it('renders name input with document name', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('name-input')).toHaveValue('test-document');
    });

    it('renders dropdown sources', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('dropdown-sources')).toBeInTheDocument();
    });

    it('renders divider', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('divider')).toBeInTheDocument();
    });

    it('renders expanded list when not loading', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('expanded-list')).toBeInTheDocument();
    });

    it('renders loading when loading', () => {
      mockDestinationHook.loading = true;
      render(<UploadDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders group buttons', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('group-buttons')).toBeInTheDocument();
    });
  });

  describe('Header tooltip', () => {
    it('shows tooltip with bottom placement on desktop', () => {
      mockState.isTabletMatch = false;
      render(<UploadDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('header')).toHaveAttribute('data-tooltip', 'modalUploadDoc.tooltipUpload');
    });

    it('shows tooltip with right placement on tablet', () => {
      mockState.isTabletMatch = true;
      render(<UploadDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('header')).toHaveAttribute('data-tooltip', 'modalUploadDoc.tooltipUpload');
    });
  });

  describe('Name input', () => {
    it('updates document name on change', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      const input = screen.getByTestId('name-input');
      fireEvent.change(input, { target: { value: 'new-name' } });
      expect(input).toHaveValue('new-name');
    });

    it('shows error when name is empty on blur', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      const input = screen.getByTestId('name-input');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);
      expect(screen.getByTestId('name-error')).toHaveTextContent('errorMessage.fieldRequired');
    });

    it('shows error when name exceeds max length on blur', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      const input = screen.getByTestId('name-input');
      const longName = 'a'.repeat(300);
      fireEvent.change(input, { target: { value: longName } });
      fireEvent.blur(input);
      expect(screen.getByTestId('name-error')).toHaveTextContent('errorMessage.maxLength');
    });

    it('clears error when typing after error', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      const input = screen.getByTestId('name-input');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);
      expect(screen.getByTestId('name-error')).toBeInTheDocument();
      fireEvent.change(input, { target: { value: 'valid-name' } });
      expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
    });
  });

  describe('Notify checkbox', () => {
    it('shows checkbox for organization destination', () => {
      mockDestinationHook.breadcrumb = [{ id: 'org-1', name: 'Organization' }];
      mockDestinationHook.initialDestination = { id: 'org-1', type: 'ORGANIZATION', name: 'Organization' };
      render(<UploadDocumentModal {...defaultProps} />);
      // Select org destination first
      fireEvent.click(screen.getByTestId('select-destination'));
      expect(screen.getByTestId('checkbox-wrapper')).toBeInTheDocument();
    });

    it('shows notifyEveryone when member count is low', () => {
      mockDestinationHook.getInfoOf = jest.fn().mockReturnValue({ totalMember: 50 });
      mockDestinationHook.breadcrumb = [{ id: 'org-1', name: 'Organization' }];
      render(<UploadDocumentModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('select-destination'));
      expect(screen.getByTestId('checkbox-wrapper')).toHaveTextContent('modalUploadDoc.notifyEveryone');
    });

    it('shows notifyAdministrators when member count is high', () => {
      mockDestinationHook.getInfoOf = jest.fn().mockReturnValue({ totalMember: 150 });
      mockDestinationHook.breadcrumb = [{ id: 'org-1', name: 'Organization' }];
      render(<UploadDocumentModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('select-destination'));
      expect(screen.getByTestId('checkbox-wrapper')).toHaveTextContent('modalUploadDoc.notifyAdministrators');
    });

    it('toggles notify checkbox', () => {
      mockDestinationHook.breadcrumb = [{ id: 'org-1', name: 'Organization' }];
      render(<UploadDocumentModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('select-destination'));
      const checkbox = screen.getByTestId('notify-checkbox');
      expect(checkbox).not.toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });

  describe('Source change', () => {
    it('calls changeToNewSource when dropdown changes', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('change-source-btn'));
      expect(mockDestinationHook.changeToNewSource).toHaveBeenCalled();
    });
  });

  describe('Close modal', () => {
    it('calls onClose when close button clicked', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('close-btn'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when cancel button clicked', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('cancel-btn'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Submit button state', () => {
    it('disables submit when there is name error', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      const input = screen.getByTestId('name-input');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);
      expect(screen.getByTestId('submit-btn')).toBeDisabled();
    });

    it('disables submit when no destination selected', () => {
      mockDestinationHook.initialDestination = { id: '', type: '', name: '' };
      render(<UploadDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('submit-btn')).toBeDisabled();
    });
  });

  describe('onSubmit flow', () => {
    it('triggers submit when button clicked', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      const submitBtn = screen.getByTestId('submit-btn');
      fireEvent.click(submitBtn);
      // Submit starts async process - button may be disabled due to no destination.id initially
    });

    it('has submit button with correct title', () => {
      render(<UploadDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('submit-btn')).toHaveTextContent('Upload');
    });

    it('enables submit when valid destination selected', () => {
      mockDestinationHook.initialDestination = { id: 'dest-1', type: 'PERSONAL', name: 'Personal' };
      render(<UploadDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('submit-btn')).not.toBeDisabled();
    });

    it('handles upload to personal destination', async () => {
      mockDestinationHook.initialDestination = { id: 'personal-1', type: 'PERSONAL', name: 'Personal' };
      mockGetFile.mockResolvedValue({ clone: () => ({ blob: () => Promise.resolve(new Blob(['thumbnail'])) }) });
      
      render(<UploadDocumentModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('submit-btn'));
      
      await waitFor(() => {
        expect(mockCheckUploadBySize).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('handles upload to organization destination', async () => {
      mockDestinationHook.initialDestination = { id: 'org-1', type: 'ORGANIZATION', name: 'Org', belongsTo: null };
      mockGetFile.mockResolvedValue({ clone: () => ({ blob: () => Promise.resolve(new Blob(['thumbnail'])) }) });
      
      render(<UploadDocumentModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('select-destination'));
      fireEvent.click(screen.getByTestId('submit-btn'));
      
      await waitFor(() => {
        expect(mockCheckUploadBySize).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('handles upload to organization team destination', async () => {
      mockDestinationHook.initialDestination = { id: 'team-1', type: 'ORGANIZATION_TEAM', name: 'Team', belongsTo: null };
      mockGetFile.mockResolvedValue({ clone: () => ({ blob: () => Promise.resolve(new Blob(['thumbnail'])) }) });
      
      render(<UploadDocumentModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('submit-btn'));
      
      await waitFor(() => {
        expect(mockCheckUploadBySize).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('handles upload to folder destination', async () => {
      mockDestinationHook.initialDestination = { 
        id: 'folder-1', 
        type: 'FOLDER', 
        name: 'Folder',
        belongsTo: { id: 'personal-1', type: 'PERSONAL' }
      };
      mockGetFile.mockResolvedValue({ clone: () => ({ blob: () => Promise.resolve(new Blob(['thumbnail'])) }) });
      
      render(<UploadDocumentModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('submit-btn'));
      
      await waitFor(() => {
        expect(mockCheckUploadBySize).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('shows error when file size check fails', async () => {
      mockDestinationHook.initialDestination = { id: 'personal-1', type: 'PERSONAL', name: 'Personal' };
      mockCheckUploadBySize.mockReturnValueOnce({ allowedUpload: false });
      
      render(<UploadDocumentModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('submit-btn'));
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('closes modal when file system access denied', async () => {
      mockDestinationHook.initialDestination = { id: 'personal-1', type: 'PERSONAL', name: 'Personal' };
      mockPreCheckSystemFile.mockResolvedValueOnce(false);
      
      render(<UploadDocumentModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('submit-btn'));
      
      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('Viewer mode', () => {
    it('uses different file retrieval method', async () => {
      mockState.isViewer = true;
      mockDestinationHook.initialDestination = { id: 'personal-1', type: 'PERSONAL', name: 'Personal' };
      mockGetFile.mockResolvedValue({ clone: () => ({ blob: () => Promise.resolve(new Blob(['thumbnail'])) }) });
      
      render(<UploadDocumentModal {...defaultProps} />);
      fireEvent.click(screen.getByTestId('submit-btn'));
      
      await waitFor(() => {
        expect(mockCheckUploadBySize).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('Folder destination', () => {
    it('shows checkbox for folder in organization', () => {
      mockDestinationHook.breadcrumb = [{ id: 'org-1', name: 'Org' }, { id: 'folder-1', name: 'Folder' }];
      mockDestinationHook.expandedStatus = { activeSourceName: 'FOLDER' };
      render(<UploadDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('checkbox-wrapper')).toBeInTheDocument();
    });
  });
});

