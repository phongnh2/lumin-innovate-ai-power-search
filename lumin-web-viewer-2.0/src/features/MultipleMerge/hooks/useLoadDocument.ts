import produce from 'immer';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import logger from 'helpers/logger';

import DataElements from 'constants/dataElement';
import { LOGGER } from 'constants/lumin-common';

import { LoadDocumentHandler } from '../core/loadDocument';
import { FileSource, UploadStatus } from '../enum';
import { MergeDocumentType } from '../types';

type Props = {
  documents: MergeDocumentType[];
  getAbortController: () => AbortController;
  setDocuments: Dispatch<SetStateAction<MergeDocumentType[]>>;
  setIsLoadingDocument: Dispatch<SetStateAction<boolean>>;
};

export const useLoadDocument = ({ documents, getAbortController, setDocuments, setIsLoadingDocument }: Props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadDocuments = async () => {
      const uploadingDocuments = documents
        .filter(({ status }) => status === UploadStatus.UPLOADING)
        .map(({ _id, file, source, name, remoteId }) => ({ _id, file, source, name, remoteId }));
      if (!uploadingDocuments.length) {
        return;
      }

      const handler = new LoadDocumentHandler()
        .setItems(uploadingDocuments)
        .setAbortSignal(getAbortController().signal)
        .setOnSetupPasswordHandler(({ attempt, name }) => {
          dispatch(actions.openElement(DataElements.PASSWORD_MODAL));
          dispatch(actions.setPasswordProtectedDocumentName(name));
          dispatch(actions.setPasswordAttempts(attempt));
        })
        .setOnLoadDocumentComplete(() => {
          dispatch(actions.closeElement(DataElements.PASSWORD_MODAL));
          dispatch(actions.setPasswordProtectedDocumentName(''));
        })
        .setOnError((error) => {
          logger.logError({ reason: LOGGER.Service.MULTIPLE_MERGE, error });
        });

      const loadedDocuments = await handler.handle();
      const validLoadedDocuments = loadedDocuments.filter((loadedDocument) => loadedDocument);
      if (validLoadedDocuments.length) {
        setDocuments(
          produce(documents, (draft) => {
            loadedDocuments.forEach((loadedDocument) => {
              const index = draft.findIndex(({ _id }) => _id === loadedDocument._id);
              if (index === -1) {
                return;
              }

              draft[index].buffer = loadedDocument.buffer;
              draft[index].thumbnail = draft[index].thumbnail ?? loadedDocument.thumbnail;
              draft[index].status = loadedDocument.status;
              draft[index].metadata = loadedDocument.metadata;

              if (draft[index].source === FileSource.GOOGLE) {
                draft[index].file = loadedDocument.file;
              }
            });
          })
        );
      }
    };

    loadDocuments()
      .catch((error) => {
        logger.logError({ reason: LOGGER.Service.MULTIPLE_MERGE, error: error as Error });
      })
      .finally(() => setIsLoadingDocument(false));
  }, [dispatch, documents, getAbortController, setDocuments, setIsLoadingDocument]);
};
