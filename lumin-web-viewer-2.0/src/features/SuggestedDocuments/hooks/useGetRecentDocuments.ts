import { useQuery } from '@apollo/client';
import merge from 'lodash/merge';
import { useContext, useMemo, useCallback } from 'react';

import { GET_ORGANIZATION_DOCUMENTS } from 'graphQL/OrganizationGraph';

import logger from 'helpers/logger';

import { errorUtils } from 'utils';

import { RecentDocumentsContext } from '../contexts/RecentDocuments.context';
import { ActionTypes } from '../reducers/RecentDocument.reducer';
import { GetRecentDocumentsInput, GetRecentDocumentsPayload } from '../types/recentDocuments';

export const useGetRecentDocuments = (input: GetRecentDocumentsInput) => {
  const { state, dispatch } = useContext(RecentDocumentsContext);
  const { pagination } = state;

  const queryVariables = useMemo(() => ({ input }), [input]);

  const { refetch, fetchMore } = useQuery<{
    getDocuments: GetRecentDocumentsPayload;
  }>(GET_ORGANIZATION_DOCUMENTS, {
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
