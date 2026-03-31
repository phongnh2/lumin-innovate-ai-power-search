import get from 'lodash/get';

import { SHARE_LINK_TYPE } from 'constants/documentConstants';
import { DOCUMENT_ROLES } from 'constants/lumin-common';

const mapRoles = {
  [DOCUMENT_ROLES.SPECTATOR]: 0,
  [DOCUMENT_ROLES.VIEWER]: 1,
  [DOCUMENT_ROLES.EDITOR]: 2,
  [DOCUMENT_ROLES.SHARER]: 3,
  [DOCUMENT_ROLES.OWNER]: 4,
};

export default (currentDocument) => {
  const roleOfDocument = get(currentDocument, 'roleOfDocument', DOCUMENT_ROLES.SPECTATOR).toUpperCase();
  const isShareWithAnyone = get(currentDocument, 'shareSetting.linkType', SHARE_LINK_TYPE.INVITED) === SHARE_LINK_TYPE.ANYONE;
  if (!isShareWithAnyone) {
    return roleOfDocument;
  }
  const shareSettingRole =get(currentDocument, 'shareSetting.permission', DOCUMENT_ROLES.SPECTATOR).toUpperCase();

  return mapRoles[roleOfDocument] > mapRoles[shareSettingRole] ? roleOfDocument : shareSettingRole;
};
