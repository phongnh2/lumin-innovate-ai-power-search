import { useSubscription } from '@apollo/client';
import { useSelector, shallowEqual } from 'react-redux';
import { useParams } from 'react-router';

import {
  SUB_DELETE_ORIGINAL_DOCUMENT,
  SUB_UPDATE_DOCUMENT_INFO,
  SUB_UPDATE_DOCUMENT_LIST,
} from 'graphQL/DocumentGraph';

import selectors from 'selectors';

import SubscriptionConstants from 'constants/subscriptionConstant';

const {
  Subscription,
  isAddDocumentSubscription,
} = SubscriptionConstants;

export function useUpdateFolderDocuments({
  addNewDocumentHandler,
  removeDocumentsHandler,
  updateDocInfoHandler,
  isSearchView,
}) {
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const { folderId } = useParams();

  const { _id: userId } = currentUser;

  const subscriptionInput = {
    clientId: userId,
    folderId,
  };

  useSubscription(
    SUB_UPDATE_DOCUMENT_LIST,
    {
      variables: {
        input: subscriptionInput,
      },
      onSubscriptionData: ({ subscriptionData: { data: { updateDocumentList } } }) => {
        const { document, type } = updateDocumentList || {};
        if (!document?.folderId) {
          return;
        }
        if ([
          Subscription.DOCUMENT_LIST_UPLOAD_DOCUMENT_PERSONAL,
          Subscription.DOCUMENT_LIST_UPLOAD_DOCUMENT_TEAMS,
          Subscription.DOCUMENT_LIST_UPLOAD_DOCUMENT_ORGANIZATION,
        ].includes(type)) {
          document.newUpload = true;
        }
        if (isAddDocumentSubscription(type) && !isSearchView) {
          addNewDocumentHandler(document);
        }
      },
    },
  );

  useSubscription(
    SUB_UPDATE_DOCUMENT_INFO,
    {
      variables: {
        input: subscriptionInput,
      },
      onSubscriptionData: ({ subscriptionData: { data: { updateDocumentInfo } } }) => {
        if (!updateDocumentInfo) {
          return;
        }
        updateDocInfoHandler(updateDocumentInfo);
      },
    },
  );

  useSubscription(
    SUB_DELETE_ORIGINAL_DOCUMENT,
    {
      variables: subscriptionInput,
      onSubscriptionData: ({ subscriptionData: { data: { deleteOriginalDocument } } }) => {
        const { documentList } = deleteOriginalDocument;
        if (!documentList) {
          return;
        }
        const documentsInFolder = documentList.filter((document) => document.documentFolder === folderId);
        if (documentsInFolder.length) {
          removeDocumentsHandler(documentsInFolder.map((data) => data.documentId));
        }
      },
    },
  );
}
