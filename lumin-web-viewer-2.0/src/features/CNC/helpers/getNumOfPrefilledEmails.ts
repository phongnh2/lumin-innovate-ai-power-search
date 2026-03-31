import { IUserResult } from 'interfaces/user/user.interface';

import getPrioritizedUsers from '../CncComponents/InviteCollaborators/helper/getPrioritizedUsers';
import { CNC_LOCAL_STORAGE_KEY } from '../constants/customConstant';

const getNumOfPrefilledEmails = () => {
  const userCollaborators =
    (JSON.parse(localStorage.getItem(CNC_LOCAL_STORAGE_KEY.DRIVE_COLLABORATORS_NOT_IN_CIRCLE)) as IUserResult[]) || [];
  const prioritizedUserCollaborators = getPrioritizedUsers(userCollaborators);
  const { pathname } = window.location;
  const paths = pathname.split('/');
  const isInviteCollaboratorsPage = paths[1] === 'invite-collaborators';
  if (!isInviteCollaboratorsPage) {
    return undefined;
  }

  return prioritizedUserCollaborators.length;
};

export default getNumOfPrefilledEmails;
