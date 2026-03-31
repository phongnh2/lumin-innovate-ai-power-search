import produce from 'immer';
import { remove } from 'lodash';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import { client } from 'src/apollo';

import { GET_DOCUMENTS_IN_FOLDER } from 'graphQL/DocumentGraph';

import { useBaseQuery, usePrevious } from 'hooks';

import indexedDBService from 'services/indexedDBService';

import errorUtils from 'utils/error';

import { FETCH_POLICY } from 'constants/graphConstant';

import { useUpdateFolderDocuments } from './useUpdateFolderDocuments';

const initialPageInfo = { cursor: null, hasNextPage: false };

export function useFolderDocuments({ searchKey, isFocusing }) {
  const prevSearchKey = usePrevious(searchKey);
  const baseQueryDocuments = useBaseQuery({ searchKey });
  const pageInfo = useRef(initialPageInfo);
  const [documentList, setDocumentList] = useState([]);
  const [totalDoc, setTotalDoc] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isSearchView = isFocusing || Boolean(searchKey);
  const { folderId } = baseQueryDocuments;
  const controller = useMemo(() => new AbortController(), [searchKey, folderId]);
  const prevFolderIdRef = useRef(null);

  const isRefetchAction = () => !pageInfo.current.cursor;

  const addCursorToQuery = (q) => {
    const currentCursor = pageInfo.current.cursor;
    return currentCursor
      ? {
          ...q,
          query: {
            ...q.query,
            cursor: currentCursor,
          },
        }
      : q;
  };

  const fetchDocumentQuery = useCallback(() => {
    if (searchKey !== '' && prevFolderIdRef.current !== folderId) {
      return {
        data: {
          getDocuments: {
            documents: [],
            cursor: '',
            hasNextPage: false,
            total: 0,
          },
        },
      };
    }
    const { signal } = controller;
    prevFolderIdRef.current = folderId;
    return client.query({
      query: GET_DOCUMENTS_IN_FOLDER,
      fetchPolicy: FETCH_POLICY.NO_CACHE,
      variables: {
        input: addCursorToQuery(baseQueryDocuments),
      },
      context: {
        fetchOptions: {
          signal,
        },
      },
    });
  }, [baseQueryDocuments]);

  const updateDocumentsAfterFetching = useCallback(({ documents, cursor, hasNextPage, total }) => {
    pageInfo.current = { cursor, hasNextPage };
    let cloudDocuments = documents;
    if (isRefetchAction()) {
      setDocumentList(documents);
    } else {
      setDocumentList((prevDocuments) => {
        const newDocuments = documents.filter(({ _id }) => prevDocuments.findIndex((item) => item._id === _id) === -1);
        const results = [...prevDocuments, ...newDocuments];
        cloudDocuments = results;
        return cloudDocuments;
      });
    }
    indexedDBService.setCloudDoclist(cloudDocuments);
    setTotalDoc(total);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const {
        data: { getDocuments },
      } = await fetchDocumentQuery();
      updateDocumentsAfterFetching(getDocuments);
      setLoading(false);
    } catch (_error) {
      if (!errorUtils.isAbortError(_error)) {
        setError(_error);
        setLoading(false);
      }
    }
  }, [fetchDocumentQuery, updateDocumentsAfterFetching]);

  const fetchDataWithResetLoading = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const addNewDocumentHandler = (updatedDocument) => {
    const updatedDocumentIdx = documentList.findIndex((item) => item._id === updatedDocument._id);

    if (updatedDocumentIdx === -1) {
      setTotalDoc((prevState) => prevState + 1);
      setDocumentList((prevDocuments) => [updatedDocument, ...prevDocuments]);
    } else {
      setDocumentList((prevDocuments) => {
        const prevDocs = [...prevDocuments];
        prevDocs.splice(updatedDocumentIdx, 1);
        return [updatedDocument, ...prevDocs];
      });
    }
  };

  const updateDocInfoHandler = ({ document }) => {
    setDocumentList((prevDocuments) =>
      produce(prevDocuments, (draft) => {
        const updatedDocumentIdx = draft.findIndex((item) => item._id === document._id);
        if (updatedDocumentIdx !== -1) {
          Object.assign(draft[updatedDocumentIdx], document);
        }
      })
    );
  };

  const refetchData = useCallback(() => {
    pageInfo.current = initialPageInfo;
    setDocumentList([]);
    fetchDataWithResetLoading();
  }, [fetchDataWithResetLoading]);

  const removeDocumentsHandler = (documentIds) => {
    const removeDocuments = documentList.filter((document) => documentIds.includes(document._id));
    setTotalDoc((total) => total - removeDocuments.length);
    if (documentList.length === removeDocuments.length) {
      refetchData();
    } else {
      setDocumentList((prevDocuments) =>
        produce(prevDocuments, (draftDocuments) => {
          remove(draftDocuments, (document) => documentIds.includes(document._id));
        })
      );
    }
  };

  useUpdateFolderDocuments({
    addNewDocumentHandler,
    updateDocInfoHandler,
    removeDocumentsHandler,
    isSearchView,
  });

  useEffect(() => {
    const controller = new AbortController();
    refetchData();

    return () => {
      controller.abort();
    };
  }, [searchKey, refetchData]);

  return {
    documentList,
    loading,
    hasNextPage: pageInfo.current.hasNextPage,
    total: totalDoc,
    fetchMore: fetchData,
    refetch: refetchData,
    setDocumentList,
    error,
    prevSearchKey,
  };
}
