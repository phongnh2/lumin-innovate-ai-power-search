import React from "react";
import { render, screen} from "features/CNC/utils/testUtil";
import JoinOrganizationFromOpenDriveContainer from "features/CNC/CncComponents/JoinOrganizationFromOpenDrive/components/JoinOrganizationFromOpenDriveContainer";
import '@testing-library/jest-dom'
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { ORG_TEXT } from "constants/organizationConstants";
import { useSelector } from 'react-redux';
import selectors from 'selectors';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

describe("JoinOrganizationFromOpenDriveContainer", () => {
  const history = createMemoryHistory();

  beforeEach(() => {
    (useSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectors.getCurrentOrganization) {
        return { data: { url: 'test' } };
      }
      return jest.requireActual('react-redux').useSelector(selector);
    });

  });

  afterEach(()=>{
    (useSelector as jest.Mock).mockClear();
  })

  it("should render JoinOrganizationFromOpenDriveContainer children while loading", () => {
    const mockDocumentId = '68df757be3252409ac5f333b'

    render(
      <Router location={history.location} navigator={history}>
        <JoinOrganizationFromOpenDriveContainer orgList={[]} loading={true} documentId={mockDocumentId}>
          <span>TEST</span>
        </JoinOrganizationFromOpenDriveContainer>
      </Router>
    );
    const test = screen.getByText("TEST");
    expect(test).toBeInTheDocument();
  });

  it("should navigate to current workspace when documentId is undefined", () => {
    const mockDocumentId = ''

    render(
      <Router location={history.location} navigator={history}>
        <JoinOrganizationFromOpenDriveContainer orgList={[]} loading={false} documentId={mockDocumentId}>
          <span>TEST</span>
        </JoinOrganizationFromOpenDriveContainer>
      </Router>
    );
    expect(history.location.pathname).toBe('/workspace/test/documents');
  })

  it("should navigate to viewer with the corresponding documentId when documentId is available", async () => {
    const mockDocumentId = '68df757be3252409ac5f333b'

    render(
      <Router location={history.location} navigator={history}>
        <JoinOrganizationFromOpenDriveContainer orgList={[]} loading={false} documentId={mockDocumentId}>
          <span>TEST</span>
        </JoinOrganizationFromOpenDriveContainer>
      </Router>
    )

    expect(history.location.pathname).toBe(`/viewer/${mockDocumentId}`);
  })

  it("should navigate to current organization when finished loading", () => {
    render(
      <Router location={history.location} navigator={history}>
        <JoinOrganizationFromOpenDriveContainer orgList={[]} loading={false} documentId={""}>
          <span>TEST</span>
        </JoinOrganizationFromOpenDriveContainer>
      </Router>
    )

    expect(history.location.pathname).toBe(`/${ORG_TEXT}/test/documents`);
  });
});
