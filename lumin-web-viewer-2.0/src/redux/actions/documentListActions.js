// ----------------------------- Dev by Lumin --------------------------------
export const pushDocumentToSystemList = (document) => (dispatch) => {
  dispatch({
    type: 'PUSH_DOCUMENT_TO_SYSTEM_LIST',
    payload: {
      document,
    },
  });
};

export const pushDocumentToPersonalList = (document) => (dispatch) => {
  dispatch({
    type: 'PUSH_DOCUMENT_TO_PERSONALS_LIST',
    payload: {
      document,
    },
  });
};

export const pushDocumentToSharedList = (document) => (dispatch) => {
  dispatch({
    type: 'PUSH_DOCUMENT_TO_SHARED_LIST',
    payload: {
      document,
    },
  });
};

export const pushDocumentToTeamList = (document, teamId) => (dispatch) => {
  dispatch({
    type: 'PUSH_DOCUMENT_TO_TEAM_LIST',
    payload: {
      document,
      teamId,
    },
  });
};

export const pushDocumentToFavoriteList = (document) => (dispatch) => {
  dispatch({
    type: 'PUSH_DOCUMENT_TO_FAVORITE_LIST',
    payload: {
      document,
    },
  });
};

export const pushDocumentToOrganizationList = (document, orgId) => (dispatch) => {
  dispatch({
    type: 'PUSH_DOCUMENT_TO_ORGANIZATION_LIST',
    payload: {
      document,
      orgId,
    },
  });
};

export const updateDocumentSystem = (document) => (dispatch) => {
  dispatch({
    type: 'UPDATE_DOCUMENT_SYSTEM_INFO',
    payload: {
      document,
    },
  });
};

export const updateDocumentPersonal = (document) => (dispatch) => {
  dispatch({
    type: 'UPDATE_DOCUMENT_PERSONAL_INFO',
    payload: {
      document,
    },
  });
};

export const updateSharedDocument = (document) => (dispatch) => {
  dispatch({
    type: 'UPDATE_DOCUMENT_SHARED_INFO',
    payload: {
      document,
    },
  });
};

export const updateDocumentTeam = (document) => (dispatch) => {
  dispatch({
    type: 'UPDATE_DOCUMENT_TEAM_INFO',
    payload: {
      document,
    },
  });
};

export const updateDocumentFavorite = (document) => (dispatch) => {
  dispatch({
    type: 'UPDATE_DOCUMENT_FAVORITE_INFO',
    payload: {
      document,
    },
  });
};

export const updateDocumentOrganization = (document) => (dispatch) => {
  dispatch({
    type: 'UPDATE_DOCUMENT_ORGANIZATION_INFO',
    payload: {
      document,
    },
  });
};

export const removeDocumentFromSystemList = (document) => (dispatch) => {
  dispatch({
    type: 'REMOVE_DOCUMENT_FROM_SYSTEM_LIST',
    payload: {
      document,
    },
  });
};

export const removeDocumentFromPersonalList = (document) => (dispatch) => {
  dispatch({
    type: 'REMOVE_DOCUMENT_FROM_PERSONAL_LIST',
    payload: {
      document,
    },
  });
};

export const removeDocumentFromTeamList = (document, teamId) => (dispatch) => {
  dispatch({
    type: 'REMOVE_DOCUMENT_FROM_TEAM_LIST',
    payload: {
      document,
      teamId,
    },
  });
};

export const removeDocumentFromFavoriteList = (document) => (dispatch) => {
  dispatch({
    type: 'REMOVE_DOCUMENT_FROM_FAVORITE_LIST',
    payload: {
      document,
    },
  });
};

export const removeDocumentFromOrganizationList = (document) => (dispatch) => {
  dispatch({
    type: 'REMOVE_DOCUMENT_FROM_ORGANIZATION_LIST',
    payload: {
      document,
    },
  });
};

export const removeOriginalDocumentsFromPersonalList = (documentIds) => (dispatch) => {
  dispatch({
    type: 'REMOVE_ORIGINAL_DOCUMENTS_FROM_PERSONAL_LIST',
    payload: {
      documentIds,
    },
  });
};

export const removeOriginalDocumentsFromFavoriteList = (documentIds) => (dispatch) => {
  dispatch({
    type: 'REMOVE_ORIGINAL_DOCUMENTS_FROM_FAVORITE_LIST',
    payload: {
      documentIds,
    },
  });
};

export const removeOriginalDocumentsFromTeamList = (documentIds, teamId) => (dispatch) => {
  dispatch({
    type: 'REMOVE_ORIGINAL_DOCUMENTS_FROM_TEAM_LIST',
    payload: {
      documentIds,
      teamId,
    },
  });
};

export const removeOriginalDocumentsFromOrgList = (documentIds, orgId) => (dispatch) => {
  dispatch({
    type: 'REMOVE_ORIGINAL_DOCUMENTS_FROM_ORG_LIST',
    payload: {
      documentIds,
      orgId,
    },
  });
};

export const removeAllDocumentsByTeamId = (teamId) => (dispatch) => {
  dispatch({
    type: 'REMOVE_ALL_DOCUMENTS_BY_TEAM_ID',
    payload: {
      teamId,
    },
  });
};

export const setDocumentLoading = ({ currentFolderType, loading }) => (dispatch) => {
  dispatch({
    type: 'SET_LOADING_DOCUMENTS',
    payload: {
      folder: currentFolderType,
      loading,
    },
  });
};

