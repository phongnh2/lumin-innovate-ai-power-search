import { useCallback, useEffect, useMemo, useRef } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import useGetFolderType from 'hooks/useGetFolderType';

import { FolderServices, indexedDBService } from 'services';

import errorUtils from 'utils/error';

import { folderType } from 'constants/documentConstants';

import useGetAllFolderParams from './useGetAllFolderParams';

function useGetAllFolder({ type, sortKey, sortDirection, parentId, searchKey = '' }) {
  const dispatch = useDispatch();
  const currentFolderType = useGetFolderType();
  const isOffline = useSelector(selectors.isOffline);
  const activeFolderType = useRef(currentFolderType);
  const { data: value, loading, error } = useSelector(selectors.getFolderList, shallowEqual);
  const folderServices = useMemo(() => new FolderServices(type), [type]);
  const params = useGetAllFolderParams();
  const isSharedTab = currentFolderType === folderType.SHARED;
  const { folderId } = useParams();
  const prevFolderIdRef = useRef(null);

  const setFolderList = useCallback((data) => dispatch(actions.setFolderList(data)), [dispatch]);

  useEffect(() => {
    activeFolderType.current = currentFolderType;
  }, [currentFolderType]);

  const getAll = useCallback(
    async ({ signal }) => {
      if (searchKey !== '' && prevFolderIdRef.current !== folderId) {
        return;
      }
      try {
        dispatch(actions.resetFolderList());
        const folders = await folderServices.getAll({
          sortOptions: {
            [sortKey]: sortDirection,
          },
          parentId,
          searchKey,
          fetchOptions: { signal },
          ...params,
        });
        if (activeFolderType.current === currentFolderType) {
          const payload = isSharedTab ? [] : folders;
          setFolderList(payload);
          indexedDBService.setFolderList(payload);
        }
      } catch (err) {
        if (!errorUtils.isAbortError(err)) {
          dispatch(actions.fetchFolderListFailed(err));
        }
      } finally {
        prevFolderIdRef.current = folderId;
      }
    },
    [
      dispatch,
      folderServices,
      sortKey,
      sortDirection,
      parentId,
      searchKey,
      params,
      currentFolderType,
      isSharedTab,
      setFolderList,
    ]
  );
  useEffect(() => {
    const controller = new AbortController();
    if (!isOffline) {
      getAll({ signal: controller.signal });
    }
    return () => {
      controller.abort();
    };
  }, [searchKey, isOffline, getAll]);

  return {
    error,
    loading,
    value,
    retry: getAll,
    update: setFolderList,
    sortOption: {
      sortKey,
      sortDirection,
    },
  };
}

export default useGetAllFolder;
