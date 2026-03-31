import React from 'react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { render, screen, fireEvent, cleanup, waitFor } from 'features/CNC/utils/testUtil';
import '@testing-library/jest-dom';

import { mockOrganization } from 'features/CNC/CncComponents/__mocks__/mockOrganization';
import { CNC_LOCAL_STORAGE_KEY } from 'features/CNC/constants/customConstant';
import { useTranslation } from 'hooks';
import selectors from 'selectors';
import InviteCollaborators from '../InviteCollaborators';
import showJoinedOrganizationModal from 'features/CNC/helpers/showJoinedOrganizationModal';
import { handleInviteMembers } from 'features/CNC/CncComponents/InviteCollaborators/helper/handleInviteMembers';

const mockT = (key: string) => {
  switch (key) {
    case 'setUpOrg.inviteCollaboratorsDescription':
      return 'Invite the teammates you’ve shared the PDF file with on Google Drive to the Workspace for better collaboration.';
    case 'common.skip':
      return 'Skip';
    case 'memberPage.invite':
      return 'Invite';
    default:
      return key;
  }
};

jest.mock('lumin-components/Layout', () => ({
  LayoutSecondary: jest.fn(({ children }) => (
    <div data-testid="secondary-layout">{children}</div>
  )),
}));

jest.mock('hooks', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock(
  'features/CNC/CncComponents/InviteCollaborators/component/CollaboratorsList',
  () => () => <div data-testid="collaboration-list">CollaborationList</div>
);

jest.mock(
  'lumin-components/PromptInviteUsersBanner/hooks/usePromptInviteUsersHandler',
  () => jest.fn()
);

jest.mock('features/CNC/helpers/showJoinedOrganizationModal', () => jest.fn());

jest.mock('features/CNC/CncComponents/InviteCollaborators/helper/handleInviteMembers');

const renderComponent = () => {
  const history = createMemoryHistory({
    initialEntries: [
      {
        pathname: '/invite-collaborators',
        search: '?documentId=68df757be3252409ac5f333b',
      },
    ],
    initialIndex: 0,
  });

  render(
    <Router location={history.location} navigator={history}>
      {/* @ts-ignore */}
      <InviteCollaborators />
    </Router>
  );

  return { history };
};

describe('InviteCollaborators', () => {
  (useTranslation as jest.Mock).mockReturnValue({ t: mockT });

  beforeEach(() => {
    window.localStorage.setItem(
      CNC_LOCAL_STORAGE_KEY.DRIVE_COLLABORATORS_NOT_IN_CIRCLE,
      JSON.stringify([
        {
          id: 'u1',
          email: 'user1@example.com',
          name: 'User 1',
        },
      ])
    );

    (useSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectors.getCurrentOrganization) {
        return { data: { ...mockOrganization } };
      }
      return jest.requireActual('react-redux').useSelector(selector);
    });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    window.localStorage.clear();
    window.history.replaceState({}, '', '/');
    jest.useRealTimers();
  });

  it('should render InviteCollaborators', () => {
    renderComponent();

    const secondaryLayoutComponent = screen.getByTestId('secondary-layout');
    expect(secondaryLayoutComponent).toHaveTextContent('CollaborationList');
    expect(secondaryLayoutComponent).toHaveTextContent(
      'Invite the teammates you’ve shared the PDF file with on Google Drive to the Workspace for better collaboration.'
    );
    expect(secondaryLayoutComponent).toHaveTextContent('Skip');
    expect(secondaryLayoutComponent).toHaveTextContent('Invite');
  });

  it('should navigate to viewer page when no prioritized collaborators are available and display show Joined Organization modal', () => {
    window.localStorage.removeItem(
      CNC_LOCAL_STORAGE_KEY.DRIVE_COLLABORATORS_NOT_IN_CIRCLE
    );

    const { history } = renderComponent();

    expect(history.location.pathname).toBe(
      '/viewer/68df757be3252409ac5f333b'
    );
    expect(showJoinedOrganizationModal).toHaveBeenCalled();
  });

  it('should navigate to viewer if user decides to click the skip button', () => {
    const { history } = renderComponent();

    const skipBtn = screen.getByRole('button', { name: 'Skip' });
    fireEvent.click(skipBtn);

    expect(history.location.pathname).toBe(
      '/viewer/68df757be3252409ac5f333b'
    );
    expect(showJoinedOrganizationModal).toHaveBeenCalled();
  });

  it('should navigate to home page when documentId and currentOrganization are not available', () => {
    const noDocumentIdHistory = createMemoryHistory({
      initialEntries: [
        {
          pathname: '',
          search: '?documentId=',
        },
      ],
      initialIndex: 0,
    });

    jest
      .spyOn(selectors, 'getCurrentOrganization')
      .mockReturnValue({ loading: false, data: undefined });

    render(
      <Router
        location={noDocumentIdHistory.location}
        navigator={noDocumentIdHistory}
      >
        {/* @ts-ignore */}
        <InviteCollaborators />
      </Router>
    );

    expect(noDocumentIdHistory.location.pathname).toBe('/');
  });

  it('renders loading state when inviting collaborators', async () => {
    const mockHandleInviteMembers = require('features/CNC/CncComponents/InviteCollaborators/helper/handleInviteMembers')
      .handleInviteMembers as jest.Mock;

    mockHandleInviteMembers.mockImplementation(({ setIsSubmitting }: any) => {
      setIsSubmitting(true);
      // Simulate async work
      return new Promise((resolve) => {
        setTimeout(() => {
          // End loading
          setIsSubmitting(false);
          resolve(null);
        }, 0);
      });
    });

    renderComponent();

    const inviteBtn = screen.getByText('Invite');
    expect(inviteBtn).toBeInTheDocument();

    fireEvent.click(inviteBtn);
    expect(inviteBtn).toHaveAttribute('data-loading', 'true');

    // Wait for loading to finish and ensure it disappears
      await waitFor(() => {
        expect(inviteBtn).not.toHaveAttribute('data-loading', 'true');
      }, { timeout: 1000 });
  });

  it('should call handle invite members when the user clicks the invite btn', () => {
    renderComponent();

    const inviteBtn = screen.getByRole('button', { name: 'Invite' });
    fireEvent.click(inviteBtn);

    expect(handleInviteMembers).toHaveBeenCalled();
  });
});
