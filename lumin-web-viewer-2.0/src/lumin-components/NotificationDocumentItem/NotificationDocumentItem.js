import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

import { commonUtils } from 'utils';

import { NotiDocument, NotiDocumentRoleActions } from 'constants/notificationConstant';

NotificationDocumentItem.propTypes = {
  notification: PropTypes.object,
};

NotificationDocumentItem.defaultProps = {
  notification: {},
};

function NotificationDocumentItem(props) {
  const { t } = useTranslation();
  const { notification } = props;
  const isAnyPropertyError = !notification || !notification?.actor || !notification?.entity || !notification?.target;

  if (isAnyPropertyError) {
    return null;
  }
  const { entityData } = notification.entity;
  switch (notification.actionType) {
    case NotiDocument.SHARE: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationDocItem.share">
            <span className="bold">{{ actorName: notification.actor.name }}</span> shared
            <span className="bold">{{ entityName: notification.entity.name }}</span> with you.
          </Trans>
        </span>
      );
    }

    case NotiDocument.UPLOADED_IN_TEAM: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationDocItem.uploadedInTeam">
            <span className="bold">{{ actorName: notification.actor.name }}</span> uploaded
            <span className="bold">{{ entityName: notification.entity.name }}</span> to
            <span className="bold">{{ targetName: notification.target.targetName }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiDocument.DELETE: {
      return (
        <span>
          <Trans
            shouldUnescape
            i18nKey="notification.notificationDocItem.delete"
            components={{ b: <span className="bold" /> }}
            values={{ actorName: notification.actor.name, entityName: notification.entity.name }}
          />
        </span>
      );
    }

    case NotiDocument.REQUEST_TO_ACCESS: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationDocItem.requestToAccess">
            <span className="bold">{{ actorName: notification.actor.name }}</span> requested to access
            <span className="bold">{{ entityName: notification.entity.name }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiDocument.REQUEST_ACCEPTED: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationDocItem.requestAccepted">
            Your request for
            <span className="bold">
              {{
                role: commonUtils.formatTitleCaseByLocale(
                  t(`permission.${notification.target.targetData?.role.toLowerCase()}`)
                ),
              }}
            </span>
            on <span className="bold">{{ entityName: notification.entity.name }}</span> was approved.
          </Trans>
        </span>
      );
    }

    case NotiDocument.UPLOAD_ORGANIZATION_DOCUMENT: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationDocItem.uploadOrganizationDocument">
            <span className="bold">{{ actorName: notification.actor.name }}</span> uploaded
            <span className="bold">{{ entityName: notification.entity.name }}</span>
            {{ text: notification.entity.entityData?.multipleDocument ? 'document(s)' : '' }} to
            <span className="bold">{{ targetName: notification.target.targetName }}</span>
          </Trans>
        </span>
      );
    }

    case NotiDocument.UPLOAD_ORG_TEAM_DOCUMENT: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationDocItem.uploadOrgTeamDocument">
            <span className="bold">{{ actorName: notification.actor.name }}</span> uploaded
            <span className="bold">{{ entityName: notification.entity.name }}</span> to
            <span className="bold">{{ targetName: notification.target.targetName }}</span>
          </Trans>
        </span>
      );
    }

    case NotiDocument.UPDATE_USER_PERMISSION: {
      if (entityData) {
        return (
          <span>
            <Trans shouldUnescape i18nKey="notification.notificationDocItem.updateUserPermissionHasEntityData">
              <span className="bold">{{ actorName: notification.actor.name }}</span> updated your permission to
              <span className="bold">
                {{
                  role: commonUtils.formatTitleCaseByLocale(
                    t(`permission.${NotiDocumentRoleActions[entityData.role?.toLowerCase()].toLowerCase()}`)
                  ),
                }}
              </span>
              in
              <span className="bold">{{ entityName: notification.entity.name }}</span>.
            </Trans>
          </span>
        );
      }

      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationDocItem.updateUserPermission">
            <span className="bold">{{ actorName: notification.actor.name }}</span> updated your permission in
            <span className="bold">{{ entityName: notification.entity.name }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiDocument.UPDATE_ANNOT_OF_ANOTHER: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationDocItem.updateAnnotOfAnother">
            <span className="bold">{{ actorName: notification.actor.name }}</span> updated your annotations on
            <span className="bold">{{ entityName: notification.entity.name }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiDocument.REMOVE_SHARED_USER: {
      return (
        <span>
          <Trans
            shouldUnescape
            i18nKey="notification.notificationDocItem.removeSharedUser"
            components={{ b: <span className="bold" /> }}
            values={{ entityName: notification.entity.name }}
          />
        </span>
      );
    }

    case NotiDocument.RESTORE_ORIGINAL_VERSION: {
      return (
        <span>
          <Trans shouldUnescape i18nKey="notification.notificationDocItem.restoreOriginalVersion">
            <span className="bold">{{ actorName: notification.actor.name }}</span> restored the original version of the
            document
            <span className="bold">{{ entityName: notification.entity.name }}</span>.
          </Trans>
        </span>
      );
    }

    case NotiDocument.RESTORE_DOCUMENT_VERSION: {
      return (
        <span>
          <Trans
            i18nKey="notification.notificationDocItem.restoreDocumentVersion"
            components={{ b: <span className="bold" /> }}
            values={{ actorName: notification.actor.name, entityName: notification.entity.name }}
          />
        </span>
      );
    }

    default:
      return null;
  }
}

export default NotificationDocumentItem;
