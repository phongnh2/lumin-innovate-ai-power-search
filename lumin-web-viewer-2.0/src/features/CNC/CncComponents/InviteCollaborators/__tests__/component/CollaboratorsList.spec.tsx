import React from "react";
import { fireEvent, render, screen } from "features/CNC/utils/testUtil";
import "@testing-library/jest-dom";
import CollaboratorsList from "../../component/CollaboratorsList";
import { handleChangeCheckbox } from "features/CNC/CncComponents/ExtraFreeTrialModal/helper/handleChangeCheckbox";
import { handleParentCheckbox } from "features/CNC/CncComponents/ExtraFreeTrialModal/helper/handleParentCheckbox";
import {mockUserResults, mockInviteToOrganizationInputs} from 'features/CNC/CncComponents/__mocks__/mockUser';

jest.mock("react-i18next", () => ({
  ...jest.requireActual("react-i18next"),
  useTranslation: () => ({
    t: (key: string) => {
      if (key === "setUpOrg.textSelected") return "selected";
      if (key === "modalShare.pendingUser") return "Pending user";
      return key;
    },
  }),
}));

jest.mock("lumin-ui/kiwi-ui", () => ({
  ...jest.requireActual("lumin-ui/kiwi-ui"),
  Avatar: ({ src, avatarRemoteId } : { src: string, avatarRemoteId: string }) => <div data-testid='avatar'>
    <p>{src}</p>
    <p>{avatarRemoteId}</p>
  </div>,
  // Simulate a checkbox that exposes indeterminate via a data attribute plus aria-checked
  Checkbox: ({ checked, indeterminate, onChange, ...rest }: any) => (
    <input
      type="checkbox"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : !!checked}
      data-indeterminate={indeterminate ? "true" : "false"}
      checked={!!checked}
      onChange={(e) => onChange && onChange(e)}
      {...rest}
    />
  ),
}));

jest.mock("luminComponents/ScrollAreaAutoSize", () =>  ({ children, ...rest }: any) =>
    <div data-testid="scroll-area" {...rest}>
      {children}
    </div>
);

jest.mock("assets/reskin/lumin-svgs/default-user-avatar.svg", () => "default-user-avatar.svg");

jest.mock(
  "features/CNC/CncComponents/ExtraFreeTrialModal/helper/handleChangeCheckbox",
  () => ({
    handleChangeCheckbox: jest.fn(),
  })
);

jest.mock(
  "features/CNC/CncComponents/ExtraFreeTrialModal/helper/handleParentCheckbox",
  () => ({
    handleParentCheckbox: jest.fn(),
  })
);

const mockSetSelectedUsers = jest.fn();
const renderComponent = () => render(
    <CollaboratorsList
      selectedUsers={mockInviteToOrganizationInputs}
      setSelectedUsers={mockSetSelectedUsers}
      allUsers={mockUserResults}
    />
  );


describe("CollaboratorsList", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it("renders the selected users count correctly", () => {
    renderComponent();

    expect(
      screen.getByText(`${mockInviteToOrganizationInputs.length}/${mockUserResults.length} selected`)
    ).toBeInTheDocument();
  });

  it("renders all users with checkboxes", () => {
    renderComponent();

    // Emails visible
    mockUserResults.forEach((user) => {
      expect(screen.getByText(user.email)).toBeInTheDocument();
    })
    // There is 1 parent checkbox and one per user
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(1 + mockUserResults.length);
  });

  it("handles selecting all users correctly", () => {
    renderComponent();

    const checkboxes = screen.getAllByRole("checkbox");
    const parentCheckbox = checkboxes[0];
    fireEvent.click(parentCheckbox);

    expect(handleParentCheckbox).toHaveBeenCalledTimes(1);
    expect(handleParentCheckbox).toHaveBeenCalledWith({
      setSelectedUsers: mockSetSelectedUsers,
      userCollaborators: mockUserResults,
      selectedUsers: mockInviteToOrganizationInputs,
      // event is present but we don't assert its structure
      e: expect.any(Object),
    });
  });

  it("handles individual user checkbox toggle correctly", () => {
    renderComponent();

    const checkboxes = screen.getAllByRole("checkbox");
    // [0] is parent; [1] is for first user (alice)
    const userCheckbox = checkboxes[1];
    fireEvent.click(userCheckbox);

    expect(handleChangeCheckbox).toHaveBeenCalledTimes(2);
    expect(handleChangeCheckbox).toHaveBeenCalledWith({
        user: mockUserResults[0],
        setSelectedUsers: mockSetSelectedUsers,
    });
  });

  it("shows indeterminate state when some users are selected", () => {
    renderComponent();

    const parentCheckbox = screen.getAllByRole("checkbox")[0];
    expect(parentCheckbox).toHaveAttribute("data-indeterminate", "true");
    expect(parentCheckbox).toHaveAttribute("aria-checked", "mixed");
  });

  it("should show default avatar when name is not available", () => {
    renderComponent();
    const collaboratorWithNoName = screen.getAllByRole("presentation")[mockUserResults.length - 1];
    expect(collaboratorWithNoName).toHaveTextContent("default-user-avatar.svg");
  });

  it('should handle empty selectedUsers and allUsers gracefully', () => {
    render(<CollaboratorsList
      selectedUsers={[]}
      setSelectedUsers={mockSetSelectedUsers}
      allUsers={[]}
    />)

    // Shows 0/0 selected
    expect(screen.getByText("0/0 selected")).toBeInTheDocument();

    // Only the parent checkbox should be present
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(1);

    // Clicking the parent checkbox should still invoke the handler with empty arrays
    fireEvent.click(checkboxes[0]);
    expect(handleParentCheckbox).toHaveBeenCalledTimes(1);
    expect(handleParentCheckbox).toHaveBeenCalledWith({
      setSelectedUsers: mockSetSelectedUsers,
      userCollaborators: [],
      selectedUsers: [],
      e: expect.any(Object),
    });
  });
});
