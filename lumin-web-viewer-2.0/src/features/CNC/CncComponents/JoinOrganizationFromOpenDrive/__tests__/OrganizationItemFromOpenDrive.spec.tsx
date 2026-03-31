import React from 'react';

import { render, screen } from 'features/CNC/utils/testUtil';
import { mockSuggestedOrganization } from 'features/CNC/CncComponents/__mocks__/mockOrganization';
import { useJoinOrganization } from 'features/CNC/hooks/useJoinOrganization';
import { CNCOrganizationEvent } from 'features/CNC/constants/events/organization';

import { eventTracking } from 'utils';

import OrganizationItemFromOpenDrive from '../components/OrganizationItemFromOpenDrive';

import '@testing-library/jest-dom';

jest.mock('features/CNC/hooks/useJoinOrganization', () => ({
  useJoinOrganization: jest.fn(),
}));

jest.mock('utils', () => ({
  capitalize: jest.fn(),
  eventTracking: jest.fn().mockResolvedValue(undefined),
  avatar: {
    getAvatar: jest.fn(),
  },
}));

describe('OrganizationItemFromOpenDrive', () => {
  const defaultProps = {
    organization: mockSuggestedOrganization,
    onSkip: jest.fn(),
    documentId: 'test-document-id',
    index: 0,
  };

  beforeEach(() => {
    (useJoinOrganization as jest.Mock).mockReturnValue({
      onClick: jest.fn(),
      isSubmitting: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render OrganizationItemFromOpenDrive', () => {
    render(<OrganizationItemFromOpenDrive {...defaultProps} />);
    const orgName = screen.getByText(mockSuggestedOrganization.name);
    expect(orgName).toBeInTheDocument();
  });

  it('should send tracking event whenever the users view item', () => {
    render(<OrganizationItemFromOpenDrive {...defaultProps} />);

    expect(eventTracking).toHaveBeenCalledWith(
      CNCOrganizationEvent.VIEW_SUGGESTED_ORGANIZATIONS,
      {
        joinType: 'CAN_JOIN',
        orderShown: 0,
        organizationPaymentStatus: 'TRIALING',
        organizationPaymentType: 'ORG_PRO',
        organizationSize: 1,
      },
    );
  });

  it('should render default variant', () => {
    const { container } = render(
      <OrganizationItemFromOpenDrive
        {...defaultProps}
      />,
    );

    const avatar = container.querySelector('.MaterialAvatar__container');
    expect(avatar).toHaveStyle({ width: '48px', height: '48px' });
  });

  it('should only render 5 avatar max', () => {
    const { organization, ...rest } = defaultProps;

    render(
      <OrganizationItemFromOpenDrive
        {...rest}
        organization={{
          ...organization,
          members: Array.from({ length: 6 }, (_, i) => ({
            _id: `member-${i + 1}`,
            name: `Member ${i + 1}`,
            avatarRemoteId: `avatar-${i + 1}`,
          })),
          totalMember: 6,
        }}
      />,
    );

    const avatars = screen.getAllByTestId('avatar');
    expect(avatars.length).toBe(5);
  });
});
