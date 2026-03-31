import v4 from 'uuid/v4';

import { store } from 'src/redux/store';

import actions from 'actions';

import { folderType } from 'constants/documentConstants';
import SubscriptionConstants from 'constants/subscriptionConstant';

import { DocumentQueryRetriever } from '../../DocumentQueryProxy';

const { dispatch } = store;

export default class StarredDocumentObserver {
  constructor() {
    this._id = v4();
  }

  pushDocumentToFavoriteList = (document) => dispatch(actions.pushDocumentToFavoriteList(document));

  updateDocumentFavorite = (document) => dispatch(actions.updateDocumentFavorite(document));

  removeDocumentFromFavoriteList = (document) => dispatch(actions.removeDocumentFromFavoriteList(document));

  removeOriginalDocumentsFromFavoriteList = (documentIds) =>
    dispatch(actions.removeOriginalDocumentsFromFavoriteList(documentIds));

  get Id() {
    return this._id;
  }

  exec = ({ event, data }) => {
    const { document: updatedDocument, documentList: updatedDocumentList = [], currentUserId, isSearchView } = data;
    const updatedDocumentIds = updatedDocumentList.map((documentData) => documentData.documentId);

    const { commonDocuments } = DocumentQueryRetriever(folderType.STARRED, {});
    let isExistedDocument;
    if (updatedDocument) {
      isExistedDocument = !!commonDocuments[updatedDocument._id];
    }
    const isStarred = Boolean(updatedDocument) && updatedDocument.listUserStar?.includes(currentUserId);
    switch (event) {
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_SHARE: {
        if (!isExistedDocument && isStarred) {
          this.pushDocumentToFavoriteList(updatedDocument);
        }
        break;
      }
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_FAVORITE:
        if (isStarred && !isSearchView) {
          this.pushDocumentToFavoriteList(updatedDocument);
        } else {
          this.removeDocumentFromFavoriteList(updatedDocument);
        }
        break;
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_SHARE:
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_DOCUMENT_PERSONAL:
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_DOCUMENT_TEAMS:
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_DOCUMENT_ORGANIZATION: {
        const filteredDocumentIds = updatedDocumentIds.filter((documentId) =>
          Object.keys(commonDocuments).includes(documentId)
        );
        if (filteredDocumentIds.length) {
          this.removeOriginalDocumentsFromFavoriteList(filteredDocumentIds);
        }
        break;
      }
      case SubscriptionConstants.Subscription.DOCUMENT_NAME_INFO:
      case SubscriptionConstants.Subscription.DOCUMENT_FAVORITE_INFO:
      case SubscriptionConstants.Subscription.DOCUMENT_SETTINGS:
      case SubscriptionConstants.Subscription.DOCUMENT_PRINCIPLE_LIST:
      case SubscriptionConstants.Subscription.DOCUMENT_THUMBNAIL_INFO:
        if (isExistedDocument && isStarred) {
          this.updateDocumentFavorite(updatedDocument);
        }
        break;
      default:
        break;
    }
  };
}
