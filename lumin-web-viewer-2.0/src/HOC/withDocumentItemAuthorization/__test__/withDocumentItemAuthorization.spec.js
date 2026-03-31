import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import withDocumentItemAuthorization from '../withDocumentItemAuthorization';
import { DOCUMENT_TYPE, DocumentActions } from 'constants/documentConstants';
import { ORGANIZATION_ROLES, ORG_TEAM_ROLE } from 'constants/organizationConstants';
import { DOCUMENT_ROLES } from 'constants/lumin-common';

jest.mock('utils/documentAuthorization', () => ({
  getDocAuthorizationHOF: jest.fn(() => () => true),
}));

const mockStore = configureMockStore([]);

// Test component that displays authorization results
const TestComponent = ({ withAuthorize, document, testAction }) => (
  <div>
    <span data-testid="document-name">{document?.name}</span>
    <span data-testid="can-perform-action">
      {withAuthorize && testAction ? String(withAuthorize(testAction)) : 'no-authorize'}
    </span>
  </div>
);

// ============ FACTORIES ============

const createBaseDocument = (overrides = {}) => ({
  _id: 'doc-123',
  name: 'Test Doc',
  documentType: DOCUMENT_TYPE.PERSONAL,
  roleOfDocument: DOCUMENT_ROLES.OWNER,
  ...overrides,
});

const createPersonalDoc = (role, overrides = {}) =>
  createBaseDocument({ documentType: DOCUMENT_TYPE.PERSONAL, roleOfDocument: role, ...overrides });

const createOrgDoc = (role, clientId = 'org-123', overrides = {}) =>
  createBaseDocument({
    documentType: DOCUMENT_TYPE.ORGANIZATION,
    roleOfDocument: role,
    clientId,
    ownerId: 'other-user',
    ...overrides,
  });

const createTeamDoc = (role, teamId = 'team-123', overrides = {}) =>
  createBaseDocument({
    documentType: DOCUMENT_TYPE.ORGANIZATION_TEAM,
    roleOfDocument: role,
    clientId: teamId,
    ownerId: 'other-user',
    ...overrides,
  });

const createDefaultStoreState = () => ({
  organization: {
    organizations: { data: [], loading: false },
    currentOrganization: { data: { teams: [] } },
  },
  auth: { currentUser: { _id: 'user-123', email: 'test@example.com' } },
});

const createOrgStoreState = (orgRole, orgId = 'org-123') => ({
  organization: {
    organizations: {
      data: [{ organization: { _id: orgId }, role: orgRole }],
      loading: false,
    },
    currentOrganization: { data: { teams: [] } },
  },
  auth: { currentUser: { _id: 'user-123', email: 'test@example.com' } },
});

const createTeamStoreState = (teamRole, teamId = 'team-123') => ({
  organization: {
    organizations: { data: [], loading: false },
    currentOrganization: {
      data: { teams: [{ _id: teamId, roleOfUser: teamRole }] },
    },
  },
  auth: { currentUser: { _id: 'user-123', email: 'test@example.com' } },
});

// ============ HELPERS ============

const EnhancedComponent = withDocumentItemAuthorization(TestComponent);

const renderWithStore = (document, testAction, storeState = createDefaultStoreState()) => {
  const store = mockStore(storeState);
  return render(
    <Provider store={store}>
      <EnhancedComponent document={document} testAction={testAction} />
    </Provider>
  );
};

const expectAuthorization = (expected) => {
  expect(screen.getByTestId('can-perform-action')).toHaveTextContent(String(expected));
};

