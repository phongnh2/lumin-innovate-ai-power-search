import { useMutation } from '@tanstack/react-query';
import { Dispatch, SetStateAction } from 'react';
import { useDispatch } from 'react-redux';

import { enqueueSnackbar } from '@libs/snackbar';

import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import documentServices from 'services/documentServices';

import logger from 'helpers/logger';

import { queryClient } from 'utils/queryClient';

import { ATTACHED_FILES_STATUS } from 'features/AIChatBot/constants/attachedFiles';
import { AttachedFileType } from 'features/AIChatBot/interface';

import { LOGGER } from 'constants/lumin-common';

import { useGetUploadableAttachedFiles } from './useGetUploadableAttachedFiles';
import { useSaveAttachedFilesMetadata } from './useSaveAttachedFilesMetadata';
import { getPresignedUrlForAttachedFiles } from '../apis/getAttachedFilesPresignedUrl';
import { setupAttachedFilesHandler } from '../utils/setupAttachedFilesHandler';

type LoadAttachedFilesProps = {
  chatSessionId: string;
  attachedFiles: AttachedFileType[];
  abortControllers: Map<string, AbortController>;
  setAttachedFiles: Dispatch<SetStateAction<AttachedFileType[]>>;
  setIsUploadingFiles: Dispatch<SetStateAction<boolean>>;
};

export const useAttachedFilesManipulation = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);

  const { getFilesUploadableToS3 } = useGetUploadableAttachedFiles();
  const { saveAttachedFilesMetadataHandler } = useSaveAttachedFilesMetadata();

  const getPresignedUrl = async ({ documentId, attachedFileId }: { documentId: string; attachedFileId: string }) => {
    const { presignedUrl } = await queryClient.fetchQuery({
      queryKey: ['attachedFiles', documentId, attachedFileId],
      queryFn: ({ signal }) => getPresignedUrlForAttachedFiles({ documentId, attachedFileId }, { signal }),
    });
    return presignedUrl;
  };

  const uploadFileMutation = useMutation({
    mutationFn: async ({ presignedUrl, file, signal }: { presignedUrl: string; file: File; signal: AbortSignal }) => {
      await documentServices.uploadFileToS3({
        presignedUrl,
        file,
        options: { signal },
      });
    },
  });

  const uploadFilesToS3 = async ({
    filesToUpload,
    latestAttachedFiles,
    chatSessionId,
    abortControllers,
    setAttachedFiles,
  }: {
    filesToUpload: AttachedFileType[];
    latestAttachedFiles: AttachedFileType[];
    chatSessionId: string;
    abortControllers: Map<string, AbortController>;
    setAttachedFiles: Dispatch<SetStateAction<AttachedFileType[]>>;
  }) => {
    let updatedAttachedFiles = latestAttachedFiles;
    const isAborted = (fileId: string) => !abortControllers.get(fileId);

    await Promise.all(
      filesToUpload.map(async (fileToUpload) => {
        try {
          const presignedUrl = await getPresignedUrl({
            documentId: currentDocument._id,
            attachedFileId: `${chatSessionId}/${fileToUpload.id}`,
          });

          await uploadFileMutation.mutateAsync({
            signal: abortControllers.get(fileToUpload.id)?.signal,
            presignedUrl,
            file: fileToUpload.file,
          });

          updatedAttachedFiles = updatedAttachedFiles
            .filter(({ id }) => !isAborted(id))
            .map((attachedFile) => {
              if (attachedFile.id === fileToUpload.id) {
                return {
                  ...attachedFile,
                  status: ATTACHED_FILES_STATUS.UPLOADED,
                  remoteId: `${chatSessionId}/${fileToUpload.id}`,
                };
              }
              return attachedFile;
            });
        } catch (error) {
          logger.logError({ reason: LOGGER.Service.AI_CHATBOT, error: error as Error });
          enqueueSnackbar({
            message: t('multipleMerge.failedToUpload'),
            variant: 'error',
          });
          updatedAttachedFiles = updatedAttachedFiles.filter(({ id }) => id !== fileToUpload.id);
        }

        setAttachedFiles(updatedAttachedFiles);
      })
    );

    return updatedAttachedFiles;
  };

  const loadAttachedFiles = async ({
    chatSessionId,
    attachedFiles,
    abortControllers,
    setAttachedFiles,
    setIsUploadingFiles,
  }: LoadAttachedFilesProps): Promise<void> => {
    try {
      const uploadingDocuments = attachedFiles.filter(({ status }) => status === ATTACHED_FILES_STATUS.UPLOADING);

      if (!uploadingDocuments.length) {
        return;
      }

      const handler = setupAttachedFilesHandler({ uploadingDocuments, dispatch });
      const loadedDocuments = await handler.handle();

      const { filesUploadableToS3, latestAttachedFiles } = await getFilesUploadableToS3({
        chatSessionId,
        abortControllers,
        loadedDocuments,
        attachedFiles,
        setAttachedFiles,
      });

      if (filesUploadableToS3.length === 0) {
        return;
      }

      const uploadedFiles = await uploadFilesToS3({
        filesToUpload: filesUploadableToS3,
        latestAttachedFiles,
        chatSessionId,
        abortControllers,
        setAttachedFiles,
      });

      await saveAttachedFilesMetadataHandler({
        files: uploadedFiles,
        chatSessionId,
        abortControllers,
        setAttachedFiles,
      });
    } catch (error) {
      logger.logError({ reason: LOGGER.Service.AI_CHATBOT, error: error as Error });
    } finally {
      setIsUploadingFiles(false);
    }
  };

  return { loadAttachedFiles };
};
