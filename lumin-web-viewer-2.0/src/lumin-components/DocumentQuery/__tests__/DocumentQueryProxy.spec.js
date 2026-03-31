import actions from 'actions';
import selectors from 'selectors';
import { folderType, ownerFilter, modifiedFilter } from 'constants/documentConstants';
import { store } from 'src/redux/store';

import {
  createFilterRule,
  getParticularDocuments,
  DocumentQueryProxy,
  DocumentQueryRetriever,
  TotalDocumentsSetter,
  TotalDocumentsRetriever,
} from '../DocumentQueryProxy';

jest.mock('src/redux/store', () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}));

jest.mock('actions', () => ({
  setSystemDocument: jest.fn(),
  setPersonalDocuments: jest.fn(),
  setFavoriteDocuments: jest.fn(),
  setOrgDocuments: jest.fn(),
  setTeamDocuments: jest.fn(),
  setSharedDocuments: jest.fn(),
  setTotalPersonalDocs: jest.fn(),
  setTeamTotalDocs: jest.fn(),
  setOrgTotalDocs: jest.fn(),
  setTotalSharedDocs: jest.fn(),
}));

jest.mock('selectors', () => ({
  getCurrentUser: jest.fn(),
  getCurrentOwnedFilter: jest.fn(),
  getCurrentLastModifiedFilter: jest.fn(),
  getDocumentList: jest.fn(),
}));

