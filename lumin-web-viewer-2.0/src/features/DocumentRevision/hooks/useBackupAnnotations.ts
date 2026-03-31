import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { documentServices } from 'services';

import exportAnnotations from 'helpers/exportAnnotations';
import logger from 'helpers/logger';

import { MimeType } from 'constants/documentType';
import { LOGGER } from 'constants/lumin-common';

import { getBackupAnnotationPresignedUrl } from '../apis';

export const useBackupAnnotations = () => {
  const { _id: documentId } = useShallowSelector(selectors.getCurrentDocument) || {};

  const backupAnnotations = useCallback(
    async (options?: { signal: AbortController['signal'] }) => {
      try {
        const annotationData = await exportAnnotations();
        const { signal } = options || {};
        const backupAnnotsPresigned = await getBackupAnnotationPresignedUrl(documentId, { signal });
        const blob = new Blob([annotationData], { type: MimeType.XML });
        const xmlFile = new File([blob], `backup-annotations-${documentId}`, { type: MimeType.XML });
        await documentServices.uploadFileToS3({
          presignedUrl: backupAnnotsPresigned.url,
          file: xmlFile,
        });

        return backupAnnotsPresigned;
      } catch (error) {
        logger.logError({
          reason: LOGGER.Service.BACK_UP_DOCUMENT_ERROR,
          error: error as Error,
        });
      }
    },
    [documentId]
  );

  const { error, isLoading, mutateAsync } = useMutation({
    mutationKey: ['backupAnnotations', documentId],
    mutationFn: () => backupAnnotations(),
  });

  const triggerBackupAnnotations = useCallback(async () => {
    await mutateAsync();
  }, [mutateAsync]);

  return {
    backupAnnotations: triggerBackupAnnotations,
    error,
    isLoading,
  };
};
