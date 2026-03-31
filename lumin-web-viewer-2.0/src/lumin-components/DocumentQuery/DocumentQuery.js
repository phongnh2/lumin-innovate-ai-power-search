/* eslint-disable react/prop-types */
import { useSubscription, NetworkStatus } from '@apollo/client';
import React, { useEffect, useCallback } from 'react';
import { Trans } from 'react-i18next';
import { batch, connect, useSelector } from 'react-redux';
import { compose } from 'redux';

import {
  MORE_DOCUMENTS_USER,
  SUB_UPDATE_DOCUMENT_LIST,
  SUB_UPDATE_DOCUMENT_INFO,
  SUB_DELETE_ORIGINAL_DOCUMENT,
} from 'graphQL/DocumentGraph';
import { GET_ORGANIZATION_DOCUMENTS } from 'graphQL/OrganizationGraph';
import { GET_ORGANIZATION_TEAM_DOCUMENTS, SUB_UPDATE_TEAMS } from 'graphQL/TeamGraph';

import actions from 'actions';
import selectors from 'selectors';

import { useTotalDocument } from 'lumin-components/DocumentListHeaderBar/hooks';
import { withQueries } from 'luminComponents/QueriesHOC';

import withGetFolderType from 'HOC/withGetFolderType';

import { useGetCurrentTeam, useTranslation } from 'hooks';

import { documentServices, indexedDBService } from 'services';

import errorExtract from 'utils/error';

import { folderType } from 'constants/documentConstants';
import { FETCH_POLICY } from 'constants/graphConstant';
import { ErrorCode, ModalTypes, STATUS_CODE } from 'constants/lumin-common';
import SubscriptionConstants from 'constants/subscriptionConstant';

import documentObservable from './DocumentObserver/DocumentObservable';
import {
  PersonalDocumentObserver,
  TeamDocumentObserver,
  StarredDocumentObserver,
  OrganizationDocumentObserver,
} from './DocumentObserver/Observer';
import { DocumentQueryProxy } from './DocumentQueryProxy';
import useResetCacheAfterLeaving from './hooks/useResetCacheAfterLeaving';
import useResetListOnSearching from './hooks/useResetListOnSearching';

