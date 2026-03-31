import { get, isEmpty } from 'lodash';
import { isEmail } from 'validator';

import { googleServices, organizationServices } from 'services';
import { DriveFileInfo, GooglePermission } from 'services/types/googleServices.types';

import logger from 'helpers/logger';

import { eventTracking } from 'utils';

import { LOGGER } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

import { CNC_LOCAL_STORAGE_KEY, LIMIT_INVITE_USER_COLLABORATOR } from '../constants/customConstant';
import { CNCUserEvent } from '../constants/events/user';
import { getGoogleUsersNotInCircle } from '../services/organization';

interface IGetDriveCollaboratorsProps {
  fileInfo: DriveFileInfo;
  currentUser: IUser;
  currentDocument: IDocumentBase;
  orgId?: string;
  from?: string;
}

export const getDriveCollaborators = async ({
  fileInfo,
  currentUser,
  currentDocument,
  orgId,
  from = 'openPdf',
}: IGetDriveCollaboratorsProps): Promise<void> => {
  const targetId = get(currentDocument, 'documentReference.data._id', '') || orgId;
  const userRole = get(currentDocument, 'documentReference.data.userRole', '');
  const isOrgManager = from === 'openPdf' ? organizationServices.isManager(userRole) : true;

  const permissions = get(fileInfo, 'permissions', []) as GooglePermission[];
  const googleImplicitAccessToken = googleServices.getImplicitAccessToken();
  if (isEmpty(fileInfo) || !permissions.length || !targetId || !googleImplicitAccessToken?.email || !isOrgManager) {
    return;
  }
  eventTracking(CNCUserEvent.GET_SHARED_USER_FROM_GOOGLE, {
    numberSharedUsers: permissions.length,
  }).catch(() => {});
  const driveCollaborators = permissions
    .map((permission) => permission.emailAddress)
    .filter(Boolean)
    .filter((email: string) => isEmail(email));
  const indexOfCurrentEmail = driveCollaborators.indexOf(currentUser.email);
  driveCollaborators.splice(indexOfCurrentEmail, 1);
  if (!driveCollaborators.length) {
    return;
  }
  const shareEmails = driveCollaborators.slice(0, LIMIT_INVITE_USER_COLLABORATOR);
  if (driveCollaborators.length > LIMIT_INVITE_USER_COLLABORATOR) {
    logger.logInfo({
      message: LOGGER.EVENT.INVITE_COLLABORATOR_USER,
      attributes: {
        numberUser: driveCollaborators.length,
      },
    });
  }
  const driveCollaboratorsNotInCircle = await getGoogleUsersNotInCircle({
    googleAuthorizationEmail: googleImplicitAccessToken.email,
    orgId: targetId,
    shareEmails,
  });
  localStorage.setItem(
    CNC_LOCAL_STORAGE_KEY.DRIVE_COLLABORATORS_NOT_IN_CIRCLE,
    JSON.stringify(driveCollaboratorsNotInCircle)
  );
};