export const setSystemDocument = ({
  newCommonDocuments, ownedRule, modifiedRule, docList,
}) => (dispatch) => {
  dispatch({
    type: 'SET_SYSTEM_DOCUMENTS',
    payload: {
      commonDocuments: newCommonDocuments,
      particularDocuments: {
        [modifiedRule]: {
          [ownedRule]: docList,
        },
      },
    },
  });
};

export const setPersonalDocuments = ({
  newCommonDocuments, ownedRule, modifiedRule, docList,
}) => (dispatch) => {
  dispatch({
    type: 'SET_PERSONAL_DOCUMENTS',
    payload: {
      commonDocuments: newCommonDocuments,
      particularDocuments: {
        [modifiedRule]: {
          [ownedRule]: docList,
        },
      },
    },
  });
};

export const setTeamDocuments = ({
  teamId, newCommonDocuments, ownedRule, modifiedRule, docList,
}) => (dispatch) => {
  dispatch({
    type: 'SET_TEAM_DOCUMENTS',
    payload: {
      teamId,
      updatedCommonDocuments: newCommonDocuments,
      updatedParticularDocuments: {
        [modifiedRule]: {
          [ownedRule]: docList,
        },
      },
    },
  });
};

export const setOrgDocuments = ({
  orgId, newCommonDocuments, ownedRule, modifiedRule, docList,
}) => (dispatch) => {
  dispatch({
    type: 'SET_ORGANIZATION_DOCUMENTS',
    payload: {
      orgId,
      updatedCommonDocuments: newCommonDocuments,
      updatedParticularDocuments: {
        [modifiedRule]: {
          [ownedRule]: docList,
        },
      },
    },
  });
};

export const setFavoriteDocuments = ({
  newCommonDocuments, ownedRule, modifiedRule, docList,
}) => (dispatch) => {
  dispatch({
    type: 'SET_FAVORITE_DOCUMENTS',
    payload: {
      commonDocuments: newCommonDocuments,
      particularDocuments: {
        [modifiedRule]: {
          [ownedRule]: docList,
        },
      },
    },
  });
};

export const setSharedDocuments = ({
  newCommonDocuments, ownedRule, modifiedRule, docList,
}) => (dispatch) => {
  dispatch({
    type: 'SET_SHARED_DOCUMENTS',
    payload: {
      commonDocuments: newCommonDocuments,
      particularDocuments: {
        [modifiedRule]: {
          [ownedRule]: docList,
        },
      },
    },
  });
};

export const refreshFetchingState = () => (dispatch) => {
  dispatch({
    type: 'RESET_FETCHING_STATE',
  });
};

export const refetchCurrentDocListState = ({ currentFolderType, refId }) => (dispatch) => {
  dispatch({
    type: 'RESET_FETCHING_CURRENT_DOCLIST',
    payload: {
      currentFolderType,
      refId,
    },
  });
};

export const setTotalPersonalDocs = ({
  ownedRule, modifiedRule, totalDocuments,
}) => (dispatch) => {
  dispatch({
    type: 'SET_TOTAL_PERSONAL_DOCS',
    payload: {
      particularDocuments: {
        [modifiedRule]: {
          [ownedRule]: {
            totalDocuments,
          },
        },
      },
    },
  });
};

export const setTeamTotalDocs = ({
  teamId, ownedRule, modifiedRule, totalDocuments,
}) => (dispatch) => {
  dispatch({
    type: 'SET_TOTAL_TEAM_DOCS',
    payload: {
      teamId,
      particularDocuments: {
        [modifiedRule]: {
          [ownedRule]: {
            totalDocuments,
          },
        },
      },
    },
  });
};

export const setOrgTotalDocs = ({
  orgId, ownedRule, modifiedRule, totalDocuments,
}) => (dispatch) => {
  dispatch({
    type: 'SET_TOTAL_ORG_DOCS',
    payload: {
      orgId,
      particularDocuments: {
        [modifiedRule]: {
          [ownedRule]: {
            totalDocuments,
          },
        },
      },
    },
  });
};

export const setTotalSharedDocs = ({
  ownedRule, modifiedRule, totalDocuments,
}) => (dispatch) => {
  dispatch({
    type: 'SET_TOTAL_SHARED_DOCS',
    payload: {
      particularDocuments: {
        [modifiedRule]: {
          [ownedRule]: {
            totalDocuments,
          },
        },
      },
    },
  });
};

export const removeNewUploadDot = (documentId) => (dispatch) => {
  dispatch({
    type: 'REMOVE_NEW_UPLOAD_DOT',
    payload: {
      documentId,
    },
  });
};

export const removeSharedDocs = (documentIds) => (dispatch) => {
  dispatch({
    type: 'REMOVE_SHARED_DOCUMENTS',
    payload: {
      documentIds,
    },
  });
};

export const resetDocumentList = () => (dispatch) => {
  dispatch({
    type: 'RESET_DOCUMENT_LIST',
  });
};

export const setHighlightFoundDocument =
  ({ documentId, highlight }) =>
  (dispatch) => {
    dispatch({
      type: 'SET_HIGHLIGHT_FOUND_DOCUMENT',
      payload: {
        documentId,
        highlight,
      },
    });
  };

export const setFoundDocumentScrolling =
  ({ folderType, loading }) =>
  (dispatch) => {
    dispatch({
      type: 'SET_FOUND_DOCUMENT_SCROLLING',
      payload: {
        folderType,
        loading,
      },
    });
  };
