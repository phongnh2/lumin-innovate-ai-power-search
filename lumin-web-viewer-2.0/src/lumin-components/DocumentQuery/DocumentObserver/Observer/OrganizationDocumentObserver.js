/* eslint-disable import/no-self-import */
/* eslint-disable import/no-cycle */

import v4 from 'uuid/v4';

import { store } from 'src/redux/store';

import actions from 'actions';

import { DocumentQueryRetriever } from 'luminComponents/DocumentQuery/DocumentQueryProxy';

import { folderType } from 'constants/documentConstants';
import SubscriptionConstants from 'constants/subscriptionConstant';

const { dispatch } = store;

export default class OrganizationDocumentObserver {
  constructor() {
    this._id = v4();
  }

  pushDocumentToOrganizationList = (document, orgId) =>
    dispatch(actions.pushDocumentToOrganizationList(document, orgId));

  updateDocumentOrganization = (document) => dispatch(actions.updateDocumentOrganization(document));

  removeOriginalDocumentsFromOrgList = (documentIds, orgId) =>
    dispatch(actions.removeOriginalDocumentsFromOrgList(documentIds, orgId));

  get Id() {
    return this._id;
  }

  exec = ({ event, data }) => {
    const { document: updatedDocument, documentList: updatedDocumentList = [], organizationId: orgId } = data;
    const updatedDocumentIds = updatedDocumentList.map((documentData) => documentData.documentId);

    const { commonDocuments } = DocumentQueryRetriever(folderType.ORGANIZATION, { orgId });
    let isExistedDocument;
    if (updatedDocument) {
      isExistedDocument = !!commonDocuments[updatedDocument._id];
    }
    switch (event) {
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_UPLOAD_DOCUMENT_ORGANIZATION:
        // Prevent to add folder document to current root doc list
        if (updatedDocument?.folderId) {
          return;
        }
        updatedDocument.newUpload = true;
        // eslint-disable-next-line no-fallthrough
        if (!isExistedDocument) {
          this.pushDocumentToOrganizationList(updatedDocument, orgId);
        }
        break;
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_DOCUMENT_ORGANIZATION: {
        const filteredDocumentIds = updatedDocumentIds.filter((documentId) =>
          Object.keys(commonDocuments).includes(documentId)
        );
        if (filteredDocumentIds.length) {
          this.removeOriginalDocumentsFromOrgList(filteredDocumentIds, orgId);
        }
        break;
      }
      case SubscriptionConstants.Subscription.DOCUMENT_NAME_INFO:
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_FAVORITE:
      case SubscriptionConstants.Subscription.DOCUMENT_FAVORITE_INFO:
      case SubscriptionConstants.Subscription.DOCUMENT_SETTINGS:
      case SubscriptionConstants.Subscription.DOCUMENT_PRINCIPLE_LIST:
      case SubscriptionConstants.Subscription.DOCUMENT_THUMBNAIL_INFO:
        if (isExistedDocument) {
          this.updateDocumentOrganization(updatedDocument);
        }
        break;
      default:
        break;
    }
  };
}
