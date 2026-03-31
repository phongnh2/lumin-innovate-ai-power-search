import { useCallback } from 'react';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import { PLATFORM, ERROR_MESSAGES } from '../constants';
import { validateAndProcessFile } from '../utils';

export const useFileProcessing = () => {
  const currentUser = useGetCurrentUser();
  const processElectronFile = useCallback(
    async (filePath: string) => {
      const fileInfo = await window.electronAPI.openFile(filePath);

      if (!fileInfo.success) {
        throw new Error(`${ERROR_MESSAGES.FAILED_TO_OPEN_FILE}: ${filePath}`);
      }

      const fileName = window.nodeAPI.path.basename(filePath);
      const fileData = {
        name: fileName,
        size: fileInfo.size,
        lastModified: fileInfo.lastModified,
        platformSpecificData: { filePath },
        mimeType: fileInfo.type,
      };

      return validateAndProcessFile({
        fileData,
        currentUser,
        platform: PLATFORM.ELECTRON,
      });
    },
    [currentUser]
  );

  const processWebFile = useCallback(
    async (fileHandle: FileSystemFileHandle) => {
      const file = await fileHandle.getFile();
      const fileData = {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        lastModified: file.lastModified,
        platformSpecificData: { fileHandle },
      };

      return validateAndProcessFile({
        fileData,
        currentUser,
        platform: PLATFORM.PWA,
      });
    },
    [currentUser]
  );

  return {
    processElectronFile,
    processWebFile,
  };
};
