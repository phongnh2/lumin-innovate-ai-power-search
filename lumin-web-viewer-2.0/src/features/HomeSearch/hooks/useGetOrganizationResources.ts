import { useQuery } from '@apollo/client';
import merge from 'lodash/merge';
import { useContext, useCallback, useMemo, useEffect } from 'react';

import { GET_ORGANIZATION_RESOURCES } from 'graphQL/OrganizationGraph';

import { useGetCurrentOrganization } from 'hooks';

import logger from 'helpers/logger';

import { errorUtils } from 'utils';

import { MINIMUM_DOCUMENT_QUANTITY } from 'constants/documentConstants';

import { SearchResultContext } from '../contexts';
import { ActionTypes } from '../reducers';
import { GetOrganizationResourcesPayload } from '../types';

type UseGetOrganizationResourcesProps = {
  searchKey: string;
};

export const useGetOrganizationResources = ({ searchKey }: UseGetOrganizationResourcesProps) => {
  const { state, dispatch } = useContext(SearchResultContext);

  useEffect(() => {
    dispatch({
      type: ActionTypes.SET_SEARCH_KEY,
      payload: {
        value: searchKey,
      },
    });
  }, [dispatch, searchKey]);

  const currentOrganization = useGetCurrentOrganization();

  const queryVariables = useMemo(
    () => ({
      input: {
        orgId: currentOrganization._id,
        limit: MINIMUM_DOCUMENT_QUANTITY,
        searchKey,
      },
    }),
    [currentOrganization._id, searchKey]
  );

  useEffect(() => {
    if (!searchKey) {
      dispatch({
        type: ActionTypes.SET_LIST_DATA,
        payload: {
          folders: [],
          documents: [],
          total: 0,
          cursor: null,
        },
      });
    }
  }, [searchKey, dispatch]);

  const { refetch, fetchMore, loading } = useQuery<{
    getOrganizationResources: GetOrganizationResourcesPayload;
  }>(GET_ORGANIZATION_RESOURCES, {
    fetchPolicy: 'network-only',
    variables: queryVariables,
    skip: !searchKey,
    onCompleted: ({ getOrganizationResources }) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { value: false } });
      const { folders, documents, cursor, total } = getOrganizationResources;
      dispatch({
        type: ActionTypes.SET_LIST_DATA,
        payload: {
          folders,
          documents,
          total,
          cursor,
        },
      });
    },
    onError: (error) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { value: false } });
      if (!error) {
        return;
      }
      const { message } = errorUtils.extractGqlError(error) as { message: string };
      logger.logError({ message, error });
    },
  });

  useEffect(() => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: { value: loading } });
  }, [dispatch, loading]);

  const getMore = useCallback(
    async (setLoading?: (value: boolean) => void) => {
      if (!state.cursor) {
        return;
      }

      setLoading?.(true);
      await fetchMore({
        variables: { ...merge({}, { input: { cursor: state.cursor } }, queryVariables) },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;

          const { folders, documents, cursor } = fetchMoreResult.getOrganizationResources;
          const mergedFolders = [...previousResult.getOrganizationResources.folders, ...folders];
          const mergedDocuments = [...previousResult.getOrganizationResources.documents, ...documents];

          dispatch({
            type: ActionTypes.SET_LIST_DATA,
            payload: {
              folders: mergedFolders,
              documents: mergedDocuments,
              cursor,
            },
          });
          return {
            getOrganizationResources: {
              ...fetchMoreResult.getOrganizationResources,
              folders: mergedFolders,
              documents: mergedDocuments,
            },
          };
        },
      });
      setLoading?.(false);
    },
    [dispatch, fetchMore, state.cursor, queryVariables]
  );

  return {
    refetch,
    getMore,
  };
};
