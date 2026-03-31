import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('assets/reskin/lumin-svgs/slack-logo.svg', () => 'slack-logo.svg');

jest.mock('lumin-ui/kiwi-ui', () => ({
  Text: ({ children, type, size, className }) => (
    <span data-testid="text" data-type={type} data-size={size} className={className}>{children}</span>
  ),
  Button: ({ children, onClick, size, variant, endIcon, className, ...props }) => (
    <button data-testid="slack-button" data-size={size} data-variant={variant} className={className} onClick={onClick} {...props}>
      {children}
      {endIcon}
    </button>
  ),
  PlainTooltip: ({ content, children }) => (
    <span data-testid="tooltip" data-content={content}>{children}</span>
  ),
  IconButton: ({ onClick, icon, size, className, ...props }) => (
    <button data-testid="back-button" data-icon={typeof icon === 'string' ? icon : 'icon'} data-size={size} className={className} onClick={onClick} {...props}>
      Back
    </button>
  ),
  Divider: () => <hr data-testid="divider" />,
}));

jest.mock('../ShareModal.module.scss', () => ({
  titleContainer: 'titleContainer',
  titleWrapper: 'titleWrapper',
  titleWrapperWithBackButton: 'titleWrapperWithBackButton',
  backButton: 'backButton',
  title: 'title',
  titleWithSlackButton: 'titleWithSlackButton',
  slackButtonWrapper: 'slackButtonWrapper',
  slackButton: 'slackButton',
  buttonWrapper: 'buttonWrapper',
  buttonWrapperWithSlackButton: 'buttonWrapperWithSlackButton',
  buttonWrapperWithSettingsButton: 'buttonWrapperWithSettingsButton',
  settingsButton: 'settingsButton',
  divider: 'divider',
}));

jest.mock('utils/Factory/EventCollection/constants/ButtonEvent', () => ({
  ButtonName: { SHARE_IN_SLACK: 'share_in_slack' },
}));

let mockIsTabletUpMatch = true;
let mockIsDriveOnlyUser = false;

jest.mock('hooks', () => ({
  useTranslation: () => ({ t: (key) => key }),
  useTabletMatch: () => mockIsTabletUpMatch,
  useRestrictedUser: () => ({ isDriveOnlyUser: mockIsDriveOnlyUser }),
}));

const mockTrackEvent = jest.fn();
const mockToastError = jest.fn();
jest.mock('utils', () => ({
  hotjarUtils: { trackEvent: (...args) => mockTrackEvent(...args) },
  string: { getShortStringWithLimit: (str, limit) => str?.substring(0, limit) || '' },
  toastUtils: { error: (...args) => mockToastError(...args) },
}));

jest.mock('constants/documentConstants', () => ({
  MAX_TRUNCATE_DOCUMENT_NAME: { DESKTOP: 50, MOBILE: 30 },
}));

jest.mock('constants/hotjarEvent', () => ({
  HOTJAR_EVENT: { CLICK_SHARE_IN_SLACK: 'click_share_in_slack' },
}));

jest.mock('constants/messages', () => ({
  ERROR_MESSAGE_RESTRICTED_ACTION: 'Restricted action',
}));

import Title from '../components/Title';

