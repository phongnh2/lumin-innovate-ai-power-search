import * as documentListActions from '../documentListActions';

describe('documentListActions', () => {
  let dispatch: jest.Mock;

  beforeEach(() => {
    dispatch = jest.fn();
  });

  describe('pushDocumentToSystemList', () => {
    it('should dispatch PUSH_DOCUMENT_TO_SYSTEM_LIST', () => {
      const document = { id: 'doc-123' };
      documentListActions.pushDocumentToSystemList(document)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'PUSH_DOCUMENT_TO_SYSTEM_LIST',
        payload: { document },
      });
    });
  });

  describe('pushDocumentToPersonalList', () => {
    it('should dispatch PUSH_DOCUMENT_TO_PERSONALS_LIST', () => {
      const document = { id: 'doc-123' };
      documentListActions.pushDocumentToPersonalList(document)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'PUSH_DOCUMENT_TO_PERSONALS_LIST',
        payload: { document },
      });
    });
  });

  describe('pushDocumentToSharedList', () => {
    it('should dispatch PUSH_DOCUMENT_TO_SHARED_LIST', () => {
      const document = { id: 'doc-123' };
      documentListActions.pushDocumentToSharedList(document)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'PUSH_DOCUMENT_TO_SHARED_LIST',
        payload: { document },
      });
    });
  });

  describe('pushDocumentToTeamList', () => {
    it('should dispatch PUSH_DOCUMENT_TO_TEAM_LIST with teamId', () => {
      const document = { id: 'doc-123' };
      const teamId = 'team-456';
      documentListActions.pushDocumentToTeamList(document, teamId)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'PUSH_DOCUMENT_TO_TEAM_LIST',
        payload: { document, teamId },
      });
    });
  });

  describe('pushDocumentToFavoriteList', () => {
    it('should dispatch PUSH_DOCUMENT_TO_FAVORITE_LIST', () => {
      const document = { id: 'doc-123' };
      documentListActions.pushDocumentToFavoriteList(document)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'PUSH_DOCUMENT_TO_FAVORITE_LIST',
        payload: { document },
      });
    });
  });

  describe('pushDocumentToOrganizationList', () => {
    it('should dispatch PUSH_DOCUMENT_TO_ORGANIZATION_LIST with orgId', () => {
      const document = { id: 'doc-123' };
      const orgId = 'org-456';
      documentListActions.pushDocumentToOrganizationList(document, orgId)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'PUSH_DOCUMENT_TO_ORGANIZATION_LIST',
        payload: { document, orgId },
      });
    });
  });

  describe('updateDocumentSystem', () => {
    it('should dispatch UPDATE_DOCUMENT_SYSTEM_INFO', () => {
      const document = { id: 'doc-123', name: 'Updated' };
      documentListActions.updateDocumentSystem(document)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_DOCUMENT_SYSTEM_INFO',
        payload: { document },
      });
    });
  });

  describe('updateDocumentPersonal', () => {
    it('should dispatch UPDATE_DOCUMENT_PERSONAL_INFO', () => {
      const document = { id: 'doc-123', name: 'Updated' };
      documentListActions.updateDocumentPersonal(document)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_DOCUMENT_PERSONAL_INFO',
        payload: { document },
      });
    });
  });

  describe('updateSharedDocument', () => {
    it('should dispatch UPDATE_DOCUMENT_SHARED_INFO', () => {
      const document = { id: 'doc-123', name: 'Updated' };
      documentListActions.updateSharedDocument(document)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_DOCUMENT_SHARED_INFO',
        payload: { document },
      });
    });
  });

  describe('updateDocumentTeam', () => {
    it('should dispatch UPDATE_DOCUMENT_TEAM_INFO', () => {
      const document = { id: 'doc-123', name: 'Updated' };
      documentListActions.updateDocumentTeam(document)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_DOCUMENT_TEAM_INFO',
        payload: { document },
      });
    });
  });

  describe('updateDocumentFavorite', () => {
    it('should dispatch UPDATE_DOCUMENT_FAVORITE_INFO', () => {
      const document = { id: 'doc-123', name: 'Updated' };
      documentListActions.updateDocumentFavorite(document)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_DOCUMENT_FAVORITE_INFO',
        payload: { document },
      });
    });
  });

  describe('updateDocumentOrganization', () => {
    it('should dispatch UPDATE_DOCUMENT_ORGANIZATION_INFO', () => {
      const document = { id: 'doc-123', name: 'Updated' };
      documentListActions.updateDocumentOrganization(document)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'UPDATE_DOCUMENT_ORGANIZATION_INFO',
        payload: { document },
      });
    });
  });

  describe('removeDocumentFromSystemList', () => {
    it('should dispatch REMOVE_DOCUMENT_FROM_SYSTEM_LIST', () => {
      const document = { id: 'doc-123' };
      documentListActions.removeDocumentFromSystemList(document)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_DOCUMENT_FROM_SYSTEM_LIST',
        payload: { document },
      });
    });
  });

  describe('removeDocumentFromPersonalList', () => {
    it('should dispatch REMOVE_DOCUMENT_FROM_PERSONAL_LIST', () => {
      const document = { id: 'doc-123' };
      documentListActions.removeDocumentFromPersonalList(document)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_DOCUMENT_FROM_PERSONAL_LIST',
        payload: { document },
      });
    });
  });

  describe('removeDocumentFromTeamList', () => {
    it('should dispatch REMOVE_DOCUMENT_FROM_TEAM_LIST with teamId', () => {
      const document = { id: 'doc-123' };
      const teamId = 'team-456';
      documentListActions.removeDocumentFromTeamList(document, teamId)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_DOCUMENT_FROM_TEAM_LIST',
        payload: { document, teamId },
      });
    });
  });

  describe('removeDocumentFromFavoriteList', () => {
    it('should dispatch REMOVE_DOCUMENT_FROM_FAVORITE_LIST', () => {
      const document = { id: 'doc-123' };
      documentListActions.removeDocumentFromFavoriteList(document)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_DOCUMENT_FROM_FAVORITE_LIST',
        payload: { document },
      });
    });
  });

  describe('removeDocumentFromOrganizationList', () => {
    it('should dispatch REMOVE_DOCUMENT_FROM_ORGANIZATION_LIST', () => {
      const document = { id: 'doc-123' };
      documentListActions.removeDocumentFromOrganizationList(document)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_DOCUMENT_FROM_ORGANIZATION_LIST',
        payload: { document },
      });
    });
  });

  describe('removeOriginalDocumentsFromPersonalList', () => {
    it('should dispatch REMOVE_ORIGINAL_DOCUMENTS_FROM_PERSONAL_LIST', () => {
      const documentIds = ['doc-1', 'doc-2'];
      documentListActions.removeOriginalDocumentsFromPersonalList(documentIds)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_ORIGINAL_DOCUMENTS_FROM_PERSONAL_LIST',
        payload: { documentIds },
      });
    });
  });

  describe('removeOriginalDocumentsFromFavoriteList', () => {
    it('should dispatch REMOVE_ORIGINAL_DOCUMENTS_FROM_FAVORITE_LIST', () => {
      const documentIds = ['doc-1', 'doc-2'];
      documentListActions.removeOriginalDocumentsFromFavoriteList(documentIds)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_ORIGINAL_DOCUMENTS_FROM_FAVORITE_LIST',
        payload: { documentIds },
      });
    });
  });

  describe('removeOriginalDocumentsFromTeamList', () => {
    it('should dispatch REMOVE_ORIGINAL_DOCUMENTS_FROM_TEAM_LIST with teamId', () => {
      const documentIds = ['doc-1', 'doc-2'];
      const teamId = 'team-123';
      documentListActions.removeOriginalDocumentsFromTeamList(documentIds, teamId)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_ORIGINAL_DOCUMENTS_FROM_TEAM_LIST',
        payload: { documentIds, teamId },
      });
    });
  });

  describe('removeOriginalDocumentsFromOrgList', () => {
    it('should dispatch REMOVE_ORIGINAL_DOCUMENTS_FROM_ORG_LIST with orgId', () => {
      const documentIds = ['doc-1', 'doc-2'];
      const orgId = 'org-123';
      documentListActions.removeOriginalDocumentsFromOrgList(documentIds, orgId)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_ORIGINAL_DOCUMENTS_FROM_ORG_LIST',
        payload: { documentIds, orgId },
      });
    });
  });

  describe('removeAllDocumentsByTeamId', () => {
    it('should dispatch REMOVE_ALL_DOCUMENTS_BY_TEAM_ID', () => {
      const teamId = 'team-123';
      documentListActions.removeAllDocumentsByTeamId(teamId)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_ALL_DOCUMENTS_BY_TEAM_ID',
        payload: { teamId },
      });
    });
  });

  describe('setDocumentLoading', () => {
    it('should dispatch SET_LOADING_DOCUMENTS', () => {
      documentListActions.setDocumentLoading({ currentFolderType: 'personal', loading: true })(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_LOADING_DOCUMENTS',
        payload: { folder: 'personal', loading: true },
      });
    });
  });

  describe('setSystemDocument', () => {
    it('should dispatch SET_SYSTEM_DOCUMENTS with correct payload', () => {
      const params = {
        newCommonDocuments: [{ id: 'doc-1' }],
        ownedRule: 'all',
        modifiedRule: 'recent',
        docList: [{ id: 'doc-1' }],
      };
      documentListActions.setSystemDocument(params)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_SYSTEM_DOCUMENTS',
        payload: {
          commonDocuments: params.newCommonDocuments,
          particularDocuments: {
            [params.modifiedRule]: {
              [params.ownedRule]: params.docList,
            },
          },
        },
      });
    });
  });

  describe('setPersonalDocuments', () => {
    it('should dispatch SET_PERSONAL_DOCUMENTS with correct payload', () => {
      const params = {
        newCommonDocuments: [{ id: 'doc-1' }],
        ownedRule: 'mine',
        modifiedRule: 'week',
        docList: [{ id: 'doc-1' }],
      };
      documentListActions.setPersonalDocuments(params)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_PERSONAL_DOCUMENTS',
        payload: {
          commonDocuments: params.newCommonDocuments,
          particularDocuments: {
            [params.modifiedRule]: {
              [params.ownedRule]: params.docList,
            },
          },
        },
      });
    });
  });

  describe('setTeamDocuments', () => {
    it('should dispatch SET_TEAM_DOCUMENTS with teamId', () => {
      const params = {
        teamId: 'team-123',
        newCommonDocuments: [{ id: 'doc-1' }],
        ownedRule: 'all',
        modifiedRule: 'recent',
        docList: [{ id: 'doc-1' }],
      };
      documentListActions.setTeamDocuments(params)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_TEAM_DOCUMENTS',
        payload: {
          teamId: params.teamId,
          updatedCommonDocuments: params.newCommonDocuments,
          updatedParticularDocuments: {
            [params.modifiedRule]: {
              [params.ownedRule]: params.docList,
            },
          },
        },
      });
    });
  });

  describe('setOrgDocuments', () => {
    it('should dispatch SET_ORGANIZATION_DOCUMENTS with orgId', () => {
      const params = {
        orgId: 'org-123',
        newCommonDocuments: [{ id: 'doc-1' }],
        ownedRule: 'all',
        modifiedRule: 'recent',
        docList: [{ id: 'doc-1' }],
      };
      documentListActions.setOrgDocuments(params)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_ORGANIZATION_DOCUMENTS',
        payload: {
          orgId: params.orgId,
          updatedCommonDocuments: params.newCommonDocuments,
          updatedParticularDocuments: {
            [params.modifiedRule]: {
              [params.ownedRule]: params.docList,
            },
          },
        },
      });
    });
  });

  describe('setFavoriteDocuments', () => {
    it('should dispatch SET_FAVORITE_DOCUMENTS', () => {
      const params = {
        newCommonDocuments: [{ id: 'doc-1' }],
        ownedRule: 'all',
        modifiedRule: 'recent',
        docList: [{ id: 'doc-1' }],
      };
      documentListActions.setFavoriteDocuments(params)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_FAVORITE_DOCUMENTS',
        payload: {
          commonDocuments: params.newCommonDocuments,
          particularDocuments: {
            [params.modifiedRule]: {
              [params.ownedRule]: params.docList,
            },
          },
        },
      });
    });
  });

  describe('setSharedDocuments', () => {
    it('should dispatch SET_SHARED_DOCUMENTS', () => {
      const params = {
        newCommonDocuments: [{ id: 'doc-1' }],
        ownedRule: 'all',
        modifiedRule: 'recent',
        docList: [{ id: 'doc-1' }],
      };
      documentListActions.setSharedDocuments(params)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_SHARED_DOCUMENTS',
        payload: {
          commonDocuments: params.newCommonDocuments,
          particularDocuments: {
            [params.modifiedRule]: {
              [params.ownedRule]: params.docList,
            },
          },
        },
      });
    });
  });

  describe('refreshFetchingState', () => {
    it('should dispatch RESET_FETCHING_STATE', () => {
      documentListActions.refreshFetchingState()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'RESET_FETCHING_STATE',
      });
    });
  });

  describe('refetchCurrentDocListState', () => {
    it('should dispatch RESET_FETCHING_CURRENT_DOCLIST', () => {
      documentListActions.refetchCurrentDocListState({ currentFolderType: 'personal', refId: 'ref-123' })(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'RESET_FETCHING_CURRENT_DOCLIST',
        payload: { currentFolderType: 'personal', refId: 'ref-123' },
      });
    });
  });

  describe('setTotalPersonalDocs', () => {
    it('should dispatch SET_TOTAL_PERSONAL_DOCS', () => {
      const params = { ownedRule: 'mine', modifiedRule: 'week', totalDocuments: 100 };
      documentListActions.setTotalPersonalDocs(params)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_TOTAL_PERSONAL_DOCS',
        payload: {
          particularDocuments: {
            [params.modifiedRule]: {
              [params.ownedRule]: { totalDocuments: 100 },
            },
          },
        },
      });
    });
  });

  describe('setTeamTotalDocs', () => {
    it('should dispatch SET_TOTAL_TEAM_DOCS with teamId', () => {
      const params = { teamId: 'team-123', ownedRule: 'all', modifiedRule: 'recent', totalDocuments: 50 };
      documentListActions.setTeamTotalDocs(params)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_TOTAL_TEAM_DOCS',
        payload: {
          teamId: 'team-123',
          particularDocuments: {
            [params.modifiedRule]: {
              [params.ownedRule]: { totalDocuments: 50 },
            },
          },
        },
      });
    });
  });

  describe('setOrgTotalDocs', () => {
    it('should dispatch SET_TOTAL_ORG_DOCS with orgId', () => {
      const params = { orgId: 'org-123', ownedRule: 'all', modifiedRule: 'recent', totalDocuments: 75 };
      documentListActions.setOrgTotalDocs(params)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_TOTAL_ORG_DOCS',
        payload: {
          orgId: 'org-123',
          particularDocuments: {
            [params.modifiedRule]: {
              [params.ownedRule]: { totalDocuments: 75 },
            },
          },
        },
      });
    });
  });

  describe('setTotalSharedDocs', () => {
    it('should dispatch SET_TOTAL_SHARED_DOCS', () => {
      const params = { ownedRule: 'all', modifiedRule: 'recent', totalDocuments: 30 };
      documentListActions.setTotalSharedDocs(params)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_TOTAL_SHARED_DOCS',
        payload: {
          particularDocuments: {
            [params.modifiedRule]: {
              [params.ownedRule]: { totalDocuments: 30 },
            },
          },
        },
      });
    });
  });

  describe('removeNewUploadDot', () => {
    it('should dispatch REMOVE_NEW_UPLOAD_DOT', () => {
      const documentId = 'doc-123';
      documentListActions.removeNewUploadDot(documentId)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_NEW_UPLOAD_DOT',
        payload: { documentId },
      });
    });
  });

  describe('removeSharedDocs', () => {
    it('should dispatch REMOVE_SHARED_DOCUMENTS', () => {
      const documentIds = ['doc-1', 'doc-2'];
      documentListActions.removeSharedDocs(documentIds)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'REMOVE_SHARED_DOCUMENTS',
        payload: { documentIds },
      });
    });
  });

  describe('resetDocumentList', () => {
    it('should dispatch RESET_DOCUMENT_LIST', () => {
      documentListActions.resetDocumentList()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'RESET_DOCUMENT_LIST',
      });
    });
  });

  describe('setHighlightFoundDocument', () => {
    it('should dispatch SET_HIGHLIGHT_FOUND_DOCUMENT', () => {
      documentListActions.setHighlightFoundDocument({ documentId: 'doc-123', highlight: true })(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_HIGHLIGHT_FOUND_DOCUMENT',
        payload: { documentId: 'doc-123', highlight: true },
      });
    });
  });

  describe('setFoundDocumentScrolling', () => {
    it('should dispatch SET_FOUND_DOCUMENT_SCROLLING', () => {
      documentListActions.setFoundDocumentScrolling({ folderType: 'personal', loading: true })(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: 'SET_FOUND_DOCUMENT_SCROLLING',
        payload: { folderType: 'personal', loading: true },
      });
    });
  });
});

