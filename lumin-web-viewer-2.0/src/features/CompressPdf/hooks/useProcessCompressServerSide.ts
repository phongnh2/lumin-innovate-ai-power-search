import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { documentServices } from 'services';

import exportAnnotations from 'helpers/exportAnnotations';
import logger from 'helpers/logger';

import { getFileData, getFileFromUrl } from 'utils/getFileService';

import { socket } from '@socket';

import { general } from 'constants/documentType';
import { LOGGER } from 'constants/lumin-common';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';
import { SOCKET_ON } from 'constants/socketConstant';

import { useGetCompressOptions } from './useGetCompressOptions';
import { getCompressDocumentPresignedUrl } from '../apis';
import { compressPdfSelectors } from '../slices';
import { CompressCompletedType } from '../types';

export const useProcessCompressServerSide = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const compressLevel = useSelector(compressPdfSelectors.getCompressLevel);
  const compressOptions = useGetCompressOptions();
  const documentPassword = sessionStorage.getItem(SESSION_STORAGE_KEY.PDF_PASSWORD);

  const uploadCompressFileToS3 = async (
    { sessionId }: { sessionId: string },
    options?: { signal: AbortController['signal'] }
  ) => {
    try {
      const { signal } = options || {};
      await core.getDocument().getDocumentCompletePromise();
      const xfdfString = await exportAnnotations();
      const fileBuffer = await getFileData({ xfdfString });
      const { url: presignedUrl } = await getCompressDocumentPresignedUrl({
        sessionId,
        documentId: currentDocument._id,
        compressOptions: {
          compressLevel,
          documentPassword,
          ...compressOptions,
        },
        options: {
          signal,
        },
      });
      return await documentServices.uploadFileToS3({
        file: new File([fileBuffer], currentDocument.name, { type: general.PDF }),
        presignedUrl,
        options: {
          signal,
        },
      });
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.COMPRESS_PDF,
        error: error as Error,
      });
      return null;
    }
  };

  const { error, isLoading, mutateAsync } = useMutation({
    mutationKey: ['uploadCompressFile', currentDocument?._id],
    mutationFn: ({ sessionId }: { sessionId: string }) => uploadCompressFileToS3({ sessionId }),
  });

  const triggerUploadCompressFile = useCallback(
    async ({ sessionId }: { sessionId: string }) => {
      await mutateAsync({ sessionId });
    },
    [mutateAsync]
  );

  const socketListener = (): Promise<CompressCompletedType> =>
    new Promise((resolve) => {
      socket.on(SOCKET_ON.COMPRESS_PDF_COMPLETED, (data: CompressCompletedType) => {
        resolve(data);
      });
    });

  const onCompressPdfServerSideCompleted = async () => {
    const { presignedUrl, error: compressError } = await socketListener();
    if (compressError) {
      return { error: compressError };
    }
    const file = await getFileFromUrl({
      url: presignedUrl,
      fileName: `${currentDocument.name}_compressed`,
      fileOptions: { type: general.PDF },
    });

    return { file };
  };

  return {
    error,
    isLoading,
    onCompressPdfServerSideCompleted,
    uploadCompressFileToS3: triggerUploadCompressFile,
  };
};
