import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mutable mock state
const mockState = {
  openUploadFileDialog: false,
  uploadOptions: {
    s3: true,
    google: true,
    dropbox: true,
    oneDrive: true,
  },
  isElectron: false,
};

// Mock react-i18next
jest.mock('react-i18next', () => ({
  Trans: ({ i18nKey, values }: any) => require('react').createElement('span', { 'data-testid': `trans-${i18nKey}` }, `${i18nKey} - ${values?.text || ''}`),
}));

// Mock assets
jest.mock('assets/reskin/lumin-svgs/logo-dropbox-md.svg', () => 'dropbox-logo.svg');
jest.mock('assets/reskin/lumin-svgs/logo-googledrive-md.svg', () => 'googledrive-logo.svg');
jest.mock('assets/reskin/lumin-svgs/logo-onedrive-md.svg', () => 'onedrive-logo.svg');

// Mock hooks
jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key: string, values?: any) => values?.text ? `${key} - ${values.text}` : key }),
  useUploadOptions: () => mockState.uploadOptions,
}));

const mockDeleteSearchParams = jest.fn();
jest.mock('hooks/useOpenUploadFile', () => ({
  __esModule: true,
  default: () => ({
    openUploadFileDialog: mockState.openUploadFileDialog,
    deleteSearchParams: mockDeleteSearchParams,
  }),
}));

// Mock utils
jest.mock('utils/corePathHelper', () => ({
  isElectron: () => mockState.isElectron,
}));

jest.mock('utils/Factory/EventCollection/constants/ButtonEvent', () => ({
  ButtonName: { UPLOAD_FROM_ONE_DRIVE: 'UPLOAD_FROM_ONE_DRIVE' },
  ButtonPurpose: { UPLOAD_FROM_ONE_DRIVE: 'upload' },
}));

// Mock constants
jest.mock('constants/customConstant', () => ({
  UPLOAD_FILE_TYPE: { DOCUMENT: 'document', TEMPLATE: 'template' },
  DOCUMENT_STORAGE: { google: 'google', dropbox: 'dropbox', s3: 's3', oneDrive: 'oneDrive' },
}));

jest.mock('constants/documentConstants', () => ({
  DocumentStorage: { S3: 's3', GOOGLE: 'google', DROPBOX: 'dropbox', ONEDRIVE: 'oneDrive' },
}));

jest.mock('constants/documentType', () => ({
  general: { PDF: 'application/pdf' },
  acceptedMimeType: ['application/pdf', 'image/png', 'image/jpeg'],
}));

// Mock lumin-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  MenuItem: ({ children, onClick, disabled, leftSection, leftIconProps, ...props }: any) => {
    const React = require('react');
    return React.createElement('div', { 
      'data-testid': 'menu-item',
      'data-disabled': String(!!disabled),
      onClick,
      ...props,
    }, leftSection, children);
  },
}));

// Mock file picker components
jest.mock('luminComponents/DropboxFileChooser', () => ({
  __esModule: true,
  default: ({ children, uploadFiles, onClose, onPicked }: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'dropbox-picker' }, children);
  },
}));

jest.mock('luminComponents/GoogleFilePicker', () => ({
  __esModule: true,
  default: ({ children, uploadFiles, onClose, onPicked }: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'google-picker' }, children);
  },
}));

jest.mock('luminComponents/OneDriveFilePicker', () => ({
  __esModule: true,
  default: ({ children, uploadFiles, onClose, onPicked }: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'onedrive-picker' }, children);
  },
}));

// Mock styled components
jest.mock('../UploadDropZone.styled', () => ({
  PopperText: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'popper-text' }, children),
  LeftLogoWrapper: ({ children }: any) => require('react').createElement('span', { 'data-testid': 'left-logo-wrapper' }, children),
}));

// Import after mocks
import UploadDropZonePopper from '../UploadDropZonePopper';

