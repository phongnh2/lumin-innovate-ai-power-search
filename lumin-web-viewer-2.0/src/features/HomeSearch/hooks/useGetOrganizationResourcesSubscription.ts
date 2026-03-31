import { useContext } from 'react';

import {
  SubscriptionAddDocumentListPayload,
  SubscriptionDeleteDocumentListPayload,
  SubscriptionFunctionParams,
  SubscriptionUpdateDocumentInfoPayload,
  SubscriptionUpdateFolderPayload,
} from 'features/DocumentList/types';

import SubscriptionConstants from 'constants/subscriptionConstant';

import { SearchResultContext } from '../contexts';
import { ActionTypes } from '../reducers';

export const useGetOrganizationResourcesSubscription = () => {
  const { dispatch } = useContext(SearchResultContext);

  const handleListSubscription = ({ event, payload }: SubscriptionFunctionParams) => {
    switch (event) {
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_UPLOAD_DOCUMENT_ORGANIZATION: {
        const { document: addedDocument } = payload as SubscriptionAddDocumentListPayload;
        addedDocument.newUpload = true;
        dispatch({ type: ActionTypes.ADD_DOCUMENT, payload: { document: addedDocument } });
        break;
      }
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_DOCUMENT_TEAMS:
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_DOCUMENT_ORGANIZATION:
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_DOCUMENT_PERSONAL: {
        const { documentIds } = payload as SubscriptionDeleteDocumentListPayload;
        dispatch({ type: ActionTypes.DELETE_DOCUMENT, payload: { documentIds } });
        break;
      }
      case SubscriptionConstants.Subscription.DOCUMENT_NAME_INFO:
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_FAVORITE:
      case SubscriptionConstants.Subscription.DOCUMENT_FAVORITE_INFO:
      case SubscriptionConstants.Subscription.DOCUMENT_SETTINGS:
      case SubscriptionConstants.Subscription.DOCUMENT_PRINCIPLE_LIST:
      case SubscriptionConstants.Subscription.DOCUMENT_THUMBNAIL_INFO: {
        const { document } = payload as SubscriptionUpdateDocumentInfoPayload;
        dispatch({ type: ActionTypes.UPDATE_DOCUMENT_INFO, payload: { document } });
        break;
      }
      case SubscriptionConstants.Subscription.UPDATE_FOLDER_INFO:
      case SubscriptionConstants.Subscription.UPDATE_STARRED_FOLDER: {
        const { folder } = payload as SubscriptionUpdateFolderPayload;
        dispatch({ type: ActionTypes.UPDATE_FOLDER_INFO, payload: { folder } });
        break;
      }
      case SubscriptionConstants.Subscription.DELETE_FOLDER: {
        const { folders } = payload as SubscriptionUpdateFolderPayload;
        const folderIds = folders.map(({ _id }) => _id);
        dispatch({ type: ActionTypes.DELETE_FOLDER, payload: { folderIds } });
        break;
      }
      default:
        break;
    }
  };

  return {
    handleListSubscription,
  };
};