describe('Title', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsTabletUpMatch = true;
    mockIsDriveOnlyUser = false;
  });

  describe('Rendering', () => {
    it('should render title text', () => {
      render(<Title hasPermission />);
      expect(screen.getByTestId('text')).toBeInTheDocument();
    });

    it('should show share title when hasPermission is true', () => {
      render(<Title hasPermission documentName="test.pdf" />);
      expect(screen.getByTestId('text')).toHaveTextContent('common.share');
    });

    it('should show shareList title when hasPermission is false', () => {
      render(<Title hasPermission={false} />);
      expect(screen.getByTestId('text')).toHaveTextContent('modalShare.shareList');
    });

    it('should show custom title when provided', () => {
      render(<Title title="Custom Title" hasPermission />);
      expect(screen.getByTestId('text')).toHaveTextContent('Custom Title');
    });

    it('should render custom titleElement when provided', () => {
      render(<Title titleElement={<span data-testid="custom-element">Custom</span>} hasPermission />);
      expect(screen.getByTestId('custom-element')).toBeInTheDocument();
    });
  });

  describe('Back Button', () => {
    it('should not show back button by default', () => {
      render(<Title hasPermission />);
      expect(screen.queryByTestId('back-button')).not.toBeInTheDocument();
    });

    it('should show back button when showBackButton is true', () => {
      render(<Title hasPermission showBackButton />);
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('should call onBack when back button is clicked', () => {
      const mockOnBack = jest.fn();
      render(<Title hasPermission showBackButton onBack={mockOnBack} />);
      fireEvent.click(screen.getByTestId('back-button'));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should show tooltip with custom text', () => {
      render(<Title hasPermission showBackButton backTooltip="Go back" />);
      expect(screen.getByTestId('tooltip')).toHaveAttribute('data-content', 'Go back');
    });

    it('should show default tooltip text', () => {
      render(<Title hasPermission showBackButton />);
      expect(screen.getByTestId('tooltip')).toHaveAttribute('data-content', 'common.back');
    });
  });

  describe('Slack Button', () => {
    it('should show slack button when hasPermission and hasSlackPermission and not showBackButton', () => {
      render(<Title hasPermission hasSlackPermission openShareInSlack={jest.fn()} />);
      expect(screen.getByTestId('slack-button')).toBeInTheDocument();
    });

    it('should not show slack button when showBackButton is true', () => {
      render(<Title hasPermission hasSlackPermission showBackButton openShareInSlack={jest.fn()} />);
      expect(screen.queryByTestId('slack-button')).not.toBeInTheDocument();
    });

    it('should not show slack button when hasPermission is false', () => {
      render(<Title hasPermission={false} hasSlackPermission openShareInSlack={jest.fn()} />);
      expect(screen.queryByTestId('slack-button')).not.toBeInTheDocument();
    });

    it('should not show slack button when hasSlackPermission is false', () => {
      render(<Title hasPermission hasSlackPermission={false} openShareInSlack={jest.fn()} />);
      expect(screen.queryByTestId('slack-button')).not.toBeInTheDocument();
    });

    it('should call openShareInSlack when slack button is clicked', () => {
      const mockOpenShareInSlack = jest.fn();
      render(<Title hasPermission hasSlackPermission openShareInSlack={mockOpenShareInSlack} />);
      fireEvent.click(screen.getByTestId('slack-button'));
      expect(mockOpenShareInSlack).toHaveBeenCalledTimes(1);
    });

    it('should track hotjar event when slack button is clicked', () => {
      render(<Title hasPermission hasSlackPermission openShareInSlack={jest.fn()} />);
      fireEvent.click(screen.getByTestId('slack-button'));
      expect(mockTrackEvent).toHaveBeenCalledWith('click_share_in_slack');
    });

    it('should show error toast when isDriveOnlyUser clicks slack button', () => {
      mockIsDriveOnlyUser = true;
      const mockOpenShareInSlack = jest.fn();
      render(<Title hasPermission hasSlackPermission openShareInSlack={mockOpenShareInSlack} />);
      fireEvent.click(screen.getByTestId('slack-button'));
      expect(mockToastError).toHaveBeenCalledWith({ message: 'Restricted action' });
      expect(mockOpenShareInSlack).not.toHaveBeenCalled();
    });
  });

  describe('Settings Button', () => {
    it('should show settings button when canBulkUpdate is true', () => {
      render(<Title hasPermission canBulkUpdate openBulkUpdate={jest.fn()} />);
      const buttons = screen.getAllByTestId('back-button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should not show settings button when showBackButton is true', () => {
      render(<Title hasPermission canBulkUpdate showBackButton openBulkUpdate={jest.fn()} />);
      // Only the back button should be present, not settings
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });
  });
});
