import { BUSINESS_FILE_PICKER_URL_SUFFIX, OneDrivePickerModes } from 'services/oneDriveServices';

import { oneDriveFilePickerOptions, oneDriveFolderPickerOptions } from '../config';

export default function ({
  isPersonalDrive,
  cid,
  baseUrl,
  mode = OneDrivePickerModes.FILES,
}: {
  isPersonalDrive: boolean;
  cid: string;
  baseUrl: string;
  mode?: OneDrivePickerModes;
}): string {
  const queryString = new URLSearchParams({
    filePicker: JSON.stringify(
      mode === OneDrivePickerModes.FOLDERS ? oneDriveFolderPickerOptions : oneDriveFilePickerOptions
    ),
    cid,
  });

  return isPersonalDrive
    ? `${baseUrl}?${queryString.toString()}`
    : `${baseUrl}/${BUSINESS_FILE_PICKER_URL_SUFFIX}?${queryString.toString()}`;
}
