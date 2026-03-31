import { TextInput } from 'lumin-ui/kiwi-ui';
import React, { useRef, useContext } from 'react';
import { Controller } from 'react-hook-form';
import { Trans } from 'react-i18next';

import GoogleFolderPicker from 'luminComponents/GoogleFolderPicker/GoogleFolderPicker';
import { DocumentObjects, FolderPickerRefType, ResponseObject } from 'luminComponents/GoogleFolderPicker/type';
import { OneDriveFilePickerContext } from 'luminComponents/OneDriveFilePicker/context';
import { useOneDriveMessageHandler } from 'luminComponents/OneDriveFilePicker/hooks';

import { useTranslation } from 'hooks';

import { OneDrivePickerModes } from 'services/oneDriveServices';

import { getErrorMessageTranslated } from 'utils';

import { DocumentStorage } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';

import { useSaveToThirdPartyStorageContext } from '../../hooks/useSaveToThirdPartyStorageContext';
import SaveToDriveFolderLocation from '../SelectFolderLocation';

import styles from './SaveToThirdPartyStorageFormContent.module.scss';

type OneDriveDocumentObject = {
  webUrl?: string;
};

const SaveToThirdPartyStorageFormContent = () => {
  const folderPickerRef = useRef<FolderPickerRefType>(null);

  const { t } = useTranslation();

  const {
    action,
    clearErrors,
    control,
    currentDocumentName,
    destinationStorage,
    downloadType,
    errors,
    isSubmitting,
    setFolderProperties,
  } = useSaveToThirdPartyStorageContext();
  const isDownloadDoc = action === UserEventConstants.Events.HeaderButtonsEvent.DOWNLOAD;

  const errorMsg = getErrorMessageTranslated(errors?.documentName?.message);
  const placeholder = t('modalMakeACopy.chooseCopyName');

  const selectedDriveFolder = ({ id, name, isShared = false, webUrl }: DocumentObjects & OneDriveDocumentObject) => {
    clearErrors();
    setFolderProperties((preProfile) => ({
      ...preProfile,
      id,
      location: name,
      icon: isShared ? 'icon-shared-drive' : 'md_folder_solid',
      webUrl,
    }));
  };

  const { openPickerIframe, closePickerIframe, iframeRef } = useContext(OneDriveFilePickerContext);

  const { openFilePicker } = useOneDriveMessageHandler({
    iframeRef,
    openPickerIframe,
    closePickerIframe,
    onClose: closePickerIframe,
    onPicked: (folders, onClear) => {
      if (!folders) {
        return Promise.resolve();
      }
      selectedDriveFolder({ name: folders[0].name, id: folders[0].id, webUrl: folders[0].webUrl });
      onClear();
      return Promise.resolve();
    },
    mode: OneDrivePickerModes.FOLDERS,
  });

  const openGoogleFolderPicker = () => {
    if (destinationStorage === DocumentStorage.GOOGLE) {
      folderPickerRef.current.openPicker();
    }
    if (destinationStorage === DocumentStorage.ONEDRIVE) {
      openFilePicker();
    }
  };

  return (
    <>
      <GoogleFolderPicker
        ref={folderPickerRef}
        selectedFolder={(data: ResponseObject) => selectedDriveFolder(data.docs[0])}
      />
      <div className={styles.description}>
        <Trans
          i18nKey={
            isDownloadDoc ? 'viewer.downloadModal.beingDownloadDocumentTo' : 'modalMakeACopy.beingCopyDocumentTo'
          }
          values={{ documentName: currentDocumentName, destinationStorage, downloadType }}
          components={{ b: <b className={styles.documentName} /> }}
        />
      </div>

      <div>
        <div className={styles.fieldLabel}>{t('common.name')}</div>
        <div>
          <Controller
            control={control}
            name="documentName"
            defaultValue={currentDocumentName}
            render={({ field }) => (
              <TextInput
                {...field}
                placeholder={placeholder}
                error={errorMsg}
                clearable={false}
                disabled={isSubmitting}
                autoComplete="off"
              />
            )}
          />
        </div>
      </div>

      {[DocumentStorage.GOOGLE, DocumentStorage.ONEDRIVE].includes(destinationStorage) && (
        <SaveToDriveFolderLocation openGoogleFolderPicker={openGoogleFolderPicker} />
      )}
    </>
  );
};

export default SaveToThirdPartyStorageFormContent;
