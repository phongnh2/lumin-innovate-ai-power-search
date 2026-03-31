import { AnyAction } from 'redux';

import actions from 'actions';
import selectors from 'selectors';
import { store } from 'store';

import { oneDriveServices } from 'services/oneDriveServices';
import { type OneDriveSiteUserInfo, OneDriveFileRole } from 'services/oneDriveServices/oneDrive.interface';

import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';

export const checkOneDrivePermissions = async () => {
  const currentUser = selectors.getCurrentUser(store.getState());
  const currentDocument = selectors.getCurrentDocument(store.getState());
  if (!currentUser || !currentDocument) {
    return;
  }

  try {
    let canEditOneDriveFile = false;
    const oneDriveUser = await oneDriveServices.getMe();
    const filePermissions = await oneDriveServices.getFilePermissions({
      driveId: currentDocument.externalStorageAttributes.driveId,
      remoteId: currentDocument.remoteId,
    });
    const oneDriveUserEmail = oneDriveUser?.owner?.user?.email;
    const filePermissionsValue = filePermissions?.value || [];
    for (let i = 0; i < filePermissionsValue.length; i++) {
      const filePermission = filePermissionsValue[i];
      if (!Array.isArray(filePermission.roles)) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const isOwner = filePermission.roles.includes(OneDriveFileRole.Owner);
      const isEditable = filePermission.roles.includes(OneDriveFileRole.Write);
      const grantedToV2 = filePermission.grantedToV2 || ({} as OneDriveSiteUserInfo);
      if (isOwner && grantedToV2.siteUser?.email === oneDriveUserEmail) {
        canEditOneDriveFile = true;
        break;
      }

      const grantedToIdentitiesV2 = filePermission.grantedToIdentitiesV2 || [];
      if (isEditable && grantedToIdentitiesV2.some((identity) => identity?.siteUser?.email === oneDriveUserEmail)) {
        canEditOneDriveFile = true;
        break;
      }
    }

    if (canEditOneDriveFile) {
      store.dispatch(actions.setCanModifyDriveContent(true) as AnyAction);
    }
  } catch (error) {
    logger.logError({
      reason: LOGGER.Service.ONE_DRIVE_API_ERROR,
      error: error as Error,
      message: 'Error checking one drive permissions',
    });
  }
};
