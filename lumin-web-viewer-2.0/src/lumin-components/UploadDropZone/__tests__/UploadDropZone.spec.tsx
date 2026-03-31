import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mutable mock state
const mockState = {
  isEnableReskin: false,
  folderType: 'personal',
  isDragging: false,
  dropDocName: '',
  folderDraggingOver: null as any,
};

// Mock react-dropzone
const mockGetRootProps = jest.fn(() => ({ 'data-testid': 'dropzone-root' }));
const mockUseDropzone = jest.fn(() => ({
  getRootProps: mockGetRootProps,
  isDragActive: false,
}));
jest.mock('react-dropzone', () => ({
  useDropzone: (config: any) => mockUseDropzone(config),
}));

// Mock redux
jest.mock('redux', () => ({
  compose: (...fns: any[]) => (component: any) => {
    return fns.reduceRight((acc, fn) => fn(acc), component);
  },
}));

// Mock contexts with proper React.createContext
jest.mock('luminComponents/Document/context', () => ({
  DocumentContext: require('react').createContext({
    isDragging: false,
  }),
}));

jest.mock('HOC/withDropDocPopup', () => ({
  __esModule: true,
  default: {
    Consumer: (Component: any) => Component,
  },
}));

jest.mock('HOC/withDropDocPopup/withDropDocPopupProvider', () => ({
  DropDocumentPopupContext: require('react').createContext({
    name: '',
    folderDraggingOver: null,
  }),
}));

// Mock hooks
jest.mock('hooks', () => ({
  useEnableWebReskin: () => ({ isEnableReskin: mockState.isEnableReskin }),
  useGetFolderType: () => mockState.folderType,
}));

// Mock constants
jest.mock('constants/documentConstants', () => ({
  folderType: {
    DEVICE: 'device',
    PERSONAL: 'personal',
  },
}));

jest.mock('constants/lumin-common', () => ({
  STORAGE_TYPE: {
    SYSTEM: 'system',
    LOCAL: 'local',
  },
}));

// Mock styled components
jest.mock('../UploadDropZone.styled', () => ({
  Container: ({ children, ...props }: any) => require('react').createElement('div', { 'data-testid': 'container', ...props }, children),
  ContainerReskin: ({ children, ...props }: any) => require('react').createElement('div', { 'data-testid': 'container-reskin', ...props }, children),
}));

// Mock DropZoneComponent
jest.mock('../DropZoneComponent', () => ({
  __esModule: true,
  default: ({ children, highlight, isDragging }: any) => require('react').createElement('div', { 
    'data-testid': 'dropzone-component',
    'data-highlight': String(highlight),
    'data-is-dragging': String(isDragging),
  }, children),
}));

// Import after mocks - need to use require because the component uses React.memo and compose
const UploadDropZone = require('../UploadDropZone').default;

