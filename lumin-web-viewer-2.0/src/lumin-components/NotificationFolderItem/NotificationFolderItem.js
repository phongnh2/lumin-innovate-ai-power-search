import React from 'react';
import PropTypes from 'prop-types';
import { NotiFolder } from 'constants/notificationConstant';
import DeleteOrgFolder from './components/DeleteOrgFolder';
import DeleteTeamFolder from './components/DeleteTeamFolder';
import CreateOrgFolder from './components/CreateOrgFolder';
import CreateTeamFolder from './components/CreateTeamFolder';

NotificationFolderItem.propTypes = {
  notification: PropTypes.object,
};

NotificationFolderItem.defaultProps = {
  notification: {},
};

function NotificationFolderItem({ notification }) {
  const { Organization: NotiOrgFolder } = NotiFolder.Notification;
  const maps = {
    [NotiOrgFolder.DELETE_ORG_FOLDER]: <DeleteOrgFolder notification={notification} />,
    [NotiOrgFolder.DELETE_TEAM_FOLDER]: <DeleteTeamFolder notification={notification} />,
    [NotiOrgFolder.CREATE_ORG_FOLDER]: <CreateOrgFolder notification={notification} />,
    [NotiOrgFolder.CREATE_TEAM_FOLDER]: <CreateTeamFolder notification={notification} />,
  };
  /**
   * must return null to fallback incorrect notification type
   */
  return maps[notification.actionType] || null;
}

export default NotificationFolderItem;
