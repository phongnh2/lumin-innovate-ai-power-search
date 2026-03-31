import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Define mocks with mock prefix for hoisting
const mockCurrentUser = {
  _id: 'user-123',
  name: 'Test User',
  payment: { type: 'free' },
};

const mockOrganizationList = {
  data: [
    {
      organization: {
        _id: 'org-123',
        name: 'Test Org',
        teams: [{ _id: 'team-123', name: 'Test Team' }],
      },
    },
  ],
  loading: false,
};

const mockT = jest.fn((key: string) => key);
const mockIsEnableReskin = { isEnableReskin: false };
const mockShowModal = jest.fn();
const mockEnqueueSnackbar = jest.fn();
const mockDuplicateDocument = jest.fn();
const mockDuplicateDocumentToFolder = jest.fn();
const mockLinearPdfFromFiles = jest.fn();
const mockCheckUploadBySize = jest.fn();

jest.mock('react-redux', () => ({
  useSelector: jest.fn().mockImplementation((selector: unknown) => {
    const selectorStr = String(selector);
    const mockUser = {
      _id: 'user-123',
      name: 'Test User',
      payment: { type: 'free' },
    };
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
    // Return an object with data and loading that matches OrganizationList interface
    return { data: mockOrgListData, loading: false };
  }),
  shallowEqual: jest.fn(),
}));

jest.mock('selectors', () => ({
  getCurrentUser: jest.fn(),
  getOrganizationList: jest.fn(),
}));

jest.mock('hooks', () => ({
  useEnableWebReskin: () => ({ isEnableReskin: false }),
  useTranslation: () => ({ t: (key: string) => key }),
  usePaymentUrlDestination: () => ({
    paymentUrl: '/payment',
    isManager: true,
    contentUrl: 'Upgrade',
    orgDestination: { _id: 'org-123' },
  }),
  useStrictDownloadGooglePerms: () => ({
    showModal: jest.fn(),
  }),
}));

jest.mock('@libs/snackbar', () => ({
  enqueueSnackbar: jest.fn(),
}));

jest.mock('services', () => ({
  documentServices: {
    duplicateDocument: jest.fn(),
    duplicateDocumentToFolder: jest.fn(),
  },
  uploadServices: {
    linearPdfFromFiles: jest.fn().mockResolvedValue({ linearizedFile: new Blob(['test']) }),
    checkUploadBySize: jest.fn().mockReturnValue({ allowedUpload: true, maxSizeAllow: 100 }),
  },
}));

jest.mock('utils', () => ({
  getFile: jest.fn().mockResolvedValue(new Blob(['test'])),
  file: {
    getFilenameWithoutExtension: (name: string) => name.replace(/\.[^/.]+$/, ''),
    getExtension: (name: string) => name.split('.').pop(),
  },
  validator: {
    validatePremiumOrganization: jest.fn().mockReturnValue(true),
  },
}));

jest.mock('utils/error', () => ({
  extractGqlError: jest.fn().mockReturnValue({ code: '' }),
  isGraphError: jest.fn().mockReturnValue(false),
}));

jest.mock('utils/errorInterceptor', () => ({
  getDocumentErrorMessage: jest.fn().mockReturnValue('Unknown error'),
}));

jest.mock('utils/Factory/EventCollection/DocumentEventCollection', () => ({
  downloadDocumentSuccess: jest.fn().mockResolvedValue({}),
}));

jest.mock('utils/lazyWithRetry', () => ({
  lazyWithRetry: jest.fn(() => {
    const React = require('react');
    const MockTransferDocument = (props: Record<string, unknown>) => {
      const handleSubmit = () => {
        if (typeof props.onSubmit === 'function') {
          props.onSubmit({ target: {} });
        }
      };
      const handleClose = () => {
        if (typeof props.onClose === 'function') {
          props.onClose();
        }
      };
      return React.createElement('div', { 'data-testid': 'transfer-document', 'data-context': props.context },
        React.createElement('button', { 'data-testid': 'close-btn', onClick: handleClose }, 'Close'),
        React.createElement('button', { 'data-testid': 'submit-btn', onClick: handleSubmit }, 'Submit')
      );
    };
    return MockTransferDocument;
  }),
}));

jest.mock('constants/documentConstants', () => ({
  documentStorage: { s3: 's3' },
  DOCUMENT_TYPE: {
    PERSONAL: 'PERSONAL',
    ORGANIZATION: 'ORGANIZATION',
    ORGANIZATION_TEAM: 'ORGANIZATION_TEAM',
    FOLDER: 'FOLDER',
  },
}));

jest.mock('constants/errorCode', () => ({
  ErrorCode: {
    Document: { ORG_REACHED_DOC_STACK_LIMIT: 'ORG_REACHED_DOC_STACK_LIMIT' },
    Common: { RESTRICTED_ACTION: 'RESTRICTED_ACTION' },
  },
  GoogleErrorCode: { CANNOT_DOWNLOAD_FILE: 'CANNOT_DOWNLOAD_FILE' },
}));

