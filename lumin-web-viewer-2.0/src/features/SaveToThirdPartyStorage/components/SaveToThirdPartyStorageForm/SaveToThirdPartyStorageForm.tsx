import { yupResolver } from '@hookform/resolvers/yup';
import React, { Fragment, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { OneDriveFilePickerProvider } from 'lumin-components/OneDriveFilePicker';

import useDocumentTools from 'hooks/useDocumentTools';

import Yup, { yupValidator } from 'utils/yup';

import { DocumentStorage } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';

import { GOOGLE_DRIVE_FOLDER } from '../../constant';
import { SaveToThirdPartyStorageContext } from '../../contexts/SaveToThirdPartyStorageContext';
import { FolderPropertiesType, FormValuesType } from '../../type';

type Props = {
  action: string;
  currentDocumentName: string;
  children: React.ReactNode;
  onConfirm: (documentName: string, folderProperties?: FolderPropertiesType) => Promise<void>;
  destinationStorage: string;
  downloadType: string;
};

const validationSchema = Yup.object().shape({ documentName: yupValidator().storageNameValidate });

const SaveToThirdPartyStorageForm = ({
  action,
  children,
  currentDocumentName,
  destinationStorage,
  downloadType,
  onConfirm,
}: Props) => {
  const [folderProperties, setFolderProperties] = useState<FolderPropertiesType>({
    id: '',
    location: GOOGLE_DRIVE_FOLDER.MINE,
    icon: 'md_folder_solid',
    webUrl: '',
  });

  const { handleDocStack } = useDocumentTools();
  const dispatch = useDispatch();

  const { handleSubmit, formState, clearErrors, control } = useForm<FormValuesType>({
    reValidateMode: 'onChange',
    mode: 'onChange',
    defaultValues: {
      documentName: currentDocumentName,
    },
    resolver: yupResolver(validationSchema),
  });
  const { isSubmitting, errors } = formState;

  const onCreate = async ({ documentName }: { documentName: string }) => {
    await handleDocStack({
      callback: () => {
        onConfirm(documentName, folderProperties).catch(() => {});
      },
      action: UserEventConstants.Events.HeaderButtonsEvent.DOWNLOAD,
    })().catch(() => {});
    dispatch(actions.setShouldShowInviteCollaboratorsModal(true));
  };

  const contextValue = useMemo(
    () => ({
      action,
      clearErrors,
      control,
      currentDocumentName,
      destinationStorage,
      downloadType,
      errors,
      folderProperties,
      isSubmitting,
      formState,
      setFolderProperties,
    }),
    [
      action,
      clearErrors,
      control,
      currentDocumentName,
      destinationStorage,
      downloadType,
      errors,
      folderProperties,
      isSubmitting,
      formState,
    ]
  );

  const OneDrivePickerProvider = destinationStorage === DocumentStorage.ONEDRIVE ? OneDriveFilePickerProvider : Fragment;

  return (
    <form onSubmit={handleSubmit(onCreate)}>
      <OneDrivePickerProvider>
        <SaveToThirdPartyStorageContext.Provider value={contextValue}>{children}</SaveToThirdPartyStorageContext.Provider>
      </OneDrivePickerProvider>
    </form>
  );
};

export default SaveToThirdPartyStorageForm;
