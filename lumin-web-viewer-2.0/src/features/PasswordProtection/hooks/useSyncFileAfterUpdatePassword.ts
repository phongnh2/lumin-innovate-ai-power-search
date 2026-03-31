import selectors from 'selectors';

import { saveLocalFile } from 'lumin-components/ViewerCommon/LocalSave/helper/saveLocalFile';

import useShallowSelector from 'hooks/useShallowSelector';

import documentServices from 'services/documentServices';

import fireEvent from 'helpers/fireEvent';

import fileUtil from 'utils/file';

import useSyncFileToExternalStorage from 'features/DocumentUploadExternal/useSyncFileToExternalStorage';
import { ExternalStorages } from 'features/FeatureConfigs/featureStoragePolicies';
import { useHandleManipulateDateGuestMode } from 'features/GuestModeManipulateCache/useHandleManipuldateGuestMode';
import { removeSignedUrlSignature } from 'features/Signature/utils';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { DownloadType } from 'constants/downloadPdf';
import { STORAGE_TYPE } from 'constants/lumin-common';
import { SAVE_OPERATION_TYPES } from 'constants/saveOperationConstants';

export const useSyncFileAfterUpdatePassword = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { service: storageType } = currentDocument || {};
  const syncFileToExternalStorage = useSyncFileToExternalStorage(storageType as ExternalStorages);
  const { isManipulateInGuestMode } = useHandleManipulateDateGuestMode();

  const syncFile = async () => {
    if (isManipulateInGuestMode) {
      return;
    }
    switch (storageType) {
      case STORAGE_TYPE.S3: {
        await documentServices.syncFileToS3Exclusive(currentDocument, {
          increaseVersion: true,
          action: SAVE_OPERATION_TYPES.CONTENT_EDIT,
        });
        await removeSignedUrlSignature({ currentDocument });
        fireEvent(CUSTOM_EVENT.REFETCH_DOCUMENT);
        break;
      }
      case STORAGE_TYPE.GOOGLE:
      case STORAGE_TYPE.DROPBOX:
      case STORAGE_TYPE.ONEDRIVE: {
        await syncFileToExternalStorage({
          currentDocument,
          shouldShowRatingModal: false,
          isOverride: true,
          newDocumentName: fileUtil.getFilenameWithoutExtension(currentDocument.name),
          downloadType: DownloadType.PDF,
        });
        await removeSignedUrlSignature({ currentDocument });
        break;
      }
      case STORAGE_TYPE.SYSTEM: {
        await saveLocalFile();
        break;
      }
      default: {
        break;
      }
    }
  };

  return [syncFile];
};
