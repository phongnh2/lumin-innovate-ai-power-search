import classNames from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

import { APP_USER_TYPE } from 'constants/lumin-common';

import { INotificationBase } from 'interfaces/notification/notification.interface';
import { IUser } from 'interfaces/user/user.interface';

type Props = {
  notification: INotificationBase;
  currentUser: IUser;
};

const AddMemberToOrgSameUnpopularDomain = ({ notification, currentUser }: Props) => {
  const { t } = useTranslation();

  const userType = get(notification, 'actor.actorData.type');
  const targetId = get(notification, 'target.targetId');
  const isCurrentUser = targetId === currentUser._id;

  return (
    <span>
      <Trans
        i18nKey="notification.notificationOrgItem.addMemberToOrgSamePopularDomain"
        components={{
          b: <span className="bold" />,
          boldToggle: <span className={classNames({ bold: !isCurrentUser })} />,
        }}
        values={{
          actorName: userType === APP_USER_TYPE.SALE_ADMIN ? 'Lumin Admin' : notification.actor.name,
          targetName: isCurrentUser ? t('common.you').toLowerCase() : get(notification, 'target.targetName'),
          entityName: notification.entity.name,
        }}
      />
    </span>
  );
};

AddMemberToOrgSameUnpopularDomain.propTypes = {
  notification: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
};

export default AddMemberToOrgSameUnpopularDomain;
