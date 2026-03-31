import { useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import { batch, useDispatch } from 'react-redux';
import { usePrevious } from 'hooks';
import actions from 'actions';

function useSearchSystemFile(props) {
  const {
    setSystemDocuments,
    systemDocuments,
    getSystemDocuments,
  } = props;

  const [searchKey, setSearchKey] = useState('');
  const [isFocusing, setFocusing] = useState(false);
  const prevSearchKey = usePrevious(searchKey);
  const dispatch = useDispatch();

  const onSearch = (text) => {
    batch(() => {
      text && setSystemDocuments([], { loading: true });
      setSearchKey(text);
    });
  };

  useEffect(() => {
    dispatch(actions.setFolderList([]));
  }, []);

  useEffect(() => {
    if (searchKey) {
      const fuse = new Fuse(systemDocuments, {
        keys: ['name'],
      });

      setSystemDocuments(fuse.search(searchKey).map(({ item }) => item));
    }
  }, [searchKey]);

  useEffect(() => {
    if (prevSearchKey && !searchKey) {
      getSystemDocuments();
    }
  }, [
    prevSearchKey,
    searchKey,
  ]);

  return {
    searchKey,
    setSearchKey: onSearch,
    isFocusing,
    setFocusing,
  };
}

export { useSearchSystemFile };
