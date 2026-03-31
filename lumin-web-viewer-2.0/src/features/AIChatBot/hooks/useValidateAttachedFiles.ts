import { get } from 'lodash';
import { useCallback } from 'react';

import { enqueueSnackbar } from '@libs/snackbar';

import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { ATTACHED_FILES_STATUS } from 'features/AIChatBot/constants/attachedFiles';
import { AttachedFileType } from 'features/AIChatBot/interface';

import { Plans } from 'constants/plan';

export const useValidateAttachedFiles = (existingFiles: AttachedFileType[]) => {
  const { t } = useTranslation();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentDocumentSize = currentDocument?.size || 0;
  const isFreePlan = get(currentDocument, 'documentReference.data.payment.type', '') === Plans.FREE;
  const attachedFilesSizeLimitInMB = get(currentDocument, 'premiumToolsInfo.aiChatbot.attachedFilesSizeLimitInMB', 0);

  const getActiveExistingFilesSize = useCallback(
    () =>
      existingFiles
        .filter(
          (file) => file.status === ATTACHED_FILES_STATUS.UPLOADING || file.status === ATTACHED_FILES_STATUS.UPLOADED
        )
        .reduce((total, file) => total + file.file.size, 0),
    [existingFiles]
  );

  const getValidatedFiles = useCallback(
    (files: (File & { remoteId?: string })[]) => {
      const uploadableFiles: (File & { remoteId?: string })[] = [];
      let currentTotalSize = getActiveExistingFilesSize() + currentDocumentSize;
      let hasExceededLimit = false;

      files.forEach((file) => {
        if (currentTotalSize + file.size > attachedFilesSizeLimitInMB * 1024 * 1024) {
          hasExceededLimit = true;
          return;
        }
        uploadableFiles.push(file);
        currentTotalSize += file.size;
      });

      if (hasExceededLimit) {
        enqueueSnackbar({
          message: t(`viewer.chatbot.attachedFilesSizeWarning.${isFreePlan ? 'free' : 'paid'}`, {
            limit: attachedFilesSizeLimitInMB,
          }),
          variant: 'warning',
          autoHideDuration: 3000,
        });
      }

      return uploadableFiles;
    },
    [t, getActiveExistingFilesSize, attachedFilesSizeLimitInMB, isFreePlan, currentDocumentSize]
  );

  return {
    getValidatedFiles,
  };
};
