import { useQuery } from '@apollo/client';
import merge from 'lodash/merge';
import { useContext, useMemo, useCallback, useEffect } from 'react';

import { GET_ORGANIZATION_DOCUMENTS } from 'graphQL/OrganizationGraph';
import { GET_ORGANIZATION_TEAM_DOCUMENTS } from 'graphQL/TeamGraph';

import logger from 'helpers/logger';

import { errorUtils } from 'utils';

import { TrendingDocumentsContext } from '../contexts/TrendingDocuments.context';
import { ActionTypes } from '../reducers/TrendingDocuments.reducer';
import {
  DocumentQueryOrgIdentity,
  GetTrendingDocumentsInput,
  GetTrendingDocumentsPayload,
} from '../types/trendingDocuments';

export const useGetOrganizationDocuments = (input: GetTrendingDocumentsInput) => {
  const { state, dispatch } = useContext(TrendingDocumentsContext);
  const { pagination } = state;

  const query = useMemo(
    () =>
      (input.identity as DocumentQueryOrgIdentity).orgId ? GET_ORGANIZATION_DOCUMENTS : GET_ORGANIZATION_TEAM_DOCUMENTS,
    [input.identity]
  );

  const queryVariables = useMemo(
    () => ({
      input: {
        filter: input.filter,
        query: input.query,
        ...input.identity,
      },
    }),
    [input]
  );

  const { refetch, fetchMore, loading } = useQuery<{
    getDocuments: GetTrendingDocumentsPayload;
  }>(query, {
    fetchPolicy: 'network-only',
    variables: queryVariables,
    onCompleted: ({ getDocuments }) => {
      dispatch({ type: ActionTypes.SET_FETCHING_DOCUMENTS, payload: { isFetching: false } });
      const { documents, total, hasNextPage, cursor } = getDocuments;
      dispatch({
        type: ActionTypes.SET_DOCUMENTS,
        payload: {
          documents,
          total,
          hasNextPage,
          cursor,
        },
      });
    },
    onError: (error) => {
      dispatch({ type: ActionTypes.SET_FETCHING_DOCUMENTS, payload: { isFetching: false } });
      if (!error) {
        return;
      }
      const { message } = errorUtils.extractGqlError(error) as { message: string };
      logger.logError({ message, error });
    },
  });

  useEffect(() => {
    dispatch({ type: ActionTypes.SET_FETCHING_DOCUMENTS, payload: { isFetching: loading } });
  }, [dispatch, loading]);

  const getMore = useCallback(
    async (setLoading?: (value: boolean) => void) => {
      if (!pagination.hasNextPage) {
        return;
      }

      setLoading?.(true);
      await fetchMore({
        variables: { ...merge({}, { input: { query: { cursor: pagination.cursor } } }, queryVariables) },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          const { documents, total, hasNextPage, cursor } = fetchMoreResult.getDocuments;
          const mergedDocuments = [...previousResult.getDocuments.documents, ...documents];

          dispatch({
            type: ActionTypes.SET_DOCUMENTS,
            payload: {
              documents: mergedDocuments,
              total,
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
    [dispatch, fetchMore, pagination.cursor, pagination.hasNextPage, queryVariables]
  );

  return {
    refetch,
    getMore,
  };
};
