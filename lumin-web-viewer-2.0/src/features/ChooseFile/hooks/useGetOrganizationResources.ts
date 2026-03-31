import { useQuery } from '@apollo/client';
import merge from 'lodash/merge';
import { useMemo, useCallback } from 'react';

import { GET_ORGANIZATION_RESOURCES } from 'graphQL/OrganizationGraph';

import { useGetCurrentOrganization } from 'hooks';

import logger from 'helpers/logger';

import { errorUtils } from 'utils';

import { GetOrganizationResourcesPayload } from 'features/HomeSearch/types';

import { MINIMUM_DOCUMENT_QUANTITY } from 'constants/documentConstants';

import useChooseFileContext from './useChooseFileContext';
import { ActionTypes } from '../reducers/ChooseFile.reducer';
import { ListDataType } from '../types';

const useGetOrganizationResources = () => {
  const currentOrganization = useGetCurrentOrganization();
  const { state, dispatch } = useChooseFileContext();

  const { searchKey, locationData } = state;

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

  const { fetchMore } = useQuery<{
    getOrganizationResources: GetOrganizationResourcesPayload;
  }>(GET_ORGANIZATION_RESOURCES, {
    fetchPolicy: 'cache-first',
    variables: queryVariables,
    skip: !searchKey.length,
    onCompleted: ({ getOrganizationResources }) => {
      dispatch({ type: ActionTypes.SET_LOCATION_LOADING, payload: { value: false } });
      const { folders, documents, cursor } = getOrganizationResources;
      const foldersWithKind: ListDataType[] = folders.map((folder) => ({ ...folder, kind: 'folder' }));
      const documentsWithKind: ListDataType[] = documents.map((doc) => ({ ...doc, kind: 'document' }));
      dispatch({
        type: ActionTypes.SET_LOCATION_DATA,
        payload: {
          data: [...foldersWithKind, ...documentsWithKind],
          cursor,
          hasNextPage: Boolean(cursor),
        },
      });
    },
    onError: (error) => {
      dispatch({ type: ActionTypes.SET_LOCATION_LOADING, payload: { value: false } });
      if (!error) {
        return;
      }
      const { message } = errorUtils.extractGqlError(error) as { message: string };
      logger.logError({ message, error });
    },
  });

  const getMore = useCallback(async () => {
    if (!locationData.pagination.cursor) {
      return;
    }

    await fetchMore({
      variables: { ...merge({}, { input: { cursor: locationData.pagination.cursor } }, queryVariables) },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previousResult;

        const { documents, folders, cursor } = fetchMoreResult.getOrganizationResources;
        const mergedDocuments = [...previousResult.getOrganizationResources.documents, ...documents];
        const mergedFolders = [...previousResult.getOrganizationResources.folders, ...folders];
        const foldersWithKind: ListDataType[] = mergedFolders.map((folder) => ({ ...folder, kind: 'folder' }));
        const documentsWithKind: ListDataType[] = mergedDocuments.map((doc) => ({ ...doc, kind: 'document' }));

        dispatch({
          type: ActionTypes.SET_LOCATION_DATA,
          payload: {
            data: [...foldersWithKind, ...documentsWithKind],
            cursor,
            hasNextPage: Boolean(cursor),
          },
        });
        return {
          getOrganizationResources: {
            ...fetchMoreResult.getOrganizationResources,
            documents: mergedDocuments,
            folders: mergedFolders,
          },
        };
      },
    });
  }, [dispatch, fetchMore, locationData.pagination.cursor, queryVariables]);

  return {
    getMoreInSearching: searchKey.length ? getMore : undefined,
  };
};

export default useGetOrganizationResources;
