import React from 'react';
import PropTypes from 'prop-types';
import { StyledWrapper, RoleWrapper, StyledDropDown } from './index.styled';

const propTypes = {
  member: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  popperShow: PropTypes.bool,
  selectedMember: PropTypes.object,
};
const defaultProps = {
  popperShow: false,
  selectedMember: {},
};

const TeamRole = ({
  member, currentUser, onClick, popperShow, selectedMember,
}) => {
  const isOwner = currentUser._id === member?.user?._id;
  return (
    <StyledWrapper onClick={(e) => !isOwner && onClick(e)}>
      <RoleWrapper
        className={`${isOwner ? 'owner' : member.role} ${
          popperShow && member?.user?._id === selectedMember?.user?._id
            ? 'selected'
            : ''
        }`}
      >
        {isOwner ? 'Owner' : member?.role}
      </RoleWrapper>
      {!isOwner && <StyledDropDown className="icon-dropdown" size={12} /> }
    </StyledWrapper>
  );
};

TeamRole.propTypes = propTypes;
TeamRole.defaultProps = defaultProps;

export default TeamRole;
