import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { enqueueSnackbar } from '@libs/snackbar';
import MakeACopyModal from '@new-ui/components/LuminTitleBar/components/TitleBarRightSection/components/FileMenu/MakeACopyModal';

import actions from 'actions';
import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import {
  openCopyDocumentModal,
  closeFileDestinationModal,
  copyDocumentModalSelectors,
  setSyncFileDestination,
  openCopyToDriveModal,
} from 'features/CopyDocumentModal/slice';
import useCheckPermission from 'features/DocumentUploadExternal/useCheckPermission';
import useRequestPermission from 'features/DocumentUploadExternal/useRequestPermission';
import { featureStoragePolicy } from 'features/FeatureConfigs';
import { StorageType } from 'features/FeatureConfigs/featureStoragePolicies';

import { documentStorage } from 'constants/documentConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';

const MakeACopyModalContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const isOpenFileDestinationModal = useSelector(copyDocumentModalSelectors.isOpenFileDestinationModal);
  const syncFileTo = useSelector(copyDocumentModalSelectors.syncFileTo);

  const requestPermission = useRequestPermission(syncFileTo);
  const checkPermission = useCheckPermission(syncFileTo as typeof featureStoragePolicy.externalStorages[number]);

  const checkSessionOfInternalStorage = async () => {
    const hasPermissionCallback = () => {
      dispatch(openCopyToDriveModal());
    };
    if (!checkPermission()) {
      await requestPermission(hasPermissionCallback, () => {
        enqueueSnackbar({
          message: t('viewer.header.failedToSyncYourDocument'),
          variant: 'error',
        });
      });
      return;
    }
    hasPermissionCallback();
  };

  const onCloseFileDestinationModal = () => {
    dispatch(closeFileDestinationModal());
  };

  const onSubmitFileDestination = async () => {
    onCloseFileDestinationModal();
    if (syncFileTo === STORAGE_TYPE.S3) {
      if (currentDocument.service === documentStorage.system) {
        dispatch(actions.setUploadDocVisible({
          visible: true,
          title: t('modalMakeACopy.copyDocuments'),
          submitTitle: t('action.copy'),
        }));
      } else {
        dispatch(openCopyDocumentModal(currentDocument));
      }
      return;
    }
    await checkSessionOfInternalStorage();
  };

  const onChangeSyncFileDestination = (destination: StorageType) => {
    dispatch(setSyncFileDestination(destination));
  };

  if (!isOpenFileDestinationModal) {
    return null;
  }

  return (
    <MakeACopyModal
      syncFileTo={syncFileTo}
      open={isOpenFileDestinationModal}
      handleClose={onCloseFileDestinationModal}
      onSubmitFileDestination={onSubmitFileDestination}
      changeSyncFileDestination={onChangeSyncFileDestination}
    />
  );
};

export default MakeACopyModalContainer;
