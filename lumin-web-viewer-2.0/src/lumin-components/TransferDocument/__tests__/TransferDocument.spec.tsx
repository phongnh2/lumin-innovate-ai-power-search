import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock context value inline
jest.mock('lumin-components/TransferDocument/hooks', () => ({
  useTransferDocumentContext: () => ({
    getter: {
      isProcessing: false,
      selectedTarget: { _id: 'org-123', name: 'Test Org' },
      destination: { _id: 'dest-123' },
      context: { title: 'Move Documents', isCopyModal: false },
    },
    setter: {
      onClose: jest.fn(),
    },
  }),
}));

jest.mock('hooks', () => ({
  useEnableWebReskin: () => ({ isEnableReskin: false }),
}));

jest.mock('HOC/withLightTheme', () => (Component: React.ComponentType) => Component);

jest.mock('lumin-components/CommonSkeleton/ShareModal.skeleton', () => ({
  __esModule: true,
  default: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'modal-skeleton' }, 'Skeleton');
  },
}));

jest.mock('lumin-components/Dialog', () => ({
  LazyContentDialog: ({ children, open }: React.PropsWithChildren<{ open: boolean }>) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'lazy-content-dialog', 'data-open': open }, children);
  },
}));

jest.mock('lumin-ui/kiwi-ui', () => ({
  Dialog: ({ children, opened, onClose }: React.PropsWithChildren<{ opened: boolean; onClose: () => void }>) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'kiwi-dialog', 'data-opened': opened },
      React.createElement('button', { 'data-testid': 'dialog-close', onClick: onClose }, 'Close'),
      children
    );
  },
}));

jest.mock('luminComponents/TransferDocument/components/Header', () => ({
  __esModule: true,
  default: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'header' }, 'Header');
  },
}));

jest.mock('luminComponents/TransferDocument/components/Footer', () => ({
  __esModule: true,
  default: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'footer' }, 'Footer');
  },
}));

jest.mock('luminComponents/TransferDocument/components/TransferDocumentBody', () => ({
  __esModule: true,
  default: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'transfer-document-body' }, 'Body');
  },
}));

jest.mock('luminComponents/TransferDocument/TransferDocument.styled', () => ({
  TransferDocumentContainer: ({ children }: React.PropsWithChildren<object>) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'transfer-container' }, children);
  },
  Backdrop: ({ $open }: { $open: boolean }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'backdrop', 'data-open': $open });
  },
  BackdropReskin: ({ $open }: { $open: boolean }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'backdrop-reskin', 'data-open': $open });
  },
}));

jest.mock('luminComponents/TransferDocument/TransferDocument.module.scss', () => ({
  content: 'content-class',
  body: 'body-class',
}));

jest.mock('constants/styles/Modal', () => ({
  ModalSize: { MDX: 720 },
}));

// Import after mocks
import TransferDocument from 'luminComponents/TransferDocument/TransferDocument';

describe('TransferDocument', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Non-Reskin Mode', () => {
    it('should render LazyContentDialog', () => {
      render(<TransferDocument />);
      expect(screen.getByTestId('lazy-content-dialog')).toBeInTheDocument();
    });

    it('should render Header component', () => {
      render(<TransferDocument />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render Footer component', () => {
      render(<TransferDocument />);
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render TransferDocumentBody', () => {
      render(<TransferDocument />);
      expect(screen.getByTestId('transfer-document-body')).toBeInTheDocument();
    });

    it('should render Backdrop', () => {
      render(<TransferDocument />);
      expect(screen.getByTestId('backdrop')).toBeInTheDocument();
    });

    it('should render transfer container', () => {
      render(<TransferDocument />);
      expect(screen.getByTestId('transfer-container')).toBeInTheDocument();
    });
  });
});
