import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock MUI Grid
jest.mock('@mui/material', () => ({
  Grid: ({ children, container, item, xs }) => (
    <div data-testid={container ? 'grid-container' : 'grid-item'} data-xs={xs}>
      {children}
    </div>
  ),
}));

// Mock lumin-ui
jest.mock('lumin-ui/kiwi-ui', () => ({
  Switch: ({ value, checked, onChange, disabled, size }) => (
    <input
      data-testid="kiwi-switch"
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      data-size={size}
      data-value={value}
    />
  ),
  Text: ({ children, type, size, color }) => (
    <span data-testid="text" data-type={type} data-size={size}>
      {children}
    </span>
  ),
}));

// Mock LinkToShare
jest.mock('lumin-components/LinkToShare', () => ({
  __esModule: true,
  default: ({ currentDocument, handleClickSharingSettings, canUpdateShareSettings }) => (
    <div 
      data-testid="link-to-share"
      data-document-id={currentDocument?._id}
      data-can-update={String(canUpdateShareSettings)}
    >
      <button data-testid="share-settings-btn" onClick={handleClickSharingSettings}>
        Settings
      </button>
    </div>
  ),
}));

// Mock Switch (non-reskin)
jest.mock('lumin-components/Shared/Switch', () => ({
  __esModule: true,
  default: ({ value, checked, onChange, disabled }) => (
    <input
      data-testid="old-switch"
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      data-value={value}
    />
  ),
}));

// Mock styled components
jest.mock('../ShareModal.styled', () => ({
  TitleSecondary: ({ children }) => <h3 data-testid="title-secondary">{children}</h3>,
  SubTitleSecondary: ({ children }) => <p data-testid="subtitle-secondary">{children}</p>,
  SwitchWrapper: ({ children }) => <div data-testid="switch-wrapper">{children}</div>,
}));

// Mock styles
jest.mock('../ShareModal.module.scss', () => ({
  bottomBlockWrapper: 'bottomBlockWrapper',
  bottomBlockLeftSection: 'bottomBlockLeftSection',
}));

// Mock hooks - use a variable that can be changed
let mockIsEnableReskin = true;

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key) => key }),
  useEnableWebReskin: () => ({ isEnableReskin: mockIsEnableReskin }),
}));

// Mock utils
jest.mock('utils/string', () => ({
  isIgnoreCaseEqual: (a, b) => a?.toLowerCase() === b?.toLowerCase(),
}));

// Mock constants
jest.mock('constants/documentConstants', () => ({
  DocumentRole: {
    OWNER: 'OWNER',
    SHARER: 'SHARER',
    SPECTATOR: 'SPECTATOR',
  },
}));

// Mock context
jest.mock('../ShareModalContext', () => {
  const React = require('react');
  return {
    ShareModalContext: React.createContext({}),
  };
});

import ShareLinkSection from '../components/ShareLinkSection';
import { ShareModalContext } from '../ShareModalContext';

