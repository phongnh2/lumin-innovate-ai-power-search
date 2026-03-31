/* eslint-disable class-methods-use-this */
/* eslint-disable import/no-self-import */
/* eslint-disable import/no-cycle */

import v4 from 'uuid/v4';

import { store } from 'src/redux/store';

import actions from 'actions';
import selectors from 'selectors';

import { folderType } from 'constants/documentConstants';
import SubscriptionConstants from 'constants/subscriptionConstant';

import { DocumentQueryRetriever } from '../../DocumentQueryProxy';

const { dispatch } = store;

export default class PersonalDocumentObserver {
  constructor() {
    this._id = v4();
  }

  pushDocumentToPersonalList = (document) => dispatch(actions.pushDocumentToPersonalList(document));

  pushDocumentToSharedList = (document) => dispatch(actions.pushDocumentToSharedList(document));

  updateDocumentPersonal = (document) => dispatch(actions.updateDocumentPersonal(document));

  removeDocumentFromPersonalList = (document) => dispatch(actions.removeDocumentFromPersonalList(document));

  removeOriginalDocumentsFromPersonalList = (documentIds) =>
    dispatch(actions.removeOriginalDocumentsFromPersonalList(documentIds));

  removeSharedDocs = (documentIds) => dispatch(actions.removeSharedDocs(documentIds));

  updateSharedDocument = (document) => dispatch(actions.updateSharedDocument(document));

  get Id() {
    return this._id;
  }

  exec = ({ event, data }) => {
    const { document: updatedDocument, documentList: updatedDocumentList = [], currentUserId } = data;
    const updatedDocumentIds = updatedDocumentList.map((documentData) => documentData.documentId);
    const { commonDocuments } = DocumentQueryRetriever(folderType.INDIVIDUAL, {});
    const { commonDocuments: sharedDocuments } = DocumentQueryRetriever(folderType.SHARED, {});

    const isExistedDocument = updatedDocument && !!commonDocuments[updatedDocument._id];
    const isExistedSharedDocument = updatedDocument && !!sharedDocuments[updatedDocument._id];
    const { data: currentOrganization = {} } = selectors.getCurrentOrganization(store.getState());

    switch (event) {
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL: {
        const { workspaceId } = updatedDocument.belongsTo;
        const orgId = currentOrganization?._id;
        // Prevent to add folder document to current root doc list
        /**
         * Push to personal workspace: !workspaceId && !currentOrganization._id
         * Push to my document in org: workspaceId && workspaceId === currentOrganization._id
         */
        const isPersonalWorkspaceList = !workspaceId && !orgId;
        const isMyDocumentOrgList = workspaceId && orgId && workspaceId === orgId;
        if (updatedDocument?.folderId || !(isPersonalWorkspaceList || isMyDocumentOrgList)) {
          break;
        }
        updatedDocument.newUpload = true;

        this.pushDocumentToPersonalList(updatedDocument);
        break;
      }
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_SHARE:
        this.pushDocumentToSharedList(updatedDocument);
        break;
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_SHARE: {
        const filteredDocumentIds = updatedDocumentIds.filter((documentId) =>
          Object.keys(sharedDocuments).includes(documentId)
        );
        if (filteredDocumentIds.length) {
          this.removeSharedDocs(filteredDocumentIds);
        }
        break;
      }
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_MOVE_DOCUMENT: {
        if (isExistedDocument) {
          this.removeDocumentFromPersonalList(updatedDocument);
        }
        break;
      }
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_DOCUMENT_PERSONAL: {
        const filteredDocumentIds = updatedDocumentIds.filter((documentId) =>
          Object.keys(commonDocuments).includes(documentId)
        );
        if (filteredDocumentIds.length) {
          this.removeOriginalDocumentsFromPersonalList(filteredDocumentIds);
        }
        break;
      }
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_UNDO_MOVE_DOCUMENT: {
        if (!isExistedDocument && currentUserId === updatedDocument.ownerId) {
          this.pushDocumentToPersonalList(updatedDocument);
        }
        break;
      }
      case SubscriptionConstants.Subscription.DOCUMENT_NAME_INFO:
      case SubscriptionConstants.Subscription.DOCUMENT_SETTINGS:
      case SubscriptionConstants.Subscription.DOCUMENT_FAVORITE_INFO:
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_FAVORITE:
      case SubscriptionConstants.Subscription.DOCUMENT_PRINCIPLE_LIST:
      case SubscriptionConstants.Subscription.DOCUMENT_THUMBNAIL_INFO:
        if (isExistedDocument) {
          this.updateDocumentPersonal(updatedDocument);
        }
        if (isExistedSharedDocument) {
          this.updateSharedDocument(updatedDocument);
        }
        break;
      default:
        break;
    }
  };
}
