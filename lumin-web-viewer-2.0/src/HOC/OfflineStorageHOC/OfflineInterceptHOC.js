/* eslint-disable sonarjs/cognitive-complexity */
import { produce } from 'immer';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import useGetFolderType from 'hooks/useGetFolderType';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { DOCUMENT_OFFLINE_STATUS, folderType } from 'constants/documentConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';
import { OFFLINE_STORAGE_ACTION, OFFLINE_STATUS } from 'constants/offlineConstant';

import Handler from './Handler/Handler';

import { cachingFileHandler } from '.';

function OfflineIntercept({ documents, children, ...rest }) {
  const dispatch = useDispatch();
  const [interceptDocuments, setInterceptDocuments] = useState([]);
  const { isViewer } = useViewerMatch();
  const currentFolderType = useGetFolderType();

  const documentsRef = useRef(documents);
  const interceptDocList = () => {
    const docCaching = cachingFileHandler.getAllStatus();
    const mappingDocuments = isViewer
      ? documents.filter(Boolean)
      : documents.filter((document) => document && document.service !== STORAGE_TYPE.SYSTEM);
    setInterceptDocuments(mappingDocuments.map((document) => ({
      ...document,
      offlineStatus: docCaching[document._id] || DOCUMENT_OFFLINE_STATUS.UNAVAILABLE,
    })));
  };

  const setViewerOfflineStatus = (currentOfflineStatus) => isViewer && dispatch(actions.setCurrentDocument(
    produce(documentsRef.current[0], (draftDocument) => ({ ...draftDocument, offlineStatus: currentOfflineStatus })),
  ));

  useEffect(() => {
    const handleStartingDownload = ({ _id: documentId }) => {
      if (isViewer) {
        setViewerOfflineStatus(DOCUMENT_OFFLINE_STATUS.DOWNLOADING);
      } else {
        setInterceptDocuments((prev) => produce(prev, ((draftState) => {
          const updatedDocumentIdx = draftState.map((document) => document._id).indexOf(documentId);
          if (updatedDocumentIdx !== -1) {
            draftState[updatedDocumentIdx] = {
              ...draftState[updatedDocumentIdx],
              offlineStatus: DOCUMENT_OFFLINE_STATUS.DOWNLOADING,
            };
          }
        })));
      }
    };

    const handleFinishedDownload = (documentId) => {
      if (isViewer) {
        setViewerOfflineStatus(DOCUMENT_OFFLINE_STATUS.AVAILABLE);
      } else {
        setInterceptDocuments((prev) => produce(prev, ((draftState) => {
          const updatedDocumentIdx = draftState.map((document) => document._id).indexOf(documentId);
          if (updatedDocumentIdx !== -1) {
            draftState[updatedDocumentIdx] = {
              ...draftState[updatedDocumentIdx],
              offlineStatus: DOCUMENT_OFFLINE_STATUS.AVAILABLE,
            };
          }
        })));
      }
    };

    const handleDelete = (documentId) => {
      if (isViewer) {
        setViewerOfflineStatus(DOCUMENT_OFFLINE_STATUS.UNAVAILABLE);
      } else {
        setInterceptDocuments((prev) => produce(prev, ((draftState) => {
          const updatedDocumentIdx = draftState.map((document) => document._id).indexOf(documentId);
          if (updatedDocumentIdx !== -1) {
            draftState[updatedDocumentIdx] = {
              ...draftState[updatedDocumentIdx],
              offlineStatus: DOCUMENT_OFFLINE_STATUS.UNAVAILABLE,
            };
          }
        })));
      }
    };

    const handleDeleteAll = () => {
      if (isViewer) {
        setViewerOfflineStatus(DOCUMENT_OFFLINE_STATUS.UNAVAILABLE);
      } else {
        setInterceptDocuments((prev) =>
          produce(prev, (draftState) => {
            draftState.forEach((document) => {
              if (document.offlineStatus !== DOCUMENT_OFFLINE_STATUS.UNAVAILABLE) {
                document.offlineStatus = DOCUMENT_OFFLINE_STATUS.UNAVAILABLE;
              }
            });
          })
        );
      }
    };

    const handleMessage = ({ initiator, action, data, process }) => {
      if (!initiator) {
        switch (action) {
          case Handler.EVENTS.STARTING_DOWNLOAD:
            handleStartingDownload(data);
            break;
          case Handler.EVENTS.FINISHED_DOWNLOAD:
            handleFinishedDownload(data);
            break;
          case Handler.EVENTS.DELETE_CACHING_FILE:
            handleDelete(data);
            break;
          default:
            break;
        }
      }

      if (
        process.success &&
        process.status === OFFLINE_STATUS.OK &&
        process.action === OFFLINE_STORAGE_ACTION.CLEAN_SOURCE
      ) {
        handleDeleteAll();
      }
    };

    cachingFileHandler.addEventListener(Handler.EVENTS.STARTING_DOWNLOAD, handleStartingDownload);

    cachingFileHandler.addEventListener(Handler.EVENTS.DOWNLOAD_FAILED, handleDelete);

    cachingFileHandler.addEventListener(Handler.EVENTS.FINISHED_DOWNLOAD, handleFinishedDownload);

    cachingFileHandler.addEventListener(Handler.EVENTS.DELETE_CACHING_FILE, handleDelete);

    cachingFileHandler.subServiceWorkerHandler(handleMessage);

    return () => {
      cachingFileHandler.removeAllEventListener();
      cachingFileHandler.unSubServiceWorkerHandler(handleMessage);
    };
  }, []);

  useEffect(() => {
    if (Handler.isOfflineEnabled && currentFolderType !== folderType.DEVICE) {
      interceptDocList();
    } else {
      setInterceptDocuments(documents);
    }
    documentsRef.current = documents;
  }, [documents]);

  return children({ ...rest, documents: interceptDocuments });
}

OfflineIntercept.propTypes = {
  documents: PropTypes.array.isRequired,
};

export default OfflineIntercept;
