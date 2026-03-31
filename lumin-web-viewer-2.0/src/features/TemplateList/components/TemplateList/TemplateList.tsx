import React, { useCallback, useContext, useMemo } from 'react';

import { useTemplateListScreenContext } from 'screens/TemplateList/hooks';

import { useGetCurrentOrganization, useGetFolderType } from 'hooks';

import { DocumentList } from 'features/DocumentList/components';
import { DocumentListProps } from 'features/DocumentList/components/DocumentList/DocumentList';
import {
  SubscriptionDeleteDocumentTemplatePayload,
  SubscriptionFunctionParams,
  SubscriptionUpdateTemplateListPayload,
} from 'features/DocumentList/types';

import { folderType } from 'constants/documentConstants';
import { LocationType } from 'constants/locationConstant';
import SubscriptionConstants from 'constants/subscriptionConstant';

import { DocumentTemplate, IDocumentBase } from 'interfaces/document/document.interface';

import { TemplateItem, TemplateListHeader, TemplateSkeleton } from '..';
import { TemplateListContext, TemplateListProvider } from '../../contexts/TemplateList.context';
import { useGetDocumentTemplates } from '../../hooks/useGetTemplateList';
import { ActionTypes } from '../../reducers/TemplateList.reducer';
import { EmptyTemplateList } from '../EmptyTemplateList';

import styles from './TemplateList.module.scss';

const TemplateList = () => {
  const { loading, refetch, getMore } = useGetDocumentTemplates();
  const { state, dispatch } = useContext(TemplateListContext);
  const { scrollRef } = useTemplateListScreenContext();
  const currentOrganization = useGetCurrentOrganization();
  const currentFolderType = useGetFolderType();

  const handleListSubscription = useCallback(
    ({ event, payload }: SubscriptionFunctionParams) => {
      switch (event) {
        case SubscriptionConstants.Subscription.DOCUMENT_TEMPLATE_LIST_UPLOAD_DOCUMENT_ORGANIZATION:
        case SubscriptionConstants.Subscription.DOCUMENT_TEMPLATE_LIST_UPLOAD_DOCUMENT_TEAMS:
        case SubscriptionConstants.Subscription.DOCUMENT_TEMPLATE_LIST_UPLOAD_DOCUMENT_PERSONAL: {
          const { document: addedDocument } = payload as SubscriptionUpdateTemplateListPayload;
          const { belongsTo } = addedDocument;
          const { _id: currentOrgId, url: currentOrgUrl } = currentOrganization;
          const isPersonalDocument =
            belongsTo.type === LocationType.PERSONAL && currentFolderType === folderType.INDIVIDUAL;
          const isOrgDocument =
            belongsTo.type === LocationType.ORGANIZATION && currentFolderType === folderType.ORGANIZATION;
          const isOrgTeamDocument =
            belongsTo.type === LocationType.ORGANIZATION_TEAM && currentFolderType === folderType.TEAMS;

          const isValidDocument =
            (isPersonalDocument && belongsTo.workspaceId === currentOrgId) ||
            (isOrgDocument && belongsTo.location._id === currentOrgId) ||
            (isOrgTeamDocument && belongsTo.location.url === currentOrgUrl);
          if (!isValidDocument) {
            return;
          }
          addedDocument.newUpload = true;
          dispatch({ type: ActionTypes.ADD_TEMPLATE, payload: { document: addedDocument } });
          break;
        }
        case SubscriptionConstants.Subscription.DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_ORGANIZATION:
        case SubscriptionConstants.Subscription.DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_TEAMS:
        case SubscriptionConstants.Subscription.DOCUMENT_TEMPLATE_LIST_DELETE_DOCUMENT_PERSONAL: {
          const { documentTemplateId } = payload as SubscriptionDeleteDocumentTemplatePayload;
          dispatch({ type: ActionTypes.DELETE_TEMPLATE, payload: { documentIds: [documentTemplateId] } });
          break;
        }
        default:
          break;
      }
    },
    [dispatch, currentFolderType, currentOrganization]
  );

  const updateTemplateInfo = useCallback(
    (doc: DocumentTemplate) => {
      dispatch({ type: ActionTypes.UPDATE_TEMPLATE_INFO, payload: { document: doc } });
    },
    [dispatch]
  );

  const renderItem: DocumentListProps<DocumentTemplate>['renderItem'] = useCallback(
    (_, document, refetchDocument, openDocumentModal) => (
      <TemplateItem
        document={document}
        refetchDocument={refetchDocument}
        openDocumentModal={openDocumentModal}
        containerScrollRef={scrollRef}
        updateDocumentInfo={updateTemplateInfo}
      />
    ),
    [scrollRef, updateTemplateInfo]
  );

  const elements = useMemo(
    () => ({
      skeletonElement: <TemplateSkeleton />,
      emptyElement: <EmptyTemplateList />,
      headerElement: <TemplateListHeader />,
    }),
    []
  );

  const classNames = useMemo(
    () => ({
      backToTop: {
        container: styles.backToTop,
      },
      header: styles.listHeader,
      dragAndDropSvg: styles.dragAndDropSvg,
      listContainer: styles.listContainer,
    }),
    []
  );

  const virtuosoProps: DocumentListProps<IDocumentBase>['virtuosoProps'] = useMemo(
    () => ({
      computeItemKey: (_, item) => item._id,
    }),
    []
  );

  return (
    <DocumentList
      isLoading={loading}
      refetchDocument={refetch}
      documents={state.documents}
      renderItem={renderItem}
      elements={elements}
      isBackToTop
      fetchMore={getMore}
      onSubscription={handleListSubscription}
      parentScrollerRef={scrollRef.current}
      classNames={classNames}
      virtuosoProps={virtuosoProps}
    />
  );
};

const TemplateListWrapper = () => (
  <TemplateListProvider>
    <TemplateList />
  </TemplateListProvider>
);

export default TemplateListWrapper;
