import dropboxServices from 'services/dropboxServices';
import googleServices from 'services/googleServices';
import { oneDriveServices } from 'services/oneDriveServices';

import { featureStoragePolicy } from 'features/FeatureConfigs';

import { STORAGE_TYPE } from 'constants/lumin-common';

export const PermissionCheckerMap = {
  [STORAGE_TYPE.GOOGLE]: () => googleServices.isSignedIn(),
  [STORAGE_TYPE.ONEDRIVE]: () => !!oneDriveServices.isSignedIn(),
  [STORAGE_TYPE.DROPBOX]: () => dropboxServices.isSignedIn(),
};

const useCheckPermission = (storageType: typeof featureStoragePolicy.externalStorages[number]): (() => boolean) =>
  PermissionCheckerMap[storageType];

export default useCheckPermission;
