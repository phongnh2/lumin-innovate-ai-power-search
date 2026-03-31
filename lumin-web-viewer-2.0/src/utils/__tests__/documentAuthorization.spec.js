import { getDocAuthorizationHOF } from '../documentAuthorization';
import withPersonalAuthorization from 'src/HOC/withDocumentItemAuthorization/withPersonalAuthorization';
import withOrgTeamAuthorization from 'src/HOC/withDocumentItemAuthorization/withOrgTeamAuthorization';
import withOrganizationAuthorization from 'src/HOC/withDocumentItemAuthorization/withOrganizationAuthorization';
import { DOCUMENT_TYPE } from 'constants/documentConstants';

jest.mock('src/HOC/withDocumentItemAuthorization/withPersonalAuthorization', () =>
  jest.fn((doc) => `personal:${doc.id}`)
);
jest.mock('src/HOC/withDocumentItemAuthorization/withOrgTeamAuthorization', () =>
  jest.fn(({ userRole, document }) => `team:${document.id}:${userRole}`)
);
jest.mock('src/HOC/withDocumentItemAuthorization/withOrganizationAuthorization', () =>
  jest.fn(({ userRole, document }) => `org:${document.id}:${userRole}`)
);

describe('getDocAuthorizationHOF', () => {
  const currentUser = { id: 'user1' };

  it('should return withPersonalAuthorization for PERSONAL document', () => {
    const document = { id: 'doc1', documentType: DOCUMENT_TYPE.PERSONAL };
    const result = getDocAuthorizationHOF({ document, currentUser });
    expect(withPersonalAuthorization).toHaveBeenCalledWith(document);
    expect(result).toBe('personal:doc1');
  });

  it('should return withOrgTeamAuthorization if team owns the document', () => {
    const document = { id: 'doc2', documentType: DOCUMENT_TYPE.ORGANIZATION_TEAM, clientId: 'team1' };
    const teams = [{ _id: 'team1', roleOfUser: 'admin' }];
    const result = getDocAuthorizationHOF({ document, teams, currentUser });
    expect(withOrgTeamAuthorization).toHaveBeenCalledWith({ userRole: 'admin', document, currentUser });
    expect(result).toBe('team:doc2:admin');
  });

  it('should fallback to withPersonalAuthorization if team not found', () => {
    const document = { id: 'doc2', documentType: DOCUMENT_TYPE.ORGANIZATION_TEAM, clientId: 'team1' };
    const teams = [{ _id: 'team2', roleOfUser: 'admin' }];
    const result = getDocAuthorizationHOF({ document, teams, currentUser });
    expect(withPersonalAuthorization).toHaveBeenCalledWith(document);
    expect(result).toBe('personal:doc2');
  });

  it('should return withOrganizationAuthorization if org owns the document', () => {
    const document = { id: 'doc3', documentType: DOCUMENT_TYPE.ORGANIZATION, clientId: 'org1' };
    const orgData = [{ organization: { _id: 'org1' }, role: 'member' }];
    const result = getDocAuthorizationHOF({ document, orgData, currentUser });
    expect(withOrganizationAuthorization).toHaveBeenCalledWith({ document, userRole: 'member', currentUser });
    expect(result).toBe('org:doc3:member');
  });

  it('should fallback to withPersonalAuthorization if org not found', () => {
    const document = { id: 'doc3', documentType: DOCUMENT_TYPE.ORGANIZATION, clientId: 'org1' };
    const orgData = [{ organization: { _id: 'org2' }, role: 'member' }];
    const result = getDocAuthorizationHOF({ document, orgData, currentUser });
    expect(withPersonalAuthorization).toHaveBeenCalledWith(document);
    expect(result).toBe('personal:doc3');
  });

  it('should throw error for invalid documentType', () => {
    const document = { id: 'doc4', documentType: 'INVALID_TYPE' };
    expect(() => getDocAuthorizationHOF({ document, currentUser })).toThrow(
      'Document type is invalid: INVALID_TYPE'
    );
  });
  
  it('document null', () => {
    expect(() => getDocAuthorizationHOF({ document: null, currentUser })).not.toBeNull();
  });
});
