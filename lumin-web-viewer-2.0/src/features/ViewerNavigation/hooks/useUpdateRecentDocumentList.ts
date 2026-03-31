import { useSubscription } from '@apollo/client';
import { useEffect } from 'react';
import { useParams } from 'react-router';

import { SUB_DELETE_ORIGINAL_DOCUMENT } from 'graphQL/DocumentGraph';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import { ErrorCode } from 'constants/lumin-common';

import { useRemoveRecentDocument } from './useHandleRecentDocumentList';

export const useUpdateRecentDocumentList = ({
  error,
}: {
  error: {
    code: string;
  };
}) => {
  const { mutate: removeRecentDocuments } = useRemoveRecentDocument();
  const currentUser = useGetCurrentUser();
  const params = useParams();

  useEffect(() => {
    if (error?.code === ErrorCode.Document.DOCUMENT_NOT_FOUND) {
      removeRecentDocuments([params.documentId]);
    }
  }, [error?.code, params.documentId, removeRecentDocuments]);

  useSubscription(SUB_DELETE_ORIGINAL_DOCUMENT, {
    skip: !currentUser,
    variables: {
      clientId: currentUser?._id,
    },
    onSubscriptionData: ({
      subscriptionData: {
        data: { deleteOriginalDocument },
      },
    }) => {
      const { documentList: deletedDocuments } = deleteOriginalDocument as {
        documentList: { documentId: string }[];
      };
      removeRecentDocuments(deletedDocuments.map((document) => document.documentId));
    },
  });
};
