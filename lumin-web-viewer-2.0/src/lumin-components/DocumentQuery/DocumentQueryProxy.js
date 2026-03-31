import { difference } from 'lodash';

import { store } from 'src/redux/store';

import actions from 'actions';
import selectors from 'selectors';

import { folderType, ownerFilter, modifiedFilter } from 'constants/documentConstants';

const { getState, dispatch } = store;

export const createFilterRule = (modifiedRule, ownedRule) => {
  const currentUser = selectors.getCurrentUser(getState());
  if (!currentUser) {
    return () => false;
  }
  const userId = currentUser._id;
  let modifiedCondition = (document) => !!document;
  let ownedCondition = (document) => !!document;

  if (modifiedRule === modifiedFilter.modifiedByMe) {
    modifiedCondition = (document) => document.lastModifiedBy === userId;
  }
  switch (ownedRule) {
    case ownerFilter.byMe:
      ownedCondition = (document) => document.ownerId === userId;
      break;
    case ownerFilter.notByMe:
      ownedCondition = (document) => document.ownerId !== userId;
      break;
    default:
      break;
  }
  return (document) => modifiedCondition(document) && ownedCondition(document);
};

export const getParticularDocuments = (state, data) => {
  const {
    documentList, currentFolderType, clientId,
  } = data;
  let particularDocuments;
  switch (currentFolderType) {
    case folderType.DEVICE:
    case folderType.INDIVIDUAL:
    case folderType.SHARED:
    case folderType.STARRED:
      particularDocuments = documentList.particularDocuments;
      break;
    case folderType.ORGANIZATION:
    case folderType.TEAMS:
      particularDocuments = documentList.particularDocuments[clientId] || {};
      break;
    default:
  }
  const [ownedRule, modifiedRule] = [
    selectors.getCurrentOwnedFilter(state),
    selectors.getCurrentLastModifiedFilter(state),
  ];
  const group = particularDocuments[modifiedRule] || {};
  return group[ownedRule] || {};
};

export const DocumentQueryProxy = (currentFolderType, metaData) => {
  const {
    teamId, orgId, documents, hasNextPage, cursor, total,
  } = metaData;
  const state = getState();
  const documentList = selectors.getDocumentList(state)[currentFolderType];
  const dispatchAction = {
    [folderType.DEVICE]: (data) => dispatch(actions.setSystemDocument(data)),
    [folderType.INDIVIDUAL]: (data) => dispatch(actions.setPersonalDocuments(data)),
    [folderType.STARRED]: (data) => dispatch(actions.setFavoriteDocuments(data)),
    [folderType.ORGANIZATION]: (data) => dispatch(actions.setOrgDocuments(data)),
    [folderType.TEAMS]: (data) => dispatch(actions.setTeamDocuments(data)),
    [folderType.SHARED]: (data) => dispatch(actions.setSharedDocuments(data)),
  };
  const actionData = {};
  let particularDocuments = {};
  switch (currentFolderType) {
    case folderType.INDIVIDUAL:
    case folderType.SHARED:
    case folderType.STARRED:
      particularDocuments = documentList.particularDocuments;
      break;
    case folderType.ORGANIZATION:
      particularDocuments = documentList.particularDocuments[orgId] || {};
      actionData.orgId = orgId;
      break;
    case folderType.TEAMS:
      particularDocuments = documentList.particularDocuments[teamId] || {};
      actionData.teamId = teamId;
      break;
    default:
  }
  const [ownedRule, modifiedRule] = [
    selectors.getCurrentOwnedFilter(state),
    selectors.getCurrentLastModifiedFilter(state),
  ];
  const newCommonDocuments = documents.reduce((accumulator, document) => ({
    ...accumulator,
    [document._id]: document,
  }), documentList.commonDocuments);

  const group = particularDocuments[modifiedRule] || {};
  const currentDocIds = group[ownedRule]?.documents || [];
  const newDocIds = documents.map((doc) => doc._id);
  const newCurrentDoclist = {
    documents: [...currentDocIds, ...difference(newDocIds, currentDocIds)],
    hasNextPage,
    cursor,
    firstFetching: false,
    shouldRefetch: false,
    insertRule: createFilterRule(modifiedRule, ownedRule),
    totalDocuments: total,
  };
  dispatchAction[currentFolderType]({
    ...actionData,
    newCommonDocuments,
    ownedRule,
    modifiedRule,
    docList: newCurrentDoclist,
  });
};

export const DocumentQueryRetriever = (currentFolderType, { orgId, teamId }) => {
  const state = getState();
  const documentList = selectors.getDocumentList(state)[currentFolderType];
  const { commonDocuments } = documentList;
  const {
    documents = [],
    hasNextPage = false,
    cursor = '',
    firstFetching = true,
    shouldRefetch = false,
  } = getParticularDocuments(state, {
    documentList,
    currentFolderType,
    clientId: orgId || teamId,
  });
  return {
    commonDocuments,
    documents: documents.map((docId) => commonDocuments[docId]).filter(Boolean),
    hasNextPage,
    cursor,
    firstFetching,
    shouldRefetch,
  };
};

export const TotalDocumentsSetter = (currentFolderType, metaData) => {
  const { clientId, totalDocuments } = metaData;
  const dispatchAction = {
    [folderType.INDIVIDUAL]: (data) => dispatch(actions.setTotalPersonalDocs(data)),
    [folderType.TEAMS]: (data) => dispatch(actions.setTeamTotalDocs(data)),
    [folderType.ORGANIZATION]: (data) => dispatch(actions.setOrgTotalDocs(data)),
    [folderType.SHARED]: (data) => dispatch(actions.setTotalSharedDocs(data)),
  };
  const state = getState();
  const [ownedRule, modifiedRule] = [
    selectors.getCurrentOwnedFilter(state),
    selectors.getCurrentLastModifiedFilter(state),
  ];
  const actionData = {
    ownedRule,
    modifiedRule,
  };
  switch (currentFolderType) {
    case folderType.ORGANIZATION:
      actionData.orgId = clientId;
      break;
    case folderType.TEAMS:
      actionData.teamId = clientId;
      break;
    default:
  }
  if (currentFolderType !== folderType.STARRED) {
    dispatchAction[currentFolderType]({
      ...actionData,
      totalDocuments,
    });
  }
};

export const TotalDocumentsRetriever = (currentFolderType, clientId) => {
  const state = getState();
  const documentList = selectors.getDocumentList(state)[currentFolderType];
  const {
    totalDocuments,
  } = getParticularDocuments(state, {
    documentList,
    currentFolderType,
    clientId,
  });
  return totalDocuments;
};