describe('withDocumentItemAuthorization HOC', () => {
  describe('HOC Basic Functionality', () => {
    it('should render wrapped component with document prop', () => {
      const document = createPersonalDoc(DOCUMENT_ROLES.OWNER, { name: 'Test Document' });
      renderWithStore(document, null);
      expect(screen.getByTestId('document-name')).toHaveTextContent('Test Document');
    });

    it('should pass withAuthorize function to wrapped component', () => {
      const document = createPersonalDoc(DOCUMENT_ROLES.OWNER);
      renderWithStore(document, DocumentActions.View);
      expectAuthorization(true);
    });

    it('should pass additional props to wrapped component', () => {
      const CustomComponent = ({ customProp, document }) => (
        <div>
          <span data-testid="custom-prop">{customProp}</span>
          <span data-testid="doc-name">{document?.name}</span>
        </div>
      );
      const Enhanced = withDocumentItemAuthorization(CustomComponent);
      const document = createPersonalDoc(DOCUMENT_ROLES.OWNER, { name: 'Test Doc' });
      const store = mockStore(createDefaultStoreState());

      render(
        <Provider store={store}>
          <Enhanced document={document} customProp="custom-value" />
        </Provider>
      );

      expect(screen.getByTestId('custom-prop')).toHaveTextContent('custom-value');
      expect(screen.getByTestId('doc-name')).toHaveTextContent('Test Doc');
    });
  });

  describe('Personal Document Authorization', () => {
    it.each([
      [DOCUMENT_ROLES.OWNER, DocumentActions.Move, true],
      [DOCUMENT_ROLES.SHARER, DocumentActions.Rename, true],
      [DOCUMENT_ROLES.VIEWER, DocumentActions.View, true],
      [DOCUMENT_ROLES.EDITOR, DocumentActions.View, true],
    ])('role %s performing %s should be %s', (role, action, expected) => {
      const document = createPersonalDoc(role);
      renderWithStore(document, action);
      expectAuthorization(expected);
    });
  });

  describe('Organization Team Document Authorization', () => {
    it('should authorize team admin for team document actions', () => {
      const document = createTeamDoc(DOCUMENT_ROLES.EDITOR);
      renderWithStore(document, DocumentActions.Remove, createTeamStoreState(ORG_TEAM_ROLE.ADMIN));
      expectAuthorization(true);
    });

    it('should authorize team member who is document owner', () => {
      const document = createTeamDoc(DOCUMENT_ROLES.EDITOR, 'team-123', { ownerId: 'user-123' });
      renderWithStore(document, DocumentActions.Remove, createTeamStoreState(ORG_TEAM_ROLE.MEMBER));
      expectAuthorization(true);
    });

    it('should fallback to personal authorization when team not found', () => {
      const document = createTeamDoc(DOCUMENT_ROLES.OWNER, 'non-existent-team');
      renderWithStore(document, DocumentActions.View, createTeamStoreState(ORG_TEAM_ROLE.MEMBER, 'different-team'));
      expectAuthorization(true);
    });
  });

  describe('Organization Document Authorization', () => {
    it('should authorize org member who is document owner', () => {
      const document = createOrgDoc(DOCUMENT_ROLES.OWNER, 'org-123', { ownerId: 'user-123' });
      renderWithStore(document, DocumentActions.Remove, createOrgStoreState(ORGANIZATION_ROLES.MEMBER));
      expectAuthorization(true);
    });

    it('should fallback to personal authorization when organization not found', () => {
      const document = createOrgDoc(DOCUMENT_ROLES.OWNER, 'non-existent-org');
      renderWithStore(document, DocumentActions.View, createOrgStoreState(ORGANIZATION_ROLES.MEMBER, 'different-org'));
      expectAuthorization(true);
    });
  });

  describe('Edge Cases', () => {
    it.each([
      ['undefined organizations data', { organization: { organizations: {}, currentOrganization: { data: { teams: [] } } } }],
      ['undefined teams', { organization: { organizations: { data: [], loading: false }, currentOrganization: { data: {} } } }],
      ['empty currentUser', { auth: { currentUser: {} } }],
    ])('should handle %s', (_, storeOverrides) => {
      const document = createPersonalDoc(DOCUMENT_ROLES.OWNER);
      const storeState = { ...createDefaultStoreState(), ...storeOverrides };
      renderWithStore(document, DocumentActions.View, storeState);
      expectAuthorization(true);
    });
  });

  describe('Redux Connection', () => {
    it('should connect to redux store and receive state', () => {
      const customState = {
        organization: {
          organizations: {
            data: [{ organization: { _id: 'org-1' }, role: ORGANIZATION_ROLES.ORGANIZATION_ADMIN }],
            loading: false,
          },
          currentOrganization: { data: { teams: [{ _id: 'team-1', roleOfUser: ORG_TEAM_ROLE.ADMIN }] } },
        },
        auth: { currentUser: { _id: 'custom-user', email: 'custom@test.com' } },
      };
      const document = createPersonalDoc(DOCUMENT_ROLES.OWNER, { name: 'Test Doc' });
      renderWithStore(document, DocumentActions.View, customState);

      expect(screen.getByTestId('document-name')).toHaveTextContent('Test Doc');
      expectAuthorization(true);
    });
  });
});
