import React from 'react';
import PropTypes from 'prop-types';
import { ENTITY } from 'constants/lumin-common';
import { avatar as avatarUtils } from 'utils';
import MaterialAvatar from 'luminComponents/MaterialAvatar';
import Icomoon from 'luminComponents/Icomoon';

import * as Styled from './SliderDocumentBadgeItem.styled';

const propTypes = {
  title: PropTypes.string.isRequired,
  // subtitle: PropTypes.string,
  avatarRemoteId: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(Object.values(ENTITY)),
};
const defaultProps = {
  onClick: () => {},
  // subtitle: '',
  active: false,
  type: null,
};

function SliderDocumentBadgeItem({
  title,
  // subtitle,
  avatarRemoteId,
  active,
  type,
  onClick,
}) {
  let defaultAvatar = null;
  switch (type) {
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
    <Styled.Button onClick={onClick} active={active}>
      <MaterialAvatar
        src={avatarUtils.getAvatar(avatarRemoteId)}
        size={28}
        secondary
        hasBorder
      >
        {defaultAvatar}
      </MaterialAvatar>
      <Styled.Title active={active}>{title}</Styled.Title>
    </Styled.Button>
  );
}

SliderDocumentBadgeItem.propTypes = propTypes;
SliderDocumentBadgeItem.defaultProps = defaultProps;

export default SliderDocumentBadgeItem;
