import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useHomeContext } from 'screens/Home/hooks';

import { useGetCurrentOrganization } from 'hooks';

import { DocumentList } from 'features/DocumentList/components';
import {
  SubscriptionAddDocumentListPayload,
  SubscriptionUpdateDocumentInfoPayload,
  SubscriptionDeleteDocumentListPayload,
  SubscriptionFunctionParams,
} from 'features/DocumentList/types';
import { TrendingDocumentsContext } from 'features/SuggestedDocuments/contexts/TrendingDocuments.context';
import { useGetOrganizationDocuments } from 'features/SuggestedDocuments/hooks';
import { ActionTypes } from 'features/SuggestedDocuments/reducers/TrendingDocuments.reducer';

import { DocumentTab, folderType, MINIMUM_DOCUMENT_QUANTITY, modifiedFilter } from 'constants/documentConstants';
import SubscriptionConstants from 'constants/subscriptionConstant';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { DocumentListHeader, DocumentSkeleton, DocumentItem } from './components';
import EmptyDocuments from '../EmptyDocuments';

import styles from './TrendingDocuments.module.scss';

const TrendingDocuments = () => {
  const currentOrganization = useGetCurrentOrganization();

  const { folderType: listType, selectedTeam } = useSelector(selectors.getTeamSelectorData);

  const { state: trendingDocumentsState, dispatch } = useContext(TrendingDocumentsContext);

  const queryIdentity = useMemo(
    () =>
      listType === folderType.ORGANIZATION
        ? { orgId: currentOrganization._id, tab: DocumentTab.TRENDING }
        : { teamId: selectedTeam?._id, tab: DocumentTab.TRENDING },
    [currentOrganization._id, listType, selectedTeam?._id]
  );

  const { refetch, getMore } = useGetOrganizationDocuments({
    filter: {
      ownedFilterCondition: trendingDocumentsState.ownedFilter,
      lastModifiedFilterCondition: modifiedFilter.modifiedByAnyone,
    },
    query: {
      minimumQuantity: MINIMUM_DOCUMENT_QUANTITY,
    },
    identity: queryIdentity,
  });

  const handleListSubscription = ({ event, payload }: SubscriptionFunctionParams) => {
    switch (event) {
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_UPLOAD_DOCUMENT_TEAMS:
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_UPLOAD_DOCUMENT_ORGANIZATION: {
        const { document: addedDocument, organizationId } = payload as SubscriptionAddDocumentListPayload;
        const { belongsTo } = addedDocument;
        if (
          (listType === folderType.ORGANIZATION && currentOrganization._id !== organizationId) ||
          (listType === folderType.TEAMS && selectedTeam._id !== belongsTo.location._id)
        ) {
          return;
        }
        addedDocument.newUpload = true;
        dispatch({ type: ActionTypes.ADD_DOCUMENT, payload: { document: addedDocument } });
        break;
      }
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_DOCUMENT_TEAMS:
      case SubscriptionConstants.Subscription.DOCUMENT_LIST_REMOVE_DOCUMENT_ORGANIZATION: {
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
        isLoading={trendingDocumentsState.isFetching}
        refetchDocument={refetch}
        documents={trendingDocumentsState.documents}
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

export default TrendingDocuments;
