import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import { useTranslation } from 'hooks/useTranslation';

import { organizationServices } from 'services';

import stringUtils from 'utils/string';

import { BULK_UPDATE_LIST_TITLE, DOCUMENT_TYPE } from 'constants/documentConstants';
import { DOCUMENT_ROLES } from 'constants/lumin-common';
import { ORGANIZATION_ROLES, ORG_TEAM_ROLE } from 'constants/organizationConstants';

const getBulkUpdateList = (t) => ({
  [BULK_UPDATE_LIST_TITLE.MEMBER_LIST]: {
    value: BULK_UPDATE_LIST_TITLE.MEMBER_LIST,
    text: t('modalShare.memberList'),
  },
  [BULK_UPDATE_LIST_TITLE.INVITED_LIST]: {
    value: BULK_UPDATE_LIST_TITLE.INVITED_LIST,
    text: t('modalShare.peopleInvitedList'),
  },
});

const getBulkUpdateListByAdmin = (t) => ({
  list: Object.values(getBulkUpdateList(t)),
  defaultValue: null,
  canBulkUpdate: true,
});

const getBulkUpdateInvitedList = (t) => ({
  list: [getBulkUpdateList(t)[BULK_UPDATE_LIST_TITLE.INVITED_LIST]],
  defaultValue: null,
  canBulkUpdate: true,
});

const canBulkUpdateInvitedList = ({
  isOwner,
  documentPermission,
}) => {
  const hasCanSharePerm = stringUtils.isIgnoreCaseEqual(documentPermission, DOCUMENT_ROLES.SHARER);
  return {
    organization: (role) =>
      (stringUtils.isIgnoreCaseEqual(role, ORGANIZATION_ROLES.MEMBER) && hasCanSharePerm) || isOwner,
    team: (role) => (stringUtils.isIgnoreCaseEqual(role, ORG_TEAM_ROLE.MEMBER) && hasCanSharePerm) || isOwner,
  };
};

const useBulkSharingPermission = ({ currentDocument, currentOrgRole }) => {
  const { t } = useTranslation();
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);

  const isOwner = currentUser._id === currentDocument.ownerId;

  const { roleOfDocument, documentType } = currentDocument;

  return useMemo(() => {
    switch (documentType) {
      case DOCUMENT_TYPE.PERSONAL: {
        if (!isOwner) {
          return {
            canBulkUpdate: false,
          };
        }
        return getBulkUpdateInvitedList(t);
      }
      case DOCUMENT_TYPE.ORGANIZATION: {
        if (!currentOrgRole) {
          return {
            canBulkUpdate: false,
          };
        }
        if (organizationServices.isManager(currentOrgRole)) {
          return getBulkUpdateListByAdmin(t);
        }
        if (canBulkUpdateInvitedList({
          isOwner,
          documentPermission: roleOfDocument,
        }).organization(currentOrgRole)) {
          return getBulkUpdateInvitedList(t);
        }
        return {
          canBulkUpdate: false,
        };
      }
      case DOCUMENT_TYPE.ORGANIZATION_TEAM: {
        if (stringUtils.isIgnoreCaseEqual(currentOrgRole, ORGANIZATION_ROLES.TEAM_ADMIN)) {
          return getBulkUpdateListByAdmin(t);
        }
        if (canBulkUpdateInvitedList({
          isOwner,
          documentPermission: roleOfDocument,
        }).team(currentOrgRole)) {
          return getBulkUpdateInvitedList(t);
        }
        return {
          canBulkUpdate: false,
        };
      }
      default:
        throw new Error('Document type is not valid');
    }
  }, [
    isOwner,
    documentType,
    roleOfDocument,
    currentOrgRole,
  ]);
};

export { useBulkSharingPermission };
