import { useCallback } from 'react';

import indexedDBService from 'services/indexedDBService';

import logger from 'helpers/logger';

import { useFileProcessing } from './useFileProcessing';
import { ERROR_MESSAGES, URL_PARAMS } from '../constants';

type UseFileHandlersProps = {
  setFileId: (fileId: string) => void;
};

export const useFileHandlers = ({ setFileId }: UseFileHandlersProps) => {
  const { processElectronFile, processWebFile } = useFileProcessing();

  const showErrorMessage = useCallback(async ({ title, message }: { title: string; message: string }) => {
    if (window.electronAPI?.showMessageBox) {
      await window.electronAPI.showMessageBox({
        type: 'error',
        title,
        message,
        buttons: ['OK'],
      });
    }
  }, []);

  const handleElectronFileAssociation = useCallback(
    async (filePaths: string[]) => {
      if (!filePaths.length) {
        return;
      }

      try {
        const filePromises = filePaths.map((filePath) => processElectronFile(filePath));
        const processedFileIds = await Promise.all(filePromises);
        const firstFileId = processedFileIds[0];

        if (firstFileId) {
          setFileId(firstFileId);
        }
      } catch (error) {
        logger.logError({
          context: handleElectronFileAssociation.name,
          error: error as Error,
          message: error instanceof Error ? error.message : ERROR_MESSAGES.FILE_OPEN_ERROR,
        });
        showErrorMessage({
          title: ERROR_MESSAGES.FILE_OPEN_TITLE,
          message: ERROR_MESSAGES.FILE_OPEN_ERROR,
        });
      }
    },
    [processElectronFile, showErrorMessage]
  );

  const handleUrlFileParams = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const filesParam = urlParams.get(URL_PARAMS.FILES);

    if (!filesParam) {
      return;
    }

    try {
      const filePaths = JSON.parse(filesParam) as string[];
      if (filePaths?.length > 0) {
        await handleElectronFileAssociation(filePaths);
      }
    } catch (error) {
      logger.logError({
        context: handleUrlFileParams.name,
        error: error as Error,
        message: ERROR_MESSAGES.FAILED_TO_PARSE_FILE_PATHS,
      });
    }
  }, [handleElectronFileAssociation]);

  const setupElectronFileListener = useCallback(() => {
    if (!window.electronAPI?.onFileAssociation) {
      return null;
    }

    return window.electronAPI.onFileAssociation(async (event, filePaths) => {
      if (filePaths?.length) {
        await handleElectronFileAssociation(filePaths);
      }
    });
  }, [handleElectronFileAssociation]);

  const setupPWAFileHandler = useCallback(() => {
    if (!('launchQueue' in window) || !indexedDBService.canUseIndexedDB()) {
      return;
    }

    window.launchQueue.setConsumer(async (launchParams) => {
      const { files } = launchParams;
      if (!files.length) {
        return;
      }

      try {
        const processedFileId = await processWebFile(files[0] as unknown as FileSystemFileHandle);
        setFileId(processedFileId);
      } catch (error) {
        logger.logError({
          error: error as Error,
          message: ERROR_MESSAGES.ERROR_PROCESSING_PWA_FILE,
          context: setupPWAFileHandler.name,
        });
      }
    });
  }, [processWebFile]);

  return {
    showErrorMessage,
    handleElectronFileAssociation,
    handleUrlFileParams,
    setupElectronFileListener,
    setupPWAFileHandler,
  };
};
