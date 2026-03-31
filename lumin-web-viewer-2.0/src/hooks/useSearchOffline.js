import Fuse from 'fuse.js';
import { useEffect, useRef, useState } from 'react';
import { batch, useDispatch } from 'react-redux';

import actions from 'actions';

import { usePrevious } from 'hooks/usePrevious';

import indexedDBService from 'services/indexedDBService';

import { useForwardOfflineDocuments } from './useForwardOfflineDocuments';

function useSearchOffline(props) {
  const { setCloudDocuments, setCloudLoading, cachingDocuments, getOfflineDocumentList } = props;

  const canForward = useForwardOfflineDocuments();
  const [searchKey, setSearchKey] = useState('');
  const [isFocusing, setFocusing] = useState(false);
  const dispatch = useDispatch();
  const prevSearchKey = usePrevious(searchKey);

  const cachedFolders = useRef([]);

  const setFolders = (folders) => {
    dispatch(actions.setFolderList(canForward ? folders : []));
  };

  const onSearch = (text) => {
    batch(() => {
      dispatch(actions.resetFolderList());
      setCloudLoading(true);
      setCloudDocuments([]);
      setSearchKey(text);
    });
  };

  useEffect(() => {
    indexedDBService.getOfflineDocumentListInfo().then((data) => {
      cachedFolders.current = data?.folders || [];
      setFolders(data?.folders || []);
    });
  }, [canForward, dispatch]);

  useEffect(() => {
    if (searchKey) {
      const data = [...cachedFolders.current.map((item) => ({ ...item, isFolder: true })), ...cachingDocuments];
      const fuse = new Fuse(data, {
        keys: ['name'],
      });

      const results = fuse.search(searchKey).reduce(
        (acc, currentValue) => {
          const { isFolder, ...item } = currentValue.item;
          (isFolder ? acc.folders : acc.documents).push(item);
          return acc;
        },
        {
          folders: [],
          documents: [],
        }
      );

      setCloudDocuments(results.documents);
      setCloudLoading(false);
      dispatch(actions.setFolderList(results.folders));
    }
  }, [cachingDocuments, searchKey, dispatch, setCloudDocuments, setCloudLoading]);

  useEffect(() => {
    let cancel = () => {};
    if (prevSearchKey && !searchKey) {
      setCloudLoading(true);
      setFolders(cachedFolders.current);
      cancel = getOfflineDocumentList();
    }

    return () => {
      cancel();
    };
  }, [prevSearchKey, setCloudDocuments, setCloudLoading, searchKey, getOfflineDocumentList]);

  return {
    searchKey,
    setSearchKey: onSearch,
    isFocusing,
    setFocusing,
  };
}

export { useSearchOffline };
