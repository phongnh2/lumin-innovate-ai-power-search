/* eslint-disable import/no-self-import */
/* eslint-disable import/no-cycle */

import v4 from 'uuid/v4';

import { store } from 'src/redux/store';

import actions from 'actions';
import selectors from 'selectors';

import { DocumentQueryRetriever } from 'luminComponents/DocumentQuery/DocumentQueryProxy';

import { folderType, DocumentRole } from 'constants/documentConstants';
import SubscriptionConstants from 'constants/subscriptionConstant';

const { dispatch } = store;
export default class TeamDocumentObserver {
  constructor() {
    this._id = v4();
  }

  pushDocumentToTeamList = (document, teamId) => dispatch(actions.pushDocumentToTeamList(document, teamId));

  updateDocumentTeam = (document, teamId) => dispatch(actions.updateDocumentTeam(document, teamId));

  removeDocumentFromTeamList = (document, teamId) => dispatch(actions.removeDocumentFromTeamList(document, teamId));

  removeOriginalDocumentsFromTeamList = (documentIds, teamId) =>
    dispatch(actions.removeOriginalDocumentsFromTeamList(documentIds, teamId));

  get Id() {
    return this._id;
  }

  exec = ({ event, data }) => {
    const { document: updatedDocument, documentList: updatedDocumentList = [], teamId, currentUserId } = data;
    const updatedDocumentIds = updatedDocumentList.map((documentData) => documentData.documentId);
    const ownerId = updatedDocument?.ownerId ?? null;
    const state = store.getState();
    const selectedTeam = teamId ? selectors.getTeamById(state, teamId) : null;

    const { commonDocuments } = DocumentQueryRetriever(folderType.TEAMS, { teamId });
    let isExistedDocument;
    if (updatedDocument) {
      isExistedDocument = !!commonDocuments[updatedDocument._id];
    }
    switch (event) {
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_UPLOAD_DOCUMENT_TEAMS:
        // Prevent to add folder document to current root doc list
        if (updatedDocument?.folderId) {
          return;
        }
        updatedDocument.newUpload = true;
        if (currentUserId !== ownerId && selectedTeam?.owner?._id !== currentUserId) {
          updatedDocument.roleOfDocument = DocumentRole.EDITOR;
        }
      // eslint-disable-next-line no-fallthrough
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_MOVE_DOCUMENT:
        if (!isExistedDocument) {
          this.pushDocumentToTeamList(updatedDocument, teamId);
        }
        break;
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_UNDO_MOVE_DOCUMENT:
        if (isExistedDocument) {
          this.removeDocumentFromTeamList(updatedDocument, teamId);
        }
        break;
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_DOCUMENT_TEAMS: {
        const filteredDocumentIds = updatedDocumentIds.filter((documentId) =>
          Object.keys(commonDocuments).includes(documentId)
        );
        if (filteredDocumentIds.length) {
          this.removeOriginalDocumentsFromTeamList(filteredDocumentIds, teamId);
        }
        break;
      }
      case SubscriptionConstants.Subscription.DOCUMENT_NAME_INFO:
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_FAVORITE:
      case SubscriptionConstants.Subscription.DOCUMENT_THUMBNAIL_INFO:
      case SubscriptionConstants.Subscription.DOCUMENT_PRINCIPLE_LIST:
      case SubscriptionConstants.Subscription.DOCUMENT_SETTINGS: {
        if (isExistedDocument) {
          this.updateDocumentTeam(updatedDocument);
        }
        break;
      }
      default:
        break;
    }
  };
}
