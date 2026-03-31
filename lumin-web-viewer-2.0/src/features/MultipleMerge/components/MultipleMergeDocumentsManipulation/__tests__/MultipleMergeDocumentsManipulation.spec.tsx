import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import MultipleMergeDocumentsManipulation from '../MultipleMergeDocumentsManipulation';
import { FileSource } from '../../../enum';

// Mock context values
const mockHandleUploadDocuments = jest.fn();
const mockContextValue = {
  isExceedMaxDocumentsSize: false,
  isLoadingDocument: false,
  handleUploadDocuments: mockHandleUploadDocuments,
};

jest.mock('../../../hooks/useMultipleMergeContext', () => ({
  useMultipleMergeContext: () => mockContextValue,
}));

jest.mock('hooks', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (params?.text) {
        return `${key.replace('navbar.fromText', 'From')} ${params.text}`;
      }
      return key;
    },
  }),
}));

const mockHandlersOpen = jest.fn();
const mockHandlersClose = jest.fn();
const mockHandlersToggle = jest.fn();

// Always show menu content for testing purposes
jest.mock('@mantine/hooks', () => ({
  useDisclosure: () => [
    true,
    {
      open: mockHandlersOpen,
      close: mockHandlersClose,
      toggle: mockHandlersToggle,
    },
  ],
}));

jest.mock('assets/reskin/lumin-svgs/google.svg', () => 'google-logo.svg');

jest.mock('lumin-ui/kiwi-ui', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    startIcon,
    variant,
    size,
    fullWidth,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    startIcon?: React.ReactNode;
    variant?: string;
    size?: string;
    fullWidth?: boolean;
  }) => (
    <button
      data-testid="add-files-button"
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      data-fullwidth={fullWidth}
    >
      {startIcon}
      {children}
    </button>
  ),
  Icomoon: ({ type, size }: { type: string; size: string }) => (
    <span data-testid="icomoon" data-type={type} data-size={size} />
  ),
  Menu: ({
    children,
    ComponentTarget,
    opened,
    onClose,
    disabled,
    closeOnItemClick,
    width,
  }: {
    children: React.ReactNode;
    ComponentTarget: React.ReactNode;
    opened?: boolean;
    onClose?: () => void;
    disabled?: boolean;
    closeOnItemClick?: boolean;
    width?: string;
  }) => (
    <div data-testid="menu" data-opened={opened} data-disabled={disabled}>
      {ComponentTarget}
      {opened && <div data-testid="menu-content">{children}</div>}
    </div>
  ),
  MenuItem: ({
    children,
    leftIconProps,
    disabled,
    leftSection,
    component,
    ...props
  }: {
    children: React.ReactNode;
    leftIconProps?: { type: string };
    disabled?: boolean;
    leftSection?: React.ReactNode;
    component?: string;
    onClick?: () => void;
  }) => (
    <div
      data-testid="menu-item"
      data-disabled={disabled}
      data-left-icon-type={leftIconProps?.type}
      {...props}
    >
      {leftSection}
      {children}
    </div>
  ),
  FileButton: ({
    children,
    accept,
    onChange,
    multiple,
    resetRef,
  }: {
    children: (props: { onClick: () => void }) => React.ReactNode;
    accept?: string;
    onChange?: (files: File[]) => void;
    multiple?: boolean;
    resetRef?: React.RefObject<() => void>;
  }) => {
    const handleClick = () => {
      // Simulate file selection
      const mockFiles = [new File(['content'], 'test.pdf', { type: 'application/pdf' })];
      onChange?.(mockFiles);
    };
    return (
      <div data-testid="file-button" data-accept={accept} data-multiple={multiple}>
        {children({ onClick: handleClick })}
      </div>
    );
  },
}));

jest.mock('luminComponents/GoogleFilePicker', () => {
  return function MockGoogleFilePicker({
    children,
    onClose,
    onPicked,
    uploadType,
    multiSelect,
    mimeType,
    isUpload,
  }: {
    children: React.ReactNode;
    onClose?: () => void;
    onPicked?: (data: { docs: Array<{ id: string; mimeType: string; name: string; sizeBytes: number }> }) => void;
    uploadType?: string;
    multiSelect?: boolean;
    mimeType?: string;
    isUpload?: boolean;
  }) {
    const handlePick = () => {
      onPicked?.({
        docs: [{ id: 'google-file-id', mimeType: 'application/pdf', name: 'google-doc.pdf', sizeBytes: 1024 }],
      });
    };
    return (
      <div
        data-testid="google-file-picker"
        data-upload-type={uploadType}
        data-multi-select={multiSelect}
        onClick={handlePick}
      >
        {children}
      </div>
    );
  };
});

jest.mock('../../MultipleMergeList/MultipleMergeList', () => {
  return function MockMultipleMergeList() {
    return <div data-testid="multiple-merge-list">Multiple Merge List</div>;
  };
});

jest.mock('../MultipleMergeDocumentsManipulation.module.scss', () => ({
  uploadFilesError: 'uploadFilesError',
}));

jest.mock('../../../constants', () => ({
  SUPPORTED_FILE_TYPES: ['.pdf', '.jpg', '.png'],
}));

jest.mock('constants/customConstant', () => ({
  UPLOAD_FILE_TYPE: {
    DOCUMENT: 'document',
  },
}));

