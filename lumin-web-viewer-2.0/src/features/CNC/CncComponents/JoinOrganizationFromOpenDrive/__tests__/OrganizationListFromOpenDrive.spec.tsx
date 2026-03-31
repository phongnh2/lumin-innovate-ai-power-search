import React from 'react';

import { render, screen, fireEvent } from 'features/CNC/utils/testUtil';
import { mockSuggestedOrganizations } from 'features/CNC/CncComponents/__mocks__/mockOrganization';

import { useTranslation } from 'hooks/useTranslation';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import { JoinOrganizationStatus, SuggestedOrganization } from 'interfaces/organization/organization.interface';

import OrganizationListFromOpenDrive from '../components/OrganizationListFromOpenDrive';

import '@testing-library/jest-dom';

jest.mock('hooks/useTranslation', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('hooks/useGetCurrentUser', () => ({
  useGetCurrentUser: jest.fn(),
}));

jest.mock('../components/OrganizationItemFromOpenDriveSkeleton', () => () => (
  <div data-testid="organization-item-from-open-drive-skeleton" />
));

jest.mock(
  '../components/OrganizationItemFromOpenDrive',
  () =>
    ({ organization }: { organization: SuggestedOrganization }) =>
      (
        <div data-testid="organization-item-from-open-drive">
          <p data-testid="organization-item-from-open-drive-status">{organization.status}</p>
        </div>
      ),
);

const defaultProps = {
  orgList: mockSuggestedOrganizations,
  loading: false,
  onSkip: () => {},
  documentId: 'test-document-id',
};

describe('OrganizationListFromOpenDrive', () => {
  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({
      t: jest.fn((key: string) => {
        switch (key) {
          case 'action.showMore':
            return 'Show more';
          case 'viewer.noteContent.showLess':
            return 'Show less';
          default:
            return key;
        }
      }),
    });
    (useGetCurrentUser as jest.Mock).mockReturnValue({
      hashedIpAddress: 'test-hashed-ip',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render OrganizationListFromOpenDrive', () => {
    render(<OrganizationListFromOpenDrive {...defaultProps} />);
    const organizationListFromOpenDrive = screen.getAllByTestId('organization-item-from-open-drive')[0];
    expect(organizationListFromOpenDrive).toBeInTheDocument();

    const showMoreBtn = screen.getByRole('button', { name: 'Show more' });
    expect(showMoreBtn).toBeInTheDocument();
  });

  it('should render OrganizationListFromOpenDriveSkeleton', () => {
    render(<OrganizationListFromOpenDrive {...defaultProps} loading />);
    const organizationListFromOpenDriveSkeleton =
      screen.getAllByTestId('organization-item-from-open-drive-skeleton')[0];
    expect(organizationListFromOpenDriveSkeleton).toBeInTheDocument();
  });

  it('should show or hide organizations when CTA buttons are clicked', () => {
    render(<OrganizationListFromOpenDrive {...defaultProps} />);

    const showMoreBtn = screen.getByRole('button', { name: 'Show more' });
    fireEvent.click(showMoreBtn);

    const extendedOrganizationListFromOpenDrive = screen.getAllByTestId('organization-item-from-open-drive');
    expect(extendedOrganizationListFromOpenDrive.length).toBe(mockSuggestedOrganizations.length);

    const showLessBtn = screen.getByRole('button', { name: 'Show less' });
    fireEvent.click(showLessBtn);

    const shortenedOrganizationListFromOpenDrive = screen.getAllByTestId('organization-item-from-open-drive');
    expect(shortenedOrganizationListFromOpenDrive.length).toBe(5);
  });
});
