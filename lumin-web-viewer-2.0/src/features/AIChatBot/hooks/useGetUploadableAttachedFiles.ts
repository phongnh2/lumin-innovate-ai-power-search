import produce from 'immer';
import { Dispatch, SetStateAction } from 'react';

import { md5FromBuffer } from 'utils/md5FromBuffer';
import { queryClient } from 'utils/queryClient';

import { AttachedFileType } from 'features/AIChatBot/interface';
import { MergeDocumentType } from 'features/MultipleMerge/types';

import { checkAttachedFilesMetadata } from '../apis/checkAttachedFilesMetadata';
import { ATTACHED_FILES_SOURCE, ATTACHED_FILES_STATUS } from '../constants/attachedFiles';

interface FilesUploadableToS3CommonProps {
  chatSessionId?: string;
  attachedFiles: AttachedFileType[];
  loadedDocuments: Partial<MergeDocumentType>[];
  abortControllers: Map<string, AbortController>;
  setAttachedFiles: Dispatch<SetStateAction<AttachedFileType[]>>;
}

export const useGetUploadableAttachedFiles = () => {
  const verifyFileExistsInRedis = async ({ chatSessionId, md5Hash }: { chatSessionId: string; md5Hash: string }) => {
    const { isExist } = await queryClient.fetchQuery({
      queryKey: ['attachedFiles', chatSessionId, md5Hash],
      queryFn: ({ signal }) => checkAttachedFilesMetadata({ chatSessionId, etag: md5Hash }, { signal }),
    });
    return isExist;
  };

  const getValidProcessedFiles = (props: FilesUploadableToS3CommonProps) => {
    const { loadedDocuments, attachedFiles, abortControllers, setAttachedFiles } = props;
    const isAborted = (fileId: string) => !abortControllers.get(fileId);

    const processedFiles = produce(attachedFiles, (draft) => {
      loadedDocuments.forEach((loadedDocument) => {
        const validDocument = draft.find(({ id }) => id === loadedDocument._id);
        if (!validDocument) {
          return;
        }

        validDocument.buffer = loadedDocument.buffer;
        if (validDocument.source === ATTACHED_FILES_SOURCE.GOOGLE) {
          validDocument.file = loadedDocument.file;
        }
        if (loadedDocument.status === ATTACHED_FILES_STATUS.FAILED) {
          validDocument.status = ATTACHED_FILES_STATUS.FAILED;
        }
      });
    });

    const verifiedFiles = processedFiles.filter(
      ({ id, status }) => status !== ATTACHED_FILES_STATUS.FAILED && !isAborted(id)
    );
    setAttachedFiles(verifiedFiles);

    return { verifiedFiles };
  };

  const getFilesUploadableToS3 = async (props: FilesUploadableToS3CommonProps) => {
    const { chatSessionId, loadedDocuments, attachedFiles, abortControllers, setAttachedFiles } = props;
    const isAborted = (fileId: string) => !abortControllers.get(fileId);

    const { verifiedFiles } = getValidProcessedFiles({
      loadedDocuments,
      attachedFiles,
      abortControllers,
      setAttachedFiles,
    });
    const uploadingFiles = verifiedFiles.filter(({ status }) => status === ATTACHED_FILES_STATUS.UPLOADING);

    const redisExistenceFiles = await Promise.all(
      uploadingFiles.map(async (file) => {
        const arrayBuffer = await file.file?.arrayBuffer();
        const md5Hash = md5FromBuffer(arrayBuffer);
        const isExist = await verifyFileExistsInRedis({ chatSessionId, md5Hash });

        return { fileId: file.id, isExist };
      })
    );

    const existingFileIds = redisExistenceFiles
      .filter(({ isExist, fileId }) => isExist && !isAborted(fileId))
      .map(({ fileId }) => fileId);

    const latestAttachedFiles = produce(verifiedFiles, (draft) => {
      existingFileIds.forEach((existingFileId) => {
        const existingFile = draft.find(({ id }) => id === existingFileId);
        if (existingFile) {
          existingFile.isRedisStored = true;
          existingFile.status = ATTACHED_FILES_STATUS.UPLOADED;
        }
      });
    });
    setAttachedFiles(latestAttachedFiles);

    const filesUploadableToS3 = uploadingFiles.filter(({ id }) => !existingFileIds.includes(id) && !isAborted(id));

    return { filesUploadableToS3, latestAttachedFiles };
  };

  return { getFilesUploadableToS3 };
};
