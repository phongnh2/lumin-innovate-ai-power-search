// ------------------------------ Dev by Lumin -----------------------------
import produce from 'immer';
import { isArray, merge, mergeWith } from 'lodash';

import initialDocumentListState from 'src/redux/states/initialDocumentListState';

import { folderType } from 'constants/documentConstants';

const customizer = (objValue, srcValue) => {
  if (isArray(objValue)) {
    return srcValue;
  }

  return undefined;
};

function removeDocumentIdInParticular(particularDocuments, documentId) {
  Object.entries(particularDocuments).forEach(([modifiedRule, groups]) => {
    Object.entries(groups).forEach(([ownedRule]) => {
      const particularDocListObject = particularDocuments[modifiedRule][ownedRule];
      const currentDoclist = particularDocListObject.documents;
      const index = currentDoclist.indexOf(documentId);
      if (index !== -1) {
        currentDoclist.splice(index, 1);
        const { totalDocuments } = particularDocListObject;
        if (typeof totalDocuments === 'number') {
          particularDocListObject.totalDocuments--;
        }
      }
    });
  });
}

function removeOriginalDocumentIds(commonDocuments, particularDocuments, documentIds = []) {
  Object.entries(particularDocuments).forEach(([modifiedRule, groups]) => {
    Object.entries(groups).forEach(([ownedRule]) => {
      const particularDocListObject = particularDocuments[modifiedRule][ownedRule];
      const currentParticularDoclist = particularDocListObject.documents;
      const oldLength = currentParticularDoclist.length;
      particularDocListObject.documents = currentParticularDoclist.filter((id) => !documentIds.includes(id));
      particularDocListObject.shouldRefetch = Boolean(!particularDocListObject.documents.length);
      Object.entries(commonDocuments).forEach(([key]) => {
        if (documentIds.includes(key)) {
          delete commonDocuments[key];
        }
      });
      const { totalDocuments, documents: newDocumentList } = particularDocListObject;
      const removedDocsLength = oldLength - newDocumentList.length;
      if (removedDocsLength && totalDocuments > 0) {
        particularDocListObject.totalDocuments -= removedDocsLength;
      }
    });
  });
}

function removeParticularDocuments(particularDocuments) {
  const removedDocumentIds = new Set();
  Object.keys(particularDocuments).forEach((modifiedRule) => {
    Object.keys(particularDocuments[modifiedRule]).forEach((ownedRule) => {
      const currentTeamDocumentIds = particularDocuments[modifiedRule][ownedRule].documents || [];
      currentTeamDocumentIds.forEach((documentId) => removedDocumentIds.add(documentId));
      particularDocuments[modifiedRule][ownedRule] = {
        shouldRefetch: false,
      };
    });
  });
  return [...removedDocumentIds];
}

function removeCommonDocumentsByIds(commonDocuments, documentIds) {
  documentIds.forEach((documentId) => {
    const commonDocumentIds = Object.keys(commonDocuments);
    if (commonDocumentIds.includes(documentId)) {
      delete commonDocuments[documentId];
    }
  });
}