describe('UploadDropZone', () => {
  const defaultProps = {
    children: <div data-testid="children">Child content</div>,
    onFilesPicked: jest.fn(),
    disabled: false,
    highlight: false,
    onDropStateChanged: jest.fn(),
    isOffline: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockState.isEnableReskin = false;
    mockState.folderType = 'personal';
    mockState.isDragging = false;
    mockUseDropzone.mockReturnValue({
      getRootProps: mockGetRootProps,
      isDragActive: false,
    });
  });

  describe('Rendering', () => {
    it('renders children', () => {
      render(<UploadDropZone {...defaultProps} />);
      expect(screen.getByTestId('children')).toBeInTheDocument();
    });

    it('renders DropZoneComponent', () => {
      render(<UploadDropZone {...defaultProps} />);
      expect(screen.getByTestId('dropzone-component')).toBeInTheDocument();
    });

    it('uses reskin mode based on hook value', () => {
      mockState.isEnableReskin = true;
      render(<UploadDropZone {...defaultProps} />);
      expect(screen.getByTestId('dropzone-component')).toBeInTheDocument();
    });

    it('uses non-reskin mode by default', () => {
      mockState.isEnableReskin = false;
      render(<UploadDropZone {...defaultProps} />);
      expect(screen.getByTestId('dropzone-component')).toBeInTheDocument();
    });
  });

  describe('DropZoneComponent props', () => {
    it('passes highlight prop correctly', () => {
      render(<UploadDropZone {...defaultProps} highlight={true} />);
      expect(screen.getByTestId('dropzone-component')).toHaveAttribute('data-highlight', 'true');
    });

    it('passes highlight=false by default', () => {
      render(<UploadDropZone {...defaultProps} />);
      expect(screen.getByTestId('dropzone-component')).toHaveAttribute('data-highlight', 'false');
    });

    it('sets isDragging based on isDragActive', () => {
      mockUseDropzone.mockReturnValue({
        getRootProps: mockGetRootProps,
        isDragActive: true,
      });
      render(<UploadDropZone {...defaultProps} />);
      expect(screen.getByTestId('dropzone-component')).toHaveAttribute('data-is-dragging', 'true');
    });

    it('sets isDragging false when not dragging', () => {
      mockUseDropzone.mockReturnValue({
        getRootProps: mockGetRootProps,
        isDragActive: false,
      });
      render(<UploadDropZone {...defaultProps} />);
      expect(screen.getByTestId('dropzone-component')).toHaveAttribute('data-is-dragging', 'false');
    });
  });

  describe('useDropzone configuration', () => {
    it('configures dropzone with noClick', () => {
      render(<UploadDropZone {...defaultProps} />);
      expect(mockUseDropzone).toHaveBeenCalledWith(expect.objectContaining({
        noClick: true,
      }));
    });

    it('configures dropzone with noKeyboard', () => {
      render(<UploadDropZone {...defaultProps} />);
      expect(mockUseDropzone).toHaveBeenCalledWith(expect.objectContaining({
        noKeyboard: true,
      }));
    });

    it('configures dropzone as disabled when disabled prop is true', () => {
      render(<UploadDropZone {...defaultProps} disabled={true} />);
      expect(mockUseDropzone).toHaveBeenCalledWith(expect.objectContaining({
        disabled: true,
      }));
    });

    it('configures dropzone as not disabled by default', () => {
      render(<UploadDropZone {...defaultProps} disabled={false} />);
      expect(mockUseDropzone).toHaveBeenCalledWith(expect.objectContaining({
        disabled: false,
      }));
    });

    it('configures noDragEventsBubbling based on reskin mode', () => {
      mockState.isEnableReskin = true;
      render(<UploadDropZone {...defaultProps} />);
      expect(mockUseDropzone).toHaveBeenCalledWith(expect.objectContaining({
        noDragEventsBubbling: true,
      }));
    });

    it('configures noDragEventsBubbling false when not reskin', () => {
      mockState.isEnableReskin = false;
      render(<UploadDropZone {...defaultProps} />);
      expect(mockUseDropzone).toHaveBeenCalledWith(expect.objectContaining({
        noDragEventsBubbling: false,
      }));
    });
  });

  describe('onDropStateChanged callback', () => {
    it('calls onDropStateChanged when isDragActive changes', () => {
      const onDropStateChanged = jest.fn();
      mockUseDropzone.mockReturnValue({
        getRootProps: mockGetRootProps,
        isDragActive: true,
      });
      render(<UploadDropZone {...defaultProps} onDropStateChanged={onDropStateChanged} />);
      expect(onDropStateChanged).toHaveBeenCalledWith(true);
    });

    it('calls onDropStateChanged with false when not dragging', () => {
      const onDropStateChanged = jest.fn();
      mockUseDropzone.mockReturnValue({
        getRootProps: mockGetRootProps,
        isDragActive: false,
      });
      render(<UploadDropZone {...defaultProps} onDropStateChanged={onDropStateChanged} />);
      expect(onDropStateChanged).toHaveBeenCalledWith(false);
    });
  });

  describe('Default props', () => {
    it('uses default disabled=false', () => {
      const { disabled, ...propsWithoutDisabled } = defaultProps;
      render(<UploadDropZone {...propsWithoutDisabled} />);
      expect(mockUseDropzone).toHaveBeenCalledWith(expect.objectContaining({
        disabled: false,
      }));
    });

    it('uses default onDropStateChanged', () => {
      const { onDropStateChanged, ...propsWithoutCallback } = defaultProps;
      // Should not throw
      expect(() => render(<UploadDropZone {...propsWithoutCallback} />)).not.toThrow();
    });
  });
});

