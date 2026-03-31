import { enqueueSnackbar, Link } from 'lumin-ui/kiwi-ui';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import useGetCurrentUser from 'hooks/useGetCurrentUser';

import { documentGraphServices } from 'services/graphServices';
import { oneDriveServices, OnedriveFileInfo } from 'services/oneDriveServices';
import { DriveFileInfo } from 'services/types/googleServices.types';

import logger from 'helpers/logger';

import fileUtils from 'utils/file';
import { mappingDownloadTypeWithMimeType } from 'utils/mappingDownloadTypeWithMimeType';
import { eventTracking } from 'utils/recordUtil';
import { syncFileToS3 } from 'utils/syncFileToS3';

import getThirdPartyFileInfo from 'features/Document/helpers/getThirdPartyFileInfo';
import useSyncFileToExternalStorage from 'features/DocumentUploadExternal/useSyncFileToExternalStorage';
import { ExternalStorages } from 'features/FeatureConfigs/featureStoragePolicies';

import { images, office } from 'constants/documentType';
import UserEventConstants from 'constants/eventConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';

import { useConvertPdfStore } from './useConvertPdfStore';
import styles from '../ConvertPdf.module.scss';

const CONVERTIBLE_MIME_TYPES = [...Object.values(office), ...Object.values(images)];

const DEFAULT_FOLDER_INFO = {
  icon: 'ph-folder',
  id: '',
  location: '',
  webUrl: '',
  driveId: '',
  isShared: false,
};

const DestinationLink = ({
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
    <Link href={documentLocation} rel="noreferrer" target="_blank" className={styles.link}>
      {destinationStorage}
    </Link>
  );
};

const SuccessMessage = ({
  message,
  documentLocation,
  destinationStorage,
}: {
  message: string;
  documentLocation: string;
  destinationStorage: string;
}) => (
  <>
    {message} <DestinationLink destinationStorage={destinationStorage} documentLocation={documentLocation} />
  </>
);

const getGoogleFolderInfo = (fileInfo: DriveFileInfo) => ({
  ...DEFAULT_FOLDER_INFO,
  id: fileInfo.parents?.[0] || '',
});

const getOneDriveFolderInfo = async (fileInfo: OnedriveFileInfo) => {
  const currentUserDrive = await oneDriveServices.getMe();
  const isSharedDocument = fileInfo?.parentReference?.driveId !== currentUserDrive.id;

  return {
    ...DEFAULT_FOLDER_INFO,
    id: isSharedDocument ? '' : fileInfo?.parentReference?.id || '',
    driveId: isSharedDocument ? currentUserDrive.id : fileInfo?.parentReference?.driveId || '',
    isShared: isSharedDocument,
  };
};

export const useHandleConvertPdf = () => {
  const dispatch = useDispatch();
  const currentDocument = useSelector(selectors.getCurrentDocument);
  const currentUser = useGetCurrentUser();
  const handleSyncFile = useSyncFileToExternalStorage(currentDocument.service as ExternalStorages);
  const flattenPdf = useSelector(selectors.isFlattenPdf);
  const { setShowModalConvertPdf } = useConvertPdfStore();
  const abortController = useRef(new AbortController());
  const [isLoading, setIsLoading] = useState(false);

  const getFolderInfo = async (service: ExternalStorages) => {
    const thirdPartyFileInfo = await getThirdPartyFileInfo(currentDocument);

    if (service === STORAGE_TYPE.GOOGLE) {
      return getGoogleFolderInfo(thirdPartyFileInfo as DriveFileInfo);
    }

    if (service === STORAGE_TYPE.ONEDRIVE) {
      return getOneDriveFolderInfo(thirdPartyFileInfo as OnedriveFileInfo);
    }

    return DEFAULT_FOLDER_INFO;
  };

  const convertToS3 = async () => {
    const { data } = await documentGraphServices.updateDocumentMimeTypeToPdf(
      currentDocument._id,
      currentDocument.remoteId
    );
    await syncFileToS3({ signal: abortController.current.signal, increaseVersion: false });

    dispatch(actions.updateCurrentDocument({ ...currentDocument, mimeType: data.mimeType }));
    dispatch(actions.setDownloadType(mappingDownloadTypeWithMimeType(data.mimeType)));
  };

  const convertToExternalStorage = async () => {
    const service = currentDocument.service as ExternalStorages;
    const folderInfo = await getFolderInfo(service);

    const { destinationStorage, documentLocation, successMsg } = await handleSyncFile({
      isOverride: false,
      currentDocument,
      newDocumentName: fileUtils.getFilenameWithoutExtension(currentDocument.name),
      folderInfo,
      downloadType: 'pdf',
      shouldShowRatingModal: false,
      file: null,
      flattenPdf,
    });

    if (successMsg) {
      enqueueSnackbar({
        message: (
          <SuccessMessage
            message={successMsg}
            documentLocation={documentLocation}
            destinationStorage={destinationStorage}
          />
        ),
        preventDuplicate: true,
        variant: 'success',
      });
    }
  };

  const trackConversionEvent = () => {
    const payload = {
      documentType: fileUtils.getExtension(currentDocument.name),
      source: currentDocument.service,
      sizeMB: Number(currentDocument.size) / (1024 * 1024),
    };
    eventTracking(UserEventConstants.EventType.DOCUMENT_CONVERTED, payload).catch(() => {});
  };

  const onConvertPdf = async () => {
    setIsLoading(true);

    try {
      const isS3Storage = currentDocument.service === STORAGE_TYPE.S3;

      if (isS3Storage) {
        await convertToS3();
      } else {
        await convertToExternalStorage();
      }

      setShowModalConvertPdf(false);
      trackConversionEvent();
    } catch (error) {
      logger.logError({ reason: 'Failed to convert pdf', error: error as Error });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    onConvertPdf,
    isLoading,
    setIsLoading,
    isShowButtonConvertPdf: CONVERTIBLE_MIME_TYPES.includes(currentDocument.mimeType) && !!currentUser,
  };
};