export default (initialState) =>
  // eslint-disable-next-line sonarjs/cognitive-complexity, default-param-last
  (state = initialState, action) => {
    const { type, payload } = action;
    const folderBasedOnTypes = {
      SET_SYSTEM_DOCUMENTS: folderType.DEVICE,
      PUSH_DOCUMENT_TO_SYSTEM_LIST: folderType.DEVICE,
      UPDATE_DOCUMENT_SYSTEM_INFO: folderType.DEVICE,
      REMOVE_DOCUMENT_FROM_SYSTEM_LIST: folderType.DEVICE,
      SET_PERSONAL_DOCUMENTS: folderType.INDIVIDUAL,
      PUSH_DOCUMENT_TO_PERSONALS_LIST: folderType.INDIVIDUAL,
      UPDATE_DOCUMENT_PERSONAL_INFO: folderType.INDIVIDUAL,
      REMOVE_DOCUMENT_FROM_PERSONAL_LIST: folderType.INDIVIDUAL,
      REMOVE_ORIGINAL_DOCUMENTS_FROM_PERSONAL_LIST: folderType.INDIVIDUAL,
      SET_FAVORITE_DOCUMENTS: folderType.STARRED,
      PUSH_DOCUMENT_TO_FAVORITE_LIST: folderType.STARRED,
      UPDATE_DOCUMENT_FAVORITE_INFO: folderType.STARRED,
      REMOVE_DOCUMENT_FROM_FAVORITE_LIST: folderType.STARRED,
      REMOVE_ORIGINAL_DOCUMENTS_FROM_FAVORITE_LIST: folderType.STARRED,
      SET_SHARED_DOCUMENTS: folderType.SHARED,
      REMOVE_SHARED_DOCUMENTS: folderType.SHARED,
      UPDATE_DOCUMENT_SHARED_INFO: folderType.SHARED,
      PUSH_DOCUMENT_TO_SHARED_LIST: folderType.SHARED,
    };
    switch (type) {
      case 'SET_SYSTEM_DOCUMENTS':
      case 'SET_PERSONAL_DOCUMENTS':
      case 'SET_SHARED_DOCUMENTS':
      case 'SET_FAVORITE_DOCUMENTS':
        return produce(state, (draftState) => {
          const folderList = draftState[folderBasedOnTypes[type]];
          folderList.commonDocuments = payload.commonDocuments;
          folderList.particularDocuments = merge({}, folderList.particularDocuments, payload.particularDocuments);
        });
      case 'SET_TEAM_DOCUMENTS': {
        const { teamId, updatedCommonDocuments, updatedParticularDocuments } = payload;
        return produce(state, (draftState) => {
          const teamDocuments = draftState[folderType.TEAMS];
          teamDocuments.commonDocuments = updatedCommonDocuments;
          const { particularDocuments } = teamDocuments;
          // Set particular documents for team
          particularDocuments[teamId] || (particularDocuments[teamId] = {});
          particularDocuments[teamId] = merge({}, particularDocuments[teamId], updatedParticularDocuments);
        });
      }
      case 'SET_ORGANIZATION_DOCUMENTS': {
        const { orgId, updatedCommonDocuments, updatedParticularDocuments } = payload;
        return produce(state, (draftState) => {
          const orgDocuments = draftState[folderType.ORGANIZATION];
          orgDocuments.commonDocuments = updatedCommonDocuments;
          const { particularDocuments } = orgDocuments;
          // Set particular documents for organization
          particularDocuments[orgId] || (particularDocuments[orgId] = {});
          particularDocuments[orgId] = merge({}, particularDocuments[orgId], updatedParticularDocuments);
        });
      }
      case 'PUSH_DOCUMENT_TO_SHARED_LIST':
      case 'PUSH_DOCUMENT_TO_PERSONALS_LIST':
      case 'PUSH_DOCUMENT_TO_SYSTEM_LIST':
      case 'PUSH_DOCUMENT_TO_FAVORITE_LIST': {
        return produce(state, (draftState) => {
          const folderList = draftState[folderBasedOnTypes[type]];
          Object.entries(folderList.particularDocuments || {}).forEach(([modifiedRule, groups]) => {
            Object.entries(groups).forEach(([ownedRule, { insertRule = () => {} }]) => {
              if (insertRule(payload.document)) {
                folderList.commonDocuments[payload.document._id] = payload.document;
                const particularDocListObject = folderList.particularDocuments[modifiedRule][ownedRule];
                if (particularDocListObject.documents.indexOf(payload.document._id) === -1) {
                  particularDocListObject.documents.unshift(payload.document._id);
                  particularDocListObject.shouldRefetch = false;
                }
                const { totalDocuments } = particularDocListObject;
                if (folderBasedOnTypes[type] && typeof totalDocuments === 'number') {
                  particularDocListObject.totalDocuments++;
                }
              }
            });
          });
        });
      }
      case 'PUSH_DOCUMENT_TO_TEAM_LIST': {
        const { teamId, document } = payload;
        return produce(state, (draftState) => {
          const currentTeamDocumentList = draftState[folderType.TEAMS];
          const { commonDocuments, particularDocuments } = currentTeamDocumentList;
          const currentTeamParticularDocuments = particularDocuments[teamId] || {};
          Object.entries(currentTeamParticularDocuments).forEach(([modifiedRule, groups]) => {
            Object.entries(groups).forEach(([ownedRule, { insertRule = () => {} }]) => {
              // Push document to appropriate particular document list
              if (insertRule(document)) {
                commonDocuments[document._id] = document;
                const particularDocListObject = currentTeamParticularDocuments[modifiedRule][ownedRule];
                particularDocListObject.documents.unshift(document._id);
                const { totalDocuments } = particularDocListObject;
                if (typeof totalDocuments === 'number') {
                  particularDocListObject.totalDocuments++;
                }
              }
            });
          });
        });
      }
      case 'PUSH_DOCUMENT_TO_ORGANIZATION_LIST': {
        const { orgId, document } = payload;
        return produce(state, (draftState) => {
          const currentOrgDocumentList = draftState[folderType.ORGANIZATION];
          const { commonDocuments, particularDocuments } = currentOrgDocumentList;
          const currentOrgParticularDocuments = particularDocuments[orgId] || {};
          Object.entries(currentOrgParticularDocuments).forEach(([modifiedRule, groups]) => {
            Object.entries(groups).forEach(([ownedRule, { insertRule = () => {} }]) => {
              // Push document to appropriate particular document list
              if (insertRule(document)) {
                commonDocuments[document._id] = document;
                const particularDocListObject = currentOrgParticularDocuments[modifiedRule][ownedRule];
                particularDocListObject.documents.unshift(document._id);
                const { totalDocuments } = particularDocListObject;
                if (typeof totalDocuments === 'number') {
                  particularDocListObject.totalDocuments++;
                }
              }
            });
          });
        });
      }
      case 'UPDATE_DOCUMENT_SYSTEM_INFO':
      case 'UPDATE_DOCUMENT_PERSONAL_INFO':
      case 'UPDATE_DOCUMENT_FAVORITE_INFO':
      case 'UPDATE_DOCUMENT_SHARED_INFO': {
        return produce(state, (draftState) => {
          const folderList = draftState[folderBasedOnTypes[type]];
          folderList.commonDocuments[payload.document._id] = {
            ...folderList.commonDocuments[payload.document._id],
            ...payload.document,
          };
        });
      }
      case 'UPDATE_DOCUMENT_TEAM_INFO': {
        const { document } = payload;
        const { _id: documentId } = document;
        return produce(state, (draftState) => {
          const targetDocument = draftState[folderType.TEAMS].commonDocuments[documentId];
          draftState[folderType.TEAMS].commonDocuments[documentId] = mergeWith(
            {},
            targetDocument,
            document,
            customizer
          );
          draftState[folderType.TEAMS].commonDocuments[documentId].listUserStar = document.listUserStar;
        });
      }
      case 'UPDATE_DOCUMENT_ORGANIZATION_INFO': {
        const { document } = payload;
        const { _id: documentId } = document;
        return produce(state, (draftState) => {
          const targetDocument = draftState[folderType.ORGANIZATION].commonDocuments[documentId];
          draftState[folderType.ORGANIZATION].commonDocuments[documentId] = mergeWith(
            {},
            targetDocument,
            document,
            customizer
          );
          draftState[folderType.ORGANIZATION].commonDocuments[documentId].listUserStar = document.listUserStar;
        });
      }
      case 'REMOVE_DOCUMENT_FROM_SYSTEM_LIST':
      case 'REMOVE_DOCUMENT_FROM_PERSONAL_LIST':
      case 'REMOVE_DOCUMENT_FROM_FAVORITE_LIST': {
        const {
          document: { _id: documentId },
        } = payload;
        return produce(state, (draftState) => {
          const folderList = draftState[folderBasedOnTypes[type]];
          delete folderList.commonDocuments[documentId];
          removeDocumentIdInParticular(folderList.particularDocuments, documentId);
        });
      }
      case 'REMOVE_DOCUMENT_FROM_TEAM_LIST': {
        const {
          document: { _id: documentId },
          teamId,
        } = payload;
        return produce(state, (draftState) => {
          const currentTeamDocumentList = draftState[folderType.TEAMS];
          const { commonDocuments } = currentTeamDocumentList;
          delete commonDocuments[documentId];
          removeDocumentIdInParticular(currentTeamDocumentList.particularDocuments[teamId], documentId);
        });
      }
      case 'REMOVE_DOCUMENT_FROM_ORGANIZATION_LIST': {
        const {
          document: { _id: documentId, clientId: orgId },
        } = payload;
        return produce(state, (draftState) => {
          const currentOrgDocumentList = draftState[folderType.ORGANIZATION];
          const { commonDocuments } = currentOrgDocumentList;
          delete commonDocuments[documentId];
          removeDocumentIdInParticular(currentOrgDocumentList.particularDocuments[orgId], documentId);
        });
      }
      case 'REMOVE_SHARED_DOCUMENTS':
      case 'REMOVE_ORIGINAL_DOCUMENTS_FROM_PERSONAL_LIST':
      case 'REMOVE_ORIGINAL_DOCUMENTS_FROM_FAVORITE_LIST': {
        const { documentIds } = payload;
        return produce(state, (draftState) => {
          const currentPersonalDocumentList = draftState[folderBasedOnTypes[type]];
          const { commonDocuments, particularDocuments } = currentPersonalDocumentList;
          removeOriginalDocumentIds(commonDocuments, particularDocuments, documentIds);
        });
      }
      case 'REMOVE_ORIGINAL_DOCUMENTS_FROM_TEAM_LIST': {
        const { documentIds, teamId } = payload;
        return produce(state, (draftState) => {
          const currentPersonalDocumentList = draftState[folderType.TEAMS];
          const { commonDocuments, particularDocuments } = currentPersonalDocumentList;
          removeOriginalDocumentIds(commonDocuments, particularDocuments[teamId], documentIds);
        });
      }
      case 'REMOVE_ORIGINAL_DOCUMENTS_FROM_ORG_LIST': {
        const { documentIds, orgId } = payload;
        return produce(state, (draftState) => {
          const currentPersonalDocumentList = draftState[folderType.ORGANIZATION];
          const { commonDocuments, particularDocuments } = currentPersonalDocumentList;
          removeOriginalDocumentIds(commonDocuments, particularDocuments[orgId], documentIds);
        });
      }
      case 'REMOVE_ALL_DOCUMENTS_BY_TEAM_ID': {
        const { teamId } = payload;
        return produce(state, (draftState) => {
          let removedDocumentIds = [];
          const currentTeamDocumentList = draftState[folderType.TEAMS];
          const { commonDocuments, particularDocuments } = currentTeamDocumentList;
          const particularTeamDocuments = particularDocuments[teamId];
          if (particularTeamDocuments) {
            removedDocumentIds = removeParticularDocuments(particularTeamDocuments);
          }
          removeCommonDocumentsByIds(commonDocuments, removedDocumentIds);
        });
      }
      case 'RESET_FETCHING_STATE': {
        return {
          ...state,
          ...initialDocumentListState,
        };
      }

      case 'RESET_FETCHING_CURRENT_DOCLIST': {
        const { currentFolderType, refId } = payload;
        const isPersonalDocumentState = [folderType.INDIVIDUAL, folderType.STARRED, folderType.SHARED].includes(
          currentFolderType
        );
        const currentDocuments = isPersonalDocumentState
          ? state[currentFolderType].particularDocuments
          : state[currentFolderType].particularDocuments[refId];
        const particularUpdateState = {};

        if (currentDocuments) {
          Object.keys(currentDocuments).forEach((modifiedRule) => {
            particularUpdateState[modifiedRule] = {};
            Object.keys(currentDocuments[modifiedRule]).forEach((ownedRule) => {
              particularUpdateState[modifiedRule][ownedRule] = {
                documents: [],
                hasNextPage: false,
                cursor: '',
                firstFetching: true,
                shouldRefetch: true,
              };
            });
          });
        }
        return {
          ...state,
          [currentFolderType]: {
            commonDocuments: {},
            particularDocuments: {},
          },
        };
      }

      case 'SET_LOADING_DOCUMENTS': {
        const { folder, loading } = payload;
        return {
          ...state,
          [folder]: {
            ...state[folder],
            loading,
          },
        };
      }
      case 'SET_TOTAL_PERSONAL_DOCS': {
        const { particularDocuments: updatedParticularDocuments } = payload;
        return produce(state, (draftState) => {
          const personalDocuments = draftState[folderType.INDIVIDUAL];
          personalDocuments.particularDocuments = merge(
            {},
            personalDocuments.particularDocuments,
            updatedParticularDocuments
          );
        });
      }
      case 'SET_TOTAL_TEAM_DOCS': {
        const { teamId, particularDocuments: updatedParticularDocuments } = payload;
        return produce(state, (draftState) => {
          const teamDocuments = draftState[folderType.TEAMS];
          const { particularDocuments } = teamDocuments;
          // Set particular documents for team
          particularDocuments[teamId] = merge({}, particularDocuments[teamId] || {}, updatedParticularDocuments);
        });
      }
      case 'SET_TOTAL_ORG_DOCS': {
        const { orgId, particularDocuments: updatedParticularDocuments } = payload;
        return produce(state, (draftState) => {
          const orgDocuments = draftState[folderType.ORGANIZATION];
          const { particularDocuments } = orgDocuments;
          // Set particular documents for organization
          particularDocuments[orgId] = merge({}, particularDocuments[orgId] || {}, updatedParticularDocuments);
        });
      }
      case 'SET_TOTAL_SHARED_DOCS': {
        const { particularDocuments: updatedParticularDocuments } = payload;
        return produce(state, (draftState) => {
          const personalDocuments = draftState[folderType.SHARED];
          personalDocuments.particularDocuments = merge(
            {},
            personalDocuments.particularDocuments,
            updatedParticularDocuments
          );
        });
      }
      case 'REMOVE_NEW_UPLOAD_DOT': {
        return produce(state, (draftState) => {
          const { commonDocuments: individualDocuments } = draftState[folderType.INDIVIDUAL];
          const { commonDocuments: teamDocuments } = draftState[folderType.TEAMS];
          const { commonDocuments: orgDocuments } = draftState[folderType.ORGANIZATION];
          const [individualFolder, teamFolder, orgFolder] = [
            Object.values(individualDocuments).find((doc) => doc._id === payload.documentId) &&
              draftState[folderType.INDIVIDUAL],
            Object.values(teamDocuments).find((doc) => doc._id === payload.documentId) && draftState[folderType.TEAMS],
            Object.values(orgDocuments).find((doc) => doc._id === payload.documentId) &&
              draftState[folderType.ORGANIZATION],
          ];
          const folders = individualFolder || teamFolder || orgFolder;

          if (folders) {
            folders.commonDocuments[payload.documentId] = {
              ...folders.commonDocuments[payload.documentId],
              newUpload: false,
            };
          }
        });
      }
      case 'RESET_DOCUMENT_LIST': {
        return initialState;
      }
      case 'SET_HIGHLIGHT_FOUND_DOCUMENT': {
        return produce(state, (draftState) => {
          const { commonDocuments: individualDocuments } = draftState[folderType.INDIVIDUAL];
          const { commonDocuments: teamDocuments } = draftState[folderType.TEAMS];
          const { commonDocuments: orgDocuments } = draftState[folderType.ORGANIZATION];
          const { commonDocuments: sharedDocuments } = draftState[folderType.SHARED];
          const [individualFolder, teamFolder, orgFolder, sharedFolder] = [
            Object.values(individualDocuments).find((doc) => doc._id === payload.documentId) &&
              draftState[folderType.INDIVIDUAL],
            Object.values(teamDocuments).find((doc) => doc._id === payload.documentId) && draftState[folderType.TEAMS],
            Object.values(orgDocuments).find((doc) => doc._id === payload.documentId) &&
              draftState[folderType.ORGANIZATION],
            Object.values(sharedDocuments).find((doc) => doc._id === payload.documentId) &&
              draftState[folderType.SHARED],
          ];
          const folders = individualFolder || teamFolder || orgFolder || sharedFolder;

          if (folders) {
            folders.commonDocuments[payload.documentId] = {
              ...folders.commonDocuments[payload.documentId],
              highlightFoundDocument: payload.highlight,
            };
          }
        });
      }
      case 'SET_FOUND_DOCUMENT_SCROLLING': {
        const { folderType, loading } = payload;
        return {
          ...state,
          [folderType]: {
            ...state[folderType],
            foundDocumentScrolling: loading,
          },
        };
      }

      default:
        return state;
    }
  };