const DocumentQuery = ({
  children,
  openModal,
  currentUser,
  currentFolderType,
  teams,
  dispatch = () => {},
  fetchMore = () => {},
  refetch = () => {},
  data = {},
  error,
  lastStatus,
  resetFetchingStateOfDoclist,
  resetFolderList,
  baseQueryDocuments,
  isSearchView,
  currentOrganization,
  controller,
  resetDocumentList,
  findDocumentByName,
}) => {
  const documentLoading = useSelector((state) => selectors.getDocumentLoading(state, currentFolderType));
  const currentTeam = useGetCurrentTeam() || {};
  const totalDocuments = useTotalDocument();
  const { t } = useTranslation();

  const { getDocuments: documentData } = data;
  const { _id: userId } = currentUser;
  const {
    orgId,
    clientId,
    query: { searchKey },
  } = baseQueryDocuments || {};

  const {
    firstFetching,
    shouldRefetch,
    documents: documentList,
    hasNextPage,
    cursor: documentCursor,
  } = documentServices.getCurrentDocumentList(currentFolderType, { teamId: clientId, orgId });

  useEffect(() => {
    if (error) {
      onDocumentError(error);
    }
  }, [error]);

  const setDocumentList = useCallback(
    (updatedDocuments) => {
      const updatedData = {
        documents: updatedDocuments.documents,
        hasNextPage: updatedDocuments.hasNextPage,
        cursor: updatedDocuments.cursor,
        total: updatedDocuments.total,
      };
      switch (currentFolderType) {
        case folderType.TEAMS: {
          updatedData.teamId = clientId;
          indexedDBService.setCurrentTeam(currentTeam);
          break;
        }
        case folderType.ORGANIZATION: {
          updatedData.orgId = orgId;
          indexedDBService.setCurrentOrganization(currentOrganization);
          break;
        }
        default:
          break;
      }
      DocumentQueryProxy(currentFolderType, updatedData);
    },
    [currentFolderType, orgId, clientId]
  );

  useResetListOnSearching({ searchKey, clientId });
  useResetCacheAfterLeaving();

  useEffect(
    () => () => {
      controller.abort();
    },
    [searchKey]
  );

  useEffect(() => {
    documentObservable.subscribe(PersonalDocumentObserver);
    documentObservable.subscribe(TeamDocumentObserver);
    documentObservable.subscribe(StarredDocumentObserver);
    documentObservable.subscribe(OrganizationDocumentObserver);

    return () => {
      documentObservable.unsubscribe(PersonalDocumentObserver);
      documentObservable.unsubscribe(TeamDocumentObserver);
      documentObservable.unsubscribe(StarredDocumentObserver);
      documentObservable.unsubscribe(OrganizationDocumentObserver);
      batch(() => {
        resetDocumentList();
        resetFetchingStateOfDoclist();
        resetFolderList();
      });
    };
  }, []);

  useEffect(() => {
    if (shouldRefetch && !isSearchView) {
      refetch();
    }
  }, [shouldRefetch, isSearchView]);

  useEffect(() => {
    if ((lastStatus === NetworkStatus.fetchMore && !findDocumentByName) || documentLoading) {
      return;
    }
    // setDocumentList with search results by document name when not found in current data list
    if (
      documentData &&
      (firstFetching ||
        lastStatus === NetworkStatus.refetch ||
        (lastStatus === NetworkStatus.fetchMore && findDocumentByName))
    ) {
      setDocumentList({
        documents: documentData.documents,
        hasNextPage: documentData.hasNextPage,
        cursor: documentData.cursor,
        total: documentData.total,
      });
    }
  }, [documentLoading, lastStatus]);

  useSubscription(SUB_UPDATE_DOCUMENT_LIST, {
    variables: {
      input: {
        clientId: userId,
      },
    },
    onSubscriptionData: ({
      subscriptionData: {
        data: { updateDocumentList },
      },
    }) => {
      if (!updateDocumentList) return;
      const { statusCode, type, document, teamId, organizationId } = updateDocumentList;
      const additionalSettings = updateDocumentList.additionalSettings || {};
      if (statusCode === STATUS_CODE.SUCCEED) {
        let event = type;
        if (additionalSettings.keepInSearch && isSearchView) {
          event = SubscriptionConstants.Subscription.DOCUMENT_SETTINGS;
        }
        documentObservable.notify({
          event,
          data: {
            teamId,
            organizationId,
            document,
            currentUserId: userId,
            isSearchView,
          },
        });
      }
    },
  });

  useSubscription(SUB_UPDATE_DOCUMENT_INFO, {
    variables: {
      input: {
        clientId: userId,
      },
    },
    onSubscriptionData: ({
      subscriptionData: {
        data: { updateDocumentInfo },
      },
    }) => {
      const { ownerId, document, type } = updateDocumentInfo;
      if (document.ownerName !== currentUser.name && userId === ownerId) {
        const newCurrentUser = {
          ...currentUser,
          name: document.ownerName,
        };
        dispatch(actions.setCurrentUser(newCurrentUser));
      }
      documentObservable.notify({
        event: type,
        data: {
          document,
          currentUserId: userId,
        },
      });
    },
  });

  useSubscription(SUB_DELETE_ORIGINAL_DOCUMENT, {
    variables: {
      clientId: userId,
    },
    onSubscriptionData: ({
      subscriptionData: {
        data: { deleteOriginalDocument },
      },
    }) => {
      if (!deleteOriginalDocument) return;
      const { statusCode, type, documentList: deletedDocList, teamId, organizationId } = deleteOriginalDocument;
      const additionalSettings = deleteOriginalDocument.additionalSettings || {};
      if (statusCode !== STATUS_CODE.SUCCEED || (additionalSettings.keepInSearch && isSearchView)) {
        return;
      }
      documentObservable.notify({
        event: type,
        data: {
          teamId,
          organizationId,
          documentList: deletedDocList,
          currentUserId: userId,
        },
      });
    },
  });

  useSubscription(SUB_UPDATE_TEAMS,
    {
      variables: {
        input: {
          clientId: userId,
        },
      },
      onSubscriptionData: ({ subscriptionData: { data: { updateTeams } } }) => {
        const { team: teamUpdated, type } = updateTeams;
        switch (type) {
          case SubscriptionConstants.Subscription.UPDATE_TEAMS_INFO:
            if (clientId === teamUpdated._id) {
              dispatch(actions.updateTeamById(clientId, teamUpdated));
            }
            break;
          case SubscriptionConstants.Subscription.REMOVE_TEAM:
            if (currentFolderType === folderType.TEAMS && clientId === teamUpdated._id) {
              const modalSettings = {
                type: ModalTypes.WARNING,
                title: t('common.warning'),
                message:
                (
                  <Trans
                    i18nKey="removeTeamModal.message"
                    // eslint-disable-next-line react/react-in-jsx-scope
                    components={{ b: <span className="Container__Content--message-bold" /> }}
                    values={{ teamName: teamUpdated.name }}
                />
                ),
                confirmButtonTitle: t('common.ok'),
                disableBackdropClick: true,
                disableEscapeKeyDown: true,
                onConfirm: () => {
                  const index = teams.indexOf(teams.find((item) => teamUpdated._id === item._id));
                  if (index !== -1) {
                    const newTeams = [...teams];
                    newTeams.splice(index, 1);
                    dispatch(actions.updateTeamById(newTeams[0]._id, newTeams[0]));
                  }
                },
              };
              openModal(modalSettings);
            } else {
              const index = teams.indexOf(teams.find((item) => teamUpdated._id === item._id));
              if (index !== -1) {
                const newTeams = [...teams];
                newTeams.splice(index, 1);
                dispatch(actions.updateTeamById(newTeams[0]._id, newTeams[0]));
              }
            }
            break;
          default:
            break;
        }
      },
    });

  const fetchMoreData = () =>
    fetchMore(
      (_, { fetchMoreResult: { getDocuments } }) => {
        setDocumentList({
          documents: getDocuments.documents,
          hasNextPage: getDocuments.hasNextPage,
          cursor: getDocuments.cursor,
          total: getDocuments.total,
        });
      },
      {
        input: {
          query: {
            cursor: documentCursor,
          },
        },
      }
    ).catch(() => {});

  function onDocumentError(error) {
    const { code: errorCode } = errorExtract.extractGqlError(error);
    if (errorCode === ErrorCode.Common.FORBIDDEN) {
      const modalSettings = {
        type: ModalTypes.WARNING,
        title: t('updatedPermissonModal.title'),
        message: t('updatedPermissonModal.message'),
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        isFullWidthButton: true,
        confirmButtonTitle: t('common.reload'),
        onConfirm: () => window.location.reload(),
      };
      openModal(modalSettings);
    }
  }

  return children({
    loading: documentLoading,
    documentList,
    hasNextPage,
    fetchMore: fetchMoreData,
    refetch,
    total: totalDocuments,
    error,
  });

};

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  documents: selectors.getDocumentList(state),
  teams: selectors.getTeams(state),
  currentOrganization: selectors.getCurrentOrganization(state),
});

