import { useSubscription } from '@apollo/client';
import { useMemo } from 'react';

import {
  SUB_DELETE_ORIGINAL_DOCUMENT,
  SUB_UPDATE_DOCUMENT_INFO,
  SUB_UPDATE_DOCUMENT_LIST,
} from 'graphQL/DocumentGraph';
import { SUB_DELETE_DOCUMENT_TEMPLATE, SUB_UPDATE_DOCUMENT_TEMPLATE_LIST } from 'graphQL/DocumentTemplateGraph';
import { SUB_UPDATE_FOLDER } from 'graphQL/FolderGraph';

import { useGetCurrentUser } from 'hooks';

import { STATUS_CODE } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

import {
  DeleteOriginalDocumentPayload,
  UpdateDocumentListPayload,
  SubscriptionFunctionParams,
  FolderSubscriptionPayload,
  UpdateDocumentTemplateListPayload,
  DeleteDocumentTemplatePayload,
} from '../types';

interface UseDocumentListSubscriptionProps {
  onSubscription?: (params: SubscriptionFunctionParams) => void;
}

const useDocumentListSubscription = ({ onSubscription }: UseDocumentListSubscriptionProps) => {
  const currentUser = useGetCurrentUser();

  const shouldSkipSubscription = useMemo(() => !currentUser || !onSubscription, [currentUser, onSubscription]);

  useSubscription<{
    updateDocumentList: UpdateDocumentListPayload;
  }>(SUB_UPDATE_DOCUMENT_LIST, {
    fetchPolicy: 'no-cache',
    variables: {
      input: {
        clientId: currentUser._id,
      },
    },
    skip: shouldSkipSubscription,
    onData: ({
      data: {
        data: { updateDocumentList },
      },
    }) => {
      if (!updateDocumentList) return;
      const { statusCode, type, document, organizationId } = updateDocumentList;
      if (statusCode !== STATUS_CODE.SUCCEED) {
        return;
      }

      onSubscription({
        event: type,
        payload: {
          document,
          organizationId,
        },
      });
    },
  });

  useSubscription<{
    updateDocumentInfo: { document: IDocumentBase; ownerId: string; type: string };
  }>(SUB_UPDATE_DOCUMENT_INFO, {
    fetchPolicy: 'no-cache',
    variables: {
      input: {
        clientId: currentUser._id,
      },
    },
    skip: shouldSkipSubscription,
    onData: ({
      data: {
        data: { updateDocumentInfo },
      },
    }) => {
      const { document, type } = updateDocumentInfo;
      onSubscription({
        event: type,
        payload: {
          document,
        },
      });
    },
  });

  useSubscription<{
    deleteOriginalDocument: DeleteOriginalDocumentPayload;
  }>(SUB_DELETE_ORIGINAL_DOCUMENT, {
    fetchPolicy: 'no-cache',
    variables: {
      clientId: currentUser._id,
    },
    skip: shouldSkipSubscription,
    onData: ({
      data: {
        data: { deleteOriginalDocument },
      },
    }) => {
      if (!deleteOriginalDocument) return;
      const { statusCode, type, documentList: deletedDocList } = deleteOriginalDocument;
      if (statusCode !== STATUS_CODE.SUCCEED) {
        return;
      }
      onSubscription({
        event: type,
        payload: {
          documentIds: deletedDocList.map((documentData) => documentData.documentId),
        },
      });
    },
  });

  useSubscription<{
    updateFolderSubscription: FolderSubscriptionPayload;
  }>(SUB_UPDATE_FOLDER, {
    variables: {
      input: {
        userId: currentUser._id,
      },
    },
    skip: shouldSkipSubscription,
    onData: ({
      data: {
        data: { updateFolderSubscription },
      },
    }) => {
      if (!updateFolderSubscription) {
        return;
      }
      const { subscriptionEvent, folder, folders } = updateFolderSubscription;

      onSubscription({
        event: subscriptionEvent,
        payload: {
          folder,
          folders,
        },
      });
    },
  });

  useSubscription<{ updateDocumentTemplateList: UpdateDocumentTemplateListPayload }>(
    SUB_UPDATE_DOCUMENT_TEMPLATE_LIST,
    {
      variables: {
        input: {
          clientId: currentUser._id,
        },
      },
      skip: shouldSkipSubscription,
      onData: ({
        data: {
          data: { updateDocumentTemplateList },
        },
      }) => {
        if (!updateDocumentTemplateList) return;
        const { statusCode, type, document, organizationId } = updateDocumentTemplateList;
        if (statusCode !== STATUS_CODE.SUCCEED) {
          return;
        }

        onSubscription({
          event: type,
          payload: {
            document,
            organizationId,
          },
        });
      },
    }
  );

  useSubscription<{
    deleteDocumentTemplate: DeleteDocumentTemplatePayload;
  }>(SUB_DELETE_DOCUMENT_TEMPLATE, {
    fetchPolicy: 'no-cache',
    variables: {
      clientId: currentUser._id,
    },
    skip: shouldSkipSubscription,
    onData: ({
      data: {
        data: { deleteDocumentTemplate },
      },
    }) => {
      if (!deleteDocumentTemplate) return;
      const { statusCode, type, documentTemplateId } = deleteDocumentTemplate;
      if (statusCode !== STATUS_CODE.SUCCEED) {
        return;
      }
      onSubscription({
        event: type,
        payload: {
          documentTemplateId,
        },
      });
    },
  });
};

export default useDocumentListSubscription;
