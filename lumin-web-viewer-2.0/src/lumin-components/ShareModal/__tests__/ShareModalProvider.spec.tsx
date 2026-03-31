import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock react-router
const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock styled-components
jest.mock('styled-components', () => ({
  ThemeProvider: ({ children, theme }) => (
    <div data-testid="theme-provider" data-theme={JSON.stringify(theme)}>
      {children}
    </div>
  ),
}));

// Mock CookieWarningContext - create real context
jest.mock('luminComponents/CookieWarningModal/Context', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.createContext({
      cookiesDisabled: false,
      setCookieModalVisible: jest.fn(),
    }),
  };
});

// Mock hooks
jest.mock('hooks', () => ({
  useDiscardModal: () => ({
    onClose: jest.fn(),
    setShowDiscardModal: jest.fn(),
    setDiscardModalType: jest.fn(),
    setShowFeedbackModal: jest.fn(),
  }),
  useThemeMode: () => 'light',
  useFolderPathMatch: () => false,
  useHitDocStackModalForOrgMembers: () => ({ modal: 'settings' }),
}));

// Mock helpers
jest.mock('helpers/getOrgOfDoc', () => ({
  __esModule: true,
  default: () => ({ _id: 'org-123', name: 'Test Org' }),
}));

// Mock features
jest.mock('features/CNC/hooks/useEnableInviteSharedUserModal', () => ({
  useEnableInviteSharedUserModal: () => ({ enabled: true }),
}));

// Mock ShareModalContainer
jest.mock('../ShareModalContainer', () => ({
  __esModule: true,
  default: (props) => (
    <div data-testid="share-modal-container">
      <span data-testid="prop-is-in-folder">{String(props.isInFolderPage)}</span>
      <span data-testid="prop-cookies-disabled">{String(props.cookiesDisabled)}</span>
      <span data-testid="prop-enabled-invite">{String(props.enabledInviteSharedUserModal)}</span>
      <span data-testid="prop-org-id">{props.orgOfDoc?._id}</span>
    </div>
  ),
}));

// Mock styled theme
jest.mock('../ShareModal.styled', () => ({
  theme: {
    light: { mode: 'light' },
    dark: { mode: 'dark' },
  },
}));

import ShareModalProvider from '../ShareModalProvider';
import CookieWarningContext from 'luminComponents/CookieWarningModal/Context';

describe('ShareModalProvider', () => {
  const defaultProps = {
    onClose: jest.fn(),
    currentDocument: { _id: 'doc-123', name: 'Test Doc' },
    organizations: { data: [] },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <CookieWarningContext.Provider value={{ cookiesDisabled: false, setCookieModalVisible: jest.fn() }}>
        <ShareModalProvider {...defaultProps} {...props} />
      </CookieWarningContext.Provider>
    );
  };

  describe('Rendering', () => {
    it('should render ThemeProvider', () => {
      renderComponent();
      expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    });

    it('should render ShareModalContainer', () => {
      renderComponent();
      expect(screen.getByTestId('share-modal-container')).toBeInTheDocument();
    });
  });

  describe('Props Passing', () => {
    it('should pass isInFolderPage to ShareModalContainer', () => {
      renderComponent();
      expect(screen.getByTestId('prop-is-in-folder')).toHaveTextContent('false');
    });

    it('should pass cookiesDisabled to ShareModalContainer', () => {
      renderComponent();
      expect(screen.getByTestId('prop-cookies-disabled')).toHaveTextContent('false');
    });

    it('should pass enabledInviteSharedUserModal to ShareModalContainer', () => {
      renderComponent();
      expect(screen.getByTestId('prop-enabled-invite')).toHaveTextContent('true');
    });

    it('should pass orgOfDoc to ShareModalContainer', () => {
      renderComponent();
      expect(screen.getByTestId('prop-org-id')).toHaveTextContent('org-123');
    });
  });

  describe('Theme', () => {
    it('should use light theme mode', () => {
      renderComponent();
      const themeProvider = screen.getByTestId('theme-provider');
      expect(themeProvider).toHaveAttribute('data-theme', JSON.stringify({ mode: 'light' }));
    });
  });
});
