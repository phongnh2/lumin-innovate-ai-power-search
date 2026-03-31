import { Dispatch, SetStateAction } from 'react';
import type { Control, FieldErrors, UseFormClearErrors, FormState } from 'react-hook-form';

export type FormValuesType = {
  documentName?: string;
};

export type FolderPropertiesType = {
  id: string;
  location: string;
  icon: string;
  webUrl: string;
  driveId?: string;
  isShared?: boolean;
};

export type SaveToThirdPartyStorageContextPayload = {
  action: string;
  clearErrors: UseFormClearErrors<FormValuesType>;
  control: Control<FormValuesType>;
  currentDocumentName: string;
  destinationStorage: string;
  downloadType: string;
  errors: FieldErrors<FormValuesType>;
  folderProperties: FolderPropertiesType;
  isSubmitting: boolean;
  setFolderProperties: Dispatch<SetStateAction<FolderPropertiesType>>;
  formState: FormState<FormValuesType>;
};
