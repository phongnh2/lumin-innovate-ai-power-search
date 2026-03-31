import type { DropResult } from '@hello-pangea/dnd';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { FileRejection } from 'react-dropzone';
import { v4 } from 'uuid';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { SUPPORTED_FILE_TYPES } from '../constants';
import { FileSource, FileSourceType, UploadDocumentError, UploadDocumentErrorType, UploadStatus } from '../enum';
import { MergeDocumentType } from '../types';
import { reorder } from '../utils/documentsManipulation';

type Props = {
  initialDocuments: IDocumentBase[];
  setIsLoadingDocument: Dispatch<SetStateAction<boolean>>;
};

const getDocumentErrorCode = (document: IDocumentBase, isSupportedFile: boolean): UploadDocumentErrorType => {
  if (!isSupportedFile) {
    return UploadDocumentError.FILE_INVALID_TYPE;
  }

  if (!document.capabilities?.canMerge) {
    return UploadDocumentError.DOCUMENT_PERMISSION_DENIED;
  }

  return undefined;
};

const getDocuments = (initialDocuments: IDocumentBase[]): MergeDocumentType[] =>
  initialDocuments.map((document) => {
    const isSupportedFile = SUPPORTED_FILE_TYPES.includes(document.mimeType);
    const errorCode = getDocumentErrorCode(document, isSupportedFile);

    return {
      _id: v4(),
      remoteId: document._id,
      name: document.name,
      mimeType: document.mimeType,
      size: document.size,
      thumbnail: document.thumbnail,
      status: errorCode ? UploadStatus.FAILED : UploadStatus.UPLOADED,
      source: FileSource.LUMIN,
      metadata: errorCode ? { errorCode } : null,
    };
  });

export const useDocumentsManipulation = ({ initialDocuments, setIsLoadingDocument }: Props) => {
  const [documents, setDocuments] = useState(() => getDocuments(initialDocuments));

  const deleteDocument = useCallback(
    (documentId: string) => {
      const newDocuments = documents.filter((document) => document._id !== documentId);
      setDocuments(newDocuments);
    },
    [documents]
  );

  const handleSortDocuments = useCallback(
    (result: DropResult) => {
      if (!result.destination || result.destination.index === result.source.index) {
        return;
      }

      const newDocuments = reorder(documents, result.source.index, result.destination.index);
      setDocuments(newDocuments);
    },
    [documents]
  );

  const handleUploadDocuments = useCallback(
    ({
      files,
      fileRejections = [],
      source,
    }: {
      files: (File & { _id?: string; remoteId?: string })[];
      fileRejections?: FileRejection[];
      source: FileSourceType;
    }) => {
      setIsLoadingDocument(true);
      setDocuments((prevState) => [
        ...prevState,
        ...files.map((file) => ({
          name: file.name,
          status: UploadStatus.UPLOADING,
          source,
          size: file.size,
          mimeType: file.type,
          file,
          _id: v4(),
          remoteId: file.remoteId,
        })),
        ...fileRejections.map(({ errors, file }) => ({
          name: file.name,
          status: UploadStatus.FAILED,
          source,
          size: file.size,
          mimeType: file.type,
          metadata: {
            errorCode: errors[0].code as UploadDocumentErrorType,
          },
          _id: v4(),
        })),
      ]);
    },
    []
  );

  return {
    documents,
    setDocuments,
    deleteDocument,
    handleSortDocuments,
    handleUploadDocuments,
  };
};
