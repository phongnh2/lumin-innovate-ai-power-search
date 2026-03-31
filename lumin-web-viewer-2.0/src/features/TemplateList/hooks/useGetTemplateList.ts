import { useQuery } from '@apollo/client';
import merge from 'lodash/merge';
import { useMemo, useCallback, useContext } from 'react';

import { GET_ORGANIZATION_DOCUMENT_TEMPLATES } from 'graphQL/OrganizationGraph';
import { GET_ORGANIZATION_TEAM_DOCUMENT_TEMPLATES } from 'graphQL/TeamGraph';

import { useGetCurrentOrganization, useGetCurrentTeam, useGetFolderType } from 'hooks';

import logger from 'helpers/logger';

import { errorUtils } from 'utils';

import { DocumentTab, folderType, MINIMUM_DOCUMENT_QUANTITY } from 'constants/documentConstants';

import { ITeam } from 'interfaces/team/team.interface';

import { TemplateListContext } from '../contexts/TemplateList.context';
import { ActionTypes } from '../reducers/TemplateList.reducer';
import { GetTemplateListPayload } from '../types/templateList';

const useGetDocumentTemplatesQueryParams = () => {
  const currentFolderType = useGetFolderType();
  const currentOrganization = useGetCurrentOrganization();
  const currentTeam = useGetCurrentTeam() as ITeam;

  const query = useMemo(() => {
    switch (currentFolderType) {
      case folderType.TEAMS:
        return GET_ORGANIZATION_TEAM_DOCUMENT_TEMPLATES;
      case folderType.INDIVIDUAL:
      case folderType.ORGANIZATION:
        return GET_ORGANIZATION_DOCUMENT_TEMPLATES;
      default:
        return null;
    }
  }, [currentFolderType]);

  const variables = useMemo(() => {
    switch (currentFolderType) {
      case folderType.TEAMS:
        return {
          input: {
            teamId: currentTeam._id,
            query: { minimumQuantity: MINIMUM_DOCUMENT_QUANTITY },
          },
        };
      case folderType.INDIVIDUAL:
        return {
          input: {
            orgId: currentOrganization._id,
            query: { minimumQuantity: MINIMUM_DOCUMENT_QUANTITY },
            tab: DocumentTab.MY_DOCUMENT,
          },
        };
      case folderType.ORGANIZATION:
        return {
          input: {
            orgId: currentOrganization._id,
            query: { minimumQuantity: MINIMUM_DOCUMENT_QUANTITY },
            tab: DocumentTab.ORGANIZATION,
          },
        };
      default:
        return null;
    }
  }, [currentFolderType, currentTeam, currentOrganization]);

  return { query, variables };
};

export const useGetDocumentTemplates = () => {
  const { state, dispatch } = useContext(TemplateListContext);
  const { pagination } = state;

  const { query, variables } = useGetDocumentTemplatesQueryParams();

  const { loading, refetch, fetchMore } = useQuery<{
    getDocuments: GetTemplateListPayload;
  }>(query, {
    fetchPolicy: 'network-only',
    variables,
    onCompleted: ({ getDocuments }) => {
      dispatch({ type: ActionTypes.SET_FETCHING_TEMPLATES, payload: { isFetching: false } });
      const { documents, hasNextPage, cursor } = getDocuments;
      dispatch({
        type: ActionTypes.SET_TEMPLATES,
        payload: {
          documents,
          hasNextPage,
          cursor,
        },
      });
    },
    onError: (error) => {
      dispatch({ type: ActionTypes.SET_FETCHING_TEMPLATES, payload: { isFetching: false } });
      if (!error) {
        return;
      }
      const { message } = errorUtils.extractGqlError(error) as { message: string };
      logger.logError({ message, error });
    },
  });

  const getMore = useCallback(
    async (setLoading?: (value: boolean) => void) => {
      if (!pagination.hasNextPage) {
        return;
      }

      setLoading?.(true);
      await fetchMore({
        variables: { ...merge({}, { input: { query: { cursor: pagination.cursor } } }, variables as object) },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          const { documents, hasNextPage, cursor } = fetchMoreResult.getDocuments;
          const mergedDocuments = [...previousResult.getDocuments.documents, ...documents];

          dispatch({
            type: ActionTypes.SET_TEMPLATES,
            payload: {
              documents: mergedDocuments,
              hasNextPage,
              cursor,
            },
          });

          return {
            getDocuments: {
              ...fetchMoreResult.getDocuments,
              documents: mergedDocuments,
            },
          };
        },
      });
      setLoading?.(false);
    },
    [dispatch, fetchMore, pagination.cursor, pagination.hasNextPage, variables]
  );

  return {
    loading,
    refetch,
    getMore,
  };
};