describe('MultipleMergeDocumentsManipulation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockContextValue.isExceedMaxDocumentsSize = false;
    mockContextValue.isLoadingDocument = false;
  });

  describe('isExceedMaxDocumentsSize branch', () => {
    it('should render error message when isExceedMaxDocumentsSize is true', () => {
      mockContextValue.isExceedMaxDocumentsSize = true;

      render(<MultipleMergeDocumentsManipulation />);

      expect(screen.getByText('multipleMerge.totalSizeExceed')).toBeInTheDocument();
    });

    it('should not render error message when isExceedMaxDocumentsSize is false', () => {
      mockContextValue.isExceedMaxDocumentsSize = false;

      render(<MultipleMergeDocumentsManipulation />);

      expect(screen.queryByText('multipleMerge.totalSizeExceed')).not.toBeInTheDocument();
    });

    it('should have error container even when no error', () => {
      mockContextValue.isExceedMaxDocumentsSize = false;

      const { container } = render(<MultipleMergeDocumentsManipulation />);

      const errorContainer = container.querySelector('.uploadFilesError');
      expect(errorContainer).toBeInTheDocument();
      expect(errorContainer).toBeEmptyDOMElement();
    });
  });

  describe('isLoadingDocument state', () => {
    it('should disable button when isLoadingDocument is true', () => {
      mockContextValue.isLoadingDocument = true;

      render(<MultipleMergeDocumentsManipulation />);

      const button = screen.getByTestId('add-files-button');
      expect(button).toBeDisabled();
    });

    it('should enable button when isLoadingDocument is false', () => {
      mockContextValue.isLoadingDocument = false;

      render(<MultipleMergeDocumentsManipulation />);

      const button = screen.getByTestId('add-files-button');
      expect(button).not.toBeDisabled();
    });

    it('should disable menu when isLoadingDocument is true', () => {
      mockContextValue.isLoadingDocument = true;

      render(<MultipleMergeDocumentsManipulation />);

      const menu = screen.getByTestId('menu');
      expect(menu).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('file upload handling', () => {
    it('should call handleUploadDocuments with LOCAL source when files are selected from device', () => {
      mockContextValue.isLoadingDocument = false;

      render(<MultipleMergeDocumentsManipulation />);

      // Click on file button menu item (which triggers onChange with mock files)
      const menuItems = screen.getAllByTestId('menu-item');
      const deviceMenuItem = menuItems[0];
      fireEvent.click(deviceMenuItem);

      expect(mockHandleUploadDocuments).toHaveBeenCalledWith({
        files: expect.arrayContaining([expect.any(File)]),
        source: FileSource.LOCAL,
      });
    });

    it('should call handleUploadDocuments with GOOGLE source when files are picked from Google Drive', () => {
      mockContextValue.isLoadingDocument = false;

      render(<MultipleMergeDocumentsManipulation />);

      // Click on Google picker
      const googlePicker = screen.getByTestId('google-file-picker');
      fireEvent.click(googlePicker);

      expect(mockHandleUploadDocuments).toHaveBeenCalledWith({
        files: expect.arrayContaining([
          expect.objectContaining({
            remoteId: 'google-file-id',
            mimeType: 'application/pdf',
            name: 'google-doc.pdf',
            size: 1024,
          }),
        ]),
        source: FileSource.GOOGLE,
      });
    });
  });

  describe('rendering', () => {
    it('should render MultipleMergeList component', () => {
      render(<MultipleMergeDocumentsManipulation />);

      expect(screen.getByTestId('multiple-merge-list')).toBeInTheDocument();
    });

    it('should render add files button with correct text', () => {
      render(<MultipleMergeDocumentsManipulation />);

      expect(screen.getByText('action.addMoreFiles')).toBeInTheDocument();
    });

    it('should render button with correct icon', () => {
      render(<MultipleMergeDocumentsManipulation />);

      const icon = screen.getByTestId('icomoon');
      expect(icon).toHaveAttribute('data-type', 'ph-file-arrow-up');
      expect(icon).toHaveAttribute('data-size', 'lg');
    });

    it('should render from device menu item', () => {
      render(<MultipleMergeDocumentsManipulation />);

      expect(screen.getByText('navbar.fromMyDevice')).toBeInTheDocument();
    });

    it('should render Google Drive menu item', () => {
      render(<MultipleMergeDocumentsManipulation />);

      expect(screen.getByText('From Google Drive')).toBeInTheDocument();
    });

    it('should render Google Drive logo in menu item', () => {
      render(<MultipleMergeDocumentsManipulation />);

      const googleLogo = screen.getByAltText('Upload from Google Drive');
      expect(googleLogo).toHaveAttribute('src', 'google-logo.svg');
    });
  });

  describe('button configuration', () => {
    it('should have outlined variant', () => {
      render(<MultipleMergeDocumentsManipulation />);

      const button = screen.getByTestId('add-files-button');
      expect(button).toHaveAttribute('data-variant', 'outlined');
    });

    it('should have lg size', () => {
      render(<MultipleMergeDocumentsManipulation />);

      const button = screen.getByTestId('add-files-button');
      expect(button).toHaveAttribute('data-size', 'lg');
    });

    it('should be full width', () => {
      render(<MultipleMergeDocumentsManipulation />);

      const button = screen.getByTestId('add-files-button');
      expect(button).toHaveAttribute('data-fullwidth', 'true');
    });
  });
});

