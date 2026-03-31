import { compressPDFWithWorker } from '@libs/ghostscript/worker-init';

import logger from 'helpers/logger';

import { eventTracking } from 'utils';

import { socket } from '@socket';

import UserEventConstants from 'constants/eventConstants';
import { LOGGER } from 'constants/lumin-common';
import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

import { useCompressLevelValidation } from './useCompressLevelValidation';
import { useProcessCompressServerSide } from './useProcessCompressServerSide';
import { RESOLUTION_TO_QUALITY } from '../constants';
import { CompressLevelType } from '../types';
import { getCompressedFile } from '../utils';

interface UseProcessCompressPdfProps {
  compressLevel: CompressLevelType;
}

export const useProcessingCompressPdf = ({ compressLevel }: UseProcessCompressPdfProps) => {
  const { enableServerCompression } = useCompressLevelValidation();
  const { uploadCompressFileToS3, onCompressPdfServerSideCompleted } = useProcessCompressServerSide();
  const documentPassword = sessionStorage.getItem(SESSION_STORAGE_KEY.PDF_PASSWORD);

  const trackingEventDocumentCompressed = async () => {
    await eventTracking(UserEventConstants.EventType.DOCUMENT_COMPRESSED, {
      compressType: RESOLUTION_TO_QUALITY[compressLevel].toLowerCase(),
    });
  };

  const processCompressPdf = async ({ fileUrl }: { fileUrl?: string }) => {
    if (enableServerCompression) {
      const sessionId = socket._id;
      await uploadCompressFileToS3({ sessionId });
      const { file, error } = await onCompressPdfServerSideCompleted();
      if (error) {
        logger.logError({
          reason: LOGGER.Service.COMPRESS_PDF,
          message: 'Failed to compress PDF with server',
          error,
          attributes: {
            compressLevel,
            hasPassword: !!documentPassword,
            fileUrl: fileUrl || 'undefined',
          },
        });
        throw new Error(error);
      }
      await trackingEventDocumentCompressed();
      return file;
    }

    let compressFileUrl: string;
    try {
      compressFileUrl = (await compressPDFWithWorker({
        fileUrl,
        resolution: compressLevel,
        documentPassword,
      })) as string;
    } catch (error: unknown) {
      logger.logError({
        reason: LOGGER.Service.COMPRESS_PDF,
        message: 'Failed to compress PDF with worker',
        error,
        attributes: {
          compressLevel,
          hasPassword: !!documentPassword,
          fileUrl: fileUrl || 'undefined',
        },
      });
      throw error;
    }

    try {
      await trackingEventDocumentCompressed();
      return await getCompressedFile(compressFileUrl);
    } catch (error: unknown) {
      logger.logError({
        reason: LOGGER.Service.COMPRESS_PDF,
        message: 'Failed to get compressed file',
        error,
        attributes: {
          compressLevel,
          compressFileUrl,
        },
      });
      throw error;
    }
  };

  return {
    compressPdfCallback: processCompressPdf,
  };
};
