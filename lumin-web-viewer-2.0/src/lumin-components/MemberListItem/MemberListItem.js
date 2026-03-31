/* eslint-disable jsx-a11y/no-static-element-interactions */
import Grid from '@mui/material/Grid';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import MaterialAvatar from 'luminComponents/MaterialAvatar';

import { avatar } from 'utils';
import './MemberListItem.scss';

const propTypes = {
  member: PropTypes.object,
  rightElement: PropTypes.node,
  containerStyle: PropTypes.object,
  active: PropTypes.bool,
  hover: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  moreRightElement: PropTypes.bool,
  noGutter: PropTypes.bool,
};

const defaultProps = {
  member: {},
  rightElement: null,
  containerStyle: {},
  hover: false,
  active: false,
  disabled: false,
  onClick: () => { },
  moreRightElement: false,
  noGutter: false,
};

const MemberListItem = ({
  member, rightElement, moreRightElement, containerStyle, hover, active, disabled, onClick, noGutter,
}) => {
  const leftSpacing = () => {
    if (rightElement) {
      return moreRightElement ? 7 : 8;
    }
    return 12;
  };

  return (
    <div
      key={member.user.email}
      onClick={onClick}
      className={classnames('MemberListItem', {
        hover,
        active,
        disabled,
        'MemberListItem--no-gutter': noGutter,
      })}
      style={containerStyle}
    >
      <Grid container alignItems="center">
        <Grid item xs={leftSpacing()}>
          <div className="MemberListItem__row">
            <MaterialAvatar
              size={32}
              src={avatar.getAvatar(member.user.avatarRemoteId)}
            >{avatar.getTextAvatar(member.user.name)}
            </MaterialAvatar>
            <div className="MemberListItem__row__text ellipsis">
              <p className="MemberListItem__text">
                {member.user.name}
              </p>
              <p className="MemberListItem__text MemberListItem__text--secondary">
                {member.user.email}
              </p>
              <input className="input-add-member" />
            </div>
          </div>
        </Grid>
        {rightElement && (
          <Grid item xs={moreRightElement ? 5 : 4}>
            {rightElement}
          </Grid>
        )}
      </Grid>
    </div>
  );
};

MemberListItem.propTypes = propTypes;
MemberListItem.defaultProps = defaultProps;

export default MemberListItem;
