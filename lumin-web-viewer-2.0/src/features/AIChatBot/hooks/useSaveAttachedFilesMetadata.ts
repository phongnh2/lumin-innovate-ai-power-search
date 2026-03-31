import { useMutation } from '@tanstack/react-query';
import produce from 'immer';
import { Dispatch, SetStateAction } from 'react';

import logger from 'helpers/logger';

import { md5FromBuffer } from 'utils/md5FromBuffer';

import { AttachedFileType } from 'features/AIChatBot/interface';

import { LOGGER } from 'constants/lumin-common';

import { saveAttachedFilesMetadata } from '../apis/saveAttachedFilesMetadata';
import { ATTACHED_FILES_STATUS } from '../constants/attachedFiles';

export const useSaveAttachedFilesMetadata = () => {
  const getTotalPages = async (buffer: ArrayBuffer): Promise<number> => {
    const pdfDoc = await Core.PDFNet.PDFDoc.createFromBuffer(buffer);
    return pdfDoc.getPageCount();
  };

  const saveMetadataMutation = useMutation({
    mutationFn: async ({
      chatSessionId,
      s3RemoteId,
      etag,
      totalPages,
      signal,
    }: {
      chatSessionId: string;
      s3RemoteId: string;
      etag: string;
      totalPages: number;
      signal: AbortSignal;
    }) =>
      saveAttachedFilesMetadata(
        {
          chatSessionId,
          s3RemoteId,
          etag,
          totalPages,
        },
        { signal }
      ),
  });

  const saveAttachedFilesMetadataHandler = async ({
    files,
    chatSessionId,
    abortControllers,
    setAttachedFiles,
  }: {
    files: AttachedFileType[];
    chatSessionId: string;
    abortControllers: Map<string, AbortController>;
    setAttachedFiles?: Dispatch<SetStateAction<AttachedFileType[]>>;
  }) => {
    const filteredFiles = files.filter(
      ({ status, remoteId, isRedisStored }) => !isRedisStored && remoteId && status === ATTACHED_FILES_STATUS.UPLOADED
    );
    try {
      await Promise.all(
        filteredFiles.map(async (uploadedFile) => {
          const bufferGetTotalPages = uploadedFile.buffer.slice(0);
          const bufferGetMD5 = uploadedFile.buffer.slice(0);
          const totalPages = await getTotalPages(bufferGetTotalPages);
          const md5Hash = md5FromBuffer(bufferGetMD5);

          await saveMetadataMutation.mutateAsync({
            chatSessionId,
            s3RemoteId: uploadedFile.remoteId,
            etag: md5Hash,
            totalPages,
            signal: abortControllers.get(uploadedFile.id)?.signal,
          });
        })
      );
      setAttachedFiles(
        produce(files, (draft) => {
          filteredFiles.forEach((uploadedFile) => {
            const index = draft.findIndex(({ id }) => id === uploadedFile.id);
            if (index !== -1) {
              draft[index].isRedisStored = true;
            }
          });
        })
      );
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.AI_CHATBOT,
        error: error as Error,
        message: 'Failed to process and save metadata',
      });
    }
  };

  return { saveAttachedFilesMetadataHandler };
};
