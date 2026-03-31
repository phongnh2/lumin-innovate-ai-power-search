import { useCallback, useEffect } from 'react';

import { getFoldersInFolder } from 'services/graphServices/folder';

import logger from 'helpers/logger';

import { errorUtils } from 'utils';

import { DocumentTab, folderType } from 'constants/documentConstants';

import useChooseFileContext from './useChooseFileContext';
import {
  getDocumentsInFolder,
  getOrganizationDocuments,
  getOrganizationFolders,
  getOrganizationTeamDocuments,
  getOrganizationTeamFolders,
  getPersonalFoldersInOrg,
} from '../apis';
import { ActionTypes } from '../reducers/ChooseFile.reducer';
import { ListDataType } from '../types';

const useGetChooseFileList = () => {
  const { state, dispatch } = useChooseFileContext();
  const { locationData, breadcrumbData } = state;

  const getFolders = useCallback(() => {
    const lastItem = breadcrumbData[breadcrumbData.length - 1];
    if (breadcrumbData.length > 1) {
      return getFoldersInFolder({ folderId: lastItem._id });
    }

    const { folderType: locationType, _id: locationId } = lastItem;
    switch (locationType) {
      case folderType.ORGANIZATION:
        return getOrganizationFolders(locationId);
      case folderType.TEAMS:
        return getOrganizationTeamFolders(locationId);
      default:
        return getPersonalFoldersInOrg(locationId);
    }
  }, [breadcrumbData]);

  const getDocuments = useCallback(
    (cursor?: string) => {
      const lastItem = breadcrumbData[breadcrumbData.length - 1];
      if (breadcrumbData.length > 1) {
        return getDocumentsInFolder(lastItem._id, cursor);
      }

      const { folderType: locationType, _id: locationId } = lastItem;
      if (locationType === folderType.TEAMS) {
        return getOrganizationTeamDocuments(locationId, cursor);
      }

      return getOrganizationDocuments(
        locationId,
        locationType === folderType.INDIVIDUAL ? DocumentTab.MY_DOCUMENT : DocumentTab.ORGANIZATION,
        cursor
      );
    },
    [breadcrumbData]
  );

  const getListData = useCallback(async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOCATION_LOADING, payload: { value: true } });
      const folders = await getFolders();

      const documenstResponse = await getDocuments();

      const { documents, hasNextPage, cursor } = documenstResponse;
      const foldersWithKind: ListDataType[] = folders.map((folder) => ({ ...folder, kind: 'folder' }));
      const documentsWithKind: ListDataType[] = documents.map((doc) => ({ ...doc, kind: 'document' }));
      const mergedData = [...foldersWithKind, ...documentsWithKind];

      dispatch({
        type: ActionTypes.SET_LOCATION_DATA,
        payload: {
          data: mergedData,
          hasNextPage,
          cursor,
        },
      });
    } catch (error: unknown) {
      if (!error) {
        return;
      }
      const { message } = errorUtils.extractGqlError(error) as { message: string };
      logger.logError({ message, error });
    } finally {
      dispatch({ type: ActionTypes.SET_LOCATION_LOADING, payload: { value: false } });
    }
  }, [getFolders, getDocuments, dispatch]);

  useEffect(() => {
    if (!state.searchKey) {
      getListData().catch(() => {});
    }
  }, [getListData, state.searchKey, state.breadcrumbData]);

  const getMore = useCallback(async () => {
    const { hasNextPage, cursor } = locationData.pagination;
    if (!hasNextPage) {
      return;
    }

    try {
      const prevData = locationData.data;
      const fetchMoreResponse = await getDocuments(cursor);
      const documentsWithKind: ListDataType[] = fetchMoreResponse.documents.map((doc) => ({
        ...doc,
        kind: 'document',
      }));
      const mergedData = [...prevData, ...documentsWithKind];

      dispatch({
        type: ActionTypes.SET_LOCATION_DATA,
        payload: {
          data: mergedData,
          hasNextPage: fetchMoreResponse.hasNextPage,
          cursor: fetchMoreResponse.cursor,
        },
      });
    } catch (error: unknown) {
      if (!error) {
        return;
      }
      const { message } = errorUtils.extractGqlError(error) as { message: string };
      logger.logError({ message, error });
    }
  }, [dispatch, getDocuments, locationData.data, locationData.pagination]);

  return {
    getMore,
  };
};

export default useGetChooseFileList;
