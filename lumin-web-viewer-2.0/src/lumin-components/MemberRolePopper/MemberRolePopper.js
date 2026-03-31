import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';
import MaterialPopper from 'luminComponents/MaterialPopper';

import './MemberRolePopper.scss';

const defaultProps = {
  open: false,
  anchorEl: null,
  handleClose: () => {},
  currentRole: '',
  onSelected: () => {},
  isOwner: false,
};

const propTypes = {
  open: PropTypes.bool,
  anchorEl: PropTypes.object,
  handleClose: PropTypes.func,
  currentRole: PropTypes.string,
  onSelected: PropTypes.func,
  isOwner: PropTypes.bool,
};

function MemberRolePopper(props) {
  const {
    open,
    anchorEl,
    handleClose,
    currentRole,
    onSelected,
    isOwner,
  } = props;
  const roles = isOwner ? ['admin', 'moderator', 'member'] : ['moderator', 'member'];

  return (
    <MaterialPopper
      open={open}
      anchorEl={anchorEl}
      handleClose={handleClose}
      placement="bottom-end"
      classes="MemberRolePopper"
      parentOverflow="viewport"
    >
      <MenuList>
        {roles.map((role) => (currentRole === role ? null : (
          <MenuItem
            className="MemberRolePopper__item"
            key={role}
            onClick={() => onSelected(role)}
          >
            <Icomoon className={`${role} icon__16`} />
            Make {role}
          </MenuItem>
        )))}
        <MenuItem
          className="MemberRolePopper__item"
          id="remove-member"
          key="remove"
          onClick={() => onSelected('remove')}
        >
          <span>
            <Icomoon className="trash icon__16" />
            Remove member
          </span>
        </MenuItem>
      </MenuList>
    </MaterialPopper>
  );
}

MemberRolePopper.propTypes = propTypes;
MemberRolePopper.defaultProps = defaultProps;

export default MemberRolePopper;
