import produce from 'immer';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { VirtuosoHandle } from 'react-virtuoso';

import actions from 'actions';

import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IFolder } from 'interfaces/folder/folder.interface';

const MAX_FIND_DOCUMENT_ATTEMPTS = 2;

type LocationStateType = {
  documentId: string;
  documentName: string;
};

type UseFindDocumentLocationProps = {
  folders: IFolder[];
  documents: IDocumentBase[];
  fetchMore: () => void;
  isHasMore: boolean;
  currentFolderType: string;
  isDocumentInFolder: boolean;
  setDocumentListInFolder: React.Dispatch<React.SetStateAction<IDocumentBase[]>>;
  virtuosoRef: React.MutableRefObject<VirtuosoHandle>;
};

const useFindDocumentLocation = (props: UseFindDocumentLocationProps) => {
  const {
    folders,
    documents,
    fetchMore,
    isHasMore,
    currentFolderType,
    isDocumentInFolder,
    setDocumentListInFolder,
    virtuosoRef,
  } = props;

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const locationState = (location.state || {}) as LocationStateType;
  const { documentId, documentName } = locationState;

  const findAttemps = useRef(1);
  const [findDocumentLoading, setFindDocumentLoading] = useState(true);
  const [documentIndex, setDocumentIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!documentId || !documentName) {
      setFindDocumentLoading(false);
    }
  }, [documentId, documentName]);

  // clear location state
  useEffect(() => {
    if (!findDocumentLoading && documentId) {
      const state = { ...locationState };
      delete state.documentId;
      navigate({ ...location, ...state }, { replace: true });
    }
  });

  // find document
  const findDocument = useCallback(() => {
    if (!documents.length || !documentId || !findDocumentLoading) {
      return;
    }
    dispatch(actions.setFoundDocumentScrolling({ folderType: currentFolderType, loading: true }));

    const foundIndex = documents.findIndex((document) => document._id === documentId);
    if (foundIndex === -1 && (!isHasMore || findAttemps.current === MAX_FIND_DOCUMENT_ATTEMPTS)) {
      setFindDocumentLoading(false);
      dispatch(actions.setFoundDocumentScrolling({ folderType: currentFolderType, loading: false }));
      setTimeout(() => {
        dispatch(actions.findDocumentByName(documentName));
      });
      // log
      logger.logInfo({
        reason: LOGGER.EVENT.FIND_DOCUMENT_LOCATION,
        attributes: {
          attemps: findAttemps.current,
          isFound: false,
          isReachedLimit: findAttemps.current === MAX_FIND_DOCUMENT_ATTEMPTS,
        },
      });
      return;
    }

    if (foundIndex !== -1) {
      if (isDocumentInFolder) {
        setDocumentListInFolder((prevDocuments) =>
          produce(prevDocuments, (draft) => {
            const targetDocument = draft.find((item) => item._id === documentId);
            targetDocument.highlightFoundDocument = true;
          })
        );
      } else {
        dispatch(actions.setHighlightFoundDocument({ documentId, highlight: true }));
      }
      setFindDocumentLoading(false);
      setDocumentIndex(foundIndex + folders.length);

      // log
      logger.logInfo({
        reason: LOGGER.EVENT.FIND_DOCUMENT_LOCATION,
        attributes: {
          attemps: findAttemps.current,
          isFound: true,
        },
      });
    } else {
      fetchMore();
    }

    findAttemps.current += 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, documents.length, folders.length]);

  useEffect(() => {
    findDocument();
  }, [findDocument]);

  // [start] handle scroll

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!virtuosoRef.current || documentIndex === null) {
        return;
      }

      virtuosoRef.current.scrollToIndex({ index: documentIndex, align: 'center', behavior: 'smooth' });
      dispatch(actions.setFoundDocumentScrolling({ folderType: currentFolderType, loading: false }));
      setDocumentIndex(null);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentFolderType, dispatch, documentIndex]);
  // [end] handle scroll

  return {
    findDocumentLoading,
  };
};

export default useFindDocumentLocation;