describe('ShareLinkSection', () => {
  let mockOpenShareSetting;
  const mockOpenShareLink = jest.fn();
  const mockCheck3rdCookies = jest.fn((callback) => callback());

  beforeEach(() => {
    jest.clearAllMocks();
    mockOpenShareSetting = jest.fn();
    mockIsEnableReskin = true;
    mockCheck3rdCookies.mockImplementation((callback) => callback());
  });

  const renderComponent = (isShareLinkOpen = false, contextOverrides = {}) => {
    const defaultContext = {
      isTransfering: false,
      openShareLink: mockOpenShareLink,
      isLuminStorageDocument: false,
      currentDocument: { _id: 'doc-123', shareSetting: { linkType: 'INVITED' } },
      userRole: 'OWNER',
      check3rdCookies: mockCheck3rdCookies,
      ...contextOverrides,
    };

    return render(
      <ShareModalContext.Provider value={defaultContext}>
        <ShareLinkSection 
          openShareSetting={mockOpenShareSetting} 
          isShareLinkOpen={isShareLinkOpen} 
        />
      </ShareModalContext.Provider>
    );
  };

  describe('Lumin Storage Document', () => {
    it('should render LinkToShare component', () => {
      renderComponent(false, { isLuminStorageDocument: true });
      expect(screen.getByTestId('link-to-share')).toBeInTheDocument();
    });

    it('should pass currentDocument to LinkToShare', () => {
      renderComponent(false, { isLuminStorageDocument: true });
      expect(screen.getByTestId('link-to-share')).toHaveAttribute('data-document-id', 'doc-123');
    });

    it('should call openShareSetting when settings button is clicked', () => {
      renderComponent(false, { isLuminStorageDocument: true });
      fireEvent.click(screen.getByTestId('share-settings-btn'));
      expect(mockOpenShareSetting).toHaveBeenCalledTimes(1);
    });

    it('should allow update share settings when user is owner', () => {
      renderComponent(false, { isLuminStorageDocument: true, userRole: 'OWNER' });
      expect(screen.getByTestId('link-to-share')).toHaveAttribute('data-can-update', 'true');
    });

    it('should not allow update share settings when user is not owner', () => {
      renderComponent(false, { isLuminStorageDocument: true, userRole: 'SHARER' });
      expect(screen.getByTestId('link-to-share')).toHaveAttribute('data-can-update', 'false');
    });
  });

  describe('Non-Lumin Storage - Reskin Version', () => {
    beforeEach(() => {
      mockIsEnableReskin = true;
    });

    it('should render title text', () => {
      renderComponent(false, { isLuminStorageDocument: false });
      const texts = screen.getAllByTestId('text');
      expect(texts[0]).toHaveTextContent('modalShare.enableSharingLink');
    });

    it('should render subtitle text', () => {
      renderComponent(false, { isLuminStorageDocument: false });
      const texts = screen.getAllByTestId('text');
      expect(texts[1]).toHaveTextContent('modalShare.willUploadedToLumin');
    });

    it('should render Kiwi Switch', () => {
      renderComponent(false, { isLuminStorageDocument: false });
      expect(screen.getByTestId('kiwi-switch')).toBeInTheDocument();
    });

    it('should show switch as checked when isShareLinkOpen is true', () => {
      renderComponent(true, { isLuminStorageDocument: false });
      expect(screen.getByTestId('kiwi-switch')).toBeChecked();
    });

    it('should show switch as unchecked when isShareLinkOpen is false', () => {
      renderComponent(false, { isLuminStorageDocument: false });
      expect(screen.getByTestId('kiwi-switch')).not.toBeChecked();
    });

    it('should disable switch when transferring', () => {
      renderComponent(false, { isLuminStorageDocument: false, isTransfering: true });
      expect(screen.getByTestId('kiwi-switch')).toBeDisabled();
    });

    it('should call check3rdCookies when switch is toggled', () => {
      renderComponent(false, { isLuminStorageDocument: false });
      fireEvent.click(screen.getByTestId('kiwi-switch'));
      expect(mockCheck3rdCookies).toHaveBeenCalledTimes(1);
    });

    it('should call openShareLink after check3rdCookies', () => {
      renderComponent(false, { isLuminStorageDocument: false });
      fireEvent.click(screen.getByTestId('kiwi-switch'));
      expect(mockOpenShareLink).toHaveBeenCalledTimes(1);
    });
  });

  describe('Non-Lumin Storage - Non-Reskin Version', () => {
    beforeEach(() => {
      mockIsEnableReskin = false;
    });

    it('should render Grid container', () => {
      renderComponent(false, { isLuminStorageDocument: false });
      expect(screen.getByTestId('grid-container')).toBeInTheDocument();
    });

    it('should render title secondary', () => {
      renderComponent(false, { isLuminStorageDocument: false });
      expect(screen.getByTestId('title-secondary')).toHaveTextContent('modalShare.enableSharingLink');
    });

    it('should render subtitle secondary', () => {
      renderComponent(false, { isLuminStorageDocument: false });
      expect(screen.getByTestId('subtitle-secondary')).toHaveTextContent('modalShare.willUploadedToLumin');
    });

    it('should render old Switch component', () => {
      renderComponent(false, { isLuminStorageDocument: false });
      expect(screen.getByTestId('old-switch')).toBeInTheDocument();
    });

    it('should call check3rdCookies when old switch is toggled', () => {
      renderComponent(false, { isLuminStorageDocument: false });
      fireEvent.click(screen.getByTestId('old-switch'));
      expect(mockCheck3rdCookies).toHaveBeenCalledTimes(1);
    });
  });
});