describe('DocumentQueryProxy', () => {
  let mockState;
  let mockDispatch;
  let mockCurrentUser;
  let mockDocumentList;

  beforeEach(() => {
    mockCurrentUser = {
      _id: 'user123',
      name: 'Test User',
    };

    mockDocumentList = {
      [folderType.INDIVIDUAL]: {
        commonDocuments: {},
        particularDocuments: {},
      },
      [folderType.SHARED]: {
        commonDocuments: {},
        particularDocuments: {},
      },
      [folderType.STARRED]: {
        commonDocuments: {},
        particularDocuments: {},
      },
      [folderType.ORGANIZATION]: {
        commonDocuments: {},
        particularDocuments: {},
      },
      [folderType.TEAMS]: {
        commonDocuments: {},
        particularDocuments: {},
      },
      [folderType.DEVICE]: {
        commonDocuments: {},
        particularDocuments: {},
      },
    };

    mockState = {
      document: mockDocumentList,
    };

    mockDispatch = jest.fn((action) => action);

    store.getState.mockReturnValue(mockState);
    store.dispatch.mockImplementation(mockDispatch);
    selectors.getCurrentUser.mockReturnValue(mockCurrentUser);
    selectors.getCurrentOwnedFilter.mockReturnValue(ownerFilter.byAnyone);
    selectors.getCurrentLastModifiedFilter.mockReturnValue(modifiedFilter.modifiedByAnyone);
    selectors.getDocumentList.mockReturnValue(mockDocumentList);

    jest.clearAllMocks();
  });

  describe('createFilterRule', () => {
    it('should return false when currentUser is null', () => {
      selectors.getCurrentUser.mockReturnValue(null);
      const filterRule = createFilterRule(modifiedFilter.modifiedByAnyone, ownerFilter.byAnyone);
      const document = { _id: 'doc1', ownerId: 'user123', lastModifiedBy: 'user123' };

      expect(filterRule(document)).toBe(false);
    });

    it('should filter by modifiedByMe', () => {
      const filterRule = createFilterRule(modifiedFilter.modifiedByMe, ownerFilter.byAnyone);
      const document1 = { _id: 'doc1', ownerId: 'user123', lastModifiedBy: 'user123' };
      const document2 = { _id: 'doc2', ownerId: 'user123', lastModifiedBy: 'otherUser' };

      expect(filterRule(document1)).toBe(true);
      expect(filterRule(document2)).toBe(false);
    });

    it('should filter by ownerFilter.byMe', () => {
      const filterRule = createFilterRule(modifiedFilter.modifiedByAnyone, ownerFilter.byMe);
      const document1 = { _id: 'doc1', ownerId: 'user123', lastModifiedBy: 'user123' };
      const document2 = { _id: 'doc2', ownerId: 'otherUser', lastModifiedBy: 'user123' };

      expect(filterRule(document1)).toBe(true);
      expect(filterRule(document2)).toBe(false);
    });

    it('should filter by ownerFilter.notByMe', () => {
      const filterRule = createFilterRule(modifiedFilter.modifiedByAnyone, ownerFilter.notByMe);
      const document1 = { _id: 'doc1', ownerId: 'otherUser', lastModifiedBy: 'user123' };
      const document2 = { _id: 'doc2', ownerId: 'user123', lastModifiedBy: 'user123' };

      expect(filterRule(document1)).toBe(true);
      expect(filterRule(document2)).toBe(false);
    });

    it('should combine modifiedByMe and byMe filters', () => {
      const filterRule = createFilterRule(modifiedFilter.modifiedByMe, ownerFilter.byMe);
      const document1 = { _id: 'doc1', ownerId: 'user123', lastModifiedBy: 'user123' };
      const document2 = { _id: 'doc2', ownerId: 'otherUser', lastModifiedBy: 'user123' };
      const document3 = { _id: 'doc3', ownerId: 'user123', lastModifiedBy: 'otherUser' };

      expect(filterRule(document1)).toBe(true);
      expect(filterRule(document2)).toBe(false);
      expect(filterRule(document3)).toBe(false);
    });

    it('should return true for default filters (byAnyone)', () => {
      const filterRule = createFilterRule(modifiedFilter.modifiedByAnyone, ownerFilter.byAnyone);
      const document = { _id: 'doc1', ownerId: 'user123', lastModifiedBy: 'user123' };

      expect(filterRule(document)).toBe(true);
    });
  });

  describe('getParticularDocuments', () => {
    beforeEach(() => {
      selectors.getCurrentOwnedFilter.mockReturnValue(ownerFilter.byAnyone);
      selectors.getCurrentLastModifiedFilter.mockReturnValue(modifiedFilter.modifiedByAnyone);
    });

    it('should get documents for INDIVIDUAL folder type', () => {
      const particularDocuments = {
        [modifiedFilter.modifiedByAnyone]: {
          [ownerFilter.byAnyone]: { documents: ['doc1', 'doc2'] },
        },
      };
      mockDocumentList[folderType.INDIVIDUAL].particularDocuments = particularDocuments;
      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = getParticularDocuments(mockState, {
        documentList: mockDocumentList[folderType.INDIVIDUAL],
        currentFolderType: folderType.INDIVIDUAL,
        clientId: null,
      });

      expect(result).toEqual({ documents: ['doc1', 'doc2'] });
    });

    it('should get documents for SHARED folder type', () => {
      const particularDocuments = {
        [modifiedFilter.modifiedByAnyone]: {
          [ownerFilter.byAnyone]: { documents: ['doc3', 'doc4'] },
        },
      };
      mockDocumentList[folderType.SHARED].particularDocuments = particularDocuments;
      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = getParticularDocuments(mockState, {
        documentList: mockDocumentList[folderType.SHARED],
        currentFolderType: folderType.SHARED,
        clientId: null,
      });

      expect(result).toEqual({ documents: ['doc3', 'doc4'] });
    });

    it('should get documents for STARRED folder type', () => {
      const particularDocuments = {
        [modifiedFilter.modifiedByAnyone]: {
          [ownerFilter.byAnyone]: { documents: ['doc5', 'doc6'] },
        },
      };
      mockDocumentList[folderType.STARRED].particularDocuments = particularDocuments;
      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = getParticularDocuments(mockState, {
        documentList: mockDocumentList[folderType.STARRED],
        currentFolderType: folderType.STARRED,
        clientId: null,
      });

      expect(result).toEqual({ documents: ['doc5', 'doc6'] });
    });

    it('should get documents for DEVICE folder type', () => {
      const particularDocuments = {
        [modifiedFilter.modifiedByAnyone]: {
          [ownerFilter.byAnyone]: { documents: ['doc7', 'doc8'] },
        },
      };
      mockDocumentList[folderType.DEVICE].particularDocuments = particularDocuments;
      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = getParticularDocuments(mockState, {
        documentList: mockDocumentList[folderType.DEVICE],
        currentFolderType: folderType.DEVICE,
        clientId: null,
      });

      expect(result).toEqual({ documents: ['doc7', 'doc8'] });
    });

    it('should get documents for ORGANIZATION folder type with clientId', () => {
      const clientId = 'org123';
      const particularDocuments = {
        [clientId]: {
          [modifiedFilter.modifiedByAnyone]: {
            [ownerFilter.byAnyone]: { documents: ['doc9', 'doc10'] },
          },
        },
      };
      mockDocumentList[folderType.ORGANIZATION].particularDocuments = particularDocuments;
      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = getParticularDocuments(mockState, {
        documentList: mockDocumentList[folderType.ORGANIZATION],
        currentFolderType: folderType.ORGANIZATION,
        clientId,
      });

      expect(result).toEqual({ documents: ['doc9', 'doc10'] });
    });

    it('should get documents for TEAMS folder type with clientId', () => {
      const clientId = 'team123';
      const particularDocuments = {
        [clientId]: {
          [modifiedFilter.modifiedByAnyone]: {
            [ownerFilter.byAnyone]: { documents: ['doc11', 'doc12'] },
          },
        },
      };
      mockDocumentList[folderType.TEAMS].particularDocuments = particularDocuments;
      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = getParticularDocuments(mockState, {
        documentList: mockDocumentList[folderType.TEAMS],
        currentFolderType: folderType.TEAMS,
        clientId,
      });

      expect(result).toEqual({ documents: ['doc11', 'doc12'] });
    });

    it('should handle missing clientId for ORGANIZATION', () => {
      mockDocumentList[folderType.ORGANIZATION].particularDocuments = {};
      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = getParticularDocuments(mockState, {
        documentList: mockDocumentList[folderType.ORGANIZATION],
        currentFolderType: folderType.ORGANIZATION,
        clientId: 'org123',
      });

      expect(result).toEqual({});
    });

    it('should handle missing clientId for TEAMS', () => {
      mockDocumentList[folderType.TEAMS].particularDocuments = {};
      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = getParticularDocuments(mockState, {
        documentList: mockDocumentList[folderType.TEAMS],
        currentFolderType: folderType.TEAMS,
        clientId: 'team123',
      });

      expect(result).toEqual({});
    });
  });

  describe('DocumentQueryProxy', () => {
    let documents;

    beforeEach(() => {
      documents = [
        { _id: 'doc1', name: 'Document 1' },
        { _id: 'doc2', name: 'Document 2' },
      ];

      selectors.getCurrentOwnedFilter.mockReturnValue(ownerFilter.byAnyone);
      selectors.getCurrentLastModifiedFilter.mockReturnValue(modifiedFilter.modifiedByAnyone);

      actions.setPersonalDocuments.mockReturnValue({ type: 'SET_PERSONAL_DOCUMENTS' });
      actions.setFavoriteDocuments.mockReturnValue({ type: 'SET_FAVORITE_DOCUMENTS' });
      actions.setOrgDocuments.mockReturnValue({ type: 'SET_ORG_DOCUMENTS' });
      actions.setTeamDocuments.mockReturnValue({ type: 'SET_TEAM_DOCUMENTS' });
      actions.setSharedDocuments.mockReturnValue({ type: 'SET_SHARED_DOCUMENTS' });
      actions.setSystemDocument.mockReturnValue({ type: 'SET_SYSTEM_DOCUMENT' });
    });

    it('should dispatch action for INDIVIDUAL folder type', () => {
      const metaData = {
        documents,
        hasNextPage: true,
        cursor: 'cursor123',
        total: 10,
      };

      DocumentQueryProxy(folderType.INDIVIDUAL, metaData);

      expect(actions.setPersonalDocuments).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should dispatch action for SHARED folder type', () => {
      const metaData = {
        documents,
        hasNextPage: false,
        cursor: 'cursor456',
        total: 5,
      };

      DocumentQueryProxy(folderType.SHARED, metaData);

      expect(actions.setSharedDocuments).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should dispatch action for STARRED folder type', () => {
      const metaData = {
        documents,
        hasNextPage: true,
        cursor: 'cursor789',
        total: 15,
      };

      DocumentQueryProxy(folderType.STARRED, metaData);

      expect(actions.setFavoriteDocuments).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should dispatch action for ORGANIZATION folder type with orgId', () => {
      const metaData = {
        orgId: 'org123',
        documents,
        hasNextPage: true,
        cursor: 'cursor_org',
        total: 20,
      };

      mockDocumentList[folderType.ORGANIZATION].particularDocuments = {};
      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      DocumentQueryProxy(folderType.ORGANIZATION, metaData);

      expect(actions.setOrgDocuments).toHaveBeenCalled();
      const callArgs = actions.setOrgDocuments.mock.calls[0][0];
      expect(callArgs.orgId).toBe('org123');
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should dispatch action for TEAMS folder type with teamId', () => {
      const metaData = {
        teamId: 'team123',
        documents,
        hasNextPage: false,
        cursor: 'cursor_team',
        total: 8,
      };

      mockDocumentList[folderType.TEAMS].particularDocuments = {};
      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      DocumentQueryProxy(folderType.TEAMS, metaData);

      expect(actions.setTeamDocuments).toHaveBeenCalled();
      const callArgs = actions.setTeamDocuments.mock.calls[0][0];
      expect(callArgs.teamId).toBe('team123');
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should dispatch action for DEVICE folder type', () => {
      const metaData = {
        documents,
        hasNextPage: true,
        cursor: 'cursor_device',
        total: 3,
      };

      DocumentQueryProxy(folderType.DEVICE, metaData);

      expect(actions.setSystemDocument).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should merge new documents with common documents', () => {
      const existingDoc = { _id: 'docOld', name: 'Old Document' };
      mockDocumentList[folderType.INDIVIDUAL].commonDocuments = {
        docOld: existingDoc,
      };
      mockDocumentList[folderType.INDIVIDUAL].particularDocuments = {
        [modifiedFilter.modifiedByAnyone]: {
          [ownerFilter.byAnyone]: {
            documents: ['docOld'],
          },
        },
      };

      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const metaData = {
        documents,
        hasNextPage: true,
        cursor: 'cursor123',
        total: 12,
      };

      DocumentQueryProxy(folderType.INDIVIDUAL, metaData);

      const callArgs = actions.setPersonalDocuments.mock.calls[0][0];
      expect(callArgs.newCommonDocuments).toHaveProperty('doc1');
      expect(callArgs.newCommonDocuments).toHaveProperty('doc2');
      expect(callArgs.newCommonDocuments).toHaveProperty('docOld');
    });

    it('should avoid duplicate documents in list', () => {
      mockDocumentList[folderType.INDIVIDUAL].particularDocuments = {
        [modifiedFilter.modifiedByAnyone]: {
          [ownerFilter.byAnyone]: {
            documents: ['doc1'],
          },
        },
      };

      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const metaData = {
        documents,
        hasNextPage: true,
        cursor: 'cursor123',
        total: 10,
      };

      DocumentQueryProxy(folderType.INDIVIDUAL, metaData);

      const callArgs = actions.setPersonalDocuments.mock.calls[0][0];
      expect(callArgs.docList.documents).toEqual(['doc1', 'doc2']);
    });
  });

  describe('DocumentQueryRetriever', () => {
    it('should retrieve documents for INDIVIDUAL folder type', () => {
      const commonDocuments = {
        doc1: { _id: 'doc1', name: 'Document 1' },
        doc2: { _id: 'doc2', name: 'Document 2' },
      };
      mockDocumentList[folderType.INDIVIDUAL].commonDocuments = commonDocuments;
      mockDocumentList[folderType.INDIVIDUAL].particularDocuments = {
        [modifiedFilter.modifiedByAnyone]: {
          [ownerFilter.byAnyone]: {
            documents: ['doc1', 'doc2'],
            hasNextPage: true,
            cursor: 'cursor123',
            firstFetching: false,
            shouldRefetch: false,
          },
        },
      };

      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = DocumentQueryRetriever(folderType.INDIVIDUAL, {});

      expect(result.documents).toHaveLength(2);
      expect(result.documents[0]._id).toBe('doc1');
      expect(result.hasNextPage).toBe(true);
      expect(result.cursor).toBe('cursor123');
      expect(result.firstFetching).toBe(false);
      expect(result.shouldRefetch).toBe(false);
    });

    it('should retrieve documents for ORGANIZATION folder type with orgId', () => {
      const commonDocuments = {
        doc3: { _id: 'doc3', name: 'Document 3' },
      };
      const orgId = 'org123';
      mockDocumentList[folderType.ORGANIZATION].commonDocuments = commonDocuments;
      mockDocumentList[folderType.ORGANIZATION].particularDocuments = {
        [orgId]: {
          [modifiedFilter.modifiedByAnyone]: {
            [ownerFilter.byAnyone]: {
              documents: ['doc3'],
              hasNextPage: false,
              cursor: '',
              firstFetching: true,
              shouldRefetch: true,
            },
          },
        },
      };

      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = DocumentQueryRetriever(folderType.ORGANIZATION, { orgId });

      expect(result.documents).toHaveLength(1);
      expect(result.documents[0]._id).toBe('doc3');
      expect(result.hasNextPage).toBe(false);
      expect(result.firstFetching).toBe(true);
      expect(result.shouldRefetch).toBe(true);
    });

    it('should retrieve documents for TEAMS folder type with teamId', () => {
      const commonDocuments = {
        doc4: { _id: 'doc4', name: 'Document 4' },
      };
      const teamId = 'team123';
      mockDocumentList[folderType.TEAMS].commonDocuments = commonDocuments;
      mockDocumentList[folderType.TEAMS].particularDocuments = {
        [teamId]: {
          [modifiedFilter.modifiedByAnyone]: {
            [ownerFilter.byAnyone]: {
              documents: ['doc4'],
              hasNextPage: true,
              cursor: 'team_cursor',
              firstFetching: false,
              shouldRefetch: false,
            },
          },
        },
      };

      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = DocumentQueryRetriever(folderType.TEAMS, { teamId });

      expect(result.documents).toHaveLength(1);
      expect(result.documents[0]._id).toBe('doc4');
      expect(result.cursor).toBe('team_cursor');
    });

    it('should filter out null documents', () => {
      const commonDocuments = {
        doc1: { _id: 'doc1', name: 'Document 1' },
      };
      mockDocumentList[folderType.INDIVIDUAL].commonDocuments = commonDocuments;
      mockDocumentList[folderType.INDIVIDUAL].particularDocuments = {
        [modifiedFilter.modifiedByAnyone]: {
          [ownerFilter.byAnyone]: {
            documents: ['doc1', 'doc2', 'doc3'],
          },
        },
      };

      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = DocumentQueryRetriever(folderType.INDIVIDUAL, {});

      expect(result.documents).toHaveLength(1);
      expect(result.documents[0]._id).toBe('doc1');
    });

    it('should return default values when no particular documents exist', () => {
      mockDocumentList[folderType.INDIVIDUAL].particularDocuments = {};
      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = DocumentQueryRetriever(folderType.INDIVIDUAL, {});

      expect(result.documents).toEqual([]);
      expect(result.hasNextPage).toBe(false);
      expect(result.cursor).toBe('');
      expect(result.firstFetching).toBe(true);
      expect(result.shouldRefetch).toBe(false);
    });
  });

  describe('TotalDocumentsSetter', () => {
    beforeEach(() => {
      selectors.getCurrentOwnedFilter.mockReturnValue(ownerFilter.byAnyone);
      selectors.getCurrentLastModifiedFilter.mockReturnValue(modifiedFilter.modifiedByAnyone);

      actions.setTotalPersonalDocs.mockReturnValue({ type: 'SET_TOTAL_PERSONAL_DOCS' });
      actions.setTeamTotalDocs.mockReturnValue({ type: 'SET_TEAM_TOTAL_DOCS' });
      actions.setOrgTotalDocs.mockReturnValue({ type: 'SET_ORG_TOTAL_DOCS' });
      actions.setTotalSharedDocs.mockReturnValue({ type: 'SET_TOTAL_SHARED_DOCS' });
    });

    it('should set total documents for INDIVIDUAL folder type', () => {
      const metaData = {
        totalDocuments: 42,
      };

      TotalDocumentsSetter(folderType.INDIVIDUAL, metaData);

      expect(actions.setTotalPersonalDocs).toHaveBeenCalled();
      const callArgs = actions.setTotalPersonalDocs.mock.calls[0][0];
      expect(callArgs.totalDocuments).toBe(42);
      expect(callArgs.ownedRule).toBe(ownerFilter.byAnyone);
      expect(callArgs.modifiedRule).toBe(modifiedFilter.modifiedByAnyone);
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should set total documents for TEAMS folder type with teamId', () => {
      const metaData = {
        clientId: 'team123',
        totalDocuments: 15,
      };

      TotalDocumentsSetter(folderType.TEAMS, metaData);

      expect(actions.setTeamTotalDocs).toHaveBeenCalled();
      const callArgs = actions.setTeamTotalDocs.mock.calls[0][0];
      expect(callArgs.teamId).toBe('team123');
      expect(callArgs.totalDocuments).toBe(15);
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should set total documents for ORGANIZATION folder type with orgId', () => {
      const metaData = {
        clientId: 'org123',
        totalDocuments: 99,
      };

      TotalDocumentsSetter(folderType.ORGANIZATION, metaData);

      expect(actions.setOrgTotalDocs).toHaveBeenCalled();
      const callArgs = actions.setOrgTotalDocs.mock.calls[0][0];
      expect(callArgs.orgId).toBe('org123');
      expect(callArgs.totalDocuments).toBe(99);
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should set total documents for SHARED folder type', () => {
      const metaData = {
        totalDocuments: 7,
      };

      TotalDocumentsSetter(folderType.SHARED, metaData);

      expect(actions.setTotalSharedDocs).toHaveBeenCalled();
      const callArgs = actions.setTotalSharedDocs.mock.calls[0][0];
      expect(callArgs.totalDocuments).toBe(7);
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('should not dispatch for STARRED folder type', () => {
      const metaData = {
        totalDocuments: 10,
      };

      TotalDocumentsSetter(folderType.STARRED, metaData);

      expect(actions.setTotalPersonalDocs).not.toHaveBeenCalled();
      expect(actions.setTeamTotalDocs).not.toHaveBeenCalled();
      expect(actions.setOrgTotalDocs).not.toHaveBeenCalled();
      expect(actions.setTotalSharedDocs).not.toHaveBeenCalled();
    });
  });

  describe('TotalDocumentsRetriever', () => {
    beforeEach(() => {
      selectors.getCurrentOwnedFilter.mockReturnValue(ownerFilter.byAnyone);
      selectors.getCurrentLastModifiedFilter.mockReturnValue(modifiedFilter.modifiedByAnyone);
    });

    it('should retrieve total documents for INDIVIDUAL folder type', () => {
      mockDocumentList[folderType.INDIVIDUAL].particularDocuments = {
        [modifiedFilter.modifiedByAnyone]: {
          [ownerFilter.byAnyone]: {
            totalDocuments: 50,
          },
        },
      };

      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = TotalDocumentsRetriever(folderType.INDIVIDUAL, null);

      expect(result).toBe(50);
    });

    it('should retrieve total documents for ORGANIZATION folder type with clientId', () => {
      const clientId = 'org123';
      mockDocumentList[folderType.ORGANIZATION].particularDocuments = {
        [clientId]: {
          [modifiedFilter.modifiedByAnyone]: {
            [ownerFilter.byAnyone]: {
              totalDocuments: 100,
            },
          },
        },
      };

      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = TotalDocumentsRetriever(folderType.ORGANIZATION, clientId);

      expect(result).toBe(100);
    });

    it('should retrieve total documents for TEAMS folder type with clientId', () => {
      const clientId = 'team123';
      mockDocumentList[folderType.TEAMS].particularDocuments = {
        [clientId]: {
          [modifiedFilter.modifiedByAnyone]: {
            [ownerFilter.byAnyone]: {
              totalDocuments: 25,
            },
          },
        },
      };

      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = TotalDocumentsRetriever(folderType.TEAMS, clientId);

      expect(result).toBe(25);
    });

    it('should return undefined when no total documents exist', () => {
      mockDocumentList[folderType.INDIVIDUAL].particularDocuments = {};
      selectors.getDocumentList.mockReturnValue(mockDocumentList);

      const result = TotalDocumentsRetriever(folderType.INDIVIDUAL, null);

      expect(result).toBeUndefined();
    });
  });
});
