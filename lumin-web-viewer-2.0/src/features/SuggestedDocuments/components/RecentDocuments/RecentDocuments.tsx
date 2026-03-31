import React, { useContext, useRef, useCallback } from 'react';

import { useHomeContext } from 'screens/Home/hooks';

import { useGetCurrentOrganization } from 'hooks';

import { DocumentList } from 'features/DocumentList/components';
import {
  SubscriptionAddDocumentListPayload,
  SubscriptionUpdateDocumentInfoPayload,
  SubscriptionDeleteDocumentListPayload,
  SubscriptionFunctionParams,
} from 'features/DocumentList/types';
import { RecentDocumentsContext } from 'features/SuggestedDocuments/contexts/RecentDocuments.context';
import { useGetRecentDocuments } from 'features/SuggestedDocuments/hooks';
import { ActionTypes } from 'features/SuggestedDocuments/reducers/RecentDocument.reducer';

import { DocumentTab, MINIMUM_DOCUMENT_QUANTITY } from 'constants/documentConstants';
import { LocationType } from 'constants/locationConstant';
import SubscriptionConstants from 'constants/subscriptionConstant';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { DocumentListHeader, DocumentSkeleton, DocumentItem } from './components';
import EmptyDocuments from '../EmptyDocuments';

import styles from './RecentDocuments.module.scss';

const RecentDocuments = () => {
  const currentOrganization = useGetCurrentOrganization();

  const { refetch, getMore } = useGetRecentDocuments({
    filter: {},
    query: {
      minimumQuantity: MINIMUM_DOCUMENT_QUANTITY,
    },
    orgId: currentOrganization._id,
    tab: DocumentTab.RECENT,
  });
  const { state: recentDocumentsState, dispatch } = useContext(RecentDocumentsContext);

  const handleListSubscription = ({ event, payload }: SubscriptionFunctionParams) => {
    switch (event) {
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_RECENT_DOCUMENT_ADDED: {
        const { _id: currentOrgId, url: currentOrgUrl } = currentOrganization;
        const { document: addedDocument } = payload as SubscriptionAddDocumentListPayload;
        const { belongsTo } = addedDocument;
        const isPersonalDocument = belongsTo.type === LocationType.PERSONAL;
        const isOrgDocument = belongsTo.type === LocationType.ORGANIZATION;
        const isOrgTeamDocument = belongsTo.type === LocationType.ORGANIZATION_TEAM;
        if (
          (isPersonalDocument && belongsTo.workspaceId !== currentOrgId) ||
          (isOrgDocument && belongsTo.location._id !== currentOrgId) ||
          (isOrgTeamDocument && belongsTo.location.url !== currentOrgUrl)
        ) {
          return;
        }
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
      default:
        break;
    }
  };

  // scroll
  const { scrollRef } = useHomeContext();

  const containerScrollRef = useRef(scrollRef);

  const updateDocumentInfo = useCallback(
    (doc: IDocumentBase) => {
      dispatch({ type: ActionTypes.UPDATE_DOCUMENT_INFO, payload: { document: doc } });
    },
    [dispatch]
  );

  return (
    <div className={styles.container}>
      <DocumentList
        isLoading={recentDocumentsState.isFetching}
        refetchDocument={refetch}
        documents={recentDocumentsState.documents}
        renderItem={(_, document, refetchDocument, openDocumentModal) => (
          <DocumentItem
            document={document}
            refetchDocument={refetchDocument}
            openDocumentModal={openDocumentModal}
            containerScrollRef={containerScrollRef}
            updateDocumentInfo={updateDocumentInfo}
          />
        )}
        elements={{
          skeletonElement: <DocumentSkeleton />,
          emptyElement: <EmptyDocuments />,
          headerElement: <DocumentListHeader />,
        }}
        isBackToTop
        fetchMore={getMore}
        onSubscription={handleListSubscription}
        parentScrollerRef={scrollRef}
        classNames={{
          backToTop: {
            container: styles.backToTop,
          },
        }}
        virtuosoProps={{
          computeItemKey: (_, item) => item._id,
        }}
      />
    </div>
  );
};

export default RecentDocuments;
