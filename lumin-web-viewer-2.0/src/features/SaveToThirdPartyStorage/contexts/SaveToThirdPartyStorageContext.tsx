import { createContext } from 'react';
import type { Control, FormState } from 'react-hook-form';

import { FolderPropertiesType, FormValuesType, SaveToThirdPartyStorageContextPayload } from '../type';

export const SaveToThirdPartyStorageContext = createContext<SaveToThirdPartyStorageContextPayload>({
  action: '',
  clearErrors: () => {},
  control: {} as Control<FormValuesType>,
  currentDocumentName: '',
  destinationStorage: '',
  downloadType: '',
  errors: {},
  folderProperties: {} as FolderPropertiesType,
  isSubmitting: false,
  setFolderProperties: () => {},
  formState: {} as FormState<FormValuesType>,
});
