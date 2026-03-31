import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Loading component
jest.mock('lumin-components/Loading', () => ({
  __esModule: true,
  default: ({ className, useReskinCircularProgress, normal }) => (
    <div
      data-testid="loading"
      data-classname={className || ''}
      data-reskin={String(useReskinCircularProgress)}
      data-normal={String(normal)}
    >
      Loading...
    </div>
  ),
}));

// Mock ShareeList component
jest.mock('lumin-components/ShareeList', () => ({
  __esModule: true,
  default: ({ members, documentId, currentUserRole, type, themeMode, loading }) => (
    <div
      data-testid="sharee-list"
      data-document-id={documentId}
      data-role={currentUserRole}
      data-type={type}
      data-theme={themeMode}
      data-loading={String(loading)}
    >
      <ul>
        {members?.map((member) => (
          <li key={member._id} data-testid={`member-${member._id}`}>
            {member.email}
          </li>
        ))}
      </ul>
    </div>
  ),
}));

// Mock styled components
jest.mock('../ShareModal.styled', () => ({
  MemberListContainer: ({ children }) => (
    <div data-testid="member-list-container">{children}</div>
  ),
  ShareesListContainer: ({ children }) => (
    <div data-testid="sharees-list-container">{children}</div>
  ),
}));

// Mock styles
jest.mock('./MemberList.module.scss', () => ({
  loading: 'loading-class',
}));

// Mock hooks
let mockIsEnableReskin = true;
let mockThemeMode = 'light';

jest.mock('hooks', () => ({
  useEnableWebReskin: () => ({ isEnableReskin: mockIsEnableReskin }),
  useThemeMode: () => mockThemeMode,
}));

// Mock SharedMemberType
jest.mock('../SharedMemberType', () => ({
  INVITED_LIST: 'INVITED_LIST',
}));

// Mock context
jest.mock('../ShareModalContext', () => {
  const React = require('react');
  return {
    ShareModalContext: React.createContext({}),
  };
});

import MemberList from '../components/MemberList';
import { ShareModalContext } from '../ShareModalContext';

describe('MemberList', () => {
  const mockHandleChangePermission = jest.fn();
  const mockHandleRemoveMember = jest.fn();
  const mockHandleTransferFileByCheckLuminStorage = jest.fn();
  const mockGetSharees = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsEnableReskin = true;
    mockThemeMode = 'light';
  });

  const renderComponent = (contextOverrides = {}) => {
    const defaultContext = {
      members: [
        { _id: 'user-1', email: 'user1@example.com' },
        { _id: 'user-2', email: 'user2@example.com' },
      ],
      currentDocument: { _id: 'doc-123' },
      userRole: 'OWNER',
      handleChangePermission: mockHandleChangePermission,
      handleRemoveMember: mockHandleRemoveMember,
      handleTransferFileByCheckLuminStorage: mockHandleTransferFileByCheckLuminStorage,
      getSharees: mockGetSharees,
      isTransfering: false,
      requestAccessList: { loading: false },
      ...contextOverrides,
    };

    return render(
      <ShareModalContext.Provider value={defaultContext}>
        <MemberList />
      </ShareModalContext.Provider>
    );
  };

  describe('Reskin Version', () => {
    beforeEach(() => {
      mockIsEnableReskin = true;
    });

    it('should render ShareeList directly when reskin is enabled', () => {
      renderComponent();
      expect(screen.getByTestId('sharee-list')).toBeInTheDocument();
      expect(screen.queryByTestId('member-list-container')).not.toBeInTheDocument();
    });

    it('should render members in ShareeList', () => {
      renderComponent();
      expect(screen.getByTestId('member-user-1')).toBeInTheDocument();
      expect(screen.getByTestId('member-user-2')).toBeInTheDocument();
    });

    it('should pass documentId to ShareeList', () => {
      renderComponent();
      expect(screen.getByTestId('sharee-list')).toHaveAttribute('data-document-id', 'doc-123');
    });

    it('should pass userRole to ShareeList', () => {
      renderComponent();
      expect(screen.getByTestId('sharee-list')).toHaveAttribute('data-role', 'OWNER');
    });

    it('should pass themeMode to ShareeList', () => {
      mockThemeMode = 'dark';
      renderComponent();
      expect(screen.getByTestId('sharee-list')).toHaveAttribute('data-theme', 'dark');
    });
  });

  describe('Non-Reskin Version', () => {
    beforeEach(() => {
      mockIsEnableReskin = false;
    });

    it('should render MemberListContainer', () => {
      renderComponent();
      expect(screen.getByTestId('member-list-container')).toBeInTheDocument();
    });

    it('should render ShareesListContainer', () => {
      renderComponent();
      expect(screen.getByTestId('sharees-list-container')).toBeInTheDocument();
    });

    it('should render ShareeList inside containers', () => {
      renderComponent();
      expect(screen.getByTestId('sharee-list')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show Loading when requestAccessList is loading', () => {
      renderComponent({ requestAccessList: { loading: true } });
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should show Loading when members array is empty', () => {
      renderComponent({ members: [] });
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should use reskin loading style when reskin is enabled', () => {
      mockIsEnableReskin = true;
      renderComponent({ members: [] });
      expect(screen.getByTestId('loading')).toHaveAttribute('data-reskin', 'true');
    });

    it('should not use reskin loading style when reskin is disabled', () => {
      mockIsEnableReskin = false;
      renderComponent({ members: [] });
      expect(screen.getByTestId('loading')).toHaveAttribute('data-reskin', 'false');
    });

    it('should pass normal prop to Loading', () => {
      renderComponent({ members: [] });
      expect(screen.getByTestId('loading')).toHaveAttribute('data-normal', 'true');
    });
  });

  describe('ShareeList Props', () => {
    it('should pass INVITED_LIST type to ShareeList', () => {
      renderComponent();
      expect(screen.getByTestId('sharee-list')).toHaveAttribute('data-type', 'INVITED_LIST');
    });
  });
});
