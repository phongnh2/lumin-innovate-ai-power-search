import { ListItem } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';
import MaterialAvatar from 'luminComponents/MaterialAvatar';

import avatarUtils from 'utils/avatar';

import { ENTITY } from 'constants/lumin-common';
import './DocumentOwnerBadge.scss';

function DocumentOwnerBadge({
  active,
  avatar,
  title,
  subtitle,
  onClick,
  avatarType,
}) {
  let defaultAvatar = null;
  switch (avatarType) {
    case ENTITY.TEAM:
      defaultAvatar = <Icomoon className="team" size={16} />;
      break;
    case ENTITY.ORGANIZATION:
      defaultAvatar = <Icomoon className="organization-default" size={16} />;
      break;
    default:
      break;
  }
  return (
    <ListItem
      className={classNames({
        DocumentOwnerBadge__container: true,
        'DocumentOwnerBadge__container--active': active,
      })}
      onClick={onClick}
      button
    >
      <MaterialAvatar
        src={avatarUtils.getAvatar(avatar)}
        size={28}
        secondary
        hasBorder
      >
        {defaultAvatar}
      </MaterialAvatar>
      <div className="DocumentOwnerBadge__body">
        {title && <span className="DocumentOwnerBadge__text DocumentOwnerBadge__title">{title}</span>}
        {subtitle && <span className="DocumentOwnerBadge__text DocumentOwnerBadge__subtitle">{subtitle}</span>}
      </div>
    </ListItem>
  );
}

DocumentOwnerBadge.propTypes = {
  active: PropTypes.bool,
  avatar: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  avatarType: PropTypes.oneOf(Object.values(ENTITY)),
  onClick: PropTypes.func,
};
DocumentOwnerBadge.defaultProps = {
  active: false,
  avatar: null,
  title: '',
  subtitle: '',
  avatarType: null,
  onClick: () => {},
};

export default DocumentOwnerBadge;
