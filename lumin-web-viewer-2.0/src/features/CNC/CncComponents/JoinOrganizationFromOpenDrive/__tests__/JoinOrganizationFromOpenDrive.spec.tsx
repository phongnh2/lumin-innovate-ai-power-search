import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { render, screen, fireEvent } from 'features/CNC/utils/testUtil';
import { useGetCurrentUser, useShallowSelector, useTranslation } from 'hooks';
import { mockOrganizationList, mockSuggestedOrganizations } from 'features/CNC/CncComponents/__mocks__/mockOrganization';
import { mockUser1 } from 'features/CNC/CncComponents/__mocks__/mockUser';
import { CNC_ONBOARDING_FLOW_VARIANT, useGetOnboardingFlowFromOpenDriveFlag } from 'features/CNC/hooks/useGetOnboardingFlowFromOpenDriveFlag';
import { useGetSuggestedOrgListOfUser } from 'features/CNC/hooks/useGetSuggestedOrgListOfUser';
import { SuggestedOrganization } from 'interfaces/organization/organization.interface';

import JoinOrganizationFromOpenDrive from '../JoinOrganizationFromOpenDrive';

import '@testing-library/jest-dom';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
}));

jest.mock('hooks', () => ({
  useTranslation: jest.fn(),
  useShallowSelector: jest.fn(),
  useGetCurrentUser: jest.fn(),
}));

jest.mock('lumin-components/Layout', () => ({
  LayoutSecondary: jest.fn(({ children }) => <div data-testid="secondary-layout">{children}</div>),
}));

jest.mock('../components/JoinOrganizationFromOpenDriveContainer', () => (
  ({ children }: { children: React.ReactNode }) => <div data-testid="join-organization-from-open-drive-container">{children}</div>
));

jest.mock('../components/OrganizationListFromOpenDrive', () => (
  ({
    orgList
  }: { orgList: SuggestedOrganization[] }) => (
    <div data-testid="organization-list-from-open-drive">
      {orgList.map((item) => (
        <div data-testid="filtered-org" key={item._id}>
          {item._id}
        </div>
      ))}
    </div>
  )
));

jest.mock('features/CNC/hooks/useGetOnboardingFlowFromOpenDriveFlag', () => ({
  ...jest.requireActual('features/CNC/hooks/useGetOnboardingFlowFromOpenDriveFlag'),
  useGetOnboardingFlowFromOpenDriveFlag: jest.fn(),
}));
jest.mock('features/CNC/hooks/useGetSuggestedOrgListOfUser', () => ({
  useGetSuggestedOrgListOfUser: jest.fn(),
}));

describe('JoinOrganizationFromOpenDrive', () => {
  const history = createMemoryHistory({
    initialEntries: [{
      pathname: '/join-organization-from-open-drive',
      state: {
        documentId: 'test-document-id',
      },
    }],
    initialIndex: 0,
  });

  beforeEach(() => {
    const mockT = jest.fn((key: string) => {
      switch (key) {
        case 'joinOrg.title':
          return 'Join Organization';
        case 'joinOrg.description':
          return 'Description';
        case 'googleOnboarding.titleDescription':
          return 'We have found teams for you to join.';
        case 'googleOnboarding.skip':
          return 'Skip for now';
        default:
          return key;
      }
    });

    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (useShallowSelector as jest.Mock).mockReturnValue(mockOrganizationList);
    (useGetSuggestedOrgListOfUser as jest.Mock).mockReturnValue({
      loading: false,
      orgList: mockSuggestedOrganizations,
    });
    (useGetOnboardingFlowFromOpenDriveFlag as jest.Mock).mockReturnValue({
      variant: CNC_ONBOARDING_FLOW_VARIANT.VARIANT_B,
    });
    (useGetCurrentUser as jest.Mock).mockReturnValue({
      ...mockUser1,
      hashedIpAddress: '1234567890',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => render(
    <Router location={history.location} navigator={history}>
      <JoinOrganizationFromOpenDrive />
    </Router>
  );

  it('should render the component correctly', () => {
    renderComponent();

    // Verify LayoutSecondary wrapper renders
    expect(screen.getByTestId('secondary-layout')).toBeInTheDocument();
    // Verify JoinOrganizationFromOpenDriveContainer wrapper renders
    expect(screen.getByTestId('join-organization-from-open-drive-container')).toBeInTheDocument();
    // Verify OrganizationListFromOpenDrive wrapper renders
    expect(screen.getByTestId('organization-list-from-open-drive')).toBeInTheDocument();
    // Verify text content
    expect(screen.getByText('Join Organization')).toBeInTheDocument();
    expect(screen.getByText('We have found teams for you to join.')).toBeInTheDocument();
    // Verify skip button renders
    expect(screen.getByRole('button', { name: 'Skip for now' })).toBeInTheDocument();
  });

  it('should navigate to the viewer when skip button is clicked', () => {
    renderComponent();
    const skipButton = screen.getByRole('button', { name: 'Skip for now' });
    fireEvent.click(skipButton);
    expect(history.location.pathname).toBe(`/viewer/test-document-id`);
  });

  it('should disable the skip button when loading', () => {
    (useGetSuggestedOrgListOfUser as jest.Mock).mockReturnValue({
      orgList: [],
      loading: true,
    });
    renderComponent();
    const skipButton = screen.getByRole('button');
    expect(skipButton).toBeDisabled();
  });

  it('should render the organizations that have been filtered', async () => {
    renderComponent();
    const renderedFilteredOrgs = await screen.findAllByTestId('filtered-org');
    const currentOrganizationIds = new Set(mockOrganizationList.data?.map((item) => item?.organization?._id));
    const orgListFiltered = mockSuggestedOrganizations.filter(
      (item) => !currentOrganizationIds.has(item?._id) && Boolean(item?.status)
    );
    expect(renderedFilteredOrgs).toHaveLength(orgListFiltered.length);
  });
});

