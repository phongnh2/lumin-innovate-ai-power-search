import get from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

import DeclineInvitationModal from 'lumin-components/DeclineInvitationModal';

import { useTranslation } from 'hooks';

import { APP_USER_TYPE } from 'constants/lumin-common';

const propTypes = {
  notification: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
};

const InviteToJoin = ({ notification, open, onClose, currentUser }) => {
  const { t } = useTranslation();
  const { _id } = notification;
  const userType = get(notification, 'actor.actorData.type');
  const { email } = currentUser;
  const getInvitationId = () => {
    const { invitationId: idOfInvitation } = notification.target.targetData;
    if (idOfInvitation) {
      return idOfInvitation;
    }
    const { invitationList } = notification.target.targetData;
    return invitationList.find((invitation) => invitation.email === email)._id;
  };
  const { id: orgId } = notification.entity;
  const invitationId = getInvitationId();
  return (
    <>
      <span>
        <Trans i18nKey="notification.notificationInvite.inviteToJoin">
          <b className="bold">
            {{ actorName: userType === APP_USER_TYPE.SALE_ADMIN ? t('common.luminAdmin') : notification.actor.name }}
          </b>
          invited you to
          <b className="bold">{{ entityName: notification.entity.name }}</b>
        </Trans>
      </span>
      {open && (
        <DeclineInvitationModal onCancel={onClose} invitationId={invitationId} notificationId={_id} orgId={orgId} />
      )}
    </>
  );
};

InviteToJoin.propTypes = propTypes;

export default InviteToJoin;