jest.mock('constants/messages', () => ({
  ERROR_MESSAGE_DOCUMENT: { MOVE_DOCUMENT_FAILED: 'Move failed' },
  ERROR_MESSAGE_RESTRICTED_ACTION: 'Restricted action',
  ERROR_MESSAGE_TYPE: { PDF_CANCEL_PASSWORD: 'PDF_CANCEL_PASSWORD' },
  ERROR_MESSAGE_UNKNOWN_ERROR: 'Unknown error',
  getUploadOverFileSizeError: () => 'File too large',
}));

jest.mock('constants/styles', () => ({
  ModalSize: { MDX: 720 },
}));

jest.mock('constants/supportedFiles', () => ({
  supportedPDFExtensions: ['pdf'],
}));

jest.mock('luminComponents/Dialog', () => ({
  LazyContentDialog: ({ children }: React.PropsWithChildren<object>) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'lazy-dialog' }, children);
  },
}));

jest.mock('luminComponents/Loading', () => ({
  __esModule: true,
  default: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'loading' }, 'Loading');
  },
}));

jest.mock('luminComponents/ModalFolder/components/ModalSkeleton', () => ({
  __esModule: true,
  default: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'modal-skeleton' }, 'Skeleton');
  },
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

jest.mock('luminComponents/TransferDocument/TransferDocument.styled', () => ({
  CustomLink: ({ children }: React.PropsWithChildren<object>) => {
    const React = require('react');
    return React.createElement('a', null, children);
  },
}));

jest.mock('luminComponents/TransferDocument/TransferDocumentStyled', () => ({
  LoadingIcon: ({ children }: React.PropsWithChildren<object>) => {
    const React = require('react');
    return React.createElement('div', null, children);
  },
}));

// Import after mocks
import CopyDocumentModal from '../components/CopyDocumentModal/CopyDocumentModal';
import { uploadServices } from 'services';

describe('CopyDocumentModal', () => {
  const mockDocument = {
    _id: 'doc-123',
    name: 'test-document.pdf',
    size: 1024,
    service: 's3',
    folderId: null,
    isShared: false,
    belongsTo: {
      type: 'PERSONAL',
      location: { _id: 'user-123', url: 'test' },
      workspaceId: null,
    },
    clientId: 'client-123',
  };

  const defaultProps = {
    document: mockDocument as any,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (uploadServices.checkUploadBySize as jest.Mock).mockReturnValue({ allowedUpload: true, maxSizeAllow: 100 });
  });

  describe('Loading State', () => {
    it('should render TransferDocument when not loading', () => {
      render(<CopyDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('transfer-document')).toBeInTheDocument();
    });
  });

  describe('Rendering', () => {
    it('should render TransferDocument', () => {
      render(<CopyDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('transfer-document')).toBeInTheDocument();
    });

    it('should pass COPY context to TransferDocument', () => {
      render(<CopyDocumentModal {...defaultProps} />);
      expect(screen.getByTestId('transfer-document')).toHaveAttribute('data-context', 'COPY');
    });
  });

  describe('Close functionality', () => {
    it('should call onClose when close button clicked', () => {
      render(<CopyDocumentModal {...defaultProps} />);
      const closeBtn = screen.getByTestId('close-btn');
      fireEvent.click(closeBtn);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Submit functionality', () => {
    it('should handle submit button click', async () => {
      render(<CopyDocumentModal {...defaultProps} />);
      const submitBtn = screen.getByTestId('submit-btn');
      fireEvent.click(submitBtn);
      
      await waitFor(() => {
        expect(screen.getByTestId('transfer-document')).toBeInTheDocument();
      });
    });
  });

  describe('Default location', () => {
    it('should handle personal document without workspace', () => {
      const personalDoc = {
        ...mockDocument,
        belongsTo: {
          type: 'PERSONAL',
          location: { _id: 'user-123' },
          workspaceId: null,
        },
      };
      render(<CopyDocumentModal {...defaultProps} document={personalDoc as any} />);
      expect(screen.getByTestId('transfer-document')).toBeInTheDocument();
    });

    it('should handle shared document', () => {
      const sharedDoc = {
        ...mockDocument,
        isShared: true,
      };
      render(<CopyDocumentModal {...defaultProps} document={sharedDoc as any} />);
      expect(screen.getByTestId('transfer-document')).toBeInTheDocument();
    });

    it('should handle organization document', () => {
      const orgDoc = {
        ...mockDocument,
        belongsTo: {
          type: 'ORGANIZATION',
          location: { _id: 'org-123' },
        },
        clientId: 'org-123',
      };
      render(<CopyDocumentModal {...defaultProps} document={orgDoc as any} />);
      expect(screen.getByTestId('transfer-document')).toBeInTheDocument();
    });
  });
});