const mapDispatchToProps = (dispatch) => ({
  openModal: (modalSettings) => dispatch(actions.openModal(modalSettings)),
  resetFetchingStateOfDoclist: () => dispatch(actions.refreshFetchingState()),
  setDocumentLoading: ({ loading, currentFolderType }) =>
    dispatch(actions.setDocumentLoading({ loading, currentFolderType })),
  refetchCurrentDocListState: ({ currentFolderType, refId }) =>
    dispatch(actions.refetchCurrentDocListState({ currentFolderType, refId })),
  resetFolderList: () => dispatch(actions.resetFolderList()),
  resetDocumentList: () => dispatch(actions.resetDocumentList()),
});

const getQuery = (props, { isInOrgPage }) => {
  switch (props.currentFolderType) {
    case folderType.TEAMS:
      return GET_ORGANIZATION_TEAM_DOCUMENTS;
    case folderType.ORGANIZATION:
      return GET_ORGANIZATION_DOCUMENTS;
    case folderType.INDIVIDUAL:
    case folderType.SHARED:
    case folderType.STARRED:
      if (isInOrgPage) {
        return GET_ORGANIZATION_DOCUMENTS;
      }
      return MORE_DOCUMENTS_USER;
    default:
      return null;
  }
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withGetFolderType,
  withQueries(getQuery, {
    variables: ({ currentFolderType, baseQueryDocuments }) => {
      const restBaseQuery = { ...baseQueryDocuments };
      if ([folderType.INDIVIDUAL, folderType.TEAMS].includes(currentFolderType)) {
        delete restBaseQuery.clientId;
      }
      if (currentFolderType === folderType.TEAMS) {
        delete restBaseQuery.tab;
        delete restBaseQuery.orgId;
      }
      return {
        input: restBaseQuery,
      };
    },
    onLoadingChange: (loadingState, props) =>
      props.setDocumentLoading({ loading: loadingState, currentFolderType: props.currentFolderType }),
      abortOptions: {
        deps: (props) => [props.searchKey],
      },
    fetchPolicy: (props) => (props.searchKey ? FETCH_POLICY.NO_CACHE : FETCH_POLICY.CACHE_FIRST),
  })
)(DocumentQuery);
