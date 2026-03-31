import React from "react";
import { render,screen, fireEvent } from "features/CNC/utils/testUtil";
import { mockOrganization } from 'features/CNC/CncComponents/__mocks__/mockOrganization';
import JoinOrganizationModal from "../components/JoinedOrganizationModal";
import { useShowContactCustomerSupportModal } from "features/CNC/hooks/useShowContactCustomerSupportModal"
import '@testing-library/jest-dom'
import actions from 'actions';
import showContactCustomerSupportModal from 'features/CNC/helpers/showContactCustomerSupportModal';
import { useTranslation } from 'hooks/useTranslation';

jest.mock("hooks/useTranslation", () => ({
  useTranslation: jest.fn(),
}));
jest.mock('actions', () => ({
  closeModal: jest.fn(() => ({ type: 'CLOSE_MODAL' })),
}));
jest.mock('features/CNC/hooks/useShowContactCustomerSupportModal', () => ({
  useShowContactCustomerSupportModal: jest.fn(),
}))
jest.mock('features/CNC/helpers/showContactCustomerSupportModal', () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe("JoinOrganizationModal", () => {
  const mockT = jest.fn();
  beforeEach(() => {
    (useShowContactCustomerSupportModal as jest.Mock).mockReturnValue({
      shouldOpenContactCustomerSupportModal: true
    });
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    mockT.mockImplementation((key:string) => {
      switch (key) {
        case 'googleOnboarding.welcome':
          return `Welcome to ${mockOrganization.name}!`;
        case 'googleOnboarding.description':
          return `Description for ${mockOrganization.name}`;
        case 'common.gotIt':
          return 'Got it';
        default:
          return key;
      }
    })
  })
  afterEach(() => {
    jest.clearAllMocks();
  })

  it("should render JoinOrganizationModal", () => {
    render(<JoinOrganizationModal organization={mockOrganization} />);
    const modalHeader = screen.getByText(`Welcome to ${mockOrganization.name}!`);
    expect(modalHeader).toBeInTheDocument();
  });

  it("should call handleCloseModal when close button is clicked", () => {
    render(<JoinOrganizationModal organization={mockOrganization} />);

    const closeButton = screen.getByText(/Got it/i);
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);

    expect(actions.closeModal).toHaveBeenCalled();
  })

  it("should call showContactCustomerSupportModal when shouldOpenContactCustomerSupportModal is true", () => {
    const mockNumberInvited = 5;

    render(<JoinOrganizationModal organization={mockOrganization} numberInvited={mockNumberInvited} />);

    const closeButton = screen.getByText(/Got it/i);
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);

    expect(showContactCustomerSupportModal).toHaveBeenCalledWith({ numberInvited: mockNumberInvited });
  })

  it("should not call showContactCustomerSupportModal when shouldOpenContactCustomerSupportModal is false", () => {
    (useShowContactCustomerSupportModal as jest.Mock).mockReturnValue({
      shouldOpenContactCustomerSupportModal: false
    });

    render(<JoinOrganizationModal organization={mockOrganization} />);

    const closeButton = screen.getByText(/Got it/i);
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);

    expect(showContactCustomerSupportModal).not.toHaveBeenCalled();
  })
})
