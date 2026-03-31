import React from 'react';

import { file as fileUtils } from 'utils';

import SaveToThirdPartyStorageForm from 'features/SaveToThirdPartyStorage/components/SaveToThirdPartyStorageForm';

import { DownloadType } from 'constants/downloadPdf';
import UserEventConstants from 'constants/eventConstants';
import { STORAGE_TYPE, STORAGE_TYPE_DESC } from 'constants/lumin-common';

import { useMultipleMergeContext } from '../../hooks/useMultipleMergeContext';
import { useSaveDocumentToGoogleDriveHandler } from '../../hooks/useSaveDocumentToGoogleDriveHandler';

const FormContainer = ({ children }: { children: React.ReactNode }) => {
  const { documents, openSaveToDriveModal } = useMultipleMergeContext();
  const { duplicateFileToGoogleStorage } = useSaveDocumentToGoogleDriveHandler();

  if (openSaveToDriveModal) {
    return (
      <SaveToThirdPartyStorageForm
        currentDocumentName={`${fileUtils.getFilenameWithoutExtension(documents[0]?.name)}_merged`}
        destinationStorage={STORAGE_TYPE_DESC[STORAGE_TYPE.GOOGLE]}
        onConfirm={duplicateFileToGoogleStorage}
        downloadType={DownloadType.PDF}
        action={UserEventConstants.Events.HeaderButtonsEvent.DOWNLOAD}
      >
        {children}
      </SaveToThirdPartyStorageForm>
    );
  }

  return children;
};

export default FormContainer;