describe('UploadDropZonePopper', () => {
  const defaultProps = {
    closePopper: jest.fn(),
    onUploadLuminFiles: jest.fn(),
    folderId: 'folder-1',
    folderType: 'personal',
    isOffline: false,
    uploadType: 'document',
    buttonProps: {},
    isOnHomeEditAPdfFlow: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockState.openUploadFileDialog = false;
    mockState.uploadOptions = {
      s3: true,
      google: true,
      dropbox: true,
      oneDrive: true,
    };
    mockState.isElectron = false;
  });

  describe('Rendering', () => {
    it('renders my device upload option when s3 enabled', () => {
      render(<UploadDropZonePopper {...defaultProps} />);
      expect(screen.getByText('navbar.fromMyDevice')).toBeInTheDocument();
    });

    it('renders Google Drive option when google enabled', () => {
      render(<UploadDropZonePopper {...defaultProps} />);
      expect(screen.getByTestId('google-picker')).toBeInTheDocument();
    });

    it('renders OneDrive option when oneDrive enabled', () => {
      render(<UploadDropZonePopper {...defaultProps} />);
      expect(screen.getByTestId('onedrive-picker')).toBeInTheDocument();
    });

    it('renders Dropbox option when dropbox enabled and not electron', () => {
      mockState.isElectron = false;
      render(<UploadDropZonePopper {...defaultProps} />);
      expect(screen.getByTestId('dropbox-picker')).toBeInTheDocument();
    });

    it('does not render Dropbox option in electron', () => {
      mockState.isElectron = true;
      render(<UploadDropZonePopper {...defaultProps} />);
      expect(screen.queryByTestId('dropbox-picker')).not.toBeInTheDocument();
    });
  });

  describe('Disabled options when offline', () => {
    it('disables my device option when offline', () => {
      render(<UploadDropZonePopper {...defaultProps} isOffline={true} />);
      const menuItems = screen.getAllByTestId('menu-item');
      expect(menuItems[0]).toHaveAttribute('data-disabled', 'true');
    });

    it('disables Google Drive option when offline', () => {
      render(<UploadDropZonePopper {...defaultProps} isOffline={true} />);
      const googlePicker = screen.getByTestId('google-picker');
      const menuItem = googlePicker.querySelector('[data-testid="menu-item"]');
      expect(menuItem).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Conditional rendering based on uploadOptions', () => {
    it('does not render my device option when s3 disabled', () => {
      mockState.uploadOptions.s3 = false;
      render(<UploadDropZonePopper {...defaultProps} />);
      expect(screen.queryByText('navbar.fromMyDevice')).not.toBeInTheDocument();
    });

    it('does not render Google Drive option when google disabled', () => {
      mockState.uploadOptions.google = false;
      render(<UploadDropZonePopper {...defaultProps} />);
      expect(screen.queryByTestId('google-picker')).not.toBeInTheDocument();
    });

    it('does not render OneDrive option when oneDrive disabled', () => {
      mockState.uploadOptions.oneDrive = false;
      render(<UploadDropZonePopper {...defaultProps} />);
      expect(screen.queryByTestId('onedrive-picker')).not.toBeInTheDocument();
    });

    it('does not render Dropbox option when dropbox disabled', () => {
      mockState.uploadOptions.dropbox = false;
      render(<UploadDropZonePopper {...defaultProps} />);
      expect(screen.queryByTestId('dropbox-picker')).not.toBeInTheDocument();
    });
  });

  describe('File input', () => {
    it('renders hidden file input', () => {
      render(<UploadDropZonePopper {...defaultProps} />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
    });

    it('accepts multiple files for document upload', () => {
      render(<UploadDropZonePopper {...defaultProps} uploadType="document" />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('multiple');
    });

    it('does not accept multiple files for template upload', () => {
      render(<UploadDropZonePopper {...defaultProps} uploadType="template" />);
      const input = document.querySelector('input[type="file"]');
      expect(input).not.toHaveAttribute('multiple');
    });

    it('sets correct accept mime types for document upload', () => {
      render(<UploadDropZonePopper {...defaultProps} uploadType="document" />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('accept', 'application/pdf,image/png,image/jpeg');
    });

    it('sets correct accept mime types for template upload', () => {
      render(<UploadDropZonePopper {...defaultProps} uploadType="template" />);
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('accept', 'application/pdf');
    });
  });

  describe('Upload dialog trigger', () => {
    it('triggers file input when openUploadFileDialog is true', () => {
      mockState.openUploadFileDialog = true;
      render(<UploadDropZonePopper {...defaultProps} />);
      expect(mockDeleteSearchParams).toHaveBeenCalled();
    });

    it('does not trigger file input when openUploadFileDialog is false', () => {
      mockState.openUploadFileDialog = false;
      render(<UploadDropZonePopper {...defaultProps} />);
      expect(mockDeleteSearchParams).not.toHaveBeenCalled();
    });
  });

  describe('File change handler', () => {
    it('calls onUploadLuminFiles when files selected', () => {
      const onUploadLuminFiles = jest.fn();
      render(<UploadDropZonePopper {...defaultProps} onUploadLuminFiles={onUploadLuminFiles} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(input, 'files', {
        value: { 0: file, length: 1, [Symbol.iterator]: function* () { yield file; } },
        configurable: true,
      });
      
      fireEvent.change(input);
      expect(onUploadLuminFiles).toHaveBeenCalled();
    });

    it('calls closePopper after file selection', () => {
      const closePopper = jest.fn();
      render(<UploadDropZonePopper {...defaultProps} closePopper={closePopper} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(input, 'files', {
        value: { 0: file, length: 1 },
        configurable: true,
      });
      
      fireEvent.change(input);
      expect(closePopper).toHaveBeenCalled();
    });
  });

  describe('Default props', () => {
    it('uses default closePopper', () => {
      const { closePopper, ...propsWithoutClose } = defaultProps;
      expect(() => render(<UploadDropZonePopper {...propsWithoutClose} />)).not.toThrow();
    });

    it('uses default onUploadLuminFiles', () => {
      const { onUploadLuminFiles, ...propsWithoutUpload } = defaultProps;
      expect(() => render(<UploadDropZonePopper {...propsWithoutUpload} />)).not.toThrow();
    });
  });
});

