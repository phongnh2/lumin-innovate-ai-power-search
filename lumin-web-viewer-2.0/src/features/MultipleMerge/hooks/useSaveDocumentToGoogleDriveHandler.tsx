import { camelCase } from 'lodash';
import React from 'react';

import { enqueueSnackbar } from '@libs/snackbar';

import { file as fileUtils } from 'utils';
import documentEvent from 'utils/Factory/EventCollection/DocumentEventCollection';

import useSyncFileToExternalStorage from 'features/DocumentUploadExternal/useSyncFileToExternalStorage';

import { DownloadType } from 'constants/downloadPdf';
import { STORAGE_TYPE } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { useMultipleMergeContext } from './useMultipleMergeContext';

export const useSaveDocumentToGoogleDriveHandler = () => {
  const { setOpenSaveToDriveModal, getResult, onClose } = useMultipleMergeContext();
  const handleSyncFile = useSyncFileToExternalStorage(STORAGE_TYPE.GOOGLE);

  const getDestination = ({
    documentLocation,
    destinationStorage,
  }: {
    documentLocation: string;
    destinationStorage: string;
  }) => {
    if (!documentLocation) {
      return destinationStorage;
    }

    return (
      <a href={documentLocation} target="_blank" rel="noreferrer">
        {destinationStorage}
      </a>
    );
  };

  const duplicateFileToGoogleStorage = async (newDocumentName: string) => {
    const { file, name } = await getResult();
    const { destinationStorage, documentLocation, successMsg } = await handleSyncFile({
      file: file as File,
      currentDocument: {
        name,
      } as IDocumentBase,
      downloadType: DownloadType.PDF,
      isOverride: false,
      newDocumentName,
      shouldShowRatingModal: false,
    });
    if (successMsg) {
      enqueueSnackbar({
        message: (
          <>
            {successMsg} {getDestination({ destinationStorage, documentLocation })}
          </>
        ),
        preventDuplicate: true,
        variant: 'success',
      });
      const documentType = fileUtils.getExtension(name);
      documentEvent
        .downloadDocumentSuccess({ fileType: documentType, savedLocation: camelCase(destinationStorage) })
        .catch(() => {});
      setOpenSaveToDriveModal(false);
      onClose();
    }
  };

  return {
    duplicateFileToGoogleStorage,
  };
};
